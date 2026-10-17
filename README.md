# Outline frontend

Next.js frontend for Vercel. The upload queue, tracing controls, vector editing, comparison, and SVG/PDF/EPS/DXF/PNG exports are preserved. The studio markup is rendered by Next.js; its existing JavaScript interaction and export modules initialize after hydration.

The Python tracer is maintained separately: https://github.com/Ubdale/vector-backend

## Local development

1. Start the Python backend on port 8000 (see its README).
2. Copy .env.example to .env.local and set NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000.
3. Run npm ci, then npm run dev. Open http://localhost:3000.

## Vercel

Import Ubdale/vector, framework Next.js, repository root directory. Set NEXT_PUBLIC_API_BASE_URL to the deployed Render service URL, without /api/trace (for example https://your-service.onrender.com). Build command: npm run build. Install command: npm ci. Redeploy after changing this public build-time variable.

On Render, set ALLOWED_ORIGINS to the exact Vercel URL (and any approved custom domains), comma separated. Origins have no path or trailing slash. Requests go directly from the browser worker to Render, including the image pixels; no Vercel API proxy or image storage is used. The Python server processes images in memory.

## Checks

npm test verifies the retained browser comparison engine and vector export utilities. npm run build verifies the Next.js production build. Python API and tracing tests belong to the backend repository. Historical reports describe earlier engines and are retained for reference, not deployment guarantees. Photos, gradients, and tiny text remain approximate; smooth cleanup can remove texture.

Samples: IMAGE-SOURCES.md and public/samples/ATTRIBUTION.md. The old ImageTracerJS library remains under the Unlicense for regression tests. No trained AI model is included.

Configured hosted backend: https://vector-backend-ofrj.onrender.com. The frontend uses this URL by default. NEXT_PUBLIC_API_BASE_URL overrides it; remove any outdated Vercel value or set it to this hosted URL and redeploy. For local Python development, override with http://127.0.0.1:8000.

The studio now uses Lucide React icons and Sonner notifications, with keyboard shortcuts, paste/drop upload, actual elapsed tracing feedback, cancellation, and an explicit settings-pending state. Cubic Bézier SVG paths are preserved in PDF/EPS exports and flattened adaptively for DXF. See TRACING-UPGRADE-REPORT.md for hybrid-engine measurements and MODEL-ROADMAP.md for model-training prerequisites and limitations.

The workshop redesign uses Motion for an interactive illustrative Bézier playground, alongside Lucide and Sonner. It has no WebGL or continuously running 3D scene. Motion respects reduced-motion preferences; the curve playground is explicitly separate from actual tracing.

Adaptive smooth tracing can now fit conservative two-stop linear gradients. SVG and PDF preserve editable gradients; EPS uses Level 3 shading (transparency remains approximated against white, so overlapping translucent objects can differ). DXF exports outlines only. PNG export uses the original valid SVG without duplicating XML dimensions. Selecting a gradient and recoloring it replaces the gradient with a solid fill; undo restores it. The optional advanced gradient setting lets users retain solid fills.
