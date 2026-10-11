"use strict";
/* 科目データ・図・formatAnswer などは data.js / math.js / english.js
   流れ：開始ページ → 科目選択（ハブ）→ 科目を解く → 科目を終了 → ハブ → … → 全科目終了後に担当者が採点 */

const RELOAD_ICON = `<svg class="reload-icon" viewBox="0 0 24 24" role="img" aria-label="リロードのアイコン"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4C7.58 4 4.01 7.58 4.01 12S7.58 20 12 20c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`;

const IDS = SUBJECT_ORDER.filter(id => SUBJECTS[id]);

/* ===== 状態 ===== */
const state = {
  view: "start",           // start / hub / q（問題）/ final（科目の最終ページ）/ result
  page: 0,                 // 科目内のページ：1〜N:各問題 N+1:最終ページ
  name: "",
  subject: "",             // 解答中の科目id
  answers: [],             // 解答中の科目の answers[問][小問] = マーク欄ごとの選択値（未選択は ""）
  started: false,
  timeUp: false,           // 解答中の科目が時間切れか
  graded: false
};
// 科目ごとの進行状況。status: idle（未着手）/ running（解答中）/ done（終了）
const S = {};
IDS.forEach(id => { S[id] = { status: "idle", answers: null, timeUp: false }; });
let LAST = 0;
let TIME_LIMIT_SEC = 0;

const $app = document.getElementById("app");
const $prev = document.getElementById("prevBtn");
const $next = document.getElementById("nextBtn");
const $info = document.getElementById("pageInfo");
const $pager = document.getElementById("pager");
const $bar = document.getElementById("progressBar");
const $title = document.getElementById("examTitle");
const $footer = document.querySelector(".site-footer");

const partBlank = (qi, pi) => state.answers[qi][pi].every(blankVal);
const isAnswered = qi => questions[qi].parts.some((_, pi) => !partBlank(qi, pi));
const allDone = () => IDS.every(id => S[id].status === "done");
const setTitle = suffix => {
  $title.textContent = "WAM日暮里校  アルバイト採用試験" + (suffix ? `〔${suffix}〕` : "");
  document.title = "採用試験" + (suffix ? `〔${suffix}〕` : "");
};

// 科目を始める（制限時間のタイマーはここで開始）
function enterSubject(id) {
  useSubject(id);
  state.subject = id;
  LAST = questions.length + 1;
  TIME_LIMIT_SEC = subject.timeLimitMin * 60;
  S[id].status = "running";
  S[id].answers = questions.map(q => q.parts.map(p => Array(slotCount(p)).fill("")));
  state.answers = S[id].answers;
  state.timeUp = false;
  setTitle(subject.name);
  startTimer();
  go(1);
}

// 科目を終える（以後その科目には戻れない）
function finishSubject() {
  S[state.subject].status = "done";
  S[state.subject].timeUp = state.timeUp;
  stopTimer();
  state.subject = "";
  setTitle("");
  go(0);
}

/* ===== 描画 ===== */
function renderStart() {
  const times = IDS.map(id => `${SUBJECTS[id].name}${SUBJECTS[id].timeLimitMin}分`).join("，");
  const notes = [
    { text: `試験は${IDS.map(id => SUBJECTS[id].name).join("・")}の${IDS.length}科目です．<strong>すべての科目を解いてください．解く順番は自由です．</strong>` },
    { text: `分からない問題は空欄（何も選ばない）のままで構いません．` },
    ...IDS.map(id => ({ text: `【${SUBJECTS[id].name}】全${SUBJECTS[id].questions.length}題．${SUBJECTS[id].markNote}` })),
    { text: `配点は各問題に表示されます．小問がある問題は，小問ごとに点数を等分します．` },
    { text: `選び直すときは別のマークを押すか，選択中のマークをもう一度押すと解除できます．` },
    { text: `科目の中では「前へ」「次へ」や上の番号で自由に行き来でき，選んだ答えは保持されます．` },
    { text: `試験を始めると，このページには戻れません．採点後は，問題に戻れません．` },
    { warn: true, text: `制限時間は科目ごとです（${times}）．科目を選んで始めた時点でその科目のタイマーが動き，時間が終了するとその科目の入力・編集ができなくなります．そのため，1題1題解き終わるごとに入力することをおすすめします．` },
    { warn: true, text: `科目の最後のページで「この科目を終了する」を押すと，その科目には戻れません．見直しが終わってから押してください．` },
    { warn: true, text: `すべての科目が終わったら，塾の担当者に声をかけてください．「採点」ボタンは担当者が押します（自分で押さないでください）．` },
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
    state.started = true;
    enterFullscreen();
    go(0);
  });
  update();
}

