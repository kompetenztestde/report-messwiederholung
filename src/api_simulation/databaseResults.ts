
export function getDatabaseResults(code: string) {
  return fetch(`/temp-results/?code=${code}`)
    .then(response => response.json())
}
