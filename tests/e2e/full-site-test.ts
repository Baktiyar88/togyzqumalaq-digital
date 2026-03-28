import { chromium } from "playwright";

const BASE = "https://togyzqumalaq-digital.vercel.app";

interface TestResult {
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  details: string;
}

const results: TestResult[] = [];

function log(name: string, status: "PASS" | "FAIL" | "WARN", details: string) {
  results.push({ name, status, details });
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
  console.log(`${icon} ${name}: ${details}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Landing page
  console.log("\n=== 1. LANDING PAGE ===");
  await page.goto(BASE, { waitUntil: "networkidle" });
  const title = await page.title();
  log("Landing title", title.includes("Togyzqumalaq") ? "PASS" : "FAIL", title);

  const h1 = await page.locator("h1").first().textContent();
  log("Landing H1", h1?.includes("Тоғызқұмалақ") ? "PASS" : "FAIL", h1 ?? "not found");

  const signInBtn = page.locator('a[href="/login"]').first();
  log("Sign In button", (await signInBtn.count()) > 0 ? "PASS" : "FAIL", `count: ${await signInBtn.count()}`);

  const signUpBtn = page.locator('a[href="/register"]').first();
  log("Sign Up button", (await signUpBtn.count()) > 0 ? "PASS" : "FAIL", `count: ${await signUpBtn.count()}`);

  // Stats section
  const statsText = await page.locator("text=162").first().isVisible().catch(() => false);
  log("Stats section (162 stones)", statsText ? "PASS" : "WARN", String(statsText));

  // Features section
  const features = await page.locator("text=AI OCR").first().isVisible().catch(() => false);
  log("Features section", features ? "PASS" : "WARN", String(features));

  // Theme toggle
  const themeBtn = page.locator('[aria-label="Toggle theme"]').first();
  if (await themeBtn.count() > 0) {
    log("Theme toggle exists", "PASS", "found");
  } else {
    // Try finding sun/moon icon button
    const iconBtns = page.locator("button").filter({ has: page.locator("svg") });
    log("Theme toggle", (await iconBtns.count()) > 2 ? "WARN" : "FAIL", `icon buttons: ${await iconBtns.count()}`);
  }

  // Language switch
  const langSwitch = page.locator("text=Қаз").first();
  log("Language switch", (await langSwitch.count()) > 0 ? "PASS" : "WARN", `count: ${await langSwitch.count()}`);

  // 2. Register page
  console.log("\n=== 2. REGISTER PAGE ===");
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  const regH2 = await page.locator("h2").first().textContent();
  log("Register heading", regH2?.includes("Sign Up") ? "PASS" : "FAIL", regH2 ?? "");

  const nameInput = page.locator('input[placeholder*="name" i], input[label*="name" i]').first();
  log("Name input", (await nameInput.count()) > 0 ? "PASS" : "WARN", `count: ${await nameInput.count()}`);

  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  log("Email input", (await emailInput.count()) > 0 ? "PASS" : "FAIL", `count: ${await emailInput.count()}`);

  const passInput = page.locator('input[type="password"]').first();
  log("Password input", (await passInput.count()) > 0 ? "PASS" : "FAIL", `count: ${await passInput.count()}`);

  const createBtn = page.locator('button[type="submit"]').first();
  log("Create Account button", (await createBtn.count()) > 0 ? "PASS" : "FAIL", `count: ${await createBtn.count()}`);

  const signInLink = page.locator('a[href="/login"]').first();
  log("Sign In link", (await signInLink.count()) > 0 ? "PASS" : "FAIL", `count: ${await signInLink.count()}`);

  // 3. Login page
  console.log("\n=== 3. LOGIN PAGE ===");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  const loginH2 = await page.locator("h2").first().textContent();
  log("Login heading", loginH2?.includes("Sign In") ? "PASS" : "FAIL", loginH2 ?? "");

  const loginEmail = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  log("Login email input", (await loginEmail.count()) > 0 ? "PASS" : "FAIL", `count: ${await loginEmail.count()}`);

  const loginPass = page.locator('input[type="password"]').first();
  log("Login password input", (await loginPass.count()) > 0 ? "PASS" : "FAIL", `count: ${await loginPass.count()}`);

  const loginBtn = page.locator('button[type="submit"]').first();
  log("Login button", (await loginBtn.count()) > 0 ? "PASS" : "FAIL", `count: ${await loginBtn.count()}`);

  const registerLink = page.locator('a[href="/register"]').first();
  log("Register link", (await registerLink.count()) > 0 ? "PASS" : "FAIL", `count: ${await registerLink.count()}`);

  // 4. Manual entry page
  console.log("\n=== 4. MANUAL ENTRY ===");
  await page.goto(`${BASE}/manual`, { waitUntil: "networkidle" });
  const manualH2 = await page.locator("h2").first().textContent();
  log("Manual heading", manualH2?.includes("Manual") ? "PASS" : "FAIL", manualH2 ?? "");

  // Board
  const board = page.locator('[aria-label="Togyzqumalaq game board"]').first();
  log("Board component", (await board.count()) > 0 ? "PASS" : "FAIL", `count: ${await board.count()}`);

  // Pits
  const pits = page.locator('[aria-label^="Pit"]');
  const pitCount = await pits.count();
  log("Board pits (should be 18)", pitCount === 18 ? "PASS" : "FAIL", `count: ${pitCount}`);

  // South badge
  const southBadge = page.locator("text=South").first();
  log("South player label", (await southBadge.count()) > 0 ? "PASS" : "FAIL", `count: ${await southBadge.count()}`);

  // North badge
  const northBadge = page.locator("text=North").first();
  log("North player label", (await northBadge.count()) > 0 ? "PASS" : "FAIL", `count: ${await northBadge.count()}`);

  // Move input
  const moveBtn = page.locator("text=Move").first();
  log("Move button", (await moveBtn.count()) > 0 ? "PASS" : "WARN", `count: ${await moveBtn.count()}`);

  // FEN display
  const fenLabel = page.locator("text=FEN").first();
  log("FEN display", (await fenLabel.count()) > 0 ? "PASS" : "WARN", `count: ${await fenLabel.count()}`);

  // Try clicking a pit
  const pit1 = page.locator('[aria-label*="Pit 1 south"]').first();
  if (await pit1.count() > 0) {
    await pit1.click();
    await page.waitForTimeout(500);
    log("Pit click (move execution)", "PASS", "clicked pit 1");

    // Check that turn switched to North
    const northActive = page.locator('text="▶ North"').first();
    log("Turn switched to North", (await northActive.count()) > 0 ? "PASS" : "WARN", `count: ${await northActive.count()}`);
  } else {
    log("Pit click", "FAIL", "pit 1 not found");
  }

  // 5. Upload page
  console.log("\n=== 5. UPLOAD PAGE ===");
  await page.goto(`${BASE}/upload`, { waitUntil: "networkidle" });
  const uploadH2 = await page.locator("h2").first().textContent();
  log("Upload heading", uploadH2?.includes("Upload") ? "PASS" : "FAIL", uploadH2 ?? "");

  // Tabs (Single / Batch)
  const singleTab = page.locator("text=Single").first();
  const batchTab = page.locator("text=Batch").first();
  log("Single tab", (await singleTab.count()) > 0 ? "PASS" : "WARN", `count: ${await singleTab.count()}`);
  log("Batch tab", (await batchTab.count()) > 0 ? "PASS" : "WARN", `count: ${await batchTab.count()}`);

  // Dropzone
  const dropzone = page.locator("text=Drag").first();
  log("Dropzone text", (await dropzone.count()) > 0 ? "PASS" : "WARN", `count: ${await dropzone.count()}`);

  // 6. Archive page
  console.log("\n=== 6. ARCHIVE PAGE ===");
  await page.goto(`${BASE}/archive`, { waitUntil: "networkidle" });
  const archiveH2 = await page.locator("h2").first().textContent();
  log("Archive heading", archiveH2?.includes("Archive") ? "PASS" : "FAIL", archiveH2 ?? "");

  // Search
  const searchInput = page.locator('input[placeholder*="Search" i]').first();
  log("Search input", (await searchInput.count()) > 0 ? "PASS" : "WARN", `count: ${await searchInput.count()}`);

  // Import FEN button
  const importBtn = page.locator("text=Import FEN").first();
  log("Import FEN input", (await importBtn.count()) > 0 ? "PASS" : "WARN", `count: ${await importBtn.count()}`);

  // 7. Profile page
  console.log("\n=== 7. PROFILE PAGE ===");
  await page.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
  const profileH2 = await page.locator("h2").first().textContent();
  log("Profile heading", profileH2?.includes("Profile") ? "PASS" : "FAIL", profileH2 ?? "");

  // 8. AppShell navigation
  console.log("\n=== 8. NAVIGATION (AppShell) ===");
  await page.goto(`${BASE}/manual`, { waitUntil: "networkidle" });

  // Check navbar links
  const navUpload = page.locator('a[href="/upload"]').first();
  const navManual = page.locator('a[href="/manual"]').first();
  const navArchive = page.locator('a[href="/archive"]').first();
  const navProfile = page.locator('a[href="/profile"]').first();
  log("Nav: Upload link", (await navUpload.count()) > 0 ? "PASS" : "FAIL", `count: ${await navUpload.count()}`);
  log("Nav: Manual link", (await navManual.count()) > 0 ? "PASS" : "FAIL", `count: ${await navManual.count()}`);
  log("Nav: Archive link", (await navArchive.count()) > 0 ? "PASS" : "FAIL", `count: ${await navArchive.count()}`);
  log("Nav: Profile link", (await navProfile.count()) > 0 ? "PASS" : "FAIL", `count: ${await navProfile.count()}`);

  // Logout button
  const logoutBtn = page.locator("text=Logout").first();
  const logoutBtn2 = page.locator("text=Шығу").first();
  const logoutBtn3 = page.locator("text=Выход").first();
  const hasLogout = (await logoutBtn.count()) > 0 || (await logoutBtn2.count()) > 0 || (await logoutBtn3.count()) > 0;
  log("Logout button", hasLogout ? "PASS" : "WARN", `any logout text found: ${hasLogout}`);

  // 9. Dark mode
  console.log("\n=== 9. DARK/LIGHT MODE ===");
  const html = page.locator("html");
  const initialScheme = await html.getAttribute("data-mantine-color-scheme");
  log("Default color scheme", initialScheme === "dark" ? "PASS" : "WARN", `scheme: ${initialScheme}`);

  // Summary
  console.log("\n==========================================");
  console.log("FULL SITE TEST SUMMARY");
  console.log("==========================================");
  const pass = results.filter(r => r.status === "PASS").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  const warn = results.filter(r => r.status === "WARN").length;
  console.log(`✅ PASS: ${pass}`);
  console.log(`❌ FAIL: ${fail}`);
  console.log(`⚠️  WARN: ${warn}`);
  console.log(`Total: ${results.length}`);

  if (fail > 0) {
    console.log("\nFailed tests:");
    results.filter(r => r.status === "FAIL").forEach(r => console.log(`  ❌ ${r.name}: ${r.details}`));
  }
  if (warn > 0) {
    console.log("\nWarnings:");
    results.filter(r => r.status === "WARN").forEach(r => console.log(`  ⚠️  ${r.name}: ${r.details}`));
  }

  await browser.close();
}

main().catch(console.error);
