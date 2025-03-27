import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Between, Repository } from 'typeorm';
import { CurrentUser } from '../user/dto';
import { ArticleEntity } from '../../entity/article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { RedisService } from '../../redis/redis.service';
import { endOfDay, startOfDay } from 'date-fns';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repository: Repository<ArticleEntity>,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateArticleDto, user: CurrentUser) {
    const article = this.repository.create({
      ...dto,
      createdBy: user,
    });
    const savedArticle = await this.repository.save(article);

    await this.redisService.clearArticlesCache();

    return savedArticle;
  }

  async get(
    page: number,
    limit: number,
    authorName?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<{ data: ArticleEntity[]; total: number }> {
    const take = limit || 10;
    const skip = (page - 1) * take || 0;

    const cacheKey = `articles:${page}:${take}:${authorName || 'all'}:${fromDate || 'all'}:${toDate || 'all'}`;
    const totalCacheKey = `articles:total`;

    const cachedArticles = await this.redisService.get(cacheKey);
    const cachedTotal = await this.redisService.get(totalCacheKey);

    if (cachedArticles && cachedTotal) {
      return {
        data: JSON.parse(cachedArticles),
        total: Number(cachedTotal),
      };
    }

    const where: any = {};

    if (authorName) {
      where.createdBy = { name: ILike(`%${authorName}%`) };
    }
    if (fromDate || toDate) {
      where.createdAt = Between(
        fromDate ? startOfDay(new Date(fromDate)) : new Date(0),
        toDate ? endOfDay(new Date(toDate)) : new Date(),
      );
    }

    const [articles, total] = await this.repository.findAndCount({
      where,
      take,
      skip,
      relations: ['createdBy'],
    });

    await this.redisService.set(cacheKey, JSON.stringify(articles), 1800);
    await this.redisService.set(totalCacheKey, total.toString(), 1800);

    return {
      data: articles,
      total,
    };
  }

  async getById(id: string): Promise<ArticleEntity> {
    const cacheKey = `articles:${id}`;
    const cachedArticle = await this.redisService.get(cacheKey);

    if (cachedArticle) {
      return JSON.parse(cachedArticle);
    }

    const item = await this.repository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!item) throw new NotFoundException();

    await this.redisService.set(cacheKey, JSON.stringify(item), 1800);

    return item;
  }

  async update(
    dto: UpdateArticleDto,
    user: CurrentUser,
  ): Promise<ArticleEntity> {
    const item = await this.repository.findOne({
      where: { id: dto.id },
      relations: ['createdBy'],
    });

    if (!item) throw new NotFoundException();
    if (item.createdBy.id !== user.id) {
      throw new ForbiddenException(
        'You are not the author of this article, so you cannot update it',
      );
    }

    const updatedItem = { ...item, ...dto };
    const savedItem = await this.repository.save(updatedItem);

    await this.redisService.clearArticlesCache();

    return savedItem;
  }

  async deleteById(id: string) {
    const item = await this.repository.findOne({ where: { id } });

    if (!item) throw new NotFoundException();

    await this.repository.remove(item);

    await this.redisService.clearArticlesCache();

    return { message: 'Article successfully deleted' };
  }
}
