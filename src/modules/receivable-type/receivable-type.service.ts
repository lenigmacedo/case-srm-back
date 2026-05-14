import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceivableType } from './entities/receivable-type.entity';
import { CreateReceivableTypeDto } from './dto/create-receivable-type.dto';

@Injectable()
export class ReceivableTypeService {
  constructor(
    @InjectRepository(ReceivableType)
    private readonly receivableTypeRepository: Repository<ReceivableType>,
  ) {}

  findAll(): Promise<ReceivableType[]> {
    return this.receivableTypeRepository.find();
  }

  async findOne(id: string): Promise<ReceivableType> {
    const rt = await this.receivableTypeRepository.findOne({ where: { id } });
    if (!rt) throw new NotFoundException(`ReceivableType ${id} not found`);
    return rt;
  }

  async create(data: CreateReceivableTypeDto): Promise<ReceivableType> {
    const rt = this.receivableTypeRepository.create(data);
    return this.receivableTypeRepository.save(rt);
  }
}
