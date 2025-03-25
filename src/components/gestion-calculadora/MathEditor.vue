<template>
  <div class="q-pa-md">
    <q-input
      v-model="mathExpression"
      outlined
      label="Ingrese la función"
      class="full-width"
      @update:model-value="emitExpression"
    >
      <template v-slot:append>
        <q-btn icon="backspace" flat round dense @click="clearExpression" />
      </template>
    </q-input>

    <div class="q-mt-md grid-buttons">
      <q-btn
        v-for="symbol in symbols"
        :key="symbol.value"
        :label="symbol.label"
        unelevated
        color="primary"
        dense
        class="q-mb-sm"
        @click="insertSymbol(symbol.value)"
      />

      <!-- Corregir el botón de x² para usar ^2 en vez de caracteres Unicode -->
      <q-btn label="x²" unelevated color="primary" dense class="q-mb-sm" @click="insertSymbol('x^2')" />

      <!-- Botón de x^n corregido para asegurarse de que el usuario ingrese un número -->
      <q-btn label="x^n" unelevated color="primary" dense class="q-mb-sm" @click="insertExponent" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mathExpression = ref('')
const emit = defineEmits(['update:model-value'])

const symbols = [
  { label: '√', value: 'sqrt()' }, // Corrección: mathjs usa sqrt()
  { label: 'π', value: 'pi' }, // Corrección: mathjs usa "pi", no "π"
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
  if (exponent && !isNaN(exponent)) { // Validar que sea un número
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
