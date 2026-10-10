"use strict";
/* 問題データ・図・formatAnswer などは data.js */

const RELOAD_ICON = `<svg class="reload-icon" viewBox="0 0 24 24" role="img" aria-label="リロードのアイコン"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4C7.58 4 4.01 7.58 4.01 12S7.58 20 12 20c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`;
const CIRCLED = ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];

/* ===== 状態 ===== */
const state = {
  page: 0,                 // 0:開始 1〜N:各問題 N+1:最終ページ
  name: "",
  // answers[問][小問] = マーク欄ごとの選択値の配列（未選択は ""）
  answers: questions.map(q => q.parts.map(p => Array(slotCount(p)).fill(""))),
  started: false,
  timeUp: false,
  graded: false
};
const LAST = questions.length + 1;

const $app = document.getElementById("app");
const $prev = document.getElementById("prevBtn");
const $next = document.getElementById("nextBtn");
const $info = document.getElementById("pageInfo");
const $pager = document.getElementById("pager");
const $bar = document.getElementById("progressBar");

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const partBlank = (qi, pi) => state.answers[qi][pi].every(v => v === "");
const isAnswered = qi => questions[qi].parts.some((_, pi) => !partBlank(qi, pi));

/* ===== 描画 ===== */
function renderStart() {
  const notes = [
    { text: `全${questions.length}題です．分からない問題は空欄（何も選ばない）のままで構いません．` },
    { text: `答えはマーク形式です．式の中の <span class="box inline">ア</span> などの欄に対応する行から，数字（⓪〜⑨）を1つ選んでください．` },
    { text: `各問題は10点満点です（小問が2つある問題は1つ5点）．` },
    { text: `選び直すときは別の数字を押すか，選択中の数字をもう一度押すと解除できます．` },
    { text: `「前へ」「次へ」や上の番号で自由に行き来でき，選んだ答えは保持されます．` },
    { text: `試験を始めると，このページには戻れません．採点後は，問題に戻れません．` },
    { warn: true, text: `試験時間は10分です．試験時間が終了すると，入力・編集ができなくなります．そのため，1題1題解き終わるごとに入力することをおすすめします．` },
    { warn: true, text: `すべて解き終わったら，最後のページで止まり，塾の担当者に声をかけてください．「採点」ボタンは担当者が押します（自分で押さないでください）．` },
    { warn: true, text: `試験中はページをリロード（${RELOAD_ICON}）したり，ブラウザの戻る／閉じるを押したりしないでください．選んだ答えがすべて消えます．` },
    { warn: true, text: `試験中は，Web検索や生成AI（ChatGPT など）の使用を禁止します．` }
  ];
  $app.innerHTML = `
  <section class="card start-box">
    <h2>試験について</h2>
    <p>注意事項をよく読んでください．赤枠の項目には，読んだことを示すチェックを入れてください．</p>
    <ul class="notes check-list">
      ${notes.map((n, i) => n.warn
        ? `<li class="warn-li"><label><input type="checkbox" class="agree" id="agree${i}"><span><strong>${n.text}</strong></span></label></li>`
        : `<li>${n.text}</li>`).join("")}
    </ul>
    <label for="nameInput">お名前（必須）</label>
    <input id="nameInput" type="text" value="${esc(state.name)}" placeholder="例：日暮里 太郎" autocomplete="name">
    <p class="center" style="margin-top:24px"><button class="btn primary big" id="startBtn" type="button" disabled>試験を始める</button></p>
    <p class="center hint-start" id="startHint">赤枠の項目にチェックし，お名前を入力すると始められます．</p>
  </section>`;
  const input = document.getElementById("nameInput");
  input.addEventListener("input", () => { state.name = input.value; update(); });

  const boxes = [...$app.querySelectorAll(".agree")];
  const startBtn = document.getElementById("startBtn");
  const update = () => {
    const all = boxes.every(b => b.checked) && state.name.trim() !== "";
    startBtn.disabled = !all;
    document.getElementById("startHint").style.visibility = all ? "hidden" : "visible";
  };
  boxes.forEach(b => b.addEventListener("change", update));
  startBtn.addEventListener("click", () => {
    if (startBtn.disabled) return;
    enterFullscreen();
    go(1);
  });
  update();
}

