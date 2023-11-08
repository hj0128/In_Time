import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Party } from './party.entity';
import { Repository } from 'typeorm';
import { IPartyServiceCreate } from './party.interface';

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>, //
  ) {}

  findAll(): Promise<Party[]> {
    return this.partyRepository.find();
  }

  create({ partyCreateDto }: IPartyServiceCreate): Promise<Party> {
    const { name, members } = partyCreateDto;
    return this.partyRepository.save({
      name,
      members,
    });
  }
}
