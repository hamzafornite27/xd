<script setup>
/**
 * Canvas 2D puro. No conoce la historia ni el texto: solo recibe
 * `progress` (0..1) y `reducedMotion`, y dibuja partículas que
 * convergen progresivamente hacia una curva de corazón paramétrica.
 *
 * x = 16 sin³(t)
 * y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  progress: { type: Number, default: 0 },
  reducedMotion: { type: Boolean, default: false },
});

const emit = defineEmits(["ready", "error"]);

const canvasRef = ref(null);

let ctx = null;
let width = 0;
let height = 0;
let dpr = 1;

let rafId = 0;
let lastTime = 0;

let particles = [];
let canRepel = false; // solo dispositivos con puntero fino (ratón)

const pointer = { x: 0.5, y: 0.5, active: false };

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function easeInOutCubic(t) {
  const v = clamp(t);
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
}

function heartPoint(index, total, scale) {
  const t = (Math.PI * 2 * index) / total;
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: x * scale, y: -y * scale };
}

const particleCount = computed(() => {
  const area = width * height;
  if (props.reducedMotion) {
    return Math.min(220, Math.max(90, Math.floor(area / 14000)));
  }
  return Math.min(480, Math.max(160, Math.floor(area / 6200)));
});

function createParticles() {
  const total = particleCount.value;
  const scale = Math.min(width, height) / 40;
  const centerX = width * 0.5;
  const centerY = height * 0.46;

  particles = new Array(total);

  for (let i = 0; i < total; i++) {
    const target = heartPoint(i, total, scale);
    const angle = Math.random() * Math.PI * 2;
    const radius = 60 + Math.random() * Math.max(width, height) * 0.7;

    particles[i] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      targetX: centerX + target.x,
      targetY: centerY + target.y,
      size: 0.7 + Math.random() * 1.5,
      alpha: 0.25 + Math.random() * 0.65,
      phase: Math.random() * Math.PI * 2,
    };
  }
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx) {
    emit("error", new Error("Canvas 2D no disponible"));
    return;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createParticles();
}

function updateParticles(deltaMs) {
  // Normaliza a "frames de 16.67ms" para que la física no dependa del framerate.
  const step = clamp(deltaMs / 16.67, 0.2, 3);

  const eased = easeInOutCubic(props.progress);
  const attraction = lerp(0.006, 0.1, eased);
  const damping = props.reducedMotion ? 0.86 : 0.9;
  const dampingStep = Math.pow(damping, step);

  const breathing =
    props.progress >= 0.995 && !props.reducedMotion
      ? 1 + Math.sin(performance.now() * 0.0012) * 0.012
      : 1;

  const centerX = width * 0.5;
  const centerY = height * 0.46;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];

    const targetX = centerX + (particle.targetX - centerX) * breathing;
    const targetY = centerY + (particle.targetY - centerY) * breathing;

    const dx = targetX - particle.x;
    const dy = targetY - particle.y;

    particle.vx += dx * attraction * step;
    particle.vy += dy * attraction * step;

    if (canRepel && pointer.active && !props.reducedMotion && eased < 0.9) {
      const px = pointer.x * width;
      const py = pointer.y * height;
      const rdx = particle.x - px;
      const rdy = particle.y - py;
      const distance = Math.hypot(rdx, rdy);
      const radius = 110;

      if (distance > 0 && distance < radius) {
        const force = (1 - distance / radius) * 1.6 * step;
        particle.vx += (rdx / distance) * force;
        particle.vy += (rdy / distance) * force;
      }
    }

    particle.vx *= dampingStep;
    particle.vy *= dampingStep;
    particle.x += particle.vx * step;
    particle.y += particle.vy * step;
  }
}

function drawBackground() {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    0,
    width * 0.5,
    height * 0.42,
    Math.max(width, height) * 0.7
  );
  gradient.addColorStop(0, "rgba(255, 111, 145, 0.1)");
  gradient.addColorStop(0.5, "rgba(60, 30, 55, 0.04)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawParticles(time) {
  const visibility = lerp(0.2, 1, easeInOutCubic(props.progress));
  const warm = props.progress > 0.75;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    const twinkle = props.reducedMotion
      ? 1
      : 0.75 + Math.sin(particle.phase + time * 0.001) * 0.25;

    ctx.globalAlpha = particle.alpha * visibility * twinkle;
    ctx.fillStyle = warm ? "#ffb6d1" : "#e9d7e2";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function render(time) {
  if (!ctx) return;

  const delta = time - lastTime || 16;
  lastTime = time;

  ctx.clearRect(0, 0, width, height);
  drawBackground();
  updateParticles(delta);
  drawParticles(time);

  rafId = window.requestAnimationFrame(render);
}

function handlePointerMove(event) {
  pointer.x = event.clientX / width;
  pointer.y = event.clientY / height;
  pointer.active = true;
}

function handlePointerLeave() {
  pointer.active = false;
}

// Si cambia el número "objetivo" de partículas (p.ej. reduced-motion
// se activa a mitad de sesión), reconstruimos sin esperar a un resize.
watch(
  () => props.reducedMotion,
  () => {
    if (ctx) createParticles();
  }
);

onMounted(() => {
  try {
    canRepel = window.matchMedia("(pointer: fine)").matches;

    resize();
    if (!ctx) return;

    window.addEventListener("resize", resize, { passive: true });
    window.visualViewport?.addEventListener("resize", resize, {
      passive: true,
    });

    if (canRepel) {
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
    }

    emit("ready");
    rafId = window.requestAnimationFrame(render);
  } catch (error) {
    emit("error", error);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
  window.visualViewport?.removeEventListener("resize", resize);
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerleave", handlePointerLeave);

  if (rafId) window.cancelAnimationFrame(rafId);
});
</script>

<template>
  <canvas ref="canvasRef" class="heart-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.heart-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
