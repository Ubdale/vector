# Vector tracing quality check

Nine generated fixtures: logos, JPEG compression, noise, small text, thin lines, gradients, small accents, and two transparency cases. Baseline is the implementation before edge recovery. Both runs use eight requested colors; adaptive illustration mode uses 32 for the gradient.

SVG curves are exported to PDF and rasterized with PDFium at the original pixel dimensions. Error is mean absolute RGB difference (0–255), measured on white and black backgrounds. Lower is better. This measures these fixtures, not performance against commercial tools or a representative production dataset.

| Image | White error before | White error after | Paths before | Paths after |
|---|---:|---:|---:|---:|
| compressed-logo | 2.468 | 2.014 | 1017 | 4 |
| curved-logo | 1.726 | 0.584 | 674 | 4 |
| gradient | 12.824 | 6.601 | 8 | 32 |
| hidden-white-transparency | 0.117 | 0.117 | 2 | 2 |
| noisy-logo | 3.739 | 3.603 | 524 | 4 |
| small-accents | 0.006 | 0.006 | 5 | 5 |
| small-text | 3.118 | 1.165 | 659 | 52 |
| thin-lines | 0.901 | 0.557 | 543 | 4 |
| transparency | 0.277 | 0.277 | 3 | 3 |

All nine fixtures have equal or lower average RGB error on both backgrounds. Gradients remain quantized into solid colors; increasing colors improves fidelity at the cost of more shapes. Adaptive colors slightly increase alpha seams in the gradient, so lower RGB error does not mean every pixel or metric improves. Small text remains outlines, not editable typography. Some inputs take longer due to supersampling.

Reproduce: run scripts/quality-fixtures.py, node scripts/quality-benchmark.cjs baseline, node scripts/quality-benchmark.cjs improved, scripts/quality-score.py baseline, scripts/quality-score.py improved, then scripts/quality-report.py. Python requires Pillow and pypdfium2 (available in the bundled runtime).