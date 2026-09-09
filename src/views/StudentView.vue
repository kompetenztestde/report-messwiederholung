<script setup lang="ts">

import {onUnmounted, onMounted, ref, onUpdated} from 'vue'
import { useRoute } from 'vue-router'

import {
  germanCounts,
  studentFeedback,
  childFriendlySpeech
} from "@/views/variables.ts";

import type {
  ClassStudentsDataDictType,
  DisplayClassDataType,
} from '@/types/resultTypes.ts'


import InfoDialog from '@/components/InfoDialog.vue'
import BirdColorPicker from './BirdColorPicker.vue'
import VideoDialog from "@/components/VideoDialog.vue";

import type {
  ResultTabPaneType,
} from "@/types/visualTypes.ts";
import {
  get_bird_color_map_from_results,
  y_axis_max,
  y_axis_min,
  get_tab_pane,
} from "@/views/birdViewUtils";
import type { BirdPartColorsMapType } from "@/types/visualTypes";
import Feather from "@/components/Feather.vue";
import AudioPlayer from "@/components/AudioPlayer.vue";
import {hasFewMistakes, hasManyMistakes} from "@/views/util.ts";
import {startConfetti} from "@/views/confetti.ts";
import {getAssetUrl} from "@/assets.ts";

const materialDrawerOpen = ref<boolean>(false)
const skyWidth = ref<string>("100%")
const drawerWidth = ref<string>("0")
const studentCodeFromRoute = ref<string>();
const renderTrainerManual = ref<boolean>(true);
const currentStudent = ref<ClassStudentsDataDictType>()
const currentTrainingGroup = ref<string>("")

const displayData = ref<DisplayClassDataType>();
// currently active test group
const tab_pane = ref<ResultTabPaneType>();

const birdBaseSize = ref<number>();
const birdColorMap = ref<BirdPartColorsMapType>();
const activeMaterialCard = ref<string|undefined>();
const materialCardModalOpen = ref<boolean>(false);
const parentInfoOpen = ref<boolean>(false);

const tandemPartnerName = ref<string>();

const greetingWow = ref<string>();
const solaceSentence = ref<string>();
const manyMistakesMessage = ref<string>();
const noGrowthMessage = ref<string>();
const moderateGrowthMessage = ref<string>();
const muchGrowthMessage = ref<string>();
const gettingWorseMessage = ref<string>();
const adviceSentence = ref<string>();
const colorPickerBirdCode = ref<string>();

const manyMistakesIconName1 = ref<string>()
const manyMistakesIconName2 = ref<string>()

const testIterationCount = ref<number>(1);

const videoModalOpen = ref<boolean>(false);
const randomArrayLastAccessedIndex = ref<{[key: string]: number}>({});


function getBirdBaseSize() {
  birdBaseSize.value = Math.min(12, window.innerWidth / 100);
}


function updateDisplayData() {
  const storedStudentData = localStorage.getItem("studentData");

  getBirdBaseSize();

  if (storedStudentData) {
    displayData.value = JSON.parse(storedStudentData)
    birdColorMap.value = get_bird_color_map_from_results(displayData.value.allTestsResults);

    testIterationCount.value = displayData.value.allTestsResults.length

    const tab_index = testIterationCount.value === 1 ? 0 : undefined;
    tab_pane.value = get_tab_pane(displayData.value.allTestsResults, birdBaseSize.value, birdColorMap.value, tab_index, studentCodeFromRoute.value);

    currentStudent.value = displayData.value.classDict[studentCodeFromRoute.value];
    if (currentStudent.value) {
      currentTrainingGroup.value = currentStudent.value.results[0].trainingGroupName
    }
  }
}


const wordsNoMistakes = ref<boolean>();
const wordsFewMistakes = ref<boolean>();
const sentencesNoMistakes = ref<boolean>();
const sentencesFewMistakes = ref<boolean>();
const fewMistakes = ref<boolean>();
const wordsManyMistakes = ref<boolean>();
const sentencesManyMistakes = ref<boolean>();
const newInBestGroup = ref<boolean>();
const stayedInBestGroup = ref<boolean>();
const sentencesNotWorkedAt = ref<boolean>();
const manyMistakes = ref<boolean>();
const noGrowth = ref<boolean>();
const moderateGrowth = ref<boolean>();
const muchGrowth = ref<boolean>();
const gettingWorse = ref<boolean>();
const betterWithWords = ref<boolean>();
const wordsLikeSentences = ref<boolean>();
const betterWithSentencesManyMistakesWithWords = ref<boolean>();


