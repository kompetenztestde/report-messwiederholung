import type {ResultTabPaneType} from "@/types/visualTypes.ts";

type StyleObjectType = {
  position: "absolute",
  left: string,
  bottom: string,
}

export type ResultType = {
  studentCode: string,
  name?: string,
  aggregatedResult: number,
  trainingGroupName: string,
  competenceLevel: number,
  subtestResults?: ApiParticipationResult,
  changeCount: number,  // this result minus previous result
  nextChangeCount: number, // next result minus this result
  probablyGuessed: boolean,

  // below is not used in new bird view
  imageSource?: string,
  styleObject?: StyleObjectType,
  xPosition?: number,
  yPosition?: number,
  bucketKey?: number,
  zIndex?: number,
  bucketIndex?: number,
}

export type ApiParticipationResult = {
  [key: string]: {
    wrong: number,
    correct: number,
    probablyGuessed?: boolean,
  }
}

export type StringDict = {[key: string]: string}

export type ApiResultType = {
  participationId: number,
  participantCode: string,
  results: ApiParticipationResult
}

export type ResultsType = {
  date: string,
  results: ResultType[],
}

export type ResultsListType = ResultsType[]

export type DisplayClassDataType = {
  className: string,
  studentsCount?: number,
  testLabel: string,
  allTestsResults: ResultsListType,
  subtestLabelDict: {[key: string]: string},
  classDict: ClassStudentsDataDictType,
  aggregationType: string,
  tab_panes?: ResultTabPaneType[],
  subtestCount: number,
}

export type ApiMeasurementType = {
  measurementName: string,
  feedbackConfig: {classLevel: number, highScoreThreshold?: number},
  results: ApiResultType[]
}

export type ApiClassDataType = {
  classId: number,
  subject: string,
  domain: string,
  className: string,
  minScore: number,
  maxScore: number,
  totalMeasurements: number,
  measurements: ApiMeasurementType[],
  subtestCount: number,
}

type SubtestType = {
  id: number,
  name: string,
  unitIds: {
    [key: string]: string
  },
  aggregationType: any,
  scoreType: string,
  children: []
}

export type FeedbackGroupResponseType = {
  id: number,
  name: string,
  subtests: SubtestType[],
  scoring: {maxScore: number, minScore: number},
  referenceValues: {
    [key: string]: {low: number, middle: number, high: number}
  }
  testTypeId: number,
  aggregationType: string
}


export type ResultsStatistics = {
  min: number,
  max: number,
  mean: number,
  median: number,
  std: number,
  percentiles: {[key: number]: number},
};


export type StudentResultType = {
  date: string,
  aggregatedResultCorrect: number,
  aggregatedResultWrong: number,
  aggregatedResult: number,
  trainingGroupName: string,
  probablyGuessed: boolean,
  subTestResults: SubtestResultType[]
}


export type ClassStudentsDataDictType =
  {
    name: string | undefined,
    code: string,
    resultGrowthInPoints?: number,
    results: StudentResultType[]
}

type SubtestResultType = {
  label: string,
  wrong: number,
  correct: number,
  probablyGuessed,
}
