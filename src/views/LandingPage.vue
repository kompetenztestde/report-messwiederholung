<script setup lang="ts">

</script>

<template>
  <div>
    <h1>
      Herzlich Willkommen Frau Kür
    </h1>

    <q-expansion-item
      class="overflow-hidden item"
      header-class="bg-primary text-white"
      header-style="font-size: 1.5rem"
      expand-separator
      label="Rückmeldungen"
      expand-icon-class="text-white"
      style="border-radius: 30px"
    >
      <q-card
        class="emphasis-card"
      >
      <div class="flex-container">

        <div class="container" style="margin-bottom: 2rem">
          <h4>Klassen</h4>
          <button>Klasse 2d</button>
          <button>Klasse 3b</button>
          <button>Klasse 3c</button>
        </div>
        <q-separator size="4px" color="primary" style="margin: 1rem" vertical/>
        <div class="container">
          <h4 style="margin-left: 1rem">Fächer</h4>
          <div class="flex-container" style="padding-top: 0">
            <div class="container">
              <h5 style="margin-bottom: 0.5rem">Deutsch</h5>
              <button>Lesen Speedtest</button>
              <button>Wortschatz</button>
              <button>Grammatik</button>
            </div>
            <div class="container">
              <h5 style="margin-bottom: 0.5rem">Mathe</h5>
              <button>Zahlenlogik</button>
              <button>Mengenverständnis</button>
              <button>Stochastik</button>
            </div>

          </div>
        </div>
      </div>
      </q-card>
    </q-expansion-item>
    <q-expansion-item
      class="overflow-hidden item"
      header-class="bg-primary text-white"
      header-style="font-size: 1.5rem"
      expand-separator
      label="Zeugnissätze"
      expand-icon-class="text-white"
      style="border-radius: 30px"
    >
      <q-card
        class="emphasis-card"
      >
        <div class="flex-container container">
          <button>Klasse 2d</button>
          <button>Klasse 3b</button>
          <button>Klasse 3c</button>
        </div>
      </q-card>
    </q-expansion-item>

    <q-expansion-item
      class="overflow-hidden item"
      header-class="bg-primary text-white"
      header-style="font-size: 1.5rem"
      expand-separator
      label="Elterngespräche"
      expand-icon-class="text-white"
      style="border-radius: 30px"
    >
      <q-card
        class="emphasis-card"
      >
        <div class="flex-container container">
          <button>Klasse 2d</button>
          <button>Klasse 3b</button>
          <button>Klasse 3c</button>
        </div>
      </q-card>
    </q-expansion-item>
  </div>

</template>

<style scoped lang="scss">
.item {
  margin-bottom: 2rem;
}
  h3, h4, h5 {
    margin-top: 0;
    margin-bottom: 2rem;
    background-color: #0352a0;
    padding: 0.5rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    border-radius: 5rem;
    color: #fff;
    width: fit-content;
  }
  .emphasis-card {
    background-color: $background;
  }
  .flex-container {
    display: flex;
    padding: 1rem;
    border-radius: 1rem;
  }
  .container {

    button {
      margin-right: 1rem;
      margin-top: 0.5rem;
      color: white;
      padding: 0.5rem;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      border-radius: 9px;
      background-color: $primary;
    }
  }
</style>
