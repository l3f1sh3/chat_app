import { t } from "elysia"

export const createConversationBody = t.Object({
  participantIds: t.Array(t.Number(), {
    minItems: 1,
    maxItems: 50
  })
})

export const updateConversationNameBody = t.Object({
  name: t.String({
    minLength: 1,
    maxLength: 100
  })
})

export const addParticipantBody = t.Object({
  userId: t.Number()
})

export const createMessageBody = t.Object({
  content: t.String({
    minLength: 1,
    maxLength: 5000
  }),
  replyToId: t.Optional(t.Number())
})

export const createReactionBody = t.Object({
  emojiId: t.Number()
})

