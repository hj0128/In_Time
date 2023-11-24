import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { In, Repository } from 'typeorm';
import {
  IUserServiceCreate,
  IUserServiceFindAllWithUserID,
  IUserServiceFindOneWithEmail,
  IUserServiceFindOneWithName,
  IUserServiceFindOneWithUserID,
} from './user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //
  ) {}

  findOneWithUserId({ id }: IUserServiceFindOneWithUserID): Promise<User> {
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
}