onMounted(() => {
  // leave a bit time until the page has it's full height
  setTimeout(() => startConfetti(), 500);

  const route = useRoute();
  studentCodeFromRoute.value = route.params.code;

  updateDisplayData();
  window.addEventListener("resize", updateDisplayData);
  greetingWow.value = getRandomFromArray(studentFeedback.wowArray);
  solaceSentence.value = getRandomFromArray(studentFeedback.solaceArray);
  manyMistakesMessage.value = getRandomFromArray(studentFeedback.peculiarities.manyMistakesArray);
  noGrowthMessage.value = getRandomFromArray(studentFeedback.peculiarities.muchGrowthArray);
  moderateGrowthMessage.value = getRandomFromArray(studentFeedback.progressArray);
  muchGrowthMessage.value = getRandomFromArray(studentFeedback.peculiarities.muchGrowthArray);
  gettingWorseMessage.value = getRandomFromArray(studentFeedback.peculiarities.gettingWorseArray);
  if (currentTrainingGroup.value !== "Textadler") {
    adviceSentence.value = getRandomFromArray(
      currentTrainingGroup.value === "Silbenmöwe" ? studentFeedback.adviceArrays.Silbenmöwe :
        studentFeedback.adviceArrays.Wortfink
    )
  }

  manyMistakesIconName1.value = getRandomFromArray(studentFeedback.icons.slowDown)
  manyMistakesIconName2.value = getRandomFromArray(studentFeedback.icons.slowDown)

  if (currentStudent.value) {
    const results = currentStudent.value.results
    const lastResult = results[0]
    let lastWordResult
    let lastSentenceResult
    const lastAggResult = lastResult.aggregatedResult
    for (const subtestResult of lastResult.subTestResults) {
      if (subtestResult.label === "Wortverständnis") {
        lastWordResult = subtestResult
      } else if (subtestResult.label === "Satzverständnis") {
        lastSentenceResult = subtestResult
      }
    }

    let aggMistakes = 0

    if (lastWordResult) {
      wordsNoMistakes.value = lastWordResult.wrong === 0;
      aggMistakes += lastWordResult.wrong;
      wordsManyMistakes.value = hasManyMistakes(lastWordResult.correct, lastWordResult.wrong)
      wordsFewMistakes.value = hasFewMistakes(lastWordResult.correct, lastWordResult.wrong)
    }

    if (lastSentenceResult && lastWordResult) {
      sentencesNoMistakes.value = lastSentenceResult.wrong === 0;
      aggMistakes += lastSentenceResult.wrong;
      sentencesManyMistakes.value = hasManyMistakes(lastSentenceResult.correct, lastSentenceResult.wrong)
      betterWithWords.value = (lastWordResult.correct - lastWordResult.wrong) + 4 >
        (lastSentenceResult.correct - lastSentenceResult.wrong)
      sentencesFewMistakes.value = hasFewMistakes(lastSentenceResult.correct, lastSentenceResult.wrong)
        && !sentencesNoMistakes.value;
    } else {
      sentencesNotWorkedAt.value = true;
    }
    if (currentTrainingGroup.value === "Textadler") {
      stayedInBestGroup.value = true;
    }
    if (results.length > 1) {
      const lastTrainingGroup = currentStudent.value.results[results.length - 2].trainingGroupName;
      if (currentTrainingGroup.value === "Textadler") {
        if (lastTrainingGroup !== "Textadler") {
          newInBestGroup.value = true;
        }
      }
    }

    fewMistakes.value = lastAggResult > 10 && aggMistakes < 2 && aggMistakes !== 0;
    manyMistakes.value = sentencesManyMistakes.value || wordsManyMistakes.value;
    const pointsGrowth = currentStudent.value.resultGrowthInPoints;
    if (pointsGrowth) {
      if (pointsGrowth === 0) {
        noGrowth.value = true;
      } else if (pointsGrowth < 0) {
        gettingWorse.value = true;
      } else if (pointsGrowth < 5) {
        moderateGrowth.value = true;
      } else {
        muchGrowth.value = true;
      }
    }
  }
});

onUpdated(() => {

})

onUnmounted(() => {
})


function getTandemPartner() {
  let storedStudentData = localStorage.getItem("readingTandemPairs")
  if (storedStudentData && currentStudent.value) {
    storedStudentData = JSON.parse(storedStudentData)
    const trainerArray = storedStudentData?.trainer;
    const traineeArray = storedStudentData?.trainees;
    const sameLength = traineeArray.length === trainerArray.length;
    for (const [index, student] of trainerArray.entries()) {
      if (currentStudent.value.code === student.studentCode) {
        renderTrainerManual.value = !(currentTrainingGroup.value === "Lesemöwe");
        if (traineeArray[index] && sameLength) {
          return traineeArray[index].name
        } else if (traineeArray[index]) {
          return traineeArray[index].name
        } else {
          return `${traineeArray[index -1].name} und ${trainerArray[index -1].name}`
        }
      }
    }
    for (const [index, student] of traineeArray.entries()) {
      if (currentStudent.value.code === student.studentCode) {
        renderTrainerManual.value = false;
        if (trainerArray[index] && sameLength) {
          return trainerArray[index].name
        } else if (trainerArray[index]) {
          return trainerArray[index].name
        } else {
          return `${traineeArray[index -1].name} und ${trainerArray[index -1].name}`
        }
      }
    }
  }
}


function openMaterialCard(identifier: string | undefined) {
  if (identifier === "reading-tandem") {
    tandemPartnerName.value = getTandemPartner()
  }
  materialCardModalOpen.value = !materialCardModalOpen.value
  activeMaterialCard.value = identifier
}


function toggleDrawer() {
  const openDrawerWidthPercent = window.innerWidth > 500 ? 50 : 100;

  if (!materialDrawerOpen.value) {
    skyWidth.value = `${100 - openDrawerWidthPercent}%`
    drawerWidth.value = `${openDrawerWidthPercent}%`
    materialDrawerOpen.value = true;
  } else {
    skyWidth.value = "100%"
    drawerWidth.value = "0%"
    materialDrawerOpen.value = false;
  }
}


function getRandomFromArray(array: string[]) {

  let randomNumber = Math.floor(Math.random() * array.length);
  const arrayFirstItem = array[0]

  if (array.length > 1 && randomArrayLastAccessedIndex.value[arrayFirstItem] === randomNumber) {
    if (randomNumber < array.length - 1) {
      randomNumber++
    } else {
      randomNumber--
    }
  }

  randomArrayLastAccessedIndex.value[arrayFirstItem] = randomNumber;

  return array[randomNumber];
}

function onGreetingClick() {
  greetingWow.value = getRandomFromArray(studentFeedback.wowArray);
  startConfetti();
}

</script>

