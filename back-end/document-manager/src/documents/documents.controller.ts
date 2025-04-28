import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, Body, Put, Delete, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { Document } from '../schemas/document.schema';
import { Response } from 'express';
import { RemovedDocument } from '../schemas/removed-document.schema';
import * as Multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}
//-------------- POST --------------
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file, @Body() createDocumentDto: CreateDocumentDto): Promise<Document> {
  // Validar que el archivo sea un PDF
  if (file.mimetype !== 'application/pdf') {
    throw new BadRequestException('Only PDF files are allowed');
  }
  const document = {
    ...createDocumentDto,
    filename: file.originalname,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
  };
  return this.documentsService.create(document);
}
//-------------- GET --------------
  @Get()
  async findAll(): Promise<Document[]> {
    return this.documentsService.findAll();
  }
    //ver si la tesis existe dentro de la base de datos
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Document> {
    const document = await this.documentsService.findOne(id);
    if (!document) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }
    return document;
  }
  @Get('removed')
  async listRemovedDocuments(): Promise<RemovedDocument[]> {
  return this.documentsService.listRemovedDocuments();
}
  //visualizar la tesis
  @Get('preview/:id')
  async preview(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const document = await this.documentsService.findOne(id);
    if (!document) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }
    res.setHeader('Content-Type', document.mimetype);
    fs.createReadStream(document.path).pipe(res);
  }
  //descargar la tesis
  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const document = await this.documentsService.findOne(id);
    if (!document) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }
    res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
    res.setHeader('Content-Type', document.mimetype);
    fs.createReadStream(document.path).pipe(res);
  }
  //-------------- PUT --------------
  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: CreateDocumentDto,
    @UploadedFile() file?: Multer.File,
  ): Promise<Document> {
    return this.documentsService.update(id, updateDocumentDto, file);
  }
  //-------------- DELETE --------------
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Document> {
    const document = await this.documentsService.remove(id);
    if (!document) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }
    return document;
  }
}