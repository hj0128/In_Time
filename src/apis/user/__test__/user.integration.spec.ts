// import { Test, TestingModule } from '@nestjs/testing';
// import * as request from 'supertest';
// import { AppModule } from '../../../app.module';
// // import { DataSource } from 'typeorm';
// import { INestApplication } from '@nestjs/common';

// describe('UserIntegration', () => {
//   let app: INestApplication;
//   // let dataSource: DataSource;

//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     // dataSource = module.get<DataSource>(DataSource);
//     app = module.createNestApplication();
//     await app.init();
//   });

//   afterAll(async () => {
//     await app.close();
//     // await dataSource.destroy();
//   });

//   describe('user/userCreate (POST)', () => {
//     it('새로운 user를 생성한다.', async () => {
//       const inputUserCreateDto = {
//         name: '테스트',
//         email: 'test@test.com',
//         password: 'test1234',
//         profileUrl: 'https://test.jpg',
//       };

//       const response = await request(app.getHttpServer())
//         .post('/user/userCreate')
//         .send(inputUserCreateDto)
//         .expect(201);

//       expect(response.body).toHaveProperty('id');
//       expect(response.body).toHaveProperty('password');
//       expect(response.body).toHaveProperty('badgeUrl');
//       expect(response.body.name).toBe(inputUserCreateDto.name);
//       expect(response.body.email).toBe(inputUserCreateDto.email);
//       expect(response.body.profileUrl).toBe(inputUserCreateDto.profileUrl);
//     });
//   });

//   describe('user/userFindOneWithName (Get)', () => {
//     it('name과 일치하는 user를 가져온다.', async () => {
//       const inputName = {
//         name: '테스트',
//       };

//       const response = await request(app.getHttpServer())
//         .get('/user/userFindOneWithName')
//         .send(inputName)
//         .expect(200);

//       expect(response.body).toHaveProperty('id');
//       expect(response.body).toHaveProperty('email');
//       expect(response.body).toHaveProperty('password');
//       expect(response.body).toHaveProperty('profileUrl');
//       expect(response.body).toHaveProperty('badgeUrl');
//       expect(response.body.name).toBe(inputName.name);
//     });
//   });

//   describe('user/userFindOneWithEmail (Get)', () => {
//     it('email과 일치하는 user를 가져온다.', async () => {
//       const inputEmail = {
//         email: 'test@test.com',
//       };

//       const response = await request(app.getHttpServer())
//         .get('/user/userFindOneWithEmail')
//         .send(inputEmail)
//         .expect(200);

//       expect(response.body).toHaveProperty('id');
//       expect(response.body).toHaveProperty('name');
//       expect(response.body).toHaveProperty('password');
//       expect(response.body).toHaveProperty('profileUrl');
//       expect(response.body).toHaveProperty('badgeUrl');
//       expect(response.body.email).toBe(inputEmail.email);
//     });
//   });
// });
