const express = require("express");
const { getDb } = require("../db/connection");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const db = await getDb();
    const technicians = await db.all(
      "SELECT id, name, email, team FROM technicians WHERE is_active = 1 ORDER BY name"
    );
    res.json({ data: technicians });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
