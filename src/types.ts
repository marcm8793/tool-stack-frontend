import { DocumentReference } from "firebase/firestore";

export interface DevTool {
  id: string;
  badges: string[];
  category: DocumentReference<Category>;
  description: string;
  github_link: string;
  github_stars: number;
  logo_url: string;
  name: string;
  website_url: string;
}

export interface DevToolsState {
  tools: DevTool[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export interface Category {
  id: string;
  name: string;
}
