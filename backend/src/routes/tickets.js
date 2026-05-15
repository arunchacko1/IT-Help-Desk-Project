const express = require("express");
const { getDb } = require("../db/connection");
const { logActivity } = require("../services/activityService");
const { attachSla } = require("../services/slaService");
const {
  requireFields,
  validateTicketInput,
  sendValidation
} = require("../middleware/validate");

const router = express.Router();

const ticketSelect = `
  SELECT tickets.*, technicians.name AS assigned_technician, technicians.team AS technician_team
  FROM tickets
  LEFT JOIN technicians ON tickets.assigned_technician_id = technicians.id
`;

async function getTicket(db, id) {
  return db.get(`${ticketSelect} WHERE tickets.id = ?`, [id]);
}

router.get("/", async (req, res, next) => {
  try {
    const db = await getDb();
    const filters = [];
    const params = [];
    const { status, priority, category, technicianId, search } = req.query;

    if (status) {
      filters.push("tickets.status = ?");
      params.push(status);
    }
    if (priority) {
      filters.push("tickets.priority = ?");
      params.push(priority);
    }
    if (category) {
      filters.push("tickets.category = ?");
      params.push(category);
    }
    if (technicianId) {
      filters.push("tickets.assigned_technician_id = ?");
      params.push(technicianId);
    }
    if (search) {
      filters.push("(tickets.title LIKE ? OR tickets.requester_name LIKE ? OR CAST(tickets.id AS TEXT) = ?)");
      params.push(`%${search}%`, `%${search}%`, search);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const rows = await db.all(`${ticketSelect} ${where} ORDER BY datetime(tickets.updated_at) DESC`, params);
    res.json({ data: rows.map(attachSla) });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const db = await getDb();
    const ticket = await getTicket(db, req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", details: ["No ticket exists with that ID"] });
    }

    const [notes, escalations, activity] = await Promise.all([
      db.all("SELECT * FROM notes WHERE ticket_id = ? ORDER BY datetime(created_at) DESC", [req.params.id]),
      db.all("SELECT * FROM escalations WHERE ticket_id = ? ORDER BY datetime(created_at) DESC", [req.params.id]),
      db.all("SELECT * FROM activity_logs WHERE ticket_id = ? ORDER BY datetime(created_at) DESC", [req.params.id])
    ]);

    res.json({ data: { ...attachSla(ticket), notes, escalations, activity } });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const errors = validateTicketInput(req.body);
    if (errors.length) return sendValidation(res, errors);

    const db = await getDb();
    const now = new Date().toISOString();
    const result = await db.run(
      `INSERT INTO tickets (
        requester_name, requester_email, department_location, category, title, description,
        priority, status, assigned_technician_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.requester_name.trim(),
        req.body.requester_email.trim(),
        req.body.department_location.trim(),
        req.body.category,
        req.body.title.trim(),
        req.body.description.trim(),
        req.body.priority,
        req.body.status || "Open",
        req.body.assigned_technician_id || null,
        now,
        now
      ]
    );

    await logActivity(db, result.lastID, "Ticket created", req.body.actor || "Service Desk", "Ticket submitted.");
    const ticket = await getTicket(db, result.lastID);
    res.status(201).json({ data: attachSla(ticket) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const errors = validateTicketInput(req.body, true);
    if (errors.length) return sendValidation(res, errors);

    const db = await getDb();
    const existing = await getTicket(db, req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Ticket not found", details: ["No ticket exists with that ID"] });
    }

    const allowed = [
      "requester_name",
      "requester_email",
      "department_location",
      "category",
      "title",
      "description",
      "priority",
      "status",
      "assigned_technician_id"
    ];
    const updates = [];
    const params = [];

    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates.push(`${field} = ?`);
        params.push(req.body[field] === "" ? null : req.body[field]);
      }
    }

    if (!updates.length) return sendValidation(res, ["At least one editable field is required"]);

    const now = new Date().toISOString();
    if (req.body.status === "In Progress" && !existing.first_response_at) {
      updates.push("first_response_at = ?");
      params.push(now);
    }
    if (req.body.status === "Resolved" && !existing.resolved_at) {
      updates.push("resolved_at = ?");
      params.push(now);
    }
    updates.push("updated_at = ?");
    params.push(now, req.params.id);

    await db.run(`UPDATE tickets SET ${updates.join(", ")} WHERE id = ?`, params);

    const actor = req.body.actor || "Service Desk";
    const changed = allowed
      .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field) && req.body[field] !== existing[field])
      .map((field) => field.replaceAll("_", " "));
    await logActivity(db, req.params.id, "Ticket updated", actor, changed.length ? `Updated ${changed.join(", ")}.` : "Ticket updated.");

    const ticket = await getTicket(db, req.params.id);
    res.json({ data: attachSla(ticket) });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/notes", async (req, res, next) => {
  try {
    const errors = requireFields(req.body, ["author", "note_text"]);
    if (errors.length) return sendValidation(res, errors);

    const db = await getDb();
    const ticket = await getTicket(db, req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", details: ["No ticket exists with that ID"] });
    }

    const now = new Date().toISOString();
    const result = await db.run(
      "INSERT INTO notes (ticket_id, author, note_text, created_at) VALUES (?, ?, ?, ?)",
      [req.params.id, req.body.author.trim(), req.body.note_text.trim(), now]
    );

    const updates = ["updated_at = ?"];
    const params = [now];
    if (!ticket.first_response_at) {
      updates.push("first_response_at = ?");
      params.push(now);
    }
    params.push(req.params.id);
    await db.run(`UPDATE tickets SET ${updates.join(", ")} WHERE id = ?`, params);
    await logActivity(db, req.params.id, "Note added", req.body.author.trim(), "Troubleshooting note added.");

    const note = await db.get("SELECT * FROM notes WHERE id = ?", [result.lastID]);
    res.status(201).json({ data: note });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/escalations", async (req, res, next) => {
  try {
    const errors = requireFields(req.body, ["reason", "escalated_by"]);
    if (errors.length) return sendValidation(res, errors);

    const db = await getDb();
    const ticket = await getTicket(db, req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", details: ["No ticket exists with that ID"] });
    }

    const now = new Date().toISOString();
    const result = await db.run(
      "INSERT INTO escalations (ticket_id, reason, escalated_by, created_at) VALUES (?, ?, ?, ?)",
      [req.params.id, req.body.reason.trim(), req.body.escalated_by.trim(), now]
    );
    await db.run("UPDATE tickets SET status = 'Escalated', updated_at = ? WHERE id = ?", [now, req.params.id]);
    await logActivity(db, req.params.id, "Ticket escalated", req.body.escalated_by.trim(), req.body.reason.trim());

    const escalation = await db.get("SELECT * FROM escalations WHERE id = ?", [result.lastID]);
    res.status(201).json({ data: escalation });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/resolve", async (req, res, next) => {
  try {
    const errors = requireFields(req.body, ["resolution_summary", "actor"]);
    if (errors.length) return sendValidation(res, errors);

    const db = await getDb();
    const ticket = await getTicket(db, req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found", details: ["No ticket exists with that ID"] });
    }

    const now = new Date().toISOString();
    await db.run(
      `UPDATE tickets
       SET status = 'Resolved', resolution_summary = ?, resolved_at = ?, updated_at = ?
       WHERE id = ?`,
      [req.body.resolution_summary.trim(), now, now, req.params.id]
    );
    await logActivity(db, req.params.id, "Ticket resolved", req.body.actor.trim(), req.body.resolution_summary.trim());

    const updated = await getTicket(db, req.params.id);
    res.json({ data: attachSla(updated) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
