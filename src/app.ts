import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
// Stage 6: uncomment these two lines once the route files have code in them.
    import { authRouter } from "./routes/auth";
    import { itemRouter } from "./routes/items";
    import { courseRouter } from "./routes/courses";
    import { aiRouter } from "./routes/ai";

// This file builds the app and stops. It never opens a port and never
// touches the database.
export const app = express();

// ===== SESSION 10: only the origins this app is actually served from ====
// One environment variable, comma-separated, so the list is different
// on your laptop and on Vercel without the code knowing which it is.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin !== "");

app.use(cors({ origin: ALLOWED_ORIGINS }));

// On a laptop, server.ts connects to MongoDB and only then starts
// listening, so a request cannot arrive before the connection exists.
// Deployed there is no server.ts step -- the app IS the function, and
// a request is the first thing that happens. So the waiting moves
// here, in front of every route.
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  await connectDB();
  next();
});

// Reads a JSON request body and puts it on req.body. Without this
// line req.body is undefined.
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// Stage 6: uncomment these two lines.
    app.use("/api/auth", authRouter);
    app.use("/api/courses", courseRouter);
    app.use("/api/items", itemRouter);
    app.use("/api/ai", aiRouter);
    
// Nothing above matched, so the URL does not exist.
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// Four parameters, not three. That is the only thing telling Express
// this function is the error handler, so `_next` has to stay.
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
      return;
    }

    // Thrown when a string in the URL is not a valid ObjectId at all.
    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({
        message: `"${err.value}" is not a valid id`,
      });
      return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  },
);

// Vercel looks for an Express app in six places, and src/app.ts is one
// of them. What it needs there is a default export -- that is the
// whole of the deployment configuration for this project, and it is
// why there is no vercel.json in this repo.
export default app;
