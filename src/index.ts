import { Elysia } from "elysia";
import { auth } from "./modules/auth";
import { chat } from "./modules/chat";

const app = new Elysia()
  .onError(({ code, error }) => {
    if (code === 'VALIDATION')
      return {
        status: "error",
        type: "validation",
        errors: error.all.map((error) => {
          return {
            property: error.summary,
            message: error.summary
          }
        })
      }
  })
  .use(auth)
  .use(chat)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

