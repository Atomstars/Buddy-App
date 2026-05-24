import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    setLoading(true);
    // Fetch lists
    const { data: listsData, error: listsError } = await supabase.from('lists').select('*');
    if (listsError) {
      console.error(listsError);
      setLoading(false);
      return;
    }

    // Fetch items
    const { data: itemsData, error: itemsError } = await supabase.from('list_items').select('*');
    if (itemsError) {
      console.error(itemsError);
      setLoading(false);
      return;
    }

    // Combine
    const combined = (listsData || []).map(list => ({
      ...list,
      items: (itemsData || []).filter(item => item.list_id === list.id)
    }));

    setLists(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const addList = async (title) => {
    const { data, error } = await supabase.from('lists').insert([{ title: title.trim() }]).select();
    if (error) {
      console.error('Error adding list:', error);
    }
    if (!error && data) {
      setLists((current) => [...current, { ...data[0], items: [] }]);
    }
  };

  const removeList = async (id) => {
    const { error } = await supabase.from('lists').delete().eq('id', id);
    if (!error) {
      setLists((current) => current.filter((list) => list.id !== id));
    }
  };

  const addItemToList = async (listId, text) => {
    const { data, error } = await supabase.from('list_items').insert([{ list_id: listId, text: text.trim(), done: false }]).select();
    if (error) {
      console.error('Error adding list item:', error);
    }
    if (!error && data) {
      setLists((current) =>
        current.map((list) => {
          if (list.id === listId) {
            return { ...list, items: [...list.items, data[0]] };
          }
          return list;
        })
      );
    }
  };

  const toggleItem = async (listId, itemId) => {
    const list = lists.find(l => l.id === listId);
    const item = list?.items.find(i => i.id === itemId);
    if (!item) return;

    const { error } = await supabase.from('list_items').update({ done: !item.done }).eq('id', itemId);
    if (!error) {
      setLists((current) =>
        current.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              items: list.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
            };
          }
          return list;
        })
      );
    }
  };

  const removeItem = async (listId, itemId) => {
    const { error } = await supabase.from('list_items').delete().eq('id', itemId);
    if (!error) {
      setLists((current) =>
        current.map((list) => {
          if (list.id === listId) {
            return { ...list, items: list.items.filter((i) => i.id !== itemId) };
          }
          return list;
        })
      );
    }
  };

  return { lists, loading, addList, removeList, addItemToList, toggleItem, removeItem };
};

export default useLists;
