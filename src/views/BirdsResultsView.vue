<script setup lang="ts">

import {onUnmounted, onMounted, ref, onUpdated} from 'vue'
import {
  apiClassDataToDisplayData, hasManyMistakes, safeDictLookup,
} from "@/views/util.ts";
import { getRandomApiResults } from '@/api_simulation/actualResults'
import {getDatabaseResults} from '@/api_simulation/databaseResults'

import {trainingGroupNumberThresholdDict, transDict} from "@/views/variables.ts";

import type {
  ApiClassDataType, ClassStudentsDataDictType,
  DisplayClassDataType, ResultType,
} from '@/types/resultTypes.ts'

import InfoDialog from '@/components/InfoDialog.vue'
import type {
  BirdSVGType,
  BirdType, ResultTabPaneType,
} from "@/types/visualTypes.ts";
import {
  get_tab_pane,
  get_bird_color_map_from_results,
  scoreToY,
  y_axis_max,
  y_axis_min, getOneStudentsDisplayData
} from "@/views/birdViewUtils";
import type { BirdPartColorsMapType } from "@/types/visualTypes";
import ReadingTandem from "@/views/materials/ReadingTandem.vue";
import InfoBanner from "@/components/InfoBanner.vue";
import router from "@/router";
import Feather from "@/components/Feather.vue";
import VideoDialog from "@/components/VideoDialog.vue";
import {getAssetUrl} from "@/assets.ts";
//import * as buffer from "node:buffer";

const dialogOpen = ref(false)
const showNames = ref(false);
const studentData = ref<ClassStudentsDataDictType>()
const selectedStudentCodes = ref<string[]>([])
const materialDrawerOpen = ref<boolean>(false)
const skyWidth = ref<string>("100%")
const drawerWidth = ref<string>("0")
const namesOrCodes = ref<string>("Namen")
const emphasis = ref<string>("all")

const displayData = ref<DisplayClassDataType>();
// currently active test group
const tab_pane = ref<ResultTabPaneType>();

const birdBaseSize = ref<number>(7)

const birdColorMap = ref<BirdPartColorsMapType>();

const testIterationCount = ref<number>(1);

const selectedMaterialGroup = ref<number|null>(null); // 0, 1, 2
const birdsInMaterialGroup = ref<Set<string>>(new Set()); // 0, 1, 2
const readingTandemModalOpen = ref<boolean>(false);
const readingPassModalOpen = ref<boolean>(false);
const readingTheaterModalOpen = ref<boolean>(false);
const readingPilotModalOpen = ref<boolean>(false);

const startVideoModalOpen = ref<boolean>(false);
const peculiarityVideoModalOpen = ref<boolean>(false);
const resultsVideoModalOpen = ref<boolean>(false);


let lastTestDateLabel: string;


function updateFromResultsData(code: string, apiClassData: ApiClassDataType) {
  localStorage.setItem("dataCode", code);
  localStorage.setItem("apiClassData", JSON.stringify(apiClassData));

  peculiarityOptions = [
    {label: 'Alle', value: 'all'},
    {label: 'Auffällige Fehleranzahl', value: 'manyMistakes'},
    {label: 'Testergebnisse mit großer Abweichung', value: 'subtestDifferences'},
  ]

  displayData.value = apiClassDataToDisplayData(apiClassData);
  localStorage.setItem("displayData", JSON.stringify(displayData.value))

  birdColorMap.value = get_bird_color_map_from_results(displayData.value.allTestsResults);
  getTabPanes();
  if (displayData.value) {
    testIterationCount.value = displayData.value.allTestsResults.length
    lastTestDateLabel = displayData.value.allTestsResults[testIterationCount.value - 1].date;
    pairStudents()
    if (testIterationCount.value > 1) {
      peculiarityOptions.push({label: 'Stagnierende Werte', value: 'noGrowth'},)
    }
  }
  console.log("displayData", displayData)
}

function pairStudents() {
  let traineeArray: ResultType[] = []
  let trainerArray: ResultType[] = []
  if (displayData.value) {
    testIterationCount.value = displayData.value.allTestsResults.length
    const lastTestResult = displayData.value.allTestsResults[testIterationCount.value - 1]

    const sortedResults = lastTestResult.results.sort((i: ResultType, i2: ResultType) => i.aggregatedResult - i2.aggregatedResult)

    const studentsCount = lastTestResult.results.length

    traineeArray = sortedResults.slice(0, studentsCount / 2)
    trainerArray = sortedResults.slice(studentsCount / 2,)

    localStorage.setItem("readingTandemPairs",
      JSON.stringify({trainer: trainerArray, trainees: traineeArray})
    )
  }
}

let peculiarityOptions;

onMounted(() => {

  const urlParams = new URLSearchParams(window.location.search);
  const current_code = localStorage.getItem("dataCode");

  function load_code(code: string) {
    console.log(`DATA: loading '${code}'`);
    getDatabaseResults(code)
      .then(data => updateFromResultsData(code, data))
      .catch((e) => {
        console.log(e);
        alert("Laden der Daten ist leider fehlgeschlagen");
      });
  }

  function load_random() {
    console.log(`DATA: generating random results`);
    const apiClassData: ApiClassDataType = getRandomApiResults();
    updateFromResultsData("random", apiClassData);
  }

  if (urlParams.get("code")) {
    load_code(urlParams.get("code"));
  }
  else if (urlParams.has("random") || import.meta.env.VITE_STATIC_BUILD === 'true') {
    load_random();
  }
  else if (current_code) {
    console.log(`DATA: reusing '${current_code}'`);
    updateFromResultsData(current_code, JSON.parse(localStorage.getItem("apiClassData")));
  }
  else {
    if (window.location.hostname === "localhost") {
      load_random();
    } else {
      load_code("lUaTW6DMaRZxoyGoQFJ8tXYZ20X5lCCG3hC3eQkK-Ug");
    }
  }

  window.addEventListener("resize", getTabPanes)
});

