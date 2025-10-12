// backend/src/routes/traceRoutes.ts
import express from "express";
import path from "path";

const router = express.Router();

router.get("/:id", (req, res) => {
  const frontendURL = `http://localhost:5173/trace/${req.params.id}`;
  res.redirect(frontendURL);
});

export default router;
