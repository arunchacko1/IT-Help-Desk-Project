import React from "react";
import { categories, priorities, statuses } from "../constants.js";

export default function TicketFilters({ filters, technicians, onChange, onReset }) {
  function setFilter(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section className="filters">
      <label>
        Search
        <input
          value={filters.search}
          onChange={(event) => setFilter("search", event.target.value)}
          placeholder="Title, requester, or ID"
        />
      </label>
      <label>
        Status
        <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
      <label>
        Priority
        <select value={filters.priority} onChange={(event) => setFilter("priority", event.target.value)}>
          <option value="">All priorities</option>
          {priorities.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </label>
      <label>
        Category
        <select value={filters.category} onChange={(event) => setFilter("category", event.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label>
        Technician
        <select value={filters.technicianId} onChange={(event) => setFilter("technicianId", event.target.value)}>
          <option value="">All technicians</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </select>
      </label>
      <button className="secondary" onClick={onReset}>Reset</button>
    </section>
  );
}
