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
      registrationOpen: true, // Por defecto, las inscripciones están abiertas
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
        // Verificar si las inscripciones están abiertas
        if (userTopic.registrationOpen === false) {
          throw new BadRequestException('Las inscripciones para este tema están cerradas');
        }

        if (userTopic.enrolledStudents.includes(email)) {
          throw new BadRequestException('El estudiante ya está inscrito en este tema');
        }
        userTopic.enrolledStudents.push(email);
        await user.save();
      }
    }
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
    return foundProposal;
  }

  async updateProposalStatus(proposalId: string, status: 'pending' | 'pre-selected' | 'approved' | 'rejected'): Promise<any> {
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

    const previousStatus = foundProposal.status;
    foundProposal.status = status;
    foundProposal.updatedAt = new Date();

    // NO crear tema oficial automáticamente cuando se aprueba
    // El tema se asignará como tesisActual del estudiante cuando acepte la propuesta

    await foundProfessor.save();
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
          break;
        }
      }
    }

    if (!found) {
      throw new NotFoundException('Propuesta no encontrada');
    }
  }

  // Métodos para gestionar la tesis actual del estudiante
  async updateStudentTesisActual(studentName: string, tesisData: any): Promise<any> {
    const student = await this.userModel.findOne({ name: studentName });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    student.tesisActual = {
      titulo: tesisData.titulo,
      descripcion: tesisData.descripcion,
      profesor: tesisData.profesor,
      estado: tesisData.estado || 'aprobado',
      fechaAsignacion: new Date()
    };

    await student.save();
    return student.tesisActual;
  }

  async getStudentTesisActual(studentName: string): Promise<any> {
    const student = await this.userModel.findOne({ name: studentName });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return student.tesisActual || null;
  }

  async clearStudentTesisActual(studentName: string): Promise<void> {
    const student = await this.userModel.findOne({ name: studentName });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    student.tesisActual = null;
    await student.save();
  }

  async getStudentPreselectedProposals(studentName: string): Promise<any[]> {
    // Buscar todas las propuestas preseleccionadas del estudiante
    const professors = await this.userModel.find({ role: 'professor' }).exec();
    const preselectedProposals: any[] = [];

    for (const professor of professors) {
      if (professor.proposedTopics) {
        const studentProposals = professor.proposedTopics.filter((p: any) => 
          p.studentName === studentName && 
          p.status === 'pre-selected' && 
          p.preselectionComment
        );
        
        // Agregar el nombre del profesor a cada propuesta
        const proposalsWithProfessor = studentProposals.map(proposal => ({
          ...proposal.toObject(),
          proposedToProfessor: professor.name,
          _id: proposal._id
        }));
        
        preselectedProposals.push(...proposalsWithProfessor);
      }
    }

    return preselectedProposals;
  }

  // Controlar inscripciones de temas oficiales
  async toggleTopicRegistration(professorName: string, topicTitle: string, registrationOpen: boolean): Promise<any> {
    const professor = await this.userModel.findOne({ name: professorName, role: 'professor' });
    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    const topic = professor.topics.find((t: any) => t.title === topicTitle);
    if (!topic) {
      throw new NotFoundException('Tema no encontrado');
    }

    topic.registrationOpen = registrationOpen;
    await professor.save();

    return topic;
  }

  // Confirmar que el estudiante ha visto una propuesta
  async confirmProposalViewed(proposalId: string, studentName: string): Promise<any> {
    const student = await this.userModel.findOne({ name: studentName, role: 'students' });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const proposal = student.proposedTopics.find((p: any) => p.proposalId === proposalId);
    if (!proposal) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    // Marcar como vista
    proposal.viewed = true;
    proposal.viewedAt = new Date();
    await student.save();

    return { message: 'Confirmación de vista registrada correctamente' };
  }

  // Limpiar temas oficiales duplicados que se crearon automáticamente de propuestas
  async cleanupDuplicateTopics(): Promise<any> {
    const professors = await this.userModel.find({ role: 'professor' }).exec();
    let cleanedCount = 0;

    for (const professor of professors) {
      if (professor.topics && professor.proposedTopics) {
        // Buscar temas oficiales que corresponden a propuestas aprobadas
        const topicsToRemove: number[] = [];

        for (let i = 0; i < professor.topics.length; i++) {
          const topic = professor.topics[i];
          
          // Verificar si este tema corresponde a una propuesta aprobada
          const relatedProposal = professor.proposedTopics.find((proposal: any) => 
            proposal.title.trim().toLowerCase() === topic.title.trim().toLowerCase() &&
            proposal.status === 'approved'
          );

          if (relatedProposal) {
            // Solo eliminar si hay un estudiante con este tema como tesisActual
            const student = await this.userModel.findOne({ 
              name: relatedProposal.studentName,
              'tesisActual.titulo': topic.title
            });

            if (student) {
              topicsToRemove.push(i);
              cleanedCount++;
            }
          }
        }

        // Eliminar los temas identificados (en orden inverso para no afectar los índices)
        for (let i = topicsToRemove.length - 1; i >= 0; i--) {
          professor.topics.splice(topicsToRemove[i], 1);
        }

        if (topicsToRemove.length > 0) {
          await professor.save();
        }
      }
    }

    return { 
      message: `Se eliminaron ${cleanedCount} temas oficiales duplicados`,
      cleanedCount 
    };
  }
}