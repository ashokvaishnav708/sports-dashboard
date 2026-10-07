import { Request, Response, Router } from "express";
import { matchIdParamSchema } from "../validation/matches";
import {
  createCommentSchema,
  listCommentsQuerySchema,
} from "../validation/commentary";
import { db } from "../db/db";
import { commentary } from "../db/schema";
import { desc } from "drizzle-orm";

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get("/", async (req: Request, res: Response) => {
  const parsed = listCommentsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload.",
      details: JSON.stringify(parsed.error),
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db.select
      .from(commentary)
      .orderBy(desc(commentary.createdAt))
      .limit(limit);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to list comments." });
  }

  res.status(200).json({ message: "Commentary list" });
});

commentaryRouter.post("/", async (req: Request, res: Response) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid match ID.", details: paramsResult.error.issues });
  }

  const bodyResult = createCommentSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      error: "Invalid commentary payload.",
      details: bodyResult.error.issues,
    });
  }

  try {
    const { minute, ...rest } = bodyResult.data;
    await db
      .insert(commentary)
      .values({
        matchId: paramsResult.data.id,
        minute: minute,
        ...rest,
      })
      .returning();
  } catch (err) {
    console.error("Failed to create commentary", err);
    return res.status(500).json({ error: "Failed to create commentary" });
  }
});
