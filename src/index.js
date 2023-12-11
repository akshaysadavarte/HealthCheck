import puppeteer from 'puppeteer'
import lighthouse from 'lighthouse'
import { loginByUsernamePassword, loginByAzureAD } from './utils/auth.js'
import { getSmallDatetime, httpStatusNameByStatusCode } from './utils/date_utils.js'
import { calculateAverageLoadTime } from './utils/math_utils.js'
import { getAllScreenResponseCheckTarget, createScreenResponseTime } from './services/database_service.js'
import isUrlHttp from 'is-url-http'



const PORT = process.env.BROWSER_PORT;

const options = {
  port: PORT,
  disableStorageReset: true,
  //output: 'html',
  //onlyCategories: ['performance'],
}

const config = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/ 537.36(KHTML, like Gecko) Chrome/ 84.0.4143.7 Safari / 537.36 Chrome - Lighthouse',
    onlyAudits: [
      'network-requests',
      'interactive',
    ],
  }
}

let logger;

const main = async function (context) {
  logger = context;
  logger.log('Started!!')
  const screens = await getAllScreenResponseCheckTarget(logger);
  const loginUrl = screens[0]?.ScreeenURL?.trim();
  let browser;
  try {

    browser = await puppeteer.launch({
      defaultViewport: null,
      ignoreDefaultArgs: ['--enable-automation'],
      args: [`--remote-debugging-port=${PORT}`, '--start-maximized', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      protocolTimeout: 2400000,
      headless: true,
      slowMo: 50,
    });

    const isAuthenticated = await loginByAzureAD(browser, loginUrl, logger);

    if (isAuthenticated) {
      const records = [];
      for (const screen of screens) {

        const url = screen.ScreeenURL.trim();

        if (!isUrlHttp(url)) { continue; }

        const record = await audit(screen, url);

        if (record) {
          records.push(record);
        }
      }
      if (records.length) {
        await createScreenResponseTime(records, logger);
      }

      logger.log('Done !!')

    }
  } catch (error) {
    logger.error(`Error occurred in main():-${error}`);
  } finally {
    await browser.close();
  }
}

async function audit(screen, url) {

  const numberOfTrial = screen.NumberOfTrial;
  let statusCode;
  let avgLoadTimeArr = [];
  let retryCount = 0;
  let results;
  try {

    for (let i = 0; i < numberOfTrial; i++) {

      results = await lighthouse(url, options, config);

      const audits = results.lhr.audits;

      const networkrequests = audits['network-requests'];
      const firstRequest = networkrequests.details?.items[0];
      statusCode = firstRequest?.statusCode;

      const numericValue = audits['interactive']?.numericValue;

      if (!(statusCode && numericValue) && retryCount < 3) {
        //logger.log(`Failed audit for ${url} i = ${i} statusCode:- ${statusCode} | numericValue:- ${numericValue}`);
        i--;
        retryCount++;
        logger.error(`${retryCount} of 3 Retrying audit for ${url}\n`);

      } else {
        retryCount = 0;
        avgLoadTimeArr.push(numericValue);
      }

    }

    const avgLoadTimeInSeconds = calculateAverageLoadTime(avgLoadTimeArr);
    const now = getSmallDatetime(new Date());

    const record = {
      TrialDatetime: now,
      TrialNumber: screen.NumberOfTrial,
      ScreeenName: screen.ScreeenName,
      ScreeenURL: screen.ScreeenURL,
      LoadingTimeSeconds: avgLoadTimeInSeconds,
      HttpStatusCode: statusCode,
      HttpStatusName: httpStatusNameByStatusCode(statusCode),
      NumberOfParallelProcessing: screen.NumberOfParallelProcessing,
      CreatedOn: now,
      CreatedBy: screen.CreatedBy,
      ModifiedOn: now,
      ModifiedBy: screen.ModifiedBy
    };
    logger.log(`${record.TrialDatetime} |${record.HttpStatusCode}| ${record.HttpStatusName} | ${record.ScreeenName} | ${record.ScreeenURL} | LoadTimeInSeconds:- ${record.LoadingTimeSeconds} s`)
    return record;

  } catch (error) {
    logger.error(`Error occurred in audit():-${error}`);
    return null;
  }
}


export default main