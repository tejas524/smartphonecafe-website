# Responsive layout review

The October 16, 2026 pass addressed the public site's narrow and intermediate
layouts while retaining the existing page structure and content.

- The utility bar keeps its text on one line at tablet widths. Opening hours
  remain available in the hero, menu and contact sections; the redundant utility
  bar hours appear only when there is enough desktop space.
- The mobile header has larger 44px controls and a compact wordmark below 360px.
- Catalogs use one column below 360px and two above it, with existing three- and
  four-column layouts at larger widths. Card padding, badges and responsive image
  sizes follow those layouts, avoiding clipped discounts and overly narrow text.
- Search/sort controls can shrink within their rows. Mobile form fields render
  at 16px, and shared buttons wrap longer labels within their available width.
  Contact actions stack on phones.
- The menu uses a native modal dialog with background isolation, keyboard focus
  cycling, Escape/backdrop dismissal, focus restoration and an internally
  scrollable panel. It closes and restores page scrolling when resizing into the
  desktop navigation breakpoint.
- Shell gutters, drawer padding and the bottom action-bar spacer account for
  safe-area insets. Focused fields receive scroll clearance from fixed controls.

## Verification

Headless Edge layout checks covered 320, 360, 390, 640, 768, 1024, 1280 and
1440px widths across home, smartphones, accessories, contact and gallery. The
640px check also covers the CSS reflow width of a 1280px window at 200% zoom;
physical browser zoom was not separately tested. Deliberate horizontal card and
repair-selector scrollers were excluded from page-overflow findings.

Interaction checks at 320×740, 390×844, 640×900 and landscape 844×390 verified
keyboard focus cycling, Escape and focus restoration, menu navigation, catalog
search/sort/filter fields, 16px mobile input text, and resizing to desktop while
the drawer was open. A long unbroken heading was also checked at 320px.
No unexpected overflowing controls or JavaScript page errors were found.

Screenshots were reviewed at 320px and 640px. Preview and normal production
builds passed. Real iOS/Android device and physical safe-area behavior still
benefit from a final device check.
