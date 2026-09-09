<script setup lang="ts">

import { onMounted, ref } from 'vue'
import {
  apiClassDataToDisplayData,safeDictLookup
} from "@/views/util.ts";
import { getRandomApiResults } from '@/api_simulation/actualResults'

import type {
  ApiClassDataType,
  DisplayClassDataType,
} from '@/types/resultTypes.ts'

const displayData = ref<DisplayClassDataType>()

const actualColumns = ref()

const actualRows = ref()

let testLabel: string;

const initialPagination = {
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 100,
}


const labelShortLabelDict = {
  "Wortverständnis": "Wort",
  "Satzverständnis": "Satz",
}


onMounted(() => {


  if (localStorage.getItem("displayData")) {
    displayData.value = JSON.parse(localStorage.getItem("displayData"))
    console.log("getting displayData from local")
  } else {
    console.log(67676767676767)
    const apiClassData: ApiClassDataType = getRandomApiResults();
    displayData.value = apiClassDataToDisplayData(apiClassData)
  }

  const allTestsResults = displayData.value.allTestsResults

  const testIterationCount = allTestsResults.length
  testLabel = displayData.value.testLabel

  const subtestLabelDict = displayData.value.subtestLabelDict;

  const subtestLabelSet = new Set<string>();

  for (const [key, value] of Object.entries(subtestLabelDict)) {
    subtestLabelSet.add(value)
  }

  actualColumns.value = [
    {
      name: 'name',
      required: true,
      label: "Schüler:in",
      align: "left",
      field: row => `${row.name} (${row.code})`,
      format: val => `${val}`,
      sortable: true
    },
    {
      name: 'aggregatedResult',
      required: true,
      label: "Gesamt",
      align: "left",
      field: 'aggregatedResult',
      sortable: true
    },
  ]

  if (testIterationCount > 1) {
    for (const testIndex in allTestsResults) {
      const targetTestIndex = testIterationCount - testIndex - 2
      if (targetTestIndex >= 0) {
        actualColumns.value.push(
          {
            name: `aggregatedResultChange${targetTestIndex}`,
            required: false,
            label: `Änderung zu ${allTestsResults[targetTestIndex].date}`,
            field: `aggregatedResultChange${targetTestIndex}`,
            sortable: true,
          }
        )
      }
    }
  }

  for (const subtestLabel of subtestLabelSet) {
    let shortLabel = safeDictLookup(labelShortLabelDict, subtestLabel)

    actualColumns.value.push(
      {
        name: `${subtestLabel}Correct`,
        required: false,
        label: `${shortLabel || subtestLabel} - richtig`,
        align: "left",
        field: `${subtestLabel}Correct`,
        sortable: true
      }
    )
    actualColumns.value.push(
      {
        name: `${subtestLabel}Wrong`,
        required: false,
        label: `${shortLabel || subtestLabel} - falsch`,
        align: "left",
        field: `${subtestLabel}Wrong`,
        sortable: true
      }
    )
  }

  actualRows.value = [];

  for (const [index, result] of allTestsResults[testIterationCount - 1].results.entries()) {

    const studentDict = {
      name: result.name,
      code: result.studentCode,
      aggregatedResult: result.aggregatedResult,
    }
    if (testIterationCount > 1) {
      for (const testIndex in allTestsResults) {
        const targetTestIndex = testIterationCount - testIndex - 1

        if (targetTestIndex >= 0) {
          for (const leDict of allTestsResults[targetTestIndex].results) {
            if (studentDict.code === leDict.studentCode) {
              studentDict[`aggregatedResultChange${targetTestIndex}`] =
                result.aggregatedResult - leDict.aggregatedResult
            }
          }
        }
      }
    }
    for (const label of subtestLabelSet) {
      //console.log(label, result[label].correct)
      if (label in result && result[label] ) {
          studentDict[`${label}Correct`] = result[label]?.correct
          studentDict[`${label}Wrong`] = result[label]?.wrong
      }
    }
    actualRows.value.push(studentDict)
  }
})


function customSort (rows, sortBy, descending) {
  const data = [...rows]

  if (sortBy) {
    data.sort((a, b) => {
      const x = descending ? b : a
      const y = descending ? a : b

      if (sortBy === 'name') {
        // string sort
        return x[ sortBy ] > y[ sortBy ] ? 1 : x[ sortBy ] < y[ sortBy ] ? -1 : 0
      }
      else {
        // numeric sort
        const xf = parseFloat(x[ sortBy ]);
        const yf = parseFloat(y[ sortBy ]);
        if (isNaN(xf)) return descending ? -1 : 1;
        if (isNaN(yf)) return descending ? 1 : -1;
        return xf - yf;
      }
    })
  }

  return data
}

</script>

<template>

  <div v-if="!displayData">
    Getting the data
  </div>
  <div v-else>
    <div class="q-px-none">
      <q-table
        flat
        class="sticky-header"
        :title="testLabel"
        :rows="actualRows"
        :columns="actualColumns"
        row-key="name"
        :sort-method="customSort"
        binary-state-sort
        :pagination="initialPagination"
        hide-bottom
      />
    </div>
  </div>

</template>

<style lang="scss">

.q-table__top {
  background-color: $background-lighter;
}

.sticky-header {
  height: 100%;
  max-height: 100vh;
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: $primary;
    color: white;
  }
  thead tr th {
    position: sticky;
    z-index: 1;
  }
  thead tr:first-child th {
    top: 0;
  }
}

.q-table__container {

  background-color: $background;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 80vh;
  @media (min-width: $breakpoint-md-min) {
    height: 87vh;
  }

  .q-table__top {
    background-color: $primary;
    color: white;
    font-family: IQBPrimar, Roboto, serif;
  }
  .q-table__middle {
    background-color: $background;
    overflow: auto;

    table.q-table {
      border: 2px $primary solid;
      font-family: IQBPrimar;
      border-radius: 10px;
      border-top-right-radius: 0;
      border-top-left-radius: 0;
      height: 100%;

      thead {
        tr {
          background-color: $primary;
          color: white;

          th {
            border-style: hidden;
            font-size: 107%;
            padding: 0.5rem;
            text-align: right;
            max-width: 9rem;
            white-space: break-spaces;

            &:first-child {
              position: sticky;
              left: 0;
              z-index: 2;
            }
            &.text-left {
              text-align: left;
            }
          }
        }

        tr:first-child th:first-child {
          /* bg color is important for th; just specify one */
          background-color: $primary;
        }
      }

      tbody {

        tr {
          &:nth-child(even) {
            // if not explicitly set this way sticky header won't work for unknown reason
            background-color: $background;
          }

          &:nth-child(odd) {
            background-color: $background-lighter;

            td:first-child {
              background-color: $primary-light;
              color: black;
            }
          }

          td {
            border-style: hidden;
            border-left-radius: 0;
            text-align: center;

            &:first-child {
              font-size: 105%;
              text-align: left;
              background-color: $primary;
              position: sticky;
              left: 0;
              z-index: 1;
              color: white;
            }

            padding: 0.5rem;
          }
        }
      }
    }
  }
}

</style>
