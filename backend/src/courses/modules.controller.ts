import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ReorderDto } from './dto/reorder.dto';

@Controller('courses/:courseId/modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private readonly modules: ModulesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Param('courseId') courseId: string) {
    return this.modules.findAll(courseId, user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PROFESSOR)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.modules.create(courseId, user, dto);
  }

  @Patch('reorder')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  reorder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Body() dto: ReorderDto,
  ) {
    return this.modules.reorder(courseId, user, dto);
  }

  @Patch(':moduleId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.modules.update(courseId, moduleId, user, dto);
  }

  @Delete(':moduleId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.modules.remove(courseId, moduleId, user);
  }
}
