const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const slaTargets = {
  Critical: { responseHours: 1, resolutionHours: 4 },
  High: { responseHours: 4, resolutionBusinessDays: 1 },
  Medium: { responseBusinessDays: 1, resolutionBusinessDays: 3 },
  Low: { responseBusinessDays: 2, resolutionBusinessDays: 5 }
};

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function addBusinessDays(start, days) {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) {
      added += 1;
    }
  }
  return result;
}

function addTarget(start, hours, businessDays) {
  if (hours) {
    return new Date(start.getTime() + hours * MS_PER_HOUR);
  }
  return addBusinessDays(start, businessDays);
}

function targetDurationMs(start, due) {
  return Math.max(due.getTime() - start.getTime(), MS_PER_HOUR);
}

function evaluateCheckpoint(start, due, completedAt, now) {
  const completed = completedAt ? new Date(completedAt) : null;
  const checkTime = completed || now;
  const breached = checkTime.getTime() > due.getTime();
  const remaining = due.getTime() - now.getTime();
  const atRiskWindow = targetDurationMs(start, due) * 0.25;

  if (breached) return "Breached";
  if (!completed && remaining <= atRiskWindow) return "At Risk";
  return "Within SLA";
}

function worstStatus(responseStatus, resolutionStatus) {
  if (responseStatus === "Breached" || resolutionStatus === "Breached") return "Breached";
  if (responseStatus === "At Risk" || resolutionStatus === "At Risk") return "At Risk";
  return "Within SLA";
}

function calculateSla(ticket, now = new Date()) {
  const createdAt = new Date(ticket.created_at);
  const target = slaTargets[ticket.priority] || slaTargets.Medium;
  const responseDue = addTarget(createdAt, target.responseHours, target.responseBusinessDays);
  const resolutionDue = addTarget(createdAt, target.resolutionHours, target.resolutionBusinessDays);
  const terminalStatuses = ["Resolved", "Closed"];
  const resolvedAt = ticket.resolved_at || (terminalStatuses.includes(ticket.status) ? ticket.updated_at : null);
  const responseStatus = evaluateCheckpoint(createdAt, responseDue, ticket.first_response_at, now);
  const resolutionStatus = evaluateCheckpoint(createdAt, resolutionDue, resolvedAt, now);
  const overallStatus = worstStatus(responseStatus, resolutionStatus);

  return {
    overallStatus,
    responseStatus,
    resolutionStatus,
    responseDue: responseDue.toISOString(),
    resolutionDue: resolutionDue.toISOString(),
    responseTarget: target.responseHours
      ? `${target.responseHours} hour${target.responseHours === 1 ? "" : "s"}`
      : `${target.responseBusinessDays} business day${target.responseBusinessDays === 1 ? "" : "s"}`,
    resolutionTarget: target.resolutionHours
      ? `${target.resolutionHours} hour${target.resolutionHours === 1 ? "" : "s"}`
      : `${target.resolutionBusinessDays} business day${target.resolutionBusinessDays === 1 ? "" : "s"}`
  };
}

function attachSla(ticket) {
  return {
    ...ticket,
    sla: calculateSla(ticket)
  };
}

module.exports = {
  slaTargets,
  calculateSla,
  attachSla
};
