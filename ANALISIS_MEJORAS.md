# Análisis de Mejoras - Versión Escritorio vs Móvil

## Diferencias Clave Identificadas

### 1. **Método UT (Unit Tables) - Implementación Más Precisa**

**Código Python (líneas 35-163):**
- Implementa el método Trachtenberg UT completo
- Multiplica dígitos correspondientes de ambos números
- Maneja acarreos de manera precisa (máximo 2)
- Muestra puntos de acarreo visualmente
- Genera flechas que conectan los dígitos que se multiplican

**Código React Actual:**
- Implementación simplificada
- No muestra puntos de acarreo visualmente
- Las flechas están implementadas pero la lógica de cálculo es básica

**Mejora Necesaria:**
- Implementar la función `prod_plotter` equivalente en React
- Agregar visualización de puntos de acarreo (carry dots)
- Mejorar la lógica de cálculo para coincidir con el método Trachtenberg UT exacto

### 2. **Reglas Específicas por Tabla (2-12)**

**Código Python:**
- Cada tabla tiene su propia función: `prod_plotter_2`, `prod_plotter_3`, etc.
- Cada tabla tiene reglas específicas del método Trachtenberg:
  - **Tabla 2**: Doblar el número
  - **Tabla 3**: Reglas complejas con vecinos y condiciones especiales
  - **Tabla 4**: Restar de 10, manejar vecinos, etc.
  - **Tabla 5**: Mitad del vecino + 5 si es impar
  - **Tabla 6**: Número + mitad del vecino + 5 si es impar
  - **Tabla 7**: Doblar número + mitad del vecino + 5 si es impar
  - **Tabla 8**: Restar de 10 y doblar, etc.
  - **Tabla 9**: Restar de 10, restar de 9 + vecino, etc.
  - **Tabla 11**: Número + vecino
  - **Tabla 12**: Doblar número + vecino

**Código React Actual:**
- Solo tiene reglas de texto básicas
- No implementa las reglas específicas de cálculo

**Mejora Necesaria:**
- Implementar funciones de cálculo específicas para cada tabla
- Usar estas funciones en `generateSolutionSteps` cuando `selectedTable` está definido

### 3. **Funciones Explicativas (Explainer Functions)**

**Código Python (líneas 1309-1709):**
- `explainer_func_ut`: Explica el método UT paso a paso
- `explainer_func_2` a `explainer_func_12`: Explicaciones específicas por tabla
- Genera texto detallado con formato (usando markup)
- Muestra cálculos intermedios

**Código React Actual:**
- Explicaciones básicas en `generateSolutionSteps`
- No tiene explicaciones específicas por tabla

**Mejora Necesaria:**
- Crear funciones explicativas específicas para cada tabla
- Mejorar el formato de las explicaciones

### 4. **Visualización de Acarreos (Carry Dots)**

**Código Python:**
- Muestra puntos visuales para representar acarreos:
  - 1 punto = acarreo de 1
  - 2 puntos = acarreo de 2
- Los puntos se posicionan arriba y a la derecha del dígito

**Código React Actual:**
- No muestra puntos de acarreo visualmente
- Solo menciona acarreos en el texto

**Mejora Necesaria:**
- Agregar visualización de puntos de acarreo en el diagrama SVG
- Mostrar puntos en la posición correcta (arriba y a la derecha del dígito)

### 5. **Manejo de Dificultades**

**Código Python:**
- Easy: números de 1-20
- Medium: números de 1-100
- Hard: números de 1-1000

**Código React Actual:**
- Easy: 1-2 dígitos (1-99)
- Medium: 2-3 dígitos (10-999)
- Hard: 3-5 dígitos (100-99999)

**Mejora Necesaria:**
- Ajustar rangos para coincidir con la versión móvil (opcional, depende de preferencia)

## Prioridades de Implementación

### Alta Prioridad:
1. ✅ Implementar método UT preciso (similar a `prod_plotter`)
2. ✅ Agregar visualización de puntos de acarreo
3. ✅ Implementar reglas específicas para tablas 2-12

### Media Prioridad:
4. Mejorar funciones explicativas por tabla
5. Mejorar formato de explicaciones paso a paso

### Baja Prioridad:
6. Ajustar rangos de dificultad
7. Optimizaciones de rendimiento

## Notas Técnicas

- El código Python usa matplotlib para visualización, nosotros usamos SVG
- Las funciones de cálculo pueden adaptarse directamente a JavaScript
- Las reglas del método Trachtenberg están bien documentadas en el código Python

