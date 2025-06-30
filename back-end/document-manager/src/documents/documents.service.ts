import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Multer } from 'multer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document } from '../schemas/document.schema';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { RemovedDocument } from '../schemas/removed-document.schema';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel('Document') private readonly documentModel: Model<Document>,
    @InjectModel('RemovedDocument') private readonly removedDocumentModel: Model<RemovedDocument>,
  ) { }

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    const createdDocument = new this.documentModel(createDocumentDto);
    return createdDocument.save();
  }

  async findAll(): Promise<Document[]> {
    return this.documentModel.find().exec();
  }

  async findOne(id: string): Promise<Document | null> {
    return this.documentModel.findById(id).exec();
  }
  async update(id: string, updateDocumentDto: CreateDocumentDto, newFile?: Multer.File): Promise<Document> {
    const oldDocument = await this.documentModel.findById(id).exec();

    if (newFile && oldDocument) {
      // Mover el archivo antiguo a la colección de removidos
      const removedDocument = new this.removedDocumentModel({
        filename: oldDocument.filename,
        path: oldDocument.path,
        mimetype: oldDocument.mimetype,
        size: oldDocument.size,
        description: oldDocument.description,
        createdAt: oldDocument.createdAt,
        title: oldDocument.title,
        age: oldDocument.age,
        authors: oldDocument.authors,
        status: oldDocument.status,
      });
      await removedDocument.save();

      // Eliminar el archivo antiguo del sistema de archivos
      fs.unlinkSync(oldDocument.path);

      // Actualizar el documento con el nuevo archivo
      oldDocument.filename = newFile.originalname;
      oldDocument.path = newFile.path;
      oldDocument.mimetype = newFile.mimetype;
      oldDocument.size = newFile.size;
      oldDocument.age = newFile.age; // Actualizar el año
      oldDocument.authors = newFile.authors; // Actualizar los autores
      oldDocument.status = newFile.status; // Actualizar el estado
    }

    // Actualizar la descripción
    if (oldDocument) {
      oldDocument.description = updateDocumentDto.description;
    }

    if (oldDocument) {
      return oldDocument.save();
    }
    throw new Error('Document not found');
  }

  async remove(id: string): Promise<Document> {
    const document = await this.documentModel.findByIdAndDelete(id).exec();

    if (document) {
      // Mover el documento a la colección de removidos
      const removedDocument = new this.removedDocumentModel({
        filename: document.filename,
        path: document.path,
        mimetype: document.mimetype,
        size: document.size,
        description: document.description,
        createdAt: document.createdAt,
      });
      await removedDocument.save();
      // No eliminamos el archivo del sistema de archivos, solo lo movemos en la base de datos
    }

    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  }
  async listRemovedDocuments(): Promise<RemovedDocument[]> {
    return this.removedDocumentModel.find().exec();
  }
}