import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { UpdateRateDto } from './dto/update-rate.dto';

@ApiTags('currencies')
@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as moedas e taxas atuais' })
  findAll() {
    return this.currencyService.findAll();
  }

  @Put(':code/rate')
  @ApiOperation({ summary: 'Atualiza a taxa de câmbio de uma moeda' })
  updateRate(@Param('code') code: string, @Body() dto: UpdateRateDto) {
    return this.currencyService.updateRate(code.toUpperCase(), dto.rate);
  }
}
