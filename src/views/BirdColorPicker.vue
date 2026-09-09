<script setup lang="ts">

import {onUnmounted, onMounted, ref, onUpdated} from 'vue'

import type { BirdPartColorsType } from "@/types/visualTypes";

import {
  get_bird_color_map_from_results,
  BIRD_COLOR_TYPES,
} from "@/views/birdViewUtils";

const props = defineProps(['displayData', 'studentCode']);
const emit = defineEmits(['color-changed', 'closed']);

const birdColorMap = ref<BirdPartColorsType>();

const dialogOpen = ref<boolean>(true);

const on_change = (e: Event, type: string, index: number) => {
  localStorage.setItem(`color-${props.studentCode}-${type}-${index}`, e.target.value);
  emit("color-changed");
};

function getCurrentBirdColors() {
  birdColorMap.value = get_bird_color_map_from_results(props.displayData.allTestsResults)[props.studentCode];
}

onMounted(() => {
  getCurrentBirdColors();
});

onUpdated(() => {
  getCurrentBirdColors();
});

onUnmounted(() => {
});

</script>

<template :ref="displayData">

  <q-dialog class="color-picker-dialog" v-model="dialogOpen" @hide="emit('closed')">
    <q-card class="picker">

      <q-card-section class="header">
        <h5>Gestalte deinen Vogel</h5>
      </q-card-section>

      <div class="color-input-container">
        <div
          v-for="color_type of BIRD_COLOR_TYPES"
          class="color-input-row"
        >
          <div class="color-name">{{color_type.name}}</div>
          <div class="color-input">
            <input
              type="color"
              @change="e => on_change(e, color_type.type, 0)"
              :value="birdColorMap[color_type.type][0]"
            >
            <input
              type="color"
              v-if="color_type.count === 2"
              @change="e => on_change(e, color_type.type, 1)"
              :value="birdColorMap[color_type.type][1]"
            >
          </div>
        </div>
      </div>

    </q-card>
  </q-dialog>

</template>

<style lang="scss">

.color-picker-dialog {

  .q-dialog__backdrop {
    background: none!important;
  }

  .q-card.picker {
    border: 2px solid $primary;
    border-radius: 0.5rem;
    max-width: 17rem;
    background-color: $background-lighter;

    .header {
      background-color: $primary-light;
      height: 3rem;
      padding: 0.5rem;
      padding: 0.5rem;
      padding-left: 1rem;
    }

    .color-input-container {
      padding: 1rem;
      padding-top: 0.35rem;
      padding-bottom: 0.5rem;
      background-color: $background-lighter;
      width: 15rem;

      .color-input-row {
        display: flex;
        padding-bottom: 0.25rem;
        border-bottom: 2px solid $dark-red;
        padding-top: 0.25rem;

        &:first-child {
          padding-top: 0;
        }
        &:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .color-name {
          width: 5rem;
          display: flex;
          align-items: center;
        }
        .color-input {
          input[type="color" i] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 4rem;
            height: 2rem;
            background-color: transparent;
            border: none;
            cursor: pointer;

            &::-webkit-color-swatch {
              border-radius: 15px;
              border: none;
            }
            &::-moz-color-swatch {
              border-radius: 15px;
              border: none;
            }
          }
          input {
            background-color: transparent;
          }
        }
      }
    }
  }
}

</style>

