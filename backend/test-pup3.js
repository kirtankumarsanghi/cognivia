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
  
  await page.screenshot({ path: 'login-after-click.png' });
  
  const html = await page.content();
  console.log('Page HTML length:', html.length);
  const errorEl = await page.$('.text-red-400');
  if (errorEl) {
    console.log('Error found:', await page.evaluate(el => el.innerText, errorEl));
  } else {
    console.log('No error class found');
  }

  await browser.close();
})();
