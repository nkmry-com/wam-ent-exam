"use strict";
/* 解答・解説ページ（ans.html）の処理
   ?subject=english のように科目を指定する（省略時は最初の科目）．問題の中身は content/、共通ルールは js/core.js */

const ids = subjectIds();
useSubject(subjectFromURL() || ids[0]);

const $app = document.getElementById("app");
const $toc = document.getElementById("toc");

/* ===== 見出し・科目の切り替えリンク ===== */
document.getElementById("ansTitle").textContent = `${EXAM_SETTINGS.answerTitle}〔${subject.name}〕　解答・解説`;
document.title = `解答・解説〔${subject.name}〕`;
document.getElementById("subjectLinks").innerHTML = ids
  .map(id => `<a class="subject-link${id === subject.id ? " on" : ""}" href="?subject=${id}">${SUBJECTS[id].name}</a>`)
  .join("");

/* ===== 問題ごとの解答・解説 ===== */
$app.innerHTML = questions.map((q, qi) => {
  let idx = 0;                                   // 解答欄の記号（ア，イ…）は問題ごとに振り直す
  const parts = q.parts.map((p, pi) => {
    // 解答欄の記号（ア，イ，…）と正解の対応
    const marks = [];
    p.tpl.forEach(t => { if (isSlot(t)) marks.push(LABELS[idx++]); });
    const key = marks.map((m, k) => `${m}＝${answerList(p.ans[k]).join(" / ")}`).join("　");
    return `<div class="result-part ok">
      ${promptHtml(q, pi)}
      <div><span class="mark-sym">答</span>${p.label && !p.prompt ? p.label + " " : ""}<strong class="ans-value">${formatAnswer(p, answerValues(p), "□", true)}</strong></div>
      ${p.prompt ? "" : `<div class="explain">解答欄：${key}</div>`}
      <div class="explain">${p.explain}</div>
    </div>`;
  }).join("");

  return `<section class="card ans-card" id="q${qi + 1}">
    <div class="q-head"><span class="q-no">問${qi + 1}</span><span class="q-level">${q.level}</span><span class="q-pt">（${qPoints(q)}点${q.parts.length > 1 ? `：各${partPoints(q)}点` : ""}）</span></div>
    <div class="q-text">${q.text}</div>
    ${q.figure ? `<div class="figure">${q.figure()}</div>` : ""}
    ${parts}
  </section>`;
}).join("");

/* ===== 目次（問題番号ボタン） ===== */
$toc.innerHTML = questions.map((_, i) => `<button type="button" data-i="${i + 1}">${i + 1}</button>`).join("");
$toc.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b) document.getElementById("q" + b.dataset.i).scrollIntoView({ behavior: "smooth", block: "start" });
});
