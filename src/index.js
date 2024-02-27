import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import isUrlHttp from "is-url-http";
import axios from 'axios';
import sleep from "sleep-promise";
import { loginByAzureAD } from "./utils/auth.js";
import { getSmallDatetime, calculateAverageLoadTime } from "./utils/math_utils.js";
import { getAllScreenResponseCheckTarget, bulkCreateScreenResponseTime } from "./services/database_service.js";
import { puppeteerConfig, lighthouseConfig } from "./config/browser_config.js";

let logger;
export default async function main(context) {
  logger = context;
  logger.log("Started!!");
  const screens = await getAllScreenResponseCheckTarget(logger);
  const loginUrl = screens[0]?.ScreeenURL?.trim();
  let browser;
  try {
    browser = await puppeteer.launch(puppeteerConfig);

    const page = await browser.newPage();
    await loginByAzureAD(page, loginUrl,logger);
    const cookies = await page.cookies();
    const cookie = `${cookies[2].name}=${cookies[2].value};${cookies[1].name}=${cookies[1].value};${cookies[0].name}=${cookies[0].value}`;
    const records = await audit(screens, page, cookie);

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

async function audit(screens, page, cookie) {
  const records = [];
  let statusCode = 0;
  let statusName = "UNKNOWN";
  let avgLoadTimeInSeconds = 0;

  for (const screen of screens) {
    const url = screen.ScreeenURL.trim();

    if (isUrlHttp(url)) {
      const response = await axios.get(url, { headers: { 'Cookie': cookie } });

      statusCode = response.status;
      statusName = response.statusText;

      if (statusCode === 200) {
        avgLoadTimeInSeconds = await getAvgLoadTimeInSeconds(url, page, screen);
      }
    }

    const now = getSmallDatetime(new Date());
    const record = {
      TrialDatetime: now,
      TrialNumber: screen.NumberOfTrial,
      ScreeenName: screen.ScreeenName,
      ScreeenURL: screen.ScreeenURL,
      LoadingTimeSeconds: avgLoadTimeInSeconds,
      HttpStatusCode: statusCode,
      HttpStatusName: statusName,
      NumberOfParallelProcessing: screen.NumberOfParallelProcessing,
      CreatedOn: now,
      CreatedBy: screen.CreatedBy,
      ModifiedOn: now,
      ModifiedBy: screen.ModifiedBy,
      ScreenCategory: screen.ScreenCategory,
    };

    logger.log(
      `${record.TrialDatetime} |${record.HttpStatusCode}| ${record.HttpStatusName} |${record.ScreenCategory}| ${record.ScreeenName} | ${record.ScreeenURL} | LoadTimeInSeconds:- ${record.LoadingTimeSeconds} s`
    );

    records.push(record);
  }
  return records;

}

async function getAvgLoadTimeInSeconds(url, page, screen) {
  const numberOfTrial = screen.NumberOfTrial;
  const numberOfParallelProcessing = screen.NumberOfParallelProcessing;

  let avgLoadTimeArr = [];
  let retryCount = 3;

  for (let i = 0; i < numberOfTrial; i++) {
    try {
      if (!retryCount) {
        return 0;
      }

      const results = await lighthouse(
        url,
        lighthouseConfig.options,
        lighthouseConfig.config,
        page
      );

      const audits = results.lhr.audits;

      const numericValue = audits["interactive"].numericValue;

      avgLoadTimeArr.push(numericValue);
      retryCount = 3;
    } catch (error) {
      logger.error(`Error occurred in lighthouse(${url}):-${error}`);
      logger.error(`${4 - retryCount} of 3 Retrying audit for ${url}`);
      await sleep(2000);
      i--;
      retryCount--;
    }
  }

  return calculateAverageLoadTime(avgLoadTimeArr);
}
