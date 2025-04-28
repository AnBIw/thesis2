import { Test, TestingModule } from '@nestjs/testing';
import { ThesisTopicsController } from './thesis-topics.controller';

describe('ThesisTopicsController', () => {
  let controller: ThesisTopicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThesisTopicsController],
    }).compile();

    controller = module.get<ThesisTopicsController>(ThesisTopicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
