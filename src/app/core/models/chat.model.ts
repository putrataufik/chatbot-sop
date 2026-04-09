export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  status: 'ACTIVE' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  session_id: number;
  role: 'USER' | 'ASST';
  content: string;
  input_tokens?: number;
  output_tokens?: number;
  timestamp: string;
}

export interface SubQueryResult {
  id: number;
  message_id: number;
  sub_question: string;
  answer: string;
  tokens_used: number;
  depth: number;
  created_at: string;
}

export interface TokenUsageLog {
  message_id: number;
  method: 'CONV' | 'RLM';
  input_tokens: number;
  output_tokens: number;
  rlm_depth: number;
}