import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'nest-lab',
    })
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Hotel Booking System API')
    .setDescription('Include information about the Room management, Booking management, Notification management and account management APIs, and mention rate limiting (100 requests per minute)')
    .setVersion('1.0.0')
    .addTag('rooms')
    .addTag('bookings')
    .addTag('auth')
    .addTag('notifications')
    .addBearerAuth({name: 'Jwt', type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header'}, 'access-token')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document, { swaggerOptions: { persistAuthorization: true } })
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
