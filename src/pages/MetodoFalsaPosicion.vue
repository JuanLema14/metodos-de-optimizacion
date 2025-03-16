<template>
  <q-page padding>
    <q-card class="shadowBox q-ma-sm" style="border-radius: 10px">
      <q-card-section>
        <MathEditor v-model="expresionMatematica" @input="findInitialInterval" />
      </q-card-section>
    </q-card>

    <q-card class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-toolbar>
        <q-avatar square>
          <q-icon name="fas fa-ruler" color="secondary" />
        </q-avatar>
        <q-toolbar-title>
          <span class="text-weight-bolder text-secondary"> Método de Falsa Posición </span>
        </q-toolbar-title>
      </q-toolbar>

      <q-card-section>
        <q-input v-model.number="xl" label="Valor de xl" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="xu" label="Valor de xu" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="tolerance" label="Tolerancia" type="number" outlined class="q-mb-md" />

        <q-btn label="Calcular" color="primary" @click="executeFalsePosition" class="full-width" />
      </q-card-section>
    </q-card>

    <q-card v-if="results.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <q-table :rows="results" :columns="columns" row-key="iteration" bordered dense hide-pagination />
      </q-card-section>
    </q-card>

    <q-card v-if="results.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <PlotlyChart :data="graphData" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, ref, computed } from "vue";
import { evaluate } from "mathjs";

const MathEditor = defineAsyncComponent(() => import("../components/gestion-calculadora/MathEditor.vue"));
const PlotlyChart = defineAsyncComponent(() => import("../components/PlotlyChart.vue"));

const expresionMatematica = ref("");
const xl = ref(null);
const xu = ref(null);
const tolerance = ref(0.0001);
const results = ref([]);

const columns = [
  { name: "iteration", label: "Iteración", field: "iteration", align: "center" },
  { name: "xl", label: "xl", field: "xl", align: "center" },
  { name: "xu", label: "xu", field: "xu", align: "center" },
  { name: "xr", label: "Xr", field: "xr", align: "center" },
  { name: "fxr", label: "f(Xr)", field: "fxr", align: "center" },
  { name: "error", label: "Error", field: "error", align: "center" },
];

const f = (x) => {
  if (!expresionMatematica.value.trim()) return NaN;
  try {
    return evaluate(expresionMatematica.value.replace(/X/g, "x"), { x });
  } catch (error) {
    return NaN;
  }
};

const findInitialInterval = () => {
  for (let i = -10; i < 10; i++) {
    if (f(i) * f(i + 1) < 0) {
      xl.value = i;
      xu.value = i + 1;
      return;
    }
  }
  xl.value = null;
  xu.value = null;
};

const executeFalsePosition = () => {
  if (!expresionMatematica.value || xl.value === null || xu.value === null) {
    alert("Ingrese una función válida y asegúrese de que hay una raíz en el intervalo");
    return;
  }

  let x1 = xl.value;
  let x2 = xu.value;
  let xr, fxr, error;
  let iteration = 0;
  results.value = [];

  do {
    xr = (x1 * f(x2) - x2 * f(x1)) / (f(x2) - f(x1));
    fxr = f(xr);
    error = Math.abs(xr - x1);

    results.value.push({ iteration, xl: x1, xu: x2, xr, fxr, error });

    if (f(x1) * fxr < 0) {
      x2 = xr;
    } else {
      x1 = xr;
    }

    iteration++;
  } while (error > tolerance.value && iteration < 100);
};

const graphData = computed(() => [{
  x: results.value.map((row) => row.iteration),
  y: results.value.map((row) => row.error),
  mode: "lines+markers",
  type: "scatter",
  name: "Error Absoluto",
  line: { shape: "spline", smoothing: 1.3 },
  marker: { color: "blue", size: 6 },
}]);
</script>
