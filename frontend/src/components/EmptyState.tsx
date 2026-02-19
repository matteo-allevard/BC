export const EmptyState = ({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) => (
  <div className="empty">
    <h3>{title}</h3>
    {subtitle && <p>{subtitle}</p>}
  </div>
);
