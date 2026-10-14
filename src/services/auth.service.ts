import logger from "#config/logger.ts";
import bcrypt from "bcrypt";
import { db } from "../db/db";
import { users, CreateUser } from "../db/schema";
import { eq } from "drizzle-orm";

const hashPassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (err) {
    logger.error("Error hasing the password: ", err);
    throw err;
  }
};

export const createUser = async (user: CreateUser) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email));

    if (existingUser.length > 0) {
      throw new Error("User already exists.");
    }

    const passwordHashed = await hashPassword(user.password);

    const [newUser] = await db
      .insert(users)
      .values({ ...user, password: passwordHashed })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });
    logger.info(`User with email ${newUser.email} created.`);
    return newUser;
  } catch (err) {
    logger.error("Error creating the user: ", err);
    throw err;
  }
};
