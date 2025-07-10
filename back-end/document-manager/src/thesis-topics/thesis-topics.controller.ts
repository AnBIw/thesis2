import { Controller, Get, Post, Body, Delete, Param, Patch, Query } from '@nestjs/common';
import { ThesisTopicsService } from './thesis-topics.service';
import { ThesisTopic } from '../interfaces/thesis-topic.interface';
import { ProposedTopic } from '../interfaces/proposed-topic.interface';

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

  // Endpoints para propuestas de temas de estudiantes
  @Post('propose')
  async proposeThesisTopic(@Body() proposedTopic: ProposedTopic): Promise<any> {
    return await this.thesisTopicsService.proposeThesisTopic(proposedTopic);
  }

  @Get('proposals')
  async getProposedTopics(@Query('professor') professor?: string, @Query('student') student?: string): Promise<any[]> {
    if (professor) {
      return await this.thesisTopicsService.getProposedTopicsByProfessor(professor);
    }
    if (student) {
      return await this.thesisTopicsService.getProposedTopicsByStudent(student);
    }
    return await this.thesisTopicsService.getProposedTopics();
  }

  @Patch('proposals/:id/preselect')
  async preselectProposal(
    @Param('id') id: string,
    @Body('comment') comment?: string,
  ): Promise<any> {
    return await this.thesisTopicsService.preselectProposal(id, comment);
  }

  @Patch('proposals/:id')
  async updateProposalStatus(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected',
  ): Promise<any> {
    return await this.thesisTopicsService.updateProposalStatus(id, status);
  }

  @Delete('proposals/:id')
  async deleteProposal(@Param('id') id: string): Promise<void> {
    await this.thesisTopicsService.deleteProposal(id);
  }
}