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

  @Prop({
    type: [{
      title: String,
      description: String,
      avaliableSlots: Number,
      enrolledStudents: [String]
    }], default: []
  })
  topics: any[];

  @Prop({
    type: [{
      title: String,
      description: String,
      studentName: String,
      justification: String,
      status: { type: String, enum: ['pending', 'pre-selected', 'approved', 'rejected'], default: 'pending' },
      preselectionComment: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }], default: []
  })
  proposedTopics: any[];
}

export const UserSchema = SchemaFactory.createForClass(User);