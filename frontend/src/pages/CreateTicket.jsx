import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { categories, priorities } from "../constants.js";

const initialForm = {
  requester_name: "",
  requester_email: "",
  department_location: "",
  category: "Account access",
  title: "",
  description: "",
  priority: "Medium",
  assigned_technician_id: ""
};

export default function CreateTicket() {
  const [form, setForm] = useState(initialForm);
  const [technicians, setTechnicians] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getTechnicians().then(setTechnicians).catch((err) => setError(err.message));
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const ticket = await api.createTicket({
        ...form,
        assigned_technician_id: form.assigned_technician_id || null,
        actor: "Service Desk"
      });
      window.location.hash = `/tickets/${ticket.id}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">New request</p>
          <h2>Create Ticket</h2>
        </div>
      </header>
      {error && <div className="alert">{error}</div>}
      <form className="form-panel" onSubmit={submit}>
        <div className="form-grid">
          <Field label="Requester name" value={form.requester_name} onChange={(value) => update("requester_name", value)} />
          <Field label="Requester email" type="email" value={form.requester_email} onChange={(value) => update("requester_email", value)} />
          <Field label="Department/location" value={form.department_location} onChange={(value) => update("department_location", value)} />
          <label>
            Category
            <select value={form.category} onChange={(event) => update("category", event.target.value)}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={(event) => update("priority", event.target.value)}>
              {priorities.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
          </label>
          <label>
            Assigned technician
            <select value={form.assigned_technician_id} onChange={(event) => update("assigned_technician_id", event.target.value)}>
              <option value="">Unassigned</option>
              {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
            </select>
          </label>
        </div>
        <Field label="Title" value={form.title} onChange={(value) => update("title", value)} />
        <label>
          Description
          <textarea rows="6" value={form.description} onChange={(event) => update("description", event.target.value)} />
        </label>
        <div className="actions">
          <button disabled={saving}>{saving ? "Creating..." : "Create Ticket"}</button>
          <a className="button secondary" href="#/tickets">Cancel</a>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
