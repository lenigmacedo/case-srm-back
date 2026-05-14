import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { SimulateTransactionDto } from './dto/simulate-transaction.dto';
import { LiquidateTransactionDto } from './dto/liquidate-transaction.dto';
import { StatementFilterDto } from './dto/statement-filter.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('simulate')
  @ApiOperation({
    summary: 'Simula o cálculo de valor presente (sem persistir)',
  })
  simulate(@Body() dto: SimulateTransactionDto) {
    return this.transactionService.simulate(dto);
  }

  @Post('liquidate')
  @ApiOperation({
    summary: 'Liquida um recebível (persiste com transação ACID)',
  })
  liquidate(@Body() dto: LiquidateTransactionDto) {
    return this.transactionService.liquidate(dto);
  }

  @Get('statement')
  @ApiOperation({
    summary: 'Extrato de liquidações com filtros e paginação server-side',
  })
  statement(@Query() filter: StatementFilterDto) {
    return this.transactionService.getStatement(filter);
  }
}
