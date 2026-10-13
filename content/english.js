"use strict";
/* 英語の科目データ（100点満点）
   問1 英単語（日本語→英語・記述）6題・30点 ／ 問2 英文法8題（選択・記述）40点 ／ 問3 長文読解 5題・30点

   問題を足す／入れ替える：下の questions（大問）や parts（小問）の行を追加・削除・並べ替えるだけ。
   問題番号・小問番号 (1)(2)… は自動で振られる。配点は大問の points を小問の数で等分。

   大問の書き方
     level … 見出し ／ points … 配点 ／ text … 問題文（HTML）／ parts … 小問の配列
   小問の書き方（下の部品を使うと1行で書ける）
     choicePart(設問文, 正解の番号, 解説)       … 選択（①〜④）。正解は 1〜4
     textPart(設問文, 正解, 解説, { hint })     … 記述（英語を入力）。正解は文字列，別解があるときは配列
     2つ以上の欄があるときは { prompt, tpl: [T, " ", T], ans: [正解1, 正解2], explain } と直接書く */


/* ===== 設問文の部品 ===== */
const BLANK = "{L}";                                   // 設問文中の空所（下線）
const opts = (a, b, c, d) => `<span class="opts">① ${a}　　② ${b}　　③ ${c}　　④ ${d}</span>`;      // 選択肢（横並び）
const optsV = (...a) => `<span class="opts-v">${a.map((x, i) => `<span>${CIRCLED[i + 1]} ${x}</span>`).join("")}</span>`;   // 選択肢（縦並び・長文用）
const ja = s => `<span class="ja">日本語訳：${s}</span>`;                                           // 日本語訳
const given = w => `<span class="given-word">（${w}）</span>`;                                       // 形を変えて使う元の単語（強調）

/* ===== 小問の部品 ===== */
const choicePart = (prompt, ans, explain) => ({ prompt, tpl: [D], ans: [String(ans)], explain });
const textPart = (prompt, ans, explain, extra = {}) => ({ prompt, tpl: [T], ans: [ans], explain, ...extra });


