import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class UpdateRateDto {
  @ApiProperty({
    example: '5.850000',
    description: 'Nova taxa em relação ao BRL',
  })
  @IsNumberString()
  rate: string;
}
