/**
 * La historia vive aquí: tiempos, textos y recuerdos.
 * Las fotos se sirven desde /public/images/ y se consumen como /images/...
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
    at: 0.055,
    whisper: "porque tengo algo que decirte",
    title: "No hace falta una llamada.",
    text: "A veces no se puede. Estamos ocupados, hay silencio, hay distancia. Pasa.",
  },
  {
    id: "unchanged",
    at: 0.11,
    whisper: "y aun así",
    title: "Nada de eso cambia lo que siento.",
    text: "Eso sigue ahí, aunque el teléfono no suene.",
  },

  // Pasillo de recuerdos
  {
    id: "memory-1",
    at: 0.19,
    image: "/images/imagen1.jpg",
    alt: "Primer recuerdo con Luna",
    text: "Quizá aquí todavía no sabíamos\ntodo lo que iba a pasar.",
  },
  {
    id: "memory-2",
    at: 0.275,
    image: "/images/imagen2.jpg",
    alt: "Segundo recuerdo con Luna",
    text: "Después llegaron esos días\nque empezaron a sentirse\ndemasiado especiales.",
  },
  {
    id: "memory-3",
    at: 0.36,
    image: "/images/imagen3.jpg",
    alt: "Tercer recuerdo con Luna",
    text: "Este recuerdo me hace sonreír\ncada vez que lo veo.",
  },
  {
    id: "memory-4",
    at: 0.445,
    image: "/images/imagen4.jpg",
    alt: "Cuarto recuerdo con Luna",
    text: "Y poco a poco,\nLuna dejó de ser simplemente\nalguien con quien hablaba.",
  },
  {
    id: "memory-5",
    at: 0.53,
    image: "/images/imagen5.jpg",
    alt: "Quinto recuerdo con Luna",
    text: "Se convirtió en alguien\na quien quería tener cerca.",
  },
  {
    id: "memory-closing",
    at: 0.61,
    title: "♥",
    text: "Y ese es mi recuerdo favorito.",
    signature: "Luna.",
  },

  {
    id: "question",
    at: 0.69,
    whisper: "así que tengo una pregunta",
    title: "¿Cuánto crees que te quiero?",
    text: "Sigue bajando. Vamos a intentar medirlo.",
  },
  {
    id: "measuring",
    at: 0.765,
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
    at: 0.91,
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
