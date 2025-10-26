import { User } from "@prisma/client";

export const userDTO = (user: User) => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}

