import { LucideIcon } from '@lucide/angular';

export type GlobalSearchResultType = 'acolhido' | 'triagem';

export interface GlobalSearchResult {
  id: number;
  tipo: GlobalSearchResultType;
  titulo: string;
  descricao: string;
  icon: LucideIcon;
  rota: (string | number)[];
  queryParams?: Record<string, string>;
}

export interface GlobalSearchGroup {
  label: string;
  items: GlobalSearchResult[];
}
