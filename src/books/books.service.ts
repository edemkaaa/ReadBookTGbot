import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import * as path from 'path';
import * as fs from 'fs/promises';
import { StreamableFile } from '@nestjs/common';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async uploadBook(file: Express.Multer.File, userId: string) {
    const uploadsPath = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsPath, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadsPath, fileName);
    
    await fs.writeFile(filePath, file.buffer);

    const book = this.bookRepository.create({
      title: file.originalname,
      fileName,
      filePath,
      userId,
    });

    return this.bookRepository.save(book);
  }

  async getUserBooks(userId: string): Promise<Book[]> {
    return this.bookRepository.find({
      where: { userId },
      select: ['id', 'title', 'createdAt']
    });
  }

  async getBook(id: number, userId: string) {
    const book = await this.bookRepository.findOne({
      where: { id, userId },
      select: ['id', 'title', 'fileName']
    });

    if (!book) {
      throw new NotFoundException('Книга не найдена');
    }

    return book;
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ 
      where: { 
        id: id 
      },
      select: ['id', 'fileName', 'title']
    });
    
    if (!book) {
      throw new NotFoundException(`Книга с ID ${id} не найдена`);
    }
    
    return book;
  }

  async remove(id: number): Promise<void> {
    await this.bookRepository.delete(id);
  }
}