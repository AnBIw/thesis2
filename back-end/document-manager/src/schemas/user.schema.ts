import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop({ required: true, enum: ['students', 'professor'] })
  role: string;

  @Prop()
  specialty: string;

  @Prop({ type: [{ 
  title: String, 
  description: String, 
  avaliableSlots: Number, 
  enrolledStudents: [String] 
  }], default: [] })
  topics: any[];
}

export const UserSchema = SchemaFactory.createForClass(User);