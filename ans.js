"use strict";
/* 問題データは data.js */

const $app = document.getElementById("app");
const $toc = document.getElementById("toc");

$app.innerHTML = questions.map((q, qi) => {
  let idx = 0;
  const parts = q.parts.map(p => {
    // マーク欄の記号（ア，イ，…）と正解の対応
    const marks = [];
    p.tpl.forEach(t => { if (isSlot(t)) marks.push(LABELS[idx++]); });
    const key = marks.map((m, k) => `${m}＝${p.ans[k]}`).join("　");
    return `<div class="result-part ok">
      <div><span class="mark-sym">答</span>${p.label ? p.label + " " : ""}<strong class="ans-value">${formatAnswer(p, p.ans, "□", true)}</strong></div>
      <div class="explain">マーク：${key}</div>
      <div class="explain">${p.explain}</div>
    </div>`;
  }).join("");

  return `<section class="card ans-card" id="q${qi + 1}">
    <div class="q-head"><span class="q-no">問${qi + 1}</span><span class="q-level">${q.level}</span><span class="q-pt">（${QUESTION_POINTS}点${q.parts.length > 1 ? `：各${partPoints(q)}点` : ""}）</span></div>
    <div class="q-text">${q.text}</div>
    ${q.figure ? `<div class="figure">${q.figure()}</div>` : ""}
    ${parts}
  </section>`;
}).join("");

$toc.innerHTML = questions.map((_, i) => `<button type="button" data-i="${i + 1}">${i + 1}</button>`).join("");
$toc.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b) document.getElementById("q" + b.dataset.i).scrollIntoView({ behavior: "smooth", block: "start" });
});
