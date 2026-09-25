export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationState {
  intent: string;
  goal: string;
  plan: string[];
  first_action: string;
  next_question?: string;
}

export interface KowiResponse {
  success: boolean;
  data?: {
    response: string;
    goal?: ConversationState;
  };
  error?: string;
}