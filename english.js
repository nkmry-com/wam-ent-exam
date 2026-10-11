"use strict";
/* 英語の科目データ（100点満点）
   問1 英単語（日本語→英語・記述）30点（10題）／ 問2 英文法10題（選択・記述）40点 ／ 問3 長文読解 30点
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
  timeLimitMin: 10,          // 制限時間（分）
  questionPoints: 10,        // 問題ごとの points を指定しない場合の既定値
  choices: ["1", "2", "3", "4"],   // マーク欄の選択肢（①〜④）
  markNote: `答えはマーク形式（番号を選ぶ）と記述形式（英語を入力する）があります．番号（①〜④）を1つ選ぶか，英語を入力してください．記述欄は，日本語入力がオンのままでも半角の英字（A〜Z）だけが入力されます．大文字・小文字は区別しません．`,
  questions: [
    {
      points: 30,
      level: "英単語（中学3年レベル・日本語→英語）",
      text: `<p>次の日本語に当たる英単語を，英語で書きなさい．（ ）内の頭文字から始まる語を答えること．</p>`,
      parts: [
        { label: "(1)", prompt: "「環境」（e）", tpl: [T], ans: ["environment"], explain: "environment＝環境．" },
        { label: "(2)", prompt: "「経験」（e）", tpl: [T], ans: ["experience"], explain: "experience＝経験．" },
        { label: "(3)", prompt: "「伝統」（t）", tpl: [T], ans: ["tradition"], explain: "tradition＝伝統．" },
        { label: "(4)", prompt: "「発明する」（i）", tpl: [T], ans: ["invent"], explain: "invent＝発明する．" },
        { label: "(5)", prompt: "「国際的な」（i）", tpl: [T], ans: ["international"], explain: "international＝国際的な．" },
        { label: "(6)", prompt: "「社会」（s）", tpl: [T], ans: ["society"], explain: "society＝社会．" },
        { label: "(7)", prompt: "「危険な」（d）", tpl: [T], ans: ["dangerous"], explain: "dangerous＝危険な．" },
        { label: "(8)", prompt: "「決める，決心する」（d）", tpl: [T], ans: ["decide"], explain: "decide＝決める．" },
        { label: "(9)", prompt: "「必要な」（n）", tpl: [T], ans: ["necessary"], explain: "necessary＝必要な．" },
        { label: "(10)", prompt: "「文化」（c）", tpl: [T], ans: ["culture"], explain: "culture＝文化．" }
      ]
    },
    {
      points: 40,
      level: "英文法（中学1〜3年・高校入試レベル）",
      text: `<p>次の各英文の空所に入る最も適切なものを選ぶか，適切な英語を書きなさい．（記述は，日本語訳と（ ）内の語を参考にすること）</p>`,
      parts: [
        { label: "(1)", prompt: `I left my umbrella at home, so my sister lent me ${ENG_BLANK}.<br>${opts("her", "hers", "she", "herself")}`,
          tpl: [D], ans: ["2"], explain: "「姉の（傘）」＝ hers（所有代名詞）．her umbrella の意味になる．" },
        { label: "(2)", prompt: `Look! The children ${ENG_BLANK} ${ENG_BLANK} in the park now.${given("play")}${ja("見て！子どもたちは今，公園で遊んでいます．")}`,
          tpl: [T, " ", T], ans: ["are", "playing"], hint: "2つの欄に，1語ずつ入力しなさい．", explain: "現在進行形は〈be動詞＋動詞のing形〉．主語が複数なので are playing．" },
        { label: "(3)", prompt: `You ${ENG_BLANK} wear a helmet when you ride a bike. It is the rule.<br>${opts("must", "may", "can", "would")}`,
          tpl: [D], ans: ["1"], explain: "ルールなので「〜しなければならない」の must．" },
        { label: "(4)", prompt: `My bag is ${ENG_BLANK} than yours.${given("heavy")}${ja("私のかばんはあなたのものより重いです．")}`,
          tpl: [T], ans: ["heavier"], explain: "heavy の比較級は y を i にかえて er をつける．heavier．" },
        { label: "(5)", prompt: `Mt. Fuji is the ${ENG_BLANK} mountain in Japan.<br>${opts("higher", "highest", "high", "more high")}`,
          tpl: [D], ans: ["2"], explain: "the と in Japan があるので最上級 highest．" },
        { label: "(6)", prompt: `Have you ever ${ENG_BLANK} a koala?${given("see")}${ja("あなたはこれまでにコアラを見たことがありますか．")}`,
          tpl: [T], ans: ["seen"], explain: "経験を表す現在完了〈have＋過去分詞〉．see－saw－seen．" },
        { label: "(7)", prompt: `I want something cold ${ENG_BLANK}.<br>${opts("drink", "to drink", "drinking", "drank")}`,
          tpl: [D], ans: ["2"], explain: "something cold を後ろから説明する形容詞的用法の不定詞 to drink．" },
        { label: "(8)", prompt: `I am good at ${ENG_BLANK} pictures.${given("draw")}${ja("私は絵を描くのが得意です．")}`,
          tpl: [T], ans: ["drawing"], explain: "前置詞 at のあとは動名詞（動詞のing形）．drawing．" },
        { label: "(9)", prompt: `The girl ${ENG_BLANK} is talking with Tom is my cousin.<br>${opts("who", "which", "whose", "whom")}`,
          tpl: [D], ans: ["1"], explain: "先行詞が人（The girl）で主語の働きをするので who．" },
        { label: "(10)", prompt: `I wish I ${ENG_BLANK} more time.${given("have")}${ja("もっと時間があればいいのに．")}`,
          tpl: [T], ans: ["had"], explain: "I wish＋過去形（仮定法過去）で「〜ならいいのに」．had．" }
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
