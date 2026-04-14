# Sagrada Madre CRM - Estrategia de Caché Frontend (Opción B)
> Guardado para futura implementación cuando se relacione con el Backend Spring Boot.

## Arquitectura de Estado Global (BehaviorSubject Caché)
El objetivo es montar la aplicación sobre un sistema de Caché local Reactiva utilizando RxJS `BehaviorSubject`. Esto permite que la aplicación cargue de manera instantánea al moverse entre pestañas (Dashboard, Directorio, Métricas) sin tener que contactar al servidor cada vez.

### 1. El Flujo de Iniciación (Carga Única)
Cuando el usuario (Admin) inicia sesión exitosamente en el sistema:
1. `DataService` (o `ClienteService` / `TratoService`) hace un **único `HTTP GET`** masivo a la Base de Datos (`/api/clientes`, `/api/tratos`, etc.).
2. La respuesta del Backend de Spring (JSON) se inyecta directamente dentro de un `BehaviorSubject` en el servicio del FrontEnd.
3. Ejemplo: `this.clientesSubject.next(respuestaBackend);`

### 2. El Flujo de Lectura (Componentes)
Cualquier componente que necesite la lista de clientes (Directorios, Desplegables del modal, Tablas):
* No se comunica más a través de HTTP GET.
* Se suscribe al observable derivado del BehaviorSubject (`this.dataService.clientes$`).
* **Beneficio Técnico:** 0ms de tiempo de carga entre transiciones del Frontend.

### 3. Modificaciones en la Base de Datos (Sincronización Bidireccional)
El desafío de usar Caché Frontend es la sincronización de datos ante operaciones CRUD (Crear, Editar, Borrar). 

**Procedimiento al Agregar un Nuevo Cliente (POST):**
1. Interfaz dispara: `this.http.post('/api/clientes', nuevoCliente)`.
2. Esperamos a que Spring confirme que se creó correctamente y devuelva el *Objeto Nuevo (incluyendo el ID de BD)*.
3. El frontend actualiza su Caché local en memoria inyectando el objeto devuelto al array del `BehaviorSubject`.
```typescript
addCliente(cliente: Cliente) {
  this.http.post<Cliente>('/api/clientes', cliente).subscribe(backendRes => {
    const currentState = this.clientesSubject.getValue();
    this.clientesSubject.next([...currentState, backendRes]);
  });
}
```

### 4. Modificaciones del Kanban a Tiempo Real (PUT)
Cuando se arrastra una tarjeta del Kanban para avanzar un Trato "Prospecto" a "Propuesta":
1. Al soltar la tarjeta (drop), el Frontend reordena visualmente la columna para dar respuesta instantánea al usuario (**Optimistic UI**).
2. De fondo se dispara: `this.http.put('/api/tratos/{id}/etapa', nuevaEtapa)`.
3. Si el servidor devuelve error 500 o fallo, el Frontend revierte la tarjeta a su columna anterior y muestra una alerta visual al usuario indicando el fallo de red.

---
*Este documento garantiza que el equipo de desarrollo pueda retomar exactamente la misma arquitectura propuesta en la Fase de Conceptualización.*
