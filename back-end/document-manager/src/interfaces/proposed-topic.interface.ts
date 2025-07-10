export interface ProposedTopic {
  id?: string;
  title: string;
  description: string;
  studentName: string;
  justification: string;
  proposedToProfessor: string;
  professorEmail?: string;
  status: 'pending' | 'pre-selected' | 'approved' | 'rejected';
  preselectionComment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
