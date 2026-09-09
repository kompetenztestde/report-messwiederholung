<<script setup lang="ts">

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


let lastTestDateLabel: string;

onMounted(() => {


  if (localStorage.getItem("displayData")) {
    displayData.value = JSON.parse(localStorage.getItem("displayData"))
    console.log("getting displayData from local")
  } else {
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

  if (displayData.value) {
    const testIterationCount = displayData.value.allTestsResults.length
    lastTestDateLabel = displayData.value.allTestsResults[testIterationCount - 1].date
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
    {
      name: 'reportCardSentence',
      required: true,
      label: 'Zeugnissatz',
      align: "left",
      field: 'reportCardSentence',
    }
  ]

  actualRows.value = [];

  for (const [index, result] of allTestsResults[testIterationCount - 1].results.entries()) {

    const extraData = displayData.value.classDict[result.studentCode]

    //const tookPartInLastTest

    let currentTrainingGroup = null

    if (extraData.results[0].date === lastTestDateLabel) {
      currentTrainingGroup = extraData.results[0].trainingGroupName
    }

    let reportSentence = ""

    if (!currentTrainingGroup) {
      reportSentence = "Nicht teilgenommen"
    } else if (currentTrainingGroup === "Silbenmöwe") {
      reportSentence = `${result.name} hat am Basiskompetenztest teilgenommen. Dabei bemühte ${result.name} sich altersmäßige Übungswörter in einem begrenzten Zeitraum zu lesen und zu verstehen.`
      if (extraData.resultGrowthInPoints > 2) {
        reportSentence += ` Im Verlauf des Schuljahres konnte ${result.name} das Ergebnisse verbessern und die Anzahl gelesener Wörter steigern.`
      }
    } else if (currentTrainingGroup === "Wortfink") {
      reportSentence = `${result.name} hat erfolgreich am Basiskompetenztest teilgenommen. Dabei las ${result.name} altersmäßige Übungswörter und Sätze in einem begrenzten Zeitraum.`
      if (extraData.resultGrowthInPoints > 2) {
        reportSentence += ` Im Verlauf des Schuljahres konnte ${result.name} bereits sicherer lesen und das Ergebnisse verbessern.`
      }
    } else if (currentTrainingGroup === "Textadler") {
      reportSentence = `${result.name} hat sehr erfolgreich am Basiskompetenztest teilgenommen. Dabei wurden die Übungswörter und Sätze in einem begrenzten Zeitraum schnell und sicher gelesen. Hierbei gehört ${result.name} zu besten Leser:innen der Klasse.`
      if (extraData.resultGrowthInPoints) {
        reportSentence += ` Im Verlauf des Schuljahres konnte ${result.name} das gute Textverständnis ausbauen und die Anzahl gelesener Wörter steigern.`
      }
    }


    const studentDict = {
      name: result.name,
      code: result.studentCode,
      aggregatedResult: result.aggregatedResult,
      reportCardSentence: reportSentence
    }

    actualRows.value.push(studentDict)
  }

})


function copyToClipboard(targetId: string, event: Event) {

  const textContainer = document.getElementById(targetId);
  const reportSentence = textContainer?.innerText;
  if (reportSentence && event.currentTarget) {
    const button: HTMLElement = event.currentTarget;
    navigator.clipboard.writeText(reportSentence);
    if (button.innerHTML) {
      const oldContent = button.innerHTML
      button.innerHTML = "Kopiert!"
      setTimeout(function() { button.innerHTML = oldContent }, 3000);
    }
  }
}

</script>

<template>

  <div v-if="!displayData">
    Getting the data
  </div>
  <div v-else>
    <div class="q-px-none">
      <h1>{{testLabel}}</h1>
      <q-table
        flat
        class="sticky-header"
        :rows="actualRows"
        :columns="actualColumns"
        row-key="name"
        :pagination="initialPagination"
        hide-bottom
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              {{ props.row.name }} ({{props.row.code}})
            </q-td>
            <q-td key="aggregatedResult" :props="props" style="width: 7rem">
              <div style="display: flex" >
                <q-badge color="primary" align="middle" style="font-size: larger; margin: auto; padding: 0.5rem">
                  {{ props.row.aggregatedResult }}
                </q-badge>
              </div>
            </q-td>
            <q-td key="reportCardSentence" :props="props">
              <div style="max-width: 100rem; white-space: break-spaces; display: flex; flex-direction: row">
                <div style="display: flex">
                  <q-btn @click="copyToClipboard(props.row.code, $event)" style="margin: auto; margin-right: 1rem; word-break: keep-all" color="primary" text-color="white" icon="content_copy">
                    <q-tooltip class="bg-primary text-whites" style="font-size: 110%;">Satz in die Zwischenablage kopieren.</q-tooltip>
                  </q-btn>
                </div>
                <div :id="props.row.code">
                  {{ props.row.reportCardSentence }}
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>

</template>

<style lang="scss" scoped>

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
  height: 75vh;

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
            .q-badge, button {
              background-color: $primary-light!important;
              color: black!important;
            }

            td:first-child {
              background-color: $primary-light;
              color: black;
            }
          }

          td {
            border-style: hidden;
            border-radius: 7px;
            text-align: center;
            padding: 0.5rem;
            padding-right: 2rem;
            max-width: 35rem;
            word-break: break-word;

            &.text-left {
              text-align: left;
            }

            &:first-child {
              font-size: 105%;
              text-align: left;
              background-color: $primary;
              position: sticky;
              left: 0;
              z-index: 1;
              color: white;
            }
          }
        }
      }
    }
  }
}

</style>

