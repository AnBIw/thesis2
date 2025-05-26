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

  create(createLoginDto: CreateLoginDto) {
    return 'This action adds a new login';
  }

  findAll() {
    return `This action returns all login`;
  }

  findOne(id: number) {
    return `This action returns a #${id} login`;
  }

  update(id: number, updateLoginDto: UpdateLoginDto) {
    return `This action updates a #${id} login`;
  }

  remove(id: number) {
    return `This action removes a #${id} login`;
  }
}
