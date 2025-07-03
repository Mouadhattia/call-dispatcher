// src/controller/twilioController.js

// Example Twilio controller structure
// Add your Twilio business logic here

const twilio = require("twilio");
const TwilioService = require("../utils/twilio");
const queueManager = require("../utils/queueManager");
const logger = require("../utils/logger");

const twilioService = new TwilioService(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const handleIncomingCall = async (req, res) => {
  try {
    const twiml = new twilio.twiml.VoiceResponse();
    const callerNumber = req.body.From;
    logger.info(`Incoming call from ${callerNumber}`);
    queueManager.addToQueue(req.body);
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
};

const handleTransfer = (req, res) => {
  try {
    logger.info("Transfer webhook received:", req.body);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.pause({ length: 1 });
    twiml.dial(req.body.To);
    logger.info("Generated transfer TwiML:", twiml.toString());
    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    logger.error("Error generating transfer TwiML:", error);
    res.status(500).send("Error processing transfer");
  }
};

const handleTransferStatus = (req, res) => {
  try {
    logger.info("Transfer status update:", req.body);
    const twiml = new twilio.twiml.VoiceResponse();
    if (
      req.body.DialCallStatus === "completed" ||
      req.body.DialCallStatus === "answered"
    ) {
      logger.info("Transfer completed successfully");
    } else {
      logger.info(`Transfer ended with status: ${req.body.DialCallStatus}`);
    }
    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    logger.error("Error handling transfer status:", error);
    res.status(500).send("Error processing transfer status");
  }
};

const transferCall = async (req, res) => {
  try {
    const { callSid } = req.params;
    const { to } = req.body;
    logger.info(`Transfer request received for call ${callSid} to ${to}`);
    logger.info("Request body:", req.body);
    if (!to) {
      logger.error("Destination number is missing");
      return res.status(400).json({ error: "Destination number is required" });
    }
    const formattedDestination = to.startsWith("+") ? to : `+${to}`;
    logger.info(`Formatted destination: ${formattedDestination}`);
    const call = queueManager.removeFromQueue(callSid);
    if (!call) {
      logger.error(`Call ${callSid} not found in queue`);
      return res.status(404).json({ error: "Call not found in queue" });
    }
    logger.info(`Call ${callSid} found in queue, proceeding with transfer`);
    const transferUrl = `https://3d32-196-203-72-75.ngrok-free.app/voice/transfer`;
    logger.info(`Transfer URL: ${transferUrl}`);
    const result = await twilioService.transferCall(
      callSid,
      formattedDestination,
      transferUrl
    );
    res.json({
      success: true,
      message: "Call transferred successfully",
      callSid: callSid,
      destination: formattedDestination,
      transferDetails: result,
    });
  } catch (error) {
    logger.error("Error transferring call:", error);
    res.status(500).json({
      error: "Failed to transfer call",
      details: error.message,
    });
  }
};

const getCallDetails = async (req, res) => {
  try {
    const { callSid } = req.params;
    const callDetails = await twilioService.getCallDetails(callSid);
    res.json(callDetails);
  } catch (error) {
    logger.error("Error getting call details:", error);
    res.status(500).json({ error: "Failed to get call details" });
  }
};

const directCall = (req, res) => {
  const { twiml } = twilio;
  const voiceResponse = new twiml.VoiceResponse();
  voiceResponse.dial("+21658828532");
  res.type("text/xml");
  res.send(voiceResponse.toString());
};

module.exports = {
  handleIncomingCall,
  handleTransfer,
  handleTransferStatus,
  transferCall,
  getCallDetails,
  directCall,
};
