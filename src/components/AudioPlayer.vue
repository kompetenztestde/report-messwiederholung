<script setup lang="ts">

import {onUnmounted, onMounted, ref, onUpdated} from 'vue'

const props = defineProps(
  [
    'caption',
    'audioFile',
    'circleColor',
    'ringColor'
  ]
)

const audio = new Audio(props.audioFile)

const time = ref<string>()
const length = ref<string>()
const current = ref<string>("0:00")
const playing = ref<Boolean>(false)
const progressBarStyle = ref<{ width: string }>({width: "0"})

const timelineInterval = setInterval(() => {

  progressBarStyle.value.width = audio.currentTime / audio.duration * 100 + "%";
  time.value, current.value = getTimeCodeFromNum(
    audio.currentTime
  );
  if (current.value === length.value && playing.value) {
    progressBarStyle.value.width = "100%";
    playing.value = false;
  }
}, 100);

onMounted(() => {

  audio.addEventListener(
    "loadeddata",
    () => onLoadedData(),
    false
  );
})

onUnmounted(()=>{
  clearInterval(timelineInterval)
})


function onLoadedData() {
  time.value, length.value = getTimeCodeFromNum(
    audio.duration
  );
}



function onClickTimeline(e) {
  const timeline = document.querySelector(".timeline");
  const timelineWidth = window.getComputedStyle(timeline).width;
  const timeToSeek = e.offsetX / parseInt(timelineWidth) * audio.duration;
  audio.currentTime = timeToSeek;
  onClickPlay(false)
}


function onClickPlay(togglePlay: boolean) {
  if (togglePlay) {
    if (audio.paused) {
      playing.value = true;
      audio.play();
    } else {
      playing.value = false;
      audio.pause();
    }
  }
}


//turn 128 seconds into 2:08
function getTimeCodeFromNum(num: number) {
  let seconds: number = Math.floor(num);
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  const hours = Math.floor(minutes / 60);
  minutes -= hours * 60;

  if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, 0)}`;
  return `${String(hours).padStart(2, 0)}:${minutes}:${String(
    seconds % 60
  ).padStart(2, 0)}`;
}


</script>

<template>
  <div class="audio-player">
    <div class="play-container">
      <div class="play-button" @click="onClickPlay(true)">
        <q-icon size="3rem" v-if="!playing" name="play_circle"></q-icon>
        <q-icon size="3rem" v-else name="pause_circle"></q-icon>
      </div>
    </div>
    <div class="right-container">
      <div class="timeline" @click="onClickTimeline">
        <div class="progress" :style="progressBarStyle"></div>
      </div>
      <div class="controls">
        <div class="time">
          <span>{{current}}</span>
          <span>/</span>
          <span>{{length}}</span>
        </div>
        <div v-show="props.caption"><q-icon name="smile"/>{{props.caption}}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">


.audio-player {
  width: 100%;
  background: $primary;
  box-shadow: 0 0 20px 0 #000a;

  color: white;
  font-size: 0.75em;
  overflow: hidden;

  border-radius: 8rem;
  display: flex;

  .play-container {
    display: flex;
    padding-left: 0.5rem;
    .play-button {
      cursor: pointer;
      align-self: center;
      &:hover {
        transform: scale(1.1);
      }

    }
  }
  .right-container {
    width: 100%;
    margin-top: 0.5rem;
    .timeline {
      margin-top: 1.2rem;
      height: 0.75rem;
      background: white;
      width: 97%;
      position: relative;
      cursor: pointer;
      box-shadow: 0 2px 10px 0 #0008;
      border-radius: 2px;
      margin-left: auto;
      margin-right: auto;
      border: 2px solid $background;

      .progress {
        background: $dark-red;
        width: 0;
        height: 100%;
        transition: 0.25s;
      }
    }

    .controls {
      display: flex;
      margin-top: 0.25rem;
      justify-content: space-between;
      align-items: stretch;
      padding: 0 2rem;
      padding-bottom: 0.25rem;
      font-size: 16px;
      .time {

        margin-left: auto;
        margin-right: auto;
      }
    }
  }
}


</style>
