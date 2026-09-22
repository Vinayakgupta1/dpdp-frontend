import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.CI
      ? "http://localhost:3000"
      : "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "off",
  },
  projects: [
    {
      name: "mobile-375",
      use: { ...devices["iPhone 14"], viewport: { width: 375, height: 812 } },
    },
    {
      name: "tablet-768",
      use: { ...devices["iPad Mini"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "desktop-1280",
      use: { viewport: { width: 1280, height: 800 } },
    },
    {
      name: "wide-1920",
      use: { viewport: { width: 1920, height: 1080 } },
    },
  ],
});
