import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, In, Repository, UpdateResult } from 'typeorm';
import { UserService } from '../user.service';
import { User } from '../user.entity';
import { AuthService } from '../../auth/auth.service';
import { Party_UserService } from '../../party-user/party-user.service';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { UserCreateDto, UserSetRedisDto } from '../user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { RedisInfo } from '../user.interface';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let authService: AuthService;
  let partyUserService: Party_UserService;
  let cacheManager: any;

  const manager = {
    softDelete: jest.fn(),
  };

  const queryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: manager,
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };

    const mockAuthService = { logout: jest.fn() };
    const mockDataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };
    const mockPartyUserService = { checkPartyMembers: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: AuthService, useValue: mockAuthService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: Party_UserService, useValue: mockPartyUserService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    partyUserService = module.get<Party_UserService>(Party_UserService);
    cacheManager = module.get<any>(CACHE_MANAGER);
  });

  const mockUser: User = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    point: 0,
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    deletedAt: null,
    partyUsers: [],
    friends: [],
    userPoints: [],
  };

  describe('findOneWithUserId', () => {
    it('userID에 해당하는 user를 반환한다.', async () => {
      const inputId: string = 'User01';

      const expectedFindOne: User = mockUser;

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(expectedFindOne);

      const result: User = await userService.findOneWithUserID({ id: inputId });

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

      const expectedFindAllUser: User[] = [mockUser];

      jest.spyOn(mockUserRepository, 'find').mockResolvedValue(expectedFindAllUser);

      const result: User = await userService.findOneWithName({ name: inputName });

      expect(result).toEqual(expectedFindAllUser[0]);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { name: inputName },
        withDeleted: true,
      });
    });
  });

  describe('findOneWithEmail', () => {
    it('email과 일치하는 user를 반환한다.', async () => {
      const inputEmail: string = 'a@a.com';

      const expectedFindOne: User[] = [mockUser];

      jest.spyOn(mockUserRepository, 'find').mockResolvedValue(expectedFindOne);

      const result: User = await userService.findOneWithEmail({ email: inputEmail });

      expect(result).toEqual(expectedFindOne[0]);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { email: inputEmail },
        withDeleted: true,
      });
    });
  });

  describe('sendEmail', () => {
    it('email과 일치하는 user를 반환한다.', async () => {
      const sendMailSpy = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({}),
      } as any);

      const inputName: string = '철수';
      const inputUserEmail: string = 'a@a.com';

      const result: void = await userService.sendEmail({
        name: inputName,
        userEmail: inputUserEmail,
      });

      expect(result).toBeUndefined();
      expect(sendMailSpy).toHaveBeenCalledWith({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODE_MAIL_GMAIL_EMAIL,
          pass: process.env.NODE_MAIL_GMAIL_PASSWORD,
        },
      });
      expect(sendMailSpy.mock.calls[0][0]).toMatchObject({
        auth: { pass: undefined, user: undefined },
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        service: 'gmail',
      });
    });
  });

  describe('create', () => {
    const inputUserCreateDto: UserCreateDto = {
      email: 'a@a.com',
      name: '철수',
      password: '1234',
      profileUrl: 'https://a.jpg',
      userEmail: 'b@b.com',
    };

    it('user를 생성한 후 생성된 user를 반환한다.', async () => {
      const inputHash: string = '$2b$10$OvlGGKVyDzZ5tNebCf7wAuyWKlNDVR.GUODs8O97FQRwvGgPGI1Ky';

      const expectedSave: User = mockUser;

      jest.spyOn(userService, 'findOneWithName').mockResolvedValue(undefined);
      jest.spyOn(userService, 'findOneWithEmail').mockResolvedValue(undefined);
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
      jest.spyOn(userService, 'findOneWithName').mockResolvedValue(undefined);
      jest.spyOn(userService, 'findOneWithEmail').mockResolvedValue(undefined);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(undefined);

      try {
        await userService.create({ userCreateDto: inputUserCreateDto });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('softDelete', () => {
    const inputUserID: string = 'User01';
    const inputHeaders: IncomingHttpHeaders = {
      authorization: 'Bearer validAccessToken',
      cookie: 'refreshToken=validRefreshToken',
    };

    const expectedUser: User = mockUser;

    it('user를 소프트 삭제한다.', async () => {
      const expectedSoftDelete: UpdateResult = { generatedMaps: [], affected: 1, raw: [] };

      jest.spyOn(userService, 'findOneWithUserID').mockResolvedValue(expectedUser);
      jest.spyOn(partyUserService, 'checkPartyMembers').mockResolvedValue(undefined);
      jest.spyOn(manager, 'softDelete').mockResolvedValue(expectedSoftDelete);
      jest.spyOn(authService, 'logout').mockResolvedValue('accessToken');

      const result: boolean = await userService.softDelete({
        userID: inputUserID,
        headers: inputHeaders,
      });

      expect(result).toBe(true);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('user 소프트 삭제에 실패하면 롤백한다.', async () => {
      jest.spyOn(userService, 'findOneWithUserID').mockResolvedValue(expectedUser);
      jest.spyOn(partyUserService, 'checkPartyMembers').mockResolvedValue(undefined);
      jest.spyOn(manager, 'softDelete').mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });

      await expect(
        userService.softDelete({
          userID: inputUserID,
          headers: inputHeaders,
        }),
      ).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('setRedis', () => {
    it('user의 정보를 redis에 저장한다.', async () => {
      const mockUserSetRedis: UserSetRedisDto = {
        myLat: 12.203,
        myLng: 15.205,
        time: '2023. 11. 30. 오전 11:01:46',
        isArrive: true,
      };

      const inputUser: User = mockUser;
      const inputUserSetRedisDto: UserSetRedisDto = mockUserSetRedis;

      const expectedUserSetRedisDto: UserSetRedisDto = mockUserSetRedis;

      jest.spyOn(cacheManager, 'set').mockResolvedValue(expectedUserSetRedisDto);

      const result: UserSetRedisDto = await userService.setRedis({
        user: inputUser,
        userSetRedisDto: inputUserSetRedisDto,
      });

      expect(result).toEqual(expectedUserSetRedisDto);
      expect(cacheManager.set).toHaveBeenCalledWith(`${inputUser.name}`, inputUserSetRedisDto, {
        ttl: 7200,
      });
    });
  });

  describe('getRedis', () => {
    it('redis에서 user의 정보를 가져온다.', async () => {
      const mockRedisInfo: RedisInfo = {
        userName: '철수',
        myLat: 12.203,
        myLng: 15.205,
        time: '2023. 11. 30. 오전 11:01:46',
        isArrive: true,
      };
      const mockUserSetRedis: UserSetRedisDto = {
        myLat: 12.203,
        myLng: 15.205,
        time: '2023. 11. 30. 오전 11:01:46',
        isArrive: true,
      };

      const inputUsersName: string = '철수';

      const expectedGet: UserSetRedisDto = mockUserSetRedis;
      const expectedGetRedis: RedisInfo[] = [mockRedisInfo];

      jest.spyOn(cacheManager, 'get').mockResolvedValue(expectedGet);

      const result: RedisInfo[] = await userService.getRedis({
        usersName: [inputUsersName],
      });

      expect(result).toEqual(expectedGetRedis);
      expect(cacheManager.get).toHaveBeenCalledWith(inputUsersName);
    });
  });
});
