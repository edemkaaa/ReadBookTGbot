import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Book } from '../books/entities/book.entity';
import { Telegraf } from 'telegraf';
import * as https from 'https';

@Injectable()
export class TelegramService {
  private bot: Telegraf;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN not found');
    
    this.bot = new Telegraf(token, {
      handlerTimeout: 30000,
      telegram: {
        apiRoot: 'https://api.telegram.org',
        webhookReply: false,
        agent: new https.Agent({
          keepAlive: true,
          keepAliveMsecs: 10000,
          timeout: 30000,
        })
      }
    });

    this.bot.catch((err) => {
      console.error('Telegraf error:', err);
    });
  }

  async sendBookInfo(chatId: number, book: Book) {
    const webAppUrl = this.configService.get<string>('WEBAPP_URL');
    const botUsername = this.configService.get<string>('BOT_USERNAME');
    
    if (!webAppUrl || !botUsername) {
      throw new Error('WEBAPP_URL or BOT_USERNAME not found in configuration');
    }
    
    const bookUrl = `https://t.me/${botUsername}/app?startapp=book_${book.id}`;
    
    const message = `📚 Ваша библиотека:\n\n` +
      `📖 ${book.title}\n` +
      `📅 Добавлена: ${new Date(book.createdAt).toLocaleDateString('ru-RU', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })} г.\n` +
      `🔗 ${bookUrl}`;

    await this.sendMessage(chatId, message);
  }

  async sendMessage(chatId: number, message: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Error sending telegram message:', error);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.bot.telegram.sendMessage(chatId, message, {
          parse_mode: 'HTML'
        });
      } catch (retryError) {
        console.error('Retry error:', retryError);
      }
    }
  }
} 