<template :ref="displayData">

  <div v-if="!displayData || !currentStudent">
    Getting the data
  </div>
  <div v-else>

    <BirdColorPicker
      v-if="displayData && colorPickerBirdCode"
      :displayData="displayData"
      :studentCode="colorPickerBirdCode"
      @color-changed="updateDisplayData"
      @closed="() => colorPickerBirdCode = null"
    />

    <h1 style="margin-top: 0; display: flex">
      <q-icon style="margin-bottom: 0.5rem; margin-top: 0.5rem; margin-right: 0.5rem; font-size: 110%; transform: scale(-1, 1);" name="celebration"/>
      <button class="messageToggle" @click="onGreetingClick">
        {{greetingWow}}
      </button>
      <q-icon style="margin-bottom: 0.5rem; margin-top: 0.5rem; margin-left: 0.5rem; font-size: 110%;" name="celebration"/>
      {{currentStudent.name}}
      – hier ist dein Testergebnis
      <button class="play" style="color: white; margin-left: auto" @click="videoModalOpen=true">
        <q-icon name="play_circle">
        </q-icon>
        <span>Erklärvideo</span>
      </button>
    </h1>

    <q-expansion-item
      class="shadow-1 overflow-hidden"
      style="border-radius: 2rem; margin-bottom: 2rem"
      icon="explore"
      header-class="bg-primary text-white"
      expand-icon-class="text-white"
    >
      <template v-slot:header style="height: 6rem">
        <q-item-section avatar>
          <q-icon name="wrap_text"></q-icon>
        </q-item-section>

        <q-item-section style="height: 3rem; font-size: 200%">Zur Auswertung </q-item-section>

      </template>
      <div class="rounded text-container" style="border-top-left-radius: 0; border-top-right-radius: 0; margin-bottom: 0">
        <div class="star-container">
          <div v-for="i of currentStudent.results">
            <Feather size="5rem" ring-color="red" :feather-color="tab_pane?.birds[0].svg.outline_color">
              <q-tooltip style="font-size: 130%" class="bg-primary text-whites">Jede Feder steht für eine Teilnahme am Test.</q-tooltip>
            </Feather>
          </div>
        </div>

        <p style="margin-bottom: 0; margin-top: 1rem; text-align: center">
          Du hast {{germanCounts[currentStudent.results.length]}} Mal am Basiskompetenztest "Lesen" teilgenommen.
        </p>

        <q-separator class="blue" size="4px" color="primary"/>

        <p>
          <AudioPlayer caption="Ich lese dir vor." :audio-file="getAssetUrl('test_audio/Platzhalter_Testergebnisse.m4a')"/>
        </p>

        <div class="box-container">
          <div
            class="info-box"
            v-if="currentTrainingGroup !== 'Textadler'"
          >
            Du bist ein<span v-if="currentTrainingGroup === 'Silbenmöwe'">e</span> <span>{{currentTrainingGroup}}</span>.
          </div>

          <div
            class="info-box"
            v-if="newInBestGroup">
            {{studentFeedback.Wortverständnis.Textadler.newInGroup}}
          </div>

          <div
            class="info-box"
            v-if="stayedInBestGroup">
            {{studentFeedback.Wortverständnis.Textadler.stayedInGroup}}
          </div>

          <div v-if="currentTrainingGroup === 'Silbenmöwe'">
            <div
              class="info-box"
              v-if="wordsFewMistakes"
            >
              {{studentFeedback.Wortverständnis.Silbenmöwe.fewMistakes}}
            </div>
            <div
              class="info-box"
              v-if="wordsManyMistakes"
            >
              {{studentFeedback.Wortverständnis.Silbenmöwe.manyMistakes}}
            </div>
            <div
              class="info-box"
              v-if="wordsNoMistakes"
            >
              {{studentFeedback.Wortverständnis.Silbenmöwe.noMistakes}}
            </div>
            <div
              class="info-box"
              v-if="sentencesFewMistakes"
            >
              {{studentFeedback.Satzverständnis.Silbenmöwe.fewMistakes}}
            </div>
            <div
              class="info-box"
              v-if="sentencesManyMistakes"
            >
              {{studentFeedback.Satzverständnis.Silbenmöwe.manyMistakes}}
            </div>
            <div
              class="info-box"
              v-if="sentencesNoMistakes">
              {{studentFeedback.Satzverständnis.Silbenmöwe.noMistakes}}
            </div>

            <p>
              <button
                class="messageToggle standalone"
                @click="solaceSentence = getRandomFromArray(studentFeedback.solaceArray)"
              >
                {{solaceSentence}} <q-icon class="red" name="favorite"/>
              </button>
            </p>
          </div>

          <div v-if="currentTrainingGroup === 'Wortfink'">
            <div
              class="info-box"
              v-if="wordsFewMistakes">
              {{studentFeedback.Wortverständnis.Wortfink.fewMistakes}}
            </div>
            <div
              class="info-box"
              v-if="wordsManyMistakes">
              {{studentFeedback.Wortverständnis.Wortfink.manyMistakes}}
            </div>
            <div
              class="info-box"
              v-if="sentencesManyMistakes">
              {{studentFeedback.Satzverständnis.Wortfink.manyMistakes}}
            </div>
            <div
              class="info-box"
              v-if="wordsNoMistakes">
              {{studentFeedback.Wortverständnis.Wortfink.noMistakes}}
            </div>
            <div
              class="info-box"
              v-if="sentencesFewMistakes">
              {{studentFeedback.Satzverständnis.Wortfink.fewMistakes}}
            </div>
            <div
              class="info-box"
              v-if="sentencesNoMistakes">
              {{studentFeedback.Satzverständnis.Wortfink.noMistakes}}
            </div>
          </div>

          <div v-if="currentTrainingGroup === 'Textadler'">
            <div
              class="info-box"
              v-if="wordsManyMistakes">
              {{studentFeedback.Wortverständnis.Textadler.manyMistakes}}
            </div>
            <div
              class="info-box"
              v-if="sentencesManyMistakes">
              {{studentFeedback.Satzverständnis.Textadler.manyMistakes}}
            </div>
            <div
              class="info-box"
              v-if="wordsNoMistakes">
              {{studentFeedback.Wortverständnis.Textadler.noMistakes}}
            </div>
            <div
              class="info-box"
              v-if="sentencesFewMistakes">
              {{studentFeedback.Satzverständnis.Textadler.fewMistakes}}
            </div>
            <div
              class="info-box"
              v-if="sentencesNoMistakes">
              {{studentFeedback.Satzverständnis.Textadler.noMistakes}}
            </div>
          </div>

          <div
            class="info-box"
            v-if="betterWithWords">
            {{studentFeedback.peculiarities.betterWithWords}}
          </div>

          <div
            class="info-box"
            v-if="sentencesNotWorkedAt"
          >
            {{studentFeedback.peculiarities.sentencesNotWorkedAt}}
          </div>
        </div>

        <div v-if="testIterationCount > 1">

          <hr class="separator dark-red"/>

          <div class="toggle-button-container">
            <div
              v-if="manyMistakes"
              >
              <button
                class="messageToggle standalone"
                @click="
                  manyMistakesMessage = getRandomFromArray(studentFeedback.peculiarities.manyMistakesArray);
                  manyMistakesIconName1 = getRandomFromArray(studentFeedback.icons.slowDown);
                  manyMistakesIconName2 = getRandomFromArray(studentFeedback.icons.slowDown);
                  "
                >
                <q-icon class="red left" :name="manyMistakesIconName1"/>
                {{manyMistakesMessage}}
                <q-icon class="red" style="margin-left: 0.5rem; font-size: 110%;" :name="manyMistakesIconName2"/>
              </button>
            </div>

            <button
              v-if="noGrowth"
              class="messageToggle standalone"
              @click="noGrowthMessage = getRandomFromArray(studentFeedback.peculiarities.noGrowthArray)"
            >
              <q-icon class="red" name="favorite"/>
              {{noGrowthMessage}}
              <q-icon class="red" name="favorite"/>
            </button>

            <div
              v-if="moderateGrowth"
            >
              <button

                class="messageToggle standalone"
                @click="moderateGrowthMessage = getRandomFromArray(studentFeedback.peculiarities.progressArray)"
              >
                <q-icon class="red" style="transform: scale(-1, 1); margin-right: 0.5rem; font-size: 110%;" name="rocket"/>
                {{moderateGrowthMessage}}
                <q-icon class="red" style="margin-left: 0.5rem; font-size: 110%;" name="rocket"/>
              </button>
            </div>

            <button
              v-if="muchGrowth"
              class="messageToggle standalone"
              @click="muchGrowthMessage = getRandomFromArray(studentFeedback.peculiarities.muchGrowthArray)"
            >
              <q-icon class="red left" name="rocket_launch"/>
              {{muchGrowthMessage}}
              <q-icon class="red" style="margin-left: 0.5rem; font-size: 110%;" name="rocket_launch"/>
            </button>

            <button
              v-if="gettingWorse"
              class="messageToggle standalone"
              @click="gettingWorseMessage = getRandomFromArray(studentFeedback.peculiarities.gettingWorseArray)"
            >
              <q-icon class="red" name="mood"/>
              {{gettingWorseMessage}}
              <q-icon class="red" style="margin-left: 0.5rem; font-size: 110%;" name="favorite"/>
            </button>
          </div>
        </div>

        <hr class="separator dark-red"/>

        <div class="bottom-feedback">
          <div class="text-section">

            <p v-if="currentTrainingGroup !== 'Textadler'">
              <button
                class="messageToggle standalone"
                @click="adviceSentence = getRandomFromArray(studentFeedback.adviceArrays[currentTrainingGroup])"
              >
                {{adviceSentence}} <q-icon class="red" style="margin-left: 0.5rem; font-size: 110%;" name="favorite"/>
              </button>
            </p>

            <p v-if="currentTrainingGroup === 'Textadler'">
              <q-icon class="red" style="font-size: 150%; margin-bottom: 0.2rem" name="stars"/>
              {{studentFeedback.adviceArrays.Textadler[0]}}
              <q-icon class="red" style="font-size: 150%" name="diamond"/>
            </p>
          </div>
        </div>

        <div class="button-container">
          <q-btn style="margin-left: auto" no-caps color="primary" @click="()=> parentInfoOpen = true">
            <span style="white-space: nowrap"><q-icon style="margin-bottom: 4px; margin-right: 0.5rem" name="info"></q-icon>Für die Eltern</span>
          </q-btn>
        </div>

      </div>
    </q-expansion-item>

    <div class="view-container">
      <transition name="sky" mode="out-in">
        <div class="sky-background" v-if="tab_pane">
          <div v-if="tab_pane.flight_paths">
            <div
              v-for="flight_path in tab_pane.flight_paths"
              :key="flight_path.studentCode"
              :style="flight_path.polygon.style"
              :class="['flight-path', {'visible': 1}]"
            />
          </div>

          <div class="y-axis"><span class="y-axis-label">→ Lesegeschwindigkeit →</span></div>

          <div
            class="bird-container-container"
            v-for="(bird, index) in tab_pane.birds"
            :key="bird.nameCode"
            :style="{
              ...bird.style,
              'width': `${bird.size}rem`,
              /* make left define the center of the bird */
              'margin-left': `-${bird.size/2}rem`,
            }"
          >
            <div
              class="bird-container"
              :style="{
                  'width': `${bird.size}rem`,
                  'height': `${bird.size}rem`,
                  'clip-path': bird.clip_path,
                  /* make bottom define the center of the bird */
                  'margin-top': `-${bird.size/2}rem`,
                }"
            >
              <svg
                :class="`bird bird-${bird.svg.type}`"
                :viewBox="bird.svg.viewBox"
                :width="`${bird.size}rem`"
                :height="`${bird.size}rem`"
              >
                <path
                  v-for="(path, i) in bird.svg.paths"
                  :key="i"
                  :d="path.d"
                  :style="path.style"
                />
                <path
                  class="outline-path"
                  :d="bird.svg.outline"
                  :style="{stroke: bird.svg.outline_color}"
                />
              </svg>
            </div>

            <div
              v-if="currentStudent && bird.showText"
              class="color-picker-button"
              :style="{
                top: `-${bird.size*.2}rem`,
                right: '-20px',
              }"
              @click="colorPickerBirdCode = currentStudent.code"
            >
              <svg
                width="50"
                height="50"
                viewBox="0 0 16.933333 16.933333"
              >
                <g
                  inkscape:label="Layer 1"
                  inkscape:groupmode="layer"
                  id="layer1">
                  <path
                    style="fill:#fee0c3;stroke:#000000;stroke-width:0.627329;stroke-dasharray:none;stroke-opacity:1;fill-opacity:1"
                    d="M 0.93045456,6.9099121 C 0.63667027,5.3392403 1.6583955,3.870982 3.5301541,2.614756 5.4019127,1.3585301 9.3876126,0.1064133 11.932084,1.2960676 14.476554,2.4857219 16.069412,5.8087509 16.22724,8.4546614 16.385066,11.100572 15.545446,14.011011 13.137742,15.349517 10.730036,16.688022 6.104201,16.044685 4.2460136,14.143859 2.3878265,12.243033 4.9709469,12.510806 4.5474281,9.6979958 4.1239095,6.8851854 1.2242387,8.4805838 0.93045456,6.9099121 Z"
                    id="path1"
                    sodipodi:nodetypes="zzzzzzzz" />
                  <circle
                    style="fill:#ff0c2c;fill-opacity:1;stroke:#000000;stroke-width:0.529167;stroke-dasharray:none;stroke-opacity:1"
                    id="path2"
                    cx="6.5481038"
                    cy="4.3264251"
                    r="1.9410449" />
                  <circle
                    style="fill:#feff07;fill-opacity:1;stroke:#000000;stroke-width:0.529167;stroke-dasharray:none;stroke-opacity:1"
                    id="circle2"
                    cx="11.389023"
                    cy="4.466742"
                    r="1.9410449" />
                  <circle
                    style="fill:#2cff46;fill-opacity:1;stroke:#000000;stroke-width:0.529167;stroke-dasharray:none;stroke-opacity:1"
                    id="circle3"
                    cx="13.493771"
                    cy="8.8165531"
                    r="1.9410449" />
                  <circle
                    style="fill:#2f00f4;fill-opacity:1;stroke:#000000;stroke-width:0.529167;stroke-dasharray:none;stroke-opacity:1"
                    id="circle4"
                    cx="10.780985"
                    cy="13.026049"
                    r="1.9410449" />
                </g>
              </svg>
            </div>

            <div
              v-if="currentStudent"
              class="bird-text"
              :style="{bottom: bird.y < 32 ? `${bird.size*1.5}rem` : '0'}"
            >
              <div>
                <q-card class="student-info-box rounded">
                  <q-card-section>
                    <h5>
                      {{currentStudent.results[currentStudent.results.length - index - 1].date}}
                    </h5>
                  </q-card-section>
                  <q-separator size="2px" inset color="primary"/>
                  <q-card-section>
                    <div v-for="subResult in currentStudent.results[currentStudent.results.length - index - 1].subTestResults">
                      <span>
                        {{ childFriendlySpeech[subResult.label] }}: {{ subResult.correct }}<q-icon color="positive"  name="check"/>
                      </span>
                          <span>
                        {{subResult.wrong}}<q-icon color="negative" name="close"/>
                      </span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>

          <div class="header" v-for="header in tab_pane.headers" :key="header.text" :style="header.style">
            <button
              class="header-content"
              :style="{'font-size': `1.25rem`}"
            >
              <span>
                {{header.text}}
              </span>
            </button>
          </div>

        </div>
      </transition>

      <div class="training-group-button-container">
        <div
          class="training-group-button-space"
          :style="{
            top: `${100 - y_axis_max}%`,
            height: `${y_axis_max - y_axis_min}%`,
          }"
        >
          <button :class="['vertical', 'not-rounded', {'selected': materialDrawerOpen}]" @click="() => toggleDrawer()">FLUGTRAINING</button>
        </div>
      </div>

      <transition name="drawer" mode="out-in">
        <div class="nk-drawer">
          <div class="label">Flugtraining</div>
          <div class="material-container-frame"/>
          <div class="material-container">
            <button class="material"
                    @click="openMaterialCard('reading-tandem')"
                    style="top: 5rem; left: 20%"
            >
              <q-icon size="4rem" name="mood"/>
              <span>
                Lesetandem
              </span>
              <q-icon size="3.5rem" name="add_reaction"/>
            </button>
            <a
              class="material"
              :href="getAssetUrl('studentLesepass.pdf')"
              target="_blank"
              style="left: 11rem; bottom: 19rem"
            >
              <q-icon size="4rem" name="auto_stories"/>
              <span style="padding-left: 0.25rem">Lesepass</span>
              <q-icon style="display: inline-block" size="4rem" name="book_3"/>
            </a>
            <a
              class="material"
              :href="getAssetUrl('Wörter_verbinden.pdf')"
              v-if="currentTrainingGroup === 'Silbenmöwe'"
              target="_blank"
              style="bottom: 6rem; left: 3rem;"
            >
              <q-icon size="4rem" name="link"/>
              <span>
                Wörter verbinden
              </span>
              <q-icon size="4rem" name="join_right"/>
            </a>
            <a
              class="material"
              :href="getAssetUrl('Sätze_verbinden.pdf')"
              v-if="currentTrainingGroup === 'Wortfink'"
              target="_blank"
              style="bottom: 6rem; left: 3rem;"
            >
              <q-icon size="4rem" name="link"/>
              <span>
                Sätze verbinden
              </span>
              <q-icon size="4rem" name="join_right"/>
            </a>
            <a
              class="material"
              :href="getAssetUrl('Textabschnitte_sortieren.pdf')"
              v-if="currentTrainingGroup === 'Textadler'"
              target="_blank"
              style="bottom: 11rem; left: 5rem;"
            >
              <q-icon size="4rem" name="content_cut"/>
              <span style="text-align: center">Textabschnitte sortieren</span>
              <q-icon size="4rem" name="join_right"/>
            </a>
            <a
              class="material"
              :href="getAssetUrl('LesePilot.pdf')"
              v-if="currentTrainingGroup === 'Textadler'"
              target="_blank"
              style="bottom: 3rem; left: 3rem;"
            >
              <q-icon size="4rem" name="flight"/>
              <span>Lesepilot</span>
              <q-icon size="4rem" name="sports_motorsports"/>
            </a>

          </div>
          <q-btn round color="$background" size="sm" id="drawer-close" @click="toggleDrawer">
            <q-icon name="arrow_forward"/>
          </q-btn>
        </div>
      </transition>
    </div>
  </div>

  <InfoDialog
    v-model="materialCardModalOpen"
    title="Lesetandem"
    height="95vh"
    extra-classes="blue info-card"
  >
    <q-card-section class="content">
      Dein Partner beim Lesetandem ist:
      <div style="display: flex; align-items: center;">
        <Feather size="1rem" style="display: inline-block; margin-right: 0.25rem"/>
        {{tandemPartnerName}}
        <Feather size="1rem" style="display: inline-block; margin-left: 0.25rem"/>
      </div>
      <hr style="margin-bottom: 1rem; margin-top: 1rem"/>
      Hier ist deine
      <a class="styled" target="_blank" v-if="renderTrainerManual" :href="getAssetUrl('lesetandem_trainer.pdf')">
        Anleitung.
      </a>
      <a class="styled" target="_blank" v-else :href="getAssetUrl('lesetandem_trainee.pdf')">
        Anleitung.
      </a>
      <div style="padding-top: 1rem">
        Hier kommst du zu eurer
        <a class="styled" v-if="currentTrainingGroup === 'Silbenmöwe'" target="_blank" :href="getAssetUrl('Silbenmöwe_Text.pdf')">Übung.</a>
        <a class="styled" v-if="currentTrainingGroup === 'Wortfink'" target="_blank" :href="getAssetUrl('Wortfink_Text.pdf')">Übung.</a>
        <a class="styled" v-if="currentTrainingGroup === 'Textadler'" target="_blank" :href="getAssetUrl('Textadler_Text.pdf')">Übung.</a>
      </div>
    </q-card-section>
  </InfoDialog>

  <InfoDialog
    v-model="parentInfoOpen"
    title="Infos für die Eltern"
    width="70vw"
    height="95vh"
    extra-classes="blue info-card"
  >
    <q-card-section class="content parent-info">
      <h5>Liebe Eltern,</h5>
      <p>
        Ihr Kind hat am Basiskompetenztest "Lesegeschwindigkeit" teilgenommen. Der Test setzt sich
        aus zwei Teilen zusammen. Zuerst bekommen die Kinder Aufgaben zum Wortverständnis, danach
        folgt der Teil zum Satzverständnis.
      </p>
      <p>
        Hier sehen Sie jeweils eine Beispielaufgabe aus den beiden Testteilen:
      </p>
      <div class="image-container">
        <img style="width: 45%; height: auto;" alt="Screenshot des Tests" :src="getAssetUrl('word_test_example.png')">

        <img style="width: 45%; height: auto" alt="Screenshot des Tests" :src="getAssetUrl('sentence_test_example.png')">
      </div>
      <p >
        Das Ergebnis Ihres Kindes wird als Flughöhe eines Vogels dargestellt. Je höher der Vogel
        fliegt, umso höher ist die Lesegeschwindigkeit. Hat Ihr Kind mehrfach am Test teilgenommen,
        können sie die Lernentwicklung an der Flugbahn des Vogels ablesen.
      </p>
      <p style="margin-bottom: 0">
        Kinder mit ähnlicher Lesegeschwindigkeit werden zu Trainingsgruppen zusammengefasst. Diese
        heißen Silbenmöwen, Wortfinken oder Textadler. Entsprechend seiner Trainingsgruppe erhält
        Ihr Kind exemplarische Übungsmethoden und – material zum weiteren Üben im Unterricht oder
        auch zu Hause. Diese finden Sie unter dem Flugtraining.
      </p>
    </q-card-section>
  </InfoDialog>

  <VideoDialog v-model="videoModalOpen" title="Die Schüler:innenrückmeldung erklärt" source="/static/video/Schueler_innenrueckmeldung.mp4"></VideoDialog>

