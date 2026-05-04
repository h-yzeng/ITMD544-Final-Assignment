import { supabase } from '../config/database';
import { Tag } from '../types/database';

export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTagsForLocation(locationId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('location_tags')
    .select('tags(*)')
    .eq('location_id', locationId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => row.tags);
}

export async function addTagToLocation(locationId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('location_tags')
    .insert({ location_id: locationId, tag_id: tagId });

  if (error && error.code !== '23505') throw new Error(error.message);
}

export async function removeTagFromLocation(locationId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('location_tags')
    .delete()
    .eq('location_id', locationId)
    .eq('tag_id', tagId);

  if (error) throw new Error(error.message);
}
