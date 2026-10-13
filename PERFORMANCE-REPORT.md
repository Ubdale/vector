# Performance after complex-image fixes

Compared the immediately previous engine against the updated engine on the same 16 generated images and the same UI settings. This includes 9 simpler fixtures and 7 complex fixtures. No real photographs or competitor services were tested.

Fixes: skip aggressive edge recovery on exact-color artwork and pale fills; detect dense local noise and filter it before color quantization; use precise fitting for adaptive illustrations; preserve full opacity with a vector backing region on opaque sources. Transparent sources and background-removal output do not receive an opaque backing.

## Method

RGB error is measured against the input after vector PDF rendering using PDFium, on both white and black backgrounds. Lower is better, and it is not a percentage accuracy score. Path count and file bytes are taken from SVG. Conversion timing is the median of three runs of prepare + trace + SVG generation in Node on this computer; downloads, exports, browser startup, and network are excluded. Times vary with CPU load. The photo-like landscape is procedural artwork.

All 16 fixtures have equal or lower average RGB error (within 0.01) on both backgrounds. Precise fitting increases time and file size on several cases. Noise filtering can remove original texture; the goal is a usable vector approximation. Gradients and transparency are still quantized; small lettering is outlined, not editable text.

| Case | Error before | Error after | Paths before | Paths after | Time before ms | Time after ms |
|---|---:|---:|---:|---:|---:|---:|
| compressed-logo | 2.014 | 2.015 | 4 | 5 | 77 | 93 |
| curved-logo | 0.584 | 0.584 | 4 | 5 | 67 | 81 |
| gradient | 6.601 | 6.395 | 32 | 33 | 39 | 75 |
| hidden-white-transparency | 0.117 | 0.117 | 2 | 2 | 31 | 43 |
| noisy-logo | 3.603 | 3.601 | 4 | 5 | 71 | 65 |
| small-accents | 0.006 | 0.006 | 5 | 6 | 22 | 30 |
| small-text | 1.165 | 1.165 | 52 | 53 | 23 | 25 |
| thin-lines | 0.557 | 0.556 | 4 | 5 | 48 | 56 |
| transparency | 0.277 | 0.277 | 3 | 3 | 32 | 40 |
| city-poster | 1.384 | 1.179 | 1,225 | 1,226 | 212 | 357 |
| dense-technical-diagram | 10.637 | 1.939 | 1,367 | 2,423 | 322 | 649 |
| fine-mandala | 4.982 | 4.641 | 332 | 639 | 230 | 591 |
| overlapping-illustration | 2.905 | 1.347 | 132 | 133 | 166 | 354 |
| overlapping-translucent-shapes | 7.355 | 7.137 | 146 | 146 | 322 | 279 |
| photo-like-landscape | 28.831 | 5.096 | 51,734 | 12,483 | 856 | 731 |
| textured-artwork | 11.509 | 10.901 | 2,615 | 2,616 | 403 | 447 |

Generated charts: performance-chart.png and performance-chart.svg. Raw results: performance-results.csv. Source runner: scripts/quality-benchmark.cjs (previous/revised modes). Rerun both fixture directories with QUALITY_ROOT, render them using scripts/quality-score.py, and run scripts/performance-chart.py.