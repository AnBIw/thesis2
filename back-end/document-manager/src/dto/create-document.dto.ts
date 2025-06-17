export class CreateDocumentDto {
    readonly filename: string;
    readonly mimetype: string;
    readonly size: number;
    readonly path: string;
    readonly createdAt: Date;
    readonly title: string;
    readonly authors: string[];
    readonly age: number;
    readonly status: string;
    readonly description: string;
  }