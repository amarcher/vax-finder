const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

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

function shouldRefetch() {
  return true; // TODO: do this less often
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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
    appointments: statuses[index] === 'Available' ? 'Some' : 0,
    registrationHref: REGISTRATION_LINK,
    additionalInfo: 'Check CVS website to see qualifications.',
  }));
}

async function fetchCVSData(stateDataSelector) {
  let results = [];
  let browser;
  const covidStatusSelector =
    stateDataSelector === RI_DATA_SELECTOR
      ? RI_STATUS_SELECTOR
      : MA_STATUS_SELECTOR;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(CVS_URL);
    await page.click(stateDataSelector);
    await page.waitForSelector(covidStatusSelector, { visible: true });
    const rawHtml = await page.$eval(
      covidStatusSelector,
      (element) => element.innerHTML
    );
    results = getCvsNames(rawHtml);
    await browser.close();
  } catch (e) {
    if (browser) {
      await browser.close();
    }
  }

  return results;
}

function getCvsAvailability(state) {
  const stateDataSelector =
    state === 'ri' ? RI_DATA_SELECTOR : MA_DATA_SELECTOR;
  if (shouldRefetch()) {
    return fetchCVSData(stateDataSelector);
  }
  return Promise.resolve([]);
}

module.exports = getCvsAvailability;
