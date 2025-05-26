import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsModule } from './documents/documents.module';
import { ThesisTopicsModule } from './thesis-topics/thesis-topics.module';
import { LoginModule } from './login/login.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/document-manager'),
    DocumentsModule,
    ThesisTopicsModule,
    LoginModule,

  ],
  controllers: [AppController,],
  providers: [AppService],
})
export class AppModule {}
