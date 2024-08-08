export interface DevTool {
  id: string;
  name: string;
  badges: string[];
  github_link: string;
  github_stars: number;
  logo_url: string;
}

// TODO: Remove if not needed
export type DevToolsCollection = DevTool[];

export interface DevToolDocument extends DevTool {
  id: string;
}

export interface DevToolsState {
  tools: DevToolDocument[];
  isLoading: boolean;
  error: string | null;
}
