import React from "react";

export default function PriorityBadge({ priority }) {
  return <span className={`badge priority priority-${priority?.toLowerCase()}`}>{priority}</span>;
}
