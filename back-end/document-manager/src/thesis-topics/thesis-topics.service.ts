import { Injectable, Inject } from '@nestjs/common';
import { ThesisTopic } from '../interfaces/thesis-topic.interface';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'

@Injectable()
export class ThesisTopicsService {
  private thesisTopics: ThesisTopic[] = [];

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

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
  async enrollStudent(title: string, email: string): Promise<void> {
    const users = await this.userModel.find();
    for (const user of users) {
      const userTopic = user.topics.find((t: any) => t.title === title);
      if (userTopic) {
        if (userTopic.enrolledStudents.includes(email)) {
          throw new BadRequestException('El estudiante ya está inscrito en este tema');
        }
        userTopic.enrolledStudents.push(email);
        await user.save();
      }
    }
    console.log('Estudiante inscrito correctamente:', email);
  }
  async unsubscribeStudent(title: string, email: string): Promise<void> {
    const users = await this.userModel.find();
    for (const user of users) {
      const userTopic = user.topics.find((t: any) => t.title === title);
      if (userTopic) {
        const index = userTopic.enrolledStudents.indexOf(email);
        if (index !== -1) {
          userTopic.enrolledStudents.splice(index, 1);
          await user.save();
          console.log('Estudiante desuscrito correctamente:', email);
        } else {
          throw new BadRequestException('El estudiante no está inscrito en este tema');
        }
      }
    }
  }
}