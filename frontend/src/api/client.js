const localHosts = ["localhost", "127.0.0.1"];
const isLocalBrowser =
  typeof window !== "undefined" && localHosts.includes(window.location.hostname);
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || (isLocalBrowser ? "http://localhost:4000/api" : "/_/backend/api");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.details?.join(", ") || payload.error || "Request failed";
    throw new Error(message);
  }

  return payload.data;
}

export const api = {
  getTickets: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return request(`/tickets${query.toString() ? `?${query}` : ""}`);
  },
  getTicket: (id) => request(`/tickets/${id}`),
  createTicket: (body) => request("/tickets", { method: "POST", body: JSON.stringify(body) }),
  updateTicket: (id, body) => request(`/tickets/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  addNote: (id, body) => request(`/tickets/${id}/notes`, { method: "POST", body: JSON.stringify(body) }),
  escalateTicket: (id, body) => request(`/tickets/${id}/escalations`, { method: "POST", body: JSON.stringify(body) }),
  resolveTicket: (id, body) => request(`/tickets/${id}/resolve`, { method: "POST", body: JSON.stringify(body) }),
  getTechnicians: () => request("/technicians"),
  getReportSummary: () => request("/reports/summary")
};
