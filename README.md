# 🎳 PinZulia Bowling Boutique & Gastropub — WebApp Oficial

WebApp interactiva y sistema de operaciones para **PinZulia** (`@pinzulia`, C.C. Internacional, Av. 5 de Julio con Av. 13, Maracaibo, Zulia).

Desarrollada con **Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + Motion + Canvas Confetti + QRCode**.

---

## 🚀 Correr Localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:3000
```

---

## 🎮 Módulos y Funcionalidades Implementadas

1. **🎳 Monitor Interactivo de 14 Pistas en Tiempo Real**:
   - Visualización de las 14 pistas computarizadas de bowling del C.C. Internacional.
   - Estados dinámicos: *Libre*, *En Juego (con cronómetro regresivo de minutos restantes)*, *Reservada* y *Mantenimiento*.
   - Carriles VIP (Pistas 13 y 14 con sofás de cuero y Shisha) y soporte de *Bumpers* automáticos para niños.
   - Acceso a reserva directa o pedido de comida al carril.

2. **🎟️ Módulo de Reservaciones con Pase Digital QR**:
   - Planes: *1 Hora de Bowling* ($25), *Combo Strike Night* ($65), *Paquete Cumpleaños / Corporativo* ($130) y *Lounge VIP Glow Bowling* ($180).
   - Asignación de tallas de calzado profesional sanitizado (35 al 46 EU / 5 al 13.5 US) para cada jugador.
   - Generación instantánea de **Ticket Digital con código QR 2D escaneable en vivo** (`#PIN-XXXX`) y confirmación directa hacia WhatsApp.

3. **🍕 Carta Digital Gastropub & Coctelería Glow UV**:
   - Pinsas Romanas (Masa ligera con triple harina y 72h de fermentación lenta), Strike Smash Burgers, Alitas Buffalo Crispy, Tequeños Gigantes y Cócteles Neón Glow Strike.
   - Switch de divisas en tiempo real **USD ($) / VES (Bs.)** a tasa oficial BCV.
   - Botón de adición directa a la comanda.

4. **🎯 Minijuego Interactivo: "Tira tu Strike 🎳"**:
   - Simulador con controles de dirección y barra de potencia de lanzamiento.
   - Animación de la bola rodando por el carril hacia los 10 pinos.
   - Detección de Strike con lluvia de confeti (`canvas-confetti`) y emisión de código de cupón promocional (`STRIKE10PZ`) con botón de copiado.

5. **🪩 Modo Glow Bowling UV**:
   - Switch en el navbar que activa la atmósfera ultravioleta fluorescente (`glow-mode-active`), intensificando los bordes de neón azul y magenta simulando las fiestas nocturnas de fin de semana con DJ.

6. **📲 Comanda Directa al Carril (`/pista/[lane]`)**:
   - Escaneo de QR ubicado en cada mesa de pista (ej: `/pista/07` o `/pista/14`).
   - Carrito flotante (Drawer lateral), cálculo automático de subtotales, propina opcional al staff, notas de cocina y checkout estandarizado directo a WhatsApp con el número de carril exacto.

7. **🛡️ Consola de Operaciones del Gerente (`/admin` o `?gerente=true`)**:
   - KPIs en tiempo real (Pistas ocupadas, % aforo, ventas del día en USD y Bs, calzado en uso).
   - Control de las 14 pistas (Iniciar partida +1h, +30m, pausar, cambiar a libre o reservada).
   - Modificador en vivo de la tasa oficial de cambio BCV.
   - Monitor de reservas del día con códigos `#PIN-XXXX`.

8. **📷 Escáner Óptico de Pases QR (`/escanear`)**:
   - Herramienta para recepcionistas y anfitriones para validar pases QR al momento de la llegada del cliente.

9. **📍 Ubicación GPS & Contacto**:
   - C.C. Internacional, Av. 5 de Julio frente al SENIAT, Maracaibo.
   - Botones directos a Google Maps, Waze, Instagram y WhatsApp.

---

## 🛠️ Dónde Editar Contenidos

| Qué                                  | Archivo                 |
| ------------------------------------ | ----------------------- |
| Catálogo de 14 Pistas y Paquetes     | `data/pinzuliaData.ts`  |
| Carta de Pinsas, Smash Burgers y Bar | `data/pinzuliaData.ts`  |
| Agenda de Ligas y Eventos            | `data/pinzuliaData.ts`  |
| Teléfono, Instagram y Dirección      | `lib/config.ts`         |
| Tasa de cambio BCV por defecto       | `data/currencies.ts`    |