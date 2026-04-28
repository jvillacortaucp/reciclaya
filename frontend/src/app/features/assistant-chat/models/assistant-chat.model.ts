export type ChatMessageRole = 'assistant' | 'user';
export type ChatMessageType = 'text' | 'product_suggestions';
export type ComplexityLevel = 'low' | 'medium' | 'high';
export type MarketPotential = 'low' | 'medium' | 'high';

export interface ProductSuggestion {
  id: string;
  residueInput: string;
  productName: string;
  description: string;
  sectorName: string;
  complexity: ComplexityLevel;
  marketPotential: MarketPotential;
  iconName: string;
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  type: ChatMessageType;
  suggestions?: readonly ProductSuggestion[];
}

export interface AssistantChatState {
  readonly messages: readonly ChatMessage[];
  readonly selectedSuggestionId: string | null;
  readonly typing: boolean;
}

