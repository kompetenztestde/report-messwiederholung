<script setup lang="ts">

const props = defineProps(
  [
    'iconColor',
    'iconName',
    'innerIconName',
  ]
)

let iconColor = props.iconColor ? props.iconColor : "primary"

</script>

<template>

  <q-btn flat round :color="iconColor" :style="{minHeight: '0', minWidth: '0'}">
    <q-icon name="info"></q-icon>
    <q-popup-proxy>
      <q-banner>
        <template v-slot:avatar class="q-my-auto">
          <q-icon :name="innerIconName ? innerIconName : 'engineering'" color="primary" />
        </template>
        <div class="content">
          <slot/>
        </div>
      </q-banner>
    </q-popup-proxy>
  </q-btn>

</template>

<style lang="scss">

.q-banner__avatar {
  margin-top: auto;
  margin-bottom: auto;
}

.q-banner {
  background-color: $background!important;
  padding: 0.5rem!important;
  .q-banner__avatar {
    margin: auto;
  }
  .q-banner__avatar:not(:empty) + .q-banner__content {
    padding-left: 0.5rem!important;
  }
  .content {
    background-color: $background-lighter;
    padding: 0.5rem;
    border: 2px solid $primary;
    border-radius: 3px;
    max-width: 57rem;
    p {
      margin-bottom: 0.5rem;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

</style>
