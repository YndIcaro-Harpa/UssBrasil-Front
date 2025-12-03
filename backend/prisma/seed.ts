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
      logo: '/logos/Apple_logo_black.svg',
    },
    {
      name: 'JBL',
      slug: 'jbl',
      description: 'Audio de qualidade profissional',
      color: '#FF6900',
      logo: '/logos/JBL Logo.png',
    },
    {
      name: 'Xiaomi',
      slug: 'xiaomi',
      description: 'Tecnologia acessível e inovadora',
      color: '#FF6900',
      logo: '/logos/Xiaomi_logo.svg.png',
    },
    {
      name: 'DJI',
      slug: 'dji',
      description: 'Líderes em tecnologia de drones',
      color: '#131313',
      logo: '/logos/Dji logo.jpg',
    },
    {
      name: 'Geonav',
      slug: 'geonav',
      description: 'Eletrônicos automotivos',
      color: '#1976d2',
      logo: '/logos/goenav.jpg',
    },
  ];

  for (const brandData of brands) {
    await prisma.brand.upsert({
      where: { slug: brandData.slug },
      update: brandData,
      create: brandData,
    });
  }
  
  console.log('✅ Marcas criadas!');
}

async function createCategories() {
  console.log('📂 Criando categorias...');
  
  // Buscar brands para associar
  const apple = await prisma.brand.findUnique({ where: { slug: 'apple' } });
  const jbl = await prisma.brand.findUnique({ where: { slug: 'jbl' } });
  const xiaomi = await prisma.brand.findUnique({ where: { slug: 'xiaomi' } });
  const dji = await prisma.brand.findUnique({ where: { slug: 'dji' } });

  const categories = [
    {
      name: 'Fones de Ouvido',
      slug: 'fones-de-ouvido',
      description: 'Fones de ouvido premium e acessórios de áudio',
      icon: 'Headphones',
      color: '#3B82F6',
      sortOrder: 1,
      brandId: jbl?.id,
      image: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/categories/fones-de-ouvido/image.png',
    },
    {
      name: 'Celulares',
      slug: 'celulares',
      description: 'Smartphones e dispositivos móveis',
      icon: 'Smartphone',
      color: '#10B981',
      sortOrder: 2,
      brandId: apple?.id,
      image: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/categories/celulares/image.png',
    },
    {
      name: 'Acessórios',
      slug: 'acessorios',
      description: 'Capas, carregadores e acessórios móveis',
      icon: 'Cable',
      color: '#8B5CF6',
      sortOrder: 3,
      brandId: xiaomi?.id,
      image: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/categories/acessorios/image.png',
    },
    {
      name: 'Drones',
      slug: 'drones',
      description: 'Drones profissionais e recreativos',
      icon: 'Plane',
      color: '#F59E0B',
      sortOrder: 4,
      brandId: dji?.id,
      image: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/categories/drones/image.png',
    },
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    });
  }
  
  console.log('✅ Categorias criadas!');
}

