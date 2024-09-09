import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ioredisStore from 'cache-manager-ioredis';
import { AuthModule } from './auth/modules/auth.module';
import { databaseConfig } from './config/database.config';
import { InvestmentController } from './modules/investment/controllers/investment.controller';
import { InvestmentModule } from './modules/investment/modules/investment.module';
import { UserModule } from './modules/user/modules/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    CacheModule.register({
      store: ioredisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT) || 6379,
      ttl: 600,
    }),
    UserModule,
    AuthModule,
    InvestmentModule,
  ],
  controllers: [InvestmentController],
  providers: [],
})
export class AppModule {}
