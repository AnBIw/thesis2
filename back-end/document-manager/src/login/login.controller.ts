// src/auth/controllers/auth.controller.ts
import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { LoginService } from '../login/login.service';
import { Response } from 'express';

@Controller('auth')
export class LoginController {
  constructor(private readonly LoginService: LoginService) { }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string; role: string },
    @Res() res: Response
  ) {
    // Verifica si el usuario ya existe
    const exists = await this.LoginService.findByEmail(body.email);
    if (exists) {
      return res.status(409).json({ mensaje: 'El usuario ya existe' });
    }
    // Crea el usuario
    const user = await this.LoginService.createUser(body);
    return res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        specialty: user.specialty,
      }
    });
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Res() res: Response) {
    const user = await this.LoginService.validuser(body.email, body.password);
    if (!user) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
      }
    });
  }

  @Get('estudiantes')
  async getStudents() {
    const students = await this.LoginService.getStudents();
    return students.map(student => ({
      email: student.email,
      name: student.name,
    }));
  }

  @Get('profesores')
  async getProfessors() {
    const professors = await this.LoginService.findProfessor();
    return professors.map(professor => ({
      email: professor.email,
      name: professor.name,
      specialty: professor.specialty,
    }));
  }

  @Get('temas')
  async getThesisTopics() {
    const topics = await this.LoginService.getThesisTopics();
    const profesor = await this.LoginService.findProfessor();
    return topics.map(topic => ({
      title: topic.title,
      description: topic.description,
      avaliableSlots: topic.avaliableSlots,
      enrolledStudents: topic.enrolledStudents,
      professor: profesor.find(prof => prof.topics.some(t => t.title === topic.title))?.name || 'Unknown',
    }));
  }
}
