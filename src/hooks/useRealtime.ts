import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtime<T>(table: string, filter?: string) {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      let query = supabase.from(table).select('*');
      if (filter) {
        // Simple filter handling (e.g., "id=eq.uuid")
        const [column, operator, value] = filter.split('.');
        if (operator === 'eq') query = query.eq(column, value);
      }
      const { data: initialData } = await query;
      if (initialData) setData(initialData as T[]);
    };

    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table, filter: filter },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [payload.new as T, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) => prev.map((item: any) => 
              item.id === payload.new.id ? { ...item, ...payload.new } : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setData((prev) => prev.filter((item: any) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter]);

  return { data, setData };
}
