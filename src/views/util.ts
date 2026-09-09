import type {
  ApiClassDataType,
  ApiParticipationResult, ClassStudentsDataDictType,
  DisplayClassDataType,
  FeedbackGroupResponseType,
  ResultsListType, ResultsStatistics, ResultsType,
  ResultType, StringDict, StudentResultType
} from "@/types/resultTypes.ts";


import { getFeedbackGroup } from "@/api_simulation/feedbackGroup.ts";
import {trainingGroupThresholdDict} from "@/views/variables.ts";

type AggregateResultType = {
  aggregatedResult: number,
  trainingGroupName: string,
  probablyGuessed: boolean,
}


const calculateSum = (arr: number[]) => {
  return arr.reduce((total, current) => {
    return total + current;
  }, 0);
}


function getAggregateResult(correctArray: number[], wrongArray: number[], subtestCount: number): number {
  const intermediateResult =  (calculateSum(correctArray) - calculateSum(wrongArray)) / subtestCount

  if (intermediateResult > 60) {
    return 60
  } else if ( intermediateResult < 0) {
    return 0
  } else {
    return intermediateResult
  }
}


function getTrainingGroup(aggregatedResult:number): string {
  let trainingGroupName = ""

  for (const [key, value] of Object.entries(trainingGroupThresholdDict)) {
    if (aggregatedResult < value ) {
      trainingGroupName = key
      break
    }
  }
  return trainingGroupName
}


function processStudentData(apiParticipationResult: ApiParticipationResult, aggregationType: string | undefined, subtestCount: number): AggregateResultType {
  if (!aggregationType || aggregationType !== "average") {
    throw new Error("Unknown aggregationType")
  }

  if (aggregationType === "average") {
    const correctArray: number[] = [];
    const wrongArray: number[] = [];
    let guessedInSubtest = false;
    for (const [unitId, resultObj] of Object.entries(apiParticipationResult)) {
      if (unitId.startsWith("Satz")) {
        resultObj.probablyGuessed = resultObj.correct / resultObj.wrong < 1.5;
      } else if (unitId.startsWith("Wort")) {
        resultObj.probablyGuessed = resultObj.correct / resultObj.wrong < 0.25;
      }
      if (resultObj.probablyGuessed) {
        guessedInSubtest = true;
      }
      correctArray.push(resultObj.correct)
      wrongArray.push(resultObj.wrong)
    }
    const aggregatedResult = getAggregateResult(correctArray, wrongArray, subtestCount)
    return {
      aggregatedResult,
      trainingGroupName: getTrainingGroup(aggregatedResult),
      probablyGuessed: guessedInSubtest,
    }
  }
}


export function createLabelSubtestUnitIdDict(feedbackGroup: FeedbackGroupResponseType): StringDict {
  const labelDict: StringDict = {DLTS01: "Satzverständnis", DLTW03: "Wortverständnis"}

  for (const subtestData of feedbackGroup.subtests) {
    const label = subtestData.name

    for (const [dateStr, unitId] of Object.entries(subtestData.unitIds)) {
      labelDict[unitId] = label
    }
  }
  return labelDict
}


function addHumanReadableSubtestLabels(participationResult: ApiParticipationResult, labelDict: StringDict): ApiParticipationResult {

  const labeledParticipationResult: ApiParticipationResult = {};

  for (const [unitId, resultObj] of Object.entries(participationResult)) {
    const humanReadableLabel = labelDict[unitId]
    labeledParticipationResult[humanReadableLabel] = resultObj
  }
  return labeledParticipationResult;
}


function getClassDataDict(allTestsResults: ResultsListType, subtestLabelDict: StringDict): ClassStudentsDataDictType {

  const subtestLabelSet = new Set<string>();

  for (const [key, value] of Object.entries(subtestLabelDict)) {
    subtestLabelSet.add(value)
  }

  const reversedTestResults: ResultsListType = allTestsResults.slice().reverse()

  const classStudentsDict: ClassStudentsDataDictType = {}

  for (const classResult of reversedTestResults) {
    const testDate = classResult.date

    for (const [index, studentResult] of classResult.results.entries()) {
      const studentCode = studentResult.studentCode
      const studentTestResult: StudentResultType = {
        date: testDate,
        aggregatedResult: studentResult.aggregatedResult,
        trainingGroupName: studentResult.trainingGroupName,
        probablyGuessed: studentResult.probablyGuessed,
        subTestResults: []
      }
      for (const subTestLabel of subtestLabelSet) {

        const subtestResult = safeDictLookup(studentResult, subTestLabel)
        if (subtestResult) {
          studentTestResult.subTestResults.push(
            {
              label: subTestLabel,
              ...subtestResult
            }
          )
        }
      }
      if (studentCode in classStudentsDict) {

        classStudentsDict[studentCode].results.push(studentTestResult)
        const latestResult = classStudentsDict[studentCode].results[0]

        const resultGrowthInPoints =
          latestResult.aggregatedResult - studentTestResult.aggregatedResult

        if (!classStudentsDict[studentCode].resultGrowthInPoints) {
          classStudentsDict[studentCode].resultGrowthInPoints = resultGrowthInPoints
        }
      } else {
        classStudentsDict[studentCode] = {
          name: studentResult.name,
          code: studentCode,
          results: [
            studentTestResult
          ]
        }
      }
    }
  }
  return classStudentsDict
}


