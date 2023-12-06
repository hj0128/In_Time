import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { POINT_STATUS, Point } from './point.entity';
import { DataSource, Repository } from 'typeorm';
import {
  IPointServiceCheckDuplication,
  IPointServiceCheckPoint,
  IPointServiceFill,
  IPointServiceFindOneWithImpUid,
  IPointServiceFindWithUserID,
  IPointServiceFine,
  IPointServiceSend,
} from './point.interface';
import { User } from '../user/user.entity';
import { IamPortService } from '../iam-port/iam-port.service';
import { UserService } from '../user/user.service';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,

    private readonly dataSource: DataSource,
    private readonly iamPortService: IamPortService,
    private readonly userService: UserService,
  ) {}

  findWithUserID({ userID }: IPointServiceFindWithUserID): Promise<Point[]> {
    return this.pointRepository.find({ where: { user: { id: userID } } });
  }

  findOneWithImpUid({ impUid }: IPointServiceFindOneWithImpUid): Promise<Point> {
    return this.pointRepository.findOne({ where: { impUid } });
  }

  async checkDuplication({ impUid }: IPointServiceCheckDuplication): Promise<void> {
    const point = await this.findOneWithImpUid({ impUid });
    if (point) throw new ConflictException('이미 처리된 결제 아이디입니다.');
  }

  async fill({ user: _user, pointFillDto }: IPointServiceFill): Promise<Point> {
    const { impUid, amount } = pointFillDto;

    await this.iamPortService.checkPaid({ impUid, amount });

    await this.checkDuplication({ impUid });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const point = await queryRunner.manager.save(Point, {
        impUid,
        amount,
        status: POINT_STATUS.POINT_FILL,
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

  async send({ user: _user, pointSendDto }: IPointServiceSend): Promise<Point> {
    const { amount } = pointSendDto;
    const id = _user.id;

    this.checkPoint({ userID: id, amount });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const point = await queryRunner.manager.save(Point, {
        impUid: 'imp_send',
        amount: -amount,
        status: POINT_STATUS.POINT_SEND,
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

  async fine({ pointFineDto, queryRunner }: IPointServiceFine): Promise<Point> {
    try {
      const { userName, amount } = pointFineDto;

      const user = await queryRunner.manager.findOne(User, {
        where: { name: userName },
        lock: { mode: 'pessimistic_write' },
      });

      this.checkPoint({ userID: user.id, amount });

      const point = await queryRunner.manager.save(Point, {
        impUid: 'imp_fine',
        amount: -amount,
        status: POINT_STATUS.FINE,
        user,
      });

      await queryRunner.manager.increment(User, { id: user.id }, 'point', -amount);

      return point;
    } catch (error) {
      throw new InternalServerErrorException('point 업데이트에 실패하였습니다.');
    }
  }
}
