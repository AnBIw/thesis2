import { Module } from '@nestjs/common';
import { ThesisTopicsController } from './thesis-topics.controller';
import { ThesisTopicsService } from './thesis-topics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  controllers: [ThesisTopicsController],
  providers: [ThesisTopicsService],
  imports: [
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema }
      ]),
  ],
})
export class ThesisTopicsModule {}
