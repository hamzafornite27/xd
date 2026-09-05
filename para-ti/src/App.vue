<script setup>
/**
 * App.vue compone la experiencia pero no calcula física ni sabe
 * dibujar nada: eso vive en HeartCanvas. Aquí solo hay estado
 * mínimo (`status`, `finalMessageVisible`, `revealExtra`) más los
 * `computed` que derivan todo lo demás de `progress`.
 */
import { computed, ref } from "vue";
import HeartCanvas from "./components/HeartCanvas.vue";
import { useScrollProgress } from "./composables/useScrollProgress";
import { usePrefersReducedMotion } from "./composables/usePrefersReducedMotion";
import { FINAL_MESSAGE, STORY } from "./data/story";

// "loading" -> "ready" | "empty" | "error"
const status = ref(STORY.length ? "loading" : "empty");
const finalMessageVisible = ref(false);
const revealExtra = ref(false);

// IDs de escenas cuya foto todavía no existe o no ha cargado bien.
// Se muestra un marcador en vez de un icono de imagen rota.
const failedImages = ref(new Set());

const { progress, percentage, completed } = useScrollProgress();
const { prefersReducedMotion } = usePrefersReducedMotion();

const currentScene = computed(() => {
  if (!STORY.length) return null;

  let scene = STORY[0];
  for (const candidate of STORY) {
    if (progress.value >= candidate.at) scene = candidate;
  }
  return scene;
});

const isFirstScene = computed(
  () => currentScene.value?.id === STORY[0]?.id
);

const showFinalButton = computed(
  () => completed.value && !finalMessageVisible.value
);

function handleCanvasReady() {
  status.value = STORY.length ? "ready" : "empty";
}

function handleCanvasError(error) {
  console.error("HeartCanvas no pudo iniciarse:", error);
  status.value = "error";
}

function scrollToStory() {
  // El contenedor de la historia ya está a la vista (top: 0), así que
  // "avanzar" significa desplazar el scroll, no apuntar a un elemento.
  window.scrollBy({
    top: window.innerHeight * 0.85,
    behavior: prefersReducedMotion.value ? "auto" : "smooth",
  });
}

function handleImageError(sceneId) {
  // Reasignamos .value (en vez de mutar in-place) para que Vue detecte el cambio.
  const next = new Set(failedImages.value);
  next.add(sceneId);
  failedImages.value = next;
}

function openFinalMessage() {
  finalMessageVisible.value = true;
}

function closeFinalMessage() {
  finalMessageVisible.value = false;
  revealExtra.value = false;
}
</script>

<template>
  <main class="app">
    <section
      v-if="status === 'loading'"
      class="state-screen"
      aria-label="Cargando experiencia"
    >
      <p class="state-icon" aria-hidden="true">♡</p>
      <p>preparando una pequeña sorpresa…</p>
    </section>

    <section
      v-else-if="status === 'empty'"
      class="state-screen"
      aria-live="polite"
    >
      <p class="state-icon" aria-hidden="true">♡</p>
      <h1>Todavía no hay nada que contar aquí.</h1>
      <p>Vuelve un poco más tarde.</p>
    </section>

    <section
      v-else-if="status === 'error'"
      class="state-screen"
      role="alert"
    >
      <p class="state-icon" aria-hidden="true">·</p>
      <h1>Esto no ha querido cargar bien.</h1>
      <p>Prueba a recargar la página o abrirla en otro navegador.</p>
    </section>

    <article v-else id="historia" class="experience">
      <HeartCanvas
        :progress="progress"
        :reduced-motion="prefersReducedMotion"
        @ready="handleCanvasReady"
        @error="handleCanvasError"
      />

      <div class="progress-track" aria-hidden="true">
        <span :style="{ transform: `scaleX(${progress})` }"></span>
      </div>

      <header class="topbar">
        <span>para ti, Luna ♡</span>
        <span aria-hidden="true">{{ percentage }}%</span>
      </header>

      <div class="story-stage">
        <Transition name="scene" mode="out-in">
          <div :key="currentScene?.id" class="story-card">
            <p v-if="currentScene?.whisper" class="whisper">
              {{ currentScene.whisper }}
            </p>

            <figure v-if="currentScene?.image" class="memory-visual">
              <img
                v-if="!failedImages.has(currentScene.id)"
                :src="currentScene.image"
                :alt="currentScene.alt || currentScene.text"
                class="memory-image"
                loading="lazy"
                decoding="async"
                @error="handleImageError(currentScene.id)"
              />
              <div
                v-else
                class="memory-placeholder"
                role="img"
                :aria-label="currentScene.alt || currentScene.text"
              >
                <span aria-hidden="true">♡</span>
                <p>añade tu foto en<br /><code>{{ currentScene.image }}</code></p>
              </div>
            </figure>

            <h1 v-if="currentScene?.title">{{ currentScene.title }}</h1>

            <p
              class="scene-text"
              :class="{ 'scene-text--caption': currentScene?.image }"
            >
              {{ currentScene?.text }}
            </p>

            <p v-if="currentScene?.signature" class="scene-signature">
              {{ currentScene.signature }}
            </p>

            <button
              v-if="isFirstScene"
              type="button"
              class="button button--primary"
              @click="scrollToStory"
            >
              seguir ♡
            </button>
          </div>
        </Transition>
      </div>

      <p class="scroll-hint" aria-hidden="true">
        <span>desliza lentamente</span>
        <span class="scroll-hint__arrow">↓</span>
      </p>

      <div v-if="showFinalButton" class="final-trigger">
        <button
          type="button"
          class="button button--primary"
          @click="openFinalMessage"
        >
          {{ FINAL_MESSAGE.buttonLabel }}
        </button>
      </div>

      <Transition name="final">
        <section
          v-if="finalMessageVisible"
          class="final-overlay"
          aria-live="polite"
          aria-label="Mensaje final"
        >
          <div class="final-card">
            <h2>{{ FINAL_MESSAGE.title }}</h2>
            <p>{{ FINAL_MESSAGE.text }}</p>

            <Transition name="fade">
              <div v-if="revealExtra" class="final-extra">
                <p>{{ FINAL_MESSAGE.reveal.text }}</p>
                <p class="final-signature">
                  {{ FINAL_MESSAGE.reveal.signature }}
                </p>
              </div>
            </Transition>

            <div class="final-actions">
              <button
                v-if="!revealExtra"
                type="button"
                class="button button--ghost"
                @click="revealExtra = true"
              >
                ¿una cosa más?
              </button>
              <button
                type="button"
                class="button button--ghost"
                @click="closeFinalMessage"
              >
                cerrar
              </button>
            </div>
          </div>
        </section>
      </Transition>
    </article>
  </main>
</template>
