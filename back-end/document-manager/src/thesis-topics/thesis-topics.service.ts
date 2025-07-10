import { Injectable, Inject } from '@nestjs/common';
import { ThesisTopic } from '../interfaces/thesis-topic.interface';
import { ProposedTopic } from '../interfaces/proposed-topic.interface';
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
    //console.log('Estudiante inscrito correctamente:', email);
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
          //console.log('Estudiante desuscrito correctamente:', email);
        } else {
          throw new BadRequestException('El estudiante no está inscrito en este tema');
        }
      }
    }
  }

  // Métodos para propuestas de temas de estudiantes
  async proposeThesisTopic(proposedTopic: ProposedTopic): Promise<any> {
    // Verificar que el profesor existe
    const professor = await this.userModel.findOne({ name: proposedTopic.proposedToProfessor });
    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    // Verificar límite de 3 propuestas totales por estudiante
    const allProfessors = await this.userModel.find({ role: 'professor' }).exec();
    let totalProposals = 0;
    
    for (const prof of allProfessors) {
      if (prof.proposedTopics) {
        const studentProposals = prof.proposedTopics.filter(
          proposal => proposal.studentName === proposedTopic.studentName
        );
        totalProposals += studentProposals.length;
      }
    }
    
    if (totalProposals >= 3) {
      throw new BadRequestException(`No puedes proponer más de 3 temas en total. Ya tienes ${totalProposals} propuestas.`);
    }

    // Crear la nueva propuesta y agregarla al profesor
    const newProposal = {
      title: proposedTopic.title,
      description: proposedTopic.description,
      studentName: proposedTopic.studentName,
      justification: proposedTopic.justification,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    professor.proposedTopics.push(newProposal);
    await professor.save();
    
    console.log('Nueva propuesta de tema agregada al profesor:', newProposal);
    return newProposal;
  }

  async getProposedTopics(): Promise<any[]> {
    const users = await this.userModel.find({ role: 'professor' }).exec();
    const allProposals: any[] = [];
    
    for (const user of users) {
      if (user.proposedTopics && user.proposedTopics.length > 0) {
        const proposalsWithProfessor = user.proposedTopics.map(proposal => ({
          ...proposal.toObject(),
          proposedToProfessor: user.name,
          _id: proposal._id
        }));
        allProposals.push(...proposalsWithProfessor);
      }
    }
    
    return allProposals;
  }

  async getProposedTopicsByProfessor(professorName: string): Promise<any[]> {
    const professor = await this.userModel.findOne({ name: professorName }).exec();
    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }
    
    return professor.proposedTopics || [];
  }

  async getProposedTopicsByStudent(studentName: string): Promise<any[]> {
    const users = await this.userModel.find({ role: 'professor' }).exec();
    const studentProposals: any[] = [];
    
    for (const user of users) {
      if (user.proposedTopics) {
        const proposals = user.proposedTopics.filter(proposal => proposal.studentName === studentName);
        const proposalsWithProfessor = proposals.map(proposal => ({
          ...proposal.toObject(),
          proposedToProfessor: user.name,
          _id: proposal._id
        }));
        studentProposals.push(...proposalsWithProfessor);
      }
    }
    
    return studentProposals;
  }

  async preselectProposal(proposalId: string, comment?: string): Promise<any> {
    // Buscar la propuesta en todos los profesores
    const professors = await this.userModel.find({ role: 'professor' }).exec();
    let foundProposal: any = null;
    let foundProfessor: any = null;

    for (const professor of professors) {
      if (professor.proposedTopics) {
        const proposal = professor.proposedTopics.find((p: any) => p._id.toString() === proposalId);
        if (proposal) {
          foundProposal = proposal;
          foundProfessor = professor;
          break;
        }
      }
    }

    if (!foundProposal || !foundProfessor) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    foundProposal.status = 'pre-selected';
    foundProposal.preselectionComment = comment || '';
    foundProposal.updatedAt = new Date();

    await foundProfessor.save();
    console.log(`Propuesta ${proposalId} preseleccionada`);
    return foundProposal;
  }

  async updateProposalStatus(proposalId: string, status: 'approved' | 'rejected'): Promise<any> {
    // Buscar la propuesta en todos los profesores
    const professors = await this.userModel.find({ role: 'professor' }).exec();
    let foundProposal: any = null;
    let foundProfessor: any = null;

    for (const professor of professors) {
      if (professor.proposedTopics) {
        const proposal = professor.proposedTopics.find((p: any) => p._id.toString() === proposalId);
        if (proposal) {
          foundProposal = proposal;
          foundProfessor = professor;
          break;
        }
      }
    }

    if (!foundProposal || !foundProfessor) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    foundProposal.status = status;
    foundProposal.updatedAt = new Date();

    // Si la propuesta es aprobada, convertirla en un tema oficial
    if (status === 'approved') {
      const newTopic = {
        title: foundProposal.title,
        description: foundProposal.description,
        avaliableSlots: 1, // Por defecto, un cupo disponible
        enrolledStudents: [foundProposal.studentName], // El estudiante que propuso ya está inscrito
      };

      foundProfessor.topics.push(newTopic);
      console.log('Propuesta aprobada y convertida en tema oficial:', newTopic);
    }

    await foundProfessor.save();
    console.log(`Propuesta ${proposalId} actualizada a estado: ${status}`);
    return foundProposal;
  }

  async deleteProposal(proposalId: string): Promise<void> {
    // Buscar la propuesta en todos los profesores
    const professors = await this.userModel.find({ role: 'professor' }).exec();
    let found = false;

    for (const professor of professors) {
      if (professor.proposedTopics) {
        const index = professor.proposedTopics.findIndex((p: any) => p._id.toString() === proposalId);
        if (index !== -1) {
          professor.proposedTopics.splice(index, 1);
          await professor.save();
          found = true;
          console.log(`Propuesta ${proposalId} eliminada`);
          break;
        }
      }
    }

    if (!found) {
      throw new NotFoundException('Propuesta no encontrada');
    }
  }
}