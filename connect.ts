import puppeteer, { BrowserContext } from 'puppeteer';
import { Browser , Page } from 'puppeteer';


let browser : Browser;
let browserCtx : BrowserContext;
let page : Page;
(async() => {
 const browser = await puppeteer.connect({
    browserWSEndpoint: 'browser endpoint', //the first file will log the url for the browser
 });


 const browserCtx = await browser.createIncognitoBrowserContext();

 const page = await browserCtx.newPage();

//some tricks i found  to make puppeteer undetectable in this link ttps://intoli.com/blog/making-chrome-headless-undetectable/
 await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'navigator', {
        value: new Proxy(navigator, {
          has: (target, key) => (key === 'webdriver' ? false : key in target),
          get: (target, key) =>
            key === 'webdriver'
              ? undefined
              : typeof target[key] === 'function'
              ? target[key].bind(target)
              : target[key]
        })
      })  
  }) 

 await page.goto('https://mail.google.com/mail/' ,  { waitUntil: 'networkidle2' });

})()
