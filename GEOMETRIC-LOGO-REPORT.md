# Smooth geometric-logo correction — 21 October 2026

The supplied Summit PDF contained vector paths, but those paths followed pixel steps. There were no embedded raster images. The problem was incorrect contour reconstruction, rather than a PDF export wrapping a bitmap.

## Change

A separate automatic flat-logo route now distinguishes dominant solid inks from antialiased edge mixtures. Eligible simple opaque geometry gets a native Inkvec candidate, normalized to editable curves. Source-color agreement, substantial component overlap, disconnected marks and holes are checked before selection. Rare flat colors and isolated accents retain the precision route. Custom controls, manual palettes, transparency and detailed line art retain their existing behavior. The optional engine can fail safely without losing the initial trace.

## Measured results

| Test | Before | After |
|---|---:|---:|
| Actual 400px browser Summit sample | 1,048 paths | 5 paths |
| Independent Summit vector fixture, 4× RGB MAE (0–255) | 0.30688 | 0.02576 |
| Independent Summit edge displacement P95, source px | 0.707 | 0.250 |
| Summit foreground components / holes | 2 / 1 | 2 / 1 |
| Tiny-accent ring, diagram, mandala, rectangle, irregular logo | Existing result | Byte-identical |

The independent Summit result has **91.6% less RGB error**, not 91.6% overall accuracy. Its reference is an original scalable SVG rendered at 4×, rather than an enlarged input bitmap. The actual browser input differs slightly from that independent rendering, so its path count differs too. A raw native candidate removed colored dots in a negative control; the production gate correctly rejects that candidate.

69 backend tests pass, including missing-engine fallback, custom-control preservation, lost small component rejection and filled-hole rejection. Frontend export, stress and worker tests pass, and the Next.js production build succeeds. Corrected PDF validation finds five path objects and zero raster images.

Local artifacts: test-results/summit-inspection/summit-corrected.pdf and corrected.svg. Independent audit: test-results/geometric-routing/REPORT.md and metrics.json. Generated test artifacts are ignored by Git. No neural model was trained. This targeted pass establishes a substantial Summit improvement; it does not establish arbitrary-photo perfection or paid-tool parity.


## Hosted verification

Both repositories were pushed. Vercel production revision f901232 is Ready. Render revision 51a4167 required a clean build redeploy: the initial deployment badge pointed to the new commit while public requests still served the older process. After rebuilding, the public health response exposes the geometric mode and actual Summit requests return `inkvec-geometric`, five paths, 7,015 SVG bytes in 16.69 seconds including upload/network (single request, free Render CPU). The colored-accent holdout returns its 629-path precision trace in 4.79 seconds. Both responses permit the production Vercel origin through CORS. The supplied corrected PDF is exported from the hosted Summit SVG.


The live browser independently traced the built-in Summit sample in 15.0 seconds and displayed “Geometric artwork / 5 paths”. Its downloaded PDF (summit-logo (2).pdf, 5,689 bytes) was reopened with PDFium: five objects, zero raster images. A verified copy is test-results/summit-inspection/summit-browser-download.pdf; the live comparison screenshot is live-summit-comparison.png in that directory. The browser download event observer timed out, but the completed file on disk and PDF contents confirm export succeeded.
