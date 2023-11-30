import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { In, Repository } from 'typeorm';
import {
  IUserServiceCreate,
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

  async create({ userCreateDto }: IUserServiceCreate): Promise<User> {
    const { name, email, password, profileUrl } = userCreateDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const create = await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      profileUrl,
    });

    if (!create) throw new InternalServerErrorException('회원 생성에 실패하였습니다.');

    return create;
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
