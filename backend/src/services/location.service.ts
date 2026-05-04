import { supabase } from '../config/database';
import { Location } from '../types/database';

interface CreateLocationInput {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export async function createOrGetLocation(input: CreateLocationInput): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .upsert(input, { onConflict: 'latitude,longitude' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getLocationById(id: string): Promise<Location | null> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getAllLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateLocation(
  id: string,
  fields: Partial<Pick<Location, 'name' | 'country' | 'timezone'>>,
): Promise<Location | null> {
  const { data, error } = await supabase
    .from('locations')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
