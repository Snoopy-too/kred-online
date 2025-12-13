import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration for KRED Online
 *
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run for
  timeout: 60000, // 1 minute per test

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry flaky tests
  workers: process.env.CI ? 1 : 4, // Parallel execution (4 workers locally)

  // Reporter to use
  reporter: [
    ['html'],
    ['list']
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for the dev server
    baseURL: 'http://localhost:3003/KRED',

    // Collect trace when retrying the failed test
    trace: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test in Firefox
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // Uncomment to test in WebKit (Safari)
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run your local dev server before starting the tests
  // Note: Start dev server manually before running tests: npm run dev
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3003/KRED',
  //   reuseExistingServer: true,
  //   timeout: 120000,
  // },
});
