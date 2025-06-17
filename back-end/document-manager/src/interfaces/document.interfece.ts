export interface Document {
  filename: string; 
  path: string;
  mimetype: string;
  size: number;
  createdAt: Date;
  title: string;
  authors: string[];
  age: number;
  status: string;
  description: string;
}