import { DocumentReference, Timestamp } from "firebase/firestore";

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
  like_count: number;
}

export interface DevToolsState {
  tools: DevTool[];
  categories: Category[];
  ecosystem: EcoSystem[];
  isLoading: boolean;
  error: string | null;
}

export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface EcoSystem {
  id: string;
  name: string;
}

export interface Like {
  id: string;
  user_id: string;
  tool_id: string;
  liked_at: Timestamp;
}

export interface AdminCheckProps {
  children: React.ReactNode;
}
