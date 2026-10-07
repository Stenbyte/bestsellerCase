export function assetUrl(path: string) {
  return `/assets/${path.split('/').map(encodeURIComponent).join('/')}`
}

export function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
