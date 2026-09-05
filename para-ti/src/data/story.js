/**
 * Contenido narrativo de la experiencia.
 * Cero lógica aquí: solo texto y metadatos.
 *
 * `at`        marca en qué punto del scroll (0-1) empieza a ser la escena activa.
 * `image`     ruta a una foto en /public (opcional). Si no existe o no carga
 *             todavía, se muestra un marcador elegante en su lugar.
 * `alt`       texto alternativo de la foto. Edítalo para que describa la
 *             imagen real una vez la añadas (no debe limitarse a repetir la cita).
 * `title`     símbolo o frase grande (opcional).
 * `signature` línea pequeña destacada debajo del texto (opcional).
 */
export const STORY = [
  {
    id: "intro",
    at: 0,
    whisper: "para ti, Luna",
    title: "¿Estás ahí?",
    text: "Si ahora mismo no podemos hablar, al menos te dejo esto.",
  },
  {
    id: "something",
    at: 0.06,
    whisper: "porque tengo algo que decirte",
    title: "No hace falta una llamada.",
    text: "A veces no se puede. Estamos ocupados, hay silencio, hay distancia. Pasa.",
  },
  {
    id: "unchanged",
    at: 0.12,
    whisper: "y aun así",
    title: "Nada de eso cambia lo que siento.",
    text: "Eso sigue ahí, aunque el teléfono no suene.",
  },

  // ---- Recuerdos ----
  // Sustituye "image" por tu propia foto en /public/images/ (ver README).
  {
    id: "memory-1",
    at: 0.2,
    image: "/images/recuerdo-1.jpg",
    alt: "Foto del primer recuerdo — edita esta descripción al añadir tu imagen",
    text: "Quizá aquí todavía no sabíamos\ntodo lo que iba a pasar.",
  },
  {
    id: "memory-2",
    at: 0.28,
    image: "/images/recuerdo-2.jpg",
    alt: "Foto del segundo recuerdo — edita esta descripción al añadir tu imagen",
    text: "Después llegaron esos días\nque empezaron a sentirse\ndemasiado especiales.",
  },
  {
    id: "memory-3",
    at: 0.36,
    image: "/images/recuerdo-3.jpg",
    alt: "Foto del tercer recuerdo — edita esta descripción al añadir tu imagen",
    text: "Este recuerdo me hace sonreír\ncada vez que lo veo.",
  },
  {
    id: "memory-4",
    at: 0.44,
    image: "/images/recuerdo-4.jpg",
    alt: "Foto del cuarto recuerdo — edita esta descripción al añadir tu imagen",
    text: "Y poco a poco,\nLuna dejó de ser simplemente\nalguien con quien hablaba.",
  },
  {
    id: "memory-5",
    at: 0.52,
    image: "/images/recuerdo-5.jpg",
    alt: "Foto del quinto recuerdo — edita esta descripción al añadir tu imagen",
    text: "Se convirtió en alguien\na quien quería tener cerca.",
  },
  {
    id: "memory-closing",
    at: 0.6,
    title: "♥",
    text: "Y ese es mi recuerdo favorito.",
    signature: "Luna.",
  },
  // ---- Fin recuerdos ----

  {
    id: "question",
    at: 0.68,
    whisper: "así que tengo una pregunta",
    title: "¿Cuánto crees que te quiero?",
    text: "Sigue bajando. Vamos a intentar medirlo.",
  },
  {
    id: "measuring",
    at: 0.76,
    whisper: "calculando",
    title: "Midiendo…",
    text: "Esto va a tardar un segundo. O toda la vida, según se mire.",
  },
  {
    id: "overflow",
    at: 0.84,
    whisper: "resultado",
    title: "ERROR",
    text: "No existe una unidad lo bastante grande para esto.",
  },
  {
    id: "infinity",
    at: 0.9,
    whisper: "así que lo dejamos así",
    title: "∞",
    text: "Hay cosas que simplemente no caben en un porcentaje.",
  },
];

export const FINAL_MESSAGE = {
  title: "Te quiero muchísimo, Luna.",
  text: "Y aunque ahora mismo no podamos hablar, quería que al menos pudieras abrir esto y encontrar un poquito de mí aquí.",
  buttonLabel: "una última cosa…",
  reveal: {
    text: "Probablemente mañana vuelva a decirte exactamente lo mismo.",
    signature: "Te quiero, Luna. ♡",
  },
};
