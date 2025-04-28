import { Module } from '@nestjs/common';
import { ThesisTopicsController } from './thesis-topics.controller';
import { ThesisTopicsService } from './thesis-topics.service';

@Module({
  controllers: [ThesisTopicsController],
  providers: [ThesisTopicsService]
})
export class ThesisTopicsModule {}
