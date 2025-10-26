import { Reaction, User, Emoji } from "@prisma/client";
import { userDTO } from "../../auth/dto/user";

type ReactionWithRelations = Reaction & {
  user: User;
  emoji: Emoji;
};

export const reactionDTO = (reaction: ReactionWithRelations) => {
  return {
    id: reaction.id,
    emoji: {
      symbol: reaction.emoji.symbol,
      name: reaction.emoji.name
    },
    user: userDTO(reaction.user)
  };
}