function renderQuestion(qi) {
  const q = questions[qi];
  let labelIdx = 0;

  const parts = q.parts.map((p, pi) => {
    const vals = state.answers[qi][pi];
    let k = 0;
    const slots = [];
    const formula = p.tpl.map(t => {
      if (FRAC_HTML[t]) return FRAC_HTML[t];
      if (!isSlot(t)) return esc(t);
      const slot = { label: LABELS[labelIdx++], k: k++ };
      slots.push(slot);
      const v = vals[slot.k];
      const shown = v === "" ? slot.label : v;
      return `<span class="box${v === "" ? "" : " filled"}">${shown}</span>`;
    }).join("");

    const rows = slots.map(s => {
      const btn = (v, text, aria) =>
        `<button type="button" class="mark${vals[s.k] === v ? " on" : ""}" data-p="${pi}" data-k="${s.k}" data-v="${v}" aria-label="${aria}"${state.timeUp ? " disabled" : ""}>${text}</button>`;
      const choices = CIRCLED.map((c, d) => btn(String(d), c, d)).join("");
      return `<div class="mark-row"><span class="box small">${s.label}</span><div class="marks">${choices}</div></div>`;
    }).join("");

    return `<div class="part">
      <div class="formula">${p.label ? `<span class="label">${p.label}</span>` : ""}${formula}</div>
      ${p.hint ? `<div class="hint">${p.hint}</div>` : ""}
      <div class="mark-sheet">${rows}</div>
    </div>`;
  }).join("");

  $app.innerHTML = `
  <section class="card">
    <div class="q-head"><span class="q-no">問${qi + 1}</span><span class="q-pt">（${QUESTION_POINTS}点）</span></div>
    ${state.timeUp ? `<p class="timeup-note">制限時間が終了しました．これ以上解答を変更することはできません．</p>` : ""}
    <div class="q-text">${q.text}</div>
    ${q.figure ? `<div class="figure">${q.figure()}</div>` : ""}
    ${parts}
  </section>`;

  $app.querySelectorAll("button.mark").forEach(btn => {
    btn.addEventListener("click", () => {
      if (state.timeUp) return;                 // 時間切れ後は変更不可
      const cell = state.answers[qi][+btn.dataset.p];
      const k = +btn.dataset.k;
      cell[k] = cell[k] === btn.dataset.v ? "" : btn.dataset.v;
      const y = window.scrollY;
      renderQuestion(qi);
      renderPager();
      window.scrollTo(0, y);
    });
  });
}

function renderFinal() {
  const unanswered = questions.map((_, i) => i).filter(i => !isAnswered(i)).map(i => i + 1);
  $app.innerHTML = `
  <section class="card center">
    <h2>最終ページ</h2>
    <p>${state.name ? esc(state.name) + " さん，" : ""}お疲れさまでした．</p>
    ${unanswered.length
      ? `<p class="warn">未回答の問題： 問${unanswered.join("，問")}<br>（空欄のままでも採点できます）</p>`
      : `<p>すべての問題に解答しました．</p>`}
    <p class="finish-note">見直しが終わったら，塾の担当者に声をかけてください．<br>下の「採点」ボタンは担当者が押しますので，自分では押さないでください．</p>
    <p><button class="btn primary big" id="gradeBtn" type="button">採点</button></p>
  </section>`;
  document.getElementById("gradeBtn").addEventListener("click", grade);
}

function grade() {
  state.graded = true;
  stopTimer();
  updateFsGuard();
  document.querySelector(".site-footer").style.display = "none";
  $pager.style.display = "none";
  document.body.style.paddingBottom = "24px";
  let score = 0, blank = 0;
  const total = questions.length * QUESTION_POINTS;
  const blocks = questions.map((q, qi) => {
    let qScore = 0;
    const rows = q.parts.map((p, pi) => {
      const vals = state.answers[qi][pi];
      let cls, mark;
      if (partBlank(qi, pi)) { cls = "blank"; mark = "－"; blank++; }
      else if (sameAnswer(p, vals)) { cls = "ok"; mark = "○"; qScore += partPoints(q); }
      else { cls = "ng"; mark = "×"; }
      return `<div class="result-part ${cls}">
        <span class="mark-sym">${mark}</span>${p.label ? p.label + " " : ""}あなたの答え： ${cls === "blank" ? "（未回答）" : formatAnswer(p, vals, "□", true)}
        ${cls === "ok" ? "" : `<br>正解： ${formatAnswer(p, p.ans, "□", true)}`}
        <div class="explain">${p.explain}</div>
      </div>`;
    }).join("");
    score += qScore;
    return `<div class="result-q"><h3>問${qi + 1}　<small>${q.level}</small><span class="q-score">${qScore}/${QUESTION_POINTS}</span></h3>${rows}</div>`;
  }).join("");

  const pct = Math.round(score / total * 100);
  $app.innerHTML = `
  <section class="card">
    <p class="print-only print-meta">${esc(document.querySelector(".site-header h1").textContent.trim())}　／　${new Date().toLocaleString("ja-JP")}</p>
    <h2 class="center">採点結果</h2>
    <p class="staff-note no-print"><strong>【教室担当者の方へ】</strong>画面を閉じるには，キーボードの <kbd>Esc</kbd> キーを押してください（全画面表示が解除されます）．</p>
    <p class="finish-note no-print">このページをリロード（${RELOAD_ICON}）したり，ブラウザの戻る／閉じるを押したりしないでください．試験結果が閲覧できなくなります．</p>
    <div class="center summary">
      ${state.name ? `<div>${esc(state.name)} さん</div>` : ""}
      <div class="score-row"><div class="score-big">${score}/${total}</div><button class="btn ghost no-print" id="printBtn" type="button">印刷</button></div>
      <div>正答率 ${pct}%　（未回答 ${blank}）</div>
    </div>
    ${blocks}
  </section>`;
  document.getElementById("printBtn").addEventListener("click", () => window.print());
  window.scrollTo(0, 0);
}

