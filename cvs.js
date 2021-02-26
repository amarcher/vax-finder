const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
const timeoutWithCachedData = require('./timeout');

const TIMEOUT = 1000;
const PUPPETEER_OPTIONS =
  process.env.NODE_ENV === 'production'
    ? {
        headless: true,
        args: [
          '--incognito',
          '--no-sandbox',
          '--single-process',
          '--no-zygote',
        ],
      }
    : {};

const CVS_URL =
  'https://www.cvs.com/immunizations/covid-19-vaccine?icid=cvs-home-hero1-link2-coronavirus-vaccine#acc_link_content_section_box_251541438_boxpar_accordion_910919113_2';
const REGISTRATION_LINK =
  'https://www.cvs.com/vaccine/intake/store/cvd-schedule?icid=coronavirus-lp-vaccine-sd-statetool';
const MA_DATA_SELECTOR = 'a[data-modal="vaccineinfo-MA"]';
const RI_DATA_SELECTOR = 'a[data-modal="vaccineinfo-RI"]';
const RI_STATUS_SELECTOR =
  '[data-url="/immunizations/covid-19-vaccine.vaccine-status.RI.json?vaccineinfo"]';
const MA_STATUS_SELECTOR =
  '[data-url="/immunizations/covid-19-vaccine.vaccine-status.ma.json?vaccineinfo"]';
const CITY_SELECTOR = 'span.city';
const STATUS_SELECTOR = 'span.status';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

let riResults = [];
let maResults = [];
let isCrawlingRi = false;
let isCrawlingMa = false;

async function getCvsNames(rawHtml) {
  const {
    window: { document },
  } = new JSDOM(`<html><body>${rawHtml}</body></html>`);
  const cities = Array.from(document.querySelectorAll(CITY_SELECTOR)).map(
    (node) => node.textContent.trim()
  );
  const statuses = Array.from(document.querySelectorAll(STATUS_SELECTOR)).map(
    (node) => node.textContent.trim()
  );

  return cities.map((cityName, index) => ({
    name: `CVS in ${capitalizeFirstLetter(cityName)}`,
    address: capitalizeFirstLetter(cityName),
    appointments: statuses[index] === 'Available' ? 1 : 0,
    registrationHref: REGISTRATION_LINK,
    additionalInfo: 'Check CVS website to see qualifications.',
  }));
}

async function fetchCVSData(state) {
  let results = [];
  let browser;
  const covidStatusSelector =
    state === 'ri' ? RI_STATUS_SELECTOR : MA_STATUS_SELECTOR;
  const stateDataSelector =
    state === 'ri' ? RI_DATA_SELECTOR : MA_DATA_SELECTOR;

  if (state === 'ri') {
    if (isCrawlingRi) {
      return Promise.resolve(riResults);
    }

    isCrawlingRi = true;
    console.log('Starting CVS Crawl for RI');
  }

  if (state === 'ma') {
    if (isCrawlingMa) {
      return Promise.resolve(maResults);
    }

    isCrawlingMa = true;
    console.log('Starting CVS Crawl for MA');
  }

  try {
    browser = await puppeteer.launch(PUPPETEER_OPTIONS);
    const page = await browser.newPage();
    await page.goto(CVS_URL);
    await page.click(stateDataSelector);
    await page.waitForSelector(covidStatusSelector, { visible: true });
    const rawHtml = await page.$eval(
      covidStatusSelector,
      (element) => element.innerHTML
    );
    results = await getCvsNames(rawHtml);

    console.log(`Caching ${state} CVS data: ${results.length} result(s)`);

    if (state === 'ri') {
      riResults = results;
      isCrawlingRi = false;
    }

    if (state === 'ma') {
      maResults = results;
      isCrawlingMa = false;
    }

    await browser.close();
  } catch (e) {
    console.log('ERROR');
    console.log(e);

    if (state === 'ri') {
      isCrawlingRi = false;
    }

    if (state === 'ma') {
      isCrawlingMa = false;
    }

    if (browser) {
      await browser.close();
    }
  }

  return results;
}

function getCvsAvailability(state) {
  const cachedData = state === 'ri' ? riResults : maResults;
  return timeoutWithCachedData(fetchCVSData(state), cachedData || [], TIMEOUT);
}

module.exports = getCvsAvailability;
