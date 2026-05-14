import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cedente } from './entities/cedente.entity';
import { CedenteService } from './cedente.service';
import { CedenteController } from './cedente.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cedente])],
  providers: [CedenteService],
  controllers: [CedenteController],
  exports: [CedenteService],
})
export class CedenteModule {}
