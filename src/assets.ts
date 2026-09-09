export function getAssetUrl(path: string) {
  return import.meta.env.VITE_ASSET_BASEURL + path
}
