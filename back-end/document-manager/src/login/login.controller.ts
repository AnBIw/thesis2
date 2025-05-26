// src/auth/controllers/auth.controller.ts
import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { LoginService } from '../login/login.service';
import { Response } from 'express';

@Controller('auth')
export class LoginController {
  constructor(private readonly LoginService: LoginService) {}

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

  @Get('profesores')
  async getProfessors() {
    const professors = await this.LoginService.findProfessor();
    return professors.map(professor => ({
      name: professor.name,
      specialty: professor.specialty,
    }));
}
}