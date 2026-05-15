const { initializeSchema, getDb } = require("./connection");
const { logActivity } = require("../services/activityService");

const technicians = [
  ["Avery Chen", "avery.chen@example.local", "Service Desk"],
  ["Jordan Patel", "jordan.patel@example.local", "Infrastructure"],
  ["Morgan Rivera", "morgan.rivera@example.local", "Endpoint Support"],
  ["Casey Brooks", "casey.brooks@example.local", "Business Systems"]
];

const tickets = [
  {
    requester_name: "Nina Alvarez",
    requester_email: "nina.alvarez@example.local",
    department_location: "Finance - HQ 3rd Floor",
    category: "Account access",
    title: "Locked account after password attempts",
    description: "Requester cannot access the finance portal after several password attempts this morning.",
    priority: "High",
    status: "In Progress",
    assigned_technician_id: 1,
    created_at: hoursAgo(3),
    first_response_at: hoursAgo(2.5)
  },
  {
    requester_name: "Marcus Lee",
    requester_email: "marcus.lee@example.local",
    department_location: "Operations - Warehouse B",
    category: "Hardware",
    title: "Printer not connecting from shipping workstation",
    description: "The label printer is visible on the network but jobs stay queued on the workstation.",
    priority: "Medium",
    status: "Open",
    assigned_technician_id: 3,
    created_at: businessDaysAgo(1)
  },
  {
    requester_name: "Priya Shah",
    requester_email: "priya.shah@example.local",
    department_location: "Sales - Remote",
    category: "Hardware",
    title: "Laptop running slowly during video calls",
    description: "Laptop performance drops when browser tabs and video meetings are open at the same time.",
    priority: "Low",
    status: "Open",
    assigned_technician_id: 3,
    created_at: businessDaysAgo(2)
  },
  {
    requester_name: "Elliot Harris",
    requester_email: "elliot.harris@example.local",
    department_location: "Payroll - HQ 2nd Floor",
    category: "Payroll/internal tools",
    title: "Payroll upload error on batch validation",
    description: "Payroll upload fails during validation with a department code mismatch message.",
    priority: "Critical",
    status: "Escalated",
    assigned_technician_id: 4,
    created_at: hoursAgo(5),
    first_response_at: hoursAgo(4.5)
  },
  {
    requester_name: "Sam Okafor",
    requester_email: "sam.okafor@example.local",
    department_location: "Facilities - HQ",
    category: "Inventory/assets",
    title: "Inventory scanner not updating asset records",
    description: "Scans complete on the handheld device but new asset records do not appear in the tracking view.",
    priority: "Medium",
    status: "Resolved",
    assigned_technician_id: 2,
    created_at: businessDaysAgo(2),
    first_response_at: businessDaysAgo(2),
    resolved_at: businessDaysAgo(1),
    resolution_summary: "Reconnected the scanner profile to the asset sync queue and confirmed new records appear."
  },
  {
    requester_name: "Dana Kim",
    requester_email: "dana.kim@example.local",
    department_location: "Legal - Remote",
    category: "Network",
    title: "VPN connection failure after client update",
    description: "VPN client reports that the gateway cannot be reached after the latest update.",
    priority: "High",
    status: "In Progress",
    assigned_technician_id: 2,
    created_at: hoursAgo(6),
    first_response_at: hoursAgo(5.75)
  },
  {
    requester_name: "Owen Miller",
    requester_email: "owen.miller@example.local",
    department_location: "Customer Support - HQ 1st Floor",
    category: "Email",
    title: "Email not syncing on mobile device",
    description: "New messages appear on desktop but not on the requester's mobile mail app.",
    priority: "Medium",
    status: "Closed",
    assigned_technician_id: 1,
    created_at: businessDaysAgo(4),
    first_response_at: businessDaysAgo(4),
    resolved_at: businessDaysAgo(3),
    resolution_summary: "Removed the stale mobile profile, re-added the mailbox, and verified new mail sync."
  }
];

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function businessDaysAgo(days) {
  const date = new Date();
  let removed = 0;
  while (removed < days) {
    date.setDate(date.getDate() - 1);
    if (![0, 6].includes(date.getDay())) {
      removed += 1;
    }
  }
  return date.toISOString();
}

async function seed() {
  await initializeSchema();
  const db = await getDb();
  await db.exec(`
    DELETE FROM escalations;
    DELETE FROM activity_logs;
    DELETE FROM notes;
    DELETE FROM tickets;
    DELETE FROM technicians;
    DELETE FROM sqlite_sequence WHERE name IN ('tickets', 'technicians', 'notes', 'activity_logs', 'escalations');
  `);

  for (const technician of technicians) {
    await db.run("INSERT INTO technicians (name, email, team) VALUES (?, ?, ?)", technician);
  }

  for (const ticket of tickets) {
    const result = await db.run(
      `INSERT INTO tickets (
        requester_name, requester_email, department_location, category, title, description,
        priority, status, assigned_technician_id, resolution_summary, first_response_at,
        resolved_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket.requester_name,
        ticket.requester_email,
        ticket.department_location,
        ticket.category,
        ticket.title,
        ticket.description,
        ticket.priority,
        ticket.status,
        ticket.assigned_technician_id,
        ticket.resolution_summary || null,
        ticket.first_response_at || null,
        ticket.resolved_at || null,
        ticket.created_at,
        ticket.resolved_at || ticket.first_response_at || ticket.created_at
      ]
    );

    await logActivity(db, result.lastID, "Ticket created", "System", `Seeded ticket: ${ticket.title}`);

    if (ticket.first_response_at) {
      await db.run(
        "INSERT INTO notes (ticket_id, author, note_text, created_at) VALUES (?, ?, ?, ?)",
        [result.lastID, "Service Desk", "Initial review completed and troubleshooting started.", ticket.first_response_at]
      );
      await logActivity(db, result.lastID, "First response recorded", "Service Desk", "Troubleshooting note added.");
    }

    if (ticket.status === "Escalated") {
      await db.run(
        "INSERT INTO escalations (ticket_id, reason, escalated_by, created_at) VALUES (?, ?, ?, ?)",
        [result.lastID, "Business process is blocked and needs specialist review.", "Avery Chen", hoursAgo(4)]
      );
      await logActivity(db, result.lastID, "Ticket escalated", "Avery Chen", "Business process is blocked and needs specialist review.");
    }

    if (ticket.resolution_summary) {
      await logActivity(db, result.lastID, "Ticket resolved", "Service Desk", ticket.resolution_summary);
    }
  }

  console.log("Database seeded successfully.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
