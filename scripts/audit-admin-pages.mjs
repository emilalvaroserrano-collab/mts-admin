import { chromium } from "playwright";

const base = process.env.AUDIT_URL || "http://127.0.0.1:8080";
const routes = [
  ["/", "Admin"],
  ["/notifications", "Notifications"],
  ["/tickets", "Tickets"],
  ["/orders", "Orders"],
  ["/organizations", "Companies"],
  ["/users", "People"],
  ["/products", "Catalog"],
  ["/payments", "Payments"],
  ["/forms", "Ticket forms"],
  ["/roles", "Roles"],
  ["/integrations", "Zendesk"],
  ["/settings", "Settings"],
  ["/docs", "API"],
];

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const failures = [];

async function audit(page, label) {
  const problems = await page.evaluate(() => {
    const out = [];
    const main = document.querySelector(".admin-main");
    if (main) {
      const style = getComputedStyle(main);
      if (style.paddingLeft !== style.paddingRight) out.push(`uneven padding ${style.paddingLeft} / ${style.paddingRight}`);
    }
    const root = document.documentElement;
    if (root.scrollWidth > root.clientWidth + 2) out.push(`page overflow ${root.scrollWidth - root.clientWidth}px`);
    for (const card of document.querySelectorAll(".admin-main section, .admin-main article, .admin-main a.rounded-2xl, .admin-main li a")) {
      const box = card.getBoundingClientRect();
      if (box.width < 8) continue;
      for (const node of card.querySelectorAll("p, h1, h2, span, a, code, td")) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.scrollWidth > node.clientWidth + 8 && getComputedStyle(node).overflowX !== "auto" && getComputedStyle(node).overflowX !== "scroll") {
          const text = (node.textContent || "").trim().slice(0, 60);
          if (text) out.push(`text outside ${card.tagName}: ${text}`);
          break;
        }
      }
    }
    return out.slice(0, 8);
  });
  const text = await page.locator("body").innerText();
  return { label, url: page.url(), problems, snippet: text.replace(/\s+/g, " ").slice(0, 180) };
}

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err.message || err)));
  await page.goto(`${base}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1200);
  const body = await page.locator("body").innerText();
  if (/email/i.test(body) && (await page.locator("input[type=email], input[name=email]").count())) {
    const email = `audit-${Date.now()}@example.com`;
    const signUp = page.getByRole("button", { name: /create|sign up|register/i });
    if (await signUp.count()) await signUp.first().click();
    const name = page.locator("input[name=name], input[autocomplete=name]");
    if (await name.count()) await name.first().fill("Audit Admin");
    await page.locator("input[type=email], input[name=email]").first().fill(email);
    await page.locator("input[type=password]").first().fill("Audit-pass-12345");
    await page.locator("form button[type=submit], form button").last().click();
    await page.waitForTimeout(2000);
  }
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1500);

  const reports = [];
  for (const [route, title] of routes) {
    errors.length = 0;
    await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(
      (title) => {
        const text = document.body?.innerText || "";
        return text.includes(title) || /sign in|could not|something went wrong/i.test(text);
      },
      title,
      { timeout: 15000 },
    ).catch(() => undefined);
    const report = await audit(page, `${title} mobile`);
    if (errors.length) report.problems.push(...errors.map((item) => `pageerror ${item}`));
    if (!report.snippet.includes(title) && !/sign in|email/i.test(report.snippet)) report.problems.push(`missing heading ${title}`);
    reports.push(report);
  }

  const detail = [
    ["/orders", "a[href*='/orders/']"],
    ["/tickets", "a[href*='/tickets/']"],
    ["/organizations", "a[href*='/organizations/']"],
    ["/notifications", "a[href*='/notifications/']"],
  ];
  for (const [route, selector] of detail) {
    await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(800);
    const link = page.locator(selector).first();
    if (await link.count()) {
      await link.click();
      await page.waitForFunction(() => (document.body?.innerText || "").length > 40, { timeout: 10000 }).catch(() => undefined);
      reports.push(await audit(page, `detail ${route}`));
    } else {
      reports.push({ label: `detail ${route}`, problems: ["no detail link"], snippet: "" });
    }
  }

  await page.setViewportSize({ width: 1280, height: 800 });
  for (const [route, title] of routes) {
    await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(
      (title) => (document.body?.innerText || "").includes(title),
      title,
      { timeout: 15000 },
    ).catch(() => undefined);
    reports.push(await audit(page, `${title} desktop`));
  }

  for (const report of reports) {
    if (report.problems?.length) failures.push(report);
  }
  console.log(JSON.stringify({ checked: reports.length, failed: failures.length, failures, sample: reports.slice(0, 4) }, null, 2));
} finally {
  await browser.close();
}

if (failures.length) process.exit(1);
