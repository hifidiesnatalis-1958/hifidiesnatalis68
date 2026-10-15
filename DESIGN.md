# Kasundaan: a shared wayang stage

The identity uses the original Figma/PDF artwork: 68 emblem, Arjuna, Semar, gunungan, wordmark, batik, clouds, flourishes, posters and merchandise. No generated illustration or new animation dependency is used. The committed palette and fonts remain: teal #0C575B, burgundy #8C1927, gold #C18A31, sage/cream surfaces, Libre Baskerville and Montserrat.

The official event logo is /assets/kasundaan/logo-68.webp. The logo-physics asset is an atom sticker for merchandise; never use it as an event logo, philosophy image, fallback logo or footer logo. It may remain in merchandise artwork.

## Persistent objects and depth

FestivalJourney keeps ten chapters on one sticky viewport. WayangTheatre mounts eight source cutouts once and interpolates position, scale, rotation and depth between chapter poses. CSS perspective and preserve-3d create layered flat puppets. These are original two-dimensional assets moving in a CSS 3D scene, rather than reconstructed 3D meshes.

The native header logo remains visible in every chapter. The opening artwork has its own upright logo, which fades out as the opening chapter leaves; it does not dock into or replace the header image. Neither logo rotates. Arjuna and Semar keep their complete silhouettes inside desktop side wings, changing positions between chapters; mobile chapters reserve a lower shelf beneath the reading area. Their image children have a subtle CSS sway of plus/minus 0.85 degrees and 1px over 4.8s and 5.6s. Reduced motion disables this sway.

Clouds and the gunungan retain their separate paths. The interface surface changes contour and color. Chapter content uses directional clips with a 64px feather and a shallow perspective turn. A maximum 12 percent opacity dip softens transitions; settled content is fully opaque. Theatre edges fade at the outer rim, the low-opacity batik kelir uses a radial feather, and long panels fade only at overflowing top/bottom scroll edges. Both standard and WebKit masks are cleared for reduced motion. A clear seam prevents glyphs from being painted beneath the moving gunungan.

The puppet cast is behind the content layer. Settled poses leave the reading area clear, and the opening date/countdown strip has an opaque surface. The foreground gunungan exists only during a chapter transition. Header, chapter controls and native dialogs stay above the stage. The schedule uses a central date band with alternating summaries on desktop and a left-side date band on mobile.

## Navigation, interaction and fallback

Native document scroll supplies reversible progress. Wheel and touch events are not intercepted. A passive scroll listener coalesces DOM/SVG work through requestAnimationFrame; React state changes only when the selected chapter changes. Navigation buttons set the document destination immediately and animate the object route for 1100 ms. Only neighboring chapter frames receive compositor hints.

Inner chapter scrollbar indicators are hidden. Native wheel, touch and keyboard scrolling remain available, and overflowing panel edges retain their fades.

Inactive chapters remain mounted but inert and hidden from the accessibility tree, preserving entered form text. Long content remains readable in its panel. Deep links, browser history, resizing and login return paths continue to work. A native poster dialog pauses the object animation; a listener on the dialog itself resumes it even if React removes the dialog before its queued close event fires. No background animation loop runs while the dialog is open.

Reduced motion displays the complete ordinary document and hides the theatre, gunungan and chapter rail. Switching the preference clears temporary chapter transforms and clips.

## Wording and source integrity

Maintained interface copy uses natural Indonesian for headings, invitations, instructions, statuses and errors. Sundanese is limited to the short common greetings "Wilujeng sumping" and "Hatur nuhun". Preserve Harewos as the feature brand, Kasundaan as the theme, official event names, confirmed facts and URLs. Original source artwork and visitor submissions are not translated. Philosophy wording follows the five source PDF panels.

Use direct section labels, including "Rangkaian Acara" and "Lokasi", informed by the previous website while retaining the confirmed 2026 event and Kasundaan theme. Remove decorative advice badges, duplicate event labels and filler taglines. Keep operational instructions, validation, errors, service statuses, consent and official event information.

Confirmed dates, venue, dress code, contacts, destinations and form/action labels are unchanged. log.md remains an untouched record of the earlier copy pass. The language revision changes interface wording only; Apps Script, iframe policy, Vercel configuration and authentication rules are unchanged. Account placeholders and validation guidance use the NPM format without a personal-number example; authentication rules are unchanged.

## Registration

Participants register with their name, eligible NPM, chosen password and confirmation. Login uses NPM/password. One NPM has one account and one raffle ticket. Names are separate from credentials and Harewos remains anonymous. Operators retain their password access. The verified Apps Script v3 supports the name column; this visual/copy revision needs no further Apps Script deployment.
