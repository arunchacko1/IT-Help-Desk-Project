function notFound(req, res) {
  res.status(404).json({ error: "Not found", details: ["The requested resource was not found"] });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Unexpected server error",
    details: err.details || ["An unexpected error occurred"]
  });
}

module.exports = {
  notFound,
  errorHandler
};
