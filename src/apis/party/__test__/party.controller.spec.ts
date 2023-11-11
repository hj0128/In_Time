// import { Test, TestingModule } from '@nestjs/testing';
// import { PartyController } from '../party.controller';
// import { PartyService } from '../party.service';

// class MockPartyService {
//   findAll() {
//     return Promise.resolve([
//       {
//         id: 'PT001',
//         name: '동아리 모임',
//         members: '["U001", "U002"]',
//         point: 0,
//       },
//       {
//         id: 'PT002',
//         name: '돼지 파티',
//         members: '["U002", "U003"]',
//         point: 1000,
//       },
//     ]);
//   }
// }

// describe('PartyController', () => {
//   let partyController: PartyController;

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
