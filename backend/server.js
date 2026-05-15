const express = require("express");
const cors = require("cors");
const { initializeSchema } = require("./src/db/connection");
const { getDb } = require("./src/db/connection");
const { ensureDemoData } = require("./src/db/demoData");
const ticketRoutes = require("./src/routes/tickets");
const technicianRoutes = require("./src/routes/technicians");
const reportRoutes = require("./src/routes/reports");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const app = express();
const port = process.env.PORT || 4000;
let readyPromise;

function ensureReady() {
  if (!readyPromise) {
    readyPromise = initializeSchema().then(async () => ensureDemoData(await getDb()));
  }
  return readyPromise;
}

app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => {
  try {
    await ensureReady();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (req, res) => {
  res.json({ data: { status: "ok" } });
});

app.use("/api/tickets", ticketRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer(selectedPort = port) {
  await ensureReady();
  return app.listen(selectedPort, () => {
    console.log(`Help desk API running on http://localhost:${selectedPort}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
}

module.exports = app;
module.exports.startServer = startServer;
