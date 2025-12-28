// API Response Types
export interface ApiResponse<T> {
  code: number;
  msg: string | null;
  failureMap: any | null;
  data: T;
  meta: any | null;
}

export interface SpellGrammarErrorItem {
  message: string;
  replacements: string[];
  offset: number;
  length: number;
  text_error: string;
}

// Internal format for easier handling
export interface SpellGrammarError {
  word: string;
  start: number;
  end: number;
  suggestions: string[];
}

export type ResponseCheckSpellGrammar = SpellGrammarErrorItem[];
