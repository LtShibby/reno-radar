export interface Comment {
  videoUrl: string;
  commentText: string;
  username?: string;
  profileUrl?: string;
  intentScore: 'high' | 'medium' | 'low';
  matchedKeywords: string[];
  contacted?: boolean;
}

export interface ScrapeResponse {
  success: boolean;
  query: string;
  totalResults: number;
  comments: Comment[];
  error?: string;
  details?: string;
} 