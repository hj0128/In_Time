import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import {
  IUserServiceCreate,
  IUserServiceFindOneWithEmail,
  IUserServiceFindOneWithName,
} from './user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //
  ) {}

  findOneWithName({ name }: IUserServiceFindOneWithName): Promise<User> {
    return this.userRepository.findOne({ where: { name } });
  }

  findOneWithEmail({ email }: IUserServiceFindOneWithEmail): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create({ userCreateDto }: IUserServiceCreate): Promise<User> {
    const { name, email, password, profileUrl } = userCreateDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      profileUrl,
    });
  }
}
