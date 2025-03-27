import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { User } from '../../utils/user.decorator';
import { CurrentUser } from '../user/dto';
import {
  ArticleDto,
  CreateArticleDto,
  GetArticlesResponseDto,
  UpdateArticleDto,
} from './dto';

@ApiTags('Articles')
@Controller({
  path: 'articles',
  version: ['1'],
})
export class ArticleController {
  constructor(private service: ArticleService) {}

  @Post()
  @ApiOperation({ summary: 'Create article' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({ type: ArticleDto })
  async create(@Body() dto: CreateArticleDto, @User() user: CurrentUser) {
    return await this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of all articles' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Item limit', required: false })
  @ApiQuery({
    name: 'authorName',
    description: 'Filter by author name',
    required: false,
  })
  @ApiQuery({
    name: 'fromDate',
    description: 'Filter from date (YYYY-MM-DD)',
    required: false,
  })
  @ApiQuery({
    name: 'toDate',
    description: 'Filter to date (YYYY-MM-DD)',
    required: false,
  })
  @ApiResponse({ type: GetArticlesResponseDto })
  async get(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('authorName') authorName?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return await this.service.get(page, limit, authorName, fromDate, toDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by id' })
  @ApiParam({ name: 'id', description: 'Article id' })
  @ApiResponse({ type: ArticleDto })
  async getById(@Param('id') id: string) {
    if (!id) throw new BadRequestException('Empty param: id');

    return await this.service.getById(id);
  }

  @Put()
  @ApiOperation({ summary: 'Update article by id' })
  @ApiBody({ type: UpdateArticleDto })
  @ApiResponse({ type: ArticleDto })
  async update(@Body() dto: UpdateArticleDto, @User() user: CurrentUser) {
    return await this.service.update(dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order by id' })
  @ApiParam({ name: 'id', description: 'Order id' })
  async delete(@Param('id') id: string) {
    if (!id) throw new BadRequestException('Empty param: id');

    return await this.service.deleteById(id);
  }
}
