// Baut einen korrekten Pfad zu Dateien im /public-Ordner – egal ob die
// Seite lokal unter "/" oder auf GitHub Pages unter "/Imkerei/" läuft.
//
// Beispiel:  asset('/partner/logo.avif')  ->  '/Imkerei/partner/logo.avif'
// Externe URLs (http/https) werden unverändert zurückgegeben.
export function asset(path) {
  if (!path) return path
  if (/^https?:\/\//i.test(path)) return path
  // import.meta.env.BASE_URL endet immer mit "/" (z. B. "/Imkerei/")
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '')
}
