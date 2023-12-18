import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { User } from '../user.entity';
import { UserCreateDto } from '../user.dto';
import { Request } from 'express';
import { JwtReqUser } from 'src/commons/interface/req.interface';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = {
      findOneWithUserID: jest.fn(),
      findOneWithName: jest.fn(),
      findOneWithEmail: jest.fn(),
      create: jest.fn(),
      softDelete: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService }, //
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  const mockReq: Request & JwtReqUser = {
    user: {
      id: 'User01',
      name: '철수',
      email: 'a@a.com',
      password: '1234',
      profileUrl: 'http://a.jpg',
    },
  } as Request & JwtReqUser;
  const mockUser: User = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    point: 0,
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    deletedAt: null,
    userPoints: [],
    partyUsers: [],
    friends: [],
    userLocations: [],
  };

  describe('userFindOneWithUserID', () => {
    it('해당하는 userID의 user를 반환한다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;

      const expectedFindOneWithUserID: User = mockUser;

      jest.spyOn(userService, 'findOneWithUserID').mockResolvedValueOnce(expectedFindOneWithUserID);

      const result: User = await userController.userFindOneWithUserID(inputReq);

      expect(result).toEqual(expectedFindOneWithUserID);
      expect(userService.findOneWithUserID).toHaveBeenCalledWith({ id: inputReq.user.id });
    });
  });

  describe('userFindOneWithName', () => {
    it('name과 일치하는 user를 반환한다.', async () => {
      const inputName: string = '철수';

      const expectedFindOneWithName: User = mockUser;

      jest.spyOn(userService, 'findOneWithName').mockResolvedValueOnce(expectedFindOneWithName);

      const result: User = await userController.userFindOneWithName(inputName);

      expect(result).toEqual(expectedFindOneWithName);
      expect(userService.findOneWithName).toHaveBeenCalledWith({ name: inputName });
    });
  });

  describe('userFindOneWithEmail', () => {
    it('email과 일치하는 user를 반환한다.', async () => {
      const inputEmail: string = 'a@a.com';

      const expectedFindOneWithEmail: User = mockUser;

      jest.spyOn(userService, 'findOneWithEmail').mockResolvedValueOnce(expectedFindOneWithEmail);

      const result: User = await userController.userFindOneWithEmail(inputEmail);

      expect(result).toEqual(expectedFindOneWithEmail);
      expect(userService.findOneWithEmail).toHaveBeenCalledWith({ email: inputEmail });
    });
  });

  describe('userCreate', () => {
    it('user를 생성한 후 생성된 user를 반환한다.', async () => {
      const inputUserCreateDto: UserCreateDto = {
        name: '철수',
        email: 'a@a.com',
        password: '1234',
        profileUrl: 'https://a.jpg',
        userEmail: 'b@b.com',
      };

      const expectedCreate: User = mockUser;

      jest.spyOn(userService, 'create').mockResolvedValueOnce(expectedCreate);

      const result: User = await userController.userCreate(inputUserCreateDto);

      expect(result).toEqual(expectedCreate);
      expect(userService.create).toHaveBeenCalledWith({ userCreateDto: inputUserCreateDto });
    });
  });

  describe('userSoftDelete', () => {
    it('user를 삭제한다.', async () => {
      const inputReq: Request & JwtReqUser = mockReq;

      jest.spyOn(userService, 'softDelete').mockResolvedValueOnce(true);

      const result: boolean = await userController.userSoftDelete(inputReq);

      expect(result).toBe(true);
      expect(userService.softDelete).toHaveBeenCalledWith({
        userID: inputReq.user.id,
        headers: inputReq.headers,
      });
    });
  });
});
