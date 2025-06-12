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
async delete(title: string): Promise<void> {
  const cleanTitle = title.trim().toLowerCase();

  this.thesisTopics = this.thesisTopics.filter(
    topic => topic.title.trim().toLowerCase() !== cleanTitle
  );

  const users = await this.userModel.find();
  for (const user of users) {
    const originalLength = user.topics.length;
    user.topics = user.topics.filter(
      topic => topic.title.trim().toLowerCase() !== cleanTitle
    );
    if (user.topics.length !== originalLength) {
      await user.save();
    }
  }
}
async enrollStudent(title: string, email: string, name: string): Promise<void> {
  // 1. Actualiza en memoria (opcional)
  // const topic = this.thesisTopics.find((topic) => topic.title === title);
  // if (topic) {
  //   if (topic.enrolledStudents.includes(email)) {
  //     throw new BadRequestException('El estudiante ya está inscrito en este tema');
  //   }
  //   // if (topic.avaliableSlots <= 0) {
  //   //   throw new BadRequestException('No hay cupos disponibles para este tema');
  //   // }
  //   topic.enrolledStudents.push(email, name);
  // }

  // 2. Actualiza en la base de datos (en el profesor)
  const users = await this.userModel.find();
  for (const user of users) {
    const userTopic = user.topics.find((t: any) => t.title === title);
    if (userTopic) {
      if (userTopic.enrolledStudents.includes(email)) {
        throw new BadRequestException('El estudiante ya está inscrito en este tema');
      }
      //if (userTopic.avaliableSlots <= 0) {
      //  throw new BadRequestException('No hay cupos disponibles para este tema');
      //}
      userTopic.enrolledStudents.push(email, name);
      await user.save();
    }
  }
  console.log('Estudiante inscrito correctamente:', email);
}
}
