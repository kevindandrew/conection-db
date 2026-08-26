import type { Request, Response, NextFunction } from "express";
import type { promises } from "node:dns";
import { ZodType, ZodError } from "zod";

export const validateSchema =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: error.issues,
        });
        return;
      }
      res.status(500).json({
        message: "error interno del servidor",
      });
    }
  };
