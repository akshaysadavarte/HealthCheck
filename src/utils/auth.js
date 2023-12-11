
const CARGOTRACK_USER = process.env.CARGOTRACK_USERNAME;
const CARGOTRACK_PWD = process.env.CARGOTRACK_PASSWORD;

const MS_USER = process.env.MS_USERNAME;
const MS_PWD = process.env.MS_PASSWORD;

export const loginByUsernamePassword = async function (browser, origin,context) {
  try {

    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);
    await page.goto(origin);
    await page.waitForSelector('input[type="email"]', { visible: true });
    const emailInput = await page.$('input[type="email"]');
    await emailInput.type(CARGOTRACK_USER);

    const passwordInput = await page.$('input[type="password"]');
    await passwordInput.type(CARGOTRACK_PWD);

    await page.click('#next');
    await page.waitForNavigation();
    return true;

  } catch (error) {
    await browser.close();
    context.error(`Error occurred in loginByUsernamePassword():-${error}`);
    return false;
  }
}

export const loginByAzureAD = async function (browser, origin,context) {
  try {

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(origin);
    await page.waitForSelector('button', { visible: true });
    await page.click('#AzureAD');
    await page.waitForNavigation();


    await page.waitForSelector('[name="loginfmt"]')
    await page.type('[name="loginfmt"]', MS_USER)
    await page.click('[type="submit"]')

    await page.waitForNavigation();
    await page.waitForSelector('input[type="password"]', { visible: true })
    await page.type('input[type="password"]', MS_PWD)
    await page.click('[type="submit"]')
    await page.waitForNavigation();
    await page.click('[type="submit"]')

    await page.waitForNavigation();
    return true;
  } catch (error) {
    await browser.close();
    context.error(`Error occurred in loginByAzureAD():-${error}`);
    return false;
  }

}
