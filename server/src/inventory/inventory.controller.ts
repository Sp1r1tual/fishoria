import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';

import { InventoryService } from './inventory.service';
import { EquipDto } from './dto/equip.dto';
import { RepairDto } from './dto/repair.dto';
import { DeleteGearDto } from './dto/delete-gear.dto';
import { ConsumeDto } from './dto/consume.dto';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('equip')
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
  delete(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(DeleteGearDto))
    body: DeleteGearDto,
  ) {
    return this.inventoryService.deleteGear(userId, body.uid);
  }

  @UseGuards(JwtAuthGuard)
  @Post('consume')
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
