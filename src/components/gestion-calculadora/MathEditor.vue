<template>
  <div class="q-pa-md">
    <q-input v-model="mathExpression" outlined label="Ingrese la función" class="full-width"
      @update:model-value="emitExpression">
      <template v-slot:append>
        <q-btn icon="backspace" flat round dense @click="clearExpression" />
      </template>
    </q-input>

    <div class="q-mt-md grid-buttons">
      <q-btn v-for="symbol in symbols" :key="symbol.value" :label="symbol.label" unelevated color="primary" dense
        class="q-mb-sm" @click="insertSymbol(symbol.value)" />

      <q-btn label="x²" unelevated color="primary" dense class="q-mb-sm" @click="insertSymbol('x^2')" />

      <q-btn label="x^n" unelevated color="primary" dense class="q-mb-sm" @click="insertExponent" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const mathExpression = ref('')

onMounted(() => {
  mathExpression.value = '2*sin(x)-(x^2/10)'
  emitExpression()
})
const emit = defineEmits(['update:model-value'])

const symbols = [
  { label: '√', value: 'sqrt()' },
  { label: 'π', value: 'pi' },
  { label: '∞', value: 'Infinity' },
  { label: 'sin', value: 'sin()' },
  { label: 'cos', value: 'cos()' },
  { label: 'tan', value: 'tan()' },
  { label: 'log', value: 'log()' },
  { label: 'e', value: 'e' }
]

const insertSymbol = (symbol) => {
  mathExpression.value += symbol
  emitExpression()
}

const insertExponent = () => {
  const exponent = prompt('Ingrese el exponente:')
  if (exponent && !isNaN(exponent)) {
    mathExpression.value += `^${exponent}`
    emitExpression()
  } else {
    alert("Por favor ingrese un número válido")
  }
}

const clearExpression = () => {
  mathExpression.value = ''
  emitExpression()
}

const emitExpression = () => {
  emit('update:model-value', mathExpression.value)
}
</script>

<style scoped>
.grid-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
}
</style>
