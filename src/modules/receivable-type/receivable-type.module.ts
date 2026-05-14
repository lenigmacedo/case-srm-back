import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivableType } from './entities/receivable-type.entity';
import { ReceivableTypeService } from './receivable-type.service';
import { ReceivableTypeController } from './receivable-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivableType])],
  providers: [ReceivableTypeService],
  controllers: [ReceivableTypeController],
  exports: [ReceivableTypeService],
})
export class ReceivableTypeModule {}
