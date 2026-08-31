export type LaneStatus = "disponible" | "en_juego" | "reservada" | "mantenimiento";

export type BowlingLane = {
  id: number;
  name: string;
  laneNumber: number;
  status: LaneStatus;
  currentPlayers?: string[];
  remainingMinutes?: number;
  packageType?: string;
  shoesAssigned?: number;
  hasBumpers: boolean;
};

export type PoolTable = {
  id: number;
  tableNumber: number;
  name: string;
  status: LaneStatus;
  remainingMinutes?: number;
  currentPlayers?: string[];
  maxPlayers: number;
};

export type BookingPackage = {
  id: string;
  name: string;
  serviceType: "bowling" | "pool" | "combo";
  tagline: string;
  description: string;
  priceUSD: number;
  durationHours: number;
  maxPlayers: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  includesFood: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  category: "pinsas" | "burgers" | "snacks" | "cocteles" | "cervezas" | "sin-alcohol";
  description: string;
  priceUSD: number;
  badge?: string;
  popular?: boolean;
  spicy?: boolean;
  glow?: boolean;
  image?: string;
};

export type MenuCategory = {
  id: "pinsas" | "burgers" | "snacks" | "cocteles" | "cervezas" | "sin-alcohol";
  name: string;
  icon: string;
  subtitle: string;
};

export const OFFICIAL_RATES = {
  bowlingHourUSD: 25.0, // PISTA $25 (5 personas / 1 hora)
  bowlingMaxPlayers: 5,
  shoeRentalUSD: 2.5, // Zapatos $2,5
  poolHourUSD: 20.0, // MESA DE POOL $20 (4 personas / 1 hora)
  poolMaxPlayers: 4,
  currencyAccepted: "USD / VES a tasa BCV en vivo",
};

export const PINZULIA_LANES: BowlingLane[] = [
  { id: 1, name: "Pista 01", laneNumber: 1, status: "disponible", hasBumpers: true },
  { id: 2, name: "Pista 02", laneNumber: 2, status: "en_juego", remainingMinutes: 38, currentPlayers: ["Carlos", "Mariana", "Andrés"], packageType: "Pista de Bowling", shoesAssigned: 3, hasBumpers: true },
  { id: 3, name: "Pista 03", laneNumber: 3, status: "en_juego", remainingMinutes: 14, currentPlayers: ["Familia González"], packageType: "Pista de Bowling", shoesAssigned: 5, hasBumpers: false },
  { id: 4, name: "Pista 04", laneNumber: 4, status: "disponible", hasBumpers: true },
  { id: 5, name: "Pista 05", laneNumber: 5, status: "reservada", packageType: "Reserva VIP", remainingMinutes: 0, hasBumpers: false },
  { id: 6, name: "Pista 06", laneNumber: 6, status: "reservada", packageType: "Reserva VIP", remainingMinutes: 0, hasBumpers: false },
  { id: 7, name: "Pista 07", laneNumber: 7, status: "disponible", hasBumpers: false },
  { id: 8, name: "Pista 08", laneNumber: 8, status: "en_juego", remainingMinutes: 52, currentPlayers: ["Grupo Occidental"], packageType: "Pista de Bowling", shoesAssigned: 5, hasBumpers: false },
  { id: 9, name: "Pista 09", laneNumber: 9, status: "disponible", hasBumpers: true },
  { id: 10, name: "Pista 10", laneNumber: 10, status: "disponible", hasBumpers: true },
  { id: 11, name: "Pista 11", laneNumber: 11, status: "mantenimiento", hasBumpers: false },
  { id: 12, name: "Pista 12", laneNumber: 12, status: "disponible", hasBumpers: false },
  { id: 13, name: "Pista 13 VIP", laneNumber: 13, status: "disponible", hasBumpers: false },
  { id: 14, name: "Pista 14 VIP", laneNumber: 14, status: "disponible", hasBumpers: false },
];

export const PINZULIA_POOL_TABLES: PoolTable[] = [
  { id: 101, tableNumber: 1, name: "Mesa de Pool 01 (Diamond)", status: "disponible", maxPlayers: 4 },
  { id: 102, tableNumber: 2, name: "Mesa de Pool 02 (Diamond)", status: "en_juego", remainingMinutes: 28, currentPlayers: ["Alejandro", "Pedro"], maxPlayers: 4 },
  { id: 103, tableNumber: 3, name: "Mesa de Pool 03 (Brunswick)", status: "disponible", maxPlayers: 4 },
  { id: 104, tableNumber: 4, name: "Mesa de Pool 04 (Lounge VIP)", status: "disponible", maxPlayers: 4 },
];

