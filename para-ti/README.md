# Para ti ♡

Una pequeña experiencia narrativa controlada por scroll, hecha con Vue 3 +
Canvas 2D. Sin backend, sin librerías de animación, sin dependencias
innecesarias.

## Añadir vuestras fotos (sección de recuerdos)

La experiencia incluye 5 escenas de recuerdos con foto + frase, definidas en
`src/data/story.js`. Para ponerlas:

1. Copia tus 5 fotos a `public/images/` con estos nombres exactos:
   `recuerdo-1.jpg`, `recuerdo-2.jpg`, `recuerdo-3.jpg`, `recuerdo-4.jpg`,
   `recuerdo-5.jpg`.
2. Si usas `.png` o `.webp` en vez de `.jpg`, actualiza la ruta `image` de
   cada escena correspondiente en `src/data/story.js`.
3. Edita también el campo `alt` de cada escena para que describa la foto real
   (el texto alternativo no debería limitarse a repetir la cita).

Mientras no añadas una foto, esa escena muestra un marcador ("añade tu foto
en…") en vez de un icono de imagen rota — así puedes revisar el resto de la
experiencia sin que se vea a medio terminar.

## Arquitectura

```
src/
├── App.vue                          orquesta estados, escenas e interacción final
├── main.js                          punto de entrada
├── style.css                        layout fluido, safe-area, accesibilidad
├── components/
│   └── HeartCanvas.vue              Canvas 2D: partículas + corazón procedural
├── composables/
│   ├── useScrollProgress.js         scroll de la página → progress 0..1
│   └── usePrefersReducedMotion.js   preferencia de movimiento reactiva
└── data/
    └── story.js                    textos de la historia (sin lógica)
```

Principio rector: **una sola fuente de verdad**. Todo el estado deriva de
`progress` (0 a 1) mediante `computed`; no existen variables paralelas como
`scrollPercent`, `sceneIndex` o `isComplete` guardadas por separado.

`HeartCanvas` no sabe nada de la historia: solo recibe `progress` y
`reducedMotion` como props. `App.vue` no sabe nada de física de partículas.
Esa separación es la que permite cambiar el texto o la animación sin tocar
la otra pieza.

## Cómo funciona el scroll

`useScrollProgress` escucha `scroll` y `resize` con `{ passive: true }` y
agrupa las actualizaciones con `requestAnimationFrame`, para no recalcular
nada dentro del propio evento de scroll (eso sería costoso y bloquearía el
hilo principal). El resultado es un único número, `progress`, entre 0 y 1.

`App.vue` recorre `STORY` (en `data/story.js`) y elige la última escena cuyo
campo `at` sea menor o igual que `progress`. Así el texto avanza en sincronía
con el scroll sin necesidad de un `sceneIndex` guardado aparte.

## Sistema de partículas

El corazón no es una imagen: es una curva paramétrica calculada en
JavaScript,

```
x = 16 sin³(t)
y = 13 cos(t) − 5 cos(2t) − 2 cos(3t) − cos(4t)
```

Cada partícula nace dispersa alrededor del centro y tiene asignado un punto
de esa curva como destino. En cada frame se aplica una fuerza de atracción
hacia ese destino cuya intensidad crece con el progreso del scroll (con
`easeInOutCubic`), así que al principio las partículas casi no se mueven y
cerca del final convergen con más fuerza — es la sensación de que la forma
"se va descubriendo" en vez de aparecer de golpe.

Al llegar al 100% se añade una oscilación de escala muy sutil
(`sin(tiempo)`) para el efecto de "respiración". En escritorio con puntero
fino, el cursor repele ligeramente las partículas cercanas; en touch no se
depende de eso, porque un dispositivo táctil no tiene hover.

Rendimiento: `devicePixelRatio` se limita a 2, el número de partículas se
calcula a partir del área del viewport (y se reduce si el usuario tiene
`prefers-reduced-motion`), y no se crea ningún objeto nuevo dentro del bucle
de render — todos los arrays de partículas se reutilizan frame a frame.

## Instalación y desarrollo

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview   # para comprobar el build antes de desplegar
```

Esto genera la carpeta `dist/`.

## Despliegue en Netlify

1. Sube el repositorio (o arrastra la carpeta `dist/` a Netlify si prefieres
   un despliegue manual).
2. Build command: `npm run build`
3. Publish directory: `dist`

No hace falta ninguna variable de entorno ni backend.

## Estados contemplados

- `loading` — mientras se inicializa el Canvas.
- `empty` — si `STORY` estuviera vacío.
- `error` — si el navegador no soporta Canvas 2D o falla la inicialización
  (el detalle técnico va a `console.error`, nunca al usuario).
- `ready` / completado — la experiencia normal, incluida la revelación
  final al llegar al 100% del scroll.
