import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pages = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith(".tsx")) pages.push(path);
  }
}

walk(join(root, "src/routes/_app"));
const css = readFileSync(join(root, "src/styles.css"), "utf8");
const panel = readFileSync(join(root, "src/components/ui.tsx"), "utf8");
const failures = [];

if (!css.includes("padding-inline: 1rem")) failures.push("admin page padding is not even");
if (!css.includes("padding-inline: 1.5rem")) failures.push("wide admin padding is not even");
if (!css.includes("overflow: hidden")) failures.push("cards do not clip");
if (!css.includes("overflow-wrap: anywhere")) failures.push("text can escape its box");
if (!css.includes("justify-content: center")) failures.push("mobile rows are not centered");
if (!panel.includes("overflow-hidden")) failures.push("Panel does not clip");

for (const path of pages) {
  const source = readFileSync(path, "utf8");
  if (!source.includes("grid")) failures.push(`${path} has no grid layout`);
  if (source.includes("min-w-[") && !source.includes("overflow-x-auto") && !source.includes("overflow-hidden")) {
    failures.push(`${path} has a wide box without a clip or scroll container`);
  }
}

const routes = ["/", "/notifications", "/orders", "/tickets", "/users", "/organizations", "/products", "/payments", "/forms", "/roles", "/integrations", "/settings", "/docs"];
for (const route of routes) {
  const response = await fetch(`http://127.0.0.1:8080${route}`, { redirect: "manual" });
  if (response.status >= 500) failures.push(`${route} returned ${response.status}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`admin layout ok: ${pages.length} pages, ${routes.length} routes`);
