import { Controller, Get, Param } from '@nestjs/common';
import { ShopsService } from './shops.service.js';
import type { ShopDetailDto, ShopSummaryDto } from './shops.types.js';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  list(): Promise<ShopSummaryDto[]> {
    return this.shopsService.list();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string): Promise<ShopDetailDto> {
    return this.shopsService.getBySlug(slug);
  }
}
