export interface Image {
  id: string;
  url: string;
  thumbnail?: string;
}

export interface Sound {
  id: string;
  name: string;
  url: string;
}

export interface Quote {
  text: string;
}

export type QuoteCategory = 'hikam' | 'love' | 'women' | 'dunya';

export interface ProjectConfig {
  image: Image | null;
  sound: Sound | null;
  category: QuoteCategory | null;
  quotes: Quote[];
}