async function createProducts() {
  console.log('📱 Criando produtos...');

  // Buscar brands e categories
  const brands = await prisma.brand.findMany();
  const categories = await prisma.category.findMany();

  const brandMap = new Map(brands.map(b => [b.slug, b.id]));
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

  const products = [
    // Apple iPhone 17 Products (Featured)
    {
      name: 'iPhone 17',
      slug: 'iphone-17',
      description: 'O novo iPhone 17 com chip A18 e câmera revolucionária de 48MP.',
      price: 5499.99,
      discountPrice: 4999.99,
      stock: 80,
      featured: true,
      categoryId: categoryMap.get('celulares')!,
      brandId: brandMap.get('apple')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-17/main.png,https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-17/side.png,https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-17/back.png',
      specifications: JSON.stringify({
        processor: 'A18',
        storage: '256GB',
        display: '6.1" Super Retina XDR',
        camera: '48MP principal + 12MP ultra angular',
        battery: 'Até 22 horas de reprodução de vídeo',
        os: 'iOS 18'
      }),
      weight: 0.174,
      dimensions: JSON.stringify({ width: 71.6, height: 147.6, depth: 7.8 }),
      warranty: 12,
      tags: 'smartphone,premium,apple,ios,5g,iphone17'
    },
    {
      name: 'iPhone 17 Pro',
      slug: 'iphone-17-pro',
      description: 'iPhone 17 Pro com acabamento em titânio, chip A18 Pro e câmera profissional.',
      price: 7999.99,
      discountPrice: 7499.99,
      stock: 60,
      featured: true,
      categoryId: categoryMap.get('celulares')!,
      brandId: brandMap.get('apple')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-17-pro/main.png,https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-17-pro/side.png,https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-17-pro/back.png',
      specifications: JSON.stringify({
        processor: 'A18 Pro',
        storage: '256GB',
        display: '6.3" ProMotion Super Retina XDR',
        camera: '48MP principal + 48MP ultra angular + 12MP telephoto 5x',
        battery: 'Até 27 horas de reprodução de vídeo',
        os: 'iOS 18'
      }),
      weight: 0.199,
      dimensions: JSON.stringify({ width: 73.6, height: 149.6, depth: 8.25 }),
      warranty: 12,
      tags: 'smartphone,premium,apple,ios,5g,iphone17,pro'
    },
    {
      name: 'iPhone 17 Pro Max',
      slug: 'iphone-17-pro-max',
      description: 'O iPhone definitivo com tela de 6.9", chip A18 Pro e sistema de câmera profissional avançado.',
      price: 9999.99,
      discountPrice: 9499.99,
      stock: 40,
      featured: true,
      categoryId: categoryMap.get('celulares')!,
      brandId: brandMap.get('apple')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-17-pro-max/main.png,https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-17-pro-max/side.png,https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-17-pro-max/back.png',
      specifications: JSON.stringify({
        processor: 'A18 Pro',
        storage: '512GB',
        display: '6.9" ProMotion Super Retina XDR',
        camera: '48MP principal + 48MP ultra angular + 12MP telephoto 5x',
        battery: 'Até 33 horas de reprodução de vídeo',
        os: 'iOS 18'
      }),
      weight: 0.225,
      dimensions: JSON.stringify({ width: 77.6, height: 163.0, depth: 8.25 }),
      warranty: 12,
      tags: 'smartphone,premium,apple,ios,5g,iphone17,promax'
    },
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'O iPhone mais avançado já criado, com chip A17 Pro e câmeras profissionais.',
      price: 7999.99,
      discountPrice: 6999.99,
      stock: 50,
      featured: false,
      categoryId: categoryMap.get('celulares')!,
      brandId: brandMap.get('apple')!,
      images: 'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-15-pro-max/main.png,https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-15-pro-max/side.png,https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/iphone-15-pro-max/back.png',
      specifications: JSON.stringify({
        processor: 'A17 Pro',
        storage: '256GB',
        display: '6.7" Super Retina XDR',
        camera: '48MP principal + 12MP ultra angular',
        battery: 'Até 29 horas de reprodução de vídeo',
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
      featured: false,
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
      images: [
        'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/jbl-tune-760nc/main.png'
      ],
      specifications: {
        type: 'Over-ear',
        connectivity: 'Bluetooth 5.0',
        battery: '50 horas',
        anc: 'Cancelamento ativo de ruído',
        driver: '40mm'
      },
      weight: 0.22,
      warranty: 12,
      tags: ['fones', 'bluetooth', 'anc', 'jbl']
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
      images: [
        'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/jbl-flip-6/main.png'
      ],
      specifications: {
        type: 'Caixa de som portátil',
        connectivity: 'Bluetooth 5.1',
        battery: '12 horas',
        waterproof: 'IP67',
        power: '20W RMS'
      },
      weight: 0.55,
      warranty: 12,
      tags: ['caixa-som', 'bluetooth', 'portátil', 'à-prova-dagua']
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
      images: [
        'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/redmi-note-13-pro/main.png'
      ],
      specifications: {
        processor: 'Snapdragon 7s Gen 2',
        storage: '256GB',
        ram: '8GB',
        display: '6.67" AMOLED 120Hz',
        camera: '200MP principal'
      },
      weight: 0.187,
      warranty: 12,
      tags: ['smartphone', 'xiaomi', 'android', '5g', 'camera']
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
      images: [
        'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/xiaomi-power-bank-20000/main.png'
      ],
      specifications: {
        capacity: '20000mAh',
        input: 'USB-C 18W',
        output: 'Dual USB-A + USB-C',
        fastCharge: 'Quick Charge 3.0'
      },
      weight: 0.434,
      warranty: 6,
      tags: ['powerbank', 'carregador', 'portátil', 'xiaomi']
    },

    // DJI Products
    {
      name: 'DJI Mini 4 Pro',
      slug: 'dji-mini-4-pro',
      description: 'Drone compacto com câmera 4K e detecção omnidirecional de obstáculos.',
      price: 4999.99,
      discountPrice: 4499.99,
      stock: 30,
      featured: true,
      categoryId: categoryMap.get('drones')!,
      brandId: brandMap.get('dji')!,
      images: [
        'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/dji-mini-4-pro/main.png'
      ],
      specifications: {
        camera: '4K/60fps HDR',
        flightTime: '34 minutos',
        transmission: 'O4 20km',
        weight: '249g',
        obstacles: 'Detecção omnidirecional'
      },
      weight: 0.249,
      warranty: 12,
      tags: ['drone', 'camera', '4k', 'dji', 'mini']
    },
    {
      name: 'DJI Air 3',
      slug: 'dji-air-3',
      description: 'Drone com câmera dupla e transmissão O4 de longo alcance.',
      price: 7999.99,
      discountPrice: 7499.99,
      stock: 20,
      featured: false,
      categoryId: categoryMap.get('drones')!,
      brandId: brandMap.get('dji')!,
      images: [
        'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/dji-air-3/main.png'
      ],
      specifications: {
        camera: 'Dual 4K HDR',
        flightTime: '46 minutos',
        transmission: 'O4 20km',
        weight: '720g'
      },
      weight: 0.72,
      warranty: 12,
      tags: ['drone', 'camera', '4k', 'dji', 'pro']
    },

    // Geonav Products
    {
      name: 'Geonav G550',
      slug: 'geonav-g550',
      description: 'Central multimídia com GPS, Android Auto e CarPlay.',
      price: 1299.99,
      discountPrice: 999.99,
      stock: 40,
      featured: false,
      categoryId: categoryMap.get('acessorios')!,
      brandId: brandMap.get('geonav')!,
      images: [
        'https://res.cloudinary.com/dnmazlvs6/image/upload/v1/uss-brasil/products/geonav-g550/main.png'
      ],
      specifications: {
        display: '7" touchscreen',
        os: 'Android 11',
        connectivity: 'Android Auto, CarPlay',
        gps: 'GPS integrado',
        bluetooth: 'Bluetooth 5.0'
      },
      weight: 1.2,
      warranty: 12,
      tags: ['central-multimidia', 'gps', 'android-auto', 'carplay']
    }
  ];

  for (const productData of products) {
    // Converter arrays e objetos para strings
    const normalizedData = {
      ...productData,
      images: Array.isArray(productData.images) ? productData.images.join(',') : productData.images,
      tags: Array.isArray(productData.tags) ? productData.tags.join(',') : productData.tags,
      specifications: typeof productData.specifications === 'string' ? productData.specifications : JSON.stringify(productData.specifications),
      dimensions: typeof productData.dimensions === 'string' ? productData.dimensions : JSON.stringify(productData.dimensions),
    };

    await prisma.product.upsert({
      where: { slug: normalizedData.slug },
      update: normalizedData,
      create: normalizedData,
    });
  }

  console.log('✅ Produtos criados!');
}

async function createAdminUser() {
  console.log('👤 Criando usuário admin...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@ussbrasil.com' },
    update: {},
    create: {
      name: 'Admin USS Brasil',
      email: 'admin@ussbrasil.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '(11) 99999-9999',
      isActive: true,
    },
  });

  console.log('✅ Usuário admin criado! Email: admin@ussbrasil.com | Senha: admin123');
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
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
