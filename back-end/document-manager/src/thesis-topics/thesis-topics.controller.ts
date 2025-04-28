import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ThesisTopicsService } from './thesis-topics.service';
import { ThesisTopic } from '../interfaces/thesis-topic.interface';

@Controller('thesis-topics')
export class ThesisTopicsController {
  constructor(private readonly thesisTopicsService: ThesisTopicsService) {}

  @Post()
  create(@Body() topic: ThesisTopic): ThesisTopic {
    return this.thesisTopicsService.create(topic);
  }

  @Get()
  findAll(): ThesisTopic[] {
    return this.thesisTopicsService.findAll();
  }

  @Delete(':id')
  delete(@Param('id') id: string): void {
    this.thesisTopicsService.delete(id);
  }
}