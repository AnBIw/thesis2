import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class ThesisTopic {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  avaliableSlots: number;

  @Prop({ type: [String], default: [] })
  enrolledStudents: string[]; // emails o nombres
}

