import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const error = {
      message: '예외 발생!!',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    if (exception instanceof HttpException) {
      error.message = exception.message;
      error.status = exception.getStatus();
    } else if (exception instanceof AxiosError) {
      error.message = exception.response?.data?.message || 'Axios 예외 발생';
      error.status = exception.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    }
    console.log(exception);

    response.status(error.status).json({
      message: error.message,
      statusCode: error.status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
