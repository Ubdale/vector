# Workshop redesign and gradient pass - October 17, 2026

The frontend now has a coherent print-workshop design: paper backgrounds, dark workbench chrome, vermilion actions, lilac curve accents, and an interactive illustrative Bezier playground. Motion powers the curve interaction; Lucide and Sonner handle icons and notifications. There is no WebGL scene or continuous animation loop. Reduced motion is respected. The playground is explicitly illustrative and does not impersonate the user's tracing result.

## Tracing benchmark

Same four complex fixtures as the preceding hybrid-engine pass, plus three targeted probes. Error is mean absolute RGB difference on white, on a 0-255 channel scale, after rendering the actual vector PDF. It is not an accuracy percentage. Local CPU time is the median of three runs and must not be compared directly with hosted request timings.

| Image | Previous error | New error | Paths | Gradients | Local CPU seconds |
|---|---:|---:|---:|---:|---:|
| Dragon | 7.705 | 6.992 | 206 | 0 | 0.312 |
| Mandala | 2.141 | 2.141 | 430 | 0 | 2.242 |
| Dense diagram | 0.145 | 0.145 | 11205 | 0 | 2.610 |
| Photo | 9.830 | 9.398 | 1519 | 4 | 1.892 |
| Pure linear gradient | - | 0.332 | 1 | 1 | 0.003 |
| Transparency probe | - | 0.037 | 2 | 0 | 0.084 |
| Thin-detail probe | - | 0.053 | 1344 | 0 | 0.348 |

Visible-region fitting excludes foreground paths before sampling background colors. It uses better measured solid colors and accepts a two-stop linear gradient only when the actual rounded gradient stops reduce error sufficiently. The whole-frame gradient shortcut checks every original pixel, so small text or accents cannot disappear through a sampled fit. A narrow high-contrast one-pixel accent safeguard protects isolated highlights on otherwise flat neighborhoods. Transparency, manual palettes, sketches, and fine diagrams retain their preservation routes.

Windows cumulative peak process working set was about 77 MB across these fixtures; this is not a Render memory measurement or a worst-case guarantee. Existing smooth path geometry is retained. Texture, nonlinear illumination, lettering and complex photographic shading remain limitations. No neural model was trained.

## Verification

- Frontend regression/export suite and Next.js production build pass.
- Twenty backend tests pass, including gradients, occlusion, transparency, small details, narrow images, and malformed settings.
- Browser checks cover desktop and 390-pixel mobile layouts with no horizontal overflow; curve slider/node toggle; shortcut dialog; image conversion; PNG/PDF downloads; gradient selection, solid recolor and undo.
- PNG export no longer duplicates SVG width/height attributes. Downloaded PNGs were reopened successfully.
- PDF gradients remain editable axial shadings, with clipped holes and isolated paint state; rendered color, clipping, and alpha checks pass. PDF offsets are checked.
- EPS emits Level 3 shading and is structurally tested, but has not been independently rasterized in this pass. Its existing white-background opacity approximation can differ on overlapping translucent shapes. Use SVG/PDF for transparency.
- DXF continues to export outlines only, with tested curve subdivision tolerance; it does not carry fills or gradients.

The frontend reports whether the effective route preserved diagram details, used smooth artwork tracing, or recognized a pure gradient. Gradients can be disabled in advanced settings. Recoloring a selected gradient explicitly replaces it with a solid fill; undo restores the original paint.

Hosted measurements are recorded after deployment below; local timings alone do not establish production reliability or commercial readiness.

## Hosted verification

Render deployed backend commit 094448f and reports `gradient_mode: conservative-linear-v1`. The compatible workshop frontend was deployed first. All seven sequential direct API requests returned HTTP 200 with the expected production CORS origin:

| Image | End-to-end seconds | Effective route |
|---|---:|---|
| Dragon | 4.77 | Rust splines |
| Mandala | 16.33 | OpenCV precision |
| Dense diagram | 17.21 | OpenCV precision |
| Photo | 13.43 | Rust splines with four gradients |
| Pure linear gradient | 0.67 | One analytic gradient path |
| Transparency probe | 1.51 | OpenCV alpha preservation |
| Thin-detail probe | 2.73 | OpenCV precision |

These are single measurements from the test machine to the free Render instance, including transport. The added color-fitting stage increases processing cost for shaded artwork; this pass improves fidelity rather than claiming a general speedup. Rendered hosted dragon and photo output reproduce the local errors of 6.992 and 9.398.

The actual production frontend gradient trace completed in 1.0 second and downloaded vector PDF and PNG. One initial browser transport request failed and succeeded on retry; no new instance failure appeared in Render Events. The worker now retries a transport failure once, never retries an HTTP error automatically, and reports an actionable message if the retry fails. Regression tests cover recovery, bounded retry count, busy responses and incomplete vectors. This does not eliminate cold starts or establish a long-term availability guarantee.

The final UI also removes an obsolete disabled edge-recovery control, labels minimum cleanup honestly, and keeps solid recoloring from introducing a stroke that would differ between SVG and PDF.
