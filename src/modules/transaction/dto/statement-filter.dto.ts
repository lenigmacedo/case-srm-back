import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StatementFilterDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cedente_id?: string;

  @ApiPropertyOptional({ example: 'BRL' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
