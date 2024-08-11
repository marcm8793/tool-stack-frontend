import { DocumentReference } from "firebase/firestore";

export interface DevTool {
  id: string;
  badges: string[];
  category: DocumentReference<Category>;
  description: string;
  ecosystem: DocumentReference<EcoSystem>;
  github_link: string;
  github_stars: number;
  logo_url: string;
  name: string;
  website_url: string;
}

export interface DevToolsState {
  tools: DevTool[];
  categories: Category[];
  ecosystem: EcoSystem[];
  isLoading: boolean;
  error: string | null;
}

export interface User {
  email: string | null;
  password?: string;
  uid?: string;
  displayName?: string | null;
  photoURL?: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface EcoSystem {
  id: string;
  name: string;
}
