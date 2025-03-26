import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
@Entity('article')
export class ArticleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date = new Date();

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: UserEntity;

  @Column({ nullable: false, length: 100 })
  title: string;

  @Column({ nullable: false })
  description: string;
}
