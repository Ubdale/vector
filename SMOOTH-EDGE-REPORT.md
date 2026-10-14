# Smooth-edge validation

34 bitmap inputs: the existing 26 cases (including 3 real photographs), plus 8 new bitmap stress images rendered from original vector contours. In addition, 8 direct geometry tests verify holes, winding, displacement bounds, thin paths, and export generation.

The reference is the engine before smooth finish. Smooth finish rounds supported contours, fits eligible ellipses, preserves tiny or thin contours, and limits per-contour area change to 1.5% (or 1 pixel squared). Faithful detail remains available. Sample buttons now wait for application initialization before accepting input.

## Validation

npm test passes, including tangent-continuous joins, ellipse fitting, tiny-path preservation, and 8 structural stress cases. PDFs are rendered using PDFium for inspection; EPS and DXF generation and structure are checked. Illustrator itself was not tested.

Mean pixel error measures resemblance to the input, not smoothness. Rounding intentionally changes corners, so some images have higher pixel error despite smoother edges. This is not a 100% accuracy claim. Photos and small lettering remain approximate; smooth output can be larger.

| Image | Pixel error before | Pixel error smooth | SVG KB before | SVG KB smooth |
|---|---:|---:|---:|---:|
| compressed-logo | 2.015 | 2.004 | 6.4 | 19.3 |
| curved-logo | 0.584 | 0.566 | 7.5 | 22.9 |
| gradient | 6.395 | 6.398 | 11.5 | 30.8 |
| hidden-white-transparency | 0.004 | 0.009 | 3.4 | 7.0 |
| noisy-logo | 3.601 | 3.595 | 8.7 | 27.3 |
| small-accents | 0.0 | 0.005 | 1.1 | 1.6 |
| small-text | 1.165 | 1.297 | 18.8 | 21.2 |
| thin-lines | 0.556 | 0.576 | 8.4 | 8.7 |
| transparency | 0.119 | 0.124 | 6.0 | 12.8 |
| city-poster | 1.157 | 1.199 | 277.5 | 521.9 |
| dense-technical-diagram | 1.063 | 1.066 | 844.8 | 921.0 |
| fine-mandala | 0.286 | 0.286 | 824.5 | 1317.7 |
| overlapping-illustration | 1.297 | 1.356 | 216.1 | 439.6 |
| overlapping-translucent-shapes | 4.44 | 4.465 | 108.1 | 309.1 |
| photo-like-landscape | 4.652 | 4.695 | 2750.3 | 3185.8 |
| textured-artwork | 8.869 | 9.085 | 1280.6 | 2389.8 |
| chromatic-woven-pattern | 10.243 | 11.032 | 894.5 | 3086.9 |
| damaged-jpeg-painting | 2.402 | 2.442 | 2093.1 | 2453.0 |
| dense-engraving | 3.655 | 3.655 | 4258.2 | 4501.8 |
| feathered-alpha-gradient | 2.13 | 2.146 | 143.8 | 493.9 |
| large-cad-grid | 0.156 | 0.156 | 1396.8 | 1963.4 |
| microtext-pastel-circuit | 2.667 | 2.7 | 3191.7 | 3637.9 |
| photo-astronaut | 8.21 | 8.453 | 4687.5 | 5422.7 |
| photo-chelsea | 3.932 | 3.956 | 4109.2 | 4343.9 |
| photo-coffee | 7.529 | 7.685 | 5070.6 | 5435.1 |
| six-hundred-colored-shapes | 11.285 | 11.306 | 213.9 | 352.0 |
| concave-star | 0.373 | 0.381 | 67.7 | 72.9 |
| dense-wavy-contour | 2.205 | 2.244 | 313.7 | 341.3 |
| nested-holes | 0.0 | 0.006 | 0.6 | 0.8 |
| one-pixel-ring | 0.0 | 0.0 | 0.6 | 0.6 |
| rounded-caption | 0.0 | 0.003 | 0.6 | 0.7 |
| thin-zigzag | 0.337 | 0.337 | 49.1 | 49.0 |
| tiny-counters | 0.0 | 0.003 | 0.7 | 0.8 |
| translucent-overlap | 0.636 | 0.636 | 31.8 | 35.0 |

At a 0.01 threshold: 2 lower-error cases, 16 effectively unchanged, 16 higher-error cases. These counts concern pixel resemblance only, not perceived smoothness.

Reproduce: npm test; scripts/smooth-inputs.py; run scripts/quality-benchmark.cjs sharp-before and smooth-after with QUALITY_ROOT set to each fixture directory; run scripts/quality-score.py for both modes; run scripts/smooth-report.py. The earlier fixture generators and documented sample photographs are required for the existing suites.