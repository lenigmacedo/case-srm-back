import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cedente } from './entities/cedente.entity';
import { CreateCedenteDto } from './dto/create-cedente.dto';

@Injectable()
export class CedenteService {
  constructor(
    @InjectRepository(Cedente)
    private readonly cedenteRepository: Repository<Cedente>,
  ) {}

  async create(dto: CreateCedenteDto): Promise<Cedente> {
    const existing = await this.cedenteRepository.findOne({
      where: { cnpj: dto.cnpj },
    });
    if (existing)
      throw new ConflictException(`CNPJ ${dto.cnpj} already registered`);
    const cedente = this.cedenteRepository.create(dto);
    return this.cedenteRepository.save(cedente);
  }

  findAll(): Promise<Cedente[]> {
    return this.cedenteRepository.find();
  }

  async findOne(id: string): Promise<Cedente> {
    const cedente = await this.cedenteRepository.findOne({ where: { id } });
    if (!cedente) throw new NotFoundException(`Cedente ${id} not found`);
    return cedente;
  }
}
