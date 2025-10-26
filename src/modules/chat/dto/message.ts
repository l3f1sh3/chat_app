import { Message, User, Reaction, Emoji } from "@prisma/client";
import { userDTO } from "../../auth/dto/user";
import { reactionDTO } from "./reaction";

type MessageWithRelations = Message & {
  author: User;
  replyTo?: (Message & { author: User }) | null;
  reactions?: (Reaction & { user: User; emoji: Emoji })[];
};

export const messageDTO = (message: MessageWithRelations) => {
  return {
    id: message.id,
    content: message.content,
    author: userDTO(message.author),
    replyTo: message.replyTo ? {
      id: message.replyTo.id,
      content: message.replyTo.content,
      author: userDTO(message.replyTo.author),
      createdAt: message.replyTo.createdAt
    } : null,
    reactions: message.reactions ? message.reactions.map(r => reactionDTO(r)) : [],
    createdAt: message.createdAt
  };
}

