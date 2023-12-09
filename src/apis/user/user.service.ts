import { GoneException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { In, Repository } from 'typeorm';
import {
  IUserServiceCreate,
  IUserServiceDelete,
  IUserServiceFindAllWithUserID,
  IUserServiceFindOneWithEmail,
  IUserServiceFindOneWithName,
  IUserServiceFindOneWithUserID,
  IUserServiceGetRedis,
  IUserServiceSetRedis,
  RedisInfo,
} from './user.interface';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserSetRedisDto } from './user.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  findOneWithUserID({ id }: IUserServiceFindOneWithUserID): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  findAllWithUserID({ usersID }: IUserServiceFindAllWithUserID): Promise<User[]> {
    return this.userRepository.find({ where: { id: In(usersID) } });
  }

  findOneWithName({ name }: IUserServiceFindOneWithName): Promise<User> {
    return this.userRepository.findOne({ where: { name } });
  }

  findOneWithEmail({ email }: IUserServiceFindOneWithEmail): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
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

  async delete({ userID }: IUserServiceDelete): Promise<boolean> {
    const user = await this.findOneWithUserID({ id: userID });
    if (user.deletedAt)
      throw new GoneException(
        '이미 탈퇴한 사용자입니다. 계정을 복구하시려면 다시 로그인해 주세요.',
      );

    const result = await this.userRepository.softDelete({ id: userID });
    console.log(result);
    if (!result) throw new InternalServerErrorException('회원탈퇴에 실패하였습니다.');

    return result.affected ? true : false;
  }

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
