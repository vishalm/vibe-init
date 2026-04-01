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
 * Calls Claude CLI with --print flag and returns the full text response.
 * Uses `claude -p` for single-shot prompt → response.
 */
export async function callClaudeCli(
  prompt: string,
  options: ClaudeCliOptions = {}
): Promise<string> {
  const { timeout = 120_000 } = options;
  const claudePath = checkClaudeCli();

  return new Promise<string>((resolve, reject) => {
    const args = ['--print', '--output-format', 'text'];
    const child = spawn(claudePath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout,
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

    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new ClaudeCliError(
            `Claude CLI exited with code ${code}`,
            `stderr: ${stderr}\nstdout (first 500): ${stdout.slice(0, 500)}`
          )
        );
        return;
      }
      resolve(stdout.trim());
    });

    // Send the prompt via stdin
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
    });

    let fullResponse = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === 'assistant' && event.message) {
            // Handle text content blocks
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
            // Final result event
            if (event.result) {
              fullResponse = event.result;
            }
          }
        } catch {
          // Not JSON or unexpected format — accumulate as raw text
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
      stdio: 'inherit', // Attach to user's terminal
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
