const express = require("express");
const { getDb } = require("../db/connection");
const { attachSla } = require("../services/slaService");

const router = express.Router();

function countBy(rows, field) {
  return rows.reduce((totals, row) => {
    totals[row[field]] = (totals[row[field]] || 0) + 1;
    return totals;
  }, {});
}

router.get("/summary", async (req, res, next) => {
  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT tickets.*, technicians.name AS assigned_technician
      FROM tickets
      LEFT JOIN technicians ON tickets.assigned_technician_id = technicians.id
    `);
    const tickets = rows.map(attachSla);

    res.json({
      data: {
        totals: {
          totalTickets: tickets.length,
          openTickets: tickets.filter((ticket) => ["Open", "In Progress"].includes(ticket.status)).length,
          escalatedTickets: tickets.filter((ticket) => ticket.status === "Escalated").length,
          resolvedTickets: tickets.filter((ticket) => ["Resolved", "Closed"].includes(ticket.status)).length,
          slaBreaches: tickets.filter((ticket) => ticket.sla.overallStatus === "Breached").length
        },
        breakdowns: {
          category: countBy(tickets, "category"),
          priority: countBy(tickets, "priority"),
          status: countBy(tickets, "status"),
          sla: tickets.reduce((totals, ticket) => {
            totals[ticket.sla.overallStatus] = (totals[ticket.sla.overallStatus] || 0) + 1;
            return totals;
          }, {})
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
