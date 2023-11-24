import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { User } from '../user.entity';
import { UserCreateDto } from '../user.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = {
      findOneWithName: jest.fn(),
      findOneWithEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  const mockUser = {
    id: 'User01',
    name: '철수',
    email: 'a@a.com',
    password: '1234',
    profileUrl: 'https://a.jpg',
    badgeUrl: 'https://b.jpg',
    partyUsers: [],
    friends: [],
  };

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
        email: 'a@a.com',
        name: '철수',
        password: '1234',
        profileUrl: 'https://a.jpg',
      };

      const expectedCreate: User = mockUser;

      jest.spyOn(userService, 'create').mockResolvedValueOnce(expectedCreate);

      const result: User = await userController.userCreate(inputUserCreateDto);

      expect(result).toEqual(expectedCreate);
      expect(userService.create).toHaveBeenCalledWith({ userCreateDto: inputUserCreateDto });
    });
  });
});
