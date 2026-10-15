import logger from "#config/logger.ts";
import { createUser } from "#services/auth.service.ts";
import { cookies } from "#utils/cookies.ts";
import { formatValidationError } from "#utils/format.ts";
import { jwttoken } from "#utils/jwt.ts";
import { signupSchema } from "#validation/auth.validation.ts";
import { Request, Response, NextFunction } from "express";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, role, password } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign(user);

    cookies.set(res, "token", token);

    logger.info(`User registered successfully: ${user.email}`);

    res.status(201).json({
      message: "User registered",
      user,
    });
    next();
  } catch (err) {
    logger.error("Signup error", err);
  }
};

export const signout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    cookies.set(res, "token", undefined);
    res.status(200).send({ message: "Successfully signed out." });
    next();
  } catch (err) {
    logger.error(`Error signing out user: ${req.body.email}`, err);
  }
};
