import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === undefined ? undefined : isActive === 'true';
    return this.users.findAll(user.companyId, { page, perPage, search, role, isActive: active });
  }

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.users.findMe(user.userId);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.users.create(user.companyId, dto);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(user.userId, dto);
  }

  @Patch('me/password')
  updateMyPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.users.updateMyPassword(user.userId, dto);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.users.findOne(id, user.companyId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(id, user.companyId, dto);
  }

  @Patch(':id/password')
  @Roles(Role.ADMIN)
  resetPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.users.resetPassword(id, user.companyId, newPassword);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.users.remove(id, user.companyId);
  }
}
