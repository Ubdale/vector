# Hybrid tracing upgrade — 2026-10-17

This records the earlier hybrid-engine pass. See WORKSHOP-UPGRADE-REPORT.md for the subsequent redesign and conservative gradient support.

Same four images as the production complex-image test. New timing is local CPU median of three runs; it is not directly comparable with the historical Render end-to-end timings. Sizes below compare actual SVG bytes for the two outputs. Image error is mean RGB error /255 on white, not accuracy percentage.

| Image | Previous paths | New paths | Previous KB | New KB | New local CPU s | Previous error | New error |
|---|---:|---:|---:|---:|---:|---:|---:|
| dragon | 7953 | 206 | 2259.7 | 102.2 | 0.164 | 3.329 | 7.705 |
| mandala | 430 | 430 | 1916.0 | 1913.5 | 3.153 | 2.141 | 2.141 |
| diagram | 4342 | 11205 | 1117.4 | 1457.4 | 3.102 | 2.907 | 0.145 |
| photo | 10779 | 1519 | 3606.6 | 780.3 | 0.774 | 6.267 | 9.83 |

Opaque shaded artwork uses MIT-licensed VTracer Rust spline fitting. Flat line art and tiny/transparent regions use feature-preserving Python/OpenCV paths. This is an automatic routing pipeline, not a trained neural model.

Observed: dragon silhouette is much smoother and the file is much smaller, but some original shading is flattened. Diagram text/connectors are substantially better preserved through the precision route. Mandala is unchanged to preserve thin details. Photographs still become stylized/posterized; pixel resemblance worsens relative to the previous denser output. This is not a universal accuracy improvement or a commercial-readiness guarantee.

New cubic paths parsed successfully and exported as vector PDF/EPS; DXF follows a tested 0.25-pixel flattening tolerance. Native gradients remain unimplemented. Source image rights are unchanged.

See MODEL-ROADMAP.md for the distinction between coding agents, learned models, and per-image optimization.

## Hosted verification

After deployment with Python 3.12.10 on 2026-10-17, all four direct API tests returned HTTP 200 and the correct Vercel CORS origin. These are single end-to-end requests from the test machine to Render, not CPU-only timings or statistical latency guarantees.

| Image | Route | Hosted seconds | Paths | SVG KB |
|---|---|---:|---:|---:|
| Dragon | Rust splines | 2.33 | 206 | 102.2 |
| Mandala | OpenCV precision | 17.42 | 430 | 1913.5 |
| Dense diagram | OpenCV precision | 20.34 | 11205 | 1457.4 |
| Photo | Rust splines | 4.64 | 1519 | 780.3 |

The actual production frontend dragon trace also completed in 2.9 seconds and downloaded a 98,377-byte vector PDF. An initial native deployment running Render's default Python 3.14 crashed with exit 139; the runtime is now pinned to the tested 3.12 series. Five additional consecutive hosted dragon traces passed after the change. This establishes a successful smoke test, not proof of the original crash's root cause or a long-term reliability guarantee.
