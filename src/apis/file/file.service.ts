import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { IFileServiceUpload } from './file.interface';
import { v4 as uuidv4 } from 'uuid';
import { getToday } from '../../commons/library/utils';
import * as iconv from 'iconv-lite';

@Injectable()
export class FileService {
  createStorage(): Bucket {
    return new Storage({
      projectId: 'in-time-project-406606',
      keyFilename: 'gcp-file-storage.json',
    }).bucket('in-time-project-bucket');
  }

  async upload({ file }: IFileServiceUpload): Promise<string> {
    const storage = this.createStorage();

    const decodedString = iconv.decode(Buffer.from(file.originalname, 'binary'), 'UTF-8');
    const fileName = `${getToday()}/${uuidv4()}/origin/${decodedString}`;

    const result = await new Promise<string>((res, rej) => {
      const fileStream = storage.file(fileName).createWriteStream({ resumable: false, gzip: true });

      fileStream
        .on('finish', () => {
          const fileUrl = `https://storage.googleapis.com/in-time-project-bucket/${fileName}`;
          res(fileUrl);
        })
        .on('error', (error) => {
          rej(new Error('업로드 실패'));
          throw error;
        });

      fileStream.end(file.buffer);
    });

    return result;
  }
}
