<script setup lang="ts">

  const props = defineProps(
    [
      'title',
      'body',
      'avatarSVG',
      'titleClasses',
      "width",
      "height",
      "extraClasses"
    ]
  )
  const dialogOpen = defineModel<boolean>()
  const backdropFilter = 'blur(3px)'

  const qCardStyle = {
    maxWidth: window.innerWidth > 500 ? props.width : "100vw",
    maxHeight: props.height,
    width: props.width
  }


</script>

<template>
  <q-dialog v-model="dialogOpen" :backdrop-filter="backdropFilter" >
    <q-card :style="qCardStyle" :class="props.extraClasses">
      <q-card-section class="row items-center q-pb-none q-pt-none">
        <q-toolbar class="q-px-none">
            <div class="avatar" v-if="avatarSVG" :style="{

              'minHeight': '4rem',
              'minWidth': '4rem',
              'width': '4.25rem',
              'height': '4.25rem',
              'borderRadius': '2.125rem',
              'marginTop': '1rem'

            }">
              <svg
                :class="`bird bird-${avatarSVG.type}`"
                :viewBox="avatarSVG.viewBox"
                :width="`4rem`"
                :height="`4rem`"
              >
                <path
                  v-for="(path, i) in avatarSVG.paths"
                  :key="i"
                  :d="path.d"
                  :style="path.style"
                />
              </svg>
            </div>

          <q-toolbar-title class="q-pl-md q-mt-sm" :class="titleClasses" ><span class="text-weight-bold">{{title}}</span></q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup/>
        </q-toolbar>
      </q-card-section>

      <slot/>

    </q-card>
  </q-dialog>
</template>

<style lang="scss">

.q-card {
  background-color: $background-lighter;
  &.apricot {
    background-color: $background;
  }
  .avatar {
    background-color: white;
    border-radius: 50%;
    border: 2px solid $dark-red;
  }
  &.info-card {
    &.blue {
      background-color: $primary-light;
    }
    .content {
      margin: 1rem;
      margin-top: 0;
      border: 2px solid $primary!important;
      border-radius: 3px;
      background-color: $background-lighter!important;
      a {
        background-color: $background-lighter;
      }
    }
  }
}

</style>
