const logger = require("./logger");

class QueueManager {
  constructor() {
    this.queue = [];
    this.activeCalls = new Map();
  }

  addToQueue(call) {
    const queueItem = {
      callSid: call.CallSid,
      from: call.From,
      timestamp: new Date(),
      status: "queued",
      attempts: 0,
    };

    this.queue.push(queueItem);
    this.activeCalls.set(call.CallSid, queueItem);
    logger.info(`Call ${call.CallSid} added to queue`);
    return queueItem;
  }

  removeFromQueue(callSid) {
    const index = this.queue.findIndex((call) => call.callSid === callSid);
    if (index !== -1) {
      const call = this.queue.splice(index, 1)[0];
      this.activeCalls.delete(callSid);
      logger.info(`Call ${callSid} removed from queue`);
      return call;
    }
    return null;
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      queuedCalls: this.queue,
      activeCalls: Array.from(this.activeCalls.values()),
    };
  }

  getNextCall() {
    if (this.queue.length > 0) {
      return this.queue[0];
    }
    return null;
  }

  updateCallStatus(callSid, status) {
    const call = this.activeCalls.get(callSid);
    if (call) {
      call.status = status;
      call.lastUpdated = new Date();
      logger.info(`Call ${callSid} status updated to ${status}`);
      return call;
    }
    return null;
  }

  incrementAttempts(callSid) {
    const call = this.activeCalls.get(callSid);
    if (call) {
      call.attempts += 1;
      logger.info(`Call ${callSid} transfer attempts: ${call.attempts}`);
      return call;
    }
    return null;
  }

  clearQueue() {
    this.queue = [];
    this.activeCalls.clear();
    logger.info("Queue cleared");
  }
}

// Create a singleton instance
const queueManager = new QueueManager();

module.exports = queueManager;
