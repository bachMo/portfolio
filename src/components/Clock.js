import useClock from '../hooks/useClock';

export default function Clock() {
  const time = useClock();
  return <span className="clock">{time}</span>;
}
