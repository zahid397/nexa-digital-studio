export function HeroArt() {
  return (
    <div
      className="hero-art"
      role="img"
      aria-label="Abstract violet orbital sculpture representing connected design and development"
    >
      <div className="orbital-glow" />
      <div className="orbital-system">
        <div className="orbit-ring orbit-one" />
        <div className="orbit-ring orbit-two" />
        <div className="orbit-ring orbit-three" />
        <div className="orbit-core" />
        <div className="orbit-satellite" />
      </div>
      <div className="art-caption">
        <span>
          CREATIVE THINKING
          <br />
          CONNECTED DELIVERY
        </span>
        <span className="art-coordinates">
          23.8103° N<br />
          90.4125° E
        </span>
      </div>
      <span className="art-index" aria-hidden="true">
        N/01
      </span>
    </div>
  )
}
