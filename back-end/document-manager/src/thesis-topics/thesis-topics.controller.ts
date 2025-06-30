import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ThesisTopicsService } from './thesis-topics.service';
import { ThesisTopic } from '../interfaces/thesis-topic.interface';

@Controller('thesis-topics')
export class ThesisTopicsController {
  constructor(private readonly thesisTopicsService: ThesisTopicsService) { }

  @Post()
  async create(@Body() topic: ThesisTopic): Promise<ThesisTopic> {
    return await this.thesisTopicsService.create(topic);
  }

  @Get()
  findAll(): ThesisTopic[] {
    return this.thesisTopicsService.findAll();
  }

  @Delete(':id')
  delete(@Param('id') tittle: string): void {
    console.log(`Deleting thesis topic with id: ${tittle}`);
    this.thesisTopicsService.delete(tittle);
  }
  @Post(':id/enroll')
  async enrollStudent(
    @Param('id') id: string,
    @Body('email') email: string,
    @Body('name') name: string,
  ): Promise<void> {
    await this.thesisTopicsService.enrollStudent(id, email);
  }
  @Post(':id/unroll')
  async unsubscribeStudent(
    @Param('id') id: string,
    @Body('email') email: string,
  ): Promise<void> {
    await this.thesisTopicsService.unsubscribeStudent(id, email);
  }
}