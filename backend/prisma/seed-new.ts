import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // 1. Criar Brands
  await createBrands();
  
  // 2. Criar Categories
  await createCategories();
  
  // 3. Criar Produtos
  await createProducts();
  
  // 4. Criar usuário admin
  await createAdminUser();

  // 5. Criar cupons de teste
  await createCoupons();

  console.log('✅ Seed concluído com sucesso!');
}

async function createBrands() {
  console.log('📦 Criando marcas...');
  
  const brands = [
    {
      name: 'Apple',
      slug: 'apple',
      description: 'Inovação e tecnologia premium',
      color: '#000000',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/brands/apple/logo.png',
    },
    {
      name: 'JBL',
      slug: 'jbl',
      description: 'Audio de qualidade profissional',
      color: '#FF6900',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/brands/jbl/logo.png',
    },
    {
      name: 'Xiaomi',
      slug: 'xiaomi',
      description: 'Tecnologia acessível e inovadora',
      color: '#FF6900',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/brands/xiaomi/logo.png',
    },
    {
      name: 'DJI',
      slug: 'dji',
      description: 'Liderança mundial em drones',
      color: '#000000',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/brands/dji/logo.png',
    },
    {
      name: 'Geonav',
      slug: 'geonav',
      description: 'Navegação GPS avançada',
      color: '#1B4F72',
      logo: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/brands/geonav/logo.png',
    }
  ];

  for (const brand of brands) {
    const existingBrand = await prisma.brand.findUnique({
      where: { slug: brand.slug }
    });

    if (!existingBrand) {
      await prisma.brand.create({
        data: brand
      });
      console.log(`✓ Marca criada: ${brand.name}`);
    }
  }
}

async function createCategories() {
  console.log('📂 Criando categorias...');
  
  const categories = [
    {
      name: 'Celulares',
      slug: 'celulares',
      description: 'Smartphones e celulares das melhores marcas',
      color: '#E74C3C',
    },
    {
      name: 'Fones de Ouvido',
      slug: 'fones-de-ouvido', 
      description: 'Fones e headsets para todas as necessidades',
      color: '#3498DB',
    },
    {
      name: 'Acessórios',
      slug: 'acessorios',
      description: 'Acessórios para seus dispositivos',
      color: '#F39C12',
    },
    {
      name: 'Drones',
      slug: 'drones',
      description: 'Drones profissionais e recreativos',
      color: '#9B59B6',
    },
    {
      name: 'GPS e Navegação',
      slug: 'gps-navegacao',
      description: 'Sistemas de navegação GPS',
      color: '#27AE60',
    }
  ];

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug }
    });

    if (!existing) {
      await prisma.category.create({
        data: category
      });
      console.log(`✓ Categoria criada: ${category.name}`);
    }
  }
}

