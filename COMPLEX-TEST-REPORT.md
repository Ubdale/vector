# Complex-image tracing tests

Seven new procedural fixtures, separate from the nine simpler fixtures. The landscape is generated photo-like artwork, not a real photograph. These tests are not a representative production-image benchmark.

Source images range from 540×420 to 720×480, plus a 576×576 pattern. Each SVG was exported as vector PDF, rendered using PDFium at its original dimensions, and visually inspected. Error below is mean absolute RGB error on white (0–255; lower is better). Black-background error and alpha error are retained in tmp/complex/metrics-*.json.

Baseline: engine before edge recovery, 8 colors. Current: current UI defaults, 8 colors for logos and adaptive 32 colors for illustrations. Alternate: edge recovery off; illustrations additionally use precise curves, light denoising, and detail cleanup 2. The color budgets differ, so this compares practical configurations rather than isolating one algorithm change.

| Case | Baseline error | Current error | Alternate error | Current paths | Current SVG KB |
|---|---:|---:|---:|---:|---:|
| city-poster | 4.996 | 1.384 | 1.33 | 1,225 | 205.5 |
| dense-technical-diagram | 2.866 | 10.637 | 2.866 | 1,367 | 424.2 |
| fine-mandala | 4.761 | 4.982 | 4.761 | 332 | 328.3 |
| overlapping-illustration | 2.905 | 2.905 | 2.195 | 132 | 96.6 |
| overlapping-translucent-shapes | 16.957 | 7.355 | 7.173 | 146 | 45.2 |
| photo-like-landscape | 7.704 | 28.831 | 15.127 | 51,734 | 7805.2 |
| textured-artwork | 18.771 | 11.509 | 10.555 | 2,615 | 654.7 |

## Findings

- City poster: current error is 72% lower; lettering and windows remain visible. More colors create more paths.
- Dense technical diagram: current error worsens from 2.866 to 10.637 because edge recovery removes pale fills. Turning edge recovery off restores the baseline result. Text is outlined; some small labels still need cleanup.
- Fine mandala: current error is slightly worse. Turning edge recovery off improves fidelity but increases paths from 332 to 638.
- Overlapping illustration: unchanged at current defaults; precise curves improve the alternate result.
- Translucent shapes: adaptive colors cut average error by 57%, but smooth opacity variations become discrete colored shapes.
- Photo-like landscape: current output regresses badly, with 51,734 paths and a 7.6 MiB SVG. Alternate settings help but remain worse than the eight-color baseline. Fine noise and neighboring region seams are unresolved.
- Textured artwork: adaptive colors reduce error, but texture is flattened and color banding remains. Alternate settings cut paths from 2,615 to 845.

The current tracer is better suited to flat logos and illustrations than textured or photo-like artwork. Earlier improvements on simple examples do not generalize to every complex input. No production-engine defaults were changed by this testing request.

## Reproduce

Run scripts/complex-fixtures.py. Set QUALITY_ROOT=tmp/complex for the Node benchmark, then run scripts/quality-benchmark.cjs with baseline, improved, and tuned. Run scripts/quality-score.py for each variant with tmp/complex as its second argument, then scripts/complex-report.py. Python requires Pillow and pypdfium2.