onUpdated(() => {
})

onUnmounted(() => {
  window.removeEventListener("resize", getTabPanes)
})

function getMaterialButtonPosition(minScore: number, maxScore: number, column: number) {

  const group = selectedMaterialGroup.value;
  if (group || group === 0) {
    const group_min = group === 0 ? 0 : trainingGroupNumberThresholdDict[group - 1];
    const group_max = trainingGroupNumberThresholdDict[group];
    const is_selected = (
      (group_min >= minScore && group_min <= maxScore) ||
      (group_max >= minScore && group_max <= maxScore) ||
      (minScore >= group_min && minScore <= group_max) ||
      (maxScore >= group_min && maxScore <= group_max)
    );

    return {
      bottom: `${scoreToY(minScore)}%`,
      height: `${scoreToY(maxScore) - scoreToY(minScore)}%`,
      left: `${2 * column}rem`,
      opacity: is_selected ? '100%' : '60%',
    }
  }
}

function getBirdBaseSize() {
  birdBaseSize.value = Math.min(7, window.innerWidth / 136)
}


function getTabPanes() {

  getBirdBaseSize();

  if (displayData.value) {
    displayData.value.tab_panes = [];
    for (let idx = 0; idx < displayData.value.allTestsResults.length; ++idx) {
      if (birdColorMap.value) {
        displayData.value.tab_panes.push(
          get_tab_pane(displayData.value.allTestsResults, birdBaseSize.value, birdColorMap.value, idx)
        );
      }
    }
    if (displayData.value.allTestsResults.length > 1) {
      if (birdColorMap.value) {
        displayData.value.tab_panes.push(
          get_tab_pane(displayData.value.allTestsResults, birdBaseSize.value, birdColorMap.value)
        );
      }
    }

    // update current `tab_pane`
    if (displayData.value.tab_panes?.length) {
      if (tab_pane.value) {
        // .. to the last selected one
        tab_pane.value = displayData.value.tab_panes.filter(tp => tp.name === tab_pane.value?.name)[0];
      }
      if (!tab_pane.value) {
        // .. or select the last group
        tab_pane.value = displayData.value.tab_panes[displayData.value.tab_panes.length - 1];
      }
    }
  }
}

let dialogTitle: string | undefined;
let dialogBody: string | undefined;
let avatarSVG: BirdSVGType | undefined;

function selectBird(bird: BirdType) {
  const idx = selectedStudentCodes.value.indexOf(bird.nameCode);
  if (idx >= 0) {
    selectedStudentCodes.value = selectedStudentCodes.value.filter(c => c !== bird.nameCode);
  } else {
    selectedStudentCodes.value.push(bird.nameCode);
  }
}

function selectStudentFromList(studentData: ClassStudentsDataDictType) {
  const idx = selectedStudentCodes.value.indexOf(studentData.code);
  if (idx >= 0) {
    selectedStudentCodes.value = selectedStudentCodes.value.filter(c => c !== studentData.code);
  } else {
    selectedStudentCodes.value.push(studentData.code);
  }
}

function isBirdSelected(code: string) {
  return selectedStudentCodes.value.indexOf(code) >= 0;
}

function isBirdUnselected(code: string) {
  if (selectedStudentCodes.value.length && selectedStudentCodes.value.indexOf(code) >= 0) { return false; };
  if (materialDrawerOpen.value && birdsInMaterialGroup.value.has(code)) return false;
  return (selectedStudentCodes.value.length > 0 || materialDrawerOpen.value);
}

function isBirdTextVisible(bird: BirdType) {
  if (!bird.showText) { return false; }
  if (selectedStudentCodes.value.indexOf(bird.nameCode) >= 0) { return true; }
  if (materialDrawerOpen.value && isBirdUnselected(bird.nameCode)) { return false; }
  return showNames.value;
}

function selectTabPane(name: string) {
  const tp = displayData.value?.tab_panes?.filter(tp => tp.name === name)[0];
  if (tp && name !== tab_pane.value?.name) {
    tab_pane.value = tp;
  } else {
    if (displayData.value?.tab_panes) {
      tab_pane.value = displayData.value.tab_panes[displayData.value.tab_panes.length - 1];
    }
  }
}

function selectMaterialGroup(group: number) {
  selectedMaterialGroup.value = group;

  const bird_set = new Set();

  const minimum = group === 0 ? 0 : trainingGroupNumberThresholdDict[group -1];
  const maximum = trainingGroupNumberThresholdDict[group];

  const results = displayData.value.allTestsResults[displayData.value.allTestsResults.length - 1];
  if (results) {
    for (const r of results.results) {
      const y = r.aggregatedResult;
      if (y >= minimum && y < maximum) {
        bird_set.add(r.studentCode);
      }
    }
  }
  birdsInMaterialGroup.value = bird_set;
}


function goToStudentDetail(code: string) {
  if (displayData.value) {
    const studentData = getOneStudentsDisplayData(displayData.value, code)
    localStorage.setItem("studentData", JSON.stringify(studentData))
    router.push({path: '/schuelerin-detail/' + code})
  }
}

