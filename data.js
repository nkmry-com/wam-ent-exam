"use strict";

/* 問題データ（index.html と ans.html の共通データ）
   tpl : 答えの表示形。D＝数字マーク欄（⓪〜⑨）．それ以外の文字列はそのまま表示
   ans : マーク欄ごとの正解（D は "0"〜"9"） */
const D = "{d}";
// 分数：FA（分子の開始）FB（分子と分母の間）FC（分母の終わり）
const FA = "{fa}", FB = "{fb}", FC = "{fc}";
const FRAC_HTML = { [FA]: `<span class="frac"><span class="num">`, [FB]: `</span><span class="den">`, [FC]: `</span></span>` };
const LABELS = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ"];

/* ===== 図 ===== */
function figSolids() {
  return `<svg viewBox="0 0 160 150" width="200" role="img" aria-label="円柱">
  <g stroke="#333" fill="none" stroke-width="1.6">
    <ellipse cx="70" cy="30" rx="40" ry="12"/>
    <line x1="30" y1="30" x2="30" y2="120"/><line x1="110" y1="30" x2="110" y2="120"/>
    <path d="M30 120 A40 12 0 0 0 110 120"/>
    <path d="M30 120 A40 12 0 0 1 110 120" stroke-dasharray="4 3"/>
    <line x1="70" y1="30" x2="110" y2="30" stroke="#d33"/>
  </g>
  <g font-size="13" fill="#222"><text x="82" y="26">4cm</text><text x="114" y="80">5cm</text></g></svg>`;
}


function figParallelogram() {
  return `<svg viewBox="0 0 270 140" width="300" role="img" aria-label="平行四辺形ABCD">
  <g stroke="#333" stroke-width="1.6" fill="none">
    <polygon points="60,20 250,20 220,110 30,110"/>
    <line x1="60" y1="20" x2="123" y2="110" stroke="#d33"/>
  </g>
  <g font-size="14" fill="#222">
    <text x="48" y="16">A</text><text x="252" y="16">D</text><text x="16" y="126">B</text><text x="218" y="128">C</text><text x="118" y="127">E</text>
  </g></svg>`;
}

function figGraph() {
  const X = x => 100 + 30 * x, Y = y => 200 - 17 * y;
  let curve = "";
  for (let x = -3; x <= 3.2; x += 0.1) curve += `${X(x).toFixed(1)},${Y(x * x).toFixed(1)} `;
  return `<svg viewBox="0 0 260 220" width="300" role="img" aria-label="放物線と直線のグラフ">
  <g stroke="#333" stroke-width="1.2" fill="none">
    <line x1="${X(-3.2)}" y1="${Y(0)}" x2="${X(3.6)}" y2="${Y(0)}"/>
    <line x1="${X(0)}" y1="${Y(-0.5)}" x2="${X(0)}" y2="${Y(10.5)}"/>
  </g>
  <polyline points="${curve}" fill="none" stroke="#2459d6" stroke-width="2"/>
  <line x1="${X(-3)}" y1="${Y(3)}" x2="${X(3.4)}" y2="${Y(9.4)}" stroke="#d33" stroke-width="2"/>
  <g fill="#222" font-size="13">
    <circle cx="${X(-2)}" cy="${Y(4)}" r="3"/><circle cx="${X(3)}" cy="${Y(9)}" r="3"/>
    <text x="${X(-2) - 18}" y="${Y(4) - 6}">A</text><text x="${X(3) + 6}" y="${Y(9) + 4}">B</text>
    <text x="${X(0) - 14}" y="${Y(0) + 14}">O</text>
    <text x="${X(3.3)}" y="${Y(0) + 14}">x</text><text x="${X(0) + 6}" y="${Y(10.3)}">y</text>
    <text x="${X(-3) + 2}" y="${Y(9)}" fill="#2459d6">y = x²</text>
    <text x="${X(1.2)}" y="${Y(9.4)}" fill="#d33">y = x + 6</text>
  </g></svg>`;
}

