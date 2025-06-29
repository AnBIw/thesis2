import { Injectable } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'

@Injectable()
export class LoginService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async validuser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel .findOne({ email }).exec();
    if (user && user.password === password) {
      return user;
    } else {
      return null;
    }
  }
  async findProfessor(): Promise<User[]> {
    return this.userModel.find({ role: 'professor' }).exec();
  }

  async getThesisTopics(): Promise<any[]> {
    return this.userModel.find({ role: 'professor' }, 'topics').exec().then(users => {
      return users.flatMap(user => user.topics);
    });
  }

  async getStudents(): Promise<User[]> {
    return this.userModel.find({ role: 'students' }).exec();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }); // Ajusta según tu ORM
  }

  async createUser(data: { email: string; password: string; name: string; role: string }) {
    // Aquí deberías hashear la contraseña antes de guardar
    const newUser = new this.userModel(data);
    return newUser.save();
  }

}
