import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { REGEX_PATTERNS } from 'src/constants/regex.constants';

export class CreateReceivableTypeDto {
  @ApiProperty({ example: 'NFE' })
  @IsString()
  @Length(1, 50)
  code: string;

  @ApiProperty({ example: 'Nota Fiscal Eletrônica' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: '0.015000' })
  @IsString()
  @Matches(REGEX_PATTERNS.SPREAD_MONTHLY, {
    message: 'Spread mensal deve ter até 6 casas decimais',
  })
  spread_monthly: string;
}
