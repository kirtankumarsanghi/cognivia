const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText)
  );

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

  console.log('Clicking student demo button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const studentBtn = btns.find(b => b.innerText.includes('Student'));
    if (studentBtn) studentBtn.click();
  });

  console.log('Clicking Sign In...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signInBtn = btns.find(b => b.innerText.includes('Sign In'));
    if (signInBtn) signInBtn.click();
  });

  console.log('Waiting for navigation or timeout...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('Current URL:', page.url());

  const text = await page.evaluate(() => document.querySelector('#login-submit')?.innerText);
  console.log('Submit button text:', text);

  await browser.close();
})();
