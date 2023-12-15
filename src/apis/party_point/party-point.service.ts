import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PARTY_POINT_STATUS, Party_Point } from './party-point.entity';
import { DataSource, Repository } from 'typeorm';
import {
  IPartyPointServiceFindWithPartyID,
  IPartyPointServiceUserSend,
} from './party-point.interface';
import { Party } from '../party/party.entity';
import { User } from '../user/user.entity';
import { USER_POINT_STATUS, User_Point } from '../user_point/user-point.entity';

@Injectable()
export class Party_PointService {
  constructor(
    @InjectRepository(Party_Point)
    private readonly partyPointRepository: Repository<Party_Point>,

    private readonly dataSource: DataSource,
  ) {}

  findWithPartyID({ partyID }: IPartyPointServiceFindWithPartyID): Promise<Party_Point[]> {
    return this.partyPointRepository.find({ where: { party: { id: partyID } } });
  }

  async userSend({
    user: _user,
    partyPointUserSendDto,
  }: IPartyPointServiceUserSend): Promise<Party_Point> {
    const { partyID, amount } = partyPointUserSendDto;
    const id = _user.id;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const party = await queryRunner.manager.findOne(Party, {
        where: { id: partyID },
        lock: { mode: 'pessimistic_write' },
      });

      const user = await queryRunner.manager.findOne(User, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (party.point < amount) {
        throw new UnprocessableEntityException('파티 포인트가 부족합니다.');
      }

      await queryRunner.manager.save(User_Point, {
        impUid: 'imp_partyReceive',
        amount: amount,
        status: USER_POINT_STATUS.PARTY_RECEIVE,
        user,
      });

      const point = await queryRunner.manager.save(Party_Point, {
        userName: user.name,
        amount: -amount,
        status: PARTY_POINT_STATUS.USER_SEND,
        party,
      });

      await queryRunner.manager.increment(User, { id }, 'point', amount);
      await queryRunner.manager.increment(Party, { id: partyID }, 'point', -amount);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return point;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }
}