</template>

<style lang="scss" scoped>

.parent-info {
  font-size: 16.7px;
}

.image-container {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 1rem;
}

button.play {
  background-color: $primary;
  min-width: 3rem;
  height: 100%;
  border-radius: 15px;
  i {
    margin-top: 0;
    margin-bottom: 0.35rem;
  }
  span {
    font-size: 50%;
    vertical-align: top;
    padding-left: 0.5rem;
  }
}

.q-separator {
  &.blue {
    margin-top: 1.5rem;
    margin-bottom: 2rem;
    margin-left: 20rem;
    margin-right: 20rem;
  }
}

.box-container {
  display: flex;
  margin-bottom: 2rem;
  margin-top: 3rem;
  justify-content: space-evenly;
  .info-box {
    max-width: 20rem;
    background-color: $primary-light;
    font-size: 16.7px;
    border: 0.25rem solid $primary;
    border-radius: 0.5rem;
    padding: 1rem;
    text-align: justify;
    align-content: center;
    margin-bottom: 1rem;
  }
}

.toggle-button-container {
  display: flex;
  justify-content: space-evenly;
  div {
    display: flex;
    button {
      display: block;
      margin-top: auto;
      margin-bottom: auto;
    }
  }
}

button.messageToggle {
  height: 3rem;
  display: inline-flex;
  margin-top: 0.5rem;
  top: 0.5rem;
  align-items: center;
  background-color: $background;
  padding: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border: 3px solid $primary-light;
  box-shadow: 0 3px 5px -1px #0003,0 5px 8px #00000024,0 1px 7px #0000001f;
  &.standalone {
    border: 3px solid $dark-red;
    margin-right: 1rem;
    font-size: 18.75px;
    max-width: 30rem;
    display: block;
    height: fit-content;
    margin-top: auto;
    margin-bottom: auto;
    &:last-child {
      margin-right: 0;
    }
  }

  .q-icon {
    margin-right: 0.5rem;
    margin-bottom: 0.15rem;
    font-size: 110%;
    &.left {
      transform: scale(-1, 1);
    }
  }
}

