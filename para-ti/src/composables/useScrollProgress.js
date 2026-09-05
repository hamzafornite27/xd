import { computed, onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Convierte la posición de scroll de la página en un valor 0..1.
 * Única fuente de verdad para todo lo que depende del scroll:
 * escena activa, porcentaje, estado "completado", etc. se derivan
 * de `progress` con `computed`, nunca se guardan aparte.
 */
export function useScrollProgress() {
  const progress = ref(0);

  let rafId = 0;
  let ticking = false;

  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
  }

  function calculate() {
    ticking = false;

    const scrollable = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );

    progress.value = clamp(window.scrollY / scrollable);
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    rafId = window.requestAnimationFrame(calculate);
  }

  onMounted(() => {
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.visualViewport?.addEventListener("resize", requestUpdate, {
      passive: true,
    });

    requestUpdate();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    window.visualViewport?.removeEventListener("resize", requestUpdate);

    if (rafId) window.cancelAnimationFrame(rafId);
  });

  const percentage = computed(() => Math.round(progress.value * 100));
  const completed = computed(() => progress.value >= 0.995);

  return { progress, percentage, completed };
}
