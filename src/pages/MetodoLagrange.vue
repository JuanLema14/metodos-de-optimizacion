<template>
  <q-page padding>
    <q-card class="shadowBox q-ma-sm" style="border-radius: 10px">
      <q-card-section>
        <MathEditor v-model="expresionMatematica" />
      </q-card-section>
    </q-card>
    <q-card class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-toolbar>
        <q-avatar square>
          <q-icon name="fas fa-bezier-curve" color="secondary"/>
        </q-avatar>

        <q-toolbar-title>
          <span class="text-weight-bolder text-secondary">
            Metodo de Lagrange
          </span>
        </q-toolbar-title>
      </q-toolbar>
    </q-card>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, ref } from "vue";

const expresionMatematica = ref('')

const MathEditor = defineAsyncComponent(() => import('../components/gestion-calculadora/MathEditor.vue'));
</script>
