import puppeteer from 'puppeteer';

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching test browser...");
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
    console.log("Navigating to http://localhost:5174...");
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Dismiss splash if it's there
    await delay(3000);
    try {
      await page.click('.splash-screen');
      console.log("Clicked splash screen");
      await delay(1000);
    } catch (e) {
      console.log("No splash screen or failed clicking it");
    }

    // Now on Auth screen, look for Google button and click it
    console.log("Looking for Google Auth button...");
    const buttons = await page.$$('.auth-social-btn');
    let googleButton = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes("Google")) {
        googleButton = btn;
        break;
      }
    }

    if (googleButton) {
      console.log("Clicking Google button...");
      await googleButton.click();
      
      // Wait for navigation/redirect or error display
      await delay(4000);
      
      console.log("Current page URL:", page.url());
      await page.screenshot({ path: 'google_auth_result.png' });
      console.log("Screenshot saved: google_auth_result.png");
    } else {
      console.log("Could not find Google button!");
    }

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await browser.close();
    console.log("Google auth test complete.");
  }
})();
