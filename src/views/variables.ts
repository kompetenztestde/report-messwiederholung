import type {StringDict} from "@/types/resultTypes.ts";

export const transDict: StringDict = {
  average: "Gesamt"
}


export const germanCounts: {[key: number]: string} = {
  1: "ein",
  2: "zwei",
  3: "drei"
}


export const trainingGroupThresholdDict: {[key: string]: number} = {
  "Silbenmöwe": 16.5,
  "Wortfink": 26.5,
  "Textadler": 60
}


export const trainingGroupNumberThresholdDict: {[key: string]: number} = {
  0: 16.5,
  1: 26.5,
  2: 60
}


export const childFriendlySpeech: StringDict = {
  "Wortverständnis": "Wort",
  "Satzverständnis": "Satz"
}


export const studentFeedback = {
  icons: {
    slowDown: ['hourglass_top', 'hourglass_bottom', 'pause_circle']
  },
  peculiarities: {
    sentencesNotWorkedAt: "Der Test „Lesen“ besteht aus zwei Teilen. Bisher hast du nur den ersten Teil bearbeitet. (Im zweiten Teil musst du Sätze lesen.) Bitte hole diesen Test noch nach. Sprich dazu deine Lehrperson an.",
    manyMistakesArray: ["Langsamer lesen lohnt sich.", "Nimm dir Zeit, dann wird´s genauer.",
      "Ruhig atmen, lesen, dann klicken!",  "Übung hilft! Lies lieber langsam als zu schnell."],
    noGrowthArray: ["Gut, dass du dranbleibst!", "Super, dass du dich nicht nachlässt.",
      "Bleib dran! Mit etwas Übung schaffst du bald mehr!", "Toll gelesen! Jetzt üben wir weiter!"],
    progressArray: ["Das war schon besser!", "Du lernst dazu!", "Wird immer besser!", "Du kannst das!"],
    muchGrowthArray: ["Wow! Super Fortschritt!", "Tolle Steigerung, klasse gemacht!",
      "Du hast dich verbessert. Weiter so!", "Das viele Lesen hat sich gelohnt. Super!",
      "Deine Leseergebnisse haben sich sehr verbessert. Weiter so!", "Großartig! Bleib dran!"
    ],
    gettingWorseArray: ["Vielleicht warst du heute nicht ganz konzentriert. Das nächste Ergebnis wird besser.",
    "Beim nächsten Mal klappt´s bestimmt besser!", "Lesen ist Übungssache – bleib dran!"],
    betterWithWords: "Du kannst einzelne Wörter bisher besser lesen als ganze Sätze.",
    wordsLikeSentences: "Besonders auffällig ist, dass du Sätze fast genauso schnell und genau liest wie einzelne Wörter.",
    betterWithSentencesManyMistakesWithWords: "Du liest und verstehst die Sätze schon recht genau. Achte beim Lesen einzelner Wörter noch stärker auf die Genauigkeit.",
  },
  wowArray: ["Wow!", "Super!", "Toll gemacht!", "Bravo!", "Fantastisch!", "Hurra, geschafft!",
    "Wunderbar!", "Spitze!", "Genial!", "Raketenstark!", "Bingo!", "Wowomat!", "Zack - Bumm-Bang!",
    "Prima gelesen!", "Supi - Dupi", "Bärenstark!", "Holy macaroni"],
  solaceArray: ["Weiter so, du schaffst das!", "Du kannst stolz auf dich sein!", "Du gibst dein Bestes - Klasse!"],
  progressArray: ["Das war schon besser!", "Du lernst dazu!", "Wird immer besser!", "Du kannst das!"],
  Wortverständnis: {
    Silbenmöwe: {
      fewMistakes: "Du liest Worte noch langsam, aber dafür genau. Super! Mit regelmäßiger Übung, schaffst du es bald Worte noch schneller zu lesen.",
      manyMistakes: "Du liest Worte schon sehr schnell. Das ist richtig gut. Dadurch sind aber leider einige Fehler entstanden. Die Genauigkeit ist beim Lesen besonders wichtig.",
      noMistakes: "Du hast sehr genau gelesen. Richtig stark ist: Du hast keine Fehler im Worttest gemacht. Weiter so! Mit etwas Übung, schaffst du es bald auch noch schneller zu lesen."
    },
    Wortfink: {
      fewMistakes: "Deine Genauigkeit beim Lesen von Worten ist super! Mit regelmäßiger Übung, schaffst du es bald Worte noch schneller zu lesen.",
      manyMistakes: "Du liest Worte schon sehr schnell. Das ist richtig gut. Dadurch sind leider einige Fehler entstanden. Die Genauigkeit ist beim Lesen besonders wichtig. Hast du vielleicht manchmal geraten? Das solltest du beim nächsten Test besser machen. Lies langsamer und dafür richtig!",
      noMistakes: "Du hast Worte sehr genau gelesen und keine Fehler gemacht. Weiter so! Du liest schon zügig. Mit etwas Übung, schaffst du es bald auch noch schneller zu lesen."
    },
    Textadler: {
      newInGroup: "Jetzt bist du ein richtiger Überflieger! Du bist nun in der Gruppe der Textadler. Das ist eine starke Leistung. Übe weiter, um deine tolle Leistung zu halten.",
      manyMistakes: "Du liest Worte schon sehr schnell. Das machst du super. Es ist nun besonders wichtig, dass du an deiner Lesegenauigkeit weiter übst.",
      noMistakes: "Du liest Worte schon sehr schnell. Das machst du super. Außerdem hast du sehr genau gelesen und keine Fehler gemacht. Großartig!",
      stayedInGroup: "Du bist ein richtiger Überflieger! Du bist in der Gruppe der Textadler. Das ist eine starke Leistung. Übe weiter, um deine tolle Leistung zu halten."
    }
  },
  Satzverständnis: {
    Silbenmöwe: {
      fewMistakes: "Das Lesen von Sätzen ist noch schwieriger als das, einzelner Wörter. Du bist dabei langsam vorangekommen. Allerdings hast du gezeigt, dass du auch schon Sätze verstehen kannst. Super!",
      manyMistakes: "Du hast die Sätze sehr schnell gelesen. Dadurch sind leider einige Fehler entstanden. Wir sind uns unsicher, ob du die Sätze wirklich verstanden hast. Die Genauigkeit ist beim Lesen besonders wichtig.",
      noMistakes: "Du hast keine Fehler im Satztest gemacht. Weiter so! Es ist toll, dass du schon Sätze verstehen kannst."
    },
    Wortfink: {
      fewMistakes: "Das Lesen von Sätzen ist schwieriger als das, einzelner Wörter. Du bist dabei schon gut vorangekommen.",
      manyMistakes: "Du liest Sätze schon sehr schnell. Das machst du super. Dadurch sind leider einige Fehler entstanden. Wir sind uns unsicher, ob du die Sätze wirklich verstanden hast. Die Genauigkeit ist beim Lesen besonders wichtig.",
      noMistakes: "Du hast keine Fehler im Satzlesen gemacht und kannst schon zügig lesen. Weiter so! Es ist toll, dass du schon Sätze verstehen kannst."
    },
    Textadler: {
      fewMistakes: "Das Lesen von Sätzen ist schwieriger als das, einzelner Wörter. Du hast gezeigt, dass du es schon richtig gut kannst. Fast alle Sätze hast du korrekt und schnell gelesen.",
      manyMistakes: "Du liest Sätze schon sehr schnell. Das machst du super. Dadurch sind leider einige Fehler entstanden. Wir sind uns unsicher, ob du alle Sätze wirklich verstanden hast. Die Genauigkeit ist beim Lesen besonders wichtig.",
      noMistakes: "Das Satzlesen hast du großartig gemeistert. Du hast gezeigt, dass du schnell lesen kannst. Das machst du fantastisch! Sicher schaffst du nun schon erste kleine Texte."
    }
  },
  adviceArrays: {
    Silbenmöwe: [
      "Lies kurze Texte mehrmals und markiere wichtige Wörter.",
      "Lass dir schwierige Wörter erklären.",
      "Lies jeden Tag ein paar Minuten laut oder leise.",
      "Du schaffst das – mit jedem Lesen wirst du besser!"
    ],
    Wortfink: [
      "Lies bei nächsten Mal etwas langsamer und überprüfe, ob der Satz wirklich Sinn ergibt.",
      "Übe außerdem, schwierige Wörter durch den Zusammenhang zu erschließen.",
      "Lies in deinem Tempo und überlege, was der Satz bedeutet.",
      "Mit jeder Übung wird das Lesen leichter und macht noch mehr Spaß."
    ],
    Textadler: ["Weiter so! Du kannst dich jetzt auf anspruchsvollere Text konzentrieren."]
  }
}
