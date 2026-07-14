import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import jwtConfig from './config/jwt.config';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContactsModule } from './modules/contacts/contacts.module';

// Módulos de negócio (deals, stages, activities, ai)
// serão registrados aqui em etapas futuras.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    PrismaModule,
    AuthModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
