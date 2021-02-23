import 'whatwg-fetch';

export function post(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export function checkStatus(response) {
  if (response && response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response && response.statusText);
  error.response = response;
  throw error;
}

export function parseJson(res) {
  return res.json();
}

export function getVaxAppointments() {
  return post('/vax')
    .then(checkStatus)
    .then(parseJson);
}
