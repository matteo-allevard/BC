export const MetricCard = ({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="card metric-card">
    <div className="metric-card__label">{label}</div>
    <div className="metric-card__value">{value}</div>
    {hint && <div className="metric-card__hint">{hint}</div>}
  </div>
);
