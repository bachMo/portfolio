import { useEffect, useState } from 'react';

function dakarTime() {
  try {
    return new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Dakar', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '--:--';
  }
}

export default function useClock() {
  const [time, setTime] = useState(dakarTime);
  useEffect(() => {
    const id = setInterval(() => setTime(dakarTime()), 30000);
    return () => clearInterval(id);
  }, []);
  return time;
}
