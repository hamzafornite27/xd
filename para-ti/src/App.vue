<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import HeartCanvas from "./components/HeartCanvas.vue";
import { useScrollProgress } from "./composables/useScrollProgress";
import { usePrefersReducedMotion } from "./composables/usePrefersReducedMotion";
import { FINAL_MESSAGE, STORY } from "./data/story";

const status = ref(STORY.length ? "loading" : "empty");
const finalMessageVisible = ref(false);
const revealExtra = ref(false);
const activeMemory = ref(null);
const failedImages = ref(new Set());

const { progress, percentage, completed } = useScrollProgress();
const { prefersReducedMotion } = usePrefersReducedMotion();

const memories = computed(() => STORY.filter((scene) => scene.image));

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

const memoryIndex = computed(() => {
  const index = memories.value.findIndex(
    (memory) => memory.id === currentScene.value?.id
  );
  return index >= 0 ? index : -1;
});

const activeMemoryIndex = computed(() => {
  if (!activeMemory.value) return -1;
  return memories.value.findIndex((memory) => memory.id === activeMemory.value.id);
});

const memoryLabel = computed(() => {
  if (memoryIndex.value < 0) return "";
  return `recuerdo ${memoryIndex.value + 1} de ${memories.value.length}`;
});

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
  window.scrollBy({
    top: window.innerHeight * 0.82,
    behavior: prefersReducedMotion.value ? "auto" : "smooth",
  });
}

function handleImageError(sceneId) {
  const next = new Set(failedImages.value);
  next.add(sceneId);
  failedImages.value = next;
}

function openMemory(scene) {
  if (!scene?.image || failedImages.value.has(scene.id)) return;
  activeMemory.value = scene;
  nextTick(() => {
    document.querySelector(".memory-lightbox__close")?.focus();
  });
}

function closeMemory() {
  activeMemory.value = null;
}

function nextMemory() {
  if (activeMemoryIndex.value < 0) return;
  const next = memories.value[activeMemoryIndex.value + 1];
  if (!next) return;
  openMemory(next);
}

function previousMemory() {
  if (activeMemoryIndex.value <= 0) return;
  const previous = memories.value[activeMemoryIndex.value - 1];
  openMemory(previous);
}

function openFinalMessage() {
  finalMessageVisible.value = true;
}

function closeFinalMessage() {
  finalMessageVisible.value = false;
  revealExtra.value = false;
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    if (activeMemory.value) closeMemory();
    if (finalMessageVisible.value) closeFinalMessage();
  }

  if (activeMemory.value) {
    if (event.key === "ArrowRight") nextMemory();
    if (event.key === "ArrowLeft") previousMemory();
  }
}

watch(
  () => [activeMemory.value, finalMessageVisible.value],
  ([memoryOpen, finalOpen]) => {
    document.body.classList.toggle("is-locked", Boolean(memoryOpen || finalOpen));
  },
  { immediate: true }
);

