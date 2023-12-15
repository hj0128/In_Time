import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from '../file.controller';
import { FileService } from '../file.service';
import { Readable } from 'stream';

describe('FileController', () => {
  let fileController: FileController;
  let fileService: FileService;

  beforeEach(async () => {
    const mockFileService = {
      upload: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        { provide: FileService, useValue: mockFileService }, //
      ],
    }).compile();

    fileController = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
  });

  describe('authSendToken', () => {
    it('Cloud에 file 한 개를 업로드한다.', async () => {
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

      const expectedUpload: string = 'http://a.jpg';

      jest.spyOn(fileService, 'upload').mockResolvedValueOnce(expectedUpload);

      const result: string = await fileController.fileUpload(inputFile);

      expect(result).toEqual(expectedUpload);
      expect(fileService.upload).toHaveBeenCalledWith({
        file: inputFile,
      });
    });
  });
});
