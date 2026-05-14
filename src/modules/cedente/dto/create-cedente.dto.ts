import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, Length, Matches } from 'class-validator';
import { RiskTier } from '../entities/cedente.entity';
import { REGEX_PATTERNS } from 'src/constants/regex.constants';

export class CreateCedenteDto {
  @ApiProperty({ example: '12345678000195' })
  @IsString()
  @Length(14, 14)
  @Matches(REGEX_PATTERNS.CNPJ, {
    message: 'CNPJ deve conter exatamente 14 dígitos',
  })
  cnpj: string;

  @ApiProperty({ example: 'Empresa Exemplo Ltda' })
  @IsString()
  @Length(1, 150)
  name: string;

  @ApiPropertyOptional({ enum: RiskTier, default: RiskTier.MEDIUM })
  @IsEnum(RiskTier)
  risk_tier?: RiskTier;
}