watch(
  () => currentScene.value?.id,
  (id) => {
    if (!id) return;
    if (id.startsWith("memory-") && id !== "memory-closing") {
      // Al entrar en un recuerdo, el indicador visual respira una sola vez.
      document.documentElement.style.setProperty(
        "--memory-glow",
        String(0.85 + memoryIndex.value * 0.03)
      );
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.classList.remove("is-locked");
});
</script>

<template>
  <main class="app">
    <article
      v-if="status === 'loading' || status === 'ready'"
      id="historia"
      class="experience"
      :class="{ 'experience--loading': status === 'loading' }"
      :aria-busy="status === 'loading'"
    >
      <HeartCanvas
        :progress="progress"
        :reduced-motion="prefersReducedMotion"
        @ready="handleCanvasReady"
        @error="handleCanvasError"
      />

      <div class="ambient-orbit ambient-orbit--one" aria-hidden="true"></div>
      <div class="ambient-orbit ambient-orbit--two" aria-hidden="true"></div>

      <div class="progress-track" aria-hidden="true">
        <span :style="{ transform: `scaleX(${progress})` }"></span>
      </div>

      <header class="topbar">
        <span>para ti, Luna ♡</span>
        <span aria-hidden="true">{{ percentage }}%</span>
      </header>

      <div class="chapter-dots" aria-hidden="true">
        <span
          v-for="scene in STORY"
          :key="scene.id"
          :class="{ active: progress >= scene.at }"
        ></span>
      </div>

      <div class="story-stage">
        <Transition name="scene" mode="out-in">
          <div :key="currentScene?.id" class="story-card">
            <div
              v-if="currentScene?.image"
              class="memory-kicker"
              aria-hidden="true"
            >
              <span>{{ memoryLabel }}</span>
              <i></i>
              <span>guárdalo aquí</span>
            </div>

            <p v-if="currentScene?.whisper" class="whisper">
              {{ currentScene.whisper }}
            </p>

            <div v-if="currentScene?.image" class="memory-hall">
              <button
                v-for="(memory, index) in memories"
                :key="memory.id"
                type="button"
                class="memory-node"
                :class="{
                  'memory-node--active': memory.id === currentScene.id,
                  'memory-node--seen': progress >= memory.at,
                  'memory-node--disabled': failedImages.has(memory.id),
                }"
                :aria-label="`Abrir ${memory.alt || `recuerdo ${index + 1}`}`"
                :disabled="failedImages.has(memory.id)"
                @click="openMemory(memory)"
              >
                <span class="memory-node__index">{{ String(index + 1).padStart(2, "0") }}</span>
                <span class="memory-node__frame">
                  <img
                    v-if="!failedImages.has(memory.id)"
                    :src="memory.image"
                    :alt="memory.alt"
                    loading="eager"
                    decoding="async"
                    @error="handleImageError(memory.id)"
                  />
                  <span v-else class="memory-node__fallback">♡</span>
                </span>
                <span class="memory-node__caption">abrir</span>
              </button>

              <span
                v-for="index in memories.length - 1"
                :key="`arrow-${index}`"
                class="memory-arrow"
                aria-hidden="true"
              >
                <span>→</span>
              </span>
            </div>

            <figure
              v-if="currentScene?.image"
              class="memory-hero"
              :class="{ 'memory-hero--clickable': !failedImages.has(currentScene.id) }"
            >
              <button
                v-if="!failedImages.has(currentScene.id)"
                type="button"
                class="memory-hero__button"
                @click="openMemory(currentScene)"
              >
                <img
                  :src="currentScene.image"
                  :alt="currentScene.alt || currentScene.text"
                  class="memory-image"
                  loading="eager"
                  decoding="async"
                  @error="handleImageError(currentScene.id)"
                />
                <span class="memory-hero__shine" aria-hidden="true"></span>
                <span class="memory-hero__open">toca para ampliar ↗</span>
              </button>

              <div v-else class="memory-placeholder">
                <span aria-hidden="true">♡</span>
                <p>
                  Añade tu foto en<br />
                  <code>{{ currentScene.image }}</code>
                </p>
              </div>
            </figure>

            <h1 v-if="currentScene?.title">{{ currentScene.title }}</h1>

            <p
              v-if="currentScene?.text"
              class="scene-text"
              :class="{ 'scene-text--caption': currentScene?.image }"
            >
              {{ currentScene.text }}
            </p>

            <p v-if="currentScene?.signature" class="scene-signature">
              {{ currentScene.signature }}
            </p>

            <div v-if="currentScene?.image" class="memory-progress" aria-hidden="true">
              <span
                :style="{
                  width: `${((memoryIndex + 1) / memories.length) * 100}%`,
                }"
              ></span>
            </div>

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

      <div v-if="status === 'loading'" class="loading-overlay">
        <div class="loading-orbit" aria-hidden="true">
          <span></span>
        </div>
        <p>preparando una pequeña sorpresa…</p>
      </div>

      <div v-if="showFinalButton" class="final-trigger">
        <button
          type="button"
          class="button button--primary button--final"
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
            <p class="final-card__eyebrow">llegaste hasta aquí</p>
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

            <div class="final-heart" aria-hidden="true">♥</div>

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

      <Transition name="lightbox">
        <section
          v-if="activeMemory"
          class="memory-lightbox"
          aria-label="Recuerdo ampliado"
          @click.self="closeMemory"
        >
          <button
            type="button"
            class="memory-lightbox__close"
            aria-label="Cerrar recuerdo"
            @click="closeMemory"
          >
            ×
          </button>

          <button
            type="button"
            class="memory-lightbox__nav memory-lightbox__nav--left"
            :disabled="activeMemoryIndex <= 0"
            aria-label="Recuerdo anterior"
            @click="previousMemory"
          >
            ←
          </button>

          <figure class="memory-lightbox__figure">
            <img
              :src="activeMemory.image"
              :alt="activeMemory.alt || activeMemory.text"
            />
            <figcaption>
              <span>recuerdo {{ activeMemoryIndex + 1 }} / {{ memories.length }}</span>
              <strong>{{ activeMemory.text }}</strong>
            </figcaption>
          </figure>

          <button
            type="button"
            class="memory-lightbox__nav memory-lightbox__nav--right"
            :disabled="activeMemoryIndex >= memories.length - 1"
            aria-label="Siguiente recuerdo"
            @click="nextMemory"
          >
            →
          </button>
        </section>
      </Transition>
    </article>

    <section
      v-else-if="status === 'empty'"
      class="state-screen"
      aria-live="polite"
    >
      <p class="state-icon" aria-hidden="true">♡</p>
      <h1>Todavía no hay nada que contar aquí.</h1>
      <p>Vuelve un poco más tarde.</p>
    </section>

    <section v-else class="state-screen" role="alert">
      <p class="state-icon" aria-hidden="true">·</p>
      <h1>Esto no ha querido cargar bien.</h1>
      <p>Prueba a recargar la página o abrirla en otro navegador.</p>
    </section>
  </main>
</template>
