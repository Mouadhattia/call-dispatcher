const twilio = require("twilio");
const logger = require("./logger");

class TwilioService {
  constructor(accountSid, authToken) {
    this.client = twilio(accountSid, authToken);
    // Verify Twilio client
    this.verifyCredentials();
  }

  async verifyCredentials() {
    try {
      // Try to fetch account info to verify credentials
      const account = await this.client.api
        .accounts(process.env.TWILIO_ACCOUNT_SID)
        .fetch();
      logger.info("Twilio credentials verified successfully");
      logger.info(`Account Status: ${account.status}`);
      logger.info(`Account Type: ${account.type}`);
    } catch (error) {
      logger.error("Failed to verify Twilio credentials:", error.message);
      throw new Error("Invalid Twilio credentials");
    }
  }

  async createQueue(queueName) {
    try {
      const queue = await this.client.queues.create({
        friendlyName: queueName,
      });
      logger.info(`Created queue: ${queueName}`);
      return queue;
    } catch (error) {
      logger.error(`Error creating queue ${queueName}:`, error);
      throw error;
    }
  }

  async getQueueMembers(queueSid) {
    try {
      const members = await this.client.queues(queueSid).members.list();
      return members;
    } catch (error) {
      logger.error(`Error getting queue members for ${queueSid}:`, error);
      throw error;
    }
  }

  async transferCall(callSid, destination, transferUrl) {
    try {
      const call = await this.client.calls(callSid).update({
        url: transferUrl,
        method: "POST",
        to: destination,
      });
      logger.info(`Transferred call ${callSid} to ${destination}`);
      return call;
    } catch (error) {
      logger.error(`Error transferring call ${callSid}:`, error);
      throw error;
    }
  }

  async getCallDetails(callSid) {
    try {
      const call = await this.client.calls(callSid).fetch();
      return call;
    } catch (error) {
      logger.error(`Error getting call details for ${callSid}:`, error);
      throw error;
    }
  }

  generateTwiMLForQueue(queueName, holdMusicUrl) {
    const twiml = new twilio.twiml.VoiceResponse();

    // Play hold music
    twiml.play(holdMusicUrl);

    // Add to queue
    twiml.enqueue(
      {
        waitUrl: holdMusicUrl,
      },
      queueName
    );

    return twiml.toString();
  }

  generateTwiMLForTransfer(destination, callerId) {
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.dial(
      {
        callerId: callerId,
        timeout: 30,
        record: "record-from-answer",
        trim: "trim-silence",
      },
      destination
    );

    return twiml.toString();
  }
}

module.exports = TwilioService;
