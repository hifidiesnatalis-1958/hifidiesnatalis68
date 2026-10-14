# Kasundaan · Dies Natalis HIFI ke-68

The website uses only original artwork from the user's Figma file and the 81-page `Dies NUT!.pdf`. No generated illustrations, stock artwork, replacement logo or invented cultural motif is installed.

The user supplied three cultural website references and explicitly requested more rounded corners and morphing while scrolling. Their examples inform the spacious editorial layout, asymmetric composition and soft panels. The cultural identity comes entirely from the existing Sundanese assets.

## Redesign decisions

The previous version used a dense patterned opening, small-radius controls and full-width dark sections. The new opening pairs original wayang and the 68 emblem with a large, left-aligned welcome. Light sage, terracotta and cream panels create breathing room. Controls use 16px corners, cards use 24–32px, and scene panels use 30–44px. Navigation and buttons use pill shapes. These larger radii follow the user's explicit preference. Design variance: 8; motion: 8 across the page; density: 4.

The palette retains deep teal **#0C575B**, burgundy **#8C1927**, gold **#C18A31** and the untouched multicolor source art. The canvas is **#F4F1E8** with **#FFFCF6** surfaces. Local Libre Baskerville carries headings and Montserrat carries controls and body text. The native multicolor Dies Natalis wordmark remains an image; a semantic H1 identifies the celebration.

## Source artwork

`public/assets/kasundaan/manifest.json` records dimensions, PDF page, image xref and byte count for 32 web derivatives. This revision adds original Arjuna and Semar images from page 71, original cloud images from page 7, and the original blue gunungan vector from page 8. The vector export removes only the two full-page white background rectangles and crops the view box around the existing artwork. No decorative path is redrawn. Raster exports retain the source alpha masks and natural proportions.

The existing 68, physics and kujang logos, native wordmark, four floral corners, batik, flourishes, merchandise photos and source posters are preserved. The full 81-page vector archive stays outside the web bundle.

## Scroll scene

`CultureHero.jsx` is an isolated, memoized client leaf. `app/culture.css` uses a named CSS view timeline on the hero and a sticky stage. Native scroll progress changes a plain backing shape's contours and color, scales/translates the original emblem, fades the original wayang and hands off the welcome to the theme. Scrolling upward reverses the scene. Original image pixels and vector paths are unchanged.

There are no scroll listeners, scroll React state, wheel interception, animation libraries or new dependencies. Source images reserve dimensions. A complete compact static hero appears when `prefers-reduced-motion: reduce` is active or CSS scroll timelines are unsupported. Controls and anchors remain available without the effect.

## Preserved behavior

All existing navigation, anchor IDs, forms, nickname/password login, cookie sessions, anonymous Harewos, moderation, profanity screening, raffle login requirement and operator presentation controls remain. Poster dialogs still support download, Escape and restored keyboard focus. Theme exploration uses the original logo variants. Merchandise uses the actual product artwork.

The confirmed dates remain **17 October 2026** for online activities and **24 October 2026 at 09:00 WIB** for the main celebration. Older draft posters do not override these dates. The confirmed venue is Auditorium Bale Santika, Universitas Padjadjaran. Dress code: Tradisional Sunda (Kebaya, Pangsi, Batik Sunda). The public anonymous feature is named Harewos; existing API and Sheet identifiers stay compatible. Apps Script, spreadsheet configuration and secrets are unchanged.

## Verification

Browser checks cover responsive widths 1440, 768, 390 and 320px, source image loading, reversible desktop/mobile morphing, reduced motion, anchor navigation, native poster dialogs, theme exploration, anonymous submission, login, raffle privacy and operator controls. The production build is verified separately.

The morph sequence spans 320svh on desktop and 300svh on mobile, about 2.5 times the previous scroll journey. Reduced motion remains a compact static scene.


## Full-page morph journey

The scroll story now continues through every section and reverses when scrolling back upward. A fixed decorative landscape changes flat contours, color and position across the entire document. Its only texture is the original PDF floral batik; there are no new illustrations, synthetic cultural motifs, canvas effects or third-party dependencies.

Each chapter also responds to its own viewport progress: event rows and date shapes, poster frame, theme emblem, Harewos wall/cards, raffle ticket, merchandise frames/photos, dress code, message form surface, map frame and footer. Native CSS `scroll(root block)` drives the global layer; anonymous `view(block)` timelines drive local geometry. Native image proportions and vector paths stay intact. Text, input fields, checkbox controls and map contents do not transform. The form's value and layout survive a full scroll round trip.

Only the hero keeps its existing 320svh/300svh scroll length. Other sections keep their normal document height and anchor navigation. The background is noninteractive and isolated behind the page. Reduced motion and browsers without scroll timelines receive the complete static layout. Backend, Vercel configuration, confirmed content, source assets and account/operator behavior are preserved.
