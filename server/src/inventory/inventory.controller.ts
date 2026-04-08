import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { EquipDto } from './dto/equip.dto';
import { RepairDto } from './dto/repair.dto';
import { DeleteGearDto } from './dto/delete-gear.dto';
import { ConsumeDto } from './dto/consume.dto';

@ApiTags('inventory')
@ApiCookieAuth('Authentication')
@ApiSecurity('XSRF')
@Throttle({ default: { limit: 120, ttl: 60000 } })
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('equip')
  @ApiOperation({ summary: 'Equip gear modules' })
  @ApiResponse({ status: 201, description: 'Gear equipped successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  equip(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(EquipDto))
    body: EquipDto,
  ) {
    const equips = body.equips
      ? body.equips
      : [
          {
            targetType: body.targetType!,
            uid: body.uid,
            targetId: body.targetId,
          },
        ];
    return this.inventoryService.equipGear(userId, equips);
  }

  @UseGuards(JwtAuthGuard)
  @Post('repair')
  @ApiOperation({ summary: 'Repair gear using a kit' })
  @ApiResponse({ status: 201, description: 'Gear repaired successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  repair(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(RepairDto))
    body: RepairDto,
  ) {
    return this.inventoryService.repairGear(
      userId,
      body.kitUid,
      body.targetUid,
      body.targetType,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete')
  @ApiOperation({ summary: 'Delete gear from inventory' })
  @ApiResponse({ status: 201, description: 'Gear deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  delete(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(DeleteGearDto))
    body: DeleteGearDto,
  ) {
    return this.inventoryService.deleteGear(userId, body.uid);
  }

  @UseGuards(JwtAuthGuard)
  @Post('consume')
  @ApiOperation({ summary: 'Consume an item' })
  @ApiResponse({ status: 201, description: 'Item consumed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  consume(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(ConsumeDto))
    body: ConsumeDto,
  ) {
    return this.inventoryService.consumeConsumable(
      userId,
      body.itemId,
      body.itemType,
      body.quantity || 1,
    );
  }
}
