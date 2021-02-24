const got = require('got');
const { JSDOM } = require('jsdom');

const BASE_URL =
  'https://cw2-massachusetts-production-herokuapp-com.global.ssl.fastly.net/';
const RI_BASE_URL = 'https://www.vaccinateri.org/';

const FIRST_PAGE =
  'clinic/search?location=&search_radius=All&q%5Bvenue_search_name_or_venue_name_i_cont%5D=&q%5Bclinic_date_gteq%5D=&q%5Bvaccinations_name_i_cont%5D=&commit=Search';
const NAV_LINK = 'nav a[href*="/clinic"]';
const CLINIC_DIV = '.justify-between.border-gray-200';
const REGISTRATION_LINK = '[href*="/client/registration"]';
const NAME_PARAGRAPH = 'p.text-xl.font-black';
const ADDRESS_PARAGRAPH = 'p.text-xl.font-black + p';

function getFirstPage(baseUrl) {
  return `${baseUrl}${FIRST_PAGE}`;
}

function getNavHrefs(document, baseUrl) {
  return Array.from(document.querySelectorAll(NAV_LINK))
    .filter((anchor) => anchor.textContent.match(/\d+/))
    .map((anchor) => `${baseUrl}${anchor.href}`);
}

function getName(clinicDiv) {
  const nameParagraph = clinicDiv.querySelector(NAME_PARAGRAPH);
  return nameParagraph && nameParagraph.textContent.trim();
}

function getAddress(clinicDiv) {
  const addressParagraph = clinicDiv.querySelector(ADDRESS_PARAGRAPH);
  return addressParagraph && addressParagraph.textContent.trim();
}

function getAvailableAppointmentCount(clinicDiv) {
  const otherParagraphs = Array.from(clinicDiv.querySelectorAll('p'));
  const availableAppointmentsParagraph = otherParagraphs.find((p) =>
    p.textContent.match(/Available Appointments/)
  );
  if (availableAppointmentsParagraph) {
    return parseInt(
      availableAppointmentsParagraph.textContent.match(/\d+/),
      10
    );
  }

  return 0;
}

function getAdditionalInfo(clinicDiv) {
  const otherParagraphs = Array.from(clinicDiv.querySelectorAll('p'));
  const availableAppointmentsParagraph = otherParagraphs.find((p) =>
    p.textContent.match(/Additional Information/)
  );
  return (
    availableAppointmentsParagraph &&
    availableAppointmentsParagraph.textContent.trim()
  );
}

function getRegistrationHref(clinicDiv, baseUrl) {
  const registrationAnchor = clinicDiv.querySelector(REGISTRATION_LINK);
  return (
    registrationAnchor && `${baseUrl}${registrationAnchor.href.substring(1)}`
  );
}

function getClinics(document, baseUrl) {
  const clinicDivs = Array.from(document.querySelectorAll(CLINIC_DIV));
  return clinicDivs.map((clinicDiv) => ({
    name: getName(clinicDiv),
    address: getAddress(clinicDiv),
    appointments: getAvailableAppointmentCount(clinicDiv),
    registrationHref: getRegistrationHref(clinicDiv, baseUrl),
    additionalInfo: getAdditionalInfo(clinicDiv),
  }));
}

function getAppointments(document, baseUrl) {
  return getClinics(document, baseUrl);
}

function getVaxAppointments(state) {
  const baseUrl = state === 'ri' ? RI_BASE_URL : BASE_URL;

  return got(getFirstPage(baseUrl))
    .then((firstPageResponse) => {
      const firstPageDom = new JSDOM(firstPageResponse.body);

      const hrefs = getNavHrefs(firstPageDom.window.document, baseUrl);

      return Promise.all(hrefs.map((href) => got(href))).then(
        (laterPageResponses) => {
          const laterPageDoms = laterPageResponses.map(
            (response) => new JSDOM(response.body)
          );
          return [firstPageDom, ...laterPageDoms]
            .map((dom) => getAppointments(dom.window.document, baseUrl))
            .flat()
            .sort((a, b) => b.appointments - a.appointments);
        }
      );
    })
    .catch(console.error);
}

module.exports = getVaxAppointments;
