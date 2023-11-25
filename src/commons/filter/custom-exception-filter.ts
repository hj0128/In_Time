import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const error = {
      message: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    if (exception instanceof HttpException) {
      error.message = exception.message;
      error.status = exception.getStatus();
    } else if (exception instanceof AxiosError) {
      error.message = exception.response?.data?.message || 'Axios Internal Server Error';
      error.status = exception.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    }
    console.log('======exception=====');
    console.log(exception);
    console.log('======exception====='); // 프로덕션 환경에서 지우기

    response.status(error.status).json({
      message: error.message,
      statusCode: error.status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
