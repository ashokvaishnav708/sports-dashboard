import logger from "#config/logger.ts";
import { Router, Request, Response } from "express";
import { signup } from "#controller/auth.controller.ts";

const authRouter = Router();

authRouter.post("/sign-up", signup);

authRouter.get("/sign-in", (req: Request, res: Response) => {
  const msg: string = "Received GET/ sing-in request";

  logger.info(msg);
  res.send(msg);
});

authRouter.get("/sing-out", (req: Request, res: Response) => {
  const msg: string = "Received GET/ sign-out request";

  logger.info(msg);
  res.send(msg);
});

export default authRouter;
