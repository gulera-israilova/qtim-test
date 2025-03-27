import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  IsNotEmpty,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: 'Title', description: 'Article title' })
  @IsString({ message: 'Must be a string' })
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ example: 'Description', description: 'Article description' })
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}

export class UpdateArticleDto {
  @ApiProperty({
    example: '9a0e516f-9e79-4ddf-8792-01a57776a7e6',
    description: 'Article ID',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID is required' })
  id: string;

  @ApiProperty({
    example: 'Title',
    description: 'Article title',
    required: false,
  })
  @IsString({ message: 'Must be a string' })
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Description',
    description: 'Article description',
    required: false,
  })
  @IsString({ message: 'Must be a string' })
  @IsOptional()
  description?: string;
}

export class ArticleDto {
  @ApiProperty({
    example: '9a0e516f-9e79-4ddf-8792-01a57776a7e6',
    description: 'Article ID',
  })
  id: string;

  @ApiProperty({
    example: 'Title',
    description: 'Article title',
  })
  title: string;

  @ApiProperty({
    example: 'Description',
    description: 'Article description',
  })
  description: string;
}

export class GetArticlesResponseDto {
  @ApiProperty({ type: [ArticleDto] })
  data: string;

  @ApiProperty({
    example: 10,
    description: 'Articles total number',
  })
  total: number;
}
