const priorities = ["Low", "Medium", "High", "Critical"];
const statuses = ["Open", "In Progress", "Escalated", "Resolved", "Closed"];
const categories = [
  "Account access",
  "Password reset",
  "Hardware",
  "Software",
  "Network",
  "Email",
  "Payroll/internal tools",
  "Inventory/assets",
  "Other"
];

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function requireFields(body, fields) {
  return fields
    .filter((field) => isBlank(body[field]))
    .map((field) => `${field.replaceAll("_", " ")} is required`);
}

function validateTicketInput(body, partial = false) {
  const errors = [];
  const required = [
    "requester_name",
    "requester_email",
    "department_location",
    "category",
    "title",
    "description",
    "priority"
  ];

  if (!partial) {
    errors.push(...requireFields(body, required));
  }

  if (body.requester_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.requester_email)) {
    errors.push("Requester email must be a valid email address");
  }

  if (body.priority && !priorities.includes(body.priority)) {
    errors.push("Priority must be Low, Medium, High, or Critical");
  }

  if (body.status && !statuses.includes(body.status)) {
    errors.push("Status must be Open, In Progress, Escalated, Resolved, or Closed");
  }

  if (body.category && !categories.includes(body.category)) {
    errors.push("Category is not supported");
  }

  return errors;
}

function sendValidation(res, details) {
  return res.status(400).json({ error: "Validation failed", details });
}

module.exports = {
  priorities,
  statuses,
  categories,
  requireFields,
  validateTicketInput,
  sendValidation
};
