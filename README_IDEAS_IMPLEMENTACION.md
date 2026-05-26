# 🌱 ReciclaYa / Revalora IA — Ideas de Implementación para EcoBot

> Documento generado el 21/05/2026.
> Recoge la discusión y propuestas de extensión del asistente EcoBot (chatbot n8n)
> para convertirlo en un **asesor legal y comercial de economía circular** para Perú.

---

## 📌 Contexto

El proyecto **ReciclaYa / Revalora IA** ya cuenta con:

- ✅ Un **backend .NET 8** con Clean Architecture que gestiona listings, transacciones, IA (DeepSeek) y análisis de valorización.
- ✅ Un **frontend Angular 21** con 18 módulos (marketplace, waste-sell, orders, checkout, etc.).
- ✅ Un **workflow n8n** (`POST /ecobot`) que actúa como chatbot conversacional usando **Google Gemini Flash Lite**, con memoria de sesión y respuestas en formato de **tarjetas JSON estructuradas**.

El chatbot actualmente:
1. Recibe el nombre de un residuo del usuario
2. Clasifica la categoría (plástico, orgánico, electrónico, etc.)
3. Detecta la intención (monetizar, reciclar, reutilizar)
4. Genera hasta 3 **tarjetas accionables** con ideas de qué hacer con ese residuo
5. Cada tarjeta incluye: nombre del producto, descripción, valor estimado, tiempo para ganar dinero, siguiente paso concreto

---

## 🎯 Propuesta Principal: EcoBot como Asesor Dual

La idea central es extender el bot para que, **con el mismo mecanismo de tarjetas**, también funcione como un **asesor legal y regulatorio** antes de que el usuario haga una transacción.

### Antes (solo ideas):
```
Usuario: "Tengo laptops viejas"
Bot: [Tarjeta: Venta a reciclador] [Tarjeta: Donación] [Tarjeta: Piezas]
```

### Después (ideas + asesoría legal):
```
Usuario: "Tengo laptops viejas de mi empresa y quiero venderlas"
Bot:
  💡 IDEAS:
  [Tarjeta: Venta a EO-RS autorizada] [Tarjeta: Donación escuelas]

  ⚖️ ANTES DE PROCEDER:
  [Tarjeta: Nivel 3 — Regulado 🟠] [Tarjeta: Documentos necesarios]
  [Tarjeta: Solo EO-RS puede comprarte] [Tarjeta: Multa 840 UIT si incumples]
```

---

## 🃏 Nuevos Modos del Bot

El campo `modo` del JSON de respuesta se expande de 2 a 4 opciones:

| Modo | Se activa cuando... | Qué devuelve |
|---|---|---|
| `charla` | Saludos, preguntas vagas, contexto insuficiente | Solo texto conversacional |
| `tarjetas` | Menciona un residuo sin intención legal clara | Solo tarjetas de ideas de producto |
| `asesor-legal` | Pregunta "¿puedo vender X?", "¿qué papeles necesito?" | Solo tarjetas legales |
| `completo` | Menciona residuo + quiere vender/comprar | Tarjetas de ideas **+** tarjetas legales |

---

## 📋 Los 4 Niveles Regulatorios (Base Legal del Informe)

Basado en el **Decreto Legislativo N° 1278** (Ley de Gestión Integral de Residuos Sólidos del Perú) y el **D.S. N° 014-2017-MINAM**, el bot clasificará cada residuo en uno de estos niveles:

### 🟢 Nivel 1 — Residuos Libres
- **Materiales:** PET, cartón, papel, vidrio, aluminio, chatarra ferrosa
- **Puede vender:** Persona natural (DNI) o empresa (RUC)
- **Puede comprar:** Cualquier empresa con RUC y licencia municipal
- **Fiscaliza:** Municipalidad + SUNAT
- **Riesgo:** Bajo | **Multa referencial:** Sanciones municipales menores

### 🟡 Nivel 2 — Residuos Controlados
- **Materiales:** Orgánicos (comida, bagazo, estiércol), madera tratada, textiles industriales
- **Puede vender:** Persona natural (DNI) o empresa (RUC + licencia + autorización sanitaria si aplica)
- **Puede comprar:** Empresas con RUC + zona impermeabilizada + control sanitario
- **Fiscaliza:** Municipalidad + DIGESA + SENASA
- **Riesgo:** Medio | **Leyes:** D.L. 1278, Ley 28611

