import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ThesisTopicsService } from './thesis-topics.service';
import { ThesisTopic } from '../interfaces/thesis-topic.interface';

@Controller('thesis-topics')
export class ThesisTopicsController {
  constructor(private readonly thesisTopicsService: ThesisTopicsService) {}

  @Post()
  async create(@Body() topic: ThesisTopic): Promise<ThesisTopic> {
    return await this.thesisTopicsService.create(topic);
  }

  @Get()
  findAll(): ThesisTopic[] {
    return this.thesisTopicsService.findAll();
  }

  @Delete(':id')
  delete(@Param('id') id: string): void {
    this.thesisTopicsService.delete(id);
  }
  @Post(':id/enroll')
  async enrollStudent(
  @Param('id') id: string,
  @Body('email') email: string,
  ): Promise<void> {
  await this.thesisTopicsService.enrollStudent(id, email);
}
}