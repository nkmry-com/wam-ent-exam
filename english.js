"use strict";
/* 英語の科目データ（100点満点）
   問1 英単語（日本語→英語・記述）6題・30点 ／ 問2 英文法8題（選択・記述）40点 ／ 問3 長文読解 30点
   tpl の D＝選択（①〜④），T＝記述（英語を入力）．ans は D なら "1"〜"4"，T なら文字列（別解は配列）．
   p.prompt は小問の設問文（HTML）．p.label の番号が設問文の横に並ぶ．{L} は設問文中の空所． */
const ENG_BLANK = "{L}";
const opts = (a, b, c, d) => `<span class="opts">① ${a}　　② ${b}　　③ ${c}　　④ ${d}</span>`;
const ja = s => `<span class="ja">日本語訳：${s}</span>`;
// 形を変えて使う元の単語の指定（強調表示）
const given = w => `<span class="given-word">（${w}）</span>`;
// 選択肢を1行ずつ縦に並べる（長文読解用）
const optsV = (...a) => `<span class="opts-v">${a.map((x, i) => `<span>${CIRCLED[i + 1]} ${x}</span>`).join("")}</span>`;

SUBJECTS.english = {
  id: "english",
  name: "英語",
  timeLimitMin: 8,           // 制限時間（分）
  questionPoints: 10,        // 問題ごとの points を指定しない場合の既定値
  choices: ["1", "2", "3", "4"],   // マーク欄の選択肢（①〜④）
  markNote: `答えはマーク形式（番号を選ぶ）と記述形式（英語を入力する）があります．番号（①〜④）を1つ選ぶか，英語を入力してください．記述欄は半角英字で入力してください．大文字・小文字は区別しません．`,
  questions: [
    {
      points: 30,
      level: "英単語（中学3年レベル・日本語→英語）",
      text: `<p>次の日本語に当たる英単語を，英語で書きなさい．（ ）内の頭文字から始まる語を答えること．</p>`,
      parts: [
        { label: "(1)", prompt: "「経験」（e）", tpl: [T], ans: ["experience"], explain: "experience＝経験．" },
        { label: "(2)", prompt: "「伝統」（t）", tpl: [T], ans: ["tradition"], explain: "tradition＝伝統．" },
        { label: "(3)", prompt: "「国際的な」（i）", tpl: [T], ans: ["international"], explain: "international＝国際的な．" },
        { label: "(4)", prompt: "「社会」（s）", tpl: [T], ans: ["society"], explain: "society＝社会．" },
        { label: "(5)", prompt: "「危険な」（d）", tpl: [T], ans: ["dangerous"], explain: "dangerous＝危険な．" },
        { label: "(6)", prompt: "「必要な」（n）", tpl: [T], ans: ["necessary"], explain: "necessary＝必要な．" },
      ]
    },
    {
      points: 40,
      level: "英文法（中学1〜3年・高校入試レベル）",
      text: `<p>次の各英文の空所に入る最も適切なものを選ぶか，適切な英語を書きなさい．（記述は，日本語訳と（ ）内の語を参考にすること．空所が2つのときは，欄にも1語ずつ入力する）</p>`,
      parts: [
        { label: "(1)", prompt: `A friend of ${ENG_BLANK} lives in Osaka.${ja("私の友人の一人は大阪に住んでいます．")}`,
          tpl: [T], ans: ["mine"], explain: "〈a friend of＋所有代名詞〉で「〜の友人（の一人）」．a friend of mine．" },
        { label: "(2)", prompt: `The more you practice, the ${ENG_BLANK} you will become.${given("good")}${ja("練習すればするほど，あなたは上手になるでしょう．")}`,
          tpl: [T], ans: ["better"], explain: "〈the＋比較級，the＋比較級〉「～すればするほど…」．good－better－best．" },
        { label: "(3)", prompt: `Tokyo is larger than any other ${ENG_BLANK} in Japan.${opts("cities", "city", "the city", "cities'")}`,
          tpl: [D], ans: ["2"], explain: "〈比較級＋than any other＋単数名詞〉で最上級の意味（東京は日本のどの都市よりも大きい）．" },
        { label: "(4)", prompt: `She has been sick in bed ${ENG_BLANK} last Sunday.${ja("彼女は先週の日曜日からずっと病気で寝ています．")}`,
          tpl: [T], ans: ["since"], explain: "継続を表す現在完了．起点（last Sunday）が示されているので since．期間なら for．" },
        { label: "(5)", prompt: `My mother told me ${ENG_BLANK} up late.${opts("not to stay", "to not stay", "don't stay", "not staying")}`,
          tpl: [D], ans: ["1"], explain: "〈tell＋人＋to＋動詞〉の否定は〈tell＋人＋not to＋動詞〉．not to stay．" },
        { label: "(6)", prompt: `He left the room without ${ENG_BLANK} goodbye.${given("say")}${ja("彼はさよならも言わずに部屋を出ていきました．")}`,
          tpl: [T], ans: ["saying"], explain: "前置詞 without のあとは動名詞．saying goodbye．" },
        { label: "(7)", prompt: `This is the house ${ENG_BLANK} roof is red.${ja("これは屋根が赤い家です．")}`,
          tpl: [T], ans: ["whose"], explain: "先行詞 the house の「その屋根」＝所有を表す関係代名詞 whose．" },
        { label: "(8)", prompt: `If I ${ENG_BLANK} studied harder, I could have passed the exam.${given("have")}${ja("もしもっと一生懸命勉強していたら，試験に合格できたのに．")}`,
          tpl: [T], ans: ["had"], explain: "仮定法過去完了〈If＋主語＋had＋過去分詞，主語＋could have＋過去分詞〉．had studied．" }
      ]
    },
    {
      points: 30,
      level: "長文読解（高校入試レベル）",
      text: `<div class="passage"><h4>A Small Library</h4>
<p>Emi lives in a small town. There was no library there, so she had to take a bus for thirty minutes to go to the city library. Her grandmother said, "When I was young, I couldn't read many books because we didn't have enough money." Emi was sad to hear <u>that</u>.</p>
<p>Emi decided to make a small library. Her friends collected old books and put them in a room in the community center. Emi put up posters at the station and the supermarket because she wanted many people to know about the library. Soon, children and old people began to visit the room.</p>
<p>Now the library has more than 500 books. Emi says, "I learned that a small action can change a town."</p></div>`,
      parts: [
        { label: "(1)", prompt: `Why did Emi have to take a bus to go to the city library?${optsV("Because she liked riding buses.", "Because there was no library in her town.", "Because her grandmother told her to.", "Because the books in the community center were old.")}`,
          tpl: [D], ans: ["2"], explain: "第1段落 2文目．There was no library there, so she had to take a bus …" },
        { label: "(2)", prompt: `Why did Emi put up posters at the station and the supermarket?${optsV("Because she wanted to sell her old books.", "Because she wanted many people to know about the library.", "Because she wanted to ask people for money.", "Because she wanted to find her grandmother.")}`,
          tpl: [D], ans: ["2"], explain: "第2段落 3文目．… because she wanted many people to know about the library．" },
        { label: "(3)", prompt: `下線部 <u>that</u> の内容として最も適切なものを選びなさい．${optsV("There was no library in her grandmother's town.", "Her grandmother couldn't read many books when she was young because her family didn't have enough money.", "Emi's friends didn't collect any books.", "Her grandmother didn't like reading books.")}`,
          tpl: [D], ans: ["2"], explain: "that は直前の祖母の言葉（若いころ，お金がなくて本をたくさん読めなかった）を指す．" },
        { label: "(4)", prompt: `本文の内容に合っているものを選びなさい．${optsV("Emi's grandmother gave many books to the library.", "Emi's friends put old books in a room in the community center.", "The library is in a new building in the city.", "The library has about fifty books.")}`,
          tpl: [D], ans: ["2"], explain: "第2段落 2文目．Her friends collected old books and put them in a room in the community center．" },
        { label: "(5)", prompt: `Emi の言葉に合うように，空所に入る英語1語を書きなさい．<br>Emi learned that a small ${ENG_BLANK} can change a town.`,
          tpl: [T], ans: ["action"], explain: "第3段落．a small action can change a town．" }
      ]
    }
  ]
};
