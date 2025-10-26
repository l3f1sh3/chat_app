import { t } from "elysia"

export const registerBody = t.Object({
  email: t.String({
    format: 'email',
    minLength: 3,
    maxLength: 120
  }),
  password: t.String({
    minLength: 6,
    maxLength: 120
  }),
  name: t.String({
    minLength: 2,
    maxLength: 100
  })
})

export const loginBody = t.Object({
  email: t.String({
    format: 'email'
  }),
  password: t.String()
})

