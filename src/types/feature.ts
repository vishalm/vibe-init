export interface FeatureModule {
  id: string;
  name: string;
  description: string;
  category: 'infrastructure' | 'quality' | 'security' | 'generator' | 'observability';
  /** Stack IDs this feature supports, or '*' for all */
  supportedStacks: string[] | '*';
  /** Check if the feature is already present in the project */
  detect(projectDir: string): boolean;
  /** Apply the feature to the project */
  apply(projectDir: string, options: FeatureApplyOptions): Promise<ApplyResult>;
}

export interface FeatureApplyOptions {
  dryRun: boolean;
  verbose: boolean;
  /** Overwrite existing files */
  force: boolean;
  /** Detected or specified stack ID */
  stack: string;
  /** Additional arguments (e.g., name for api/component/model generators) */
  args?: string[];
}

export interface ApplyResult {
  filesCreated: string[];
  filesModified: string[];
  /** Post-apply instructions for the user */
  instructions: string[];
}