function renderPager() {
  $pager.innerHTML = "";
  const add = (label, page, cls) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.className = cls;
    b.addEventListener("click", () => go(page));
    $pager.appendChild(b);
  };
  questions.forEach((_, i) => {
    const cls = [state.page === i + 1 ? "current" : "", isAnswered(i) ? "answered" : ""].join(" ");
    add(i + 1, i + 1, cls);
  });
  add("採点", LAST, state.page === LAST ? "current" : "");
}

function go(page) {
  if (state.graded) return;                  // 採点後は他のページへ移動できない
  if (state.started) page = Math.max(page, 1); // 開始後は最初のページへ戻れない
  state.page = Math.max(0, Math.min(LAST, page));
  if (state.page > 0 && !state.started) { state.started = true; startTimer(); }
  if (state.page === 0) renderStart();
  else if (state.page === LAST) renderFinal();
  else renderQuestion(state.page - 1);

  renderPager();
  $pager.style.display = state.page === 0 ? "none" : "";
  document.querySelector(".site-footer").style.display = state.page === 0 ? "none" : "";
  document.body.style.paddingBottom = state.page === 0 ? "24px" : "";
  $prev.disabled = state.page <= 1;
  $next.style.visibility = state.page === LAST ? "hidden" : "visible";
  $info.textContent = state.page === 0 ? "" : state.page === LAST ? "最終ページ" : `${state.page} / ${questions.length}`;
  $bar.style.width = (state.page / LAST * 100) + "%";
  window.scrollTo(0, 0);
}

$prev.addEventListener("click", () => go(state.page - 1));
$next.addEventListener("click", () => go(state.page + 1));

go(0);


/* ===== タイマー（10分，「試験を始める」で開始） ===== */
const TIME_LIMIT_SEC = 10 * 60;
let timerId = null, deadline = 0;

function drawTimer() {
  const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
  const m = String(Math.floor(left / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  const box = document.getElementById("timer");
  document.getElementById("timerValue").textContent = `${m}:${s}`;
  box.classList.toggle("low", left <= 60);
  box.classList.toggle("over", left === 0);
  if (left === 0) {
    document.querySelector(".timer-label").textContent = "時間終了";
    state.timeUp = true;
    if (state.page >= 1 && state.page <= questions.length) renderQuestion(state.page - 1);
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  deadline = Date.now() + TIME_LIMIT_SEC * 1000;
  document.getElementById("timer").hidden = false;
  drawTimer();
  timerId = setInterval(drawTimer, 250);
}

function stopTimer() {
  if (timerId !== null) { clearInterval(timerId); timerId = null; }
  document.getElementById("timer").hidden = true;
}

/* ===== 全画面表示（不正防止） ===== */
function enterFullscreen() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (req) { try { Promise.resolve(req.call(el)).catch(() => {}); } catch (e) { /* 非対応環境では何もしない */ } }
}

const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

// 試験中に全画面が解除されたら，全画面に戻るまで画面を覆う
const $fsGuard = document.createElement("div");
$fsGuard.className = "fs-guard";
$fsGuard.hidden = true;
$fsGuard.innerHTML = `<div class="fs-box"><p><strong>全画面表示が解除されました．</strong></p><p>試験を続けるには，全画面表示に戻してください．<br>（タイマーは止まりません）</p><button type="button" class="btn primary big" id="fsBackBtn">全画面に戻る</button></div>`;
document.body.appendChild($fsGuard);
document.getElementById("fsBackBtn").addEventListener("click", enterFullscreen);

function updateFsGuard() {
  $fsGuard.hidden = !(state.started && !state.graded && !isFullscreen());
}
document.addEventListener("fullscreenchange", updateFsGuard);
document.addEventListener("webkitfullscreenchange", updateFsGuard);
