import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthMiddleware } from '../utils/auth.middleware';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthMiddleware, JwtService],
    }).compile();

    middleware = module.get<AuthMiddleware>(AuthMiddleware);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    const req = { headers: {} } as Request;
    const res = {} as Response;
    const next = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrowError(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const req = {
      headers: { authorization: 'Bearer invalidToken' },
    } as Request;
    const res = {} as Response;
    const next = jest.fn();

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new UnauthorizedException('Unauthorized');
    });

    await expect(middleware.use(req, res, next)).rejects.toThrowError(
      UnauthorizedException,
    );
  });

  it('should call next() if token is valid', async () => {
    const req = { headers: { authorization: 'Bearer validToken' } } as Request;
    const res = {} as Response;
    const next = jest.fn();

    jest.spyOn(jwtService, 'verify').mockReturnValue({ userId: 1 });

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
