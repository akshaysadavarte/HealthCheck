import puppeteer from 'puppeteer'
import lighthouse from 'lighthouse'
import isUrlHttp from 'is-url-http'
import { loginByAzureAD } from './utils/auth.js'
import { getSmallDatetime, httpStatusNameByStatusCode } from './utils/date_utils.js'
import { calculateAverageLoadTime } from './utils/math_utils.js'
import { getAllScreenResponseCheckTarget, bulkCreateScreenResponseTime } from './services/database_service.js'
import { puppeteerConfig, lighthouseConfig } from './config/browser_config.js'


let logger;
export default async function main(context) {
  logger = context;
  logger.log('Started!!')
  const screens = await getAllScreenResponseCheckTarget(logger);
  const loginUrl = screens[0]?.ScreeenURL?.trim();
  let browser;
  try {

    browser = await puppeteer.launch(puppeteerConfig);

    const page = await browser.newPage();
    await loginByAzureAD(page, loginUrl);

    const records = [];
    for (const screen of screens) {

      const url = screen.ScreeenURL.trim();

      if (!isUrlHttp(url)) { continue; }

      const record = await audit(screen, url, page);

      if (record) { records.push(record); }
    }

    if (records.length) {
      await bulkCreateScreenResponseTime(records, logger);
    }
    logger.log(`Job Completed !!!`);

  } catch (error) {
    logger.error(`Error occurred in main():-${error}`);
  } finally {
    await browser.close();
  }
}

async function audit(screen, url, page) {

  const numberOfTrial = screen.NumberOfTrial;
  let statusCode;
  let avgLoadTimeArr = [];
  let retryCount = 3;

  for (let i = 0; i < numberOfTrial; i++) {
    try {
      if (!retryCount) { return null };

      const results = await lighthouse(url, lighthouseConfig.options, lighthouseConfig.config, page);

      const audits = results.lhr.audits;

      const networkrequests = audits['network-requests'];
      const firstRequest = networkrequests.details.items[0];
      statusCode = firstRequest.statusCode;
      const numericValue = audits['interactive'].numericValue;

      avgLoadTimeArr.push(numericValue);
      retryCount = 3;
    }
    catch (error) {
      logger.error(`Error occurred in lighthouse(${url}):-${error}`);
      logger.error(`${4 - retryCount} of 3 Retrying audit for ${url}`);
      i--;
      retryCount--;
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
}



