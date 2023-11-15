// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { PartyService } from '../party.service';
// import { Party } from '../party.entity';
// import { Party_UserService } from '../../party-user/party-user.service';
// import { Party_User } from '../../party-user/party-user.entity';

// class MockPartyUserRepository {}

// class MockPartyRepository {
//   mydb = [
//     {
//       id: 'P001',
//       name: '맛집 탐방',
//       point: 0,
//     },
//     {
//       id: 'P002',
//       name: '카페 탐방',
//       point: 1000,
//     },
//   ];
//   myDB = [
//     {
//       id: 'P001',
//       name: '맛집 탐방',
//       point: 0,
//       partyUsers: {
//         id: 'PU001',
//         party: {},
//         user: {
//           id: 'U001',
//           name: '철수',
//           email: 'a@a.com',
//           password: '1234',
//           profileUrl: 'https://철수.jpg',
//           badgeUrl: 'https://배지.jpg',
//         },
//       },
//     },
//     {
//       id: 'P002',
//       name: '카페 탐방',
//       point: 1000,
//       partyUsers: {
//         id: 'PU002',
//         party: {},
//         user: {
//           id: 'U001',
//           name: '철수',
//           email: 'a@a.com',
//           password: '1234',
//           profileUrl: 'https://철수.jpg',
//           badgeUrl: 'https://배지.jpg',
//         },
//       },
//     },
//   ];

//   findOne({ where }) {
//     const party = this.mydb.filter((el) => el.id === where.id);
//     if (party) return party;
//     return null;
//   }

//   find({ where }) {
//     const parties = this.myDB.filter((el) => el.partyUsers.user.id === where.partyUsers.user.id);
//     if (parties) return parties;
//     return null;
//   }

//   save({ name }) {
//     return this.myDB.push({
//       id: 'P003',
//       name,
//       point: 0,
//       partyUsers: {
//         id: '',
//         party: {},
//         user: {
//           id: '',
//           name: '',
//           email: '',
//           password: '',
//           profileUrl: '',
//           badgeUrl: '',
//         },
//       },
//     });
//   }
// }

// describe('PartyService', () => {
//   let partyService: PartyService;

//   beforeEach(async () => {
//     const partyModule: TestingModule = await Test.createTestingModule({
//       providers: [
//         PartyService,
//         Party_UserService,
//         {
//           provide: getRepositoryToken(Party),
//           useClass: MockPartyRepository,
//         },
//         {
//           provide: getRepositoryToken(Party_User),
//           useClass: MockPartyUserRepository,
//         },
//       ],
//     }).compile();

//     partyService = partyModule.get<PartyService>(PartyService);
//   });

//   describe('findOneWithPartyID', () => {
//     it('partyID에 해당하는 party를 가져온다.', () => {
//       const result = partyService.findOneWithPartyID({ partyID: 'P001' });
//       expect(result).toStrictEqual({
//         id: 'P001',
//         name: '맛집 탐방',
//         point: 0,
//       });
//     });
//   });

//   describe('findAllWithUser', () => {
//     it('userID에 해당하는 party를 모두 가져온다.', () => {
//       const user = {
//         id: 'U001',
//         name: '철수',
//         email: 'a@a.com',
//         password: '1234',
//         profileUrl: 'https://철수.png',
//       };

//       const result = partyService.findAllWithUser({ user });

//       expect(result).toStrictEqual([
//         { id: 'P001', name: '맛집 탐방', point: 0 },
//         { id: 'P002', name: '카페 탐방', point: 1000 },
//       ]);
//     });
//   });

//   describe('create', () => {
//     const partyCreateDto = { name: '영화 관람', friendsID: '["U002", "U003"]' };
//     const user = {
//       id: 'U001',
//       name: '철수',
//       email: 'a@a.com',
//       password: '1234',
//       profileUrl: 'https://철수.png',
//     };

//     it('party를 생성한다.', async () => {
//       const result = await partyService.create({ partyCreateDto, user });

//       expect(result).toStrictEqual({
//         id: 'P003',
//         name: '영화 관람',
//         point: 0,
//         partyUsers: {
//           id: '',
//           party: {},
//           user: {
//             id: '',
//             name: '',
//             email: '',
//             password: '',
//             profileUrl: '',
//             badgeUrl: '',
//           },
//         },
//       });
//     });

//     // it('party-user를 생성한다.', () => {
//     //   const result = await partyService.create({ partyCreateDto, user });
//     // });
//   });
// });
