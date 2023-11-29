import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('File')
@Controller('/file')
export class FileController {
  constructor(
    private readonly fileService: FileService, //
  ) {}

  @ApiOperation({
    summary: 'file 한 개 업로드하기',
    description: 'Cloud에 file 한 개를 업로드한다.',
  })
  @Post('/fileUpload')
  @UseInterceptors(FileInterceptor('file'))
  fileUpload(
    @UploadedFile() file: Express.Multer.File, //
  ): Promise<string> {
    return this.fileService.upload({ file });
  }
}
