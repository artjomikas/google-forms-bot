const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const fetch = require("isomorphic-fetch");
let producttype;

function logRequest(interceptedRequest) { }
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
puppeteer.use(StealthPlugin());
puppeteer.use(require("puppeteer-extra-plugin-anonymize-ua")());
puppeteer.use(
  require("puppeteer-extra-plugin-user-preferences")({
    userPrefs: {
      webkit: {
        webprefs: {
          default_font_size: 16,
        },
      },
    },
  })
);

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  } catch (error) {
    console.error("Unable to fetch data:", error);
  }
}

function fetchNames(nameType) {
  return fetchData(`https://www.randomlists.com/data/names-${nameType}.json`);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function generateName(gender) {
  try {
    const response = await Promise.all([
      fetchNames(gender || pickRandom(["male", "female"])),
      fetchNames("surnames"),
    ]);

    const [firstNames, lastNames] = response;

    const firstName = pickRandom(firstNames.data);
    const lastName = pickRandom(lastNames.data);

    return `${firstName} ${lastName}`;
  } catch (error) {
    console.error("Unable to generate name:", error);
  }
}


(async () => {
  var fs = require("fs");
  var emails = fs.readFileSync("data/emails.txt").toString().split("\n");
  var passwords = fs
    .readFileSync("data/passwords.txt")
    .toString()
    .split("\n");
  var gmails = fs
    .readFileSync("data/gmails.txt")
    .toString()
    .split("\n");
  var wallets = fs
    .readFileSync("data/wallets.txt")
    .toString()
    .split("\n");
  var twitters = fs
    .readFileSync("data/twitters.txt")
    .toString()
    .split("\n");
  console.log("COUNT OF EMAILS: " + gmails.length);
  for (let i = 0; i < gmails.length; i++) {

    let browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      ignoreDefaultArgs: ["--disable-extensions"],
      args: ["--start-maximized", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();
    page.on("request", logRequest);
    page.setDefaultNavigationTimeout(10000)
    try {
      // NOTE ПЕРЕХОД НА ФОРМУ
      await page.goto(
        "https://docs.google.com/forms/d/e/1FAIpQLScidXc_AVMEohgDoJhIGNPw_i3eVulHQ0d_phyBi02TG_URpQ/viewform"
      );

      var clickButtonOk =
        "body > div:nth-child(12) > div:nth-child(1) > div:nth-child(2) > div:nth-child(4) > div:nth-child(2) > span:nth-child(3) > span:nth-child(1)";
      await page.waitForSelector(clickButtonOk);
      await page.click(clickButtonOk);


      // NOTE ВХОД НА ПОЧТУ
      await navigationPromise;
      await page.waitForSelector('input[type="email"]');
      await page.click('input[type="email"]');
      await navigationPromise;
      await page.type('input[type="email"]', gmails[i]);
      await page.waitForSelector("#identifierNext");
      await page.click("#identifierNext");
      await page.waitForSelector('input[type="password"]');
      await page.click('input[type="email"]');
      await page.waitFor(1500);
      await page.type('input[type="password"]', passwords[i]);
      await page.waitForSelector("#passwordNext");
      await page.click("#passwordNext");
      await navigationPromise;
      await page.waitFor(1000);

      try {
        await page.waitForSelector("p:nth-child(2)", { timeout: 1700 })
        producttype = await page.evaluate(el => el.innerText, await page.$('p:nth-child(2)'))
      } catch (error) {
      }

      if (producttype != null) {
        await browser.close();
      }

      var name_fill =
        "div[class='freebirdFormviewerViewFormContent'] div:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(2) div:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) input:nth-child(1)";

      var email =
        "div[role='list'] div:nth-child(2) div:nth-child(1) div:nth-child(1) div:nth-child(2) div:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) input:nth-child(1)";

      var twitter =
        "div:nth-child(3) div:nth-child(1) div:nth-child(1) div:nth-child(2) div:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) input:nth-child(1)";

      var wallet =
        "div:nth-child(4) div:nth-child(1) div:nth-child(1) div:nth-child(2) div:nth-child(1) div:nth-child(1) div:nth-child(1) div:nth-child(1) input:nth-child(1)";

      var button =
        "div[class='freebirdFormviewerViewNavigationLeftButtons'] span[class='appsMaterialWizButtonPaperbuttonContent exportButtonContent'] span:nth-child(1)";

      var name = await generateName("male");

      // NOTE NAME
      await page.waitForSelector(name_fill, { timeout: 15000 });
      await page.waitFor(400);
      await page.click(name_fill);
      await page.type(name_fill, name);

      // NOTE WALLET
      await page.waitFor(400);
      await page.waitForSelector(wallet);
      await page.click(wallet);
      await page.type(wallet, wallets[i].replace(/\s+/g, " ").trim());

      // NOTE EMAIL
      await page.waitFor(400);
      await page.waitForSelector(email);
      await page.click(email);
      await page.type(email, emails[i].replace(/\s+/g, " ").trim());

      // NOTE TWITTER
      await page.waitFor(400);
      await page.waitForSelector(twitter);
      await page.click(twitter);
      await page.type(twitter, twitters[i].replace(/\s+/g, " ").trim());
      await page.click(button);
      await page.waitFor(1000);

      page.off("request", logRequest);
      await browser.close();
    }
    catch (error) {
      if (producttype == null) {
        console.error("PROBLEM WITH EMAIL: ", gmails[i]);
      }
      page.off("request", logRequest);
      await browser.close();
    }
  }

  console.log(browser.wsEndpoint());
})().catch((error) => {
  console.error(error.message);
});