function openDialog(ornithologicalData: BirdType) {
  const studentResult = ornithologicalData.result;
  avatarSVG = ornithologicalData.svg;
  dialogTitle = namesOrCodes.value === "Namen" ? ornithologicalData.nameReal : ornithologicalData.nameCode;
  if (displayData.value) {
    studentData.value = displayData.value?.classDict[studentResult.studentCode];
  }

  dialogOpen.value = true;
}

function toggleShowNames(): void {
  showNames.value = !showNames.value;
}

function toggleDrawer(select_material_group: number|null = null) {
  const openDrawerWidthPercent = window.innerWidth > 500 ? 50 : 100;
  if (displayData.value?.allTestsResults && !materialDrawerOpen.value && tab_pane.value?.name === "Entwicklung") {

    testIterationCount.value = displayData.value.allTestsResults.length
    const lastTabPaneName = displayData.value.allTestsResults[testIterationCount.value - 1].date
    selectTabPane(lastTabPaneName)
  }
  let material_changed = false;
  if (typeof select_material_group == "number") {
    material_changed = selectedMaterialGroup.value !== select_material_group;
    selectMaterialGroup(select_material_group);
  }
  if (!materialDrawerOpen.value || material_changed) {
    skyWidth.value = `${100 - openDrawerWidthPercent}%`
    drawerWidth.value = `${openDrawerWidthPercent}%`
    materialDrawerOpen.value = true;
  } else {
    skyWidth.value = "100%"
    drawerWidth.value = "0%"
    materialDrawerOpen.value = false;
  }
}

function changeEmphasis() {
  selectedStudentCodes.value = []

  if (emphasis.value === "all") {
    selectedStudentCodes.value = []
  } else if (emphasis.value === "noGrowth") {
    if (displayData.value) {
      for (const [code, studentDict] of Object.entries(displayData.value.classDict)) {
        if (studentDict && studentDict.resultGrowthInPoints && studentDict.resultGrowthInPoints <= 0) {
          selectedStudentCodes.value.push(studentDict.code)
        }
      }
    }
  } else if (emphasis.value === "manyMistakes") {
    if (displayData.value) {
      for (const [code, studentDict] of Object.entries(displayData.value.classDict)) {
        const lastAggResult = studentDict?.results[0].aggregatedResult;
        let processedSubtests = 0;
        for (const subtestResult of studentDict?.results[0].subTestResults) {
          if (hasManyMistakes(subtestResult.correct, subtestResult.wrong)) {
            selectedStudentCodes.value.push(studentDict.code)
            break
          }
        }
      }
    }
  } else if (emphasis.value === "subtestDifferences") {
    for (const studentDict of Object.values(displayData.value.classDict)) {
      if (studentDict?.results[0].subTestResults) {

        const resultsAgg = []

        for (const result of studentDict?.results[0].subTestResults) {
          resultsAgg.push(result.correct - result.wrong)
        }
        if (Math.abs(Math.min(...resultsAgg) - Math.max(...resultsAgg)) > 8) {
          selectedStudentCodes.value.push(studentDict.code)
        }
      }
    }
  }
}

function openLink(url: string) {
  window.open(url, '_blank')
}

</script>

