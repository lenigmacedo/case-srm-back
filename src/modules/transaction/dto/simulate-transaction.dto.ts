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

export class SimulateTransactionDto {
  @ApiProperty({ example: '100000.00' })
  @IsNumberString()
  face_value: string;

  @ApiProperty({ example: 30, description: 'Prazo em dias' })
  @IsInt()
  @Min(1)
  term_days: number;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  due_date: string;

  @ApiProperty({ example: 'uuid-do-receivable-type' })
  @IsUUID()
  receivable_type_id: string;

  @ApiPropertyOptional({
    example: 'BRL',
    default: 'BRL',
    description: 'Moeda original do título',
  })
  @IsString()
  @IsOptional()
  origin_currency?: string;

  @ApiPropertyOptional({
    example: 'USD',
    default: 'BRL',
    description: 'Moeda de pagamento desejada',
  })
  @IsString()
  @IsOptional()
  payment_currency?: string;
}
