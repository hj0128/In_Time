import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import axios from 'axios';
import { IIamPortServiceCheckPaid } from './iam-port.interface';

@Injectable()
export class IamPortService {
  async getToken(): Promise<string> {
    const result = await axios.post('https://api.iamport.kr/users/getToken', {
      imp_key: process.env.IAM_PORT_KEY,
      imp_secret: process.env.IAM_PORT_SECRET,
    });

    return result.data.response.access_token;
  }

  async checkPaid({ impUid, amount }: IIamPortServiceCheckPaid): Promise<void> {
    const token = await this.getToken();

    const result = await axios.get(`https://api.iamport.kr/payments/${impUid}`, {
      headers: { Authorization: token },
    });

    if (amount !== result.data.response.amount) {
      throw new UnprocessableEntityException('잘못된 결제 정보입니다.');
    }
  }
}
