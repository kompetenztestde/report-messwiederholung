<script setup lang="ts">

import type {
  ResultType
} from '@/types/resultTypes.ts'

import {onMounted, ref} from 'vue'

import InfoBanner from "@/components/InfoBanner.vue";
import {getAssetUrl} from "@/assets.ts";

let traineeArray = ref<ResultType[]>([])
let trainerArray = ref<ResultType[]>([])

onMounted(() => {
  let storedStudentData = localStorage.getItem("readingTandemPairs")
  if (storedStudentData) {
    storedStudentData = JSON.parse(storedStudentData)
    trainerArray.value = storedStudentData?.trainer;
    traineeArray.value = storedStudentData?.trainees;
  }
})

function startDrag(event: DragEvent, item: ResultType) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('studentCode', item.studentCode)
  }
}

function onDrop(event: DragEvent, list: ResultType[], listName: string) {
  const itemID = event.dataTransfer?.getData('studentCode')

  const item = list.find((item) => item.studentCode == itemID)
  if (item) {

    if (event.currentTarget?.id) {
      const dropIndex = +event.currentTarget.id

      if (listName === "trainees") {
        traineeArray.value = list.filter((item) => item.studentCode !== itemID)
        traineeArray.value.splice(dropIndex, 0, item)

      } else {
        trainerArray.value = list.filter((item) => item.studentCode !== itemID)
        trainerArray.value.splice(dropIndex, 0, item)
      }
    }
  }
  localStorage.setItem("readingTandemPairs",
    JSON.stringify({trainer: trainerArray.value, trainees: traineeArray.value})
  )
}

</script>

<template>
  <div class="super-container">
    <div class="explanation">
      <h5><a target="_blank" :href="getAssetUrl('methodenkarteLesetandem.pdf')">Methodenkarte <q-icon name="picture_as_pdf"></q-icon></a></h5>
      <q-expansion-item
        expand-separator
        icon="info"
        label="Zusammensetzung"
        caption="der Tandems"
        header-class="text-primary bold"
      >
        <div class="expanded-content">
          <div>
            Ein Flugpaar setzt sich aus 2 oder 3 leistungsheterogenen Schüler*innen zusammen.
          </div>
          <div>
            Anhand der Ergebnisse des letzten BKTs wird eine Rangfolge erstellt. Mit Hilfe dieser wird die Klasse in zwei Hälften geteilt.
          </div>
          <div>
            Die erste Hälfe besteht in aufsteigender Reihenfolge aus den Trainernvögeln, die jeweils einem Sportlervogel zugeordnet werden.
          </div>
          <div>
            Das Kind mit dem besten Ergebnis der ersten Hälfte wird somit dem Kind mit dem besten Ergebnis der zweiten Hälfte zugeordnet. Bei einer ungeraden Anzahl an Kindern, wird eine Dreiergruppe gebildet.
          </div>
        </div>
      </q-expansion-item>
    </div>
    <div class="lists-super-container">
      <h4>Tandems
        <InfoBanner icon-name="info">
          Die Zuordnung der Paare erfolgt auf Grundlage der Ergebnisse des letzten Tests.
          <br>
          Sie kann durch Drag und Drop angepasst werden.
        </InfoBanner>
      </h4>
      <div class="lists-container">
        <div class="list first">
          <h5 class="headline">
            Trainer
          </h5>
          <div
            v-for="(item, index) in trainerArray"
            :key="item.studentCode"
            class="drop-zone drag-el"
            @drop="onDrop($event, trainerArray, 'trainers')"
            @dragover.prevent
            @dragenter.prevent
            :id="index.toString()"
            draggable="true"
            @dragstart="startDrag($event, item)"
          >
            {{ item.name }}
          </div>
        </div>
        <div class="list">
          <h5 class="headline">Sportler</h5>
          <div
            v-for="(item, index) in traineeArray"
            class="drop-zone drag-el"
            @drop="onDrop($event, traineeArray, 'trainees')"
            @dragover.prevent
            @dragenter.prevent
            :id="index.toString()"
            :key="item.studentCode"
            draggable="true"
            @dragstart="startDrag($event, item)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.super-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  column-gap: 1rem;
  row-gap: 1rem;
  background-color: $background-lighter;
  padding: 1rem;
  .explanation {

    h5 {
      white-space: nowrap;
      color: white;
      margin-bottom: 1rem;
      a {
        color: white;
        text-decoration: none;
        i {
          margin-bottom: 0.2rem;
        }
      }
    }

    background-color: $primary;
    padding: 1rem;
    border-radius: 3px;
    height: fit-content;

    div {
      font-family: IQBPrimar, Roboto, serif;
      margin-bottom: 0.75rem;
    }
    .q-expansion-item {
      border-radius: 3px;
      background-color: $background-lighter;
      width: 16rem;
      i.q-icon {
        color: $primary!important;
      }
      .expanded-content {
        max-width: 16rem;
        padding: 0.5rem;
      }
    }

  }
  .lists-super-container {
    background-color: $background;
    padding: 1rem;
    height: fit-content;
    h4 {
      border-bottom: 2px solid $primary;
      padding-bottom: 0.25rem;
    }
    .lists-container {
      display: flex;
      flex-direction: row;


      border-radius: 3px;
      min-width: 18rem;
      height: fit-content;

      list {
        border: 2px solid $background-lighter;
      }

      .first {
        margin-right: 1rem;
      }

      .headline {
        margin-bottom: 0.5rem;
        margin-top: 0.5rem;
        padding-left: 0.5rem;
        background-color: $primary-light;
        border-radius: 2px;
      }

      .drag-el {
        cursor: grab;
        color: black;
        border-radius: 3px;
        padding: 0.5rem;
        background-color: $background;
        font-size: 110%;
        white-space: nowrap;

        &:nth-child(even) {
          background-color: $background-lighter;
        }
      }
    }
  }
}


</style>
