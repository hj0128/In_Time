import { Test, TestingModule } from '@nestjs/testing';
import { IamPortService } from '../iam-port.service';
import axios from 'axios';
import { UnprocessableEntityException } from '@nestjs/common';

describe('IamPortService', () => {
  let iamPortService: IamPortService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IamPortService],
    }).compile();

    iamPortService = module.get<IamPortService>(IamPortService);
  });

  describe('getToken', () => {
    it('포트원에서 토큰을 가져온다.', async () => {
      const mockAccessToken: string = 'mockedToken';

      const expectedAccessToken: string = mockAccessToken;

      jest.spyOn(axios, 'post').mockResolvedValue({
        data: {
          response: {
            access_token: mockAccessToken,
          },
        },
      });

      const result: string = await iamPortService.getToken();

      expect(result).toEqual(expectedAccessToken);
      expect(axios.post).toHaveBeenCalledWith('https://api.iamport.kr/users/getToken', {
        imp_key: process.env.IAM_PORT_KEY,
        imp_secret: process.env.IAM_PORT_SECRET,
      });
    });
  });

  describe('checkPaid', () => {
    it('결제를 검증한다.', async () => {
      const mockImpUid = 'imp_01';
      const mockAmount = 1000;
      const mockAccessToken: string = 'mockedToken';

      const expectedAccessToken: string = mockAccessToken;

      jest.spyOn(iamPortService, 'getToken').mockResolvedValue(expectedAccessToken);

      jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
          response: {
            amount: 2000,
          },
        },
      });

      try {
        await iamPortService.checkPaid({ impUid: mockImpUid, amount: mockAmount });
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('잘못된 결제 정보입니다.');
        expect(axios.get).toHaveBeenCalledWith(`https://api.iamport.kr/payments/${mockImpUid}`, {
          headers: { Authorization: mockAccessToken },
        });
      }
    });
  });
});
