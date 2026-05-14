import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReceivableTypeService } from './receivable-type.service';

@ApiTags('receivable-types')
@Controller('receivable-types')
export class ReceivableTypeController {
  constructor(private readonly receivableTypeService: ReceivableTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os tipos de recebível e seus spreads' })
  findAll() {
    return this.receivableTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um tipo de recebível por ID' })
  findOne(@Param('id') id: string) {
    return this.receivableTypeService.findOne(id);
  }
}
