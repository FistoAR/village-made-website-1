import { useState, useEffect } from 'react';
import { TimeOfDay } from '@/types';

export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 11) setTimeOfDay('morning');
    else if (hour >= 12 && hour <= 16) setTimeOfDay('afternoon');
    else if (hour >= 17 && hour <= 19) setTimeOfDay('evening');
    else setTimeOfDay('night');
  }, []);

  return timeOfDay;
}