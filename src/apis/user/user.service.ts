import {
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DataSource, In, Repository } from 'typeorm';
import {
  IUserServiceCreate,
  IUserServiceFindAllWithUserID,
  IUserServiceFindOneWithEmail,
  IUserServiceFindOneWithName,
  IUserServiceFindOneWithUserID,
  IUserServiceGetRedis,
  IUserServiceSetRedis,
  IUserServiceSoftDelete,
  RedisInfo,
} from './user.interface';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserSetRedisDto } from './user.dto';
import * as nodemailer from 'nodemailer';
import { AuthService } from '../auth/auth.service';
import { Friend } from '../friend/friend.entity';
import { Party_UserService } from '../party-user/party-user.service';
import { Party_User } from '../party-user/party-user.entity';
import { User_Point } from '../user_point/user-point.entity';
// import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    private readonly dataSource: DataSource,
    private readonly partyUserService: Party_UserService,
  ) {}

  findOneWithUserID({ id }: IUserServiceFindOneWithUserID): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  findAllWithUserID({ usersID }: IUserServiceFindAllWithUserID): Promise<User[]> {
    return this.userRepository.find({ where: { id: In(usersID) } });
  }

  async findOneWithName({ name }: IUserServiceFindOneWithName): Promise<User> {
    const users = await this.userRepository.find({ where: { name }, withDeleted: true });

    return users[0];
  }

  async findOneWithEmail({ email }: IUserServiceFindOneWithEmail): Promise<User> {
    const users = await this.userRepository.find({ where: { email }, withDeleted: true });

    return users[0];
  }

  async sendEmail({ name, userEmail }) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODE_MAIL_GMAIL_EMAIL,
        pass: process.env.NODE_MAIL_GMAIL_PASSWORD,
      },
    });

    const html = `
      <div style="max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
        <h1 style="color: #333;">In_Time 회원가입을 축하합니다!</h1>
        <p style="color: #555; font-size: 16px;">안녕하세요 ${name}님!</p>
        <p style="color: #555; font-size: 16px;">In_Time에 가입해 주셔서 감사합니다.</p>
        <p style="color: #555; font-size: 16px;">이제 In_Time의 다양한 서비스를 자유롭게 이용하실 수 있습니다.</p>
        <p style="color: #555; font-size: 16px;">추가적인 정보나 도움이 필요하시면 언제든지 문의해 주세요.</p>
        <p style="color: #555; font-size: 16px;">감사합니다!<br><br>In_Time 팀 드림</p>    
      </div>
    `;

    transporter.sendMail({
      from: process.env.NODE_MAIL_GMAIL_EMAIL,
      to: userEmail,
      subject: 'In_Time 회원가입을 축하합니다!.',
      html,
    });
  }

  async create({ userCreateDto }: IUserServiceCreate): Promise<User> {
    const { name, email, password, profileUrl, userEmail } = userCreateDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const create = await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      profileUrl,
    });

    if (!create) throw new InternalServerErrorException('회원 생성에 실패하였습니다.');

    await this.sendEmail({ name, userEmail });

    return create;
  }

  async softDelete({ userID, headers }: IUserServiceSoftDelete): Promise<boolean> {
    const user = await this.findOneWithUserID({ id: userID });
    if (user.deletedAt) throw new GoneException('이미 탈퇴한 사용자입니다.');
    if (user.point > 0) throw new ForbiddenException('포인트를 모두 출금한 후 탈퇴해 주세요.');

    await this.partyUserService.checkPartyMembers({ userID });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');

    try {
      await queryRunner.manager.softDelete(User_Point, { user: { id: userID } });
      await queryRunner.manager.softDelete(Friend, { user: { id: userID } });
      await queryRunner.manager.softDelete(Friend, { toUserID: userID });
      await queryRunner.manager.softDelete(Party_User, { user: { id: userID } });

      const result = await queryRunner.manager.softDelete(User, { id: userID });

      await this.authService.logout({ headers });

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return result.affected ? true : false;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }

  // softDelete된 user를 하루 뒤에 완전히 삭제
  // async softDelete({ userID }: IUserServiceDelete): Promise<User> {
  //   const user = await this.findOneWithUserID({ id: userID });
  //   if (user.deletedAt) throw new GoneException('이미 탈퇴한 사용자입니다.');

  //   user.deletedAt = new Date();
  //   const result = await this.userRepository.save(user);

  //   return result;
  // }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async delete(): Promise<void> {
  //   const oneDayAgo = new Date();
  //   oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  //   const softDeletedUsers = await this.userRepository
  //     .createQueryBuilder('user')
  //     .where('user.deletedAt IS NOT NULL')
  //     .getMany();

  //   for (const user of softDeletedUsers) {
  //     const deletedAtDate = new Date(user.deletedAt);

  //     if (deletedAtDate.getTime() <= oneDayAgo.getTime()) {
  //       await this.userRepository.delete(user);
  //     }
  //   }
  // }

  async setRedis({ user, userSetRedisDto }: IUserServiceSetRedis): Promise<UserSetRedisDto> {
    return this.cacheManager.set(`${user.name}`, userSetRedisDto, { ttl: 7200 });
  }

  async getRedis({ usersName }: IUserServiceGetRedis): Promise<RedisInfo[]> {
    const usersLocation = await Promise.all(
      usersName.map(async (userName) => {
        const value = await this.cacheManager.get(userName);
        return { userName, ...(value as RedisInfo) };
      }),
    );

    return usersLocation;
  }
}
