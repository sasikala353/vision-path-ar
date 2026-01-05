
export enum AppView {
  SCANNER = 'SCANNER',
  ROLEPLAY = 'ROLEPLAY',
  VAULT = 'VAULT',
  MEDIA = 'MEDIA'
}

export interface CareerOpportunity {
  concept: string;
  companies: string[];
  salary: string;
  modernLink: string;
  truthFilter: string;
  mission: string;
  impactLine: string;
  timestamp: number;
}

// Added optional image property to fix errors in ChatView where image data is stored
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string;
  timestamp: number;
}
