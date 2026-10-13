# 問題・注意事項の編集ガイド

問題や注意事項は、すべてこの `content/` フォルダの中だけで編集できます（`js/` の画面処理は触らなくて大丈夫です）。

## フォルダ構成

```
index.html        受験画面
ans.html          解答・解説（ans.html?subject=english のように科目を指定）
css/style.css     見た目
js/core.js        共通ルール（採点・表示の整形など）
js/exam.js        受験画面の処理
js/answers.js     解答・解説ページの処理
content/
  settings.js     試験全体の設定（タイトル／科目の順番／面接担当者チェック／注意事項）
  figures.js      数学の図（SVG）
  math.js         数学の問題
  english.js      英語の問題
```

## よくある編集

| やりたいこと | 編集する場所 |
|---|---|
| 制限時間を変える | `math.js` / `english.js` 末尾の `timeLimitMin` |
| 問題を入れ替える・足す・消す | `math.js` / `english.js` の問題の行を並べ替え・追加・削除（問題番号・小問番号 (1)(2)…・配点は自動） |
| 配点を変える | 大問の `points`（小問の数で等分される） |
| 注意事項を足す・直す | `settings.js` の `notes` |
| 面接担当者向けのチェックを足す | `settings.js` の `staffChecks` |
| 科目を足す | `content/<科目>.js` を作り `registerSubject({...})` で登録 → `settings.js` の `subjectOrder` に id を追加 → `index.html` と `ans.html` に `<script>` を足す |

## 注意事項（settings.js の notes）

```js
{ text: "文章" }                       // 通常の項目
{ warn: true, text: "文章" }           // 赤枠・チェック必須
{ text: ctx => `…${ctx.times}…` }      // 科目数・制限時間などを文章に入れたいとき
{ eachSubject: s => `【${s.name}】…` } // 科目ごとに1項目ずつ出したいとき
```

`ctx.count`（科目数）、`ctx.names`（数学・英語）、`ctx.times`（数学12分，英語8分）、`ctx.reloadIcon`（リロードのアイコン）が使えます。

## 英語の問題の書き方（english.js）

```js
// 記述（英語を入力）：設問文, 正解, 解説
textPart("「経験」（e）", "experience", "experience＝経験．")
// 別解があるとき・ヒントを付けるとき
textPart(`I ${BLANK} a book.`, ["read", "have read"], "解説", { hint: "ヒント" })
// 選択（①〜④）：設問文, 正解の番号, 解説
choicePart(`He ${BLANK} tennis.${opts("play", "plays", "played", "playing")}`, 2, "解説")
// 空所が2つなど：直接書く
{ prompt: `You ${BLANK} ${BLANK} to go.`, tpl: [T, " ", T], ans: [["don't", "do not"], "have"], explain: "解説" }
```

設問文で使える部品：`BLANK`（空所）、`opts(...)`（選択肢・横並び）、`optsV(...)`（縦並び）、`ja("日本語訳")`、`given("元の単語")`（黄色で強調）。

## 数学の問題の書き方（math.js）

ファイル冒頭のコメントを参照してください。答えの枠は `D`（マーク欄）、分数は `FA, D, FB, D, FC` です。図は `figures.js` に関数を足し、問題に `figure: 関数名` と書きます。
