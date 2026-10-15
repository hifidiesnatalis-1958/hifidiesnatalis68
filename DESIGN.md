# Kasundaan: one full-screen festival stage

The identity comes exclusively from the user's Figma/PDF artwork: original 68 emblem, wayang, gunungan, native wordmark, batik, clouds, flourishes, source posters and merchandise. No generated illustration, stock art, cultural drawing or animation dependency is introduced. The existing palette and fonts remain: teal #0C575B, burgundy #8C1927, gold #C18A31, sage/cream surfaces, Libre Baskerville and Montserrat.

## Layout correction

FestivalJourney.jsx replaces the long sequence of independent moving sections with one sticky viewport stage. Every chapter occupies the same screen area beneath the existing header. Native document scroll supplies progress; adjacent scenes dissolve and gently scale in place while one compatible SVG surface interpolates its contour and color. Wheel and touch events are not intercepted. Keyboard-accessible chapter navigation and original header links also move to a scene; deep links, browser history and login return paths remain supported.

The previous hero's separate sticky stage and per-section animation are disabled inside the immersive experience. Controls, fields and source images keep their normal geometry. Only the active scene accepts pointer and keyboard input; inactive scenes are inert and removed from the accessibility tree. Scenes remain mounted, so text entered in Harewos survives navigation.

Long content is readable inside the viewport panel. The surface does not clip form controls or source artwork. Mobile date/countdown controls share one compact row. The header and chapter rail remain fixed. Document scroll anchoring is disabled for the story because changes to filters, authentication and dialogs must not reset the selected scene. Native source dialogs freeze scene progress and restore the original scroll position and trigger focus when closed.

## Motion and fallback

One passive scroll listener coalesces work through requestAnimationFrame. Pixel progress updates SVG/DOM styles; React state changes only when the selected scene changes. The compatible path coordinates describe a plain interface surface, not new cultural imagery. Source art is never distorted. Reduced motion receives the full normal document, without the pinned sequence; switching that preference at runtime clears the temporary styles.

## Preserved content and assets

log.md, content/site.json, CultureHero.jsx, Presentation.jsx, next.config.mjs and vercel.json remain byte-identical to the start of this correction. Confirmed dates, venue, dress code, contacts and approved wording are kept. The five philosophy panels retain their native artwork and source-poster dialogs. The catalogue retains actual product imagery and ordering links.

## Corrected registration

Participants enter their name, NPM and chosen password plus confirmation. Login uses NPM/password. One eligible NPM has one account and one raffle ticket. Names are stored separately in the added Accounts.name column and appear in the account and ticket. Harewos remains anonymous. The old token receipt and recovery endpoint are removed. Operators retain their existing password login. Apps Script v3 and setupDiesnat() are required to enable saved names; the migration appends a header without deleting existing account values.
