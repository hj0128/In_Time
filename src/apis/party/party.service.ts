import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Party } from './party.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>, //
  ) {}

  findAll() {
    return this.partyRepository.find();
  }

  create({ name, members }) {
    return this.partyRepository.save({
      name,
      members,
    });
  }
}