### 🟠 Nivel 3 — Residuos Regulados (RAEE)
- **Materiales:** Laptops, celulares, televisores, impresoras, pilas, placas electrónicas
- **Puede vender:** Persona natural (DNI + declaración jurada) o empresa (RUC + inventario de baja)
- **Puede comprar:** **SOLO** Empresa Operadora de Residuos Sólidos (EO-RS) con autorización RAEE del MINAM
- **Fiscaliza:** MINAM + OEFA
- **Riesgo:** Alto | **Multa OEFA:** hasta **840 UIT (~S/4.4 millones)**
- **Ley:** D.S. N° 009-2019-MINAM (Régimen REP — Responsabilidad Extendida del Productor)

### 🔴 Nivel 4 — Residuos Críticos (Peligrosos)
- **Materiales:** Aceites usados, solventes industriales, residuos hospitalarios, cianuro, químicos corrosivos
- **Puede vender:** **SOLO** empresas con Plan de Manejo aprobado + Manifiesto en SIGERSOL (MINAM)
- **Puede comprar:** **SOLO** EO-RS con autorización específica + póliza ambiental + infraestructura especializada
- **Transporte:** **SOLO** vehículos MATPEL autorizados por MTC + conductor con licencia A-IV
- **Fiscaliza:** MINAM + OEFA + DIGESA + MTC + SUTRAN + Fiscalía Ambiental (FEMA)
- **Riesgo:** Muy Alto | **Pena penal:** Art. 307 Código Penal → **4 a 6 años de prisión**

---

## 🃏 Estructura de la Tarjeta Legal (JSON)

Mismo mecanismo que las tarjetas de ideas, pero con campos legales:

```json
{
  "legalCardType": "nivel-regulatorio | requisito-vendedor | requisito-comprador | transporte | tributario | riesgo-legal",
  "titulo": "Nivel 2 — Residuo Controlado",
  "descripcion": "El bagazo es orgánico putrescible. Genera lixiviados y olores si no se maneja bien.",
  "nivelRegulatorio": 2,
  "colorNivel": "verde | amarillo | naranja | rojo",
  "entidadesFiscalizadoras": ["DIGESA", "SENASA", "Municipalidad"],
  "puedeVenderPersonaNatural": true,
  "compradorRequiereEORS": false,
  "riesgoLegal": "bajo | medio | alto | muy-alto",
  "multaMaximaReferencial": "hasta 840 UIT (~S/4.4 millones)",
  "documentosVendedor": [
    "DNI o RUC activo",
    "Evidencia fotográfica del residuo",
    "Declaración de origen del material"
  ],
  "documentosComprador": [
    "RUC activo",
    "Licencia de funcionamiento",
    "Zona de almacenamiento certificada"
  ],
  "nextStep": "Verifica que tu comprador tenga RUC y licencia municipal antes de cerrar el trato.",
  "iconName": "shield | warning | document | law | truck | money | ban",
  "leyPrincipal": "D.L. N° 1278 — Ley de Gestión Integral de Residuos Sólidos",
  "alertaEspecial": "⚠️ Este residuo requiere Manifiesto en el SIGERSOL del MINAM"
}
```

---

## 💡 Funcionalidades Propuestas para el Bot

### 1. 🏷️ Clasificador de Nivel Regulatorio
Cuando el usuario menciona cualquier residuo, el bot le indica automáticamente en qué nivel cae y qué implica.

### 2. ⚖️ Asesor de Base Legal (Vendedor / Comprador)
- **Modo Vendedor:** qué puede hacer, qué no, qué documentos necesita
- **Modo Comprador:** si necesita EO-RS, qué requiere para operar legalmente

### 3. 💸 Calculadora de Detracciones SUNAT (SPOT)
La venta de residuos está sujeta al Sistema de Detracciones (R.S. N° 183-2004/SUNAT).
- Tasa general: **15%** del valor de la operación
- Tasa con renuncia de exoneración: **10%**
- El bot calcula automáticamente cuánto retendrá SUNAT y explica que NO es una pérdida

