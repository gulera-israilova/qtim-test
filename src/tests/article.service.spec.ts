import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from '../modules/article/article.service';
import { RedisService } from '../redis/redis.service';
import { ArticleEntity } from '../entity/article.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('ArticleService', () => {
  let service: ArticleService;
  let repository: any;
  let redisService: RedisService;

  const mockArticle = {
    id: '1',
    title: 'Test article',
    description: 'Test article description',
    createdBy: { id: 'user1', name: 'John Doe' },
    createdAt: new Date(),
  };

  const mockUser = { id: 'user1', name: 'John Doe' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: {
            create: jest.fn().mockReturnValue(mockArticle),
            save: jest.fn().mockResolvedValue(mockArticle),
            findOne: jest.fn().mockResolvedValue(mockArticle),
            findAndCount: jest.fn().mockResolvedValue([[mockArticle], 1]),
            remove: jest.fn().mockResolvedValue(mockArticle),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            clearArticlesCache: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    repository = module.get<Repository<ArticleEntity>>(
      getRepositoryToken(ArticleEntity),
    ); // Тип репозитория
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an article', async () => {
      const dto = {
        title: 'New article',
        description: 'New article description',
      };
      const result = await service.create(dto, mockUser);

      expect(result).toEqual(mockArticle);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        createdBy: mockUser,
      });
      expect(redisService.clearArticlesCache).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return a list of articles with pagination', async () => {
      const result = await service.get(1, 10);

      expect(result.data).toEqual([mockArticle]);
      expect(result.total).toBe(1);
      expect(repository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return an article by ID', async () => {
      const result = await service.getById('1');

      expect(result).toEqual(mockArticle);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['createdBy'],
      });
    });

    it('should throw NotFoundException if article not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.getById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const dto = {
        id: '2',
        title: 'Updated article',
        description: 'Updated article description',
      };
      const result = await service.update(dto, mockUser);

      expect(result).toEqual(mockArticle);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: dto.id },
        relations: ['createdBy'],
      });
      expect(repository.save).toHaveBeenCalledWith({ ...mockArticle, ...dto });
      expect(redisService.clearArticlesCache).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const anotherUser = { id: 'user2', name: 'Jane Doe' };
      await expect(
        service.update({ id: '1', title: 'Updated' }, anotherUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if article not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update({ id: '1', title: 'Updated' }, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteById', () => {
    it('should delete an article', async () => {
      const result = await service.deleteById('1');

      expect(result).toEqual({ message: 'Article successfully deleted' });
      expect(repository.remove).toHaveBeenCalledWith(mockArticle);
      expect(redisService.clearArticlesCache).toHaveBeenCalled();
    });

    it('should throw NotFoundException if article not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.deleteById('1')).rejects.toThrow(NotFoundException);
    });
  });
});
