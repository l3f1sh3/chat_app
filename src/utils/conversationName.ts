import { User } from "@prisma/client";

export const getDefaultConversationName = (participants: User[], currentUserId: number) => {
  const others = participants.filter(p => p.id !== currentUserId);
  if (others.length === 1) {
    return others[0].name;
  }
  return others.slice(0, 3).map(p => p.name).join(", ");
}

