import { Stagehand, Page, BrowserContext } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import boxen from "boxen";
import { drawObserveOverlay, clearOverlays, actWithCache } from "./utils.js";
import { z } from "zod";

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
  // Navigate to the initial URL
  await page.goto("https://selectorshub.com/xpath-practice-page/", { 
    waitUntil: 'domcontentloaded', 
    timeout: 60_000 
  });

  // Scroll to and click the iframe trigger link
  const [actionPreview] = await page.observe("Scroll to the link text 'Click to practice iframe inside shadow dom scenario' so it becomes visible on the screen");


  /** actionPreview is a JSON-ified version of a Playwright action:
  {
    description: "The quickstart link",
    action: "click",
    selector: "/html/body/div[1]/div[1]/a",
    arguments: [],
  }
  **/
  
  // NO LLM INFERENCE when calling act on the preview
  await page.act(actionPreview)
   
  await page.waitForLoadState('domcontentloaded', { timeout: 100_000 }); // 60 seconds

  const iframeElement = page.locator("//iframe[@id='pact']");
  await iframeElement.waitFor({ state: 'visible', timeout: 60_000 });


  await page.locator("iframe#pact").waitFor({ state: 'visible' });
  const iframe = page.frameLocator("iframe#pact");

  await iframe.locator("#tea").fill("Chamoment", { timeout: 60_000 });
  
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