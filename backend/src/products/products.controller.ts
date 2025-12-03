import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar produtos com filtros e paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(
      parseInt(page),
      parseInt(limit),
      categoryId,
      brandId,
      featured === 'true',
      search,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de produtos' })
  getStats() {
    return this.productsService.getProductStats();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Obter produtos com estoque baixo' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getLowStock(
    @Query('threshold') threshold: string = '5',
    @Query('limit') limit: string = '10',
  ) {
    return this.productsService.getLowStockProducts(parseInt(threshold), parseInt(limit));
  }

  @Get('featured')
  @ApiOperation({ summary: 'Obter produtos em destaque' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getFeatured(@Query('limit') limit: string = '8') {
    return this.productsService.getFeaturedProducts(parseInt(limit));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obter produto por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter produto por ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Obter produtos relacionados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRelated(
    @Param('id') id: string,
    @Query('limit') limit: string = '4',
  ) {
    return this.productsService.getRelatedProducts(id, parseInt(limit));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar produto (soft delete)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post('bulk/delete')
  @ApiOperation({ summary: 'Deletar múltiplos produtos (soft delete)' })
  @ApiResponse({ status: 200, description: 'Produtos deletados com sucesso' })
  bulkDelete(@Body() body: { ids: string[] }) {
    return this.productsService.bulkDelete(body.ids);
  }

  @Patch('bulk/status')
  @ApiOperation({ summary: 'Atualizar status de múltiplos produtos' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  bulkUpdateStatus(@Body() body: { ids: string[]; status: string }) {
    return this.productsService.bulkUpdateStatus(body.ids, body.status);
  }

  @Patch('bulk/stock')
  @ApiOperation({ summary: 'Atualizar estoque de múltiplos produtos' })
  @ApiResponse({ status: 200, description: 'Estoque atualizado com sucesso' })
  bulkUpdateStock(@Body() body: { updates: { id: string; stock: number }[] }) {
    return this.productsService.bulkUpdateStock(body.updates);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar produto' })
  @ApiResponse({ status: 201, description: 'Produto duplicado com sucesso' })
  duplicate(@Param('id') id: string) {
    return this.productsService.duplicate(id);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Upload de imagens do produto' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.uploadImages(id, files);
  }
}