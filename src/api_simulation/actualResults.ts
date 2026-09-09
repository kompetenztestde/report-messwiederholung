import type { ApiClassDataType, ApiResultType } from "@/types/resultTypes.ts";


function createRandomStrings(): string[] {
  let outString: string = '';
  let inOptions: string = 'abcdefghijklmnopqrstuvwxyz';

  const codes: string[] = [];

  while (codes.length < 35) {
    outString = ""
    for (let i = 0; i < 3; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    if (!codes.includes(outString) &&
      !["sex", "nsu", "xxx", "afd", "csu", "npd", "spd", "cum", "ass"].includes(outString)) {
      codes.push(outString)
    }
  }
  return codes
}

function gaussianRandom(maxCorrectlyReadCount: number): number {
  const r = Math.abs(Math.random() - Math.random());
  const result = Math.round(((r * .5 + .5) * maxCorrectlyReadCount) - 6);
  if (result > 0) {
    return result
  } else {
    return 0
  }
}

function getNextStudentCorrectlyReadCount(previousCorrectlyReadCount: number): number {
  const randomPercentage = Math.floor(Math.random() * 100);
  let result: number
  if (randomPercentage > 75) {
    result = previousCorrectlyReadCount - Math.floor(Math.random() * 15)
  } else {
    result = previousCorrectlyReadCount + Math.floor(Math.random() * 17)
  }
  if (result < 0) {
    return 0
  }
  return result > 60 ? 60 : result
}

function getReadCount(correctlyReadCount:number, maxWordCount: number) {

  if (Math.random() > 0.87) {
    if (correctlyReadCount * 2 > 50) {

    } else {
      return correctlyReadCount * 2
    }
  }
  return correctlyReadCount
    + Math.floor(Math.random() * 3.5)
}


function getSentenceFromWordCount(wordCount: number): number {
  const result = wordCount - Math.floor(Math.random() * 5)
  if (result > 60) {
    return 60
  } else if (result < 0) {
    return 0
  }
  return wordCount - Math.floor(Math.random() * 3)
}

export function getRandomApiResults(oneStudent=false) {

  const studentCodes: string[] = createRandomStrings();
  const maxWordCount = 60;

  let classSize = 1

  const firstMaxCorrectlyReadCount = Math.floor(Math.random() * 15) + 45;
  if (!oneStudent) {
    classSize = Math.floor(Math.random() * 7) + 24;
  } else {
    classSize = 1
  }

  const results: ApiClassDataType = {
    "classId": 10,
    "subject": "Deutsch",
    "domain": "Lesen",
    "className": "3a",
    "minScore": 0,
    "maxScore": 60,
    "totalMeasurements": 3,
    "measurements": [
      {
        "measurementName": "2025 März",
        "feedbackConfig": {"classLevel": 2},
        "results": []
      },
      {
        "measurementName": "2025 September",
        "feedbackConfig": {"classLevel": 3, "highScoreThreshold": 45},
        "results": []
      },
      {
        "measurementName": "2026 März",
        "feedbackConfig": {"classLevel": 3, "highScoreThreshold": 45},
        "results": []
      }
    ] //.slice(Math.round(Math.random() * 2))
  }

  let participationId = 0;

  for (const id of Array(classSize).keys()) {

    const listLength = studentCodes.length;
    const studentIndex = Math.floor(Math.random() * (listLength -  1));

    const studentCode = studentCodes[studentIndex]

    studentCodes.splice(studentIndex, 1)

    const firstCorrectlyReadCount = gaussianRandom(firstMaxCorrectlyReadCount - 12);

    const firstCorrectlyReadCountSentence = getSentenceFromWordCount(firstCorrectlyReadCount)
    const firstReadCount = getReadCount(firstCorrectlyReadCount, maxWordCount)
    const firstReadCountSentence = getReadCount(firstCorrectlyReadCountSentence, maxWordCount)

    const secondCorrectlyReadCount = getNextStudentCorrectlyReadCount(firstCorrectlyReadCount)
    const secondCorrectlyReadCountSentence = getSentenceFromWordCount(secondCorrectlyReadCount)
    const secondReadCount = getReadCount(secondCorrectlyReadCount, maxWordCount)
    const secondReadCountSentence = getReadCount(secondCorrectlyReadCountSentence, maxWordCount)

    const thirdCorrectlyReadCount = getNextStudentCorrectlyReadCount(secondCorrectlyReadCount)
    const thirdCorrectlyReadCountSentence = getSentenceFromWordCount(thirdCorrectlyReadCount)
    const thirdReadCount = getReadCount(thirdCorrectlyReadCount, maxWordCount)
    const thirdReadCountSentence = getReadCount(thirdCorrectlyReadCountSentence, maxWordCount)

    participationId++

    const resultTest1: ApiResultType = {
      participationId: participationId,
      participantCode: studentCode,
      results: {
        Satz_TBA_N3: { correct: firstCorrectlyReadCountSentence, wrong: firstReadCountSentence - firstCorrectlyReadCountSentence },
        Wort_TBA_N1: { correct: firstCorrectlyReadCount, wrong: firstReadCount - firstCorrectlyReadCount }
      }
    }

    if (Math.random() > 0.07) {
      results.measurements[0].results.push(resultTest1)
    }

    if (results.measurements.length > 1) {
      participationId++

      const resultTest2: ApiResultType = {
        participationId: participationId,
        participantCode: studentCode,
        results: {
          Satz_TBA_N2: {
            correct: secondCorrectlyReadCountSentence,
            wrong: secondReadCountSentence - secondCorrectlyReadCountSentence
          },
          Wort_TBA_N2: {
            correct: secondCorrectlyReadCount,
            wrong: secondReadCount - secondCorrectlyReadCount
          }
        }
      }
      if (Math.random() > 0.07) {
        results.measurements[1].results.push(resultTest2)
      }
    }

    if (results.measurements.length > 2) {
      participationId++

      const resultTest3: ApiResultType = {
        participationId: participationId,
        participantCode: studentCode,
        results: {
          Satz_TBA_N4: {
            correct: thirdCorrectlyReadCountSentence,
            wrong: thirdReadCountSentence - thirdCorrectlyReadCountSentence
          },
          Wort_TBA_N4: {
            correct: thirdCorrectlyReadCount,
            wrong: thirdReadCount - thirdCorrectlyReadCount
          }
        }
      }
      if (Math.random() > 0.07) {
        results.measurements[2].results.push(resultTest3)
      }
    }
  }
  return results
}
