import type { ConstructorParams } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

dotenv.config();

const StagehandConfig: ConstructorParams = {
  verbose: 1,
  domSettleTimeoutMs: 60_000,


  // LLM configuration
  modelName: "anthropic/claude-3-7-sonnet-20250219",
  modelClientOptions: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },

  // Browser configuration
  env: "LOCAL",
  apiKey: process.env.BROWSERBASE_API_KEY,
  projectId: process.env.BROWSERBASE_PROJECT_ID,
  browserbaseSessionID: undefined,
  browserbaseSessionCreateParams: {
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      blockAds: true,
      viewport: {
        width: 1024,
        height: 768,
      },
    },
  },
  localBrowserLaunchOptions: {
    viewport: {
      width: 1024,
      height: 768,
    },
    // recordVideo: {
    //   dir: './videos/', // Video will be saved to this folder
    //   size: { width: 1024, height: 768 }, // Optional: match viewport size
    // },
  }
}  

export default StagehandConfig;
