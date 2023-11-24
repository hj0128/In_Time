import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserService } from '../user.service';
import { User } from '../user.entity';
import { UserCreateDto } from '../user.dto';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  const mockUser: User = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    partyUsers: [],
    friends: [],
  };

  describe('findOneWithUserId', () => {
    it('userID에 해당하는 user를 반환한다.', async () => {
      const inputId: string = 'User01';

      const expectedFindOne: User = mockUser;

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(expectedFindOne);

      const result: User = await userService.findOneWithUserId({ id: inputId });

      expect(result).toEqual(expectedFindOne);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: inputId },
      });
    });
  });

  describe('findAllWithUserID', () => {
    it('모든 usersID에 해당하는 user를 반환한다.', async () => {
      const inputUserID: string[] = ['User01'];

      const expectedFind: User[] = [mockUser];

      jest.spyOn(mockUserRepository, 'find').mockResolvedValue(expectedFind);

      const result: User[] = await userService.findAllWithUserID({ usersID: inputUserID });

      expect(result).toEqual(expectedFind);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { id: In(inputUserID) },
      });
    });
  });

  describe('findOneWithName', () => {
    it('name과 일치하는 user를 반환한다.', async () => {
      const inputName: string = '철수';

      const expectedFindAllUser: User = mockUser;

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(expectedFindAllUser);

      const result: User = await userService.findOneWithName({ name: inputName });

      expect(result).toEqual(expectedFindAllUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { name: inputName },
      });
    });
  });

  describe('findOneWithEmail', () => {
    it('email과 일치하는 user를 반환한다.', async () => {
      const inputEmail: string = 'a@a.com';

      const expectedFindOne: User = mockUser;

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(expectedFindOne);

      const result: User = await userService.findOneWithEmail({ email: inputEmail });

      expect(result).toEqual(expectedFindOne);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: inputEmail },
      });
    });
  });

  describe('create', () => {
    const inputUserCreateDto: UserCreateDto = {
      email: 'a@a.com',
      name: '철수',
      password: '1234',
      profileUrl: 'https://a.jpg',
    };

    it('user를 생성한 후 생성된 user를 반환한다.', async () => {
      const inputHash: string = '$2b$10$OvlGGKVyDzZ5tNebCf7wAuyWKlNDVR.GUODs8O97FQRwvGgPGI1Ky';

      const expectedSave: User = mockUser;

      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(Promise.resolve(inputHash) as never);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(expectedSave);

      const result: User = await userService.create({ userCreateDto: inputUserCreateDto });

      expect(result).toEqual(expectedSave);
      expect(bcrypt.hash).toHaveBeenCalledWith(inputUserCreateDto.password, 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        name: inputUserCreateDto.name,
        email: inputUserCreateDto.email,
        password: inputHash,
        profileUrl: inputUserCreateDto.profileUrl,
      });
    });

    it('user 생성에 실패하면 InternalServerErrorException을 발생시킨다.', async () => {
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(undefined);

      try {
        await userService.create({ userCreateDto: inputUserCreateDto });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
