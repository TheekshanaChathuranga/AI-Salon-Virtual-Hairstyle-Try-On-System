export interface Hairstyle {
  id: string;
  name: string;
  description: string;
  category: 'short' | 'medium' | 'long' | 'special';
  length: 'pixie' | 'bob' | 'shoulder' | 'long';
  texture: 'straight' | 'wavy' | 'curly' | 'coily';
  reference_image_url: string;
  thumbnail_url: string;
  tags: string[];
  active: boolean;
  created_at?: string;
}

export interface HairColor {
  id: string;
  name: string;
  hex: string;
  description: string;
}

export interface CustomerSession {
  session_id: string;
  session_token: string;
  consent_given: boolean;
  expires_at: string;
}

export interface TryOnJob {
  id: string;
  session_id: string;
  hairstyle_id?: string;
  selected_color?: string;
  input_image_url: string;
  output_image_url?: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  model_name: string;
  processing_time_ms?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface ValidationFeedback {
  valid: boolean;
  message: string;
  confidence?: number;
  blur_score?: number;
  brightness_score?: number;
}

export interface AdminStats {
  total_tryons: number;
  daily_tryons: number;
  popular_hairstyles: Array<{ name: string; category: string; count: number }>;
  failed_generations: number;
  average_generation_time_ms: number;
}
