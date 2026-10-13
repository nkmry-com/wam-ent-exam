"use strict";
/* 共通ルール（index.html と ans.html で共有）．問題の中身はここには書かない（→ content/）
   目次：1 解答欄の種類 / 2 科目の登録 / 3 配点 / 4 答えの比較・表示 / 5 設問文 */


/* ===== 1. 解答欄の種類 =====
   問題の tpl（答えの表示形）に並べて使う．
     D … マーク欄（科目の choices から1つ選ぶ）
     T … 記述欄（英語を入力するボックス）
     FA, FB, FC … 分数（分子の開始／分子と分母の間／分母の終わり）
     それ以外の文字列 … そのまま表示 */
const D = "{d}";
const T = "{t}";
const FA = "{fa}", FB = "{fb}", FC = "{fc}";
const FRAC_HTML = { [FA]: `<span class="frac"><span class="num">`, [FB]: `</span><span class="den">`, [FC]: `</span></span>` };

const LABELS = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ"];   // 解答欄の記号
const CIRCLED = ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];

const isMark = t => t === D;
const isText = t => t === T;
const isSlot = t => isMark(t) || isText(t);
const slotCount = part => part.tpl.filter(isSlot).length;

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));


/* ===== 2. 科目の登録 =====
   content/<科目>.js が registerSubject({...}) で登録する．表示順は content/settings.js の subjectOrder． */
const SUBJECTS = {};

function registerSubject(def) {
  // 小問が複数ある問題は，label を省略すると (1)(2)… を自動で振る（問題の入れ替えで番号を直さなくてよい）
  def.questions.forEach(q => q.parts.forEach((p, i) => {
    if (p.label === undefined) p.label = q.parts.length > 1 ? `(${i + 1})` : "";
  }));
  SUBJECTS[def.id] = def;
}

const subjectIds = () => EXAM_SETTINGS.subjectOrder.filter(id => SUBJECTS[id]);

/* 現在の科目（useSubject で切り替える）．subject / questions / QUESTION_POINTS はこれを参照する */
let subject = null, questions = [], QUESTION_POINTS = 10;
function useSubject(id) {
  subject = SUBJECTS[id];
  questions = subject.questions;
  QUESTION_POINTS = subject.questionPoints;
}

// ?subject=english のような指定（ans.html で使用）
const subjectFromURL = () => {
  const id = new URLSearchParams(location.search).get("subject");
  return SUBJECTS[id] ? id : null;
};


/* ===== 3. 配点 =====
   問題ごとの配点は q.points．省略すると科目の questionPoints．小問は等分する */
const qPoints = q => q.points ?? QUESTION_POINTS;
const partPoints = q => qPoints(q) / q.parts.length;
const subjectTotal = qs => qs.reduce((a, q) => a + qPoints(q), 0);


/* ===== 4. 答えの比較・表示 =====
   ans … 解答欄ごとの正解の配列．記述欄は文字列，別解があるときは配列（例：[["don't", "do not"], "have"]） */
const answerList = a => Array.isArray(a) ? a : [a];
const answerText = a => answerList(a)[0];                       // 代表の正解（先頭）
const blankVal = v => v === undefined || String(v).trim() === "";

// 記述答案の比較用に整える（全角→半角，大文字小文字・余分な空白・’と'の違いを無視）
const normText = s => String(s).normalize("NFKC").replace(/[’‘`´]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();

const sameAnswer = (part, vals) => {
  const slots = part.tpl.filter(isSlot);
  return part.ans.every((a, i) => isText(slots[i])
    ? answerList(a).some(x => normText(x) === normText(vals[i] || ""))
    : (vals[i] || "") === a);
};

// 解答欄ごとの正解（記述欄は代表の正解のみ）
const answerValues = part => {
  const slots = part.tpl.filter(isSlot);
  return part.ans.map((a, i) => isText(slots[i]) ? answerText(a) : a);
};

// 答えの表示文字列を作る．unselected は未入力欄の代わりに出す文字
function formatAnswer(part, vals, unselected = "□", html = false) {
  let k = 0;
  return part.tpl.map(t => {
    if (FRAC_HTML[t]) return html ? FRAC_HTML[t] : (t === FB ? "/" : "");
    if (!isSlot(t)) return t;
    const v = vals[k++];
    if (blankVal(v)) return unselected;
    return isText(t) && html ? esc(String(v).trim()) : v;
  }).join("");
}


/* ===== 5. 設問文 =====
   p.prompt のある小問は，解答欄の記号（ア，イ…）を使わず，小問番号と設問文の横に解答欄だけを表示する．
   設問文中の {L} は空所（下線）に置き換わる */
const promptHtml = (q, pi) => {
  const p = q.parts[pi];
  if (!p.prompt) return "";
  return `<div class="prompt">${p.label ? `<span class="label">${p.label}</span>` : ""}<div class="prompt-body">${p.prompt.replace(/\{L\}/g, '<span class="blank-line"></span>')}</div></div>`;
};
