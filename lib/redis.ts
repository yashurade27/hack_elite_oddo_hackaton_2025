import Redis from "ioredis";

// Initialize Redis client
const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error("Redis connection failed after 3 retries");
      return null; // Stop retrying
    }
    const delay = Math.min(times * 200, 1000);
    return delay;
  },
});

// Add error handler
redisClient.on("error", (err: Error) => {
  console.error("Redis connection error:", err);
});

// Test connection
redisClient.ping()
  .then(() => {
    console.log("✅ Redis connected successfully");
  })
  .catch((err: Error) => {
    console.error("❌ Redis connection error:", err);
  });

export const redis = redisClient;