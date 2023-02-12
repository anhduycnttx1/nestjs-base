import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthFailedException extends HttpException {
  constructor(message: string) {
    super(
      {
        message: message,
        code: 400,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Unauthorized',
        code: 401,
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class DataNotFoundException extends HttpException {
  constructor(message: string) {
    super(
      {
        message: message,
        code: 404,
      },
      HttpStatus.NOT_FOUND
    );
  }
}
