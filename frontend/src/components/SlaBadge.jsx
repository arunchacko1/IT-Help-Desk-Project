export default function SlaBadge({ status }) {
  return <span className={`badge sla sla-${status?.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}
