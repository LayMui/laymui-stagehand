import { Stagehand, Page, BrowserContext } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import boxen from "boxen";
import { drawObserveOverlay, clearOverlays, actWithCache } from "./utils.js";
import { z } from "zod";
import fs from "fs";

interface TestReport {
  testName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'success' | 'failed' | 'error';
  steps: Array<{
    step: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    status: 'running' | 'success' | 'failed' | 'error';
    details?: string;
    error?: string;
  }>;
  summary?: string;
  url?: string;
}

function createReport(testName: string, url?: string): TestReport {
  return {
    testName,
    startTime: new Date(),
    status: 'running',
    steps: [],
    url
  };
}

function addStep(report: TestReport, step: string): void {
  report.steps.push({
    step,
    startTime: new Date(),
    status: 'running'
  });
}

function completeStep(report: TestReport, stepIndex: number, status: 'success' | 'failed' | 'error', details?: string, error?: string): void {
  const step = report.steps[stepIndex];
  if (step) {
    step.endTime = new Date();
    step.duration = step.endTime.getTime() - step.startTime.getTime();
    step.status = status;
    step.details = details;
    step.error = error;
  }
}

function completeReport(report: TestReport, status: 'success' | 'failed' | 'error', summary?: string): void {
  report.endTime = new Date();
  report.duration = report.endTime.getTime() - report.startTime.getTime();
  report.status = status;
  report.summary = summary;
}

function saveReport(report: TestReport): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `test-report-${timestamp}.json`;

  fs.writeFileSync(filename, JSON.stringify(report, null, 2));

  console.log(chalk.green(`\n📊 Test Report Generated: ${filename}`));
  console.log(boxen(
    `Test: ${report.testName}\n` +
    `Status: ${report.status}\n` +
    `Duration: ${report.duration}ms\n` +
    `Steps: ${report.steps.length}\n` +
    `Successful Steps: ${report.steps.filter(s => s.status === 'success').length}`,
    { padding: 1, borderColor: report.status === 'success' ? 'green' : 'red' }
  ));
}

async function waitForPageReady(page: Page, maxTimeout: number = 100_000): Promise<void> {
  const startTime = Date.now();

  console.log("Waiting for page to be ready...");

  try {
    // Strategy 1: Wait for DOM content loaded with shorter timeout
    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
    console.log("DOM content loaded");

    // Strategy 2: Wait for network to be mostly idle
    await page.waitForLoadState('networkidle', { timeout: 20_000 });
    console.log("Network idle achieved");

  } catch (error) {
    console.log("Initial load strategies failed, trying fallback approaches...");

    // Fallback 1: Check if basic page elements are ready
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(10_000, maxTimeout - elapsed);

    try {
      // Wait for body to be present and try to ensure page is interactive
      await page.waitForFunction(
        () => document.readyState === 'complete' || document.readyState === 'interactive',
        { timeout: remainingTime / 2 }
      );
      console.log("Page readyState is ready");
    } catch (readyStateError) {
      console.log("ReadyState check failed, proceeding anyway");
    }

    // Fallback 2: Basic timeout to allow for any remaining async operations
    const finalTimeout = Math.min(5000, Math.max(0, maxTimeout - (Date.now() - startTime)));
    if (finalTimeout > 0) {
      await page.waitForTimeout(finalTimeout);
    }
  }

  console.log(`Page ready after ${Date.now() - startTime}ms`);
}

/**
 * 🤘 Welcome to Stagehand! Thanks so much for trying us out!
 * 🛠️ CONFIGURATION: stagehand.config.ts will help you configure Stagehand
 *
 * 📝 Check out our docs for more fun use cases, like building agents
 * https://docs.stagehand.dev/
 *
 * 💬 If you have any feedback, reach out to us on Slack!
 * https://stagehand.dev/slack
 *
 * 📚 You might also benefit from the docs for Zod, Browserbase, and Playwright:
 * - https://zod.dev/
 * - https://docs.browserbase.com/
 * - https://playwright.dev/docs/intro
 */
async function main({
  page,
  context,
  stagehand,
}: {
  page: Page;
  context: BrowserContext;
  stagehand: Stagehand;
}) {
  const report = createReport("Shadow DOM Iframe Test", "https://selectorshub.com/xpath-practice-page/");

  try {
    // Navigate to the initial URL
    addStep(report, "Navigate to initial URL");
    await page.goto("https://selectorshub.com/shadow-dom-in-iframe/", {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    });
    completeStep(report, 0, 'success', 'Successfully navigated to xpath practice page');


    
    const [actionPreview] = await page.observe("Find the input text field 'Do you love tea?' and fill it with 'Chamomile'");



    /** actionPreview is a JSON-ified version of a Playwright action:
    {
      description: "The quickstart link",
      action: "click",
      selector: "/html/body/div[1]/div[1]/a",
      arguments: [],
    }
    **/

    // NO LLM INFERENCE when calling act on the preview
    await page.act(actionPreview);


    
    // Enhanced iframe interaction
    // addStep(report, "Interact with iframe element");

 // Wait for iframe to be visible with better error handling
    // console.log("Waiting for iframe to be visible...");
    // const iframeElement = page.locator("//iframe[@id='pact']");
    // await iframeElement.waitFor({ state: 'visible', timeout: 60_000 });
    // console.log("Iframe is visible");
    // // Wait for iframe content to load
    // await page.waitForFunction(
    //   () => {
    //     const iframe = document.querySelector('iframe#pact') as HTMLIFrameElement;
    //     return iframe && iframe.contentDocument && iframe.contentDocument.readyState === 'complete';
    //   },
    //   { timeout: 60_000 }
    // );
    // console.log("Iframe content loaded");

    // Additional wait for iframe to be fully ready
    // await page.locator("iframe#pact").waitFor({ state: 'visible' });
    // const iframe = page.frameLocator("iframe#pact");

    // Wait for iframe body to be ready
    // await iframe.locator('body').waitFor({ state: 'attached', timeout: 10_000 });
    // console.log("Iframe body is ready");

    // Additional buffer for dynamic content
//    await page.waitForTimeout(2000);

    // Progressive element waiting
//    const teaElement = iframe.locator("#tea");
 //   await teaElement.waitFor({ state: 'attached', timeout: 100_000 });
  //  console.log("Tea element is attached");

   // await teaElement.waitFor({ state: 'visible', timeout: 100_000 });
 //   console.log("Tea element is visible");

    // Small buffer before interaction
   // await page.waitForTimeout(500);

   // await teaElement.fill("Chamoment", { timeout: 100_000 });
  //  console.log("Successfully filled tea input field");

  //   completeStep(report, 3, 'success', 'Successfully interacted with iframe tea element');
  //   completeReport(report, 'success', 'Shadow DOM iframe test completed successfully');
  //   saveReport(report);

  } catch (error) {
    console.error("Test failed:", error);
    completeReport(report, 'error', `Test failed: ${error.message}`);
    saveReport(report);
    throw error;
  }
}

/**
 * This is the main function that runs when you do npm run start
 *
 * YOU PROBABLY DON'T NEED TO MODIFY ANYTHING BELOW THIS POINT!
 *
 */
async function run() {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();

  if (StagehandConfig.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`,
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        },
      ),
    );
  }

  const page = stagehand.page;
  const context = stagehand.context;
  await main({
    page,
    context,
    stagehand,
  });
  await stagehand.close();
  console.log(
    `\n🤘 Thanks so much for using Stagehand! Reach out to us on Slack if you have any feedback: ${chalk.blue(
      "https://stagehand.dev/slack",
    )}\n`,
  );
}

run();
