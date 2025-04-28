import { Schema } from 'mongoose';

export const RemovedDocumentSchema = new Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  description: String,
  createdAt: { type: Date, default: Date.now },
  removedAt: { type: Date, default: Date.now },
});

export interface RemovedDocument {
  filename: string;
}