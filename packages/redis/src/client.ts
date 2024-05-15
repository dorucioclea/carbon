import type { Redis as RedisType } from "@upstash/redis";
import { Redis } from "@upstash/redis";
import type {
  RedisOptions as IoRedisOptions,
  Redis as IoRedisType,
} from "ioredis";
import IoRedis from "ioredis";

const USE_LOCAL_REDIS = !!process.env.USE_LOCAL_REDIS;
const REDIS_URL = process.env.REDIS_URL;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: RedisType | IoRedisType;

declare global {
  var __redis: RedisType | IoRedisType | undefined;
}

if (USE_LOCAL_REDIS) {
  if (!REDIS_URL) {
    throw new Error("REDIS_URL is not defined");
  }

  const config: IoRedisOptions = {
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  };

  // this is needed because in development we don't want to restart
  // the server with every change, but we want to make sure we don't
  // create a new connection to the Redis with every change either.
  if (process.env.NODE_ENV === "production") {
    redis = new IoRedis(REDIS_URL, config);
  } else {
    if (!global.__redis) {
      global.__redis = new IoRedis(REDIS_URL, config);
    }
    redis = global.__redis;
  }
} else {
  if (!UPSTASH_REDIS_REST_URL) {
    throw new Error("UPSTASH_REDIS_REST_URL is not defined");
  }

  if (!UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("UPSTASH_REDIS_REST_TOKEN is not defined");
  }

  // this is needed because in development we don't want to restart
  // the server with every change, but we want to make sure we don't
  // create a new connection to the Redis with every change either.
  if (process.env.NODE_ENV === "production") {
    redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    if (!global.__redis) {
      global.__redis = new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
      });
    }
    redis = global.__redis;
  }
}

export default redis;
