import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BooksModule } from '../books/books.module';
import { TelegramUpdate } from './telegram.update';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN не найден в конфигурации');
        }
        
        return {
          token,
          launchOptions: {
            dropPendingUpdates: true
          }
        };
      },
      inject: [ConfigService],
    }),
    BooksModule
  ],
  providers: [TelegramUpdate]
})
export class TelegramModule {} 