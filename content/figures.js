"use strict";
/* 図（SVG）。問題の figure: に関数名を指定すると，問題文の下に表示される（content/math.js から使用） */

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
