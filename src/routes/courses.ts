import { Router, type Request, type Response } from "express";
import { Course } from "../models/Course";

export const courseRouter = Router();

// There is no requireAuth line in this file, and that is the point.
// items.ts puts one at the top so every route below it is private;
// the course list is what the app shows before anybody has logged in,
// so these two are public on purpose.

// GET /api/courses
courseRouter.get("/", async (_req: Request, res: Response) => {
  const courses = await Course.find().sort({ code: 1 });
  res.json(courses);
});

// GET /api/courses/:code
interface CodeParam {
  code: string;
}

courseRouter.get(
  "/:code",
  async (req: Request<CodeParam>, res: Response) => {
    // The schema uppercases code on the way in, so /courses/itelect4
    // has to be raised here too or it matches nothing.
    const course = await Course.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!course) {
      res.status(404).json({
        message: `No course with code "${req.params.code}"`,
      });
      return;
    }

    res.json(course);
  },
);
