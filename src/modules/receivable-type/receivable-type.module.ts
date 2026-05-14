import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivableType } from './entities/receivable-type.entity';
import { ReceivableTypeService } from './receivable-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivableType])],
  providers: [ReceivableTypeService],
  exports: [ReceivableTypeService],
})
export class ReceivableTypeModule {}
