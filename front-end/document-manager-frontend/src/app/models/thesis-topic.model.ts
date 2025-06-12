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