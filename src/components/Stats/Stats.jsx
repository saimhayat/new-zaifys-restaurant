import { useCountUp } from "../../hooks/useCountUp";
import { stats } from "../../data/siteData";
import "./Stats.css";

function StatItem({ stat }) {
  const [value, ref] = useCountUp(stat.value, {
    decimals: stat.isDecimal ? 1 : 0,
  });

  return (
    <div ref={ref} className="stat-item">
      <p className="stat-item__value" aria-label={`${stat.value}${stat.suffix}`}>
        {value}
        {stat.suffix}
      </p>
      <p className="stat-item__label">{stat.label}</p>
    </div>
  );
}

function Stats() {
  return (
    <section className="stats">
      <div className="container stats__grid">
        {stats.map((stat) => (
          <StatItem key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}

export default Stats;