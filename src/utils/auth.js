import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from 'os'

let logger;
const tempDir = os.tmpdir()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(tempDir, "cookie.json");

const MS_USER = process.env.MS_USERNAME;
const MS_PWD = process.env.MS_PASSWORD;

export const loginByAzureAD = async function (page, origin, log) {
  logger = log
  if (fs.existsSync(filePath)) { await loadCookiesFromFile(page); }

  await page.setDefaultNavigationTimeout(0);
  await page.goto(origin);
  await page.waitForSelector("button", { visible: true });
  const azureADButton = await page.$("#AzureAD");

  if (!azureADButton) return;

  await page.click("#AzureAD");
  await page.waitForNavigation();

  //MS LOGIN
  await page.waitForSelector('[name="loginfmt"]');
  await page.type('[name="loginfmt"]', MS_USER);
  await page.click('[type="submit"]');

  await page.waitForNavigation();
  await page.waitForSelector('input[type="password"]', { visible: true });
  await page.type('input[type="password"]', MS_PWD);
  await page.click('[type="submit"]');
  await page.waitForNavigation();
  await page.click('[type="submit"]');
  await page.waitForNavigation();
  await saveCookiesToFile(page);
};

async function saveCookiesToFile(page) {
  try {
    // Getting the cookies from the current page
    const cookies = await page.cookies();

    // Writing the cookies to a file as JSON
    fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2));

    // Cookies have been saved successfully
    logger.log("Cookies have been saved successfully");
    return true;
  } catch (error) {
    // An error occurred while saving cookies
    logger.error("Error saving cookies:", error);
    return false;
  }
}

async function loadCookiesFromFile(page) {
  try {
    // Reading cookies from the specified file
    const cookiesJson = fs.readFileSync(filePath, "utf-8");
    const cookies = JSON.parse(cookiesJson);

    // Setting the cookies in the current page
    await page.setCookie(...cookies);
    // Cookies have been loaded successfully
    logger.log(" Cookies have been loaded successfully!!!");
    return true;
  } catch (error) {
    // An error occurred while loading cookies
    logger.error("Error loading cookies:", error);
    return false;
  }
}

