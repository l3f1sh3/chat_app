import { Elysia } from "elysia";
import { database } from "../../../database";

export const conversationAccessMiddleware = new Elysia()
  .derive({as: 'scoped'}, async ({params, user}: any) => {
    const conversationId = parseInt(params.id);

    if (isNaN(conversationId)) {
      throw new Error("Invalid conversation ID");
    }

    const participant = await database.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: user.id
      },
      include: {
        conversation: true
      }
    });

    if (!participant) {
      throw new Error("Access denied: You are not a participant of this conversation");
    }

    return {
      conversation: participant.conversation,
      conversationId: conversationId
    }
  });

