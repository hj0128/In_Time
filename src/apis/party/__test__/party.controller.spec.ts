// import { Test, TestingModule } from '@nestjs/testing';
// import { PartyController } from '../party.controller';
// import { PartyService } from '../party.service';
// import { AuthController } from 'src/apis/auth/auth.controller';

// describe('PartyController', () => {
//   let partyController: PartyController;
//   let partyService: PartyService;
//   let authController: AuthController;
//   let authToken: string;

//   beforeAll(async () => {
//     const email = 'a@a.com';
//     const password: '1234';

//     authToken = await authController.authLogin(email, password)
//   })

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [PartyController],
//       providers: [
//         {
//           provide: PartyService,
//           useClass: MockPartyService,
//         },
//       ],
//     }).compile();

//     partyController = module.get<PartyController>(PartyController);
//   });

//   describe('partyFindAll', () => {
//     it('should return an array of parties', async () => {
//       const result = await partyController.partyFindAll();
//       expect(result).toEqual([
//         {
//           id: 'PT001',
//           name: '동아리 모임',
//           members: '["U001", "U002"]',
//           point: 0,
//         },
//         {
//           id: 'PT002',
//           name: '돼지 파티',
//           members: '["U002", "U003"]',
//           point: 1000,
//         },
//       ]);
//     });
//   });
// });
