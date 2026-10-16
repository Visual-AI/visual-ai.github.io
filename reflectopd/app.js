'use strict';
const DATA=window.REFLECTOPD_DATA;
const COMP=window.REFLECTOPD_COMPARISONS;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=name=>`assets/${name}`;
function markedPrompt(round){let out=esc(round.prompt);[...(round.highlights||[])].sort((a,b)=>b.length-a.length).forEach(v=>{out=out.split(esc(v)).join(`<mark class="${(round.newHighlights||[]).includes(v)?'new':''}">${esc(v)}</mark>`)});return out}
function pressed(root,key,value){document.querySelectorAll(`#${root} [data-${key}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[key]===value)))}

const dialog=document.getElementById('image-dialog');
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
document.addEventListener('click',e=>{const z=e.target.closest('[data-zoom]');if(!z)return;document.getElementById('dialog-image').src=z.dataset.zoom;document.getElementById('dialog-image').alt=z.dataset.title||'';document.getElementById('dialog-title').textContent=z.dataset.title||'';dialog.showModal()});
const reelItems=[
  {tag:'Position',text:'couch below a cup',a:'couch-0.webp',b:'couch-2.webp',target:'case-couch'},
  {tag:'Position',text:'bed right of a sports ball',a:'00401-round0.webp',b:'00401-round3.webp',target:'case-00401'},
  {tag:'Counting',text:'exactly four sinks',a:'00186-round0.webp',b:'00186-round1.webp',target:'case-00186'},
  {tag:'Color binding',text:'black broccoli and yellow cake',a:'00478-round0.webp',b:'00478-round3.webp',target:'case-00478'},
  {tag:'Text rendering',text:'Organic Chamomile Blend',a:'ocr_test_00095__agentic_fair100_refiner_v2c__r0.webp',b:'ocr_test_00095__agentic_fair100_refiner_v2c__r3.webp',target:'case-ocr'},
  {tag:'Skill transfer',text:'bird below a skateboard',a:'transfer-before.webp',b:'transfer-after.webp',target:'case-bird-skateboard'},
  {tag:'Text rendering',text:'Lionheart Clan',a:'ocr_test_00430__agentic_ocr_v2_relaxed__r0.webp',b:'ocr_test_00430__agentic_ocr_v2_relaxed__r1.webp',target:'case-ocr-00430'},
  {tag:'Text rendering',text:'speed',a:'ocr_test_00973__agentic_ocr_v2_relaxed__r0.webp',b:'ocr_test_00973__agentic_ocr_v2_relaxed__r1.webp',target:'case-ocr-00973'},
  {tag:'Text rendering',text:'Press Reset to Time Travel',a:'ocr-cartridge-r0.webp',b:'ocr-cartridge-r2.webp',target:'case-ocr-cartridge'}
];
const reelHTML=reelItems.map(x=>`<a class="reel-card" href="#${x.target}" aria-label="Open ${esc(x.tag)} case: ${esc(x.text)}"><div class="reel-images"><img src="${asset(x.a)}" alt="Before reflection: ${esc(x.text)}"><span class="reel-arrow">→</span><img src="${asset(x.b)}" alt="After reflection: ${esc(x.text)}"></div><div class="reel-meta"><span>${esc(x.tag)} · R0 → final</span><p>“${esc(x.text)}”</p></div></a>`).join('');
document.getElementById('repair-reel').innerHTML=reelHTML+reelHTML;

document.getElementById('featured-trajectory').innerHTML=DATA.hero.rounds.map((r,i)=>`<div class="mini-step"><img src="${asset(r.image)}" alt="${i?'Reflection round '+i:'Original generation'}"><span>${i?'Reflection '+i:'Original'} · ${r.passed?'pass':'revise'}</span></div>`).join('');

const methodData={
  reflection:{tag:'History-grounded reflective inference',title:'Inspect the failure, then revise with evidence',body:'The reflector receives the original request, the generated image, verifier feedback, and earlier attempts. It preserves corrections that already worked and targets only the remaining failure.',steps:['Generate from the current prompt.','Verify against the original request.','Reflect using image, feedback, and history.'],image:'reflect-verify-web-v2.svg'},
  skill:{tag:'Reflection Skill Optimization',title:'Turn trajectories into reusable guidance',body:'A summarizer reads successful and failed trajectories, extracts rules about when to intervene and what to preserve, and keeps an updated skill only when validation performance improves.',steps:['Consolidate recurring strategies.','Evaluate the updated skill.','Freeze the selected skill for inference.'],image:'reflection-method.png'},
  distill:{tag:'Reflective on-policy distillation',title:'Internalize the verified correction',body:'The student rolls out its own samples. A skill-augmented reflector produces a verified revision; an EMA teacher provides the corrective velocity, while the student remains conditioned on the original prompt.',steps:['Roll out the evolving student.','Verify and reflect on its current failures.','Match the EMA teacher correction at the same rollout state.'],image:'distillation-method.png'}
};
function renderMethod(key){document.querySelectorAll('.method-tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.method===key)));const d=methodData[key],panel=document.getElementById('method-panel');panel.dataset.method=key;panel.setAttribute('aria-labelledby',`method-tab-${key}`);panel.innerHTML=`<button class="zoom" data-zoom="${asset(d.image)}" data-title="${esc(d.title)}"><img src="${asset(d.image)}" alt="${esc(d.title)}"></button><div class="method-copy"><span>${esc(d.tag)}</span><h3>${esc(d.title)}</h3><p>${esc(d.body)}</p><ol>${d.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>`}
const methodOrder=Object.keys(methodData);
const methodCarousel=document.getElementById('method-carousel');
const methodAutoplay=document.getElementById('method-autoplay');
const methodPanel=document.getElementById('method-panel');
const methodInterval=8000;
let methodTimer=null,methodPaused=false,methodVisible=false,methodHovered=false;
function scheduleMethod(){
  clearTimeout(methodTimer);
  const keyboardFocus=methodCarousel.querySelector(':focus-visible');
  if(methodPaused||!methodVisible||methodHovered||keyboardFocus||document.hidden||dialog.open)return;
  methodTimer=setTimeout(()=>{
    const index=methodOrder.indexOf(methodPanel.dataset.method);
    renderMethod(methodOrder[(index+1)%methodOrder.length]);
    scheduleMethod();
  },methodInterval);
}
document.querySelectorAll('.method-tabs button').forEach(b=>b.addEventListener('click',()=>{
  renderMethod(b.dataset.method);
  scheduleMethod();
}));
methodAutoplay.addEventListener('click',()=>{
  methodPaused=!methodPaused;
  methodAutoplay.setAttribute('aria-pressed',String(methodPaused));
  methodAutoplay.setAttribute('aria-label',`${methodPaused?'Resume':'Pause'} automatic stage switching`);
  methodAutoplay.title=`${methodPaused?'Resume':'Pause'} automatic switching`;
  methodAutoplay.innerHTML=methodPaused
    ?'<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11L13 8z" fill="currentColor"/></svg>'
    :'<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
  scheduleMethod();
});
methodCarousel.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){methodHovered=true;scheduleMethod();}});
methodCarousel.addEventListener('pointerleave',()=>{methodHovered=false;scheduleMethod();});
methodCarousel.addEventListener('focusin',scheduleMethod);
methodCarousel.addEventListener('focusout',()=>setTimeout(scheduleMethod,0));
document.addEventListener('visibilitychange',scheduleMethod);
dialog.addEventListener('close',scheduleMethod);
new MutationObserver(scheduleMethod).observe(dialog,{attributes:true,attributeFilter:['open']});
new IntersectionObserver(entries=>{
  methodVisible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.2;
  scheduleMethod();
},{threshold:[0,.2]}).observe(methodCarousel);
renderMethod('reflection');

const executorData={qwen35:{base:[78.4,85.1,88.3],skill:[84.0,88.3,91.7]},qwen3:{base:[79.6,84.8,87.5],skill:[82.6,88.5,90.8]}};
function transferRows(name,d){return `<section class="executor-model"><div class="executor-title"><strong>${name}</strong><span>R1 gain +${(d.skill[0]-d.base[0]).toFixed(1)}</span></div><div class="transfer-table"><div class="transfer-row"><span>Setting</span><span>R1</span><span>R2</span><span>R3</span></div><div class="transfer-row"><span>No skill</span>${d.base.map(v=>`<span>${v.toFixed(1)}%</span>`).join('')}</div><div class="transfer-row skill"><span>+ Skill</span>${d.skill.map(v=>`<span><strong>${v.toFixed(1)}%</strong></span>`).join('')}</div></div></section>`}
document.getElementById('executor-results').innerHTML=transferRows('Qwen3.5-9B',executorData.qwen35)+transferRows('Qwen3-VL-8B',executorData.qwen3);

const mainResults={flux:[['Base model',1,.99,.81,.75,.80,.21,.48,.67],['+ Noise Scaling',32,1,.96,.91,.91,.52,.78,.85],['+ Noise & Prompt Scaling',32,.99,.94,.85,.91,.80,.71,.87],['+ ReflectionFlow',32,1,.98,.90,.96,.93,.72,.91],['+ ReflectOPD (Ours)',1,1,.97,.94,.95,.93,.74,.92]],sana:[['Base model',1,.99,.77,.62,.88,.21,.47,.66],['+ Noise Scaling',20,1,.93,.79,.91,.55,.62,.80],['+ Reflect-DiT',20,.98,.96,.80,.88,.66,.60,.81],['+ ReflectOPD (Ours)',1,.99,.92,.77,.91,.78,.74,.85]]};
function resultRows(rows){return rows.map(r=>`<tr class="${r[0].includes('ReflectOPD')?'ours-row':''}"><th>${esc(r[0])}</th><td>${r[1]}</td>${r.slice(2).map(v=>`<td>${v.toFixed(2)}</td>`).join('')}</tr>`).join('')}
document.querySelector('#main-results-flux tbody').innerHTML=resultRows(mainResults.flux);
document.querySelector('#main-results-sana tbody').innerHTML=resultRows(mainResults.sana);

const allCases=[DATA.hero,...DATA.cases].map(c=>({...c,task:c.label==='Text rendering'?'OCR':'GenEval'})).sort((a,b)=>Number(a.task==='OCR')-Number(b.task==='OCR'));
const filters=['All','GenEval','OCR'];
document.getElementById('case-filters').innerHTML=filters.map((f,i)=>{const count=f==='All'?allCases.length:allCases.filter(c=>c.task===f).length;return `<button data-filter="${f}" aria-pressed="${i===0}">${f} · ${count}</button>`}).join('');
function caseDetail(data,index){
  const r=data.rounds[index],source=index?index-1:0;
  return `<div class="case-judge-line"><h4>Judge · R${source}</h4><p>${esc(data.rounds[source].judge)}</p></div><section><h4>Problem</h4><p>${esc(r.problem)}</p></section><section><h4>Strategy${index?` · R${source} → R${index}`:''}</h4><p>${esc(r.strategy)}</p></section><section class="detail-prompt"><h4>${index?`Revised prompt${r.promptPartial?' (key text)':''} → R${index}`:'Original prompt'}</h4><p>“${markedPrompt(r)}”</p></section>`;
}
function caseCard(data){
  const initial=data.rounds.length>1?1:0;
  return `<article class="case-card" id="case-${esc(data.id)}" data-label="${esc(data.label)}" data-task="${data.task}" data-rounds="${data.rounds.length-1}" data-case="${esc(data.id)}"><div class="case-top"><div class="case-meta"><div><span class="case-benchmark">${data.task}</span><span class="case-category">${esc(data.label)}</span></div><span class="case-depth">R0 → R${data.rounds.length-1}</span></div><p class="case-prompt">“${esc(data.prompt)}”</p></div><div class="case-rounds" style="--rounds:${data.rounds.length}">${data.rounds.map((r,i)=>`<button class="case-round${i===initial-1?' is-source':''}" data-index="${i}" aria-pressed="${i===initial}" aria-controls="details-${esc(data.id)}" aria-label="Show ${i?'round '+i:'original'} details for ${esc(data.prompt)}"><img src="${asset(r.image)}" alt="${esc(data.prompt)} · ${i?'round '+i:'original'}" loading="lazy"><span><strong>R${i}</strong><em class="${r.passed?'pass':'fail'}">${r.passed?'✓ Pass':'× Fail'}</em></span></button>`).join('')}</div><div class="reflection-tabs" role="group" aria-label="Reflection rounds for ${esc(data.prompt)}">${data.rounds.slice(1).map((_,i)=>`<button type="button" data-index="${i+1}" aria-pressed="${i+1===initial}" aria-controls="details-${esc(data.id)}">Round ${i+1}</button>`).join('')}</div><div class="case-inline-detail" id="details-${esc(data.id)}" role="region" aria-label="Reflection round ${initial} details" tabindex="0">${caseDetail(data,initial)}</div></article>`;
}
document.getElementById('case-study-grid').innerHTML=allCases.map(caseCard).join('');
document.getElementById('case-filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;pressed('case-filters','filter',b.dataset.filter);document.querySelectorAll('.case-card').forEach(c=>c.hidden=b.dataset.filter!=='All'&&c.dataset.task!==b.dataset.filter)});
const caseGrid=document.getElementById('case-study-grid');
caseGrid.addEventListener('click',e=>{
  const b=e.target.closest('button[data-index]');if(!b)return;
  const card=b.closest('.case-card'),data=allCases.find(c=>String(c.id)===card.dataset.case),index=Number(b.dataset.index);
  card.querySelectorAll('[data-index]').forEach(x=>{x.setAttribute('aria-pressed',String(Number(x.dataset.index)===index));x.classList.toggle('is-source',x.classList.contains('case-round')&&index>0&&Number(x.dataset.index)===index-1)});
  const detail=card.querySelector('.case-inline-detail');detail.innerHTML=caseDetail(data,index);detail.setAttribute('aria-label',index?`Reflection round ${index} details`:'Original generation details');detail.scrollTop=0;
});


document.getElementById('repair-reel').addEventListener('click',e=>{const link=e.target.closest('a[href^="#"]');if(!link)return;pressed('case-filters','filter','All');document.querySelectorAll('.case-card').forEach(c=>c.hidden=false);const target=document.querySelector(link.hash);if(!target)return;e.preventDefault();history.replaceState(null,'',link.hash);target.scrollIntoView({behavior:'smooth',block:'start'})});

const methods={baseline:'Baseline',reflectionflow:'ReflectionFlow',flowgrpo:'Flow-GRPO',ours:'ReflectOPD (Ours)'};
const comparisonMethods=['baseline','reflectionflow','flowgrpo','ours'];
document.getElementById('comparison-matrix').innerHTML=COMP.map(row=>`
  <article class="ocr-extension-case" id="comparison-${esc(row.id)}" aria-labelledby="comparison-title-${esc(row.id)}">
    <div class="ocr-extension-case-head">
      <h3 id="comparison-title-${esc(row.id)}">${esc(row.label)}</h3><span>#${esc(row.id)}</span>
    </div>
    <p class="ocr-extension-prompt">“${esc(row.prompt)}”</p>
    <div class="ocr-extension-images">
      ${comparisonMethods.map(method=>{
        const im=row.images.find(image=>image.method===method);
        return `<figure class="ocr-extension-method ${method}">
          <figcaption>${methods[method]}</figcaption>
          <button class="zoom" data-zoom="${asset(im.image)}" data-title="${esc(methods[method]+': '+row.prompt)}" aria-label="${esc(methods[method]+': '+row.prompt)}">
            <img src="${asset(im.image)}" alt="${esc(methods[method]+': '+row.prompt)}" loading="lazy" decoding="async">
          </button>
        </figure>`;
      }).join('')}
    </div>
  </article>`).join('');

const oneig={diversity:{cols:['Anime','Human','Object','Text','Reasoning','Overall ↑'],rows:[['Base',.157,.194,.204,.257,.388,.238],['Flow-GRPO',.143,.166,.185,.214,.364,.213],['ReflectOPD',.181,.221,.245,.279,.412,.265]]},alignment:{cols:['Anime','Human','Object','Overall ↑'],rows:[['Base',.834,.791,.732,.789],['Flow-GRPO',.848,.803,.776,.811],['ReflectOPD',.831,.808,.736,.795]]}};
function oneigTable(title,d){return `<article class="oneig-table"><div class="table-wrap"><table aria-label="OneIG-Bench ${title}"><thead><tr><th scope="col" rowspan="2" class="oneig-method">Method</th><th scope="colgroup" colspan="${d.cols.length}" class="oneig-group">${title}</th></tr><tr>${d.cols.map(c=>`<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${d.rows.map(r=>`<tr class="${r[0]==='ReflectOPD'?'ours-row':''}"><th scope="row">${r[0]}</th>${r.slice(1).map(v=>`<td>${v.toFixed(3)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></article>`}
document.getElementById('oneig-tables').innerHTML=`<div class="oneig-table-grid">${oneigTable('Diversity ↑',oneig.diversity)}${oneigTable('Alignment ↑',oneig.alignment)}</div>`;

const diversityExamples={reasoning:{prompt:'Formation of karst landforms',scores:[.336,.235,.506]},human:{prompt:'A farmer in a tranquil, colorful scene',scores:[.335,.208,.398]},anime:{prompt:'A woman with red eyes and a scar behind prison bars',scores:[.147,.119,.254]}};
function diversityExample(key,d){return `<article class="diversity-example"><div class="diversity-example-head"><span>${esc(key)}</span><p>“${esc(d.prompt)}”</p></div><div class="diversity-gallery">${['FLUX.1-dev','Flow-GRPO','ReflectOPD (Ours)'].map((m,i)=>`<article class="diversity-card"><h4>${m}<span>DreamSim ${d.scores[i].toFixed(3)}</span></h4><div class="diversity-crop"><img src="${asset('diversity-'+key+'.jpg')}" alt="${esc(m+': four seeds for '+d.prompt)}" loading="lazy"></div></article>`).join('')}</div></article>`}
document.getElementById('diversity-examples').innerHTML=Object.entries(diversityExamples).map(([key,d])=>diversityExample(key,d)).join('');

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.site-header nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}),{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s));


// Replay entrances after a content block has fully left the viewport.
(() => {
  if (!('IntersectionObserver' in window)) return;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const selector = [
    'main .section-title', '.abstract-card', '.finding-grid > article',
    '.trajectory-callout', '#method-carousel', '.skill-evidence > article',
    '.benchmark-tiles > article', '.training-figure', '.result-model-group',
    '.case-card', '#comparison-matrix > .ocr-extension-case',
    '#task-extension .ocr-extension-case', '.rl-grid > figure',
    '.oneig-tables', '.diversity-example'
  ].join(',');
  const candidates = [...document.querySelectorAll(selector)];
  const blocks = candidates.filter(block => !candidates.some(parent => parent !== block && parent.contains(block)));
  const staggerGroups = ['finding-grid', 'benchmark-tiles', 'case-study-grid', 'rl-grid'];
  let revealObserver;
  let resetObserver;

  function reveal(block) {
    block.classList.remove('reveal-pending');
    block.classList.add('reveal-complete');

  }

  function reset(block) {
    if (block.contains(document.activeElement)) return;
    block.classList.remove('reveal-complete');
    block.classList.add('reveal-pending');
  }

  function enable() {
    if (motionPreference.matches) return;
    // Separate entry and exit bounds prevent replay while hovering at an edge.
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, { rootMargin: '-24px 0px -24px 0px', threshold: 0 });
    resetObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (!entry.isIntersecting) reset(entry.target); });
    }, { rootMargin: '64px 0px 64px 0px', threshold: 0 });
    blocks.forEach(block => {
      const parent = block.parentElement;
      if (staggerGroups.some(name => parent.classList.contains(name))) {
        const siblingIndex = [...parent.children].indexOf(block);
        block.style.setProperty('--reveal-delay', `${Math.min(siblingIndex % 4, 2) * 70}ms`);
      }
      block.classList.add('scroll-reveal');
      const bounds = block.getBoundingClientRect();
      // Preserve immediately visible content when loading at a saved position.
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) reveal(block);
      else reset(block);
      revealObserver.observe(block);
      resetObserver.observe(block);
    });
  }

  document.addEventListener('focusin', event => {
    const block = event.target.closest('.scroll-reveal.reveal-pending');
    if (block) reveal(block);
  });
  motionPreference.addEventListener('change', () => {
    revealObserver?.disconnect();
    resetObserver?.disconnect();
    if (motionPreference.matches) blocks.forEach(reveal);
    else enable();
  });
  enable();
})();
