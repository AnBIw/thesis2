import { Injectable, Inject } from '@nestjs/common';
import { ThesisTopic } from '../interfaces/thesis-topic.interface';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'

@Injectable()
export class ThesisTopicsService {
  private thesisTopics: ThesisTopic[] = [];

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(topic: ThesisTopic): Promise<ThesisTopic> {
  // Crea el nuevo tema
  const newTopic = { 
    ...topic, 
    id: (this.thesisTopics.length + 1).toString(),
    enrolledStudents: topic.enrolledStudents || [],
  };
  this.thesisTopics.push(newTopic);

  // Busca al profesor por nombre y agrega el tema a su lista
  const user = await this.userModel.findOne({ name: topic.professor });
  if (!user) throw new NotFoundException('Profesor no encontrado');
  user.topics.push({
    title: newTopic.title,
    description: newTopic.description,
    avaliableSlots: newTopic.avaliableSlots,
    enrolledStudents: newTopic.enrolledStudents,
  });
  await user.save();

  return newTopic;
}

  findAll(): ThesisTopic[] {
    return this.thesisTopics;
  }

  delete(id: string): void {
    this.thesisTopics = this.thesisTopics.filter((topic) => topic.title !== id);
  }

  async enrollStudent(topicId: string, email: string): Promise<void> {
    const topic = this.thesisTopics.find((topic) => topic.title === topicId);
    if (!topic) {
      throw new NotFoundException('Tema de tesis no encontrado');
    }
    if (topic.enrolledStudents.includes(email)) {
      throw new BadRequestException('El estudiante ya está inscrito en este tema');
    }
    if (topic.avaliableSlots <= 0) {
      throw new BadRequestException('No hay cupos disponibles para este tema');
    }
  
    topic.enrolledStudents.push(email);
    topic.avaliableSlots -= 1;
    console.log('Estudiante inscrito correctamente:', email);

    // Persist changes if necessary using a database or other mechanism
    // For now, the in-memory array is already updated, so no further action is needed.
  }
}