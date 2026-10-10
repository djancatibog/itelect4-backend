import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
// Stage 6: uncomment these two lines once the route files have code in them.
    import { authRouter } from "./routes/auth";
    import { itemRouter } from "./routes/items";

// This file builds the app and stops. It never opens a port and never
// touches the database.
export const app = express();

// Lets a browser on another port (your Vite app on 5173) call this one.
// Postman is not a browser, so it never needs this.
app.use(cors());

// Reads a JSON request body and puts it on req.body. Without this
// line req.body is undefined.
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// Stage 6: uncomment these two lines.
    app.use("/api/auth", authRouter);
    app.use("/api/items", itemRouter);

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