**Ejemplo:**
```
Venta: 500 kg de chatarra × S/1.50 = S/750.00
SUNAT retiene (10%): S/75.00 → va a tu Cuenta de Detracciones BN
Tú recibes: S/675.00 en tu cuenta bancaria
```

### 4. 📋 Checklist de Documentos por Residuo
Lista de chequeo personalizada según tipo de residuo + perfil del usuario (persona natural vs empresa).

### 5. 🔍 Verificador de Compradores (¿Es Legítimo?)
Guía al vendedor para verificar si el comprador está registrado en el MINAM como EO-RS antes de cerrar el trato.

### 6. 🚛 Guía de Transporte por Nivel
- Nivel 1: cualquier flete
- Nivel 2: contenedor cerrado e higienizado
- Nivel 3: empresa con registro + seguro
- Nivel 4: MATPEL (MTC) + licencia A-IV + seguro especial

### 7. 🆘 Modo Emergencia — Residuo Peligroso No Identificado
Si el usuario describe algo que suena peligroso, el bot activa una alerta inmediata con instrucciones de seguridad y contactos de emergencia (OEFA: 0800-00-543).

### 8. 👷 Modo Reciclador de Base (Ley N° 29419)
Explica los derechos de los recicladores informales y cómo formalizarse paso a paso a través de la asociación con una municipalidad.

### 9. 🏭 Módulo REP para Empresas Importadoras
Para fabricantes/importadores de electrónicos con obligaciones del Régimen de Responsabilidad Extendida del Productor (D.S. N° 009-2019-MINAM). Multas de hasta 840 UIT si no cumplen sus metas anuales de recolección de RAEE.

### 10. 📈 Historial de Sesión + Ingreso Estimado Total
Aprovecha la memoria de sesión del bot para:
- Recordar los residuos ya consultados
- Calcular el ingreso potencial estimado de todos los residuos juntos
- Sugerir publicarlos en el Marketplace cuando el usuario tenga suficiente información

### 11. 🗺️ Expansión Regional
Más allá de Lima, Arequipa y Cusco: agregar Piura, Trujillo, Chiclayo, Huancayo, Iquitos con recicladores, EO-RS y contactos municipales reales.

---

## 🔧 Nodos del Workflow n8n que se Modificarían

| Nodo | Cambio propuesto |
|---|---|
| `Enrich Context` | Nuevas detecciones de intención legal y perfil (vendedor/comprador/empresa/persona natural) |
| `AI Agent` → System Prompt | Secciones nuevas: tabla de niveles regulatorios, leyes peruanas, SUNAT SPOT, detección de peligrosidad |
| `Validate & Normalize` | Extraer y validar el nuevo array `tarjetasLegales` además de `sugerencias` |
| `Action Generator` | Generar campo `action` también para tarjetas legales (pasos concretos por tipo) |

### Lo que NO cambia:
- ✅ Webhook `/ecobot`
- ✅ Nodo `Normalize Input`
- ✅ Google Gemini + Memoria de sesión
- ✅ Analytics Logger
- ✅ Nodo `Respond`

---

## 🖥️ Impacto en el Frontend Angular

Se necesitaría un nuevo componente de **Tarjeta Legal** diferenciado visualmente de las tarjetas de ideas:

| | Tarjeta de Ideas | Tarjeta Legal |
|---|---|---|
| Color base | Verde / azul (eco) | Gris / azul profundo (formal) |
| Icono | `recycle`, `leaf`, `cash` | `shield`, `document`, `warning`, `law` |
| Borde superior | Verde degradado | Color del nivel (🟢🟡🟠🔴) |
| CTA principal | "¿Cómo empezar?" | "Ver documentos requeridos" |
| Tono | Motivacional / emprendedor | Profesional / preventivo |

---

## 📐 Flujo Visual Completo (Modo `completo`)

