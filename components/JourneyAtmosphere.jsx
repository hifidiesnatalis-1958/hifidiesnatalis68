// Decorative source texture only. The document's native scroll timeline owns
// the whole journey; there are no scroll listeners or React scroll updates.
export default function JourneyAtmosphere() {
  return <div className="journey-atmosphere" aria-hidden="true">
    <div className="journey-shape journey-shape-a"/>
    <div className="journey-shape journey-shape-b"/>
  </div>;
}
