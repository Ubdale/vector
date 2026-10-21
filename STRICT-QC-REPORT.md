# Strict vectorizer QC — 22 October 2026

## Verdict

**Do not approve unrestricted commercial tracing quality yet.** All 18 local conversions and 10 fresh hosted conversions completed, but only 7/18 local fixtures passed every predeclared reconstruction gate. This is a demanding fixture pass rate, not an overall accuracy percentage. No production code was changed to improve scores during this audit.

Tested backend revision: 51a4167. Frontend/exporter implementation: f901232, with documentation revision ff3e519. Backend regression suite: 69/69 passed. Frontend export, curve stress and worker suites passed.

## Scope and fixed quality gates

Local quality uses Illustration, automatic colors, nominal32colors, default smooth curves, gradients/refinement enabled. Hosted/UI tests use default Logo, automatic colors, nominal8colors. These are separate configurations; local results must not be represented as exact hosted scores. Eighteen local cases include two newly constructed adversarial SVG references, compressed/original dragon, real coffee photo, synthetic textured artwork, diagram, mandala, botanical, interwoven curves, transparency and tiny geometry. Each conversion was fresh in this QC run; cached_conversion flags only reuse that same run’s earlier conversion while extending measurement.

Source checks: RGB mean absolute error <=3/255 on white and black, alpha error <=1/255, RGB-channel edge F1 >=95% within1sourcepixel, worst directional edge P95 <=1px. Where original scalable references exist: render independently at4x, RGB error <=1/255, edge F1 >=98% within0.5sourcepixel, P95 <=0.5px. All applicable checks must pass. Edge F1 is not overall accuracy, and source-raster similarity cannot prove ideal smooth contours. Tiny marks were additionally inspected locally. Thresholds were fixed before running; failed images were not retuned.

## Local reconstruction results

| Image | Strict result | Source RGB MAE /255 | Source edge F1 at1px | Reasons if failed |
|---|---|---:|---:|---|
|dragon|FAIL|2.502|85.11%|source edge F1 <.95 at1px; source edge P95 >1px|
|dragon-compressed|FAIL|4.92833|75.33%|source RGB MAE >3; source edge F1 <.95 at1px; source edge P95 >1px|
|mandala|PASS|2.13788|99.61%|All applicable gates passed|
|diagram|PASS|0.1462|99.94%|All applicable gates passed|
|botanical|PASS|0.38105|99.33%|All applicable gates passed|
|interwoven|FAIL|0.24512|99.84%|4x reference RGB MAE >1; 4x reference edge F1 <.98 at.5px; 4x reference edge P95 >.5px|
|photo|FAIL|8.46002|68.70%|source RGB MAE >3; source edge F1 <.95 at1px; source edge P95 >1px|
|city-poster|FAIL|1.33473|96.07%|source edge P95 >1px|
|textured-artwork|FAIL|5.76571|13.97%|source RGB MAE >3; source edge F1 <.95 at1px; source edge P95 >1px|
|alpha|PASS|0.03139|100.00%|All applicable gates passed|
|thin-detail|PASS|0.0522|100.00%|All applicable gates passed|
|summit|PASS|0.05653|100.00%|All applicable gates passed|
|ring-tiny-accent|FAIL|0.40251|100.00%|4x reference edge F1 <.98 at.5px; 4x reference edge P95 >.5px|
|micro-geometry|PASS|0.05317|100.00%|All applicable gates passed|
|subpixel-ribbons|FAIL|0.07422|100.00%|4x reference RGB MAE >1; 4x reference edge F1 <.98 at.5px; 4x reference edge P95 >.5px|
|holes-and-gaps|FAIL|0.27028|99.88%|4x reference edge F1 <.98 at.5px; 4x reference edge P95 >.5px|
|new-hairlines-near-holes|FAIL|0.04415|100.00%|4x reference RGB MAE >1; 4x reference edge F1 <.98 at.5px; 4x reference edge P95 >.5px|
|new-alpha-color-gradients|FAIL|1.21878|87.63%|source edge F1 <.95 at1px; source edge P95 >1px; alpha MAE >1; 4x reference RGB MAE >1; 4x reference edge F1 <.98 at.5px; 4x reference edge P95 >.5px|

## Main defects and priorities

