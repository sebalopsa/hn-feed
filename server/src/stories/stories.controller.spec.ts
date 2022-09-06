import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Story } from './schemas/story.schema';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';

export class StoryModelFake {
  public create(): void {}
  public async save(): Promise<void> {}
  public async remove(): Promise<void> {}
  public async findOne(): Promise<void> {}
}

describe('StoriesController', () => {
  let controller: StoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoriesController],
      providers: [
        StoriesService,
        { provide: getModelToken(Story.name), useValue: StoryModelFake },
      ],
    }).compile();

    controller = module.get<StoriesController>(StoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});