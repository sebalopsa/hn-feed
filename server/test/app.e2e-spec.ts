import { HttpService } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { of } from 'rxjs';
import * as request from 'supertest';
import { Story, StorySchema } from '../src/stories/schemas/story.schema';
import { StoriesController } from '../src/stories/stories.controller';
import { StoriesService } from '../src/stories/stories.service';
import { storiesStub } from './stories.stub';

describe('StoriesController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let storyModel: Model<Story>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    storyModel = mongoConnection.model(Story.name, StorySchema);

    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StoriesController],
      providers: [
        StoriesService,
        { provide: getModelToken(Story.name), useValue: storyModel },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => of({})),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('/stories (POST)', async () => {
    return request(app.getHttpServer())
      .post('/stories')
      .send(storiesStub())
      .expect(201);
  });

  it('/stories (GET)', async () => {
    return request(app.getHttpServer()).get('/stories').expect(200);
  });
});