1. **Hairline/subpixel reconstruction:** new lettering and near-touching gaps closely match source pixels but remain stepped at400%. This demonstrates why low source error alone is insufficient. Reconstruct centerlines/strokes and subpixel curves while validating holes and gaps.
2. **Transparent multicolor gradients:** the new overlapping-alpha fixture shows contour banding and pinhole seams. Preserve continuous alpha/gradient regions and shared boundaries; precision tracing currently quantizes them.
3. **Compressed dragon and textures:** grungy boundaries and many small color patches persist. Original dragon also misses fine-edge gates. Compression damage cannot simply be assumed recoverable.
4. **Photo and textured-artwork fidelity:** photographic details and texture do not meet the gates. Do not advertise arbitrary-photo perfection.
5. **Exports:** EPS cannot retain alpha and overlapping translucent fills may change even on white. Complex PDF small-hole topology needs independent review despite low average differences.

## Fresh hosted API tests

10/10 images returned HTTP200, correct source dimensions and zero embedded SVG image tags. All returned the expected production CORS origin. Latencies are single end-to-end requests, including upload/network and free Render CPU, not a throughput/load benchmark. Median16.64s; range2.47–47.21s.

| Image | Route | Paths | SVG bytes | Seconds | Source RGB MAE /255 |
|---|---|---:|---:|---:|---:|
|dragon|inkvec-normalized|150|129927|32.29|2.59842|
|compressed-dragon|vtracer-rust|2968|1328365|47.21|4.18587|
|botanical|inkvec-normalized|47|76251|17.77|0.4015|
|city-poster|inkvec-normalized|532|123672|22.97|1.41264|
|diagram|opencv|3215|864498|15.51|1.16297|
|mandala|opencv|430|1959439|20.42|2.13788|
|photo|vtracer-rust|3471|1613196|9.51|6.73034|
|radial|analytic-radial-gradient|1|482|2.47|0.18761|
|alpha|opencv|2|12136|3.3|0.03139|
|summit|inkvec-geometric|5|7015|15.23|0.05653|

Malformed/truncated payloads, invalid boolean numeric settings and oversized dimensions returned400. Approved CORS preflight returned200; unapproved origin returned400. During a dragon job, health returned200 in0.44s, while one simultaneous second conversion returned503 in0.29s. This proves prompt backpressure for that controlled two-request check, not capacity for many simultaneous users.

## Export QC

Seven fresh hosted SVGs were exported using the current exporter and independently compared with Resvg/PDFium at1x/4x. All PDFs had valid pages, matching dimensions and zero image objects. All seven passed scoped numerical export gates (RGB MAE<0.5/255, alpha<1/255). Four have scoped passes; dragon, compressed dragon and mandala remain **REVIEW/UNVERIFIED** because thresholded small-hole/component counts differ across renderers. Possible antialias effects are not sufficient evidence to waive review.

EPS alpha preservation **FAILS**. EPS visuals are unverified because an independent renderer was unavailable. DXF finite bounds/closed contour structure passes, but CAD visual import is unverified; DXF exports outlines, not equivalent filled artwork. See exports/REPORT.md for individual numbers and caveats.

## Live browser and responsive checks

A fresh compressed-dragon upload, trace,400% preview and PDF download completed through production Chrome. Trace:45.8s,2934paths, matching554x554viewBox. Downloaded PDF:1,197,531bytes,2934objects, zero raster images,554x554page. Browser JPEG decoding differs slightly from Pillow, so these path counts are not treated as a same-byte determinism comparison. The400% screenshot visibly confirms patchy/grungy detail; successful download is not a quality pass.

At390x844, the page document width was375px (no horizontal overflow), and the mobile settings disclosure expanded successfully. The temporary viewport override was reset. Inspected logs contained extension-origin warnings; no application-origin errors were observed in that sample. This was a focused Chrome check, not a full cross-browser/accessibility audit.

## Evidence and reproduction

Local artifacts in test-results/strict-qc-2026-10-22/: qc-summary.png; quality/results.json, REPORT.md,contact-sheet.png,new-adversarial-reference-crops.png; hosted/results.json,measured-results.json; exports/REPORT.md,results.json; browser-results.json,browser-download.pdf,live-compressed-dragon-400.png,mobile-settings.png. Raw artifact directories are ignored by Git.

Scripts: tmp/strict-qc-quality.py; tmp/strict-qc/hosted.py; tmp/strict-qc/export-check.cjs; tmp/strict-qc/measure-exports.py. Sources and hashes are recorded with results. The compressed-dragon hosted fixture path was corrected and its missing row replaced by a fresh successful run. No paid competitor outputs were supplied, so competitor parity remains untested. No model was trained.
