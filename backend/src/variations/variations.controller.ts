import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VariationsService } from './variations.service';
import { CreateVariationDto, UpdateVariationDto, BulkCreateVariationsDto } from './dto/variation.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('variations')
export class VariationsController {
  constructor(private readonly variationsService: VariationsService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createVariationDto: CreateVariationDto) {
    return this.variationsService.create(createVariationDto);
  }

  @Post('bulk')
  @UseGuards(AdminGuard)
  bulkCreate(@Body() bulkDto: BulkCreateVariationsDto) {
    return this.variationsService.bulkCreate(bulkDto);
  }

  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.variationsService.findAll(productId);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.variationsService.findByProduct(productId);
  }

  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string) {
    return this.variationsService.findBySku(sku);
  }

  @Get('stats')
  getStats(@Query('productId') productId?: string) {
    return this.variationsService.getStats(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() updateVariationDto: UpdateVariationDto) {
    return this.variationsService.update(id, updateVariationDto);
  }

  @Patch(':id/stock')
  @UseGuards(AdminGuard)
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.variationsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.variationsService.remove(id);
  }

  @Delete('product/:productId')
  @UseGuards(AdminGuard)
  removeByProduct(@Param('productId') productId: string) {
    return this.variationsService.removeByProduct(productId);
  }
}
