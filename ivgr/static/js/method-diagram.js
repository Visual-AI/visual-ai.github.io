/* =============================================================================
   iVGR animated diagrams.
   - METHOD figure: a generic config-driven cascade engine (Diagram).
   - TEASER figure: a scripted, per-paradigm timeline engine (TeaserDiagram)
     with a typewriter effect for the chain-of-thought output.
   Each .mdgm element picks its engine via data-diagram="method|teaser".
   No dependencies.
   ============================================================================= */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function tok(base, sub, sup) {
    return base + "<span class='ss'><span class='su'>" + sup + "</span><span class='sl'>" + sub + "</span></span>";
  }
  function cell(html) { return "<span class='cell'>" + html + "</span>"; }
  function vdots() { return "<span class='vd'>⋮</span>"; }
  function stackO(sup) { return cell(tok("o", "1", sup)) + cell(tok("o", "2", sup)) + vdots() + cell(tok("o", "N", sup)); }
  function stack2(letter, sup) { return cell(tok(letter, "1", sup)) + vdots() + cell(tok(letter, "N", sup)); }

  /* ===================== METHOD config ===================== */
  var METHOD = (function () {
    var GP = "The reasoning process and answer are enclosed within &lt;think&gt; &lt;/think&gt; and &lt;answer&gt; &lt;/answer&gt; tags, respectively. When referring to particular objects in the reasoning process, the assistant MUST localize the object with bounding box coordinates between &lt;box&gt; and &lt;/box&gt; (e.g., &lt;box&gt;[x1,y1,x2,y2]&lt;/box&gt;).";
    var TP = "The reasoning process and answer are enclosed within &lt;think&gt; &lt;/think&gt; and &lt;answer&gt; &lt;/answer&gt; tags, respectively, i.e., &lt;think&gt; reasoning process here &lt;/think&gt; &lt;answer&gt; answer here &lt;/answer&gt;.";
    var NODES = {
      promptG:  { x: 14,  y: 10,  w: 288, h: 200, group: 1, cls: "is-prompt", html: GP },
      promptGl: { x: 14,  y: 212, w: 288, h: 22,  group: 1, cls: "is-note", html: "Prompt of Grounded CoT" },
      query:    { x: 16,  y: 310, w: 80,  h: 48,  group: 1, cls: "is-plain", html: "query" },
      policy:   { x: 108, y: 300, w: 152, h: 72,  group: 1, cls: "is-policy", html: "<span class='ttl'>Policy MLLM</span><small>shared, trained</small>" },
      promptTl: { x: 14,  y: 394, w: 288, h: 22,  group: 1, cls: "is-note", html: "Prompt of Textual CoT" },
      promptT:  { x: 14,  y: 418, w: 288, h: 180, group: 1, cls: "is-prompt", html: TP },
      streamGl: { x: 310, y: 92,  w: 84,  h: 46,  group: 2, cls: "is-streamlabel", html: "Grounded<br>Stream" },
      rollG:    { x: 400, y: 18,  w: 82,  h: 188, group: 2, cls: "is-stack", html: stackO("b") },
      refModelG:{ x: 522, y: 22,  w: 140, h: 44,  group: 2, cls: "is-gray", html: "Reference Model" },
      rfnG:     { x: 522, y: 92,  w: 140, h: 72,  group: 2, cls: "is-rfn", html: "Reward Function" },
      rwFmtG:   { x: 692, y: 18,  w: 132, h: 42,  group: 2, cls: "is-reward", html: "Format Reward" },
      rwAccG:   { x: 692, y: 70,  w: 132, h: 42,  group: 2, cls: "is-reward", html: "Accuracy Reward" },
      rwBoxG:   { x: 692, y: 122, w: 132, h: 42,  group: 2, cls: "is-reward", html: "Box / IoU Reward" },
      RG:       { x: 854, y: 36,  w: 82,  h: 152, group: 2, cls: "is-stack is-rstack", html: stack2("R", "b") },
      gnG:      { x: 960, y: 74,  w: 120, h: 72,  group: 6, cls: "is-gn", html: "<span class='ttl'>Group<br>Normalize</span>" },
      AG:       { x: 1104,y: 36,  w: 82,  h: 152, group: 6, cls: "is-stack is-astack", html: stack2("A", "b") },
      selectR:  { x: 402, y: 250, w: 158, h: 106, group: 4, cls: "is-select", html: "<span class='ttl'>Select Rollout</span><small>format reward = 1?<br>acc reward = 1?<br>box reward &gt; τ</small>" },
      archive:  { x: 598, y: 248, w: 190, h: 76,  group: 4, cls: "is-archive", html: "<span class='ttl'>Rollout Archive</span><span class='rows'><i></i><i></i><i></i></span>" },
      refCoT:   { x: 978, y: 250, w: 204, h: 88,  group: 4, cls: "is-cot", html: "<b>Reference CoT</b><span class='mono'>&lt;think&gt;…&lt;box&gt;[x1,y1,x2,y2]&lt;/box&gt;…&lt;/think&gt; &lt;answer&gt;…&lt;/answer&gt;</span>" },
      textCoT:  { x: 402, y: 368, w: 184, h: 54,  group: 5, cls: "is-cot", html: "<span class='mono'>&lt;think&gt;…&lt;/think&gt; &lt;answer&gt;…&lt;/answer&gt;</span>" },
      judge:    { x: 622, y: 362, w: 168, h: 60,  group: 5, cls: "is-judge", html: "<span class='ttl'>LLM Judge</span><small>Qwen2.5-72B</small>" },
      streamTl: { x: 310, y: 540, w: 84,  h: 46,  group: 3, cls: "is-streamlabel", html: "Textual<br>Stream" },
      rollT:    { x: 400, y: 466, w: 82,  h: 182, group: 3, cls: "is-stack", html: stackO("t") },
      rfnT:     { x: 522, y: 470, w: 140, h: 72,  group: 3, cls: "is-rfn", html: "Reward Function" },
      rwConsT:  { x: 692, y: 450, w: 132, h: 42,  group: 5, cls: "is-reward is-consistency", html: "Consistency Reward" },
      rwAccT:   { x: 692, y: 502, w: 132, h: 42,  group: 3, cls: "is-reward", html: "Accuracy Reward" },
      rwFmtT:   { x: 692, y: 554, w: 132, h: 42,  group: 3, cls: "is-reward", html: "Format Reward" },
      refModelT:{ x: 522, y: 566, w: 140, h: 44,  group: 3, cls: "is-gray", html: "Reference Model" },
      RT:       { x: 854, y: 470, w: 82,  h: 152, group: 5, cls: "is-stack is-rstack", html: stack2("R", "t") },
      gnT:      { x: 960, y: 486, w: 120, h: 72,  group: 6, cls: "is-gn", html: "<span class='ttl'>Group<br>Normalize</span>" },
      AT:       { x: 1104,y: 470, w: 82,  h: 152, group: 6, cls: "is-stack is-astack", html: stack2("A", "t") }
    };
    var BAND = { x: 382, y: 212, w: 818, h: 218, tag: "Consistency Reward" };
    var WIRES = [
      { from: "query",   fs: "r", to: "policy",  ts: "l", group: 1, flow: 1 },
      { from: "promptG", fs: "b", to: "policy",  ts: "t", group: 1, ft: 0.5, tt: 0.35 },
      { from: "promptT", fs: "t", to: "policy",  ts: "b", group: 1, ft: 0.5, tt: 0.35 },
      { from: "policy",  fs: "r", to: "rollG",   ts: "l", group: 2, flow: 1, ft: 0.2, tt: 0.82 },
      { from: "rollG",   fs: "r", to: "refModelG", ts: "l", group: 2, ft: 0.12 },
      { from: "rollG",   fs: "r", to: "rfnG",    ts: "l", group: 2, flow: 1, ft: 0.85 },
      { from: "rfnG",    fs: "r", to: "rwFmtG",  ts: "l", group: 2, ft: 0.2 },
      { from: "rfnG",    fs: "r", to: "rwAccG",  ts: "l", group: 2 },
      { from: "rfnG",    fs: "r", to: "rwBoxG",  ts: "l", group: 2, ft: 0.8 },
      { from: "rwFmtG",  fs: "r", to: "RG",      ts: "l", group: 2, flow: 1, tt: 0.22 },
      { from: "rwAccG",  fs: "r", to: "RG",      ts: "l", group: 2, flow: 1 },
      { from: "rwBoxG",  fs: "r", to: "RG",      ts: "l", group: 2, flow: 1, tt: 0.78 },
      { from: "policy",  fs: "r", to: "rollT",   ts: "l", group: 3, flow: 1, ft: 0.8, tt: 0.18 },
      { from: "rollT",   fs: "r", to: "rfnT",    ts: "l", group: 3, flow: 1, ft: 0.18 },
      { from: "rollT", fs: "r", to: "refModelT", ts: "l", group: 3, flow: 1, ft: 0.85 },
      { from: "rfnT",    fs: "r", to: "rwAccT",  ts: "l", group: 3 },
      { from: "rfnT",    fs: "r", to: "rwFmtT",  ts: "l", group: 3, ft: 0.8 },
      { from: "rwConsT", fs: "r", to: "RT",      ts: "l", group: 5, flow: 1, tt: 0.22 },
      { from: "rwAccT",  fs: "r", to: "RT",      ts: "l", group: 5, flow: 1 },
      { from: "rwFmtT",  fs: "r", to: "RT",      ts: "l", group: 5, flow: 1, tt: 0.78 },
      { from: "rfnG",    fs: "b", to: "selectR", ts: "t", group: 4, flow: 1 },
      { from: "selectR", fs: "r", to: "archive", ts: "l", group: 4, kind: "green", flow: 1 },
      { from: "archive", fs: "r", to: "refCoT",  ts: "l", group: 4, kind: "green", flow: 1 },
      { from: "rollT",   fs: "t", to: "textCoT", ts: "b", group: 5, ft: 0.5, tt: 0.5 },
      { from: "textCoT", fs: "r", to: "judge",   ts: "l", group: 5, kind: "green", flow: 1 },
      { from: "refCoT",  fs: "b", to: "judge",   ts: "r", group: 5, kind: "green", flow: 1, tt: 0.4 },
      { from: "judge",   fs: "b", to: "rwConsT", ts: "l", group: 5, kind: "green", flow: 1, ft: 0.6 },
      { from: "RG",  fs: "r", to: "gnG", ts: "l", group: 6, flow: 1 },
      { from: "gnG", fs: "r", to: "AG",  ts: "l", group: 6, flow: 1 },
      { from: "RT",  fs: "r", to: "gnT", ts: "l", group: 6, flow: 1 },
      { from: "gnT", fs: "r", to: "AT",  ts: "l", group: 6, flow: 1 },
      { from: "AG",  fs: "t", to: "policy", ts: "t", group: 6, kind: "orange", flow: 1, ft: 0.5, tt: 0.65, via: [{ x: 1145, y: 8 }, { x: 195, y: 8 }] },
      { from: "AT",  fs: "b", to: "policy", ts: "b", group: 6, kind: "orange", flow: 1, ft: 0.5, tt: 0.65, via: [{ x: 1145, y: 672 }, { x: 195, y: 672 }] }
    ];
    var CAPTIONS = [
      "Each query is rolled out by the policy MLLM under both prompts.",
      "Grounded stream: roll out CoTs with boxes; reward format, accuracy, and box-IoU.",
      "Textual stream: roll out plain-text CoTs; reward format and accuracy.",
      "Keep valid, accurate, well-localized grounded CoTs; archive the best per query.",
      "An LLM judge scores the textual CoT vs. the archived grounded reference → consistency reward.",
      "Group-normalize the rewards into advantages (GRPO) and update the policy."
    ];
    return { VW: 1280, VH: 680, NODES: NODES, BAND: BAND, WIRES: WIRES, CAPTIONS: CAPTIONS };
  })();

  /* ===================== TEASER config (scripted) ===================== */
  var TEASER = (function () {
    function robot() { return "<img class='mdgm-robot' src='./static/images/robot.png' alt='MLLM' draggable='false'>"; }
    /* chain-of-thought segments: {t: raw text, c: optional color class} */
    var SEG = {
      oa:  [{ t: "<think>… " }, { t: "<tool_call>[x1,y1,x2,y2]</tool_call>", c: "rd" }, { t: " …</think> <answer>…</answer>" }],
      ob:  [{ t: "<think>… object " }, { t: "<box>[x1,y1,x2,y2]</box>", c: "rd" }, { t: " …</think> <answer>…</answer>" }],
      ocg: [{ t: "<think>… object " }, { t: "<box>[x1,y1,x2,y2]</box>", c: "rd" }, { t: " …</think> <answer>…</answer>" }],
      oct: [{ t: "<think>… </think> <answer>…</answer>" }]
    };
    function slen(seg) { return seg.reduce(function (s, p) { return s + p.t.length; }, 0); }
    var aP1 = SEG.oa[0].t.length + SEG.oa[1].t.length;   /* (a): pause right after </tool_call> */
    var W = 700;
    var NODES = {
      /* (a) crop tools */
      qa:    { x: 14,  y: 86,  w: 80,  h: 46, cls: "is-plain", html: "query" },
      ra:    { x: 196, y: 72,  w: 70,  h: 70, cls: "is-robot", html: robot() },
      crops: { x: 150, y: 30,  w: 100, h: 22, cls: "is-crops", html: "crops" },
      oa:    { x: 302, y: 80,  w: 300, h: 56, cls: "is-cotbox" },
      capa:  { x: 0,   y: 148, w: W,   h: 44, cls: "is-figcap", html: "(a) Visually Grounded CoT with Tools (Crop)<span class='cap-sub'>“Think with Images” &middot; <span class='oai'>OpenAI o3</span></span>" },
      /* (b) explicit boxes */
      qb:    { x: 14,  y: 288, w: 80,  h: 46, cls: "is-plain", html: "query" },
      rb:    { x: 196, y: 274, w: 70,  h: 70, cls: "is-robot", html: robot() },
      ob:    { x: 302, y: 284, w: 300, h: 52, cls: "is-cotbox" },
      capb:  { x: 0,   y: 348, w: W,   h: 44, cls: "is-figcap", html: "(b) Visually Grounded CoT without Tools<span class='cap-sub'>“Think with Visual Primitives” &middot; <span class='dsk'>DeepSeek</span></span>" },
      /* (c) iVGR (ours) */
      qc:    { x: 14,  y: 504, w: 80,  h: 46, cls: "is-plain", html: "query" },
      rc:    { x: 196, y: 492, w: 70,  h: 70, cls: "is-robot", html: robot() },
      ocg:   { x: 302, y: 410, w: 300, h: 56, cls: "is-cotbox" },
      consLabel: { x: 300, y: 470, w: 304, h: 66, cls: "is-conslabel", html: "<span class='dbl'>⇕</span> Consistency Reward" },
      oct:   { x: 302, y: 540, w: 300, h: 52, cls: "is-cotbox" },
      capc:  { x: 0,   y: 602, w: W,   h: 22, cls: "is-figcap", html: "(c) iVGR (ours)" }
    };
    var WIRES = {
      a_q:     { from: "qa", fs: "r", to: "ra", ts: "l" },
      a_o:     { from: "ra", fs: "r", to: "oa", ts: "l", ft: 0.4, tt: 0.4 },
      a_crops: { from: "oa", fs: "t", to: "ra", ts: "t", kind: "orange", ft: 0.06, via: [{ x: 320, y: 34 }, { x: 231, y: 34 }] },
      a_o2:    { from: "ra", fs: "r", to: "oa", ts: "l", kind: "orange", ft: 0.78, tt: 0.74 },
      b_q:     { from: "qb", fs: "r", to: "rb", ts: "l" },
      b_o:     { from: "rb", fs: "r", to: "ob", ts: "l" },
      c_q:     { from: "qc", fs: "r", to: "rc", ts: "l" },
      c_og:    { from: "rc", fs: "r", to: "ocg", ts: "l", ft: 0.28, tt: 0.6 },
      c_ot:    { from: "rc", fs: "r", to: "oct", ts: "l", ft: 0.72, tt: 0.4 }
    };
    var SCRIPT = [
      [ { k: "show", id: "qa" }, { k: "wire", id: "a_q" }, { k: "show", id: "ra" },
        { k: "wire", id: "a_o" }, { k: "show", id: "oa" }, { k: "type", id: "oa", from: 0, to: aP1, keep: true },
        { k: "wait", ms: 550 },
        { k: "wire", id: "a_crops" }, { k: "show", id: "crops" },
        { k: "wait", ms: 450 },
        { k: "wire", id: "a_o2" },
        { k: "type", id: "oa", from: aP1, to: slen(SEG.oa), keep: false },
        { k: "show", id: "capa" } ],
      [ { k: "show", id: "qb" }, { k: "wire", id: "b_q" }, { k: "show", id: "rb" },
        { k: "wire", id: "b_o" }, { k: "show", id: "ob" }, { k: "type", id: "ob", from: 0, to: slen(SEG.ob), keep: false },
        { k: "show", id: "capb" } ],
      [ { k: "show", id: "qc" }, { k: "wire", id: "c_q" }, { k: "show", id: "rc" },
        { k: "wire", id: "c_og" }, { k: "show", id: "ocg" }, { k: "type", id: "ocg", from: 0, to: slen(SEG.ocg), keep: false },
        { k: "wait", ms: 350 },
        { k: "wire", id: "c_ot" }, { k: "show", id: "oct" }, { k: "type", id: "oct", from: 0, to: slen(SEG.oct), keep: false },
        { k: "wait", ms: 350 },
        { k: "show", id: "consLabel" }, { k: "show", id: "capc" } ]
    ];
    var CAPTIONS = [
      "Paradigm 1 (crop tools): the model “thinks with images”, calling a tool to crop a region, then continues.",
      "Paradigm 2 (explicit boxes): bounding-box coordinates are interleaved directly in the chain-of-thought.",
      "iVGR (ours): a grounded stream and a textual stream, aligned by a consistency reward, to reason in pure text at inference."
    ];
    return { VW: 700, VH: 632, NODES: NODES, WIRES: WIRES, SEG: SEG, SCRIPT: SCRIPT, CAPTIONS: CAPTIONS };
  })();

  /* ===================== shared geometry ===================== */
  function pc(v, t) { return (v / t * 100) + "%"; }
  function dir(s) { return s === "l" ? { x: -1, y: 0 } : s === "r" ? { x: 1, y: 0 } : s === "t" ? { x: 0, y: -1 } : { x: 0, y: 1 }; }
  function anchor(nodes, id, side, t) {
    var n = nodes[id]; if (t == null) t = 0.5;
    if (side === "l") return { x: n.x, y: n.y + n.h * t };
    if (side === "r") return { x: n.x + n.w, y: n.y + n.h * t };
    if (side === "t") return { x: n.x + n.w * t, y: n.y };
    return { x: n.x + n.w * t, y: n.y + n.h };
  }
  function pathFor(nodes, w) {
    var a = anchor(nodes, w.from, w.fs, w.ft), b = anchor(nodes, w.to, w.ts, w.tt);
    if (w.via) return "M " + [a].concat(w.via, [b]).map(function (p) { return p.x + " " + p.y; }).join(" L ");
    var dist = Math.hypot(b.x - a.x, b.y - a.y), k = Math.max(28, dist * 0.42);
    var da = dir(w.fs), db = dir(w.ts);
    return "M " + a.x + " " + a.y + " C " + (a.x + da.x * k) + " " + (a.y + da.y * k) + " " +
           (b.x + db.x * k) + " " + (b.y + db.y * k) + " " + b.x + " " + b.y;
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function svgEl(t) { return document.createElementNS(NS, t); }
  function markers(svg) {
    var defs = svgEl("defs");
    [["mdgm-ar", "#243044"], ["mdgm-ar-green", "#2f9e57"], ["mdgm-ar-orange", "#e8902a"]].forEach(function (m) {
      var mk = svgEl("marker");
      mk.setAttribute("id", m[0]); mk.setAttribute("markerWidth", "9"); mk.setAttribute("markerHeight", "9");
      mk.setAttribute("refX", "7"); mk.setAttribute("refY", "4.5"); mk.setAttribute("orient", "auto"); mk.setAttribute("markerUnits", "userSpaceOnUse");
      var p = svgEl("path"); p.setAttribute("d", "M1,1 L8,4.5 L1,8 z"); p.setAttribute("fill", m[1]);
      mk.appendChild(p); defs.appendChild(mk);
    });
    /* green marker that also works as a start-cap (auto-start-reverse) for double arrows */
    var mk2 = svgEl("marker");
    mk2.setAttribute("id", "mdgm-ar-green2"); mk2.setAttribute("markerWidth", "9"); mk2.setAttribute("markerHeight", "9");
    mk2.setAttribute("refX", "7"); mk2.setAttribute("refY", "4.5"); mk2.setAttribute("orient", "auto-start-reverse"); mk2.setAttribute("markerUnits", "userSpaceOnUse");
    var p2 = svgEl("path"); p2.setAttribute("d", "M1,1 L8,4.5 L1,8 z"); p2.setAttribute("fill", "#2f9e57");
    mk2.appendChild(p2); defs.appendChild(mk2);
    svg.appendChild(defs);
  }
  function markerFor(w) { return "url(#" + (w.kind === "green" ? "mdgm-ar-green" : w.kind === "orange" ? "mdgm-ar-orange" : "mdgm-ar") + ")"; }
  function wireClass(w) { return "mdgm__wire-g" + (w.kind === "green" ? " is-green" : w.kind === "orange" ? " is-orange" : ""); }

  /* ===================== METHOD: generic cascade engine ===================== */
  function build(stage, cfg) {
    var VW = cfg.VW, VH = cfg.VH, NODES = cfg.NODES;
    if (cfg.BAND) {
      var band = el("div", "mdgm__band"); band.dataset.group = 4;
      band.style.left = pc(cfg.BAND.x, VW); band.style.top = pc(cfg.BAND.y, VH);
      band.style.width = pc(cfg.BAND.w, VW); band.style.height = pc(cfg.BAND.h, VH);
      band.appendChild(el("span", "band-tag", cfg.BAND.tag));
      stage.appendChild(band);
    }
    var svg = svgEl("svg");
    svg.setAttribute("class", "mdgm__wires"); svg.setAttribute("viewBox", "0 0 " + VW + " " + VH);
    svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true");
    markers(svg);
    cfg.WIRES.forEach(function (w) {
      var g = svgEl("g"); g.setAttribute("class", wireClass(w)); g.dataset.group = w.group;
      var a = anchor(NODES, w.from, w.fs, w.ft), b = anchor(NODES, w.to, w.ts, w.tt);
      g.dataset.ord = Math.max(a.x, b.x);
      var p = svgEl("path"); p.setAttribute("d", pathFor(NODES, w)); p.setAttribute("marker-end", markerFor(w));
      g.appendChild(p); svg.appendChild(g);
    });
    stage.appendChild(svg);
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id], node = el("div", "mdgm__node " + (n.cls || ""), n.html);
      node.dataset.group = n.group; node.dataset.ord = n.x;
      node.style.left = pc(n.x, VW); node.style.top = pc(n.y, VH);
      node.style.width = pc(n.w, VW); node.style.height = pc(n.h, VH);
      stage.appendChild(node);
    });
  }
  function Diagram(root, cfg) {
    this.root = root; this.cfg = cfg;
    this.stage = root.querySelector(".mdgm__stage");
    build(this.stage, cfg);
    this.items = Array.prototype.slice.call(this.stage.querySelectorAll("[data-group]"));
    this.captionEl = root.querySelector(".mdgm__caption .cap-text");
    this.stepNoEl = root.querySelector(".mdgm__caption .step-no");
    this.dots = Array.prototype.slice.call(root.querySelectorAll(".mdgm__dots button"));
    this.playBtn = root.querySelector('[data-act="play"]');
    this.N = this.items.reduce(function (m, it) { return Math.max(m, +it.dataset.group); }, 1);
    this.step = 1; this.playing = false; this.userPaused = false;
    this.staggerTimers = []; this.advTimer = null; this.cascadeMs = 0;
    this.STAGGER = 135; this.BASE = 60; this.DRAW = 560; this.DWELL = 2200;
    this.staticMode = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bindControls(this);
    if (this.staticMode) { this.root.classList.add("mdgm--static"); this.renderStatic(); }
    else { this.render(1); this.observe(); }
  }
  function showNow(it) { it.classList.remove("is-current"); it.classList.add("instant", "is-shown"); }
  function hideNow(it) { it.classList.remove("is-current"); it.classList.add("instant"); it.classList.remove("is-shown"); }
  function revealAnim(it) { it.classList.remove("instant"); it.classList.add("is-shown", "is-current"); }
  Diagram.prototype.clearStagger = function () { this.staggerTimers.forEach(clearTimeout); this.staggerTimers = []; };
  Diagram.prototype.setMeta = function (step) { setMetaShared(this, step); };
  Diagram.prototype.renderStatic = function () {
    this.items.forEach(function (it) { it.classList.add("instant", "is-shown"); });
    this.setMeta(this.N);
  };
  Diagram.prototype.render = function (step) {
    if (step < 1) step = this.N; if (step > this.N) step = 1;
    this.step = step; this.clearStagger();
    var cur = [];
    this.items.forEach(function (it) {
      var g = +it.dataset.group;
      if (g < step) showNow(it); else if (g > step) hideNow(it); else { hideNow(it); cur.push(it); }
    });
    cur.sort(function (a, b) { return (+a.dataset.ord) - (+b.dataset.ord); });
    void this.stage.offsetWidth;
    var self = this;
    cur.forEach(function (it, i) { self.staggerTimers.push(setTimeout(function () { revealAnim(it); }, self.BASE + i * self.STAGGER)); });
    this.cascadeMs = this.BASE + Math.max(0, cur.length - 1) * this.STAGGER + this.DRAW;
    this.setMeta(step);
  };
  Diagram.prototype.next = function () { this.render(this.step % this.N + 1); };
  Diagram.prototype.prev = function () { this.render((this.step + this.N - 2) % this.N + 1); };
  Diagram.prototype.scheduleNext = function () {
    clearTimeout(this.advTimer); var self = this;
    this.advTimer = setTimeout(function () { if (!self.playing) return; self.next(); self.scheduleNext(); }, this.cascadeMs + this.DWELL);
  };
  Diagram.prototype.play = function () {
    if (this.staticMode || this.playing) return;
    this.playing = true; this.userPaused = false; this.setPlayIcon(true); this.scheduleNext();
  };
  Diagram.prototype.pause = function (byUser) { pauseShared(this, byUser); };
  Diagram.prototype.toggle = function () { this.playing ? this.pause(true) : this.play(); };
  Diagram.prototype.setPlayIcon = function (p) { setPlayIconShared(this, p); };
  Diagram.prototype._stop = function () { this.playing = false; this.setPlayIcon(false); clearTimeout(this.advTimer); this.advTimer = null; };
  Diagram.prototype.observe = function () { observeShared(this); };

  /* ===================== TEASER: scripted timeline engine ===================== */
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function renderCot(seg, n, cursor) {
    var out = "", count = 0;
    for (var i = 0; i < seg.length && count < n; i++) {
      var take = Math.min(seg[i].t.length, n - count);
      var chunk = esc(seg[i].t.slice(0, take));
      out += seg[i].c ? "<span class='" + seg[i].c + "'>" + chunk + "</span>" : chunk;
      count += take;
    }
    if (cursor) out += "<span class='cot-cursor'></span>";
    return out;
  }
  function buildTeaser(stage, cfg) {
    var VW = cfg.VW, VH = cfg.VH, NODES = cfg.NODES, WIRES = cfg.WIRES, nodeEl = {}, wireEl = {};
    var svg = svgEl("svg");
    svg.setAttribute("class", "mdgm__wires"); svg.setAttribute("viewBox", "0 0 " + VW + " " + VH);
    svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true");
    markers(svg);
    Object.keys(WIRES).forEach(function (id) {
      var w = WIRES[id], g = svgEl("g"); g.setAttribute("class", wireClass(w));
      var p = svgEl("path"); p.setAttribute("d", pathFor(NODES, w));
      if (w.double) { p.setAttribute("marker-start", "url(#mdgm-ar-green2)"); p.setAttribute("marker-end", "url(#mdgm-ar-green2)"); }
      else p.setAttribute("marker-end", markerFor(w));
      g.appendChild(p); svg.appendChild(g); wireEl[id] = g;
    });
    stage.appendChild(svg);
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id], node = el("div", "mdgm__node " + (n.cls || ""), n.html || "");
      node.style.left = pc(n.x, VW); node.style.top = pc(n.y, VH);
      node.style.width = pc(n.w, VW); node.style.height = pc(n.h, VH);
      stage.appendChild(node); nodeEl[id] = node;
    });
    return { nodeEl: nodeEl, wireEl: wireEl };
  }
  function TeaserDiagram(root, cfg) {
    this.root = root; this.cfg = cfg;
    this.stage = root.querySelector(".mdgm__stage");
    var b = buildTeaser(this.stage, cfg); this.nodeEl = b.nodeEl; this.wireEl = b.wireEl;
    this.captionEl = root.querySelector(".mdgm__caption .cap-text");
    this.stepNoEl = root.querySelector(".mdgm__caption .step-no");
    this.dots = Array.prototype.slice.call(root.querySelectorAll(".mdgm__dots button"));
    this.playBtn = root.querySelector('[data-act="play"]');
    this.N = cfg.SCRIPT.length; this.step = 1; this.playing = false; this.userPaused = false;
    this.timers = []; this.advTimer = null; this.stepDur = 0;
    this.SHOW_GAP = 170; this.WIRE_GAP = 430; this.MSPC = 24; this.DWELL = 1500;
    this.staticMode = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bindControls(this);
    if (this.staticMode) { this.root.classList.add("mdgm--static"); this.showAll(); this.setMeta(this.N); }
    else { this.hideAll(); this.setMeta(1); this.observe(); }
  }
  TeaserDiagram.prototype.clearStagger = function () { this.timers.forEach(clearTimeout); this.timers = []; };
  TeaserDiagram.prototype.at = function (delay, fn) { this.timers.push(setTimeout(fn, delay)); };
  TeaserDiagram.prototype.setMeta = function (step) { setMetaShared(this, step); };
  TeaserDiagram.prototype.nodeShow = function (id, instant) { var e = this.nodeEl[id]; if (!e) return; if (instant) e.classList.add("instant"); else e.classList.remove("instant"); e.classList.remove("is-current"); e.classList.add("is-shown"); };
  TeaserDiagram.prototype.nodeHide = function (id) { var e = this.nodeEl[id]; if (!e) return; e.classList.add("instant"); e.classList.remove("is-shown", "is-current"); };
  TeaserDiagram.prototype.wireShow = function (id, instant, flow) { var e = this.wireEl[id]; if (!e) return; if (instant) e.classList.add("instant"); else e.classList.remove("instant"); e.classList.toggle("is-current", !!flow); e.classList.add("is-shown"); };
  TeaserDiagram.prototype.wireHide = function (id) { var e = this.wireEl[id]; if (!e) return; e.classList.add("instant"); e.classList.remove("is-shown", "is-current"); };
  TeaserDiagram.prototype.setCot = function (id, n, cursor) { var e = this.nodeEl[id]; if (e) e.innerHTML = renderCot(this.cfg.SEG[id], n, cursor); };
  TeaserDiagram.prototype.hideAll = function () {
    var self = this;
    Object.keys(this.nodeEl).forEach(function (id) { self.nodeHide(id); if (self.cfg.SEG[id]) self.setCot(id, 0, false); });
    Object.keys(this.wireEl).forEach(function (id) { self.wireHide(id); });
    void this.stage.offsetWidth;
  };
  TeaserDiagram.prototype.showAll = function () {
    var self = this;
    Object.keys(this.nodeEl).forEach(function (id) { self.nodeShow(id, true); if (self.cfg.SEG[id]) self.setCot(id, 9999, false); });
    Object.keys(this.wireEl).forEach(function (id) { self.wireShow(id, true, false); });
  };
  TeaserDiagram.prototype.runScript = function (step, instant) {
    var actions = this.cfg.SCRIPT[step - 1], self = this, t = 0;
    actions.forEach(function (ac) {
      if (instant) {
        if (ac.k === "show") self.nodeShow(ac.id, true);
        else if (ac.k === "wire") self.wireShow(ac.id, true, false);
        else if (ac.k === "type") self.setCot(ac.id, ac.to, false);
      } else {
        if (ac.k === "show") { (function (id, at0) { self.at(at0, function () { self.nodeShow(id, false); }); })(ac.id, t); t += self.SHOW_GAP; }
        else if (ac.k === "wire") { (function (id, at0) { self.at(at0, function () { self.wireShow(id, false, true); }); })(ac.id, t); t += self.WIRE_GAP; }
        else if (ac.k === "type") {
          for (var i = ac.from + 1; i <= ac.to; i++) {
            (function (id, n, at0, last) { self.at(at0, function () { self.setCot(id, n, last ? ac.keep : true); }); })(ac.id, i, t + (i - ac.from) * self.MSPC, i === ac.to);
          }
          t += (ac.to - ac.from) * self.MSPC + 140;
        } else if (ac.k === "wait") { t += ac.ms; }
      }
    });
    if (!instant) this.stepDur = t;
  };
  TeaserDiagram.prototype.render = function (step) {
    if (step < 1) step = this.N; if (step > this.N) step = 1;
    this.step = step; this.clearStagger(); this.hideAll();
    for (var k = 1; k < step; k++) this.runScript(k, true);
    this.runScript(step, false);
    this.setMeta(step);
  };
  TeaserDiagram.prototype.next = function () { this.render(this.step % this.N + 1); };
  TeaserDiagram.prototype.prev = function () { this.render((this.step + this.N - 2) % this.N + 1); };
  TeaserDiagram.prototype.scheduleAdvance = function () {
    clearTimeout(this.advTimer); var self = this;
    this.advTimer = setTimeout(function () { if (!self.playing) return; self.next(); self.scheduleAdvance(); }, this.stepDur + this.DWELL);
  };
  TeaserDiagram.prototype.play = function () {
    if (this.staticMode || this.playing) return;
    this.playing = true; this.userPaused = false; this.setPlayIcon(true);
    this.render(this.step); this.scheduleAdvance();
  };
  TeaserDiagram.prototype.pause = function (byUser) { this.playing = false; if (byUser) this.userPaused = true; this.setPlayIcon(false); clearTimeout(this.advTimer); this.advTimer = null; };
  TeaserDiagram.prototype.toggle = function () { this.playing ? this.pause(true) : this.play(); };
  TeaserDiagram.prototype.setPlayIcon = function (p) { setPlayIconShared(this, p); };
  TeaserDiagram.prototype._stop = function () { this.playing = false; this.setPlayIcon(false); clearTimeout(this.advTimer); this.advTimer = null; this.clearStagger(); };
  TeaserDiagram.prototype.observe = function () { observeShared(this); };

  /* ===================== shared controller bits ===================== */
  function setMetaShared(self, step) {
    if (self.captionEl) self.captionEl.innerHTML = self.cfg.CAPTIONS[step - 1];
    if (self.stepNoEl) self.stepNoEl.textContent = step + "/" + self.N;
    self.dots.forEach(function (d, i) { d.setAttribute("aria-selected", String(i === step - 1)); });
    self.stage.dataset.step = step;
  }
  function setPlayIconShared(self, playing) {
    if (!self.playBtn) return;
    self.playBtn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    self.playBtn.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
    self.playBtn.setAttribute("aria-pressed", String(playing));
  }
  function pauseShared(self, byUser) { self.playing = false; if (byUser) self.userPaused = true; self.setPlayIcon(false); clearTimeout(self.advTimer); self.advTimer = null; }
  function observeShared(self) {
    if (!("IntersectionObserver" in window)) { self.play(); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > 0.3) { if (!self.userPaused) self.play(); }
        else if (self.playing) self._stop();
      });
    }, { threshold: [0, 0.3, 1] }).observe(self.stage);
    document.addEventListener("visibilitychange", function () { if (document.hidden) self._stop(); else if (!self.userPaused) self.play(); });
  }
  function bindControls(self) {
    self.root.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-act],[data-goto]"); if (!b) return;
      if (b.dataset.act === "play") self.toggle();
      else if (b.dataset.act === "next") { self.pause(true); self.next(); }
      else if (b.dataset.act === "prev") { self.pause(true); self.prev(); }
      else if (b.dataset.goto) { self.pause(true); self.render(+b.dataset.goto); }
    });
    self.root.addEventListener("keydown", function (ev) {
      var k = ev.key;
      if (k === "ArrowRight") { ev.preventDefault(); self.pause(true); self.next(); }
      else if (k === "ArrowLeft") { ev.preventDefault(); self.pause(true); self.prev(); }
      else if (k === " " || k === "Enter") { if (ev.target.closest(".mdgm__dots,[data-act]")) return; ev.preventDefault(); self.toggle(); }
      else if (k === "Home") { ev.preventDefault(); self.pause(true); self.render(1); }
      else if (k === "End") { ev.preventDefault(); self.pause(true); self.render(self.N); }
    });
  }

  function init() {
    document.querySelectorAll(".mdgm").forEach(function (root) {
      if (!root.querySelector(".mdgm__stage")) return;
      if (root.dataset.diagram === "teaser") new TeaserDiagram(root, TEASER);
      else new Diagram(root, METHOD);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
