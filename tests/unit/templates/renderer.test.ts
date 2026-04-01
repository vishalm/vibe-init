import { describe, it, expect } from 'vitest';
import { renderTemplates, getStackTemplatesDir } from '../../../src/templates/renderer.js';
import { getStack, getStackManifest } from '../../../src/templates/registry.js';
import type { TemplateContext } from '../../../src/types/template.js';

const MOCK_CONTEXT: TemplateContext = {
  projectName: 'Test Project',
  projectSlug: 'test-project',
  brief: {
    vision: 'A test project for unit testing',
    problemStatement: 'Developers need a way to test template rendering',
    personas: [
      {
        name: 'Test Dev',
        role: 'Developer',
        painPoints: ['Manual testing is slow'],
        goals: ['Automate testing'],
      },
    ],
    features: {
      p0: [
        { name: 'Core feature', description: 'The main feature' },
        { name: 'Auth', description: 'User authentication' },
      ],
      p1: [{ name: 'Dashboard', description: 'Analytics dashboard' }],
      p2: [],
    },
    techStack: {
      frontend: 'Next.js 15',
      backend: 'Next.js API Routes + Prisma',
      database: 'PostgreSQL',
      cache: 'Redis',
      auth: 'NextAuth.js v5',
      testing: 'Vitest',
      deployment: 'Docker',
      rationale: 'Full-stack TypeScript',
    },
    architecturePattern: 'Modular Monolith',
    monetizationHypothesis: 'SaaS subscription',
    goToMarketSignal: 'Developer communities',
  },
  adr: '# ADR 001\n\nTest ADR content',
  timestamp: '2024-01-01T00:00:00.000Z',
  dbName: 'test_project',
};

const NEXTJS_MANIFEST = getStackManifest('nextjs-fullstack');
const NEXTJS_TEMPLATES_DIR = getStack('nextjs-fullstack').templateDir;

describe('renderTemplates', () => {
  it('should render all templates from the manifest without errors', () => {
    const files = renderTemplates(NEXTJS_MANIFEST, MOCK_CONTEXT, NEXTJS_TEMPLATES_DIR);

    expect(files.length).toBe(NEXTJS_MANIFEST.length);

    // Every file should have non-empty content
    for (const file of files) {
      expect(file.path).toBeTruthy();
      expect(file.content).toBeTruthy();
      expect(file.content.length).toBeGreaterThan(0);
    }
  });

  it('should inject projectSlug into package.json', () => {
    const files = renderTemplates(NEXTJS_MANIFEST, MOCK_CONTEXT, NEXTJS_TEMPLATES_DIR);
    const pkgJson = files.find((f) => f.path === 'package.json');

    expect(pkgJson).toBeDefined();
    const parsed = JSON.parse(pkgJson!.content);
    expect(parsed.name).toBe('test-project');
  });

  it('should inject dbName into docker-compose.yml', () => {
    const files = renderTemplates(NEXTJS_MANIFEST, MOCK_CONTEXT, NEXTJS_TEMPLATES_DIR);
    const compose = files.find((f) => f.path === 'docker-compose.yml');

    expect(compose).toBeDefined();
    expect(compose!.content).toContain('test_project');
  });

  it('should inject project vision into layout.tsx', () => {
    const files = renderTemplates(NEXTJS_MANIFEST, MOCK_CONTEXT, NEXTJS_TEMPLATES_DIR);
    const layout = files.find((f) => f.path === 'src/app/layout.tsx');

    expect(layout).toBeDefined();
    expect(layout!.content).toContain('Test Project');
    expect(layout!.content).toContain('A test project for unit testing');
  });

  it('should list P0 features in page.tsx', () => {
    const files = renderTemplates(NEXTJS_MANIFEST, MOCK_CONTEXT, NEXTJS_TEMPLATES_DIR);
    const page = files.find((f) => f.path === 'src/app/page.tsx');

    expect(page).toBeDefined();
    expect(page!.content).toContain('Core feature');
    expect(page!.content).toContain('Auth');
  });

  it('should skip files with false conditions', () => {
    const manifest = [
      {
        source: 'package.json.ejs',
        output: 'package.json',
        condition: () => false,
      },
    ];

    const files = renderTemplates(manifest, MOCK_CONTEXT, NEXTJS_TEMPLATES_DIR);
    expect(files).toHaveLength(0);
  });

  it('should include files with true conditions', () => {
    const manifest = [
      {
        source: 'package.json.ejs',
        output: 'package.json',
        condition: () => true,
      },
    ];

    const files = renderTemplates(manifest, MOCK_CONTEXT, NEXTJS_TEMPLATES_DIR);
    expect(files).toHaveLength(1);
  });
});
