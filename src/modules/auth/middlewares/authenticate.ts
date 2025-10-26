import { Elysia } from "elysia";
import { database } from "../../../database";
import { verifyAccessToken } from "../../../utils/jwt";

export const authenticateMiddleware = new Elysia()
  .derive({as: 'scoped'}, async ({headers}) => {
    const authHeader = headers.authorization;

    if (!authHeader) {
      throw new Error("Authorization header missing")
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new Error("Invalid authorization format")
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new Error("Invalid or expired token")
    }

    const user = await database.user.findUnique({
      where: {
        id: decoded.userId
      }
    });

    if (!user) {
      throw new Error("User not found")
    }

    return {
      user,
      tokenPayload: decoded
    }
  })

