import { readFileSync, readdirSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = new URL(`../src/${specifier.slice(2)}`, import.meta.url);
    return { url: target.href, shortCircuit: true };
  }
  if (specifier.startsWith(".") && context.parentURL?.includes("/src/") && !specifier.endsWith(".ts") && !specifier.endsWith(".js") && !specifier.endsWith(".mjs")) {
    const parent = new URL(context.parentURL);
    const target = new URL(`${specifier}.ts`, parent);
    return { url: target.href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith("/src/lib/db.ts")) {
    const source = readFileSync(fileURLToPath(url), "utf8").replace(
      /const migrations = import\.meta\.glob\("\/migrations\/\*\.sql", \{[\s\S]*?\}\) as Record<string, string>;/,
      "const migrations = globalThis.__e2eMigrationSources;",
    );
    return {
      format: "module",
      source: stripTypeScriptTypes(source, { mode: "strip" }),
      shortCircuit: true,
    };
  }
  if (url.startsWith("file:") && url.includes("/src/") && url.endsWith(".ts")) {
    return {
      format: "module",
      source: stripTypeScriptTypes(readFileSync(fileURLToPath(url), "utf8"), { mode: "strip" }),
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}

const sources = {};
for (const name of readdirSync(new URL("../migrations/", import.meta.url))) {
  if (!name.endsWith(".sql")) continue;
  sources[`/migrations/${name}`] = readFileSync(new URL(`../migrations/${name}`, import.meta.url), "utf8");
}
globalThis.__e2eMigrationSources = sources;
