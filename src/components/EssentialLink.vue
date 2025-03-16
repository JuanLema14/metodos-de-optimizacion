<template>
  <q-item clickable @click="irAlLink(link)" :class="validarClick(link)">
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" :color="iconoColor" />
    </q-item-section>

    <q-item-section>
      <q-item-label :class="textoColorClase">{{ props.title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { ref } from "vue";
import { useRoutesStore } from "stores/routes-store.js";
import { useRouter } from "vue-router";

const routesStore = useRoutesStore();

const iconoColor = ref('dark')
const claseLinkSeleccionado = ref('')
const textoColorClase = ref('text-dark')

const router = useRouter();
const props = defineProps({
  title: {
    type: String,
    required: true
  },

  caption: {
    type: String,
    default: ''
  },

  link: {
    type: String,
    default: '#'
  },

  icon: {
    type: String,
    default: ''
  }
})

function validarClick(link) {
  if (routesStore.linkActualMenu.length) {
    if (routesStore.linkActualMenu.includes(link)) {
      iconoColor.value = "primary";
      textoColorClase.value = "text-primary";
      return "seleccionado"
    } else {
      textoColorClase.value = "text-dark";
      iconoColor.value = "dark";
      return ""
    }
  } else {
    return "";
  }
}

async function irAlLink(link) {
  try {
    routesStore.linkActualMenu = [];
    routesStore.linkActualMenu.push(link);
    router.push(link);
  } catch (error) {
    console.error(error);
    $q.notify({
      progress: true,
      message: "Error al momento de redirigir a la página. ",
      icon: "warning",
      color: "white",
      textColor: "negative",
    });
  }
}
</script>

<style>
.seleccionado {
  border-left: 3px solid #8e91f0;
}
</style>
