import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const bare = specifier.slice(2);
    const file = /\.(ts|js|mjs|css|json)$/.test(bare) ? bare : `${bare}.ts`;
    return { url: new URL(`../src/${file}`, import.meta.url).href, shortCircuit: true };
  }
  if (
    specifier.startsWith(".") &&
    context.parentURL?.includes("/src/") &&
    !/\.(ts|js|mjs|css|json)$/.test(specifier)
  ) {
    return { url: new URL(`${specifier}.ts`, context.parentURL).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!url.startsWith("file:") || !url.includes("/src/") || !url.endsWith(".ts")) {
    return nextLoad(url, context);
  }
  let source = readFileSync(fileURLToPath(url), "utf8");
  if (url.endsWith("/src/lib/db.ts")) {
    source = source.replace(
      /const migrations = import\.meta\.glob\("\/migrations\/\*\.sql", \{[\s\S]*?\}\) as Record<string, string>;/,
      "const migrations = globalThis.__e2eMigrationSources;",
    );
  }
  return { format: "module", source: stripTypeScriptTypes(source, { mode: "transform" }), shortCircuit: true };
}
