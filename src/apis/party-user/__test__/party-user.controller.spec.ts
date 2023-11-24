import { Test, TestingModule } from '@nestjs/testing';
import { Party_UserController } from '../party-user.controller';
import { Party_UserService } from '../party-user.service';
import { Party_User } from '../party-user.entity';

describe('PartyUserController', () => {
  let partyUserController: Party_UserController;
  let partyUserService: Party_UserService;

  beforeEach(async () => {
    const mockPartyUserService = {
      findAllWithPartyID: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [Party_UserController],
      providers: [
        {
          provide: Party_UserService,
          useValue: mockPartyUserService,
        },
      ],
    }).compile();

    partyUserController = module.get<Party_UserController>(Party_UserController);
    partyUserService = module.get<Party_UserService>(Party_UserService);
  });

  describe('partyUserFindAllWithPartyID', () => {
    it('partyID와 일치하는 모든 party-user를 반환한다.', async () => {
      const inputPartyID: string = 'Party01';

      const expectedFindAllWithPartyID: Party_User[] = [];

      jest
        .spyOn(partyUserService, 'findAllWithPartyID')
        .mockResolvedValueOnce(expectedFindAllWithPartyID);

      const result: Party_User[] =
        await partyUserController.partyUserFindAllWithPartyID(inputPartyID);

      expect(result).toEqual(expectedFindAllWithPartyID);
      expect(partyUserService.findAllWithPartyID).toHaveBeenCalledWith({
        partyID: inputPartyID,
      });
    });
  });
});