async function createProducts() {
  console.log('📱 Criando produtos...');

  // Get brand and category IDs
  const brands = await prisma.brand.findMany();
  const categories = await prisma.category.findMany();
  
  const brandMap = new Map(brands.map(b => [b.name.toLowerCase(), b.id]));
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

  const products = [
    // Apple Products
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'O iPhone mais avançado já criado, com chip A17 Pro e câmeras profissionais.',
      price: 7999.99,
      discountPrice: 6999.99,
      stock: 50,
      featured: true,
      categoryId: categoryMap.get('celulares')!,
      brandId: brandMap.get('apple')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-15-pro-max/main.png',
      specifications: JSON.stringify({
        processor: 'A17 Pro',
        storage: '256GB',
        display: '6.7" Super Retina XDR',
        camera: '48MP principal + 12MP ultra angular',
        os: 'iOS 17'
      }),
      weight: 0.221,
      dimensions: JSON.stringify({ width: 77.6, height: 159.9, depth: 8.25 }),
      warranty: 12,
      tags: 'smartphone,premium,apple,ios,5g'
    },
    {
      name: 'iPhone 14',
      slug: 'iphone-14',
      description: 'iPhone 14 com câmera dupla avançada e Modo Ação.',
      price: 4999.99,
      discountPrice: 4499.99,
      stock: 75,
      featured: true,
      categoryId: categoryMap.get('celulares')!,
      brandId: brandMap.get('apple')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-14/main.png',
      specifications: JSON.stringify({
        processor: 'A15 Bionic',
        storage: '128GB',
        display: '6.1" Super Retina XDR',
        camera: '12MP principal + 12MP ultra angular'
      }),
      weight: 0.172,
      warranty: 12,
      tags: 'smartphone,apple,ios'
    },
    // JBL Products
    {
      name: 'JBL Tune 760NC',
      slug: 'jbl-tune-760nc',
      description: 'Fones de ouvido com cancelamento ativo de ruído e 50 horas de bateria.',
      price: 599.99,
      discountPrice: 449.99,
      stock: 100,
      featured: true,
      categoryId: categoryMap.get('fones-de-ouvido')!,
      brandId: brandMap.get('jbl')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/jbl-tune-760nc/main.png',
      specifications: JSON.stringify({
        type: 'Over-ear',
        connectivity: 'Bluetooth 5.0',
        battery: '50 horas',
        anc: 'Cancelamento ativo de ruído'
      }),
      weight: 0.22,
      warranty: 12,
      tags: 'fones,bluetooth,anc,jbl'
    },
    {
      name: 'JBL Flip 6',
      slug: 'jbl-flip-6',
      description: 'Caixa de som Bluetooth portátil à prova d\'água com som JBL Pro.',
      price: 799.99,
      discountPrice: 699.99,
      stock: 80,
      featured: false,
      categoryId: categoryMap.get('fones-de-ouvido')!,
      brandId: brandMap.get('jbl')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/jbl-flip-6/main.png',
      specifications: JSON.stringify({
        type: 'Caixa de som portátil',
        connectivity: 'Bluetooth 5.1',
        battery: '12 horas',
        waterproof: 'IP67'
      }),
      weight: 0.55,
      warranty: 12,
      tags: 'caixa-som,bluetooth,portátil'
    },
    // Xiaomi Products
    {
      name: 'Redmi Note 13 Pro',
      slug: 'redmi-note-13-pro',
      description: 'Smartphone com câmera de 200MP e carregamento super rápido.',
      price: 1699.99,
      discountPrice: 1499.99,
      stock: 120,
      featured: true,
      categoryId: categoryMap.get('celulares')!,
      brandId: brandMap.get('xiaomi')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/redmi-note-13-pro/main.png',
      specifications: JSON.stringify({
        processor: 'Snapdragon 7s Gen 2',
        storage: '256GB',
        ram: '8GB',
        display: '6.67" AMOLED 120Hz',
        camera: '200MP principal'
      }),
      weight: 0.187,
      warranty: 12,
      tags: 'smartphone,xiaomi,android,5g'
    },
    {
      name: 'Xiaomi Power Bank 20000mAh',
      slug: 'xiaomi-power-bank-20000',
      description: 'Carregador portátil de alta capacidade com carregamento rápido.',
      price: 199.99,
      discountPrice: 149.99,
      stock: 200,
      featured: false,
      categoryId: categoryMap.get('acessorios')!,
      brandId: brandMap.get('xiaomi')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/xiaomi-power-bank/main.png',
      specifications: JSON.stringify({
        capacity: '20000mAh',
        input: 'USB-C 18W',
        output: 'Dual USB-A + USB-C'
      }),
      weight: 0.434,
      warranty: 6,
      tags: 'powerbank,carregador,portátil'
    },
    // DJI Products
    {
      name: 'DJI Mini 4 Pro',
      slug: 'dji-mini-4-pro',
      description: 'Drone compacto com câmera 4K e detecção omnidirecional de obstáculos.',
      price: 4599.99,
      discountPrice: 3999.99,
      stock: 30,
      featured: true,
      categoryId: categoryMap.get('drones')!,
      brandId: brandMap.get('dji')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/dji-mini-4-pro/main.png',
      specifications: JSON.stringify({
        camera: '4K/60fps',
        flightTime: '34 minutos',
        range: '20km',
        weight: '249g',
        obstacleDetection: 'Omnidirecional'
      }),
      weight: 0.249,
      warranty: 12,
      tags: 'drone,4k,compacto,dji'
    },
    {
      name: 'DJI Air 3',
      slug: 'dji-air-3',
      description: 'Drone com câmeras duplas e voo inteligente para criadores de conteúdo.',
      price: 6999.99,
      discountPrice: 5999.99,
      stock: 25,
      featured: false,
      categoryId: categoryMap.get('drones')!,
      brandId: brandMap.get('dji')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/dji-air-3/main.png',
      specifications: JSON.stringify({
        camera: 'Dual 4K cameras',
        flightTime: '46 minutos',
        range: '32km',
        features: 'ActiveTrack 360°'
      }),
      weight: 0.72,
      warranty: 12,
      tags: 'drone,dual-camera,profissional'
    },
    // Geonav Products
    {
      name: 'Geonav G550',
      slug: 'geonav-g550',
      description: 'GPS automotivo com tela de 5" e mapas atualizados do Brasil.',
      price: 399.99,
      discountPrice: 299.99,
      stock: 60,
      featured: false,
      categoryId: categoryMap.get('gps-navegacao')!,
      brandId: brandMap.get('geonav')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/geonav-g550/main.png',
      specifications: JSON.stringify({
        display: '5" touchscreen',
        maps: 'Mapas do Brasil',
        features: 'Alertas de trânsito',
        battery: '3 horas'
      }),
      weight: 0.18,
      warranty: 12,
      tags: 'gps,navegação,automotivo'
    }
  ];

  for (const product of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug }
    });

    if (!existing) {
      await prisma.product.create({
        data: product
      });
      console.log(`✓ Produto criado: ${product.name}`);
    }
  }
}