<template :ref="displayData">

  <div v-if="!displayData">
    Getting the data
  </div>
  <div class="super-container" v-else>
    <h1 style="display: flex">
      Ergebnisse Lesetest BKT<!--{{ displayData["className"] }} ({{ displayData["testLabel"] }})-->
      <InfoBanner icon-name="info" inner-icon-name="info" icon-color="white" style="margin-bottom: 0.5rem">
        <div class="emphasis-info">
          <h5 style="line-height: inherit;">Erläuterung</h5>

          <p>
            Der Lesetest BKT („Basiskompetenztests Lesen“) unterstützt Lehrkräfte dabei,
            die basalen Lesefertigkeiten ihrer Schüler*innen systematisch zu erfassen.
            Als kurzer Speedtest liefert er in wenigen Minuten verlässliche Informationen zur
            Leseflüssigkeit auf Wort- und Satzebene und steht den Schulen kostenlos zur Verfügung.
          </p>
          <p>
            Die Ergebnisse sind normiert, sodass Lehrkräfte schnell erkennen können, ob ein Kind
            altersgemäß liest oder ob ein Förderbedarf vorliegt. Auf dieser Grundlage lassen sich
            Lesefördermaßnahmen gezielt planen und Lernfortschritte im Verlauf überprüfen – ein
            wichtiger Baustein für wirksames Lesetraining im Unterricht.
          </p>
          <p>
            Die Ergebnisse werden
            praxisnah dargestellt und können ohne statistisches Vorwissen abgelesen werden: Jedes
            Kind wird durch die Flugbahn eines Vogels dargestellt. So können auch Entwicklungen angezeigt werden.
          </p>
        </div>
      </InfoBanner>
      <button class="play" style="color: white; margin-left: auto" @click="startVideoModalOpen=true">
        <q-icon name="play_circle">
        </q-icon>
        <span>Erklärvideo</span>
      </button>
    </h1>

    <div class="flex">
      <div class="emphasis-container">
        <q-expansion-item
          class="overflow-hidden"
          header-class="bg-primary text-white"
          expand-separator
          dense-toggle
          expand-icon-class="text-white"
          style="border-radius: 30px"
        >

          <template v-slot:header>
            <q-item-section style="white-space: nowrap; margin-right: 3rem">
              Besonderheiten hervorheben
            </q-item-section>
            <q-item-section>
              <button class="play"
                style="color: white; font-size: 200%; margin-bottom: 0; width: 2rem; height: 2rem; margin-left: auto;"
                      @click.stop="peculiarityVideoModalOpen=true">
                <q-icon style="margin-bottom: 1.5rem" name="play_circle">
                </q-icon>
              </button>
            </q-item-section>
          </template>
            <q-card
            class="emphasis-card"
          >
            <q-card-section>
              <div class="emphasis-card-content">
                <q-btn-toggle
                  class="rounded code-toggle q-ml-auto q-mr-sm"
                  @click="changeEmphasis"
                  no-caps
                  v-model="emphasis"
                  toggle-color="primary"
                  text-color="primary"
                  :clearable="false"
                  :options="peculiarityOptions"
                />
                <div class="info-banner-container">
                  <InfoBanner icon-name="info" inner-icon-name="info" icon-color="primary">
                    <div class="emphasis-info">
                      <h5>Erläuterung der Besonderheiten</h5>
                      <p v-if="displayData.allTestsResults.length > 1">
                        Die Hervorhebungen beruhen auf den letzten Testergebnissen.
                      </p>
                      <p v-if="displayData.allTestsResults.length > 1">Stagnierende Werte: <br>Das Gesamtergebnis hat sich im Vergleich zum vorhergehenden Messzeitpunkt nicht verbessert</p>
                      <p>Auffällige Fehleranzahl: <br>Mehr als 10% Fehlerquote und mehr als 2 Fehler in mindestens einem Testteil</p>
                      <p>Testergebnisse mit großer Abweichung: <br>Die Ergebnisse der Einzeltests (Wort und Satz) weichen um mehr als 8 Punkte voneinander ab.</p>
                    </div>
                  </InfoBanner>
                </div>
              </div>
            </q-card-section>
          </q-card>

        </q-expansion-item>
      </div>

      <q-btn-toggle
        class="rounded code-toggle q-ml-auto q-mr-sm"
        no-caps
        v-model="namesOrCodes"
        toggle-color="primary"
        text-color="primary"
        :clearable="false"
        :options="[
          {label: 'Namen', value: 'Namen'},
          {label: 'Codes', value: 'Codes'},
        ]"
      />
      <q-btn transition="all 2s"
             @click="toggleShowNames"
             no-caps
             class="name-button q-mb-sm" color="primary"
      >
        <span class="no-break" v-if="showNames">{{namesOrCodes}} ausblenden</span>
        <span class="no-break" v-else>{{namesOrCodes}} einblenden</span>
      </q-btn>
    </div>

    <div class="view-container">
      <transition name="sky" mode="out-in">
        <div class="sky-background" v-if="tab_pane">

          <div
            v-for="(poly, i) of tab_pane.cloud_polygons"
            :class="['sky-clouds', poly.class]"
            :key="i"
            :style="poly.style"
          />

          <div class="sky-filter" @click="selectedStudentCodes = []"></div>

          <div v-if="tab_pane.flight_paths">
            <div
              v-for="flight_path in tab_pane.flight_paths"
              :key="flight_path.studentCode"
              :style="flight_path.polygon.style"
              :class="['flight-path', {'visible': isBirdSelected(flight_path.studentCode)}]"
            />
          </div>

          <div class="y-axis">
            <div class="y-axis-label-container">
              <div class="y-axis-label">→Lesegeschwindigkeit→</div>
            </div>
          </div>

          <div
            class="bird-container-container"
            v-for="bird in tab_pane.birds"
            :key="bird.nameCode"
            :style="{
              ...bird.style,
              'width': `${bird.size}rem`,
              /* make left define the center of the bird */
              'margin-left': `-${bird.size/2}rem`,
            }"
          >
            <div
              :class="['bird-container', {'not-selected': isBirdUnselected(bird.nameCode)}]"
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
                  @click="selectBird(bird)"
                />
                <path
                  class="outline-path"
                  :d="bird.svg.outline"
                  :style="{stroke: bird.svg.outline_color}"
                />
              </svg>

            </div>
            <transition name="textFade">
              <div
                class="bird-text"
                v-show="isBirdTextVisible(bird)"

              >
                <transition name="fade" mode="out-in">
                  <div
                    class="name"
                    v-if="namesOrCodes === 'Namen'"
                    @click="openDialog(bird)"
                  >
                    <q-icon name="report" v-if="bird.result.probablyGuessed" color="red-10"></q-icon>
                    <div>{{bird.nameReal}}</div>
                    <q-icon name="info" color="primary" @click="openDialog(bird)"/>
                    <q-icon name="child_care" color="primary" @click="goToStudentDetail(bird.nameCode)"/>

                  </div>
                  <div
                    class="name"
                    v-else
                  >
                    <q-icon name="report" v-if="bird.result.probablyGuessed" color="red-10"></q-icon>
                    <div>{{bird.nameCode}}</div>
                    <q-icon name="info" color="primary" @click="openDialog(bird)"/>
                    <q-icon name="child_care" color="primary" @click="goToStudentDetail(bird.nameCode)"/>
                  </div>
                </transition>
              </div>
            </transition>
          </div>

          <transition name="fade" mode="out-in">
            <div class="sky-info" v-if="tab_pane.name === 'Entwicklung'">
              <InfoBanner icon-name="engineering">Im Bereich der ‚Wolke‘ (der Bereich mit dem weißen Hintergrund) liegen die mittleren 50% der Testergebnisse.</InfoBanner>
            </div>
          </transition>

          <div class="header" v-for="header in tab_pane.headers" :key="header.text" :style="header.style">
            <button
              class="header-content"
              :style="{'font-size': `${Math.max(.7, birdBaseSize / 6)}rem`}"
              @click="selectTabPane(header.tab_pane_name)"
            >
              <transition name="fade" mode="out-in">
                <span v-if="tab_pane.name !== 'Entwicklung' && testIterationCount > 1">
                  <q-icon name="arrow_back"/>
                </span>
              </transition>
              <span>
                {{header.text}}
              </span>

            </button>
          </div>

          <InfoDialog :title="dialogTitle" :body="dialogBody" :avatarSVG v-model="dialogOpen"
                      extra-classes="apricot"
          >
            <q-card-section class="content">
              <div v-if="studentData" v-for="(testData, index) in studentData.results">
                <div class="student-info-box rounded" :class="index === 0 ? 'emphasis' : ''">
                  <h5>
                    {{testData.date}}
                  </h5>
                  <span>
                    {{safeDictLookup(transDict, displayData.aggregationType)}}: {{ testData.aggregatedResult }}
                  </span>

                  <div v-for="subResult in testData.subTestResults">
                    <span>
                      {{subResult.label}}: {{subResult.correct}}<q-icon color="positive"  name="check"/>
                    </span>
                    <span>
                      {{subResult.wrong}}<q-icon color="negative" name="close"/>
                    </span>
                    <div style="font-size: 90%" v-if="subResult.probablyGuessed">
                      <q-icon size="1.2rem" style="margin-bottom: 3px;" name="report" v-if="studentData.results[0].probablyGuessed" color="red-10"></q-icon>
                      Hat vielleicht geraten?
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </InfoDialog>
        </div>
      </transition>



      <div class="training-group-button-container">
        <button class="play" style=
          "color: white; position: absolute; font-size: 185%; top: 1rem; right: 0.3rem; min-width: 2.5rem;"
                @click="resultsVideoModalOpen=true">
          <q-icon name="play_circle">
          </q-icon>
        </button>
        <InfoBanner v-if="emphasis === 'all'" class="training-info" icon-name="engineering" icon-color="white">
          <h4 style="line-height: 1rem; margin-bottom: 1rem">Trainingsgruppen</h4>
          <p>
            Die Zuordnung zu den Trainingsgruppen erfolgt anhand der letzten Testergebnisse.
          </p>
          <h5>Silben-Möwen</h5>
          <p>
            Die Trainingsgruppe „Silben-Möwen“ umfasst besonders leseschwache Schülerinnen und Schüler,
            die bereits beim Erkennen und Verarbeiten kleinster Bausteine der Schrift Schwierigkeiten haben.
            Sie stocken häufig beim Lesen, raten Wörter oder verlieren schnell die Konzentration, weil die
            Entzifferung einzelner Buchstaben und Silben sehr viel Anstrengung kostet. Für diese Kinder
            ist es wichtig, unterhalb der Wortebene anzusetzen: Sie üben systematisch Buchstaben, Lautverbindungen
            und Silbenmuster, um sichere und automatisierte Leseeinheiten aufzubauen. In der Gruppe „Silben-Möwen“
            stehen daher spielerische, kleinschrittige Übungen zu Silben, Reimen und Lautfolgen im Vordergrund, die
            Erfolgserlebnisse ermöglichen und die Basis für flüssiges Lesen vorbereiten.
          </p>
          <h5>Wort-Finken</h5>
          <p>
            Die Trainingsgruppe „Wort-Finken“ umfasst solche noch teils leseschwachen Schülerinnen und Schüler,
            die zwar Silben und häufige Wörter in der Regel entziffern können, beim flüssigen Lesen von weniger
            frequenten Wörtern, Sätzen und kurzen Texten aber noch große Mühe haben. Sie lesen häufig abgehackt,
            verlesen sich oder verlieren den Sinn, weil sie noch zu stark mit dem Entziffern beschäftigt sind. Im
            Training der „Wort-Finken“ stehen daher wiederholendes und chorisches Lesen, Mitleseverfahren sowie kurze,
            klar strukturierte Texte im Mittelpunkt. Durch gemeinsames Lautlesen in der Gruppe, feste Routinen
            und viele Erfolgserlebnisse werden Lesetempo, Genauigkeit und Sinnentnahme schrittweise aufgebaut.
          </p>
          <h5>Text-Adler</h5>
          <p>
            Die Trainingsgruppe „Text-Adler“ umfasst Schülerinnen und Schüler, die deren Leseflüssigkeit so
            entwickelt ist, dass sie einfache Texte verstehen können. Sie lesen meist ohne großes Stocken
            und können den Inhalt einfacher Texte grundsätzlich erfassen, arbeiten nun aber gezielt an ihrer
            Vorlesequalität und der Ausdehnung der Geschwindigkeit. Im Mittelpunkt des Trainings stehen
            deshalb Intonation, sinnvolle Pausensetzung, Betonung wichtiger Wörter sowie eine angemessene
            Erhöhung der Lesegeschwindigkeit. Durch wiederholtes Lautlesen, Rollenlesen und das Einüben
            unterschiedlicher Textsorten lernen die „Text-Adler“, Texte lebendig, verständlich und
            adressatenorientiert vorzulesen.
          </p>
        </InfoBanner>

        <InfoBanner v-else class="training-info" icon-name="engineering" icon-color="white">
          Die Zuordnung zu den Besonderheiten erfolgt anhand der letzten Testergebnisse.
        </InfoBanner>

        <div
          class="training-group-button-space"
          :style="{
            top: `${100 - y_axis_max}%`,
            height: `${y_axis_max - y_axis_min}%`,
          }"
          v-if="emphasis === 'all'"
        >
          <button :class="['high', 'vertical', 'not-rounded', {'selected': materialDrawerOpen && selectedMaterialGroup === 2}]" @click="() => toggleDrawer(2)">
            <span style="height: 7rem;">
              TEXT ADLER
            </span>
          </button>
          <button :class="['middle', 'vertical', 'not-rounded', {'selected': materialDrawerOpen && selectedMaterialGroup === 1}]" @click="() => toggleDrawer(1)">WORT FINK</button>
          <button :class="['low', 'vertical', 'not-rounded', {'selected': materialDrawerOpen && selectedMaterialGroup === 0}]" @click="() => toggleDrawer(0)">SILBEN MÖWE</button>
        </div>
        <div
          class="training-group-button-space"
          v-else
          :style="{
            top: `${100 - y_axis_max}%`,
            height: `${y_axis_max - y_axis_min}%`,
          }"
        >
          <button :class="['full', 'vertical', 'not-rounded']" @click="() => toggleDrawer(2)">ERLÄUTERUNG</button>
        </div>
      </div>

      <transition name="drawer" mode="out-in">
        <div class="nk-drawer">
          <div class="label">{{emphasis === 'all' ? 'Flugtraining' : ''}}</div>
          <div class="material-container-frame"/>
          <div v-if="emphasis === 'all'" class="material-container">
            <button class="vertical material"
                    :style="getMaterialButtonPosition(0, 60, 1)"
                    @click="readingTandemModalOpen=true"
            >
              Lesetandem
            </button>
            <button class="vertical material"
                    :style="getMaterialButtonPosition(0, 60, 3)"
                    @click="readingPassModalOpen=true"
            >
              Lesepass
            </button>
            <button class="material" :style="getMaterialButtonPosition(44, 60, 10)"
                    @click="readingPilotModalOpen=true"
            >
              Lesepilot
            </button>
            <button class="material" :style="getMaterialButtonPosition(28, 43, 10)"
                    @click="readingTheaterModalOpen=true"
            >
              Lesetheater
            </button>
            <button class="material"
              :style="getMaterialButtonPosition(17, 26, 10)"
              @click="openLink(getAssetUrl('chorisches_lesen.pdf'))"
            >
              Chorisches Lesen
            </button>
            <button
              class="material"
              :style="getMaterialButtonPosition(28, 60, 5)"
              @click="openLink(getAssetUrl('Methodenkarte_Textabschnitte_sortieren.pdf'))"
            >
              Textabschnitte sortieren
            </button>
            <button
              class="material" :style="getMaterialButtonPosition(17, 26, 5)"
              @click="openLink(getAssetUrl('Blitzlesen.pdf'))"
            >
              Blitzlesen
            </button>
            <button
              class="material" :style="getMaterialButtonPosition(0, 15, 10)"
              @click="openLink(getAssetUrl('synthetisieren.pdf'))"
            >
              Synthetisieren
            </button>
            <button class="material" :style="getMaterialButtonPosition(6, 15, 5)"
              @click="openLink(getAssetUrl('silben_wuerfeln.pdf'))"
            >
              Silben würfeln
            </button>
            <button
              class="material" :style="getMaterialButtonPosition(0, 5, 5)"
              @click="openLink(getAssetUrl('Blickspanne.pdf'))"
            >
              Blickspanne
            </button>
          </div>
          <div v-else class="material-container advice">
            <div class="content" v-if="emphasis === 'manyMistakes'" style="margin: auto">
              <h5>Auffällige Fehleranzahl</h5>
              <p>Das Kind hat beim Lesen relativ viele Fehler gemacht.
                Das zeigt, dass das genaue Lesen von Wörtern noch schwerfällt und das besonders
                geübt werden sollte.
              </p>
              <p>
                Möglicherweise wurden die Aufgaben auch so rasch bearbeitet,
                dass nicht genau genug gelesen („geraten“) wurde. Dass das Kind noch viele
                Lesefehler macht, kann aber auch ein wichtiger Hinweis sein, um gezielt an der
                sicheren Worterkennung zu arbeiten.
              </p>
            </div>
            <div class="content" v-if="emphasis === 'subtestDifferences'" style="margin: auto">
              <h5>Testergebnisse mit großer Abweichung</h5>
              <p>Das Kind liest in einem Bereich deutlich besser als im anderen (zum Beispiel
                Wörter besser als Sätze oder umgekehrt). Das sollte Auswirkungen auf das ausgewählte
                Material beim Lesetraining haben.
              </p>
              <p>
                Wenn „Wörter" deutlich besser als Sätze sind, sollten gezielt das Lesen von ganzen
                Sätzen im Mittelpunkt stehen (z.B. durch Blitzlesen).
              </p>
              <p>
                Wenn Sätze besser als einzelne Wörter sind, stehen häufige Wörter („kleine Lesewörter“)
                im Mittelpunkt der Förderung bzw. die Stärkung der Worterkennung.
              </p>
            </div>
            <div class="content" v-if="emphasis === 'noGrowth'" style="margin: auto">
              <h5>Stagnierende Werte</h5>
              <p>
                Im Vergleich zum letzten Test hat sich das Ergebnis nicht
                verbessert. Das bedeutet: Trotz des Übens liest das Kind insgesamt noch ähnlich
                schnell und (un)sicher wie zuvor.
              </p>
              <p>
                Das kann mehrere Gründe haben, die mit der Art
                der Förderung, dem Unterricht, aber auch dem Kind oder dem sozialen Umfeld zu tun
                haben. Sofern es am Unterricht liegt: Achten Sie zukünftig noch mehr darauf, dass
                ausreichend (regelmäßig) die Leseflüssigkeit trainiert wird (z.B. durch vereinfachte
                Lautleseverfahren).
              </p>
              <p>
                Passen Sie im Unterricht ggf. die Texte an, sofern sie zu schwer
                oder zu lang waren. Bei anhaltend gleichbleibenden Werten gilt es, auch weitere
                Gründe mit Hilfe der Eltern abzuklären, z.B. Aspekte der Aufmerksamkeitssteuerung,
                Konzentration, Motivation, aber auch Belastungen (Stress).
              </p>
            </div>
          </div>
          <q-btn round color="$background" size="sm" id="drawer-close" @click="toggleDrawer">
            <q-icon name="arrow_forward"/>
          </q-btn>
        </div>
      </transition>
    </div>

    <div class="student-list">
      <button
        class="name-button"
        :class="`${selectedStudentCodes.includes(studentData.code) ? 'selected': ''} ${studentData.results[0].date !== lastTestDateLabel ? 'did-not-participate' : ''}`"
        v-if="namesOrCodes === 'Namen'"
        v-for="studentData in Object.values(displayData.classDict).sort((a, b) => a.name.localeCompare(b.name))"
        @click="selectStudentFromList(studentData)"
      >
        <span
          class="name"
          v-if="studentData"
        >
          <q-icon style="margin-top: 1px" size="1.2rem" name="report" v-if="studentData.results[0].probablyGuessed && studentData.results[0].date === lastTestDateLabel" color="red-10">
            <q-tooltip class="bg-primary text-whites" style="font-size: 100%">Vielleicht wurde bei einem Teiltest geraten.</q-tooltip>
          </q-icon>
          {{studentData.name}}
          <span style="margin-left: 0.25rem; margin-top: 0.1rem;" v-for="result of studentData.results">
            <Feather size="0.8rem" ring-color="red" :feather-color="tab_pane?.birds[0].svg.outline_color"/>
          </span>
        </span>
      </button>
      <button
        v-else
        v-for="studentData in Object.values(displayData.classDict).sort((a, b) => a.code.localeCompare(b.code))"
        class="name-button"
        :class="`${selectedStudentCodes.includes(studentData.code) ? 'selected': ''} ${studentData.results[0].date !== lastTestDateLabel ? 'did-not-participate' : ''}`"
        @click="selectStudentFromList(studentData)"
      >
        <span
          class="name"
          v-if="studentData"
        >
          <q-icon style="margin-top: 1px" size="1.2rem" name="report" v-if="studentData.results[0].probablyGuessed" color="red-10">
            <q-tooltip class="bg-primary text-whites" style="font-size: 100%">Vielleicht wurde bei einem Teiltest geraten.</q-tooltip>
          </q-icon>
          {{studentData.code}}
          <span style="margin-left: 0.25rem; margin-top: 0.1rem;" v-for="result of studentData.results">
            <Feather size="0.8rem" ring-color="red" :feather-color="tab_pane?.birds[0].svg.outline_color"/>
          </span>
        </span>
      </button>
      <div class="info-banner-container">
        <InfoBanner icon-name="info" inner-icon-name="info" icon-color="primary">
          <div class="emphasis-info">
            <p v-if="displayData.allTestsResults.length > 1">
              Schüler:innen, die nicht am letzten Test teilgenommen haben sind rot umrandet.
            </p>
            <p>Die Anzahl der Federn neben dem Namen entspricht der Anzahl an Tests, an denen der/die Schüler:in teilgenommen hat.</p>
          </div>
        </InfoBanner>
      </div>
    </div>
  </div>

  <InfoDialog
    v-model="readingTandemModalOpen"
    title="Lesetandem"
    width="fit-content"
    height="95vh"
    extra-classes="blue info-card"
  >
    <ReadingTandem :displayData="displayData"/>
  </InfoDialog>

  <InfoDialog
    v-model="readingPassModalOpen"
    title="Lesepass"
    extra-classes="blue info-card"
    width="22rem"
  >
    <q-card-section class="content">
      <a
        style="margin-bottom: 1rem; display: block"
        class="styled" :href="getAssetUrl('Lesepass.pdf')"
        target="_blank"
      >
        Methodenkarte
      </a>
      <q-separator color="primary" inset />
      <a
        style="margin-top: 1rem;
        display: block"
        class="styled"
        :href="getAssetUrl('studentLesepass.pdf')"
        target="_blank"
      >
        Lesepass für die Schüler:innen
      </a>
    </q-card-section>
  </InfoDialog>

  <VideoDialog v-model="startVideoModalOpen" title="Grundfunktionen der App erklärt" :source="getAssetUrl('video/start.mp4')"></VideoDialog>
  <VideoDialog v-model="peculiarityVideoModalOpen" title="Besonderheiten erklärt" :source="getAssetUrl('video/Besonderheiten.mp4')"></VideoDialog>
  <VideoDialog v-model="resultsVideoModalOpen" title="Die Ergebnisdarstellung erklärt" :source="getAssetUrl('video/Ergebnisse.mp4')"></VideoDialog>

  <InfoDialog
    v-model="readingPilotModalOpen"
    title="Lesepilot"
    extra-classes="blue info-card"
    width="22rem"
  >
    <q-card-section class="content">
      <a
        style="margin-bottom: 1rem; display: block"
        class="styled" :href="getAssetUrl('Methodenkarte_Lesepilot.pdf')"
        target="_blank"
      >
        Methodenkarte
      </a>
      <q-separator color="primary" inset />
      <a
        style="margin-top: 1rem;
        display: block"
        class="styled"
        :href="getAssetUrl('LesePilot.pdf')"
        target="_blank"
      >
        Lesepilot für die Schüler:innen
      </a>
    </q-card-section>
  </InfoDialog>

  <InfoDialog
    v-model="readingTheaterModalOpen"
    title="Lesetheater"
    extra-classes="blue info-card"
    width="32rem"
  >
    <q-card-section class="content">
      <p>
        Das Lesetheater ist ein Leseverfahren, bei dem wiederholtes lautes Lesen in einen szenischen, theaterähnlichen Rahmen eingebettet wird,
        um Leseflüssigkeit und Motivation zu steigern. Dabei werden geeignete Texte (z.B. kurze Geschichten mit Dialogen, Witze oder Sachtexte)
        in Rollenskripte umgeschrieben, sodass die Kinder mit verteilten Rollen lesen und nicht auswendig lernen müssen.
      </p>
      <p>
        In der Grundschule arbeiten die Schüler:innen meist in Kleingruppen, üben ihre Rollen mehrfach und achten dabei gezielt auf Betonung,
        Lesetempo und Ausdruck, wodurch Prosodie und Textverständnis gefördert werden.
      </p>
      <p>
        Im Unterricht vergibt die Lehrkraft differenzierte Rollen (unterschiedliche Textumfänge, Markierungen) und
        strukturiert Übungsphasen, in denen die Kinder ihre Texte erst leise, dann laut und zunehmend ausdrucksstark lesen.
      </p>
      <p>
        Am Ende steht häufig eine kleine Aufführung vor der eigenen Klasse oder einem Publikum, die als motivierender Abschluss
        dient und zusätzlich Selbstvertrauen, Teamarbeit und Lesefreude stärkt.
      </p>
      <a
        style="margin-top: 1rem;
        display: block"
        class="styled"
        href="https://bildungsserver.berlin-brandenburg.de/lesetheater"
        target="_blank"
      >
        Material zur Umsetzung
      </a>
    </q-card-section>
  </InfoDialog>
