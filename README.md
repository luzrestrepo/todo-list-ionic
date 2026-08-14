# To-Do List — Ionic + Angular

Aplicación híbrida de lista de tareas construida con **Ionic 8** y **Angular 20** (standalone components + signals), con categorías, almacenamiento local, feature flags vía **Firebase Remote Config**, y empaquetado nativo con **Apache Cordova** para Android e iOS.

## Funcionalidades

- Agregar, completar y eliminar tareas.
- Crear, editar y eliminar categorías.
- Asignar una categoría a cada tarea.
- Filtrar tareas por categoría.
- Persistencia en `localStorage` (sin backend).
- Feature flag remoto (`enable_task_categories`) que activa/desactiva toda la funcionalidad de categorías sin necesidad de un nuevo release.

## Stack técnico

| Área | Tecnología |
|---|---|
| Framework UI | Ionic 8 (standalone) + Angular 20 |
| Estado | Angular Signals (`signal`, `computed`) |
| Persistencia | `localStorage` |
| Backend as a Service | Firebase (Remote Config) |
| Empaquetado nativo | Apache Cordova (Android / iOS) |
| Listas grandes | Angular CDK `cdk-virtual-scroll-viewport` |

## Requisitos previos

- **Node.js 22.x** y npm (verificado con Node `v22.23.0`, npm `10.9.8`).
- **Java JDK 17** (requerido por el build de Android).
- **Android SDK** (API 33-36, build-tools 34+) — normalmente viene con Android Studio. Se necesitan las variables de entorno `ANDROID_HOME` apuntando al SDK y `platform-tools`/`cmdline-tools/latest/bin` en el `PATH`.
- **Gradle 8.14.2** — Cordova genera el proyecto Android pero **no** trae Gradle embebido; si no lo tienes instalado ni tienes Android Studio (que sí lo trae empaquetado), descárgalo de https://gradle.org/releases/ y agrégalo al `PATH`. Sin esto, `cordova build android` falla con *"Could not find an installed version of Gradle"*.
- Para iOS: **macOS con Xcode** (ver sección de bloqueante más abajo).

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo (navegador)

```bash
npm run start
```

Levanta el servidor de desarrollo de Angular en `http://localhost:4200`.

## Configuración de Firebase

El proyecto ya viene configurado contra un proyecto Firebase personal (`todo-list-ionic-luz`) en `src/environments/environment.ts` y `environment.prod.ts`. Estas credenciales son las del **SDK cliente de Firebase** (no son secretas por diseño — ver nota de seguridad más abajo) y ya están commiteadas, así que la app funciona "tal cual" sin configuración adicional.

Si quieres apuntar a tu propio proyecto de Firebase:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita **Remote Config**.
3. Crea el parámetro `enable_task_categories` (tipo booleano) con el valor que quieras.
4. Reemplaza el objeto `firebase` en `src/environments/environment.ts` y `environment.prod.ts` con la config de tu proyecto (Configuración del proyecto → Tus apps → SDK setup).

> **Nota de seguridad:** el `apiKey` de Firebase para apps web no otorga acceso privilegiado por sí solo — la protección real la dan las reglas de seguridad de cada servicio (Firestore, Remote Config, etc.). Por eso es seguro tenerlo en un repositorio público, a diferencia de una credencial de servidor.

### Feature flag: `enable_task_categories`

Toda la UI de categorías (crear/editar/eliminar categorías, asignar categoría a una tarea, filtrar por categoría) está condicionada al flag remoto `enable_task_categories`:

- **Activado (`true`)**: se ve todo el flujo de categorías descrito arriba.
- **Desactivado (`false`)**: la app se reduce a una lista de tareas simple (agregar/completar/eliminar), sin ningún rastro de categorías en la UI.

Para probarlo: en Firebase Console → Remote Config, cambia el valor de `enable_task_categories` a `false`, publica el cambio, y recarga la app (el fetch se hace en cada arranque, con `minimumFetchIntervalMillis = 0` para que el cambio se vea de inmediato sin esperar el caché por defecto de Firebase). Mientras se resuelve el fetch, la app muestra la UI con categorías por defecto (coincide con el `defaultConfig` local), para evitar parpadeos.

## Compilar para Android (Cordova)

```bash
# 1. Build de Angular hacia www/ (ya configurado en angular.json)
npx ng build --configuration production

# 2. Agregar la plataforma (solo la primera vez)
npx cordova platform add android

# 3. Compilar el APK debug
npx cordova build android
```

El APK queda en:

