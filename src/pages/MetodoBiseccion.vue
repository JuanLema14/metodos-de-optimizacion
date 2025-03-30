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
          <q-icon name="fas fa-hand-scissors" color="secondary" />
        </q-avatar>
        <q-toolbar-title>
          <span class="text-weight-bolder text-secondary"> Método de Bisección </span>
        </q-toolbar-title>
      </q-toolbar>

      <q-card-section>
        <q-input v-model.number="xl" label="Valor de xl" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="xu" label="Valor de xu" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="tolerance" label="Tolerancia" type="number" outlined class="q-mb-md" />

        <q-btn label="Calcular" color="primary" @click="executeBisection" class="full-width" />
        <q-btn label="Exportar Resultados" color="secondary" @click="exportResults" class="full-width q-mt-md" />
      </q-card-section>
    </q-card>

    <q-card v-if="results.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <q-table
          :rows="results"
          :columns="columns"
          row-key="iteration"
          bordered

          dense
        />
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
import { defineAsyncComponent, ref, computed, watch } from "vue";
import { evaluate } from "mathjs";
import { exportFile } from "quasar";

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
  { name: "xm", label: "Xm", field: "xm", align: "center" },
  { name: "fxm", label: "f(Xm)", field: "fxm", align: "center" },
  { name: "error", label: "Error", field: "error", align: "center" },
];

const f = (x) => {
  if (!expresionMatematica.value || expresionMatematica.value.trim() === "") {
    console.error("Error: La función está vacía.");
    return NaN;
  }

  try {
    return evaluate(expresionMatematica.value.replace(/X/g, "x"), { x });
  } catch (error) {
    console.error("Error al evaluar la función:", error);
    return NaN;
  }
};

const findInterval = (range = 50, step = 0.5, maxIterations = 200) => {
  let start = -range, end = range;
  let prevX = start, prevY = f(prevX);

  for (let i = 0, x = start + step; x <= end && i < maxIterations; x += step, i++) {
    let y = f(x);
    if (prevY * y < 0) {
      xl.value = prevX;
      xu.value = x;
      return;
    }
    prevX = x;
    prevY = y;
  }

  xl.value = null;
  xu.value = null;
  console.warn("No se encontró un intervalo con cambio de signo en el rango dado.");
};


watch(expresionMatematica, () => {
  if (expresionMatematica.value) {
    findInterval();
  }
});

const executeBisection = () => {
  if (!expresionMatematica.value || xl.value === null || xu.value === null) {
    alert("Ingrese una función válida y asegúrese de que hay una raíz en el intervalo");
    return;
  }

  let x1 = xl.value;
  let x2 = xu.value;
  let xm, fxm, error;
  let iteration = 0;
  results.value = [];

  if (f(x1) * f(x2) >= 0) {
    alert("El intervalo seleccionado no encierra una raíz. Elija otro xl y xu.");
    return;
  }

  do {
    xm = (x1 + x2) / 2;
    fxm = f(xm);
    error = Math.abs((x2 - x1) / xm);

    results.value.push({ iteration, xl: x1, xu: x2, xm, fxm, error });

    if (fxm === 0) {
      break;
    } else if (f(x1) * fxm < 0) {
      x2 = xm;
    } else {
      x1 = xm;
    }

    iteration++;
  } while (error > tolerance.value && iteration < 100);
};

const graphData = computed(() => {
  return [
    {
      x: results.value.map((row) => row.iteration),
      y: results.value.map((row) => row.error),
      mode: "lines+markers",
      type: "scatter",
      name: "Error Absoluto",
      line: { shape: "spline", smoothing: 1.3 },
      marker: { color: "red", size: 6 },
    },
  ];
});

const exportResults = () => {
  const headers = ["Iteración", "xl", "xu", "Xm", "f(Xm)", "Error"];
  const content = results.value.map(row =>
    [row.iteration, row.xl, row.xu, row.xm, row.fxm, row.error].join(";")
  ).join("\n");

  const csv = `${headers.join(";")}\n${content}`;
  exportFile("biseccion_resultados.csv", csv, "text/csv");
};
</script>
