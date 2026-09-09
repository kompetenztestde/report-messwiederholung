<script setup lang="ts">

import InfoDialog from "@/components/InfoDialog.vue";

const props = defineProps(
  [
    'source'
  ]
)

</script>

<template>

  <InfoDialog width="60vw" height="80vh" extra-classes="blue info-card">

    <q-card-section>

      <video class="video" style="width: 100%; height: 100%;" autoplay controls>
        <source
          :src="props.source"
          type="video/mp4"
        />

        <p>Your browser doesn't support HTML5 video.</p>
      </video>

    </q-card-section>

  </InfoDialog>

</template>

<style scoped lang="scss">

</style>
