import logger from "#config/logger.ts";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "please-add-the-secret-in-env-file";
const JWT_EXPIRES_IN = "1d";

export const jwttoken: {
  sign: (payloda: string) => string;
  verify: (token: string) => string | jwt.JwtPayload;
} = {
  sign: (payload: string) => {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
    } catch (err) {
      logger.error("Failed to authenticate token", err);
      throw new Error("Failed to authenticate token");
    }
  },
  verify: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      logger.error("Failed to authenticate token", err);
      throw new Error("Failed to authenticate token");
    }
  },
};
