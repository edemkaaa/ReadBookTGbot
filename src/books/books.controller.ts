import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  UseInterceptors, 
  UploadedFile,
  StreamableFile,
  Headers,
  ParseIntPipe,
  Request,
  NotFoundException,
  Res,
  Response,
  Header,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import { createReadStream } from 'fs';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import type { Response as ExpressResponse } from 'express';
import * as fs from 'fs/promises';
import { existsSync, statSync } from 'fs';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBook(
    @UploadedFile() file: Express.Multer.File,
    @Headers('user-id') userId: string,
  ) {
    return this.booksService.uploadBook(file, userId);
  }

  @Get('user')
  async getUserBooks(@Headers('user-id') userId: string) {
    return this.booksService.getUserBooks(userId);
  }

  @Get(':id/read')
  async readBook(
    @Param('id', ParseIntPipe) id: number,
    @Headers('user-id') userId: string,
  ) {
    const book = await this.booksService.getBook(id, userId);
    const stream = createReadStream(book.filePath);
    return new StreamableFile(stream);
  }

  @Get(':id')
  async getBook(
    @Param('id') id: string,
    @Headers('user-id') userId: string
  ) {
    const book = await this.booksService.getBook(parseInt(id), userId);
    return {
      ...book,
      fileUrl: `/uploads/${book.fileName}`
    };
  }

  @Get(':id/file')
  @Header('Content-Type', 'application/pdf')
  async getBookFile(@Param('id') id: string) {
    try {
      const book = await this.booksService.findOne(+id);
      if (!book || !book.fileName) {
        throw new NotFoundException('Книга не найдена');
      }

      // Собираем полный путь к файлу
      const filePath = join(process.cwd(), 'uploads', book.fileName);
      console.log('Полный путь к файлу:', filePath);

      const fileExists = existsSync(filePath);
      console.log('Файл существует:', fileExists);

      if (!fileExists) {
        throw new NotFoundException('Файл не найден на диске');
      }

      const fileStats = statSync(filePath);
      console.log('Размер файла:', fileStats.size);

      const file = createReadStream(filePath);
      return new StreamableFile(file);

    } catch (error) {
      console.error('Ошибка при получении файла:', error);
      throw new NotFoundException(
        error instanceof Error ? error.message : 'Неизвестная ошибка'
      );
    }
  }

  @Get()
  async findAll() {
    return this.booksService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const book = await this.booksService.findOne(+id);
      if (!book) {
        throw new NotFoundException('Книга не найдена');
      }

      // Удаляем файл
      if (book.filePath) {
        const filePath = join(process.cwd(), book.filePath);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Ошибка при удалении файла:', error);
        }
      }

      // Удаляем запись из базы
      await this.booksService.remove(+id);
      
      return { message: 'Книга успешно удалена' };
    } catch (error) {
      throw new NotFoundException('Ошибка при удалении книги');
    }
  }
}