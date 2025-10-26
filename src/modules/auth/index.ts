import { Elysia, t } from "elysia";
import { database } from "../../database";
import bcrypt from "bcrypt";
import { registerBody, loginBody } from "./model";
import { userDTO } from "./dto/user";
import { authenticateMiddleware } from "./middlewares/authenticate";
import { generateTokenPair, verifyRefreshToken, hashRefreshToken } from "../../utils/jwt";

export const auth = new Elysia({prefix: "/auth"})
  .post("/register", async ({body}) => {
    const existingUser = await database.user.findFirst({
      where: {
        email: body.email
      }
    });

    if (existingUser) {
      return {
        status: "error",
        message: "User already exists"
      };
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const user = await database.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword
      }
    });

    const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(user);

    await database.user.update({
      where: { id: user.id },
      data: { refreshTokenHash }
    });

    return {
      user: userDTO(user),
      accessToken,
      refreshToken,
      expiresIn: 900
    };
  }, {
    body: registerBody
  })
  .post("/login", async ({body}) => {
    let user = await database.user.findFirst({
      where: {
        email: body.email
      }
    });

    if (!user) {
      return {
        status: "error",
        message: "User not found"
      };
    }

    const isPasswordCorrect = await bcrypt.compare(body.password, user.password);
    if (!isPasswordCorrect) {
      return {
        status: "error",
        message: "Invalid password"
      };
    }

    const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(user);

    await database.user.update({
      where: { id: user.id },
      data: { refreshTokenHash }
    });

    return {
      user: userDTO(user),
      accessToken,
      refreshToken,
      expiresIn: 900
    };
  }, {
    body: loginBody
  })
  .post('/refresh', async ({body}) => {
    const { refreshToken } = body;

    if (!refreshToken) {
      return {
        status: "error",
        message: "Refresh token required"
      };
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return {
        status: "error",
        message: "Invalid or expired refresh token"
      };
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const user = await database.user.findFirst({
      where: {
        id: decoded.userId,
        refreshTokenHash: refreshTokenHash
      }
    });

    if (!user) {
      return {
        status: "error",
        message: "Refresh token not found or revoked"
      };
    }

    const tokens = generateTokenPair(user);

    await database.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: tokens.refreshTokenHash }
    });

    return {
      user: userDTO(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 900
    };
  }, {
    body: t.Object({
      refreshToken: t.String()
    })
  })
  .use(authenticateMiddleware)
  .post('/logout', async ({user}) => {
    await database.user.update({
      where: {
        id: user.id
      },
      data: {
        refreshTokenHash: null
      }
    });

    return {
      status: "success",
      message: "Logout successful"
    };
  })
  .get('/profile', async ({user}) => {
    return {
      user: userDTO(user)
    }
  })
  .get('/users', async ({query, user}) => {
    const searchQuery = query.search as string | undefined;
    
    const users = await database.user.findMany({
      where: searchQuery ? {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } }
        ],
        NOT: {
          id: user.id
        }
      } : {
        NOT: {
          id: user.id
        }
      },
      take: 20
    });

    return users.map(u => userDTO(u));
  });

