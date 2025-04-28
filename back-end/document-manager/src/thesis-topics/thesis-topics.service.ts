import { Injectable } from '@nestjs/common';
import { ThesisTopic } from '../interfaces/thesis-topic.interface';

@Injectable()
export class ThesisTopicsService {
  private thesisTopics: ThesisTopic[] = [];

  create(topic: ThesisTopic): ThesisTopic {
    const newTopic = { ...topic, id: (this.thesisTopics.length + 1).toString() };
    this.thesisTopics.push(newTopic);
    return newTopic;
  }

  findAll(): ThesisTopic[] {
    return this.thesisTopics;
  }

  delete(id: string): void {
    this.thesisTopics = this.thesisTopics.filter((topic) => topic.id !== id);
  }
}