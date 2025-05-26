import { Injectable } from '@nestjs/common';
import { ThesisTopic } from '../interfaces/thesis-topic.interface';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class ThesisTopicsService {
  private thesisTopics: ThesisTopic[] = [];

  create(topic: ThesisTopic): ThesisTopic {
    const newTopic = { ...topic, id: (this.thesisTopics.length + 1).toString() };
    this.thesisTopics.push(newTopic);
    return newTopic;
  }

  findAll(): ThesisTopic[] {
    return this.thesisTopics;
  }

  delete(id: string): void {
    this.thesisTopics = this.thesisTopics.filter((topic) => topic.id !== id);
  }

  async enrollStudent(topicId: string, email: string): Promise<void> {
    const topic = this.thesisTopics.find((topic) => topic.id === topicId);
    if (!topic) {
      throw new NotFoundException('Tema de tesis no encontrado');
    }
    if (topic.enrolledStudents.includes(email)) {
      throw new BadRequestException('El estudiante ya está inscrito en este tema');
    }
    if (topic.availableSlots <= 0) {
      throw new BadRequestException('No hay cupos disponibles para este tema');
    }
  
    topic.enrolledStudents.push(email);
    topic.availableSlots -= 1;
    console.log('Estudiante inscrito correctamente:', email);

    // Persist changes if necessary using a database or other mechanism
    // For now, the in-memory array is already updated, so no further action is needed.
  }
}