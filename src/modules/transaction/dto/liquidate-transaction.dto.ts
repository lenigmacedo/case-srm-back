import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class LiquidateTransactionDto {
  @ApiProperty({ example: '100000.00' })
  @IsNumberString()
  face_value: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  term_days: number;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  due_date: string;

  @ApiProperty({ example: 'uuid-do-cedente' })
  @IsUUID()
  cedente_id: string;

  @ApiProperty({ example: 'uuid-do-receivable-type' })
  @IsUUID()
  receivable_type_id: string;

  @ApiPropertyOptional({ example: 'BRL', default: 'BRL' })
  @IsString()
  @IsOptional()
  origin_currency?: string;

  @ApiPropertyOptional({ example: 'USD', default: 'BRL' })
  @IsString()
  @IsOptional()
  payment_currency?: string;
}
