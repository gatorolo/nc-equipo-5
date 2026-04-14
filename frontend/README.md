# Frontend

1. El AppComponent
 (Layout Principal y KPIs)

Este es el marco de la aplicación, el "esqueleto" que contiene todo lo demás.

Sidebar (Menú Lateral Izquierdo): Es una barra de navegación colapsable (con fondo Azul Cobalto). Su función principal es guiar al usuario por los distintos módulos del CRM (Dashboard, Directorio, Configuraciones, etc.). Implementamos una lógica visual responsiva: cuando se colapsa, solo muestra los íconos para ahorrar espacio, lo cual es típico en SaaS empresariales.
Topbar (Barra Superior): Contiene un buscador global (que por el momento es visual), el ícono de notificaciones y el resumen del perfil del usuario logueado en la esquina derecha.
Tarjetas de KPIs (Key Performance Indicators): Son las 4 tarjetas blancas en la parte superior del contenido central ("Total Clientes", "Tratos Abiertos", "Ingresos Mensuales", "Tareas Pendientes"). Estas tarjetas dan un resumen ejecutivo rápido. Ojo aquí: Los datos de estas tarjetas no están fijos en el HTML; el 

AppComponent
 se suscribe al 
DataService
 en el método 
ngOnInit()
 y recibe un array de objetos tipo 

Kpi
. Cuando conectes con Java, solo cambiarás el endpoint del servicio y estas tarjetas se llenarán con datos reales de la base de datos automáticamente.
2. El 

ClienteListComponent
 (El Directorio)
Este componente se encarga de mostrar la tabla avanzada de clientes.

Buscador en Tiempo Real: En la esquina superior izquierda de la tabla hay un input de búsqueda. Cada vez que el usuario escribe algo, se dispara la función 

actualizarBusqueda()
. Esta función toma el valor y el HTML llama 

getClientesFiltrados()
, lo que hace que la tabla se actualice instantáneamente filtrando por nombre o empresa sin necesidad de un botón de "Buscar".
Filtros Rápidos (Píldoras de Estado): Son los botones "Todos", "Activos", e "Inactivos". Al hacer clic en uno, ajusta el filtro y la tabla se re-renderiza con la animación de colores correspondiente.
La Tabla: Utilizamos el pipe | date de Angular en la columna "Última Interacción" para que una fecha estándar (2023-10-25) se vea en formato legible como "Oct 25, 2023". Al igual que los KPIs, esta tabla se llena iterando (*ngFor) sobre la respuesta del 

DataService
.
3. El KanbanBoardComponent
 (El "Pipeline" de Ventas)
Es la vista visual más compleja, utilizada para rastrear el progreso de una venta.

Estructura de Columnas: En lugar de codificar cuatro columnas distintas a mano, creé un arreglo de configuración (columnas). El HTML itera sobre este arreglo creando dinámicamente cada columna (Prospecto, Negociación, Propuesta, Cerrado) y aplicándoles su color (azul, amarillo, violeta, verde).
Clasificación Automática: Dentro de cada columna, usamos un método inteligente 

getTratosPorEtapa(nombreColumna)
. Esto toma toda la lista total de tratos obtenida del 

DataService
 y filtra únicamente los que corresponden a esa columna en particular.
Tarjetas de Oportunidad: Muestran la empresa, el nombre del trato y utilizamos el pipe | currency de Angular para formatear números crudos en moneda (ej. de 15400 a $15,400).
4. El DataService
 (

mock-data.service.ts
)
Es el "corazón" de este MVP y la clave para no tener que reescribir nada del frontend una vez que el backend esté listo.

Su función es aislar a los componentes de la lógica de cómo se obtienen los datos.
Por ahora, usa "Observables" simulados creados con of() y un operador delay(). Esto hace que el frontend actúe como si estuviera esperando una respuesta de internet real, obligando a los componentes a ser asíncronos.




