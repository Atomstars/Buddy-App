import puppeteer from 'puppeteer';

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=400,850']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
    }
  });

  try {
    console.log("Navigating to app...");
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Splash screen click
    await delay(3000);
    try {
      await page.click('.splash-screen');
      await delay(1000);
    } catch (e) {}

    // Click Budget Module
    try {
      const elements = await page.$$('.module-card');
      if (elements.length > 0) {
        await elements[0].click();
        await delay(1500);
      }
    } catch(e) {}

    // Take screenshot of Budget tab
    await page.screenshot({ path: 'budget_tab.png' });
    console.log("Screenshot saved: budget_tab.png");

    // Click History tab
    try {
      const tabs = await page.$$('.budget-tabs button');
      for (const tab of tabs) {
        const text = await page.evaluate(el => el.textContent, tab);
        if (text === 'History') {
          await tab.click();
          await delay(1000);
          break;
        }
      }
    } catch(e) {}

    // Take screenshot of History tab
    await page.screenshot({ path: 'history_tab.png' });
    console.log("Screenshot saved: history_tab.png");

    // Click Category Breakdown
    try {
      await page.click('.category-summary-btn');
      await delay(1000);
      await page.screenshot({ path: 'category_breakdown.png' });
      console.log("Screenshot saved: category_breakdown.png");
    } catch(e) {}

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
    console.log("Done testing.");
  }
})();
