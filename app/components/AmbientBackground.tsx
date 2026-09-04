export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="ambient-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="ambient-grid absolute inset-0 opacity-60" />
      <div className="ambient-noise absolute inset-0" />
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="ambient-sheen absolute inset-x-0 top-0 h-[42vh]" />
    </div>
  );
}
