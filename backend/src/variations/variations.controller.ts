import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { VariationsService } from './variations.service';
import { CreateVariationDto, UpdateVariationDto, BulkCreateVariationsDto } from './dto/variation.dto';

@Controller('variations')
export class VariationsController {
  constructor(private readonly variationsService: VariationsService) {}

  @Post()
  create(@Body() createVariationDto: CreateVariationDto) {
    return this.variationsService.create(createVariationDto);
  }

  @Post('bulk')
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
  update(@Param('id') id: string, @Body() updateVariationDto: UpdateVariationDto) {
    return this.variationsService.update(id, updateVariationDto);
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.variationsService.updateStock(id, quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variationsService.remove(id);
  }

  @Delete('product/:productId')
  removeByProduct(@Param('productId') productId: string) {
    return this.variationsService.removeByProduct(productId);
  }
}