// 科目選択ページ
function renderHub() {
  const label = { idle: "未着手", running: "解答中", done: "終了" };
  const cards = IDS.map(id => {
    const s = S[id], sub = SUBJECTS[id];
    return `<div class="hub-item ${s.status}">
      <div class="hub-name">${sub.name}</div>
      <div class="hub-meta">全${sub.questions.length}題　制限時間${sub.timeLimitMin}分</div>
      <div class="hub-status">${label[s.status]}${s.status === "done" && s.timeUp ? "（時間切れ）" : ""}</div>
      ${s.status === "idle" ? `<button type="button" class="btn primary big subject-start" data-id="${id}">${sub.name}を始める</button>` : ""}
    </div>`;
  }).join("");
  const remain = IDS.filter(id => S[id].status !== "done");
  $app.innerHTML = `
  <section class="card center">
    <h2>科目選択</h2>
    <p>${state.name ? esc(state.name) + " さん，" : ""}${allDone() ? "すべての科目が終了しました．" : "解く科目を選んでください．順番は自由です．"}</p>
    ${remain.length ? `<p class="hub-note">科目を始めると，その科目のタイマーが動き出します．<br>残り：${remain.map(id => SUBJECTS[id].name).join("，")}</p>` : ""}
    <div class="hub-list">${cards}</div>
    ${allDone() ? `<p class="finish-note">塾の担当者に声をかけてください．<br>下の「採点」ボタンは担当者が押しますので，自分では押さないでください．</p>
    <p><button class="btn primary big" id="gradeBtn" type="button">採点</button></p>` : ""}
  </section>`;
  $app.querySelectorAll(".subject-start").forEach(b => b.addEventListener("click", () => {
    const sub = SUBJECTS[b.dataset.id];
    askConfirm(`<strong>${sub.name}</strong>を始めます．`, `今からタイマー（${sub.timeLimitMin}分）が動き出します．`, "始める", () => enterSubject(b.dataset.id));
  }));
  const g = document.getElementById("gradeBtn");
  if (g) g.addEventListener("click", grade);
}

/* ===== 記述問題の案内（半角/全角キーの位置を示すキーボード図） ===== */
function figKeyboardSvg() {
  const key = (x, y, w, label, hot, fs = 11) =>
    `<rect x="${x}" y="${y}" width="${w}" height="30" rx="4" class="kb-key${hot ? " hot" : ""}"/>` +
    `<text x="${x + w / 2}" y="${y + 19}" text-anchor="middle" font-size="${fs}" class="kb-txt${hot ? " hot" : ""}">${label}</text>`;
  const row = (y, x0, items) => {
    let x = x0;
    return items.map(([label, w, hot, fs]) => { const s = key(x, y, w, label, hot, fs); x += w + 4; return s; }).join("");
  };
  return `<svg class="kb-svg" viewBox="0 0 232 140" role="img" aria-label="キーボードの左上にある「半角/全角」キーの位置を示す図">
  ${row(4, 4, [["Esc", 34], ["F1", 34], ["F2", 34], ["F3", 34], ["F4", 34]])}
  ${row(38, 4, [["半角/全角", 50, true, 10], ["1", 30], ["2", 30], ["3", 30], ["4", 30], ["5", 30]])}
  ${row(72, 4, [["Tab", 44], ["Q", 30], ["W", 30], ["E", 30], ["R", 30], ["T", 30]])}
  ${row(106, 4, [["英数", 52], ["A", 30], ["S", 30], ["D", 30], ["F", 30], ["G", 30]])}
  </svg>`;
}

