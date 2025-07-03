const express = require("express");
const router = express.Router();
const twilioController = require("../controller/twilioController");
const queueManager = require("../utils/queueManager");
const logger = require("../utils/logger");

// Twilio-related routes
router.post("/voice/incoming", twilioController.handleIncomingCall);
router.post("/voice/transfer", twilioController.handleTransfer);
router.post("/voice/transfer-status", twilioController.handleTransferStatus);
router.post("/api/transfer/:callSid", twilioController.transferCall);
router.get("/api/calls/:callSid", twilioController.getCallDetails);
router.post("/voice", twilioController.directCall);

// Non-Twilio routes
router.get("/api/queue", (req, res) => {
  try {
    const queueStatus = queueManager.getQueueStatus();
    res.json(queueStatus);
  } catch (error) {
    logger.error("Error getting queue status:", error);
    res.status(500).json({ error: "Failed to get queue status" });
  }
});

router.post("/api/queue/clear", (req, res) => {
  try {
    queueManager.clearQueue();
    res.json({ success: true, message: "Queue cleared successfully" });
  } catch (error) {
    logger.error("Error clearing queue:", error);
    res.status(500).json({ error: "Failed to clear queue" });
  }
});

module.exports = router;
