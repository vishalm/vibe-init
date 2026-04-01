export interface Persona {
  name: string;
  role: string;
  painPoints: string[];
  goals: string[];
}

export interface Feature {
  name: string;
  description: string;
}

export interface TechStackRecommendation {
  frontend: string;
  backend: string;
  database: string;
  cache: string;
  auth: string;
  testing: string;
  deployment: string;
  rationale: string;
}

export interface EnrichmentBrief {
  vision: string;
  problemStatement: string;
  personas: Persona[];
  features: {
    p0: Feature[];
    p1: Feature[];
    p2: Feature[];
  };
  techStack: TechStackRecommendation;
  architecturePattern: string;
  monetizationHypothesis: string;
  goToMarketSignal: string;
}