</template>

<style lang="scss" scoped>

button.play {
  background-color: $primary;
  min-width: 3rem;
  height: 3rem;
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

h1 {
  background-color: $primary;
  i {
    margin-top: 0.25rem;
  }
}

.name-button {
  width: 11em;
  height: 1rem;
  span.name {
    display: flex;
    flex-direction: row;
  }
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
    .emphasis-card-content {
      display: flex;

      .q-btn-group {
        background-color: $background-lighter;
      }
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
    &.did-not-participate {
      border: 2px solid $dark-red;
    }
  }
}

.emphasis-info {
  p {
    margin-bottom: 0.25rem;
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.super-container {
  min-width: 70rem;
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
        background-color: $cloud-color-back;
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
      .y-axis-label-container {
        position: relative;
        bottom: 0;
        display: flex;
        width: 2rem;
        height: 100%;

        .y-axis-label {
          position: absolute;
          transform: rotate(-90deg);
          transform-origin: bottom left;
          font-size: 1.4em;
          letter-spacing: .4rem;
          font-family: IQBPrimar, Roboto, serif;
          color: $primary;
          text-shadow: #0080ae 0 0 .5rem;
          z-index: 3;
          top: 76%;
          left: 2rem;
        }
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
        border-radius: 5px;
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

        div.name {
          color: black;
          vertical-align: baseline;
          line-height: 1;
          margin-top: 1px;
          display: flex;
          i {
            font-size: 120%;
          }
          div {
            margin-top: 1px;
            padding-right: 0.25rem;
          }
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
    }
  }

  button.vertical {
    width: 3rem;
    line-height: 1;
    writing-mode: vertical-lr;
    text-orientation: upright;
    -webkit-text-orientation: upright;
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
      top: 4rem;
      left: 0.65rem;
    }
    .training-group-button-space {
      position: absolute;
      button {
        height: 33.333%;
        color: white;
        background-color: $primary;
        padding: 0;
        line-height: 1.3;
        &.selected {
          background-color: mix($primary, white, 70%);
        }
        &.low {
          height: 27.5%;
        }
        &.middle {
          height: 19.7%;
        }
        &.high {
          height: 52.8%;
          span {
            margin-bottom: 0.5rem;
          }
        }
        &.full {
          height: 100%;
        }
        span {
          display: block;
          width: fit-content;
          margin: auto;
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

      &.advice {
        display: flex;
        flex-direction: column;
        .content {
          padding-top: 1rem;
          background-color: $background-lighter;
          margin: auto;
          padding-left: 1rem;
          padding-right: 6rem;
          h5 {
            margin-bottom: 0.5rem;
          }
        }
      }

      button.material {
        margin-left: 0.5rem;
        position: absolute;
        background-color: $primary;
        color: white;
        white-space: wrap;
        width: 9.5rem;
        &.vertical {
          width: 3rem;
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
  background-color: white;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  border: 2px solid $primary;
  &.emphasis {
    font-size: 115%;
    border-width: 4px;
  }
}
</style>
