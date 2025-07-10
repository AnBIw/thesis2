import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProposedTopic extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  studentName: string;

  @Prop()
  studentId: string;

  @Prop({ required: true })
  justification: string;

  @Prop({ required: true })
  proposedToProfessor: string;

  @Prop()
  professorEmail: string;

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: string;
}

export const ProposedTopicSchema = SchemaFactory.createForClass(ProposedTopic);
