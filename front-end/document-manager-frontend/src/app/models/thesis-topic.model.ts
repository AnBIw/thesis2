export interface ThesisTopic {
    id: string;
    title: string;
    description: string;
    professor: string;
    avaliableSlots: number;
    students: string[];
}

export interface students {
    id: string;
    name: string;
    email: string;
}