.red {
  color: $dark-red;
}

hr.separator {
  margin-left: 20rem;
  margin-right: 20rem;
  border-top: 4px solid $dark-red;
  margin-top: 2.5rem;
  margin-bottom: 2.5rem;
}

.text-container {
  padding: 1rem;
  width: 100%;
  border: 2px solid $primary;
  border-radius: 2rem;

  p {
    font-size: 125%;
  }

  .bottom-feedback {
    display: flex;
    margin-bottom: 1rem;
    .text-section {
      width: 100%;

      p {
        text-align: center;
        button {
          display: inline;
          max-width: fit-content;
        }
      }

      p:last-child {
        margin-bottom: 0;
      }
    }
  }
  .button-container {
    width: fit-content;
    position: absolute;
    right: 1rem;
    bottom: 2rem;
  }
}

div.p {
  display: flex;
  font-size: 125%;
  line-height: 1.5;
  margin-bottom: 16px;
}

.star-container {
  display: flex;
  color: $background;
  div {
    margin: auto;
    &.big-star {
      border: 7px dotted $warm-yellow;
    }

    &.small-margin {

      border-radius: 50%;
      padding: 0.5rem;
      background-color: $secondary;
      color: $warm-yellow;
      display: flex;
      margin-right: 0.25rem;
      margin-left: 0;
      padding: 0.25rem;
      height: 1.5rem;
      i {
        margin-bottom: 0.5rem;
      }
    }
  }
}