```
Usuario: "Somos empresa y tenemos aceite industrial usado"
                        ↓
        Enrich Context detecta:
        ├── categoria: "hidrocarburo"
        ├── userProfile: "empresa"
        ├── userIntent: "monetizar"
        └── modo sugerido: "completo"
                        ↓
        Gemini genera respuesta con:
        ┌─────────────────────────────────────┐
        │ tarjetasLegales:                    │
        │  [🔴 Nivel 4 — Crítico]            │
        │  [📋 Documentos del vendedor]       │
        │  [🏢 Perfil del comprador legal]    │
        │  [🚛 Transporte MATPEL obligatorio] │
        │  [⚠️ Riesgo penal Art. 307 CP]      │
        │                                     │
        │ sugerencias:                        │
        │  [Venta a EO-RS certificada]        │
        │  [Rerefinación industrial]          │
        └─────────────────────────────────────┘
                        ↓
        Frontend Angular renderiza:
        ┌───────────────────────────────────────────┐
        │ "El aceite industrial es Nivel 4..."       │
        ├───────────────────────────────────────────┤
        │ ⚖️ CONSIDERACIONES LEGALES IMPORTANTES    │
        │ [🔴 Nivel 4—Crítico] [📋 Documentos]      │
        │ [🏢 Solo EO-RS] [🚛 MATPEL]              │
        │ [⚠️ Riesgo Penal]                         │
        ├───────────────────────────────────────────┤
        │ 💡 IDEAS PARA TU RESIDUO                  │
        │ [Venta a EO-RS] [Rerefinación]            │
        └───────────────────────────────────────────┘
```

---

## 📚 Marco Legal de Referencia

| Norma | Sobre qué aplica |
|---|---|
| **D.L. N° 1278** | Ley de Gestión Integral de Residuos Sólidos (base general) |
| **D.S. N° 014-2017-MINAM** | Reglamento de D.L. 1278 (clasificación de residuos) |
| **Ley N° 29419** | Regula la actividad de los recicladores de base |
| **D.S. N° 005-2010-MINAM** | Reglamento de Ley del Reciclador |
| **D.S. N° 009-2019-MINAM** | Régimen especial RAEE + Responsabilidad Extendida del Productor (REP) |
| **Ley N° 28256** | Transporte terrestre de materiales y residuos peligrosos |
| **D.S. N° 021-2008-MTC** | Reglamento de transporte MATPEL |
| **R.S. N° 183-2004/SUNAT** | Sistema de Detracciones (SPOT) para venta de residuos |
| **Ley N° 28611** | Ley General del Ambiente (responsabilidad solidaria) |
| **Art. 307 — Código Penal** | Tráfico ilegal de residuos peligrosos (4-6 años) |
| **Res. CD N° 00013-2021-OEFA** | Multas por incumplimiento en gestión de RAEE |
| **Res. CD N° 017-2019-OEFA** | Multas por incumplimiento en infraestructuras de residuos |

---

## ✅ Tabla de Priorización de Implementación

| # | Funcionalidad | Impacto | Dificultad | Recomendación |
|---|---|---|---|---|
| 1 | Clasificador de Nivel Regulatorio (tarjeta) | 🔴 Alto | 🟢 Baja | **Implementar primero** |
| 2 | Tarjeta de Documentos Requeridos | 🔴 Alto | 🟢 Baja | **Implementar primero** |
| 3 | Tarjeta de Alerta de Riesgo Legal | 🔴 Alto | 🟢 Baja | **Implementar primero** |
| 4 | Modo `completo` (ideas + legal) | 🔴 Alto | 🟡 Media | Segundo bloque |
| 5 | Calculadora Detracciones SUNAT | 🟠 Medio | 🟢 Baja | Segundo bloque |
| 6 | Modo Reciclador de Base | 🟠 Medio | 🟢 Baja | Segundo bloque |
| 7 | Modo Emergencia / Peligroso | 🔴 Alto | 🟢 Baja | Segundo bloque |
| 8 | Tarjeta de Transporte por Nivel | 🟠 Medio | 🟢 Baja | Tercer bloque |
| 9 | Verificador de Compradores EO-RS | 🟠 Medio | 🟡 Media | Tercer bloque |
| 10 | Módulo REP para Empresas | 🟡 Importante | 🟡 Media | Tercer bloque |
| 11 | Historial + Ingreso Total Estimado | 🟡 Importante | 🟡 Media | Cuarto bloque |
| 12 | Expansión Regional (más ciudades) | 🟡 Importante | 🔴 Alta | Cuarto bloque |

---

*ReciclaYa / Revalora IA — Innovación Circular para el Campo.*
