import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentUser } from '../user/dto';
import { ArticleEntity } from '../../entity/article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repository: Repository<ArticleEntity>,
  ) {}

  async create(dto: CreateArticleDto, user: CurrentUser) {
    return this.repository.create({
      ...dto,
      createdBy: user,
    });
  }

  async get(page: number, limit: number): Promise<any> {
    const take = limit || 10;
    const skip = page * limit || 0;

    const [articles, total] = await this.repository.findAndCount({
      take: take,
      skip: skip,
      relations: ['createdBy'],
    });
    return {
      data: articles,
      total: total,
    };
  }

  async getById(id: string): Promise<ArticleEntity> {
    const item = await this.repository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!item) throw new NotFoundException();

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
    if (item.createdBy.id !== user.id)
      throw new ForbiddenException(
        'You are not the author of this article, so you cannot update it',
      );

    const updatedItem = {
      ...item,
      ...dto,
    };

    return this.repository.save(updatedItem);
  }

  async deleteById(id: string) {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    try {
      await this.repository.remove(item);
      return {
        message: 'Order successfully deleted',
      };
    } catch (error) {
      throw error;
    }
  }
}