/* ===== 問題 ===== */
const questions = [
  {
    level: "小学5年レベル（割合）",
    text: `<p>ある商品に，仕入れの値段の30%の利益を加えて，6500円で売ることにしました．この商品の仕入れの値段はいくらですか．</p>`,
    parts: [
      { label: "", tpl: [D, D, D, D, "円"], ans: ["5", "0", "0", "0"],
        explain: "仕入れ値を□円とすると □×1.3＝6500．□＝6500÷1.3＝5000．" }
    ]
  },
  {
    level: "小学6年レベル（立体の体積）",
    text: `<p>底面の半径が4cm，高さが5cmの円柱の体積を求めなさい．円周率はπとして答えなさい．</p>`,
    figure: figSolids,
    parts: [
      { label: "", tpl: [D, D, "π cm³"], ans: ["8", "0"],
        explain: "4×4×π×5＝80π" }
    ]
  },
  {
    level: "中学受験レベル（濃度）",
    text: `<p>5%の食塩水Aと12%の食塩水Bを，重さの比 4 : 3 の割合で混ぜると，何%の食塩水になりますか．</p>`,
    parts: [
      { label: "", tpl: [D, "%"], ans: ["8"],
        explain: "Aを400g，Bを300gとして考える．食塩の重さは 400×0.05＝20g，300×0.12＝36g で合計56g．食塩水全体は700gなので，56÷700＝0.08＝8%．" }
    ]
  },
  {
    level: "中学1年レベル（比例式）",
    text: `<p>次の比例式を満たす x の値を求めなさい．</p>
           <p style="font-size:1.25rem;text-align:center">2 : 5 ＝ (x − 2) : (x + 7)</p>`,
    parts: [
      { label: "", tpl: ["x ＝ ", D], ans: ["8"],
        explain: "外項の積＝内項の積より 5(x−2)＝2(x+7)．5x−10＝2x+14，3x＝24 より x＝8．" }
    ]
  },
  {
    level: "中学2年レベル（連立方程式）",
    text: `<p>2けたの自然数があり，十の位の数と一の位の数の和は11です．また，十の位の数と一の位の数を入れかえてできる数は，もとの数より27大きくなります．もとの自然数を求めなさい．</p>`,
    parts: [
      { label: "", tpl: [D, D], ans: ["4", "7"],
        explain: "十の位 x，一の位 y として x＋y＝11，10y＋x＝10x＋y＋27．整理すると y−x＝3．よって x＝4，y＝7 で，もとの数は47．" }
    ]
  },
  {
    level: "中学2年レベル（1次関数）",
    text: `<p>2点 A(−1, 1)，B(2, 7) を通る直線 ℓ の式を y＝ax＋b の形で表しなさい．</p>`,
    parts: [
      { label: "", tpl: ["y ＝ ", D, " x ＋ ", D], ans: ["2", "3"],
        hint: "a，b はどちらも1けたの正の数です．",
        explain: "傾き＝(7−1)÷(2−(−1))＝2．y＝2x＋b に (−1,1) を代入して b＝3．" }
    ]
  },
  {
    level: "中学2年レベル（図形）",
    text: `<p>平行四辺形ABCDで，∠A の二等分線が辺BCと交わる点をEとします．AB＝5cm，AD＝8cm，∠ABC＝70°のとき，線分ECの長さを求めなさい．</p>`,
    figure: figParallelogram,
    parts: [
      { label: "", tpl: [D, "cm"], ans: ["3"],
        explain: "AD∥BC より ∠DAE＝∠AEB．∠BAE＝∠DAE なので △ABE は BA＝BE の二等辺三角形．BE＝5，EC＝8−5＝3．" }
    ]
  },
  {
    level: "中学3年レベル（2次方程式・計算）",
    text: `<p>次の2次方程式を解きなさい．</p>
           <p>x² − 4x − 1 ＝ 0</p>`,
    parts: [
      { label: "", tpl: ["x ＝ ", D, " ± √", D], ans: ["2", "5"],
        explain: "解の公式より x＝(4±√(16+4))÷2＝(4±2√5)÷2＝2±√5．" }
    ]
  },
  {
    level: "中学3年レベル（2次方程式とグラフ）",
    text: `<p>下の図のように，放物線 y＝x² と直線 y＝x＋6 が2点A，Bで交わっています．Aのx座標は負です．</p>
           <p>(1) 2点A，Bのx座標を求めなさい．<br>(2) △OAB の面積を求めなさい．ただし，座標の1目盛りを1cmとします．</p>`,
    figure: figGraph,
    parts: [
      { label: "(1)", tpl: ["A：−", D, "　B：", D], ans: ["2", "3"],
        hint: "A の x 座標は負，B の x 座標は正です（符号は式に示してあります）．",
        explain: "x²＝x＋6 より x²−x−6＝0．(x−3)(x+2)＝0 なので x＝−2，3．" },
      { label: "(2)", tpl: [D, D, "cm²"], ans: ["1", "5"],
        explain: "直線とy軸の交点を C(0,6) とすると，△OAB＝△OAC＋△OBC＝½×6×2＋½×6×3＝6＋9＝15．" }
    ]
  },
  {
    level: "中学3年レベル（確率）",
    text: `<p>次の確率を求めなさい．ただし，さいころの目の出方は同様に確からしいものとします．</p>
           <p>(1) 大小2つのさいころを同時に投げるとき，出た目の和が8になる確率<br>
              (2) 赤玉3個，白玉2個が入った袋から，同時に2個取り出すとき，2個とも同じ色である確率</p>`,
    parts: [
      { label: "(1)", tpl: [FA, D, FB, D, D, FC], ans: ["5", "3", "6"],
        hint: "既約分数（分子/分母）で答えなさい．",
        explain: "和が8になるのは (2,6)(3,5)(4,4)(5,3)(6,2) の5通り．全体は36通りなので 5/36．" },
      { label: "(2)", tpl: [FA, D, FB, D, FC], ans: ["2", "5"],
        hint: "既約分数（分子/分母）で答えなさい．",
        explain: "全体は 5C2＝10通り．赤2個は 3通り，白2個は 1通り，合わせて4通り．4/10＝2/5．" }
    ]
  }
];

/* ===== 共通ヘルパー ===== */
const isSlot = t => t === D;
const slotCount = part => part.tpl.filter(isSlot).length;

// 答えの表示文字列を作る．unselected は未選択欄の代わりに出す文字
function formatAnswer(part, vals, unselected = "□", html = false) {
  let k = 0;
  return part.tpl.map(t => {
    if (FRAC_HTML[t]) return html ? FRAC_HTML[t] : (t === FB ? "/" : "");
    if (!isSlot(t)) return t;
    const v = vals[k++];
    return v === "" || v === undefined ? unselected : v;
  }).join("");
}

// 各問題は10点満点．小問の数で等分する
const QUESTION_POINTS = 10;
const partPoints = q => QUESTION_POINTS / q.parts.length;


const sameAnswer = (part, vals) => part.ans.every((a, i) => (vals[i] || "") === a);
