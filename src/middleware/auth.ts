import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Express's Request type has no userId field, because Express does
// not know this app exists. This block adds one, for this project
// only, so req.userId type-checks everywhere below.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// What we put inside the token when we sign it, and therefore what we
// get back out when we verify it.
export interface TokenPayload {
  userId: string;
}

// The guard. Protects the DATA, not just the screen, because anyone
// can call this API without your app.
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Browsers and Postman both send this as:
  //   Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "No token. Send Authorization: Bearer <token>",
    });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    // verify checks the signature was made with our secret, and that
    // the token has not expired. Either failure throws.
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({
      message: "Token is invalid or has expired",
    });
  }
}