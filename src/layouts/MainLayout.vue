<template>
  <q-layout view="lHh lpR lFf" class="bg-accent">
    <q-header class="bg-accent text-white" height-hint="98">
      <q-toolbar>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above flat class="bg-accent">
      <q-list class="q-ma-sm bg-white" style="border-radius: 8px; height: 97%;">
        <q-toolbar>
          <q-avatar color="primary" text-color="white" icon="fas fa-gears" />

          <div class="q-ml-sm q-mt-md">
            <q-toolbar-title class="text-weight-bolder text-subtitle1">
              Métodos de optimización
            </q-toolbar-title>
            <span class="text-grey-6" style="font-size: 0.8vmax;">Proyecto para curso de optimizacion - 2025-1</span>
          </div>
        </q-toolbar>
        <div class="q-pt-xl">
          <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Bisección',
    icon: 'fas fa-hand-scissors',
    link: 'biseccion'
  },
  {
    title: 'Falsa Posición',
    icon: 'fas fa-ruler',
    link: 'falsa-posicion'
  },
  {
    title: 'Búsqueda Dorada',
    icon: 'fas fa-search-dollar',
    link: 'busqueda-dorada'
  },
  {
    title: 'Interpolación Cuadrática',
    icon: 'fas fa-chart-line',
    link: 'interpolacion-cuadratica'
  },
  {
    title: 'Método de Newton Raphson',
    icon: 'fas fa-calculator',
    link: 'metodo-newton-raphson'
  },
  {
    title: 'Método de Newton',
    icon: 'fas fa-bolt',
    link: 'metodo-newton'
  },
  /* {
    title: 'Lagrange',
    icon: 'fas fa-bezier-curve',
    link: 'lagrange'
  },
  {
    title: 'Máxima Inclinación',
    icon: 'fas fa-arrow-up',
    link: 'maxima-inclinacion'
  },
  {
    title: 'Búsqueda Aleatoria',
    icon: 'fas fa-dice',
    link: 'busqueda-aleatoria'
  } */
];


const leftDrawerOpen = ref(false)
</script>
