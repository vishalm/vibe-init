export interface DetectionResult {
  detectorId: string;
  detected: boolean;
  confidence: 'high' | 'medium' | 'low';
  details: Record<string, unknown>;
  /** Files or patterns that triggered the detection */
  markers: string[];
}

export interface StackDetection {
  stack: 'nextjs' | 'python-fastapi' | 'go' | 'generic-node' | 'unknown';
  framework: string;
  language: string;
  packageManager: string;
  details: Record<string, unknown>;
}

export interface ProjectAnalysis {
  projectDir: string;
  stack: StackDetection;
  practices: DetectionResult[];
  /** IDs of practices not detected */
  missingPractices: string[];
  /** Human-readable suggestions */
  recommendations: string[];
}
