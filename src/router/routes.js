const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'biseccion', component: () => import('pages/MetodoBiseccion.vue') },
      { path: 'falsa-posicion', component: () => import('pages/MetodoFalsaPosicion.vue') },
      { path: 'busqueda-dorada', component: () => import('pages/BusquedaDorada.vue') },
      { path: 'interpolacion-cuadratica', component: () => import('pages/MetodoInterpolacionCuadratica.vue') },
      { path: 'metodo-newton', component: () => import('pages/MetodoNewton.vue') },
      { path: 'metodo-newton-raphson', component: () => import('pages/MetodoNewtonRaphson.vue') },
      { path: 'lagrange', component: () => import('pages/MetodoLagrange.vue') },
      { path: 'maxima-inclinacion', component: () => import('pages/MetodoMaximaInclinacion.vue') },
      { path: 'busqueda-aleatoria', component: () => import('pages/MetodoBusquedaAleatoria.vue') }
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
