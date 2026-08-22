const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const studentBtn = btns.find(b => b.innerText.includes('Student'));
    if (studentBtn) studentBtn.click();
  });

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signInBtn = btns.find(b => b.innerText.includes('Sign In'));
    if (signInBtn) signInBtn.click();
  });

  await new Promise(r => setTimeout(r, 5000));

  const errorText = await page.evaluate(() => {
    const errorEl = document.querySelector('.text-red-400');
    return errorEl ? errorEl.innerText : 'No error found';
  });

  console.log('Error shown on screen:', errorText);
  await browser.close();
})();