const imeNotice = () => `<div class="ime-notice">
  <div class="ime-text"><strong>英語を入力する問題です．</strong><br>キーボードを半角英数字に切り替える場合は，キーボード左上の「<strong>半角/全角</strong>」キーを押してください．<br><span class="ime-sub">（日本語入力のままでも，半角の英字だけが入力されます）</span></div>
  ${figKeyboardSvg()}
</div>`;

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
      const slot = { label: p.prompt ? "" : LABELS[labelIdx++], k: k++, text: isText(t) };
      slots.push(slot);
      const v = vals[slot.k];
      const blank = blankVal(v);
      const shown = blank ? slot.label : slot.text ? slot.label + "✓" : v;
      return `<span class="box${blank ? "" : " filled"}" data-box="${pi}-${slot.k}" data-label="${slot.label}" data-text="${slot.text ? 1 : 0}">${shown}</span>`;
    }).join("");

    const rows = slots.map(s => {
      let body;
      if (s.text) {
        // 記述欄：英語入力用のボックス
        body = `<input type="text" class="text-input" data-p="${pi}" data-k="${s.k}" value="${esc(vals[s.k])}" lang="en" inputmode="latin" pattern="[A-Za-z]*" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="English"${state.timeUp ? " disabled" : ""}>`;
      } else {
        const btn = (v, text, aria) =>
          `<button type="button" class="mark${vals[s.k] === v ? " on" : ""}" data-p="${pi}" data-k="${s.k}" data-v="${v}" aria-label="${aria}"${state.timeUp ? " disabled" : ""}>${text}</button>`;
        body = `<div class="marks">${subject.choices.map(v => btn(v, CIRCLED[+v], v)).join("")}</div>`;
      }
      return `<div class="mark-row">${s.label ? `<span class="box small">${s.label}</span>` : ""}${body}</div>`;
    }).join("");

    return `<div class="part${p.prompt ? " plain" : ""}">
      ${promptHtml(q, pi)}
      ${p.prompt ? "" : `<div class="formula">${p.label ? `<span class="label">${p.label}</span>` : ""}${formula}</div>`}
      ${p.hint ? `<div class="hint">${p.hint}</div>` : ""}
      <div class="mark-sheet">${rows}</div>
    </div>`;
  }).join("");

  $app.innerHTML = `
  <section class="card">
    <div class="q-head"><span class="q-no">問${qi + 1}</span><span class="q-pt">（${qPoints(q)}点${q.parts.length > 1 ? `：各${partPoints(q)}点` : ""}）</span></div>
    ${state.timeUp ? `<p class="timeup-note">制限時間が終了しました．これ以上解答を変更することはできません．</p>` : ""}
    ${q.parts.some(p => p.tpl.some(isText)) ? imeNotice() : ""}
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

  // 記述欄：半角英数字・記号のみ受け付ける（日本語入力がオンでも，パスワード欄と同様に英字のまま入る）．
  // 再描画せずに状態だけ更新する
  $app.querySelectorAll("input.text-input").forEach(inp => {
    const save = () => {
      if (state.timeUp) return;
      state.answers[qi][+inp.dataset.p][+inp.dataset.k] = inp.value;
      const box = $app.querySelector(`[data-box="${inp.dataset.p}-${inp.dataset.k}"]`);
      if (box) {
        const blank = blankVal(inp.value);
        box.classList.toggle("filled", !blank);
        box.textContent = blank ? box.dataset.label : box.dataset.label + "✓";
      }
      renderPager();
    };
    const clean = () => { const c = inp.value.replace(NON_ALPHA, ""); if (c !== inp.value) inp.value = c; };

    // 半角英字（A〜Z, a〜z）以外のキーは受け付けない．
    // 日本語入力がオンのとき，文字キーは key="Process"（keyCode 229）で届く．変換を始めさせず，押されたキーが英字ならそのまま入力する
    inp.addEventListener("keydown", e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const composing = e.isComposing || e.keyCode === 229 || e.key === "Process";
      if (composing) {
        if (!CHAR_KEY.test(e.code)) return;
        e.preventDefault();
        const m = /^Key([A-Z])$/.exec(e.code);
        if (!m || state.timeUp || inp.disabled) return;
        const upper = e.shiftKey !== e.getModifierState("CapsLock");
        inp.setRangeText(upper ? m[1] : m[1].toLowerCase(), inp.selectionStart, inp.selectionEnd, "end");
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (e.key.length === 1 && !/[A-Za-z]/.test(e.key)) {
        e.preventDefault();     // 数字・記号・スペースなどは入力させない
      }
    });
    inp.addEventListener("beforeinput", e => {
      if (e.inputType === "insertCompositionText") e.preventDefault();
    });
    inp.addEventListener("compositionend", () => { clean(); save(); });
    inp.addEventListener("input", e => {
      if (e.isComposing) return;
      clean();
      save();
    });
  });
}

// 半角英字以外
const NON_ALPHA = /[^A-Za-z]/g;
// 文字を入力するキー（日本語入力中でも，これらは入力させない／英字に置き換える）
const CHAR_KEY = /^(Key[A-Z]|Digit\d|Numpad\d|Space|Minus|Equal|Comma|Period|Slash|Semicolon|Quote|Backquote|Bracket(Left|Right)|Backslash|Intl(Yen|Ro))$/;

function renderFinal() {
  const unanswered = questions.map((_, i) => i).filter(i => !isAnswered(i)).map(i => i + 1);
  const left = IDS.filter(id => S[id].status === "idle").map(id => SUBJECTS[id].name);
  $app.innerHTML = `
  <section class="card center">
    <h2>${subject.name}　最終ページ</h2>
    <p>${state.name ? esc(state.name) + " さん，" : ""}お疲れさまでした．</p>
    ${unanswered.length
      ? `<p class="warn">未回答の問題： 問${unanswered.join("，問")}<br>（空欄のままでも終了できます）</p>`
      : `<p>すべての問題に解答しました．</p>`}
    <p class="finish-note">見直しが終わったら，下のボタンで${subject.name}を終了してください．<br>終了すると，${subject.name}の問題には戻れません．${left.length ? `<br>この後，${left.join("，")}を解いてください．` : ""}</p>
    <p><button class="btn primary big" id="finishBtn" type="button">この科目（${subject.name}）を終了する</button></p>
  </section>`;
  document.getElementById("finishBtn").addEventListener("click", () => {
    askConfirm(`<strong>${subject.name}</strong>を終了します．`, `終了すると，${subject.name}の問題には戻れません．`, "終了する", finishSubject);
  });
}

function grade() {
  state.graded = true;
  state.view = "result";
  stopTimer();
  updateFsGuard();
  $footer.style.display = "none";
  $pager.style.display = "none";
  document.body.style.paddingBottom = "24px";
  setTitle("");
  let score = 0, blank = 0, total = 0;
  const summaries = [];
  const sections = IDS.map(id => {
    useSubject(id);
    state.subject = id;
    state.answers = S[id].answers;
    let sScore = 0;
    const sTotal = subjectTotal(questions);
    const blocks = questions.map((q, qi) => {
      let qScore = 0;
      const rows = q.parts.map((p, pi) => {
        const vals = state.answers[qi][pi];
        let cls, mark;
        if (partBlank(qi, pi)) { cls = "blank"; mark = "－"; blank++; }
        else if (sameAnswer(p, vals)) { cls = "ok"; mark = "○"; qScore += partPoints(q); }
        else { cls = "ng"; mark = "×"; }
        return `<div class="result-part ${cls}">
          ${promptHtml(q, pi)}
          <span class="mark-sym">${mark}</span>${p.label && !p.prompt ? p.label + " " : ""}あなたの答え： ${cls === "blank" ? "（未回答）" : formatAnswer(p, vals, "□", true)}
          ${cls === "ok" ? "" : `<br>正解： ${formatAnswer(p, answerValues(p), "□", true)}`}
          <div class="explain">${p.explain}</div>
        </div>`;
      }).join("");
      sScore += qScore;
      return `<div class="result-q"><h3>問${qi + 1}　<small>${q.level}</small><span class="q-score">${qScore}/${qPoints(q)}</span></h3>${rows}</div>`;
    }).join("");
    score += sScore; total += sTotal;
    summaries.push(`${subject.name} ${sScore}/${sTotal}`);
    return `<h2 class="subject-heading">${subject.name}　<span class="q-score">${sScore}/${sTotal}</span></h2>${blocks}`;
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
      <div>${summaries.join("　")}</div>
      <div>正答率 ${pct}%　（未回答 ${blank}）</div>
    </div>
    ${sections}
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
  add("終了", LAST, state.page === LAST ? "current" : "");
}

// 解答中の科目がなければ開始／科目選択ページ，あれば科目内のページ（1〜LAST）を表示
function go(page) {
  if (state.graded) return;                  // 採点後は他のページへ移動できない
  const inExam = state.subject !== "";
  if (inExam) {
    state.page = Math.max(1, Math.min(LAST, page));
    state.view = state.page === LAST ? "final" : "q";
  } else {
    state.page = 0;
    state.view = state.started ? "hub" : "start";
  }

  if (state.view === "start") renderStart();
  else if (state.view === "hub") renderHub();
  else if (state.view === "final") renderFinal();
  else renderQuestion(state.page - 1);

  if (inExam) renderPager();
  $pager.style.display = inExam ? "" : "none";
  $footer.style.display = inExam ? "" : "none";
  document.body.style.paddingBottom = inExam ? "" : "24px";
  $prev.disabled = state.page <= 1;
  $next.style.visibility = state.page === LAST ? "hidden" : "visible";
  $info.textContent = !inExam ? "" : state.page === LAST ? "最終ページ" : `${state.page} / ${questions.length}`;
  $bar.style.width = (inExam ? state.page / LAST * 100 : 0) + "%";
  window.scrollTo(0, 0);
}

$prev.addEventListener("click", () => go(state.page - 1));
$next.addEventListener("click", () => go(state.page + 1));

go(0);


/* ===== タイマー（科目ごと．科目を始めた時点で開始） ===== */
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
    document.querySelector(".timer-label").textContent = `${subject.name} 時間終了`;
    state.timeUp = true;
    S[state.subject].timeUp = true;
    if (state.view === "q") renderQuestion(state.page - 1);
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  document.querySelector(".timer-label").textContent = `${subject.name} 残り時間`;
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

/* ===== ページ内の確認ダイアログ（ブラウザのアラートは使わない） ===== */
function askConfirm(title, note, okLabel, onOk) {
  const ov = document.createElement("div");
  ov.className = "fs-guard dlg";
  ov.innerHTML = `<div class="fs-box" role="dialog" aria-modal="true"><p class="dlg-title">${title}</p><p>${note}</p><p><button type="button" class="btn ghost" data-r="no">戻る</button> <button type="button" class="btn primary" data-r="ok">${okLabel}</button></p></div>`;
  document.body.appendChild(ov);
  ov.querySelector('[data-r="no"]').focus();
  ov.addEventListener("click", e => {
    const r = e.target.closest("button")?.dataset.r;
    if (!r) return;
    ov.remove();
    if (r === "ok") onOk();
  });
}
