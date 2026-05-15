import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { ObservabilityModule } from './common/observability.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { CedenteModule } from './modules/cedente/cedente.module';
import { ReceivableTypeModule } from './modules/receivable-type/receivable-type.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        migrationsRun: true,
        migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
      }),
    }),
    ObservabilityModule,
    CurrencyModule,
    CedenteModule,
    ReceivableTypeModule,
    PricingModule,
    TransactionModule,
  ],
})
export class AppModule {}
