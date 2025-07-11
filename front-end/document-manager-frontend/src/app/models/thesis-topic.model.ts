export interface ThesisTopic {
    id: string;
    title: string;
    description: string;
    professor: string;
    avaliableSlots: number;
    enrolledStudents: students[];
}

export interface students {
    id: string;
    name: string;
    email: string;
}

// Nueva interfaz para el tema de tesis actual del estudiante
export interface TesisActual {
    titulo: string;
    descripcion: string;
    profesor: string;
    estado: 'aprobado' | 'en_proceso';
    fechaAsignacion: Date;
}

// Interfaz para usuario actualizada
export interface User {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    role: string;
    specialty?: string;
    tesisActual?: TesisActual; // Solo para estudiantes
}