import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * useDiary — per-user daily reflection entries.
 * One entry per (user, date), upserted as the user edits.
 * @param {string|null} userId
 */
export const useDiary = (userId) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) console.warn('useDiary fetch (run the diary migration?):', error.message);
    else setEntries(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const getEntry = useCallback(
    (date) => entries.find((e) => e.date === date) || null,
    [entries]
  );

  /** Create or update the entry for a given date. */
  const saveEntry = useCallback(async (date, fields) => {
    if (!userId) return null;
    const row = {
      user_id: userId,
      date,
      mood: fields.mood ?? null,
      content: fields.content ?? '',
      wins: fields.wins ?? [],
      improvements: fields.improvements ?? [],
      ai_review: fields.ai_review ?? '',
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('diary_entries')
      .upsert(row, { onConflict: 'user_id,date' })
      .select();
    if (error) { console.error('useDiary save:', error); return null; }
    const saved = data[0];
    setEntries((cur) => {
      const without = cur.filter((e) => e.date !== date);
      return [saved, ...without].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    });
    return saved;
  }, [userId]);

  const deleteEntry = useCallback(async (date) => {
    if (!userId) return;
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);
    if (!error) setEntries((cur) => cur.filter((e) => e.date !== date));
  }, [userId]);

  return { entries, loading, getEntry, saveEntry, deleteEntry, refetch: fetchEntries };
};

export default useDiary;
