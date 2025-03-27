import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto, AuthResponse, RegisterDto } from './dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: ['1'],
})
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: 'User register' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    return await this.service.register(dto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ type: AuthResponse })
  async login(@Body() auth: AuthDto) {
    return await this.service.login(auth);
  }
}
