import { getSession } from './session'

const createFetcher = (method) => (url, options) =>
  fetch(url, {
    ...options,
    method,
    headers: {
      ...options.headers,
      authorization: `Bearer ${getSession()}`,
      'content-type': 'application/json'
    }
  }).then((res) => res.json())

export const xfetch = {
  get: createFetcher('GET'),
  post: createFetcher('POST'),
  delete: createFetcher('DELETE')
}
