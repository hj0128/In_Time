import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { USER_POINT_STATUS, User_Point } from './user-point.entity';
import { DataSource, Repository } from 'typeorm';
import {
  IPointServiceCheckDuplication,
  IPointServiceCheckPoint,
  IPointServiceFill,
  IPointServiceFindOneWithImpUid,
  IPointServiceFine,
  IPointServiceSend,
  IUserPointServiceFindWithUserID,
} from './user-point.interface';
import { User } from '../user/user.entity';
import { IamPortService } from '../iam-port/iam-port.service';
import { UserService } from '../user/user.service';
import { Party } from '../party/party.entity';
import { PARTY_POINT_STATUS, Party_Point } from '../party_point/party-point.entity';

@Injectable()
export class User_PointService {
  constructor(
    @InjectRepository(User_Point)
    private readonly userPointRepository: Repository<User_Point>,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly dataSource: DataSource,
    private readonly iamPortService: IamPortService,
  ) {}

  findWithUserID({ userID }: IUserPointServiceFindWithUserID): Promise<User_Point[]> {
    return this.userPointRepository.find({ where: { user: { id: userID } } });
  }

  findOneWithImpUid({ impUid }: IPointServiceFindOneWithImpUid): Promise<User_Point> {
    return this.userPointRepository.findOne({ where: { impUid } });
  }

  async checkDuplication({ impUid }: IPointServiceCheckDuplication): Promise<void> {
    const point = await this.findOneWithImpUid({ impUid });
    if (point) throw new ConflictException('이미 처리된 결제 아이디입니다.');
  }

  async fill({ user: _user, pointFillDto }: IPointServiceFill): Promise<User_Point> {
    const { impUid, amount } = pointFillDto;

    await this.iamPortService.checkPaid({ impUid, amount });

    await this.checkDuplication({ impUid });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const point = await queryRunner.manager.save(User_Point, {
        impUid,
        amount,
        status: USER_POINT_STATUS.POINT_FILL,
        user: _user,
      });

      const id = _user.id;
      await queryRunner.manager.increment(User, { id }, 'point', amount);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return point;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw error;
    }
  }

  async checkPoint({ userID, amount }: IPointServiceCheckPoint): Promise<void> {
    const user = await this.userService.findOneWithUserID({ id: userID });

    if (user.point < amount) {
      throw new UnprocessableEntityException('보유 포인트가 부족합니다.');
    }
  }

  async send({ user: _user, pointSendDto }: IPointServiceSend): Promise<User_Point> {
    const { amount } = pointSendDto;
    const id = _user.id;

    if (amount <= 0) {
      throw new UnprocessableEntityException('1원 이상부터 보낼 수 있습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      await this.checkPoint({ userID: id, amount });

      const point = await queryRunner.manager.save(User_Point, {
        impUid: 'imp_send',
        amount: -amount,
        status: USER_POINT_STATUS.POINT_SEND,
        user: _user,
      });

      await queryRunner.manager.increment(User, { id }, 'point', -amount);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return point;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }

  async fine({ pointFineDto, queryRunner }: IPointServiceFine): Promise<User_Point> {
    try {
      const { userName, partyID, amount } = pointFineDto;

      const user = await queryRunner.manager.findOne(User, {
        where: { name: userName },
        lock: { mode: 'pessimistic_write' },
      });

      const party = await queryRunner.manager.findOne(Party, {
        where: { id: partyID },
        lock: { mode: 'pessimistic_write' },
      });

      this.checkPoint({ userID: user.id, amount });

      const point = await queryRunner.manager.save(User_Point, {
        impUid: 'imp_fine',
        amount: -amount,
        status: USER_POINT_STATUS.FINE_SEND,
        user,
      });

      await queryRunner.manager.save(Party_Point, {
        userName,
        amount: amount,
        status: PARTY_POINT_STATUS.FINE_RECEIVE,
        party,
      });

      await queryRunner.manager.increment(User, { id: user.id }, 'point', -amount);

      return point;
    } catch (error) {
      throw new InternalServerErrorException('point 업데이트에 실패하였습니다.');
    }
  }
}
