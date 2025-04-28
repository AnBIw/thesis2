import { Test, TestingModule } from '@nestjs/testing';
import { ThesisTopicsService } from './thesis-topics.service';

describe('ThesisTopicsService', () => {
  let service: ThesisTopicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThesisTopicsService],
    }).compile();

    service = module.get<ThesisTopicsService>(ThesisTopicsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
