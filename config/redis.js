import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  ...(isProduction && {
    socket: {
      tls: true,
      rejectUnauthorized: false,
    },
  }),
});

redisClient.on("error", (err) => console.error("Redis Error:", err));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

connectRedis();

export default redisClient;
