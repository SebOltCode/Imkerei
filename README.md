# 🍯 Imkerei-Olthoff – Webseite

Eine warme, moderne Webseite für die kleine, private **Imkerei-Olthoff** aus
Ostfriesland. Gebaut mit **React + Vite**, mit liebevollen Detail-Animationen –
darunter eine 🐝 Biene, die über die Seite fliegt und sich immer mal wieder
niederlässt.

## Schnellstart

```bash
npm install      # Abhängigkeiten installieren
npm run dev      # Entwicklungsserver starten (öffnet http://localhost:5173)
npm run build    # Produktions-Build erzeugen (Ordner /dist)
npm run preview  # Build lokal ansehen
```

## Inhalte später leicht austauschen

Alle austauschbaren Inhalte liegen als **Platzhalter** in `src/data/`:

| Datei                  | Inhalt                                            |
| ---------------------- | ------------------------------------------------- |
| `src/data/products.js` | Honig-Sorten                                       |
| `src/data/gallery.js`  | Fotogalerie (Bilder via `image`-Feld einsetzen)   |
| `src/data/partners.js` | Partnerlinks (Hofläden, Märkte, Vereine …)        |
| `src/data/region.js`   | Ostfriesische Highlights                          |

### Echte Fotos einfügen

1. Bilder z. B. nach `public/galerie/` legen.
2. In `src/data/gallery.js` das Feld `image` auf den Pfad setzen,
   z. B. `image: "/galerie/bienenstock.jpg"`.
3. Solange `image: null` ist, wird automatisch ein schöner Platzhalter gezeigt.

### Partnerlinks setzen

In `src/data/partners.js` einfach `url` von `"#"` auf die echte Adresse ändern.
Optional ein Logo via `logo: "/partner/name.png"` hinterlegen.

## Struktur

```
src/
  data/          → austauschbare Inhalte (Platzhalter)
  components/    → React-Komponenten je Abschnitt
  styles/        → index.css (komplettes Design-System)
  App.jsx        → fügt alle Abschnitte zusammen
```

## Animationen & Barrierefreiheit

- Die fliegende Biene und alle Bewegungen respektieren
  `prefers-reduced-motion`: Wer Bewegung reduziert, sieht eine ruhige Seite
  ohne fliegende Biene.
- Abschnitte blenden beim Scrollen sanft ein (IntersectionObserver).

## Noch zu ergänzen (Platzhalter im Code markiert)

- Echte Adresse, E-Mail, Telefon in `src/components/Contact.jsx`
- Versand-Logik des Kontaktformulars (z. B. Formspree / eigenes Backend)
- Impressum & Datenschutz (Links im Footer)