```
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

Para un build de **release** firmado (necesario para distribución fuera de pruebas):

```bash
npx cordova build android --release
```

(requiere configurar firma en `platforms/android/app/build.gradle` o pasar `--keystore`, `--storePassword`, `--alias`, `--password`).

### Ejecutar en un emulador/dispositivo Android

```bash
npx cordova run android
```

## Compilar para iOS — ⚠️ Bloqueante conocido

**No fue posible generar el `.ipa`**: compilar para iOS requiere Xcode, que solo corre en macOS, y no se contó con acceso a una máquina Mac durante el desarrollo de esta prueba.

Lo que sí se dejó listo:

- La plataforma iOS fue agregada al proyecto Cordova (`npx cordova platform add ios`), generando `platforms/ios/` con el proyecto Xcode base correctamente configurado (`config.xml` con el bundle id, nombre, preferencias e intents de iOS).
- Cordova confirma la configuración es válida; solo bloquea el **build** en sí (`cordova build ios` falla explícitamente en Windows con *"Applications for platform ios can not be built on this OS"*).

Si se tuviera acceso a macOS, los pasos serían:

```bash
npx ng build --configuration production
npx cordova platform add ios   # si no está agregada
npx cordova build ios
```

Y luego abrir `platforms/ios/App.xcworkspace` en Xcode para firmar con una cuenta de Apple Developer y exportar el `.ipa`.

**Alternativas consideradas** para no depender de una Mac física:
- Un runner `macos-latest` de GitHub Actions (gratuito en repos públicos) puede compilar el proyecto Cordova para iOS. Sigue sin resolver la firma: exportar un `.ipa` instalable en un dispositivo real requiere una cuenta de Apple Developer ($99/año) para generar el certificado y el provisioning profile.
- Servicios de Mac en la nube (MacInCloud, etc.) permitirían un Xcode real, a costo adicional.

Se optó por documentar el bloqueante honestamente en vez de forzar una solución a medias, y entregar el **APK de Android completamente funcional** como evidencia de que la cadena Angular → Cordova → build nativo funciona de punta a punta.

## Arquitectura

```
src/app/
├── core/
│   ├── models/          # Interfaces Task y Category
│   └── services/
│       ├── storage.service.ts        # Wrapper sobre localStorage
│       ├── task.service.ts           # Estado de tareas (signals)
│       ├── category.service.ts       # Estado de categorías (signals)
│       ├── firebase.service.ts       # Inicialización perezosa de Firebase
│       └── remote-config.service.ts  # Feature flags vía Remote Config
└── home/
    ├── home.page.ts       # Componente principal (OnPush)
    ├── home.page.html
    └── home.page.scss
```

Los servicios de estado (`TaskService`, `CategoryService`) exponen `signal`s de solo lectura y persisten cada cambio en `localStorage` de forma sincrónica — no hay un store central porque el dominio es simple; añadir uno sería sobre-ingeniería para el alcance actual.

## Optimizaciones de rendimiento aplicadas

| Técnica | Por qué |
|---|---|
| `computed()` en vez de getters en el template | Angular evalúa los getters del template en cada ciclo de detección de cambios, sin importar si algo relevante cambió. Un `computed()` solo se recalcula cuando sus dependencias (signals) cambian de verdad. |
| `ChangeDetectionStrategy.OnPush` en `HomePage` | Reduce los ciclos de detección de cambios innecesarios; combinado con signals, Angular solo re-renderiza cuando el estado que se lee en el template realmente cambia. |
| `cdk-virtual-scroll-viewport` para la lista de tareas | Solo se renderizan las filas visibles en pantalla, sin importar cuántas tareas existan. Mantiene el número de nodos DOM (y por tanto el uso de memoria) constante incluso con miles de tareas. |
| `import()` dinámico para Firebase (`firebase/app`, `firebase/remote-config`) | Antes, el SDK de Firebase se inicializaba de forma síncrona al construir el componente, bloqueando el primer render. Con `import()` dinámico, el código de Firebase queda en chunks separados que se cargan en paralelo, sin bloquear la carga inicial de la UI. |
| `track` en los bucles `@for` | Angular reutiliza los nodos DOM existentes al reordenar/filtrar listas en vez de recrearlos, evitando trabajo de renderizado innecesario. |

## Pruebas realizadas

Se probó manualmente en navegador (`ng serve`) el flujo completo: crear/completar/eliminar tareas, crear/editar/eliminar categorías, asignar categoría a una tarea, filtrar por categoría, y persistencia tras recargar la página. También se generó y verificó un APK de Android real (`cordova build android`) sobre un build de producción de Angular.