.small-text-star {
  background-color: $primary;
  border-radius: 50%;
  width: fit-content;
  display: inline;
}

.name-button {
  width: 11em;
  height: 1rem;
}
.code-toggle {
  height: fit-content;
  border: 2px $primary solid;
  border-radius: 2.25rem;
  button {
    height: 1rem;
  }
}

.fade-enter-from,
.fade-leave-to {
  transition: width;
  font-size: 0;
  width: 0;
  transform: translateY(-20px);
}

.fade-enter-to,
.fade-leave-from {
  font-size: 16px;
  width: fit-content;
  transform: translateY(0);
}

$transition-duration: 0.75s;
$group-transition-duration: 0.75s;
$hover-transition-duration: 0.4s;

$cloud-color-back: rgba(255, 255, 255, .25);
$cloud-color: rgba(255, 255, 255, .7);

.fade-enter-active,
.fade-leave-active {
  transition: font-size $transition-duration ease-in-out,
  transform $transition-duration ease-in-out;
}

.textFade-enter-active,
.textFade-leave-active {
  transition: opacity .5s
}

.textFade-enter-from,
.textFade-leave-to {
  opacity: 0
}

.emphasis-container {
  border-radius: 2rem;
  padding-left: 0.25rem;
  padding-right: 0.75rem;
  padding-bottom: 0;
  height: fit-content;
  margin-bottom: 0.25rem;
  .emphasis-card {
    background-color: $background;
    .q-btn-group {
      background-color: $background-lighter;
    }
  }
}

