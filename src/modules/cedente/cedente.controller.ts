import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CedenteService } from './cedente.service';
import { CreateCedenteDto } from './dto/create-cedente.dto';

@ApiTags('cedentes')
@Controller('cedentes')
export class CedenteController {
  constructor(private readonly cedenteService: CedenteService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo cedente' })
  create(@Body() dto: CreateCedenteDto) {
    return this.cedenteService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os cedentes' })
  findAll() {
    return this.cedenteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um cedente por ID' })
  findOne(@Param('id') id: string) {
    return this.cedenteService.findOne(id);
  }
}