async function createAdminUser() {
  console.log('👤 Criando usuário administrador...');

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@ussbrasil.com' }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await prisma.user.create({
      data: {
        name: 'USS Brasil Admin',
        email: 'admin@ussbrasil.com',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '(11) 99999-9999',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil'
      }
    });
    console.log('✓ Usuário admin criado com sucesso!');
    console.log('📧 Email: admin@ussbrasil.com');
    console.log('🔑 Senha: admin123');
  }
}

async function createCoupons() {
  console.log('🎟️ Criando cupons de teste...');
  
  const now = new Date();
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const coupons = [
    {
      code: 'BEMVINDO10',
      description: '10% de desconto na primeira compra',
      type: 'PERCENTAGE',
      value: 10,
      minAmount: 100,
      maxAmount: 50,
      usageLimit: 1000,
      startDate: now,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'FRETEGRATIS',
      description: 'Frete grátis em compras acima de R$ 200',
      type: 'FREE_SHIPPING',
      value: 0,
      minAmount: 200,
      startDate: now,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'DESCONTO50',
      description: 'R$ 50 de desconto em compras acima de R$ 500',
      type: 'FIXED_AMOUNT',
      value: 50,
      minAmount: 500,
      startDate: now,
      endDate: oneYearFromNow,
      isActive: true,
    },
    {
      code: 'USS20',
      description: '20% de desconto exclusivo USS',
      type: 'PERCENTAGE',
      value: 20,
      minAmount: 150,
      maxAmount: 100,
      usageLimit: 500,
      startDate: now,
      endDate: oneYearFromNow,
      isActive: true,
    },
  ];

  for (const couponData of coupons) {
    await prisma.coupon.upsert({
      where: { code: couponData.code },
      update: couponData,
      create: couponData,
    });
  }
  
  console.log('✅ Cupons de teste criados!');
  console.log('🎟️ BEMVINDO10 - 10% off');
  console.log('🎟️ FRETEGRATIS - Frete grátis');
  console.log('🎟️ DESCONTO50 - R$ 50 off');
  console.log('🎟️ USS20 - 20% off');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });