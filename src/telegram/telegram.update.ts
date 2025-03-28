import { Update, Start, Ctx, Command, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BooksService } from '../books/books.service';
import { Markup } from 'telegraf';

@Update()
export class TelegramUpdate {
  constructor(private readonly booksService: BooksService) {
    console.log('TelegramUpdate initialized'); // Лог при инициализации
  }

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    console.log('Start command received'); // Лог при получении команды
    console.log('Context:', ctx.message); // Лог контекста
    const webAppUrl = process.env.NODE_ENV === 'production' 
      ? 'https://ваш-безопасный-домен' 
      : 'https://localhost:5173'; // Требуется SSL-сертификат

    await ctx.reply(
      'Привет! Отправь мне PDF файл, и я сохраню его для тебя.',
      Markup.keyboard([
        ['📚 Мои книги'], 
        ['⚙️ Настройки']
      ]).resize()
    );
  }

  @Command('books')
  async onBooks(ctx: Context) {
    await ctx.reply('Ваши книги:');
  }

  @On('document')
  async onDocument(@Ctx() ctx: Context) {
    if (!ctx.message) return;
    
    if ('document' in ctx.message) {
      const { file_id } = ctx.message.document;
      const userId = ctx.message.from.id.toString();

      try {
        // Загрузка файла
        const file = await ctx.telegram.getFile(file_id);
        const response = await fetch(`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`);
        const buffer = await response.arrayBuffer();

        // Создаем объект файла для BooksService
        const bookFile = {
          originalname: ctx.message.document.file_name || 'book.pdf',
          buffer: Buffer.from(buffer),
          mimetype: 'application/pdf'
        };

        await this.booksService.uploadBook(bookFile as Express.Multer.File, userId);
        
        await ctx.reply('Книга успешно загружена! Теперь ты можешь открыть её в читалке.');
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        await ctx.reply('Произошла ошибка при загрузке файла. Пожалуйста, попробуйте снова.');
      }
    }
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text;
    const userId = ctx.message.from.id.toString();

    if (text === '📚 Мои книги') {
      try {
        const books = await this.booksService.getUserBooks(userId);
        
        if (books.length === 0) {
          await ctx.reply('У вас пока нет сохранённых книг.');
          return;
        }

        // Группируем книги по названию
        const uniqueBooks = books.reduce((acc, book) => {
          const title = book.title || 'Без названия';
          // Оставляем только самую новую версию книги
          if (!acc[title] || new Date(acc[title].createdAt) < new Date(book.createdAt)) {
            acc[title] = book;
          }
          return acc;
        }, {} as Record<string, any>);

        // Форматируем дату в русском стиле
        const formatDate = (date: Date) => {
          return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        };

        const bookList = Object.values(uniqueBooks)
          .map(book => 
            `📖 ${book.title.replace('.pdf', '')}\n` +
            `📅 Добавлена: ${formatDate(book.createdAt)}\n` +
            `🔗 ${process.env.WEBAPP_URL}/reader/${book.id}`
          )
          .join('\n\n');

        await ctx.reply(`📚 Ваша библиотека:\n\n${bookList}`);
      } catch (error) {
        console.error('Ошибка при получении списка книг:', error);
        await ctx.reply('Произошла ошибка при получении списка книг.');
      }
    }
  }

  private generateBookLink(bookId: string): string {
    if (process.env.NODE_ENV === 'production') {
      return `https://ваш-домен/reader/${bookId}`;
    } else {
      // Временное решение для разработки - используйте ngrok
      return `${process.env.WEBAPP_URL}/reader/${bookId}`;
    }
  }
} 