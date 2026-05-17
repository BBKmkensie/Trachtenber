# 🧮 Método Trachtenberg

## 📱 Descargar app Android (APK)

**Instala directamente en tu móvil** (activa *Orígenes desconocidos* / *Instalar apps desconocidas* si el sistema lo pide):

| Versión | Enlace |
|---------|--------|
| **1.0.0** | [Descargar Trachtenberg-1.0.0.apk](https://github.com/BBKmkensie/Trachtenber/raw/main/releases/Trachtenberg-1.0.0.apk) |

También en **[Releases](https://github.com/BBKmkensie/Trachtenber/releases)** (versiones futuras con etiqueta `v1.0.0`, etc.).

---

Aplicación para practicar cálculo mental con el **Método Trachtenberg**:

- **Escritorio:** Electron + React (`npm run dev`)
- **Móvil (Android/iOS):** Flutter en la carpeta [`trachtenberg_flutter/`](trachtenberg_flutter/)

El Método Trachtenberg es un sistema de cálculo mental rápido desarrollado por Jakow Trachtenberg que permite realizar operaciones matemáticas complejas de manera eficiente y precisa.

## 🚀 Características

- ✅ Interfaz moderna y atractiva
- ✅ Múltiples niveles de dificultad (Fácil, Medio, Difícil)
- ✅ Sistema de puntuación y precisión
- ✅ Temporizador de 60 segundos
- ✅ Operaciones matemáticas: Suma, Resta, Multiplicación y División
- ✅ Multiplataforma (Windows, macOS, Linux)

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

## 🛠️ Instalación

1. Instala las dependencias:
```bash
npm install
```

## 🎮 Uso

### Modo Desarrollo

Para ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo de React y abrirá la aplicación Electron automáticamente.

### Modo Producción

Para construir la aplicación ejecutable:

```bash
npm run dist
```

Los ejecutables se generarán en la carpeta `dist/`.

### App móvil (Flutter)

```bash
cd trachtenberg_flutter
flutter pub get
flutter run
```

APK de release:

```bash
flutter build apk --release
```

## 📦 Scripts Disponibles

- `npm start` - Ejecuta Electron con la build de producción
- `npm run dev` - Ejecuta en modo desarrollo (React + Electron)
- `npm run build` - Construye la aplicación React
- `npm run dist` - Construye el ejecutable final

## 🎯 Cómo Jugar

1. Selecciona el nivel de dificultad (Fácil, Medio o Difícil)
2. Haz clic en "Iniciar Juego"
3. Resuelve los problemas matemáticos lo más rápido posible
4. Ingresa tu respuesta y presiona Enter o haz clic en "Verificar"
5. ¡Gana puntos por cada respuesta correcta!

## 🎨 Tecnologías Utilizadas

- **Electron** + **React** — escritorio
- **Flutter** — Android / iOS
- **CSS3** — estilos de la versión web

## 📝 Licencia

MIT

## 📚 Sobre el Método Trachtenberg

El Método Trachtenberg es un sistema de cálculo mental desarrollado por el ingeniero ruso Jakow Trachtenberg durante su encarcelamiento en un campo de concentración nazi. Este método permite realizar cálculos aritméticos complejos de manera rápida y precisa sin necesidad de calculadora, utilizando técnicas específicas para cada tipo de operación.

## 👨‍💻 Desarrollo

Esta aplicación fue creada como una adaptación de una aplicación móvil a escritorio, utilizando tecnologías web modernas para una experiencia multiplataforma. Está completamente en español y diseñada para ayudar a practicar y dominar el método Trachtenberg.

