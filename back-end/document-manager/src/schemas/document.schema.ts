import { Schema, Document as MongooseDocument } from 'mongoose';

// schemas usado para definir a estrutura do documento
// forma en que se guarda la información en la base de datos
export const DocumentSchema = new Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

// interface para definir la estructura del documento
// forma en que se maneja la información en el código
export interface Document extends MongooseDocument {
  filename: string; 
  path: string;
  mimetype: string;
  size: number;
  description: String,
  createdAt: Date;
}


// @Schema()
// export class Document {
//   @Prop()
//   filename: string;

//   @Prop()
//   path: string;

//   @Prop()
//   mimetype: string;

//   @Prop()
//   size: number;

//   @Prop()
//   createdAt: Date;

//   @Prop()
//   description: string;
// }

// export const DocumentSchema = SchemaFactory.createForClass(Document);