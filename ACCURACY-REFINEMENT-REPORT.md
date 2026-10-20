# Source-checked artwork refinement — 21 October 2026

The Python API now optionally uses the checksum-pinned Apache-2.0 Inkvec 0.2.6 Rust CLI for moderate-size opaque illustrations. It reconstructs coverage boundaries and real linear/elliptical radial gradients. No neural restorer, super-resolution weights, GPU service, paid API or newly trained model is used.

The original route is retained unless the candidate improves sampled RGB error by at least 15% and 0.5/255 and preserves small dark marks. Refinement currently requires automatic illustration settings, default fit controls, dimensions 256–768 pixels on each side, at least 15% coverage by the 16 most frequent source colors, and at most 750 initial paths. Dense line art, transparency, manual palettes and larger/tiny inputs keep their existing routes. This gate is a heuristic validated on these fixtures, not a universal quality guarantee.

## Actual application output

One local run per image, with SVG exported through the application PDF exporter and independently rendered. RGB MAE is on a 0–255 scale at source resolution, composited on white; lower is better. It is NOT overall accuracy. Baseline is the previously shipped color-recovery engine f899ad9. The new pipeline also includes bounded source-fitted linear gradients and verified circular gradients.

| Image | Before RGB error | New RGB error | Local seconds | Rust refinement selected |
|---|---:|---:|---:|---|
| dragon | 6.9925 | 2.5023 | 4.941 | yes |
| dragon-jpeg-stress | 5.1982 | 4.922 | 3.369 | no |
| dragon-small | 8.599 | 8.599 | 0.154 | no |
| photo | 9.3981 | 8.4446 | 2.943 | no |
| city-poster | 3.1094 | 1.4768 | 4.571 | yes |
| overlapping-illustration | 0.5939 | 0.5939 | 1.04 | no |
| overlapping-translucent-shapes | 4.952 | 4.952 | 1.252 | no |
| photo-like-landscape | 4.911 | 4.911 | 2.071 | no |
| textured-artwork | 5.88 | 5.7631 | 2.141 | no |
| fine-mandala | 2.141 | 2.141 | 1.839 | no |
| dense-technical-diagram | 0.145 | 0.145 | 1.908 | no |
| botanical | 1.5043 | 0.391 | 3.429 | yes |
| interwoven | 0.2474 | 0.2474 | 2.374 | no |

Botanical has an independent original vector reference: at 4x its error fell from **1.4254 to 0.2543/255**. Raster-input matching alone can reward tracing JPEG noise, so this reference check and enlarged visual inspection matter.

## Preservation and export checks

- 57 backend tests pass: source shading coherence, off-grid tiny accents, alpha, holes, exact ramps, strict SVG normalization, child crash/timeout recovery and temporary image cleanup.
- Frontend export/worker/stress tests and production build pass.
- Fast/balanced Inkvec variants erased the dragon eye and were rejected. Quality mode retains it; a small-dark-feature guard is also tested.
- VTracer 1.0 watershed modes were rejected as a default because diagram text and mandala connectors degraded, despite some interwoven improvements.
- Normalized Inkvec SVGs were independently rendered against the native SVGs. Mean mismatch was below 0.1/255 at 1x and 4x on four golden fixtures; the adapter rejects unsupported constructs.
- PDF/EPS support editable multi-stop linear and transformed radial shadings. SVG/PDF hole fill rules, clipping isolation and gradient transforms are tested; SVG/PDF radial colors were independently rendered. DXF remains outline-only. EPS transparency remains a white-background approximation; independent EPS rasterization was not performed.

## Resource and deployment behavior

Inkvec runs single-threaded with restoration disabled, a 3-second advisory internal budget, a strict 45-second subprocess deadline, 8MB SVG cap, and 512MB native address/job limit. The API's outer 90-second conversion deadline remains. Local native holdout CPU times were approximately 2.6–4.1 seconds, with 30–63MB observed native working set; these are not hosted limits or whole-service memory measurements. On a throttled free instance, latency can be substantially longer.

A failed/missing/timed-out native candidate retains the initial trace. Selected refinement temporarily stages PNG/SVG files inside a per-job directory, removed on completion; the API parent also removes it after forcibly terminating a worker. No persistent image database is used. The CLI cannot fetch neural weights (restore/sr off).

The Render build installs the pinned CLI archive and verifies its SHA256 before extraction; public notices/licenses are retained in the backend repository. Install with `pip install -r requirements.txt && python install_inkvec.py`. Set `INKVEC_REFINEMENT=0` to disable optional refinement.

## Limits

The compressed dragon still has grungy regions; photographs remain stylized. Arbitrary mesh/blur gradients and subpixel detail are not solved. Edge displacement, topology and visible detail can disagree with pixel error. No commercial paid-tool comparison was run, and paid-tool parity or perfection is not established.

Sources: [Inkvec source/license](https://github.com/logolabs/inkvec), [upstream limitations](https://github.com/logolabs/inkvec/blob/main/docs/LIMITATIONS.md), [VTracer release history](https://github.com/visioncortex/vtracer/blob/master/CHANGELOG.md).
