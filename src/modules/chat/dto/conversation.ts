import { Conversation, ConversationParticipant, Message, User } from "@prisma/client";
import { userDTO } from "../../auth/dto/user";
import { getDefaultConversationName } from "../../../utils/conversationName";

type ConversationWithRelations = Conversation & {
  participants: (ConversationParticipant & { user: User })[];
  messages?: Message[];
};

export const conversationDTO = (conversation: ConversationWithRelations, currentUserId: number) => {
  const participants = conversation.participants.map(p => p.user);
  const lastMessage = conversation.messages && conversation.messages.length > 0 
    ? conversation.messages[conversation.messages.length - 1] 
    : undefined;

  return {
    id: conversation.id,
    name: conversation.name || getDefaultConversationName(participants, currentUserId),
    participants: participants.map(p => userDTO(p)),
    participantCount: participants.length,
    lastMessage: lastMessage ? {
      id: lastMessage.id,
      content: lastMessage.content,
      createdAt: lastMessage.createdAt
    } : null,
    createdAt: conversation.createdAt
  };
}

