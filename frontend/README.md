# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Angular CLI includes helpfull commands to generate various Angular artifacts:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# Documentacion Funcional por Modulos

Esta seccion detalla la estructura logica del frontend, incluyendo rutas, componentes de la interfaz (UI) y explicacion detallada de funciones para facilitar la comprension por parte de agentes de IA y desarrolladores.

---

### 1. Modulo: Autenticacion (Auth)
- **Rutas**: `/auth/login`, `/auth/register`
- **Vista: Login (Inicio de Sesion)**
    - **Elementos UI**: Campos de Email y Password con iconos de Lucide, boton de 'Ingresar', opciones de login social (Google).
    - **Componentes**: Lucide Icons, ReactiveFormsModule.
    - **Funciones**:
        - `togglePasswordVisibility`: Cambia el estado visual del campo de password entre puntos y texto claro para que el usuario verifique lo escrito.
        - `submit`: Realiza la validacion de formato de email y presencia de password. Si es valido, invoca al AuthFacade para iniciar la sesion.
        - `continueWithGoogle`: Redirige al flujo de autenticacion de Google para obtener el token de acceso.
- **Vista: Registro**
    - **Elementos UI**: Selector de tipo de cuenta (Empresa o Persona Natural), formulario dinamico segun la seleccion.
    - **Componentes**: AccountTypeSelectorComponent, CompanyRegisterFormComponent, NaturalPersonRegisterFormComponent.
    - **Funciones**:
        - `onAccountTypeChange`: Actualiza el tipo de cuenta seleccionado en el estado para renderizar el formulario correspondiente.
        - `submitCompany`: Captura datos como RUC, Razon Social y contacto para registrar una entidad juridica.
        - `submitNaturalPerson`: Captura nombres, apellidos y DNI para registrar un perfil individual.

---

### 2. Modulo: Mercado (Marketplace)
- **Ruta**: `/marketplace`
- **Vista: Exploracion de Residuos**
    - **Elementos UI**: Barra de busqueda global, panel lateral de filtros (Tipo de residuo, Sector, Modo de entrega), tarjetas de producto con badges de 'Urgente' o 'Recomendado'.
    - **Componentes**: EmptyStateComponent, MarketplaceFiltersComponent, RecommendedListingCardComponent, MarketplaceProductCardComponent, DefaultChatBubbleComponent.
    - **Funciones**:
        - `saveSearch`: Almacena los criterios de filtrado actuales para que el sistema notifique al usuario cuando aparezcan nuevos productos similares.
        - `publishWaste`: Verifica si el usuario esta logueado y lo redirige al flujo de publicacion de nuevos residuos.
        - `toggleFilters`: Abre o cierra el panel de filtros avanzados en dispositivos moviles.
        - `setSort`: Aplica criterios de ordenamiento como 'Mas reciente', 'Precio mas bajo' o 'Precio mas alto'.
        - `loadMore`: Implementa el scroll infinito para traer mas publicaciones conforme el usuario baja en la pagina.
        - `openEcoChatWithMessage`: Abre el asistente IA e inicia una conversacion contextual basada en los terminos buscados por el usuario.

---

### 3. Modulo: Asistente IA (Assistant Chat)
- **Ruta**: `/assistant-chat`
- **Vista: Chat del Asistente Eco**
    - **Elementos UI**: Ventana de chat tipo burbujas, botones de sugerencias rapidas (chips), tarjetas de recomendaciones con puntaje de complejidad y potencial de mercado.
    - **Componentes**: ChatMessageBubbleComponent, TypingIndicatorComponent, ProductSuggestionCardsComponent, QuickSuggestionChipsComponent, ChatInputComponent, QuickLinksCardComponent.
    - **Funciones**:
        - `sendMessage`: Envia el input del usuario al backend para ser procesado por el modelo de lenguaje (IA) y generar recomendaciones de economia circular.
        - `applySuggestion`: Toma el texto de un chip de sugerencia y lo envia automaticamente como un mensaje del usuario.
        - `clearConversation`: Limpia la pantalla de chat y reinicia el contexto de la conversacion para una nueva consulta.
        - `toggleTts`: Activa el sintetizador de voz para leer en voz alta las respuestas del asistente.
        - `onProductSelected`: Al seleccionar una idea de producto sugerida, guarda la seleccion y redirige al flujo de recomendaciones detalladas.

---

