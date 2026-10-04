# IS Joyas — app de gestión

App web instalable (celular y PC) para la gestión de IS Joyas: pedidos personalizados, ventas, gastos,
reparto mensual entre Nacho y Vale, stock de metal y presupuestos. Los datos viven en la planilla de Google.

## Cómo está armada
- `public/` — la app ya compilada (lo que publica Vercel). Se genera con `bun build.ts`.
- `src/` — código de la app (React + TypeScript).
- `api/` — funciones del servidor en Vercel: login con PIN, lectura/escritura de la planilla, fotos, ventas de Tienda Nube.
- `apps-script/Code.gs` — API que vive dentro de la planilla (Extensiones → Apps Script).

## Variables de entorno en Vercel
| Variable | Qué es |
| --- | --- |
| `SCRIPT_URL` | URL de la implementación "Aplicación web" del Apps Script |
| `SCRIPT_SECRET` | Clave que muestra la función `inicializar` del Apps Script |
| `NACHO_PIN`, `VALE_PIN` | PIN de cada uno para entrar a la app |
| `SESSION_SECRET` | Texto largo al azar para firmar las sesiones |
| `TIENDANUBE_TOKEN` | Token de la aplicación a medida de Tienda Nube |
| `TIENDANUBE_STORE_ID` | ID de la tienda en Tienda Nube |

## Desarrollo
- `bun test` corre las pruebas de cálculos, planilla y ventas web.
- `bun build.ts` genera `public/index.html` (versión conectada) y `dist/artifact.html` (versión de prueba).
- `bun test/mockServer.ts` levanta un servidor local con una planilla falsa en memoria (PIN 1234 / 5678).
