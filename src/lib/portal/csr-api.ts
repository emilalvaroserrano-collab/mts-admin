import { createServerFn } from "@tanstack/react-start";
import { loadPortalCustomer } from "./api";
import { customerContext, saveCsrProfile, saveCsrSite } from "./csr-store";

export const getCsrContext = createServerFn({ method: "GET" })
  .validator((token: string) => token.slice(0, 80))
  .handler(async ({ data }) => {
    const { sql, row } = await loadPortalCustomer(data);
    return customerContext(sql, Number(row.id));
  });

export const saveCsrContext = createServerFn({ method: "POST" })
  .validator((input: { token: string; profile: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const { sql, row } = await loadPortalCustomer(data.token);
    await saveCsrProfile(sql, Number(row.id), data.profile);
    return { saved: true };
  });

export const saveAccountSite = createServerFn({ method: "POST" })
  .validator((input: { token: string; site: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const { sql, row } = await loadPortalCustomer(data.token);
    return saveCsrSite(sql, Number(row.id), data.site);
  });

export const getCsrPushConfig = createServerFn({ method: "GET" }).handler(async () => ({
  publicKey: process.env.CSR_VAPID_PUBLIC_KEY || "",
  configured: Boolean(process.env.CSR_VAPID_PUBLIC_KEY && process.env.CSR_VAPID_PRIVATE_KEY),
}));
export const subscribeCsrDevice = createServerFn({ method: "POST" })
  .validator((input: { token: string; subscription: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const { sql, row, access } = await loadPortalCustomer(data.token);
    const { handleCsrResource } = await import("./csr-store");
    const response = await handleCsrResource(
      new Request(`https://portal.invalid/api/agent/customers/${row.id}/push`, {
        method: "POST",
        body: JSON.stringify({ subscription: data.subscription }),
      }),
      sql,
      Number(row.id),
      Number(row.organization_id) || null,
      access,
    );
    if (!response?.ok) {
      const body = await response?.json();
      throw new Error(body?.error || "Could not subscribe this device.");
    }
    return { subscribed: true };
  });
