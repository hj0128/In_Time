import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from '../file.service';
import { Readable } from 'stream';

describe('PartyService', () => {
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService],
    }).compile();

    fileService = module.get<FileService>(FileService);
  });

  describe('upload', () => {
    const on = {
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      }),
      end: jest.fn(),
    };
    const inputFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 1024,
      destination: 'uploads/',
      filename: 'test-uploaded.txt',
      path: 'uploads/test-uploaded.txt',
      buffer: Buffer.from('Mocked file content'),
      stream: Readable.from(['Mocked file content']),
    };

    it('파일 이름이 정상적으로 생성되었는지 확인한다.', async () => {
      jest
        .spyOn(on, 'on')
        .mockResolvedValue('https://storage.googleapis.com/in-time-project-bucket/' as never);

      const result: string = await fileService.upload({ file: inputFile });

      expect(result).toContain('/origin/test.txt');
    });

    it('파일을 구글스토리지에 업로드하고 결과를 문자열로 반환한다.', async () => {
      const expectedFileNameRegex = /\/origin\/test\.txt$/;

      jest
        .spyOn(on, 'on')
        .mockResolvedValue('https://storage.googleapis.com/in-time-project-bucket/' as never);

      const result: string = await fileService.upload({
        file: inputFile,
      });

      expect(result).toMatch(expectedFileNameRegex);
    });
  });
});
