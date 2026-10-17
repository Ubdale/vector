# Tracing engine and learned-model roadmap

The production pipeline uses classical tracing. Coding agents implement and test it; they are not trained raster-to-vector models. No neural model has been trained in this project.

## Current work

Python handles the API, image preparation, transparency and feature-preserving fallback. The MIT-licensed VTracer Rust engine fits opaque complex artwork with cubic Bézier paths. SVG, PDF and EPS preserve those curves; DXF approximates them with bounded-error outlines. This can reduce contour noise and path count. It does not reconstruct native gradients or guarantee accurate lettering or photographs.

The original open-source tracer must not be confused with the separately activated VTracer 2 desktop product. Its advertised neural cleanup and gradient output are not features we can claim for the Python package. No public model weights or Linux SaaS integration rights were established for that product during this review.

## What a real learned pipeline requires

1. Build a licensed paired SVG/raster corpus, rendered with controlled JPEG damage, blur, resampling, transparency, fine text and gradients. Separate train/test splits by artwork family and source, rather than random near-duplicates.
2. Establish a fixed holdout benchmark for contour displacement, feature retention, text legibility, palette error, gradient fidelity, file complexity, latency and memory. Pixel error alone is insufficient.
3. Compare a learned cleanup/edge predictor against deterministic preprocessing. Evaluate pretrained SVG models only within their documented input domain. Record weight licenses and attribution.
4. Test per-image differentiable refinement of curve coordinates and colors, including gradient fills, against the holdout set. This is optimization per image, not training a general-purpose agent.
5. Train or fine-tune only after the architecture and data demonstrably improve the benchmark. Deploy heavy inference as a separate asynchronous GPU service with measured cost and capacity.

StarVector publishes Apache-2.0 model weights, but its model card does not support natural images and illustrations. A 1B-parameter FP16 model needs roughly 2 GB for weights alone before runtime overhead; this exceeds a 512 MB instance. Simply adding Python or Rust cannot provide those resources or learned weights.

## Primary references

- [VTracer source and MIT license](https://github.com/visioncortex/vtracer)
- [Original tracing algorithm and curve fitting](https://www.visioncortex.org/vtracer-docs/)
- [VTracer 2 product](https://vtracer.visioncortex.org/)
- [StarVector official 1B model card](https://huggingface.co/starvector/starvector-1b-im2svg)
- [DiffVG differentiable rasterizer](https://github.com/BachiLi/diffvg)
- [LIVE per-image vector optimization](https://github.com/Picsart-AI-Research/LIVE-Layerwise-Image-Vectorization)

Smooth contours alone do not establish commercial readiness. Native gradients, text reconstruction, error recovery, rate limits and capacity still need validation before selling high-fidelity tracing as a guarantee.
