const technicians = [
  ["Avery Chen", "avery.chen@example.local", "Service Desk"],
  ["Jordan Patel", "jordan.patel@example.local", "Infrastructure"],
  ["Morgan Rivera", "morgan.rivera@example.local", "Endpoint Support"],
  ["Casey Brooks", "casey.brooks@example.local", "Business Systems"]
];

const tickets = [
  [
    "Nina Alvarez",
    "nina.alvarez@example.local",
    "Finance - HQ 3rd Floor",
    "Account access",
    "Locked account after password attempts",
    "Requester cannot access the finance portal after several password attempts this morning.",
    "High",
    "In Progress",
    1
  ],
  [
    "Marcus Lee",
    "marcus.lee@example.local",
    "Operations - Warehouse B",
    "Hardware",
    "Printer not connecting from shipping workstation",
    "The label printer is visible on the network but jobs stay queued on the workstation.",
    "Medium",
    "Open",
    3
  ],
  [
    "Elliot Harris",
    "elliot.harris@example.local",
    "Payroll - HQ 2nd Floor",
    "Payroll/internal tools",
    "Payroll upload error on batch validation",
    "Payroll upload fails during validation with a department code mismatch message.",
    "Critical",
    "Escalated",
    4
  ],
  [
    "Dana Kim",
    "dana.kim@example.local",
    "Legal - Remote",
    "Network",
    "VPN connection failure after client update",
    "VPN client reports that the gateway cannot be reached after the latest update.",
    "High",
    "In Progress",
    2
  ],
  [
    "Owen Miller",
    "owen.miller@example.local",
    "Customer Support - HQ 1st Floor",
    "Email",
    "Email not syncing on mobile device",
    "New messages appear on desktop but not on the requester's mobile mail app.",
    "Medium",
    "Resolved",
    1
  ]
];

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

async function ensureDemoData(db) {
  const existing = await db.get("SELECT COUNT(*) AS count FROM tickets");
  if (existing.count > 0) return;

  for (const technician of technicians) {
    await db.run("INSERT INTO technicians (name, email, team) VALUES (?, ?, ?)", technician);
  }

  for (const [index, ticket] of tickets.entries()) {
    const createdAt = hoursAgo(index + 2);
    const firstResponseAt = index === 1 ? null : hoursAgo(index + 1.5);
    const resolvedAt = ticket[7] === "Resolved" ? hoursAgo(index + 1) : null;
    const result = await db.run(
      `INSERT INTO tickets (
        requester_name, requester_email, department_location, category, title, description,
        priority, status, assigned_technician_id, first_response_at, resolved_at,
        resolution_summary, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ...ticket,
        firstResponseAt,
        resolvedAt,
        resolvedAt ? "Mailbox profile was recreated and sync was verified." : null,
        createdAt,
        resolvedAt || firstResponseAt || createdAt
      ]
    );

    await db.run(
      "INSERT INTO activity_logs (ticket_id, action, actor, details, created_at) VALUES (?, ?, ?, ?, ?)",
      [result.lastID, "Ticket created", "System", `Sample ticket: ${ticket[4]}`, createdAt]
    );
  }
}

module.exports = {
  ensureDemoData
};
