import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting database seed...');

  // 1. Create Users with Roles and Permissions
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ussbrasil.com' },
    update: {},
    create: {
      email: 'admin@ussbrasil.com',
      name: 'Administrador Geral',
      password,
      role: 'ADMIN',
      permissions: JSON.stringify(['*']),
      cpf: '000.000.000-01',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'gerente@ussbrasil.com' },
    update: {},
    create: {
      email: 'gerente@ussbrasil.com',
      name: 'Gerente de Loja',
      password,
      role: 'MANAGER',
      permissions: JSON.stringify([
        'manage_products',
        'view_reports',
        'manage_orders',
        'manage_inventory'
      ]),
      cpf: '000.000.000-02',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'vendedor@ussbrasil.com' },
    update: {},
    create: {
      email: 'vendedor@ussbrasil.com',
      name: 'Vendedor Padr�o',
      password,
      role: 'SELLER',
      permissions: JSON.stringify([
        'create_order',
        'view_own_reports',
        'view_products'
      ]),
      cpf: '000.000.000-03',
    },
  });

  const seniorSeller = await prisma.user.upsert({
    where: { email: 'vendedor.senior@ussbrasil.com' },
    update: {},
    create: {
      email: 'vendedor.senior@ussbrasil.com',
      name: 'Vendedor Senior',
      password,
      role: 'SELLER',
      permissions: JSON.stringify([
        'create_order',
        'view_own_reports',
        'view_products',
        'edit_price',
        'apply_discount'
      ]),
      cpf: '000.000.000-04',
    },
  });

  console.log(' Users seeded');

  // 2. Site Config (CMS)
  const siteConfigs = [
    {
      key: 'hero_videos',
      value: JSON.stringify([
        {
            src: '/Videos/IphoneVideo.mp4',
            poster: '/Videos/IphoneVideoPoster.jpg',
            title: 'iPhone 16',
            subtitle: 'Titânio. Precisão. Performance.',
            description: 'O futuro da tecnologia móvel',
            cta: 'Descubra Agora',
            link: '/iphone17'
        },
        {
            src: '/Videos/AirPods Video.webm',
            poster: '/fallback-product.png',
            title: 'AirPods',
            subtitle: 'Som que envolve. Silêncio que liberta.',
            description: 'Experiência auditiva premium',
            cta: 'Explore AirPods',
            link: '/produtos'
        },
        {
            src: '/Videos/Apple Watch.mp4',
            poster: '/fallback-product.png',
            title: 'Apple Watch',
            subtitle: 'Seu aliado na saúde e fitness.',
            description: 'Tecnologia no seu pulso',
            cta: 'Conheça Apple Watch',
            link: '/produtos'
        },
        {
            src: '/Videos/IpadVideo.mp4',
            poster: '/fallback-product.png',
            title: 'iPad',
            subtitle: 'Potência. Criatividade. Portabilidade.',
            description: 'Seu estúdio criativo portátil',
            cta: 'Descubra iPad',
            link: '/produtos'
        },
        {
            src: '/Videos/Macs Video.mp4',
            poster: '/fallback-product.png',
            title: 'Mac',
            subtitle: 'Performance profissional.',
            description: 'Poder para criar o extraordinário',
            cta: 'Ver Macs',
            link: '/produtos'
        }
      ]),
      type: 'json',
      description: 'Lista de vídeos do banner principal (JSON)',
    },
    {
      key: 'home_hero_title',
      value: 'Tecnologia que Transforma',
      type: 'text',
      description: 'Título principal do banner da home',
    },
    {
      key: 'home_hero_subtitle',
      value: 'Os melhores produtos Apple, Xiaomi e JBL com garantia e procedência.',
      type: 'text',
      description: 'Subtítulo do banner da home',
    },
    {
      key: 'home_featured_tags',
      value: JSON.stringify(['Lançamentos', 'Ofertas', 'Mais Vendidos']),
      type: 'json',
      description: 'Tags de destaque na home',
    },
  ];

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log(' Site Config seeded');

  // 3. Suppliers
  const suppliers = [
    { name: 'Apple Distributor Inc.', email: 'contact@apple-dist.com', cnpj: '12.345.678/0001-01' },
    { name: 'Samsung Official BR', email: 'b2b@samsung.com.br', cnpj: '98.765.432/0001-02' },
    { name: 'Xiaomi Global', email: 'sales@xiaomi.com', cnpj: '11.222.333/0001-03' },
  ];

  const dbSuppliers = [];
  for (const s of suppliers) {
    const supplier = await prisma.supplier.upsert({
      where: { cnpj: s.cnpj },
      update: {},
      create: s,
    });
    dbSuppliers.push(supplier);
  }
  console.log(' Suppliers seeded');

  // 4. Brands & Categories
  const brandsData = [
    { name: 'Apple', slug: 'apple', color: '#000000' },
    { name: 'Samsung', slug: 'samsung', color: '#1428A0' },
    { name: 'Xiaomi', slug: 'xiaomi', color: '#FF6900' },
    { name: 'JBL', slug: 'jbl', color: '#FF4500' },
  ];

  const dbBrands = [];
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    dbBrands.push(brand);
  }

  const categoriesData = [
    { name: 'Smartphones', slug: 'smartphones', icon: 'smartphone' },
    { name: 'Tablets', slug: 'tablets', icon: 'tablet' },
    { name: 'Smartwatches', slug: 'smartwatches', icon: 'watch' },
    { name: '�udio', slug: 'audio', icon: 'headphones' },
  ];

  const dbCategories = [];
  for (const c of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    dbCategories.push(category);
  }
  console.log(' Brands & Categories seeded');

  // 5. Products & Variations
  const productsData = [
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'O iPhone mais poderoso j� feito, com tit�nio aeroespacial.',
      brandSlug: 'apple',
      categorySlug: 'smartphones',
      price: 8999.00,
      images: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select-202309?wid=940&hei=1112&fmt=png-alpha&.v=1693510915188',
      variations: [
        { name: 'iPhone 15 Pro Max 256GB Tit�nio Natural', sku: 'IP15PM-256-NAT', color: 'Natural', colorCode: '#Beb7b0', storage: '256GB', price: 8999.00, stock: 10 },
        { name: 'iPhone 15 Pro Max 512GB Tit�nio Azul', sku: 'IP15PM-512-BLU', color: 'Azul', colorCode: '#2f3846', storage: '512GB', price: 10499.00, stock: 5 },
        { name: 'iPhone 15 Pro Max 256GB Tit�nio Preto (Semi Novo)', sku: 'IP15PM-256-BLK-USED', color: 'Preto', colorCode: '#181819', storage: '256GB', price: 7500.00, stock: 2, condition: 'semi_new' },
      ]
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'galaxy-s24-ultra',
      description: 'Galaxy AI chegou. Bem-vindo � era da intelig�ncia m�vel.',
      brandSlug: 'samsung',
      categorySlug: 'smartphones',
      price: 8500.00,
      images: 'https://images.samsung.com/is/image/samsung/p6pim/br/sm-s928bzkqzto/gallery/br-galaxy-s24-s928-sm-s928bzkqzto-539294649?$',
      variations: [
        { name: 'S24 Ultra 512GB Tit�nio Cinza', sku: 'S24U-512-GRY', color: 'Cinza', colorCode: '#808080', storage: '512GB', price: 8500.00, stock: 15 },
      ]
    },
    {
      name: 'JBL Boombox 3',
      slug: 'jbl-boombox-3',
      description: 'Som massivo. O dia todo.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 2499.00,
      images: 'https://www.jbl.com.br/dw/image/v2/AAUJ_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw123456/JBL_Boombox_3_Black_Hero_1605x1605px.png',
      variations: [
        { name: 'JBL Boombox 3 Preta', sku: 'JBL-BB3-BLK', color: 'Preta', colorCode: '#000000', price: 2499.00, stock: 20 },
        { name: 'JBL Boombox 3 Camuflada', sku: 'JBL-BB3-CAM', color: 'Camuflada', colorCode: '#4b5320', price: 2599.00, stock: 8 },
      ]
    }
  ];

  for (const p of productsData) {
    const brand = dbBrands.find(b => b.slug === p.brandSlug);
    const category = dbCategories.find(c => c.slug === p.categorySlug);
    const supplier = dbSuppliers[0];

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.variations.reduce((acc, v) => acc + v.stock, 0),
        images: p.images,
        brandId: brand?.id,
        categoryId: category?.id,
        supplierId: supplier?.id,
        isActive: true,
        status: 'ACTIVE',
      },
    });

    for (const v of p.variations) {
      const variation: any = v;
      await prisma.productVariation.upsert({
        where: { sku: variation.sku },
        update: {},
        create: {
          productId: product.id,
          name: variation.name,
          sku: variation.sku,
          price: variation.price,
          stock: variation.stock,
          colorName: variation.color,
          colorCode: variation.colorCode,
          storage: variation.storage,
          condition: variation.condition || 'new',
          status: 'ACTIVE',
          supplierId: supplier?.id,
        },
      });
    }
  }
  console.log(' Products & Variations seeded');

  // 6. Orders
  const iphone = await prisma.product.findUnique({ where: { slug: 'iphone-15-pro-max' }, include: { variations: true } });
  
  if (iphone && iphone.variations.length > 0) {
    const variation = iphone.variations[0];
    
    await prisma.order.create({
      data: {
        userId: admin.id,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'PIX',
        subtotal: variation.price,
        shipping: 0,
        total: variation.price,
        shippingAddress: JSON.stringify({ street: 'Rua Teste', number: '123', city: 'S�o Paulo', state: 'SP' }),
        orderItems: {
          create: {
            productId: iphone.id,
            variationId: variation.id,
            quantity: 1,
            price: variation.price,
            productName: variation.name,
            selectedColor: variation.colorName,
            selectedStorage: variation.storage,
          }
        }
      }
    });

    await prisma.order.create({
      data: {
        userId: seller.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CREDIT_CARD',
        saleType: 'presencial',
        subtotal: variation.price,
        shipping: 0,
        total: variation.price,
        shippingAddress: JSON.stringify({ street: 'Loja F�sica', number: '1', city: 'S�o Paulo', state: 'SP' }),
        orderItems: {
          create: {
            productId: iphone.id,
            variationId: variation.id,
            quantity: 1,
            price: variation.price,
            productName: variation.name,
            selectedColor: variation.colorName,
            selectedStorage: variation.storage,
          }
        }
      }
    });
  }
  console.log(' Orders seeded');

  console.log(' Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
