module.exports = (app) => {
  app.use((req, res) => {
    // Middleware runs whenever requested page is not available
    res.status(404).json({ errorMessage: "This route does not exist" });
  });

  app.use((err, req, res) => {
    // Whenever you call next(err), this middleware will handle the error
    console.error("ERROR", req.method, req.path, err);

    // only render if the error occurred before sending the response
    if (!res.headersSent) {
      res.status(500).json({
        errorMessage: "Internal server error. Check the server console",
      });
    }
  });
};
