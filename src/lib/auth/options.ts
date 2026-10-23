import { createServerFn } from "@tanstack/react-start";

/** Whether Auth0 is configured. Never returns the client id or secret. */
export const getSignInOptions = createServerFn({ method: "GET" }).handler(async () => {
  const domain = process.env.AUTH0_DOMAIN?.trim().replace(/^https?:\/\//, "");
  const clientId = process.env.AUTH0_CLIENT_ID?.trim();
  const clientSecret = process.env.AUTH0_CLIENT_SECRET?.trim();
  return { auth0: Boolean(domain && clientId && clientSecret) };
});
