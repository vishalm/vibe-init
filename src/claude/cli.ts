import { spawn } from 'node:child_process';
import { ClaudeCliError } from '../utils/errors.js';
import { checkClaudeCli } from '../utils/env.js';

export interface ClaudeCliOptions {
  /** Maximum time to wait in ms (default: 120000) */
  timeout?: number;
  /** Pass --verbose to Claude CLI */
  verbose?: boolean;
}

/**
 * Build a clean env that strips Claude Code session markers.
 * This allows vibe-init to spawn Claude CLI as a child process
 * even when vibe-init itself is running inside a Claude Code session.
 */
function cleanEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  // Remove markers that prevent nested Claude Code launches
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_SESSION;
  delete env.CLAUDE_CODE_ENTRYPOINT;
  return env;
}

/**
 * Calls Claude CLI with --print flag and returns the full text response.
 * Pipes the prompt via stdin for reliable handling of long prompts.
 */
export async function callClaudeCli(
  prompt: string,
  options: ClaudeCliOptions = {}
): Promise<string> {
  const { timeout = 120_000 } = options;
  const claudePath = checkClaudeCli();

  return new Promise<string>((resolve, reject) => {
    const args = ['--print', '--output-format', 'text', '--max-turns', '1'];
    const child = spawn(claudePath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
      env: cleanEnv(),
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      reject(
        new ClaudeCliError(
          `Failed to spawn Claude CLI: ${err.message}`,
          `Path: ${claudePath}`
        )
      );
    });

    child.on('close', (code, signal) => {
      if (code !== 0) {
        const isTimeout = code === 143 || signal === 'SIGTERM';
        const message = isTimeout
          ? `Claude CLI timed out after ${Math.round(timeout / 1000)}s. Try setting ANTHROPIC_API_KEY for faster generation, or retry.`
          : `Claude CLI exited with code ${code}`;
        reject(
          new ClaudeCliError(
            message,
            `stderr: ${stderr}\nstdout (first 500): ${stdout.slice(0, 500)}`
          )
        );
        return;
      }
      resolve(stdout.trim());
    });

    // Pipe prompt via stdin (supports long prompts without arg length limits)
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

/**
 * Calls Claude CLI with streaming output — returns chunks as they arrive.
 * Uses `claude -p --output-format stream-json` for real-time streaming.
 */
export async function streamClaudeCli(
  prompt: string,
  onChunk: (text: string) => void,
  options: ClaudeCliOptions = {}
): Promise<string> {
  const { timeout = 180_000 } = options;
  const claudePath = checkClaudeCli();

  return new Promise<string>((resolve, reject) => {
    const args = ['--print', '--output-format', 'stream-json'];
    const child = spawn(claudePath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
      env: cleanEnv(),
    });

    let fullResponse = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === 'assistant' && event.message) {
            for (const block of event.message.content || []) {
              if (block.type === 'text') {
                onChunk(block.text);
                fullResponse += block.text;
              }
            }
          } else if (event.type === 'content_block_delta') {
            if (event.delta?.text) {
              onChunk(event.delta.text);
              fullResponse += event.delta.text;
            }
          } else if (event.type === 'result') {
            if (event.result) {
              fullResponse = event.result;
            }
          }
        } catch {
          onChunk(line);
          fullResponse += line;
        }
      }
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      reject(
        new ClaudeCliError(
          `Failed to spawn Claude CLI: ${err.message}`,
          `Path: ${claudePath}`
        )
      );
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new ClaudeCliError(
            `Claude CLI exited with code ${code}`,
            `stderr: ${stderr}`
          )
        );
        return;
      }
      resolve(fullResponse.trim());
    });

    // Pipe prompt via stdin
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

/**
 * Spawns an interactive Claude CLI session — hands control to the user's terminal.
 * Used by `vibe run` to let users interact with Claude directly.
 */
export function spawnInteractiveClaude(
  systemPrompt: string,
  userPrompt?: string
): Promise<number> {
  const claudePath = checkClaudeCli();

  return new Promise<number>((resolve, reject) => {
    const args: string[] = [];
    if (systemPrompt) {
      args.push('--system-prompt', systemPrompt);
    }
    if (userPrompt) {
      args.push('--print', userPrompt);
    }

    const child = spawn(claudePath, args, {
      stdio: 'inherit',
      env: cleanEnv(),
    });

    child.on('error', (err) => {
      reject(
        new ClaudeCliError(`Failed to spawn interactive Claude: ${err.message}`)
      );
    });

    child.on('close', (code) => {
      resolve(code ?? 0);
    });
  });
}
