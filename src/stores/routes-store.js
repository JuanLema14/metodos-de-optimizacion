import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRoutesStore = defineStore('routesStore', () => {
  const linkActualMenu = ref([]);

  return {
    linkActualMenu,
  };
});
