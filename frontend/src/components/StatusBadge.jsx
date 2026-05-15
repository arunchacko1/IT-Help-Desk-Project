import React from "react";

export default function StatusBadge({ status }) {
  return <span className={`badge status status-${status?.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}