.student-list {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  margin-top: 1rem;
  width: 100%;
  flex-wrap: wrap;

  .name-button {
    background-color: $background;
    height: fit-content;
    padding: 0.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    white-space: nowrap;
    width: fit-content;
    &.selected {
      background-color: $primary;
      color: white;
    }
  }
}

.view-container {
  border-radius: 3rem;
  overflow: hidden;
  position: relative;

  .sky-background {
    background: linear-gradient(0deg, $background, $primary-light, $primary);
    width: v-bind(skyWidth);
    transition: width $transition-duration ease-in-out, transform $transition-duration ease-in-out;
    height: 40rem;
    position: relative;

    .sky-clouds, .sky-filter, .flight-path {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .sky-clouds {
      transition: clip-path $group-transition-duration ease-in-out;
      &.cloud-back {
        //background-color: $cloud-color-back; the customer doesn't want it
      }
      &.cloud-front {
        background-color: $cloud-color;
      }
    }

    .sky-filter {
      background-color: rgba(255, 255, 255, 0);
      backdrop-filter: blur(.6rem);
    }

    .flight-path {
      background-color: #21405c;
      opacity: 0;
      transition:
        opacity $hover-transition-duration ease-in-out,
        clip-path $group-transition-duration ease-in-out;

      &.visible {
        opacity: .6;
      }
    }

    .y-axis {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;

      .y-axis-label {
        position: absolute;
        left: 0;
        writing-mode: sideways-lr;
        font-size: 1.4em;
        letter-spacing: .4rem;
        font-family: IQBPrimar, Roboto, serif;
        color: $primary;
        text-shadow: #0080ae 0 0 .5rem;
        z-index: 3;
      }
    }

    .header {
      position: absolute;
      width: 0;
      display: flex;
      justify-content: center;
      transition: left $group-transition-duration ease-in-out,
      bottom $group-transition-duration ease-in-out;

      .header-content {
        white-space: nowrap;
        padding: .5rem;
        background: $cloud-color;
        box-shadow: 0 0 5px $cloud-color;
        border-radius: 1rem;
        border: whitesmoke;
        color: $primary;
        font-weight: bold;
        cursor: pointer;
        transition: background-color $hover-transition-duration ease-in-out;

        &:hover {
          background: color-mix(in hsl, $cloud-color 70%, white);
        }

        i {
          position: relative;
          bottom: 2px;
        }
      }
    }

    .sky-info {
      z-index: 9;
      position: absolute;
      right: 3rem;
      top: 50%;
    }

    .bird-container-container {
      width: 0;
      height: 0;

      transition:
        left $group-transition-duration ease-in-out,
        bottom $group-transition-duration ease-in-out,
        width $group-transition-duration ease-in-out,
        margin $group-transition-duration ease-in-out;

      .bird-container {
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
        transition:
          opacity $hover-transition-duration ease-in-out,
          margin $group-transition-duration ease-in-out,
          width $group-transition-duration ease-in-out,
          height $group-transition-duration ease-in-out;

        &.not-selected {
          opacity: .3;
        }

        &:has(.bird path:hover) {
          z-index: 3;
          opacity: 1;
        }

        .bird {
          margin-right: auto;
          margin-left: auto;
          transition:
            width $group-transition-duration ease-in-out,
            height $group-transition-duration ease-in-out;

          path {
            cursor: pointer;
          }

          .outline-path {
            stroke: #fff;
            stroke-width: 2px;
            fill: none;
            opacity: 0;
            transition: opacity $hover-transition-duration ease-in-out;
          }

          &:has(path:hover) {
            .outline-path {
              opacity: 1;
            }
          }
        }
      }

      // raise bird and show outline when hovering text
      &:has(.bird-text:hover) {
        .bird-container {
          z-index: 3;
          .bird .outline-path {
            opacity: 1;
          }
        }
      }

      .bird-text {
        position: relative;
        background-color: $background;
        border: 1px solid $primary;
        border-radius: 1rem;
        padding: 0.1rem 0.25rem;
        white-space: nowrap;
        width: fit-content;
        display: block;
        margin-right: auto;
        margin-left: auto;
        margin-top: -1.5rem;
        cursor: pointer;
        z-index: 1;
        transition: background-color $hover-transition-duration ease-in-out;
        height: fit-content;
        max-height: fit-content;
        line-height: 1;

        span.name {
          color: black;
          vertical-align: middle;
          line-height: 1;

        }

        &:hover {
          background-color: color-mix(in hsl, $background 80%, white);
          z-index: 3;
        }
      }

      &:has(.bird-container .bird path:hover) {
        .bird-text {
          z-index: 2;
        }
      }

      .color-picker-button {
        width: 2rem; height: 2rem;
        position: absolute;
        cursor: pointer;
      }
    }
  }

  button.vertical {
    width: 3rem;
    line-height: 0.6;
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: -3px;
  }

  .training-group-button-container {
    position: absolute;
    right: 0;
    top: 0;
    width: 3rem;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    z-index: 6; //please note the absence of z-index inflation
    background-color: $primary;
    .training-info {
      position: absolute;
      top: 2rem;
      left: 0.65rem;
    }
    .training-group-button-space {
      position: absolute;
      button {
        height: 100%;
        color: white;
        background-color: $primary;
        &.selected {
          background-color: mix($primary, white, 70%);
        }
      }
    }
  }

  .nk-drawer {
    position: absolute;
    right: 0;
    top: 0;
    width: v-bind(drawerWidth);
    transition: width $transition-duration ease-in-out, transform $transition-duration ease-in-out;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    background-color: $primary;
    border-left: 2px solid white;
    z-index: 3;

    .label {
      height: 2rem;
      position: absolute;
      width: 100%;
      text-align: center;
      color: white;
      align-content: center;
    }

    .material-container-frame {
      position: relative;
      margin: 2rem 3rem 2rem 2.5rem;
      background: linear-gradient(0deg, #fdcc9b, #9cccfc, #0352a0);
      width: 100%;
      border-radius: 1rem;
      border: 2px solid white;
    }

    .material-container {
      position: absolute;
      left: 0;
      top: 0;
      margin: 0 3rem 0 2.5rem;
      width: 100%;
      height: 100%;

      button.material, a {
        position: absolute;
        background-color: $primary;
        color: white;
        text-decoration: none;
        padding: 0.5rem;
        border-radius: 5px;
        font-size: 150%;
        width: 21rem;
        display: flex;
        span {
          margin: auto;
        }
      }
    }

    button#drawer-close {
      position: absolute;
      top: 49%;
      margin-left: 0.25rem;
      background-color: $background;
      i {
        color: $dark-red;
        font-size: 220%;
        font-weight: bold;
      }
    }
  }
}

.student-info-box {
  background-color: $background-lighter;
  border-radius: 1rem;
  margin: 0.5rem;
  border: 2px solid $dark-red;
  h5 {
    text-align: center;
  }
  .q-card__section:first-child {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
}
</style>