/* ===== 問題 ===== */
const ENGLISH_QUESTIONS = [
  // ---------- 問1 英単語 ----------
  {
    points: 30,
    level: "英単語（中学3年レベル・日本語→英語）",
    text: `<p>次の日本語に当たる英単語を，英語で書きなさい．（ ）内の頭文字から始まる語を答えること．</p>`,
    parts: [
      textPart("「経験」（e）", "experience", "experience＝経験．"),
      textPart("「伝統」（t）", "tradition", "tradition＝伝統．"),
      textPart("「国際的な」（i）", "international", "international＝国際的な．"),
      textPart("「社会」（s）", "society", "society＝社会．"),
      textPart("「危険な」（d）", "dangerous", "dangerous＝危険な．"),
      textPart("「必要な」（n）", "necessary", "necessary＝必要な．")
    ]
  },

  // ---------- 問2 英文法 ----------
  {
    points: 40,
    level: "英文法（中学1〜3年・高校入試レベル）",
    text: `<p>次の各英文の空所に入る最も適切なものを選ぶか，適切な英語を書きなさい．（記述は，日本語訳と（ ）内の語を参考にすること．空所が2つのときは，欄にも1語ずつ入力する）</p>`,
    parts: [
      textPart(`A friend of ${BLANK} lives in Osaka.${ja("私の友人の一人は大阪に住んでいます．")}`,
        "mine", "〈a friend of＋所有代名詞〉で「〜の友人（の一人）」．a friend of mine．"),
      textPart(`The more you practice, the ${BLANK} you will become.${given("good")}${ja("練習すればするほど，あなたは上手になるでしょう．")}`,
        "better", "〈the＋比較級，the＋比較級〉「～すればするほど…」．good－better－best．"),
      choicePart(`Tokyo is larger than any other ${BLANK} in Japan.${opts("cities", "city", "the city", "cities'")}`,
        2, "〈比較級＋than any other＋単数名詞〉で最上級の意味（東京は日本のどの都市よりも大きい）．"),
      textPart(`She has been sick in bed ${BLANK} last Sunday.${ja("彼女は先週の日曜日からずっと病気で寝ています．")}`,
        "since", "継続を表す現在完了．起点（last Sunday）が示されているので since．期間なら for．"),
      choicePart(`My mother told me ${BLANK} up late.${opts("not to stay", "to not stay", "don't stay", "not staying")}`,
        1, "〈tell＋人＋to＋動詞〉の否定は〈tell＋人＋not to＋動詞〉．not to stay．"),
      textPart(`He left the room without ${BLANK} goodbye.${given("say")}${ja("彼はさよならも言わずに部屋を出ていきました．")}`,
        "saying", "前置詞 without のあとは動名詞．saying goodbye．"),
      textPart(`This is the house ${BLANK} roof is red.${ja("これは屋根が赤い家です．")}`,
        "whose", "先行詞 the house の「その屋根」＝所有を表す関係代名詞 whose．"),
      textPart(`If I ${BLANK} studied harder, I could have passed the exam.${given("have")}${ja("もしもっと一生懸命勉強していたら，試験に合格できたのに．")}`,
        "had", "仮定法過去完了〈If＋主語＋had＋過去分詞，主語＋could have＋過去分詞〉．had studied．")
    ]
  },

  // ---------- 問3 長文読解 ----------
  {
    points: 30,
    level: "長文読解（高校入試レベル）",
    text: `<div class="passage"><h4>A Small Library</h4>
<p>Emi lives in a small town. There was no library there, so she had to take a bus for thirty minutes to go to the city library. Her grandmother said, "When I was young, I couldn't read many books because we didn't have enough money." Emi was sad to hear <u>that</u>.</p>
<p>Emi decided to make a small library. Her friends collected old books and put them in a room in the community center. Emi put up posters at the station and the supermarket because she wanted many people to know about the library. Soon, children and old people began to visit the room.</p>
<p>Now the library has more than 500 books. Emi says, "I learned that a small action can change a town."</p></div>`,
    parts: [
      choicePart(`Why did Emi have to take a bus to go to the city library?${optsV("Because she liked riding buses.", "Because there was no library in her town.", "Because her grandmother told her to.", "Because the books in the community center were old.")}`,
        2, "第1段落 2文目．There was no library there, so she had to take a bus …"),
      choicePart(`Why did Emi put up posters at the station and the supermarket?${optsV("Because she wanted to sell her old books.", "Because she wanted many people to know about the library.", "Because she wanted to ask people for money.", "Because she wanted to find her grandmother.")}`,
        2, "第2段落 3文目．… because she wanted many people to know about the library．"),
      choicePart(`下線部 <u>that</u> の内容として最も適切なものを選びなさい．${optsV("There was no library in her grandmother's town.", "Her grandmother couldn't read many books when she was young because her family didn't have enough money.", "Emi's friends didn't collect any books.", "Her grandmother didn't like reading books.")}`,
        2, "that は直前の祖母の言葉（若いころ，お金がなくて本をたくさん読めなかった）を指す．"),
      choicePart(`本文の内容に合っているものを選びなさい．${optsV("Emi's grandmother gave many books to the library.", "Emi's friends put old books in a room in the community center.", "The library is in a new building in the city.", "The library has about fifty books.")}`,
        2, "第2段落 2文目．Her friends collected old books and put them in a room in the community center．"),
      textPart(`Emi の言葉に合うように，空所に入る英語1語を書きなさい．<br>Emi learned that a small ${BLANK} can change a town.`,
        "action", "第3段落．a small action can change a town．")
    ]
  }
];


registerSubject({
  id: "english",
  name: "英語",
  timeLimitMin: 8,                 // 制限時間（分）
  questionPoints: 10,              // 大問に points がないときの既定値
  choices: ["1", "2", "3", "4"],   // マーク欄の選択肢（①〜④）
  markNote: `答えはマーク形式（番号を選ぶ）と記述形式（英語を入力する）があります．番号（①〜④）を1つ選ぶか，英語を入力してください．記述欄は半角英字で入力してください．大文字・小文字は区別しません．`,
  questions: ENGLISH_QUESTIONS
});
