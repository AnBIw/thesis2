export class CreateDocumentDto {
    readonly description: string;
    readonly filename: string;
    readonly mimetype: string;
    readonly size: number;
    readonly path: string;
    readonly createdAt: Date;
    readonly age: number;
    readonly authors: string[];
    readonly status: string;
  }