from pathlib import Path
import sys, json, csv
sys.path.insert(0,str(Path('tmp/chart-deps').resolve()))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
root=Path('tmp/complex');before=json.loads((root/'metrics-previous.json').read_text());after=json.loads((root/'metrics-revised.json').read_text());lookup={r['name']:r for r in after}
labels=['City poster','Dense diagram','Fine mandala','Overlapping artwork','Translucent shapes','Photo-like scene','Textured artwork']
fig,axes=plt.subplots(2,2,figsize=(15,10),layout='constrained');fig.set_facecolor('#f8faf7')
specs=[('mae','Visual error','Mean absolute RGB error (0–255; lower is better)',1),('paths','Vector complexity','Paths (log scale; fewer is easier to edit)',1),('bytes','SVG file size','MiB',1024**2),('ms','Conversion time','Milliseconds · median of 3 local runs',1)]
for ax,(key,title,xlabel,divisor) in zip(axes.flat,specs):
    ax.set_facecolor('#f8faf7');y=np.arange(len(before));b=[r[key]/divisor for r in before];a=[lookup[r['name']][key]/divisor for r in before]
    ax.barh(y-.18,b,.34,color='#cc8d59',label='Previous');ax.barh(y+.18,a,.34,color='#54816c',label='Updated')
    ax.set_yticks(y,labels);ax.invert_yaxis();ax.set_title(title,loc='left',fontsize=14,fontweight='bold',pad=14);ax.set_xlabel(xlabel,fontsize=10);ax.spines[['top','right','left']].set_visible(False);ax.grid(axis='x',alpha=.15);ax.set_axisbelow(True)
    if key=='paths':ax.set_xscale('log');ax.set_xlim(70,160000)
    else:ax.set_xlim(0,max(b+a)*1.22)
    for i,(v,w) in enumerate(zip(b,a)):
        for val,pos in [(v,i-.18),(w,i+.18)]:ax.text(val*1.025 if key=='paths' else val+max(b+a)*.012,pos,f'{val:,.0f}' if key in ['paths','ms'] else f'{val:.2f}',va='center',fontsize=8,color='#34483d')
axes[0,0].legend(frameon=False,loc='lower right');fig.suptitle('Outline Studio · Complex-image performance',fontsize=21,fontweight='bold',color='#24372e')
fig.savefig('performance-chart.png',dpi=140,facecolor=fig.get_facecolor());fig.savefig('performance-chart.svg',facecolor=fig.get_facecolor());plt.close(fig)
allrows=[]
for suite in ['quality','complex']:
    a={r['name']:r for r in json.loads((Path('tmp')/suite/'metrics-revised.json').read_text())}
    for b in json.loads((Path('tmp')/suite/'metrics-previous.json').read_text()):
        r=a[b['name']];assert r['mae']<=b['mae']+.01,(suite,b['name'],'white error regression');assert r['mae_black']<=b['mae_black']+.01,(suite,b['name'],'black error regression');allrows.append(dict(suite=suite,image=b['name'],error_before=b['mae'],error_after=r['mae'],black_error_before=b['mae_black'],black_error_after=r['mae_black'],paths_before=b['paths'],paths_after=r['paths'],bytes_before=b['bytes'],bytes_after=r['bytes'],ms_before=b['ms'],ms_after=r['ms']))
with open('performance-results.csv','w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=allrows[0].keys());w.writeheader();w.writerows(allrows)
rows=['# Performance after complex-image fixes','', 'Compared the immediately previous engine against the updated engine on the same 16 generated images and the same UI settings. This includes 9 simpler fixtures and 7 complex fixtures. No real photographs or competitor services were tested.', '', 'Fixes: skip aggressive edge recovery on exact-color artwork and pale fills; detect dense local noise and filter it before color quantization; use precise fitting for adaptive illustrations; preserve full opacity with a vector backing region on opaque sources. Transparent sources and background-removal output do not receive an opaque backing.', '', '## Method', '', 'RGB error is measured against the input after vector PDF rendering using PDFium, on both white and black backgrounds. Lower is better, and it is not a percentage accuracy score. Path count and file bytes are taken from SVG. Conversion timing is the median of three runs of prepare + trace + SVG generation in Node on this computer; downloads, exports, browser startup, and network are excluded. Times vary with CPU load. The photo-like landscape is procedural artwork.', '', 'All 16 fixtures have equal or lower average RGB error (within 0.01) on both backgrounds. Precise fitting increases time and file size on several cases. Noise filtering can remove original texture; the goal is a usable vector approximation. Gradients and transparency are still quantized; small lettering is outlined, not editable text.', '', '| Case | Error before | Error after | Paths before | Paths after | Time before ms | Time after ms |','|---|---:|---:|---:|---:|---:|---:|']
for r in allrows:rows.append(f"| {r['image']} | {r['error_before']} | {r['error_after']} | {r['paths_before']:,} | {r['paths_after']:,} | {r['ms_before']} | {r['ms_after']} |")
rows+=['', 'Generated charts: performance-chart.png and performance-chart.svg. Raw results: performance-results.csv. Source runner: scripts/quality-benchmark.cjs (previous/revised modes). Rerun both fixture directories with QUALITY_ROOT, render them using scripts/quality-score.py, and run scripts/performance-chart.py.']
Path('PERFORMANCE-REPORT.md').write_text('\n'.join(rows),encoding='utf-8');print('Passed 16 paired regression checks on white and black; saved charts, CSV, and report.')
