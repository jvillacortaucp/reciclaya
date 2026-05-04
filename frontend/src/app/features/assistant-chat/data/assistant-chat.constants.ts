import { ComplexityLevel, MarketPotential } from '../models/assistant-chat.model';

export interface ChatQuickSuggestion {
  readonly id: string;
  readonly label: string;
}

export const ASSISTANT_CHAT_COPY = {
  title: 'Asistente EcoInnova',
  subtitle:
    'Descubre oportunidades de valorización en una conversación guiada y accionable.',
  greeting:
    'Hola, soy Eco. Te ayudaré a descubrir oportunidades a partir de tus residuos.',
  firstQuestion: '¿Qué residuo piensas convertir hoy?',
  loadingMessage: 'Analizando residuo...',
  resultsPrefix: 'Encontré estas posibles rutas de valorización para',
  resultsSuffix: 'Te muestro hasta 3 opciones recomendadas.',
  selectionMessage:
    'Excelente elección. Podemos analizar el proceso, la explicación técnica o el mercado de este producto.',
  inputPlaceholder: 'Escribe un residuo o haz una pregunta...',
  suggestionsLabel: 'Sugerencias:',
  routeProcess: 'Ver proceso',
  routeExplanation: 'Ver explicación',
  routeMarket: 'Ver análisis de mercado'
} as const;

export const ASSISTANT_QUICK_SUGGESTIONS: readonly ChatQuickSuggestion[] = [
  { id: 'mango-peel', label: 'Cáscara de mango' },
  { id: 'coffee-husk', label: 'Cascarilla de café' },
  { id: 'grape-bagasse', label: 'Bagazo de uva' },
  { id: 'avocado-seed', label: 'Semilla de palta' }
] as const;

export const COMPLEXITY_LABELS: Record<ComplexityLevel, string> = {
  low: 'Comp. baja',
  medium: 'Comp. media',
  high: 'Comp. alta'
};

export const MARKET_POTENTIAL_LABELS: Record<MarketPotential, string> = {
  low: 'Pot. bajo',
  medium: 'Pot. medio',
  high: 'Pot. alto'
};

export const COMPLEXITY_STYLES: Record<ComplexityLevel, string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700'
};

export const POTENTIAL_STYLES: Record<MarketPotential, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-indigo-100 text-indigo-700',
  high: 'bg-emerald-100 text-emerald-700'
};

