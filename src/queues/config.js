const { Queue, Worker, QueueEvents } = require("bullmq");
const IORedis = require("ioredis");

/**
 * BullMQ Setup (§6)
 * 
 * Implements the async worker pipeline as required by prd.md.
 */

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

const redisConnection = new IORedis(REDIS_CONFIG);

// §6 Queue definitions
const analysisQueue = new Queue("analysis", { connection: redisConnection });
const reportQueue   = new Queue("report",   { connection: redisConnection });
const crmQueue      = new Queue("crm",      { connection: redisConnection });

module.exports = {
  analysisQueue,
  reportQueue,
  crmQueue,
  redisConnection
};
