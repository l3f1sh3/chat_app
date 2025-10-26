import { Elysia, t } from "elysia";
import { database } from "../../database";
import { authenticateMiddleware } from "../auth/middlewares/authenticate";
import { conversationAccessMiddleware } from "./middlewares/conversationAccess";
import {
  createConversationBody,
  updateConversationNameBody,
  addParticipantBody,
  createMessageBody,
  createReactionBody
} from "./model";
import { conversationDTO } from "./dto/conversation";
import { messageDTO } from "./dto/message";

export const chat = new Elysia({ prefix: "/chat" })
  .use(authenticateMiddleware)
  
  .post("/conversations", async ({ body, user }) => {
    const participants = await database.user.findMany({
      where: {
        id: {
          in: body.participantIds
        }
      }
    });

    if (participants.length !== body.participantIds.length) {
      return {
        status: "error",
        message: "Some users not found"
      };
    }

    const allParticipantIds = [...new Set([user.id, ...body.participantIds])];
    
    const conversation = await database.conversation.create({
      data: {
        participants: {
          create: allParticipantIds.map(userId => ({
            userId: userId
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    return {
      status: "success",
      conversation: conversationDTO(conversation, user.id)
    };
  }, {
    body: createConversationBody
  })

  .get("/conversations", async ({ user }) => {
    const conversations = await database.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return conversations.map(conv => conversationDTO(conv, user.id));
  })

  .get("/conversations/:id", async ({ params, user }) => {
    const conversationId = parseInt(params.id);

    const conversation = await database.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!conversation) {
      return {
        status: "error",
        message: "Conversation not found or access denied"
      };
    }

    return conversationDTO(conversation, user.id);
  })

  .patch("/conversations/:id", async ({ params, body, user }) => {
    const conversationId = parseInt(params.id);

    const participant = await database.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: user.id
      }
    });

    if (!participant) {
      return {
        status: "error",
        message: "Access denied"
      };
    }

    const conversation = await database.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        name: body.name
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    return {
      status: "success",
      conversation: conversationDTO(conversation, user.id)
    };
  }, {
    body: updateConversationNameBody
  })

  .post("/conversations/:id/participants", async ({ params, body, user }) => {
    const conversationId = parseInt(params.id);

    const participant = await database.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: user.id
      }
    });

    if (!participant) {
      return {
        status: "error",
        message: "Access denied"
      };
    }

    const userToAdd = await database.user.findUnique({
      where: {
        id: body.userId
      }
    });

    if (!userToAdd) {
      return {
        status: "error",
        message: "User not found"
      };
    }

    const existingParticipant = await database.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: body.userId
      }
    });

    if (existingParticipant) {
      return {
        status: "error",
        message: "User is already a participant"
      };
    }

    await database.conversationParticipant.create({
      data: {
        conversationId: conversationId,
        userId: body.userId
      }
    });

    return {
      status: "success",
      message: "Participant added successfully"
    };
  }, {
    body: addParticipantBody
  })

  .delete("/conversations/:id/participants/:userId", async ({ params, user }) => {
    const conversationId = parseInt(params.id);
    const userIdToRemove = parseInt(params.userId);

    const participant = await database.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: user.id
      }
    });

    if (!participant) {
      return {
        status: "error",
        message: "Access denied"
      };
    }

    const deletedParticipant = await database.conversationParticipant.deleteMany({
      where: {
        conversationId: conversationId,
        userId: userIdToRemove
      }
    });

    if (deletedParticipant.count === 0) {
      return {
        status: "error",
        message: "Participant not found"
      };
    }

    return {
      status: "success",
      message: "Participant removed successfully"
    };
  })


  .post("/conversations/:id/messages", async ({ params, body, user }) => {
    const conversationId = parseInt(params.id);

    const participant = await database.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: user.id
      }
    });

    if (!participant) {
      return {
        status: "error",
        message: "Access denied"
      };
    }

    if (body.replyToId) {
      const replyToMessage = await database.message.findFirst({
        where: {
          id: body.replyToId,
          conversationId: conversationId
        }
      });

      if (!replyToMessage) {
        return {
          status: "error",
          message: "Reply target message not found in this conversation"
        };
      }
    }

    const message = await database.message.create({
      data: {
        content: body.content,
        conversationId: conversationId,
        authorId: user.id,
        replyToId: body.replyToId
      },
      include: {
        author: true,
        replyTo: {
          include: {
            author: true
          }
        },
        reactions: {
          include: {
            user: true,
            emoji: true
          }
        }
      }
    });

    await database.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        updatedAt: new Date()
      }
    });

    return {
      status: "success",
      message: messageDTO(message)
    };
  }, {
    body: createMessageBody
  })

  .get("/conversations/:id/messages", async ({ params, user, query }) => {
    const conversationId = parseInt(params.id);

    const participant = await database.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: user.id
      }
    });

    if (!participant) {
      return {
        status: "error",
        message: "Access denied"
      };
    }

    const messages = await database.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        author: true,
        replyTo: {
          include: {
            author: true
          }
        },
        reactions: {
          include: {
            user: true,
            emoji: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return messages.map(msg => messageDTO(msg));
  })


  .post("/messages/:id/reactions", async ({ params, body, user }) => {
    const messageId = parseInt(params.id);

    const message = await database.message.findUnique({
      where: {
        id: messageId
      },
      include: {
        conversation: true
      }
    });

    if (!message) {
      return {
        status: "error",
        message: "Message not found"
      };
    }

    const participant = await database.conversationParticipant.findFirst({
      where: {
        conversationId: message.conversationId,
        userId: user.id
      }
    });

    if (!participant) {
      return {
        status: "error",
        message: "Access denied"
      };
    }

    const emoji = await database.emoji.findUnique({
      where: {
        id: body.emojiId
      }
    });

    if (!emoji) {
      return {
        status: "error",
        message: "Emoji not found"
      };
    }

    const reaction = await database.reaction.upsert({
      where: {
        messageId_userId: {
          messageId: messageId,
          userId: user.id
        }
      },
      update: {
        emojiId: body.emojiId
      },
      create: {
        messageId: messageId,
        userId: user.id,
        emojiId: body.emojiId
      },
      include: {
        user: true,
        emoji: true
      }
    });

    return {
      status: "success",
      message: "Reaction added successfully"
    };
  }, {
    body: createReactionBody
  })

  .delete("/messages/:id/reactions", async ({ params, user }) => {
    const messageId = parseInt(params.id);

    const message = await database.message.findUnique({
      where: {
        id: messageId
      }
    });

    if (!message) {
      return {
        status: "error",
        message: "Message not found"
      };
    }

    const participant = await database.conversationParticipant.findFirst({
      where: {
        conversationId: message.conversationId,
        userId: user.id
      }
    });

    if (!participant) {
      return {
        status: "error",
        message: "Access denied"
      };
    }

    const deletedReaction = await database.reaction.deleteMany({
      where: {
        messageId: messageId,
        userId: user.id
      }
    });

    if (deletedReaction.count === 0) {
      return {
        status: "error",
        message: "Reaction not found"
      };
    }

    return {
      status: "success",
      message: "Reaction deleted successfully"
    };
  })


  .get("/emojis", async () => {
    const emojis = await database.emoji.findMany({
      orderBy: {
        id: 'asc'
      }
    });

    return emojis;
  });

