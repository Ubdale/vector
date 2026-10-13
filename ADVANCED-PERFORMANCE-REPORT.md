# Advanced tracing improvements and tests

26 paired cases: 9 simple fixtures, 7 complex procedural images, and 10 new advanced cases. Three advanced cases are real photographs from scikit-image (astronaut, Chelsea, coffee); see IMAGE-SOURCES.md for attribution, source URLs, and preparation. All photographs were proportionally limited to 512 pixels on the longest edge. Generated cases reach 1024×640.

Compared against the exact engine from the previous completed turn, retained in scripts/quality-round2.cjs. Current default controls were kept the same. Adaptive mode may now choose 64 colors for color-rich images instead of 32; these results assess the whole pipeline, not a single algorithm at identical palette size.

## Changes

- Real artwork classification flag replaces a name that collided with the built-in Array.flat method. Non-logo inputs no longer inherit logo-only recovery by accident.
- Small and narrow regions retain their actual boundary coverage.
- Exact-color line art uses original grid boundaries and tighter fitting; Smooth mode retains the approximation option.
- Color-rich illustrations automatically receive up to 64 colors. Manual color mode remains available.
- Semi-transparent colors are assigned using their appearance over light and dark backgrounds.
- Large SVGs use one delegated selection handler instead of a listener per path.

## Measurement

SVG vector paths are exported to PDF and rasterized with PDFium at source dimensions. Errors are mean absolute RGB differences on white and black backgrounds, not percentage accuracy scores. Timing is the median of three local Node runs for preparation, conversion, and SVG generation. Timing excludes the browser preview, exporting, downloads, and network. Runs were not performed on an otherwise idle, isolated machine, so small timing differences should not be treated as definitive speed gains.

All 26 cases show no regression above 0.01 in mean RGB error on either background. This does not guarantee improvement at every pixel or in every perceptual metric. Photos remain vector approximations: fur, faces, fine texture, smooth gradients, and feathered alpha still show simplification or banding. Higher fidelity often costs more paths, bytes, and time.

| Case | Error before | Error after | Paths before | Paths after |
|---|---:|---:|---:|---:|
| compressed-logo | 2.015 | 2.015 | 5 | 5 |
| curved-logo | 0.584 | 0.584 | 5 | 5 |
| gradient | 6.395 | 6.395 | 33 | 33 |
| hidden-white-transparency | 0.117 | 0.004 | 2 | 2 |
| noisy-logo | 3.601 | 3.601 | 5 | 5 |
| small-accents | 0.006 | 0.0 | 6 | 6 |
| small-text | 1.165 | 1.165 | 53 | 53 |
| thin-lines | 0.556 | 0.556 | 5 | 5 |
| transparency | 0.277 | 0.119 | 3 | 3 |
| city-poster | 1.179 | 1.157 | 1,226 | 1,226 |
| dense-technical-diagram | 1.939 | 1.063 | 2,423 | 4,679 |
| fine-mandala | 4.641 | 0.286 | 639 | 639 |
| overlapping-illustration | 1.347 | 1.297 | 133 | 133 |
| overlapping-translucent-shapes | 7.137 | 4.44 | 146 | 193 |
| photo-like-landscape | 5.096 | 4.652 | 12,483 | 12,353 |
| textured-artwork | 10.901 | 8.869 | 2,616 | 4,231 |
| chromatic-woven-pattern | 13.348 | 10.243 | 322 | 598 |
| damaged-jpeg-painting | 2.903 | 2.402 | 5,982 | 11,268 |
| dense-engraving | 25.396 | 3.655 | 3,140 | 3,140 |
| feathered-alpha-gradient | 3.342 | 2.13 | 35 | 105 |
| large-cad-grid | 2.938 | 0.156 | 5,595 | 5,595 |
| microtext-pastel-circuit | 4.545 | 2.667 | 18,279 | 19,194 |
| photo-astronaut | 10.057 | 8.21 | 14,581 | 25,182 |
| photo-chelsea | 5.151 | 3.932 | 16,251 | 24,321 |
| photo-coffee | 11.467 | 7.529 | 19,360 | 29,955 |
| six-hundred-colored-shapes | 14.239 | 11.285 | 601 | 628 |

Photograph sources: https://scikit-image.org/docs/stable/api/skimage.data

SHA-256 of downloaded originals:
- astronaut.png: 88431cd9653ccd539741b555fb0a46b61558b301d4110412b5bc28b5e3ea6cb5
- chelsea.png: 596aa1e7cb875eb79f437e310381d26b338a81c2da23439704a73c4651e8c4bb
- coffee.png: cc02f8ca188b167c775a7101b5d767d1e71792cf762c33d6fa15a4599b5a8de7

Reproduction: run scripts/advanced-fixtures.py; set QUALITY_ROOT=tmp/advanced; run scripts/quality-benchmark.cjs round2 and round3-current; run scripts/quality-score.py for each variant with tmp/advanced. Repeat those two variant runs for tmp/quality and tmp/complex, then run scripts/advanced-report.py. See earlier fixture scripts for generation. Python requires Pillow, pypdfium2, numpy, and matplotlib.