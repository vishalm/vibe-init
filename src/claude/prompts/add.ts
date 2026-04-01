/**
 * Prompts for Claude-powered generator features (api, component, model).
 * Each returns a prompt string that instructs Claude to generate code.
 */

export function buildApiPrompt(endpointName: string, stack: string): string {
  return `You are a senior backend engineer. Generate a REST API endpoint.

TASK: Create a "${endpointName}" API endpoint.
STACK: ${stack}
FRAMEWORK: ${stack === 'nextjs' ? 'Next.js App Router' : 'Express'}

REQUIREMENTS:
- Create the route handler with proper HTTP method handling (GET, POST as appropriate)
- Add Zod input validation for request bodies
- Include proper error handling with appropriate status codes
- Add TypeScript types for request/response
- Create a corresponding test file

OUTPUT FORMAT:
Respond with ONLY a JSON object (no markdown, no explanation):
{
  "files": [
    { "path": "relative/path/to/file.ts", "content": "file contents here" }
  ],
  "instructions": ["Post-generation instructions for the user"]
}`;
}

export function buildComponentPrompt(componentName: string, stack: string): string {
  return `You are a senior frontend engineer. Generate a React component.

TASK: Create a "${componentName}" React component.
STACK: ${stack}

REQUIREMENTS:
- Use TypeScript with proper prop types
- Use functional component with hooks as needed
- Include sensible default styling (Tailwind CSS classes if available)
- Export as named export
- Create a corresponding test file using Vitest + React Testing Library

OUTPUT FORMAT:
Respond with ONLY a JSON object (no markdown, no explanation):
{
  "files": [
    { "path": "relative/path/to/file.tsx", "content": "file contents here" }
  ],
  "instructions": ["Post-generation instructions for the user"]
}`;
}

export function buildModelPrompt(modelName: string, stack: string): string {
  return `You are a senior backend engineer. Generate a database model.

TASK: Create a "${modelName}" Prisma model.
STACK: ${stack}

REQUIREMENTS:
- Add the model to prisma/schema.prisma (output the full addition, not the whole file)
- Include sensible fields (id, timestamps, common fields for the entity)
- Add appropriate relations if the model name suggests them
- Create a migration-ready schema addition

OUTPUT FORMAT:
Respond with ONLY a JSON object (no markdown, no explanation):
{
  "files": [
    { "path": "relative/path/to/file", "content": "file contents here" }
  ],
  "instructions": ["Post-generation instructions for the user"]
}`;
}
