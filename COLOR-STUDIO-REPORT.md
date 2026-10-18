# Color studio redesign and complex-image checks - October 18, 2026

## Product changes

The page hierarchy is now app-first: compact centered masthead, canvas on the left and controls on the right, with a separate creative experiment below the workspace. Cobalt, lime, coral and lavender replace the paper/serif theme. Functional controls have larger type. On mobile, upload and the tracing action stay together while settings expand on demand.

The new Slide view overlays the actual original and vector with an accessible comparison slider. Their artwork bounding boxes were checked and align exactly. Slide uses 100% zoom; selecting a higher zoom returns to the side-by-side view. Keyboard shortcut 4 opens Slide. It stays disabled without a result and resets when starting over. The vector can still be inspected at 400%.

An original botanical illustration is available as a new example. The Motion-powered curve experiment is explicitly separate from tracing, with reduced-motion support. SVG/PDF scaling is distinguished from finite-resolution PNG export.

## What the image tests actually show

Two new original SVG fixtures provide genuine scalable ground truth. Each was rendered into a 512-pixel raster input, traced, then compared against the original vector at 4x resolution. This distinguishes smooth reconstructed geometry from vector paths that merely follow pixel stair steps.

| New fixture | Output paths | Cubic segments | Embedded raster images | RGB error at 400%, /255 | Observed result |
|---|---:|---:|---:|---:|---|
| Botanical: curved leaves, holes, gradient | 58 | 616 | 0 | 1.425 | Broad curves stay smooth; small deviations remain |
| Interwoven: narrow waves, overlaps, tiny glyphs | 22710 | 0 | 0 | 2.311 | Visible stair steps and excessive small regions |

RGB error is mean absolute channel difference, not an accuracy percentage. The fixtures and reproducible methodology are retained locally under `test-results/groundtruth-complex/`, including side-by-side 400% crops. All artwork in these two fixtures was drawn for this project.

Experimental cubic fitting and binary-region smoothing were rejected. One candidate looked smoother but moved some boundaries by roughly 1.8 to 5 source pixels; stricter boundary checks rejected it. Another increased waviness. Those experiments are not deployed. The existing tracing geometry and detail-preserving routes remain in place.

**We cannot honestly claim that every complex image is free of jagged edges.** SVG paths are scalable, but a scalable file can still contain jagged geometry. Dense antialiased linework and photographs remain limitations. No neural model was trained during this pass.

## Reliability fix

A fresh hosted dragon test timed out after 120 seconds, after which even a tiny valid image returned 503 busy. The API previously had no bound on body reading or the in-process native call. This evidence did not identify which stage hung, so both are now bounded.

The backend now reads uploads with a 30-second limit and runs each conversion in a disposable spawned process with a 90-second limit. Native libraries are imported only in that child. Timeout/crash cleanup releases the single-job slot. Tests deliberately hang and crash a worker, then verify a successful subsequent conversion, plus API timeout/failure responses, CORS and capacity release. Health reports `execution: isolated-process-v1`. Per-job startup adds latency; this is not a speedup claim.

## Verification

- Frontend regression/export tests and production build pass.
- 23 backend tests pass, including process crash/timeout/recovery.
- Desktop and 390-pixel mobile layout checks pass with no horizontal page overflow.
- Slide alignment, split control, 400% zoom switching, collapsed mobile settings and the new complex sample were exercised in the browser.
- Hosted measurements after the reliability deployment are recorded below. The initial timeout is retained here rather than counted as a successful test.

## Hosted results after the fix

All nine sequential requests returned HTTP 200 with the expected production CORS origin and zero embedded raster images. Times include upload, disposable-process startup, tracing and response transport on the existing free Render instance; they are single observations, not latency guarantees.

| Image | Seconds | Paths | Gradients |
|---|---:|---:|---:|
| Dragon | 9.12 | 206 | 0 |
| Mandala | 22.30 | 430 | 0 |
| Dense diagram | 20.23 | 11205 | 0 |
| Photograph | 17.74 | 1519 | 4 |
| Pure gradient | 2.46 | 1 | 1 |
| Transparency | 3.45 | 2 | 0 |
| Thin details | 5.10 | 1344 | 0 |
| Botanical | 5.81 | 58 | 1 |
| Interwoven | 31.84 | 22710 | 0 |

Successful conversion is not equivalent to visual accuracy. In particular, the interwoven output remains jagged at 400% despite completing successfully and containing only vector paths. The first failed hosted attempt is excluded from the successful-run timings above. Raw responses, timings and a simple performance chart are retained under `test-results/hosted-color-studio/`.

The actual deployed frontend also traced the botanical example in 7.3 seconds, aligned the Slide overlay, switched correctly out of Slide at 400% zoom, and downloaded its vector PDF. Browser error logs were empty. This pass changes the UI and execution reliability, not the tracing geometry: the rejected smoothing experiments were removed.
