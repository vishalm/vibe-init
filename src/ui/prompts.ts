import { input, select } from '@inquirer/prompts';
import { theme } from './theme.js';
import type { EnrichmentBrief } from '../types/enrichment.js';

export async function promptIdea(): Promise<string> {
  console.log(
    theme.brand('\nTell me your idea. Even one line. Even broken English.')
  );
  console.log(theme.dim("I'll turn it into a full engineering universe.\n"));

  const idea = await input({
    message: theme.brand('>'),
    validate: (value) => {
      if (value.trim().length < 5) {
        return 'Give me at least a sentence to work with!';
      }
      return true;
    },
  });

  return idea.trim();
}

export async function promptProjectName(suggestedName: string): Promise<string> {
  const name = await input({
    message: 'Project name',
    default: suggestedName,
    validate: (value) => {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/.test(value.trim())) {
        return 'Project name must start with a letter/number and contain only letters, numbers, spaces, hyphens, or underscores';
      }
      return true;
    },
  });

  return name.trim();
}

export type EnrichmentAction = 'yes' | 'edit' | 'restart';

export async function promptEnrichmentConfirmation(): Promise<EnrichmentAction> {
  const action = await select<EnrichmentAction>({
    message: 'Does this match your vision?',
    choices: [
      {
        name: `${theme.success('[Y]')} Hell yes, build it`,
        value: 'yes',
      },
      {
        name: `${theme.warning('[E]')} Adjust some things`,
        value: 'edit',
      },
      {
        name: `${theme.error('[R]')} Start over`,
        value: 'restart',
      },
    ],
  });

  return action;
}

export async function promptEditFeedback(): Promise<string> {
  const feedback = await input({
    message: 'What would you like to adjust?',
    validate: (value) => {
      if (value.trim().length < 3) {
        return 'Tell me what to change';
      }
      return true;
    },
  });

  return feedback.trim();
}

export async function promptText(
  message: string,
  options: { defaultValue?: string } = {}
): Promise<string> {
  const value = await input({
    message,
    default: options.defaultValue,
    validate: (v) => (v.trim().length > 0 ? true : 'Please enter a value'),
  });
  return value.trim();
}

export async function promptSelect<T extends string>(
  message: string,
  choices: { name: string; value: T }[]
): Promise<T> {
  return select<T>({ message, choices });
}

export function displayEnrichmentBrief(brief: EnrichmentBrief): void {
  console.log('\n' + theme.brand('═══════════════════════════════════════'));
  console.log(theme.brand('🧠 ENRICHMENT COMPLETE'));
  console.log(theme.brand('═══════════════════════════════════════\n'));

  console.log(theme.label('📌 Vision: ') + theme.value(brief.vision));
  console.log(
    theme.label('\n🎯 Problem: ') + theme.value(brief.problemStatement)
  );

  console.log(theme.label('\n👥 Personas:'));
  for (const persona of brief.personas) {
    console.log(theme.bold(`  • ${persona.name}`) + theme.dim(` — ${persona.role}`));
    for (const pain of persona.painPoints) {
      console.log(theme.muted(`    Pain: ${pain}`));
    }
  }

  console.log(theme.label('\n🚀 Features (MVP):'));
  console.log(theme.success('  P0 (Must Have):'));
  for (const f of brief.features.p0) {
    console.log(`    ✅ ${theme.bold(f.name)} — ${theme.dim(f.description)}`);
  }
  if (brief.features.p1.length > 0) {
    console.log(theme.warning('  P1 (Should Have):'));
    for (const f of brief.features.p1) {
      console.log(`    🟡 ${theme.bold(f.name)} — ${theme.dim(f.description)}`);
    }
  }
  if (brief.features.p2.length > 0) {
    console.log(theme.info('  P2 (Nice to Have):'));
    for (const f of brief.features.p2) {
      console.log(`    🔵 ${theme.bold(f.name)} — ${theme.dim(f.description)}`);
    }
  }

  console.log(theme.label('\n🏗️  Architecture: ') + theme.value(brief.architecturePattern));

  console.log(theme.label('\n🔧 Tech Stack:'));
  const stack = brief.techStack;
  console.log(`  Frontend:   ${stack.frontend}`);
  console.log(`  Backend:    ${stack.backend}`);
  console.log(`  Database:   ${stack.database}`);
  console.log(`  Cache:      ${stack.cache}`);
  console.log(`  Auth:       ${stack.auth}`);
  console.log(`  Testing:    ${stack.testing}`);
  console.log(`  Deploy:     ${stack.deployment}`);

  console.log(theme.label('\n💰 Monetization: ') + theme.value(brief.monetizationHypothesis));
  console.log(theme.label('🎯 Go-to-Market: ') + theme.value(brief.goToMarketSignal));

  console.log('\n' + theme.brand('═══════════════════════════════════════\n'));
}