export function apiClassDataToDisplayData(apiData: ApiClassDataType): DisplayClassDataType {

  const TEST_TYPE_ID = 1 //TODO: to be implemented

  const feedbackGroup: FeedbackGroupResponseType = getFeedbackGroup(TEST_TYPE_ID)
  const subTestCount = feedbackGroup.subtests.length

  const aggregationType = feedbackGroup.aggregationType;

  const subtestlabelDict = createLabelSubtestUnitIdDict(feedbackGroup)

  if (!aggregationType) {
    throw new Error("Couldn't find subtest aggregationType")
  }

  let allTestsResults: ResultsListType = []
  console.log("apiData", apiData)
  for (const measurement of apiData.measurements) {

    const displayResults: ResultType[] = []

    for (const participationResult of measurement.results) {

      const aggregateResultObj: AggregateResultType = processStudentData(participationResult.results, aggregationType, subTestCount)
      displayResults.push({
        studentCode: participationResult.participantCode,
        ...addHumanReadableSubtestLabels(participationResult.results, subtestlabelDict),
        ...aggregateResultObj,
        changeCount: 0,
        nextChangeCount: 0,
      })
    }

    allTestsResults.push({
      date: measurement.measurementName,
      results: displayResults,
    });
  }

  for (let testIndex= 0; testIndex<allTestsResults.length; ++testIndex) {
    for (const result of allTestsResults[testIndex].results) {
      let changeCount = 0;
      let nextChangeCount = 0;
      if (testIndex > 0) {
        const prevResult = allTestsResults[testIndex - 1].results
                                        .filter(r => r.studentCode === result.studentCode)[0];
        if (prevResult) {
          changeCount = result.aggregatedResult- prevResult.aggregatedResult;
        }
      }
      if (testIndex < allTestsResults.length - 1) {
        const nextResult = allTestsResults[testIndex + 1].results
          .filter(r => r.studentCode === result.studentCode)[0];
        if (nextResult) {
          nextChangeCount = nextResult.aggregatedResult - result.aggregatedResult;
        }
      }
      result.changeCount = changeCount;
      result.nextChangeCount = nextChangeCount;
    }
  }

  allTestsResults = addStudentNames(allTestsResults)

  return {
    className: apiData.className,
    testLabel: `${apiData.subject} - ${apiData.domain}`,
    allTestsResults: allTestsResults,
    aggregationType,
    subtestLabelDict: subtestlabelDict,
    classDict: getClassDataDict(allTestsResults, subtestlabelDict),
    subtestCount: subTestCount
  }
}


export function addStudentNames(allTestsResults: ResultsListType): ResultsListType {

  const studentNames = ["Frida", "Sarah", "Zaheer", "Zoey", "Margarethe B.", "Mohan", "Pepe", "Mila",
    "Nils", "Adrian", "Mariami", "Josephine", "Pauline", "Odeh", "Anastasia", "Friedrich", "August",
    "Wilhelmine", "Dorothea", "Errol", "Mia", "Abdul Rahman", "Margarethe M.", "Margarethe S.",
    "Lynn-Sophia", "Max-Kurt", "Knut-Erik", "Hans-Uwe", "Landi", "Ragnar", "Fritzi", "Zeynep", "Karina",
  ]

  const codeNameDict: {[key: string]: string} = {}
  let name_index = 0;

  for (const classResult of allTestsResults) {
    for (const [index, participationResult] of classResult.results.entries()) {
      const studentCode = participationResult.studentCode;


      let studentName = codeNameDict[studentCode]
      if (!studentName) {
        studentName = studentNames[name_index];
        name_index = (name_index + 1) % studentNames.length;

        codeNameDict[studentCode] = studentName
      }
      participationResult.name = studentName
    }
  }
  return allTestsResults
}


export const calcResultsStatistics = (test: ResultsType): ResultsStatistics => {
  const values = test.results.map(r => r.aggregatedResult).sort((a, b) => a - b);
  let min: number = values[0];
  let max: number = values[0];
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const sum = values.reduce((sum, v) => sum + v, 0);
  const mean = sum / values.length;
  const std = Math.sqrt(
    values.map(v => Math.pow(v - mean, 2))
    .reduce((sum, v) => sum + v, 0)
    / values.length
  );
  return {
    min, max, mean, std,
    median: percentile(values, 50),
    percentiles: [25, 75].reduce((agg: {[key: number]: number}, p) => {
      agg[p] = percentile(values, p);
      return agg;
    }, {}),
  };
};

function percentile(sorted_values: number[], p: number): number {
  const fi = (sorted_values.length - 1) * p / 100;
  const i = Math.floor(fi);
  if (i === fi || i >= sorted_values.length - 1) return sorted_values[i];
  const t = fi - i;
  return sorted_values[i] * (1. - t) + t * sorted_values[i + 1];
}

export function safeDictLookup(dictionary: any, key: string) {
  if (dictionary.hasOwnProperty(key)) {
    return dictionary[key]
  } else {
    return undefined
  }
}


export function hasManyMistakes(correctCount: number, wrongCount: number): boolean {
  return (wrongCount / correctCount) > 0.1 && wrongCount > 2;
}

export function hasFewMistakes(correctCount: number, wrongCount: number): boolean {
  return wrongCount / correctCount < 0.07;
}

export function isStagnating(growthInPoints: number): boolean {
  return growthInPoints <= 0;
}
