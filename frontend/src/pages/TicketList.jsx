import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import TicketFilters from "../components/TicketFilters.jsx";
import TicketTable from "../components/TicketTable.jsx";

const emptyFilters = {
  search: "",
  status: "",
  priority: "",
  category: "",
  technicianId: ""
};

export default function TicketList() {
  const [filters, setFilters] = useState(emptyFilters);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTechnicians().then(setTechnicians).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getTickets(filters)
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Ticket queue</p>
          <h2>Tickets</h2>
        </div>
        <a className="button" href="#/create">New Ticket</a>
      </header>
      {error && <div className="alert">{error}</div>}
      <TicketFilters
        filters={filters}
        technicians={technicians}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
      />
      <section className="panel">
        {loading ? <div className="loading">Loading tickets...</div> : <TicketTable tickets={tickets} />}
      </section>
    </div>
  );
}
