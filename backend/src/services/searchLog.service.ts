import { supabase } from '../config/database';
import { SearchLog } from '../types/database';

export async function logSearch(queryString: string, locationId?: string): Promise<void> {
  const { error } = await supabase
    .from('search_logs')
    .insert({ query_string: queryString, location_id: locationId ?? null });

  if (error) throw new Error(error.message);
}

export async function getRecentSearches(limit = 10): Promise<SearchLog[]> {
  const { data, error } = await supabase
    .from('search_logs')
    .select('*, locations(name, country)')
    .order('searched_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}
