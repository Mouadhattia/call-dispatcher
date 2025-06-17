const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const TwilioService = require("../utils/twilio");
const queueManager = require("../utils/queueManager");
const logger = require("../utils/logger");

// Initialize Twilio service
const twilioService = new TwilioService(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Handle incoming calls
router.post("/voice/incoming", async (req, res) => {
  try {
    const twiml = new twilio.twiml.VoiceResponse();
    const callerNumber = req.body.From;

    logger.info(`Incoming call from ${callerNumber}`);

    // Add caller to queue
    queueManager.addToQueue(req.body);

    // Generate TwiML for queue
    const queueTwiML = twilioService.generateTwiMLForQueue(
      process.env.QUEUE_NAME,
      process.env.HOLD_MUSIC_URL
    );

    res.type("text/xml");
    res.send(queueTwiML);
  } catch (error) {
    logger.error("Error handling incoming call:", error);
    res.status(500).send("Error processing call");
  }
});

// Handle call transfers
router.post("/voice/transfer", (req, res) => {
  try {
    const transferTwiML = twilioService.generateTwiMLForTransfer(
      req.body.To,
      process.env.TWILIO_PHONE_NUMBER
    );

    res.type("text/xml");
    res.send(transferTwiML);
  } catch (error) {
    logger.error("Error generating transfer TwiML:", error);
    res.status(500).send("Error processing transfer");
  }
});

// Get queue status
router.get("/api/queue", (req, res) => {
  try {
    const queueStatus = queueManager.getQueueStatus();
    res.json(queueStatus);
  } catch (error) {
    logger.error("Error getting queue status:", error);
    res.status(500).json({ error: "Failed to get queue status" });
  }
});

// Transfer a specific call
router.post("/api/transfer/:callSid", async (req, res) => {
  try {
    const { callSid } = req.params;
    const { to } = req.body; // Changed from 'destination' to 'to' to match Twilio's API

    if (!to) {
      return res.status(400).json({ error: "Destination number is required" });
    }

    const call = queueManager.removeFromQueue(callSid);
    if (!call) {
      return res.status(404).json({ error: "Call not found in queue" });
    }

    // Transfer the call
    await twilioService.transferCall(
      callSid,
      to,
      `${req.protocol}://${req.get("host")}/voice/transfer`
    );

    res.json({ success: true, message: "Call transferred successfully" });
  } catch (error) {
    logger.error("Error transferring call:", error);
    res.status(500).json({ error: "Failed to transfer call" });
  }
});

// Get call details
router.get("/api/calls/:callSid", async (req, res) => {
  try {
    const { callSid } = req.params;
    const callDetails = await twilioService.getCallDetails(callSid);
    res.json(callDetails);
  } catch (error) {
    logger.error("Error getting call details:", error);
    res.status(500).json({ error: "Failed to get call details" });
  }
});

// Clear queue (admin endpoint)
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
