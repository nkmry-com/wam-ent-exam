"use strict";

/* 共通データ・ヘルパー（index.html と ans.html で共有）
   tpl : 答えの表示形。D＝マーク欄．それ以外の文字列はそのまま表示
   ans : マーク欄ごとの正解（科目の choices の値） */
const D = "{d}";
// 分数：FA（分子の開始）FB（分子と分母の間）FC（分母の終わり）
const FA = "{fa}", FB = "{fb}", FC = "{fc}";
const FRAC_HTML = { [FA]: `<span class="frac"><span class="num">`, [FB]: `</span><span class="den">`, [FC]: `</span></span>` };
const LABELS = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ"];
const CIRCLED = ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];

/* 科目レジストリ．math.js / english.js などが SUBJECTS.<id> を登録する．
   科目を増やすには，<id>.js を作り，index.html / ans.html に <script> を足し，SUBJECT_ORDER に id を追加する． */
const SUBJECTS = {};
const SUBJECT_ORDER = ["math", "english"];

/* 現在の科目（useSubject で切り替える） */
let subject = null, questions = [], QUESTION_POINTS = 10;
function useSubject(id) {
  subject = SUBJECTS[id];
  questions = subject.questions;
  QUESTION_POINTS = subject.questionPoints;
}
const subjectFromURL = () => {
  const id = new URLSearchParams(location.search).get("subject");
  return SUBJECTS[id] ? id : null;
};

/* 解答欄の種類：D＝マーク欄（選択肢から選ぶ）／T＝記述欄（英語の入力ボックス） */
const T = "{t}";
const isMark = t => t === D;
const isText = t => t === T;
const isSlot = t => isMark(t) || isText(t);
const slotCount = part => part.tpl.filter(isSlot).length;

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// 記述答案の比較用に整える（全角→半角，大文字小文字・余分な空白・’と'の違いを無視）
const normText = s => String(s).normalize("NFKC").replace(/[’‘`´]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
// 正解は文字列，または別解を含む配列．最初の要素を代表の正解として表示する
const answerList = a => Array.isArray(a) ? a : [a];
const answerText = a => answerList(a)[0];
const blankVal = v => v === undefined || String(v).trim() === "";

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

// 正解の表示用（記述欄は代表の正解のみ）
const answerValues = part => {
  const slots = part.tpl.filter(isSlot);
  return part.ans.map((a, i) => isText(slots[i]) ? answerText(a) : a);
};

// 小問の数で等分する
const qPoints = q => q.points ?? QUESTION_POINTS;       // 問題ごとの配点（未指定なら科目の既定値）
const subjectTotal = qs => qs.reduce((a, q) => a + qPoints(q), 0);
const partPoints = q => qPoints(q) / q.parts.length;

const sameAnswer = (part, vals) => {
  const slots = part.tpl.filter(isSlot);
  return part.ans.every((a, i) => isText(slots[i])
    ? answerList(a).some(x => normText(x) === normText(vals[i] || ""))
    : (vals[i] || "") === a);
};

// 小問の設問文（p.prompt）。小問番号（p.label）を設問文の横に並べる．{L} は設問文中の空所（下線）に置き換える．
// p.prompt のある小問は，解答欄の記号（ア，イ…）を使わず，解答欄だけを表示する
const promptHtml = (q, pi) => {
  const p = q.parts[pi];
  if (!p.prompt) return "";
  return `<div class="prompt">${p.label ? `<span class="label">${p.label}</span>` : ""}<div class="prompt-body">${p.prompt.replace(/\{L\}/g, '<span class="blank-line"></span>')}</div></div>`;
};
