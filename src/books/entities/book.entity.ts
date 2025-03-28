import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  fileName!: string;

  @Column({ nullable: true })
  author?: string;

  @Column({ nullable: true })
  year?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  filePath!: string;

  @Column()
  userId!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}