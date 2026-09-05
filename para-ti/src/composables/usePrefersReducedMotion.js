import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Expone `prefersReducedMotion` como ref reactivo, no solo como
 * lectura única al montar: si el usuario cambia la preferencia del
 * sistema mientras la pestaña sigue abierta, la experiencia reacciona.
 */
export function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const prefersReducedMotion = ref(false);

  let mediaQueryList = null;

  function handleChange(event) {
    prefersReducedMotion.value = event.matches;
  }

  onMounted(() => {
    mediaQueryList = window.matchMedia(query);
    prefersReducedMotion.value = mediaQueryList.matches;
    mediaQueryList.addEventListener("change", handleChange);
  });

  onBeforeUnmount(() => {
    mediaQueryList?.removeEventListener("change", handleChange);
  });

  return { prefersReducedMotion };
}
