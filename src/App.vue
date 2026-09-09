<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import birdLogo from '@/assets/extract/bird-logo.png';


  let showMenu = !window.location.href.endsWith("schuelerin-detail")
  let showLogOut = window.location.href.endsWith("landing")

</script>

<template>
  <q-layout view="hHh lpr fFf" class="full-width">
    <q-header v-show="showMenu" elevated class="text-white pr-0!">
      <q-toolbar class="w-fit!">
          <a href="/">
            <img alt="Logo" class="logo" :src="birdLogo" width="42" height="42" />
          </a>
      </q-toolbar>
      <q-tabs align="right">
        <q-route-tab to="/" label="grafik"/>
        <q-route-tab to="/tabelle" label="Tabelle"/>
        <q-route-tab to="/zeugnissaetze" label="Zeugnissätze"/>
      </q-tabs>
      <!--<q-separator color="white" vertical inset/>
      <span style="display: flex; margin-left: 1rem">Logout
        <q-icon style="margin-left: 0.5rem; margin-right: 1rem" size="24px" name="logout"/>
      </span> -->
    </q-header>

  <q-page-container style="padding: unset">
    <RouterView />
  </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">

#app {

  font-weight: normal;
  display: flex;
  place-items: center;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;

  header {
    position: relative;
  }

  .q-page-container {
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 0.5rem!important;
    @media (min-width: $breakpoint-md-min) {
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
      padding: 2rem!important;
    }

  }
}

.logo {
  display: block;
  border: 3px solid $dark-red;
  border-radius: 50%;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
  }
}
</style>
