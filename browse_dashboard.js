import puppeteer from 'puppeteer';

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching test browser to browse dashboard...");
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 800 });

  page.on('console', msg => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });

  try {
    console.log("Navigating to http://localhost:5176...");
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Dismiss splash screen if visible
    await delay(3000);
    try {
      await page.click('.splash-screen');
      console.log("Clicked splash screen.");
      await delay(1000);
    } catch (e) {
      console.log("No splash screen to click.");
    }

    // Find and click the Dev Guest bypass button
    console.log("Looking for Developer Guest Bypass button...");
    const buttons = await page.$$('button');
    let devButton = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes("Dev Guest")) {
        devButton = btn;
        break;
      }
    }

    if (devButton) {
      console.log("Clicking Developer Guest Bypass button...");
      await devButton.click();
      
      // Wait for the app page transition and dashboard render
      await delay(3000);
      
      console.log("Logged in successfully! Current page URL:", page.url());
      await page.screenshot({ path: 'dashboard_view.png' });
      console.log("Screenshot saved: dashboard_view.png");
    } else {
      console.log("Could not find the Developer Guest Bypass button!");
    }

  } catch (error) {
    console.error("Browsing session failed:", error);
  } finally {
    await browser.close();
    console.log("Browsing test complete.");
  }
})();
