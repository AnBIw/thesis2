import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema'; // Asegúrate de que la ruta sea correcta


@Module({
  controllers: [LoginController],
  providers: [LoginService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),],
})
export class LoginModule {}
