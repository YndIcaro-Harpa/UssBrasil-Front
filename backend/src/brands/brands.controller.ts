import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { BrandsService, CreateBrandDto, UpdateBrandDto } from './brands.service';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova marca' })
  @ApiResponse({ status: 201, description: 'Marca criada com sucesso' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as marcas' })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter marca por ID' })
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obter marca por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar marca' })
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar marca' })
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }

  @Post(':id/logo')
  @ApiOperation({ summary: 'Upload do logo da marca' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.brandsService.uploadLogo(id, file);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Criar marcas padrão' })
  seedBrands() {
    return this.brandsService.seedDefaultBrands();
  }
}