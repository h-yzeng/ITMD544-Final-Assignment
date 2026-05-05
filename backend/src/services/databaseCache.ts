import { supabase } from '../config/database';

const CACHE_TABLE = 'api_cache';

export async function getCachedFromDB<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(CACHE_TABLE)
      .select('value, expires_at')
      .eq('cache_key', key)
      .single();

    if (error || !data) return null;

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      // Async delete, don't wait
      supabase.from(CACHE_TABLE).delete().eq('cache_key', key).then();
      return null;
    }

    return data.value as T;
  } catch (err) {
    // Fail gracefully — if cache lookup fails, let the API call proceed
    console.error(`Cache lookup failed for key ${key}:`, err);
    return null;
  }
}

export async function setCachedToDB<T>(
  key: string,
  value: T,
  ttlMs: number,
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();

    await supabase.from(CACHE_TABLE).upsert(
      {
        cache_key: key,
        value,
        expires_at: expiresAt,
      },
      { onConflict: 'cache_key' },
    );
  } catch (err) {
    // Fail gracefully — cache write failure doesn't break the app
    console.error(`Cache write failed for key ${key}:`, err);
  }
}

export async function clearCacheForKeyPattern(pattern: string): Promise<void> {
  try {
    await supabase
      .from(CACHE_TABLE)
      .delete()
      .ilike('cache_key', pattern);
  } catch (err) {
    console.error(`Cache clear failed for pattern ${pattern}:`, err);
  }
}
