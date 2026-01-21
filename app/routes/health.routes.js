const express = require("express");
const router = express.Router();
const db = require("../models");

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check del backend
 *     tags: [Health]
 *     security: []  
 *     responses:
 *       200:
 *         description: Servicio operativo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 api:
 *                   type: string
 *                   example: up
 *                 database:
 *                   type: string
 *                   example: connected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error interno
 */
router.get("/", async (req, res, next) => {
  try {
    await db.sequelize.authenticate();

    return res.json({
      status: "ok",
      api: "up",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
