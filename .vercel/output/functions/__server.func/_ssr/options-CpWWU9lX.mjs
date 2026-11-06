import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/options-CpWWU9lX.js
/** Whether Auth0 is configured. Never returns the client id or secret. */
var getSignInOptions_createServerFn_handler = createServerRpc({
	id: "86cd889593b62f1d3e2f3717c73b538effca0f26b68aa7c7b507ad486d7d2dfe",
	name: "getSignInOptions",
	filename: "src/lib/auth/options.ts"
}, (opts) => getSignInOptions.__executeServer(opts));
var getSignInOptions = createServerFn({ method: "GET" }).handler(getSignInOptions_createServerFn_handler, async () => {
	const domain = process.env.AUTH0_DOMAIN?.trim().replace(/^https?:\/\//, "");
	const clientId = process.env.AUTH0_CLIENT_ID?.trim();
	const clientSecret = process.env.AUTH0_CLIENT_SECRET?.trim();
	return { auth0: Boolean(domain && clientId && clientSecret) };
});
//#endregion
export { getSignInOptions_createServerFn_handler };
