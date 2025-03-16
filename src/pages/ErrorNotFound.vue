<template>
  <div class="fullscreen bg-gradient flex flex-center text-white text-center q-pa-md">
    <div>
      <div class="error-code">
        404
      </div>

      <div class="text-h4 opacity-70">
        Oops... Parece que te perdiste.
      </div>

      <div class="text-subtitle1 opacity-50 q-mt-md">
        La página que buscas no existe o fue movida.
      </div>

      <q-btn
        class="q-mt-xl animated-btn"
        color="amber"
        text-color="black"
        unelevated
        to="/"
        label="Volver al inicio"
        no-caps
        icon="home"
      />
    </div>
  </div>
</template>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
}

.error-code {
  font-size: 25vh;
  font-weight: bold;
  text-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
  animation: float 2s ease-in-out infinite alternate;
}

.animated-btn {
  transition: transform 0.3s ease;
}

.animated-btn:hover {
  transform: scale(1.1);
}

@keyframes float {
  from {
    transform: translateY(-10px);
  }
  to {
    transform: translateY(10px);
  }
}
</style>
