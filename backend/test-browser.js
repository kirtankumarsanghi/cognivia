const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Navigating...');
  await page.goto('http://localhost:5173/login');
  
  console.log('Clicking demo student...');
  await page.click('button:has-text("Student")');
  
  console.log('Clicking Sign In...');
  await page.click('button:has-text("Sign In")');
  
  console.log('Waiting for network idle...');
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(e => console.log('Timeout network idle'));
  
  console.log('Checking URL...');
  console.log('Current URL:', page.url());
  
  await browser.close();
})();
