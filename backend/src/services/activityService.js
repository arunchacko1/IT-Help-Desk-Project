async function logActivity(db, ticketId, action, actor, details) {
  await db.run(
    `INSERT INTO activity_logs (ticket_id, action, actor, details)
     VALUES (?, ?, ?, ?)`,
    [ticketId, action, actor || "System", details]
  );
}

module.exports = {
  logActivity
};