### 4. Modulo: Venta de Residuos (Waste Sell)
- **Ruta**: `/app/waste-sell`
- **Vista: Publicar Residuo**
    - **Elementos UI**: Formulario por pasos, area de carga de fotos (drag and drop), previsualizacion en tiempo real de como se vera el anuncio.
    - **Componentes**: SectionHeaderComponent, WasteUploadZoneComponent, WastePreviewCardComponent.
    - **Funciones**:
        - `publish`: Valida todos los campos obligatorios (cantidad, precio, ubicacion) y publica el anuncio en el marketplace.
        - `previewNow`: Sincroniza los datos actuales del formulario con el componente de previsualizacion para mostrar cambios inmediatos.
        - `analyzeWithAi`: Envia la descripcion del residuo a la IA para obtener ideas sobre como transformarlo en productos de mayor valor.
        - `onFilesAdded`: Procesa las imagenes seleccionadas, valida tamaño/formato y las prepara para la subida a Supabase Storage.

---

### 5. Modulo: Panel de Impacto (Dashboard)
- **Ruta**: `/app/dashboard`
- **Vista: Dashboard de Impacto**
    - **Elementos UI**: Graficos circulares de impacto ambiental, tablas de ahorro en emisiones, selector de periodo de tiempo (7 dias, 30 dias, 1 año).
    - **Componentes**: DashboardPeriodFilterComponent, ExportDataButtonComponent, ImpactKpiCardComponent, ProductMatrixChartComponent, ProductMatrixTableComponent, QuarterlyImprovementScoreComponent.
    - **Funciones**:
        - `onPeriodChange`: Actualiza todas las metricas del tablero basandose en el rango de fechas seleccionado.
        - `onExportRequested`: Genera un reporte descargable en formato CSV con los datos crudos del impacto generado.

---

### 6. Modulo: Gestion de Pedidos (Orders & Pre-orders)
- **Rutas**: `/app/orders` (Lista), `/app/pre-orders/new/:listingId` (Nueva orden)
- **Vista: Mis Pedidos**
    - **Elementos UI**: Listado de transacciones con ID, fecha y monto total. Badges de estado (Pagado, En Proceso, Cancelado).
    - **Componentes**: CardComponent, BadgeComponent.
    - **Funciones**:
        - `badgeStatus`: Asigna estilos visuales a los estados segun su semantica (exito, advertencia o informacion).
- **Vista: Nueva Orden de Compra (Pre-order)**
    - **Elementos UI**: Resumen de costos con impuestos y comisiones, selector de metodo de pago, modal para ingreso de datos de tarjeta simulada.
    - **Componentes**: PaymentMethodSelectorComponent, PreOrderEconomicSummaryComponent, ProductPreOrderSummaryComponent, SellerInfoCardComponent, CardPaymentModalComponent.
    - **Funciones**:
        - `simulateAndSubmit`: Procesa la creacion del pedido. Si el pago es con tarjeta, activa el flujo de validacion simulada.
        - `selectPayment`: Cambia el metodo de pago activo y recalcula el resumen economico si aplican comisiones distintas.
        - `downloadReceipt`: Descarga un documento PDF que sirve como constancia legal de la operacion realizada.

---

### 7. Modulo: Perfil de Usuario (Profile)
- **Ruta**: `/app/profile`
- **Vista: Mi Perfil**
    - **Elementos UI**: Secciones de datos de contacto, informacion de empresa (RUC, Direccion), gestion de imagenes de perfil y logo corporativo.
    - **Componentes**: SectionHeaderComponent, CardComponent.
    - **Funciones**:
        - `save`: Envia los cambios realizados en el formulario al servidor para actualizar el perfil del usuario o empresa.
        - `onAvatarSelected`: Permite elegir una nueva foto de perfil y gestiona su almacenamiento permanente.
        - `onCompanyLogoSelected`: Gestiona especificamente la carga y actualizacion del logo para perfiles tipo empresa.

---

### 8. Modulo: Mis Publicaciones (My Listings)
- **Ruta**: `/app/my-listings`
- **Vista: Gestion de anuncios propios**
    - **Elementos UI**: Grid de tarjetas que muestran los residuos publicados por el usuario, con opciones para editar o ver el detalle.
    - **Componentes**: EmptyStateComponent, MarketplaceProductCardComponent.
    - **Funciones**:
        - Carga automatica de los anuncios vinculados a la cuenta del usuario para su monitoreo de stock y disponibilidad.