export const BOOKING_PACKAGES: BookingPackage[] = [
  {
    id: "pista-bowling-oficial",
    name: "Pista de Bowling ($25)",
    serviceType: "bowling",
    tagline: "Tarifa Oficial: 1 Hora • Hasta 5 personas",
    description: "Carril computarizado Brunswick™ para hasta 5 jugadores. Alquiler de calzado sanitizado por $2,5 c/u. Aceptamos a tasa BCV.",
    priceUSD: 25,
    durationHours: 1,
    maxPlayers: 5,
    badge: "Oficial PinZulia",
    popular: true,
    features: [
      "Hasta 5 personas por carril",
      "1 hora de juego continuo",
      "Alquiler de zapatos sanitizados UV: $2,5 c/u",
      "Bumpers automáticos opcionales para niños",
      "Servicio de Gastropub a la pista con código QR",
    ],
    includesFood: false,
  },
  {
    id: "mesa-pool-oficial",
    name: "Mesa de Pool ($20)",
    serviceType: "pool",
    tagline: "Tarifa Oficial: 1 Hora • Hasta 4 personas",
    description: "Mesas profesionales de billar/pool con paño de torneo, bolas Brunswick y tiza profesional. Hasta 4 jugadores.",
    priceUSD: 20,
    durationHours: 1,
    maxPlayers: 4,
    badge: "PinZulia POOL",
    popular: true,
    features: [
      "Hasta 4 personas por mesa",
      "1 hora de juego continuo",
      "Tacos profesionales y triángulo de precisión",
      "Servicio de cócteles y snacks en mesa",
      "Recibimos a tasa BCV en vivo",
    ],
    includesFood: false,
  },
  {
    id: "combo-strike-pool",
    name: "Combo Strike & Pool ($40)",
    serviceType: "combo",
    tagline: "1h Bowling + 1h Pool • Ahorro especial",
    description: "La experiencia completa de PinZulia: 1 hora de pista de bowling para tu grupo más 1 hora de mesa de pool.",
    priceUSD: 40,
    durationHours: 2,
    maxPlayers: 5,
    badge: "Combo Estrella",
    features: [
      "1 hora de bowling + 1 hora de pool",
      "Hasta 5 jugadores",
      "Ahorra $5 frente al alquiler individual",
      "Calzado sanitizado disponible",
      "Mesa reservada en el Gastropub",
    ],
    includesFood: false,
  },
  {
    id: "glow-party-vip",
    name: "Glow UV Party VIP ($65)",
    serviceType: "combo",
    tagline: "2h Bowling + Pinsa Romana + Cócteles",
    description: "2 horas continuas de pista con iluminación UV neón, 1 Pinsa Romana artesanal 72h y 4 cócteles Glow Neón de autor.",
    priceUSD: 65,
    durationHours: 2,
    maxPlayers: 5,
    badge: "Experiencia VIP",
    features: [
      "2 horas completas de carril UV",
      "1 Pinsa Romana artesanal a elección",
      "4 cócteles fluorescentes Glow Strike",
      "Zapatos incluidos para todo el grupo",
      "Atención preferencial de mesero",
    ],
    includesFood: true,
  },
];

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "pinsas", name: "Pinsas Romanas 72h", icon: "🍕", subtitle: "Masa madre de fermentación lenta horneada a la piedra" },
  { id: "burgers", name: "Smash Burgers", icon: "🍔", subtitle: "Carne premium smash con queso fundido y pan brioche" },
  { id: "snacks", name: "Snacks & Tequeños", icon: "🍟", subtitle: "Para picar mientras juegas en tu carril o mesa" },
  { id: "cocteles", name: "Coctelería Neón UV", icon: "🍸", subtitle: "Tragos fluorescentes que brillan bajo luz ultravioleta" },
  { id: "cervezas", name: "Cervezas & Baldes", icon: "🍺", subtitle: "Nacionales e importadas bien frías en cubeta" },
  { id: "sin-alcohol", name: "Bebidas & Mocktails", icon: "🥤", subtitle: "Refrescos, limonadas frozen y té de la casa" },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "pinsa-margarita-di-bufala",
    name: "Pinsa Margarita di Búfala",
    category: "pinsas",
    description: "Masa madre 72h, salsa pomodoro San Marzano, mozzarella di búfala fresca, albahaca genovesa y aceite de oliva virgen extra.",
    priceUSD: 14.0,
    badge: "Clásica",
    popular: true,
  },
  {
    id: "pinsa-cuatro-quesos-pepperoni",
    name: "Pinsa Cuatro Quesos & Pepperoni",
    category: "pinsas",
    description: "Mozzarella, gorgonzola, provolone ahumado, parmesano reggiano y láminas crocantes de pepperoni italiano.",
    priceUSD: 16.0,
    badge: "Más Pedida",
    popular: true,
  },
  {
    id: "pinsa-prosciutto-arugula",
    name: "Pinsa Prosciutto di Parma & Rúgula",
    category: "pinsas",
    description: "Prosciutto crudo importado, rúgula silvestre, lascas de queso pecorino y reducción balsámica de Módena.",
    priceUSD: 18.0,
    badge: "Gourmet",
  },
  {
    id: "smash-strike-burger-doble",
    name: "Strike Smash Burger Doble",
    category: "burgers",
    description: "Doble carne smash blend especial (160g), doble cheddar americano derretido, cebolla caramelizada, pepinillos y salsa de la casa en pan brioche tostado.",
    priceUSD: 12.0,
    badge: "Top Seller",
    popular: true,
  },
  {
    id: "smash-pinzulia-bacon-bbq",
    name: "PinZulia Bacon BBQ Smash",
    category: "burgers",
    description: "Doble carne smash, tocineta ahumada crujiente, aros de cebolla crocantes, queso gouda y salsa BBQ ahumada al bourbon.",
    priceUSD: 13.5,
  },
  {
    id: "tequenos-pinzulia-gigantes",
    name: "Tequeños Gigantes PinZulia (6 uds)",
    category: "snacks",
    description: "Tequeños tradicionales zulianos extra rellenos de queso de mano fundente, acompañados de salsa tártara de ajo porro.",
    priceUSD: 9.0,
    badge: "Zuliano 100%",
    popular: true,
  },
  {
    id: "alitas-buffalo-crispy",
    name: "Alitas Buffalo Crispy (10 uds)",
    category: "snacks",
    description: "Alitas de pollo apanadas súper crujientes, glaseadas en salsa Buffalo spicy, servidas con bastones de apio y aderezo Blue Cheese.",
    priceUSD: 13.0,
    spicy: true,
  },
  {
    id: "coctel-glow-strike-neon-uv",
    name: "Cóctel Glow Strike Neón UV",
    category: "cocteles",
    description: "Vodka premium, licor de curaÃ§ao azul, infusión de tónica quinina botánica (brilla activamente con la luz UV de la bolera) y cítricos.",
    priceUSD: 8.0,
    badge: "Brilla con UV",
    glow: true,
    popular: true,
  },
  {
    id: "coctel-perfect-game-gin-mule",
    name: "Perfect Game Gin Mule",
    category: "cocteles",
    description: "Ginebra Tanqueray, cerveza de jengibre artesanal, zumo de lima recién exprimido y hojas de menta maceradas con hielo picado.",
    priceUSD: 9.0,
  },
  {
    id: "balde-cervezas-zulia-6",
    name: "Balde de Cervezas Zulia (6 uds)",
    category: "cervezas",
    description: "Cubeta con hielo frappé y 6 botellas de Cerveza Zulia vestidas de novia para compartir en tu carril o mesa de pool.",
    priceUSD: 14.0,
    badge: "Promo Amigos",
    popular: true,
  },
  {
    id: "limonada-menta-jengibre-frozen",
    name: "Limonada Menta & Jengibre Frozen",
    category: "sin-alcohol",
    description: "Limonada frappé natural con hojas de menta fresca y un toque aromático de jengibre.",
    priceUSD: 4.5,
  },
];

export const AVAILABLE_SHOE_SIZES = [
  "35 EU (5.0 US)",
  "36 EU (5.5 US)",
  "37 EU (6.5 US)",
  "38 EU (7.5 US)",
  "39 EU (6.5 US M / 8.0 US W)",
  "40 EU (7.5 US M)",
  "41 EU (8.5 US M)",
  "42 EU (9.5 US M)",
  "43 EU (10.0 US M)",
  "44 EU (11.0 US M)",
  "45 EU (11.5 US M)",
  "46 EU (12.5 US M)",
];

export const PAYMENT_ACCOUNTS = {
  pagoMovil: {
    banco: "Banesco (0134)",
    telefono: "04120308674",
    rif: "J-50412890-1",
    titular: "PINZULIA C.A.",
  },
  zelle: {
    correo: "pagos@pinzulia.com",
    titular: "PinZulia Bowling LLC",
  },
  binance: {
    payId: "89421033",
    email: "crypto@pinzulia.com",
    coin: "USDT",
  },
  efectivo: {
    mensaje: "Pago directo en taquilla o con punto inalámbrico en tu pista",
  },
};

export const MANAGER_KPIS = {
  todaySalesUSD: 1845.0,
  shoesInUse: 48,
  glowModeActive: false,
};