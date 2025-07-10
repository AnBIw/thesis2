# Backend - Propuestas de Temas de Tesis

## Implementación Completada

### Nuevos Archivos

#### 1. Interface ProposedTopic
**Ubicación:** `src/interfaces/proposed-topic.interface.ts`

```typescript
export interface ProposedTopic {
  id?: string;
  title: string;
  description: string;
  studentName: string;
  justification: string;
  proposedToProfessor: string;
  professorEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Métodos Agregados al Servicio

#### ThesisTopicsService
**Ubicación:** `src/thesis-topics/thesis-topics.service.ts`

##### Nuevos Métodos:

1. **`proposeThesisTopic(proposedTopic: ProposedTopic)`**
   - Crea una nueva propuesta de tema
   - Valida que el profesor existe
   - Asigna ID único y timestamps
   - Retorna la propuesta creada

2. **`getProposedTopics()`**
   - Obtiene todas las propuestas
   - Retorna array completo de propuestas

3. **`getProposedTopicsByProfessor(professorName: string)`**
   - Filtra propuestas por profesor específico
   - Útil para que los profesores vean sus propuestas pendientes

4. **`getProposedTopicsByStudent(studentName: string)`**
   - Filtra propuestas por estudiante específico
   - Útil para el historial del estudiante

5. **`updateProposalStatus(proposalId: string, status: 'approved' | 'rejected')`**
   - Actualiza el estado de una propuesta
   - Si se aprueba, automáticamente crea un tema oficial
   - El estudiante que propuso queda automáticamente inscrito

6. **`deleteProposal(proposalId: string)`**
   - Elimina una propuesta específica
   - Control de errores si no existe

### Endpoints Agregados al Controlador

#### ThesisTopicsController
**Ubicación:** `src/thesis-topics/thesis-topics.controller.ts`

##### Nuevas Rutas:

### POST /thesis-topics/propose
**Descripción:** Crear nueva propuesta de tema
**Body:**
```json
{
  "title": "string",
  "description": "string",
  "studentName": "string",
  "studentId": "string",
  "justification": "string",
  "proposedToProfessor": "string"
}
```
**Response:** `ProposedTopic`

### GET /thesis-topics/proposals
**Descripción:** Obtener propuestas (con filtros opcionales)
**Query Parameters:**
- `professor`: Filtrar por nombre del profesor
- `student`: Filtrar por nombre del estudiante
**Response:** `ProposedTopic[]`

**Ejemplos:**
- `GET /thesis-topics/proposals` - Todas las propuestas
- `GET /thesis-topics/proposals?professor=Juan%20Pérez` - Propuestas para Juan Pérez
- `GET /thesis-topics/proposals?student=María%20González` - Propuestas de María González

### PATCH /thesis-topics/proposals/:id
**Descripción:** Actualizar estado de propuesta
**Params:** `id` - ID de la propuesta
**Body:**
```json
{
  "status": "approved" | "rejected"
}
```
**Response:** `ProposedTopic`

### DELETE /thesis-topics/proposals/:id
**Descripción:** Eliminar propuesta
**Params:** `id` - ID de la propuesta
**Response:** `void`

## Flujo de Trabajo

### 1. Estudiante Propone Tema
```
POST /thesis-topics/propose
└── Valida profesor existe
└── Crea propuesta con status 'pending'
└── Asigna ID y timestamps
└── Retorna propuesta creada
```

### 2. Profesor Revisa Propuestas
```
GET /thesis-topics/proposals?professor=NombreProfesor
└── Retorna lista de propuestas pendientes
```

### 3. Profesor Aprueba/Rechaza
```
PATCH /thesis-topics/proposals/:id
└── Si approved: 
    ├── Actualiza status
    ├── Crea tema oficial automáticamente
    └── Inscribe al estudiante automáticamente
└── Si rejected:
    └── Solo actualiza status
```

## Características Implementadas

✅ **Validación de Profesor:** Verifica que el profesor existe antes de crear propuesta
✅ **IDs Únicos:** Genera IDs automáticamente para cada propuesta
✅ **Timestamps:** Registra fecha de creación y actualización
✅ **Conversión Automática:** Propuestas aprobadas se convierten en temas oficiales
✅ **Inscripción Automática:** El estudiante que propuso queda inscrito automáticamente
✅ **Filtros Flexibles:** Búsqueda por profesor o estudiante
✅ **Manejo de Errores:** Validaciones y excepciones apropiadas

## Estado del Sistema

### Datos en Memoria
- `thesisTopics[]` - Temas oficiales existentes
- `proposedTopics[]` - Propuestas de estudiantes

### Persistencia
- Las propuestas se almacenan en memoria (para desarrollo)
- Los temas aprobados se persisten en MongoDB vía esquema User
- Recomendación futura: Crear esquema MongoDB para propuestas

## Próximos Pasos Recomendados

1. **Persistencia:** Crear esquema MongoDB para propuestas
2. **Notificaciones:** Sistema de notificaciones para profesores
3. **Email:** Notificaciones por email cuando hay nuevas propuestas
4. **Comentarios:** Sistema de feedback en propuestas rechazadas
5. **Historial:** Mantener historial completo de cambios de estado
