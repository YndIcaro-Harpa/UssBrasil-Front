import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting COMPLETE database seed...');
  console.log('📦 This will add ALL products with images and variations...\n');

  // 1. Create Users with Roles and Permissions
  const password = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ussbrasil.com' },
    update: { password: adminPassword, role: 'ADMIN', permissions: JSON.stringify(['*']) },
    create: {
      email: 'admin@ussbrasil.com',
      name: 'Administrador USS Brasil',
      password: adminPassword,
      role: 'ADMIN',
      permissions: JSON.stringify(['*']),
      cpf: '000.000.000-01',
      phone: '(11) 99999-0001',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'gerente@ussbrasil.com' },
    update: { role: 'MANAGER' },
    create: {
      email: 'gerente@ussbrasil.com',
      name: 'Gerente de Loja',
      password,
      role: 'MANAGER',
      permissions: JSON.stringify([
        'manage_products',
        'view_reports',
        'manage_orders',
        'manage_inventory',
        'manage_users'
      ]),
      cpf: '000.000.000-02',
      phone: '(11) 99999-0002',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'vendedor@ussbrasil.com' },
    update: { role: 'SELLER' },
    create: {
      email: 'vendedor@ussbrasil.com',
      name: 'Vendedor Padrão',
      password,
      role: 'SELLER',
      permissions: JSON.stringify([
        'create_order',
        'view_own_reports',
        'view_products'
      ]),
      cpf: '000.000.000-03',
      phone: '(11) 99999-0003',
    },
  });

  // Customer user
  await prisma.user.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      email: 'cliente@teste.com',
      name: 'Cliente Teste',
      password,
      role: 'USER',
      cpf: '123.456.789-00',
      phone: '(11) 98888-8888',
      address: 'Rua das Flores, 100',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    },
  });

  console.log('✅ Users seeded (4 users)');

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
          link: '/produtos?categoria=audio'
        },
        {
          src: '/Videos/Apple Watch.mp4',
          poster: '/fallback-product.png',
          title: 'Apple Watch',
          subtitle: 'Seu aliado na saúde e fitness.',
          description: 'Tecnologia no seu pulso',
          cta: 'Conheça Apple Watch',
          link: '/produtos?categoria=smartwatches'
        },
        {
          src: '/Videos/IpadVideo.mp4',
          poster: '/fallback-product.png',
          title: 'iPad',
          subtitle: 'Potência. Criatividade. Portabilidade.',
          description: 'Seu estúdio criativo portátil',
          cta: 'Descubra iPad',
          link: '/produtos?categoria=tablets'
        },
        {
          src: '/Videos/Macs Video.mp4',
          poster: '/fallback-product.png',
          title: 'Mac',
          subtitle: 'Performance profissional.',
          description: 'Poder para criar o extraordinário',
          cta: 'Ver Macs',
          link: '/produtos?categoria=computadores'
        }
      ]),
      type: 'json',
      description: 'Lista de vídeos do banner principal',
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
    {
      key: 'whatsapp_number',
      value: '5511999999999',
      type: 'text',
      description: 'Número do WhatsApp para atendimento',
    },
    {
      key: 'store_address',
      value: 'Rua das Flores, 123 - Centro - São Paulo/SP',
      type: 'text',
      description: 'Endereço da loja física',
    },
  ];

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }
  console.log('✅ Site Config seeded');

  // 3. Suppliers
  const suppliers = [
    { name: 'Apple Brasil Ltda', email: 'b2b@apple.com.br', cnpj: '12.345.678/0001-01' },
    { name: 'Xiaomi Distribuidor', email: 'vendas@xiaomi.com.br', cnpj: '98.765.432/0001-02' },
    { name: 'JBL Harman Brasil', email: 'b2b@jbl.com.br', cnpj: '11.222.333/0001-03' },
    { name: 'Samsung Electronics', email: 'parceiros@samsung.com.br', cnpj: '44.555.666/0001-04' },
  ];

  const dbSuppliers: any[] = [];
  for (const s of suppliers) {
    const supplier = await prisma.supplier.upsert({
      where: { cnpj: s.cnpj },
      update: {},
      create: s,
    });
    dbSuppliers.push(supplier);
  }
  console.log('✅ Suppliers seeded');

  // 4. Brands & Categories
  const brandsData = [
    { name: 'Apple', slug: 'apple', color: '#000000', logo: '/Produtos/Apple/Apresentação Home.jpg' },
    { name: 'Xiaomi', slug: 'xiaomi', color: '#FF6900', logo: '/logos/xiaomi.png' },
    { name: 'JBL', slug: 'jbl', color: '#FF4500', logo: '/logos/jbl.png' },
    { name: 'Samsung', slug: 'samsung', color: '#1428A0', logo: '/logos/samsung.png' },
    { name: 'DJI', slug: 'dji', color: '#333333', logo: '/logos/dji.png' },
  ];

  const dbBrands: any[] = [];
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
    { name: 'Áudio', slug: 'audio', icon: 'headphones' },
    { name: 'Computadores', slug: 'computadores', icon: 'laptop' },
    { name: 'Acessórios', slug: 'acessorios', icon: 'settings' },
  ];

  const dbCategories: any[] = [];
  for (const c of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    dbCategories.push(category);
  }
  console.log('✅ Brands & Categories seeded');

  // 5. Products & Variations
  const productsData = [
    // ============= APPLE SMARTPHONES =============
    {
      name: 'iPhone 16 Pro Max',
      slug: 'iphone-16-pro-max',
      description: 'O iPhone mais avançado de todos os tempos. Com chip A18 Pro, sistema de câmeras profissional e tela Super Retina XDR de 6.9".',
      brandSlug: 'apple',
      categorySlug: 'smartphones',
      price: 12999.00,
      discountPrice: 11999.00,
      featured: true,
      images: '/Produtos/Apple/iphone-16-pro-Max-Apresentacao.webp',
      variations: [
        { name: 'iPhone 16 Pro Max 256GB Titânio Natural', sku: 'IP16PM-256-NAT', color: 'Titânio Natural', colorCode: '#Beb7b0', storage: '256GB', price: 11999.00, stock: 15, image: '/Produtos/Apple/iphone-16-pro-Max-Titanio-natural.webp' },
        { name: 'iPhone 16 Pro Max 256GB Titânio Preto', sku: 'IP16PM-256-BLK', color: 'Titânio Preto', colorCode: '#181819', storage: '256GB', price: 11999.00, stock: 12, image: '/Produtos/Apple/iphone-16-pro-Max-Titânio-preto.webp' },
        { name: 'iPhone 16 Pro Max 256GB Titânio Branco', sku: 'IP16PM-256-WHT', color: 'Titânio Branco', colorCode: '#F5F5F0', storage: '256GB', price: 11999.00, stock: 10, image: '/Produtos/Apple/iphone-16-pro-Max-Titanio-branco.webp' },
        { name: 'iPhone 16 Pro Max 256GB Titânio Deserto', sku: 'IP16PM-256-DES', color: 'Titânio Deserto', colorCode: '#C4A77D', storage: '256GB', price: 11999.00, stock: 8, image: '/Produtos/Apple/iphone-16-pro-Max-Titânio-deserto.webp' },
        { name: 'iPhone 16 Pro Max 512GB Titânio Natural', sku: 'IP16PM-512-NAT', color: 'Titânio Natural', colorCode: '#Beb7b0', storage: '512GB', price: 13999.00, stock: 5, image: '/Produtos/Apple/iphone-16-pro-Max-Titanio-natural.webp' },
        { name: 'iPhone 16 Pro Max 1TB Titânio Preto', sku: 'IP16PM-1TB-BLK', color: 'Titânio Preto', colorCode: '#181819', storage: '1TB', price: 16999.00, stock: 3, image: '/Produtos/Apple/iphone-16-pro-Max-Titânio-preto.webp' },
      ]
    },
    {
      name: 'iPhone 16',
      slug: 'iphone-16',
      description: 'Design revolucionário com chip A18, câmera avançada e bateria que dura o dia todo.',
      brandSlug: 'apple',
      categorySlug: 'smartphones',
      price: 7999.00,
      discountPrice: 7499.00,
      featured: true,
      images: '/Produtos/Apple/Iphone 16.png',
      variations: [
        { name: 'iPhone 16 128GB Preto', sku: 'IP16-128-BLK', color: 'Preto', colorCode: '#1C1C1E', storage: '128GB', price: 7499.00, stock: 20, image: '/Produtos/Apple/iphone-16-Preto.webp' },
        { name: 'iPhone 16 128GB Branco', sku: 'IP16-128-WHT', color: 'Branco', colorCode: '#F5F5F7', storage: '128GB', price: 7499.00, stock: 18, image: '/Produtos/Apple/iphone-16-Branco.webp' },
        { name: 'iPhone 16 128GB Rosa', sku: 'IP16-128-PNK', color: 'Rosa', colorCode: '#F9D1D1', storage: '128GB', price: 7499.00, stock: 15, image: '/Produtos/Apple/iphone-16-Rosa.webp' },
        { name: 'iPhone 16 128GB Ultramarino', sku: 'IP16-128-ULT', color: 'Ultramarino', colorCode: '#4169E1', storage: '128GB', price: 7499.00, stock: 12, image: '/Produtos/Apple/iphone-16-Ultramarino.webp' },
        { name: 'iPhone 16 128GB Verde Acinzentado', sku: 'IP16-128-GRN', color: 'Verde Acinzentado', colorCode: '#A8B5A2', storage: '128GB', price: 7499.00, stock: 10, image: '/Produtos/Apple/iphone-16-Verde-acinzentado.webp' },
        { name: 'iPhone 16 256GB Preto', sku: 'IP16-256-BLK', color: 'Preto', colorCode: '#1C1C1E', storage: '256GB', price: 8499.00, stock: 8, image: '/Produtos/Apple/iphone-16-Preto.webp' },
      ]
    },
    {
      name: 'iPhone 16e',
      slug: 'iphone-16e',
      description: 'Todo o poder do iPhone 16 em um design mais acessível. Chip A18 e câmera avançada.',
      brandSlug: 'apple',
      categorySlug: 'smartphones',
      price: 5999.00,
      discountPrice: 5499.00,
      featured: false,
      images: '/Produtos/Apple/Iphone 16e.png',
      variations: [
        { name: 'iPhone 16e 128GB Preto', sku: 'IP16E-128-BLK', color: 'Preto', colorCode: '#1C1C1E', storage: '128GB', price: 5499.00, stock: 25, image: '/Produtos/Apple/iphone-16e-Preto.webp' },
        { name: 'iPhone 16e 128GB Branco', sku: 'IP16E-128-WHT', color: 'Branco', colorCode: '#F5F5F7', storage: '128GB', price: 5499.00, stock: 22, image: '/Produtos/Apple/iphone-16e-Branco.webp' },
      ]
    },
    {
      name: 'iPhone 15',
      slug: 'iphone-15',
      description: 'iPhone 15 com Dynamic Island, câmera de 48MP e chip A16 Bionic.',
      brandSlug: 'apple',
      categorySlug: 'smartphones',
      price: 6499.00,
      discountPrice: 5999.00,
      featured: false,
      images: '/Produtos/Apple/Iphone-15-Apresentação.webp',
      variations: [
        { name: 'iPhone 15 128GB Preto', sku: 'IP15-128-BLK', color: 'Preto', colorCode: '#1C1C1E', storage: '128GB', price: 5999.00, stock: 15, image: '/Produtos/Apple/Iphone-15-Preto.webp' },
        { name: 'iPhone 15 128GB Azul', sku: 'IP15-128-BLU', color: 'Azul', colorCode: '#0071E3', storage: '128GB', price: 5999.00, stock: 12, image: '/Produtos/Apple/Iphone-15-Azul.webp' },
        { name: 'iPhone 15 128GB Rosa', sku: 'IP15-128-PNK', color: 'Rosa', colorCode: '#F9D1D1', storage: '128GB', price: 5999.00, stock: 10, image: '/Produtos/Apple/Iphone-15-Rosa.webp' },
        { name: 'iPhone 15 128GB Amarelo', sku: 'IP15-128-YLW', color: 'Amarelo', colorCode: '#FFD60A', storage: '128GB', price: 5999.00, stock: 8, image: '/Produtos/Apple/Iphone-15-Amarelo.webp' },
        { name: 'iPhone 15 128GB Verde', sku: 'IP15-128-GRN', color: 'Verde', colorCode: '#2E8B57', storage: '128GB', price: 5999.00, stock: 8, image: '/Produtos/Apple/Iphone-15-Verde.webp' },
      ]
    },

    // ============= APPLE TABLETS =============
    {
      name: 'iPad Pro M4',
      slug: 'ipad-pro-m4',
      description: 'O iPad mais poderoso de todos os tempos. Chip M4, tela OLED e desempenho profissional.',
      brandSlug: 'apple',
      categorySlug: 'tablets',
      price: 13999.00,
      discountPrice: 12999.00,
      featured: true,
      images: '/Produtos/Apple/Ipad Pro.png',
      variations: [
        { name: 'iPad Pro 11" M4 256GB Wi-Fi Cinza Espacial', sku: 'IPADPRO11-256-GRY', color: 'Cinza Espacial', colorCode: '#8E8E93', storage: '256GB', price: 12999.00, stock: 10 },
        { name: 'iPad Pro 11" M4 256GB Wi-Fi Prateado', sku: 'IPADPRO11-256-SLV', color: 'Prateado', colorCode: '#E5E5EA', storage: '256GB', price: 12999.00, stock: 8 },
        { name: 'iPad Pro 13" M4 512GB Wi-Fi Cinza Espacial', sku: 'IPADPRO13-512-GRY', color: 'Cinza Espacial', colorCode: '#8E8E93', storage: '512GB', price: 16999.00, stock: 5 },
      ]
    },
    {
      name: 'iPad Air',
      slug: 'ipad-air',
      description: 'Poder do chip M2 em um design fino e leve. Perfeito para criatividade e produtividade.',
      brandSlug: 'apple',
      categorySlug: 'tablets',
      price: 8999.00,
      discountPrice: 8499.00,
      featured: false,
      images: '/Produtos/Apple/IpadAir.png',
      variations: [
        { name: 'iPad Air 11" M2 256GB Wi-Fi Azul', sku: 'IPADAIR11-256-BLU', color: 'Azul', colorCode: '#0071E3', storage: '256GB', price: 8499.00, stock: 12 },
        { name: 'iPad Air 11" M2 256GB Wi-Fi Cinza Espacial', sku: 'IPADAIR11-256-GRY', color: 'Cinza Espacial', colorCode: '#8E8E93', storage: '256GB', price: 8499.00, stock: 10 },
        { name: 'iPad Air 13" M2 256GB Wi-Fi Estelar', sku: 'IPADAIR13-256-STR', color: 'Estelar', colorCode: '#F5F5F0', storage: '256GB', price: 10499.00, stock: 6 },
      ]
    },
    {
      name: 'iPad Mini',
      slug: 'ipad-mini',
      description: 'Mega poder em tamanho mini. Chip A17 Pro e tela Liquid Retina de 8.3".',
      brandSlug: 'apple',
      categorySlug: 'tablets',
      price: 6499.00,
      discountPrice: null,
      featured: false,
      images: '/Produtos/Apple/IpadMini.png',
      variations: [
        { name: 'iPad Mini 128GB Wi-Fi Cinza Espacial', sku: 'IPADMINI-128-GRY', color: 'Cinza Espacial', colorCode: '#8E8E93', storage: '128GB', price: 6499.00, stock: 15 },
        { name: 'iPad Mini 128GB Wi-Fi Rosa', sku: 'IPADMINI-128-PNK', color: 'Rosa', colorCode: '#F9D1D1', storage: '128GB', price: 6499.00, stock: 10 },
        { name: 'iPad Mini 256GB Wi-Fi Azul', sku: 'IPADMINI-256-BLU', color: 'Azul', colorCode: '#0071E3', storage: '256GB', price: 7999.00, stock: 8 },
      ]
    },
    {
      name: 'iPad 10ª Geração',
      slug: 'ipad-10',
      description: 'O iPad essencial. Chip A14 Bionic, tela Liquid Retina de 10.9" e design colorido.',
      brandSlug: 'apple',
      categorySlug: 'tablets',
      price: 4499.00,
      discountPrice: 3999.00,
      featured: false,
      images: '/Produtos/Apple/Ipad.png',
      variations: [
        { name: 'iPad 10 64GB Wi-Fi Azul', sku: 'IPAD10-64-BLU', color: 'Azul', colorCode: '#0071E3', storage: '64GB', price: 3999.00, stock: 20 },
        { name: 'iPad 10 64GB Wi-Fi Rosa', sku: 'IPAD10-64-PNK', color: 'Rosa', colorCode: '#F9D1D1', storage: '64GB', price: 3999.00, stock: 18 },
        { name: 'iPad 10 64GB Wi-Fi Prata', sku: 'IPAD10-64-SLV', color: 'Prata', colorCode: '#E5E5EA', storage: '64GB', price: 3999.00, stock: 15 },
      ]
    },

    // ============= APPLE WATCHES =============
    {
      name: 'Apple Watch Ultra 2',
      slug: 'apple-watch-ultra-2',
      description: 'O Apple Watch mais robusto e versátil. Para atletas extremos e aventureiros.',
      brandSlug: 'apple',
      categorySlug: 'smartwatches',
      price: 9499.00,
      discountPrice: 8999.00,
      featured: true,
      images: '/Produtos/Apple/Watch Ultra 2.png',
      variations: [
        { name: 'Apple Watch Ultra 2 49mm Titânio Natural', sku: 'AWU2-49-NAT', color: 'Titânio Natural', colorCode: '#Beb7b0', storage: '64GB', price: 8999.00, stock: 8 },
        { name: 'Apple Watch Ultra 2 49mm Titânio Preto', sku: 'AWU2-49-BLK', color: 'Titânio Preto', colorCode: '#181819', storage: '64GB', price: 9499.00, stock: 5 },
      ]
    },
    {
      name: 'Apple Watch Series 10',
      slug: 'apple-watch-series-10',
      description: 'O Apple Watch mais fino e avançado. Tela maior, chip S10 e novos recursos de saúde.',
      brandSlug: 'apple',
      categorySlug: 'smartwatches',
      price: 5999.00,
      discountPrice: 5499.00,
      featured: true,
      images: '/Produtos/Apple/Watch Series 10.png',
      variations: [
        { name: 'Apple Watch Series 10 42mm Alumínio Preto', sku: 'AWS10-42-BLK', color: 'Preto', colorCode: '#1C1C1E', storage: '32GB', price: 5499.00, stock: 15 },
        { name: 'Apple Watch Series 10 46mm Alumínio Prata', sku: 'AWS10-46-SLV', color: 'Prata', colorCode: '#E5E5EA', storage: '32GB', price: 5999.00, stock: 12 },
        { name: 'Apple Watch Series 10 46mm Aço Inox Dourado', sku: 'AWS10-46-GLD', color: 'Dourado', colorCode: '#FFD700', storage: '32GB', price: 8999.00, stock: 5 },
      ]
    },
    {
      name: 'Apple Watch SE',
      slug: 'apple-watch-se',
      description: 'Tudo que você ama no Apple Watch. Por um preço que você vai amar.',
      brandSlug: 'apple',
      categorySlug: 'smartwatches',
      price: 3299.00,
      discountPrice: 2999.00,
      featured: false,
      images: '/Produtos/Apple/Watch SE.png',
      variations: [
        { name: 'Apple Watch SE 40mm Alumínio Meia-Noite', sku: 'AWSE-40-MDN', color: 'Meia-Noite', colorCode: '#1C1C1E', storage: '32GB', price: 2999.00, stock: 20 },
        { name: 'Apple Watch SE 44mm Alumínio Estelar', sku: 'AWSE-44-STR', color: 'Estelar', colorCode: '#F5F5F0', storage: '32GB', price: 3299.00, stock: 18 },
      ]
    },

    // ============= APPLE AUDIO =============
    {
      name: 'AirPods Max',
      slug: 'airpods-max',
      description: 'Áudio de alta fidelidade. Cancelamento de ruído ativo. Design premium over-ear.',
      brandSlug: 'apple',
      categorySlug: 'audio',
      price: 5999.00,
      discountPrice: 5499.00,
      featured: true,
      images: '/Produtos/Apple/Air Pods Max.png',
      variations: [
        { name: 'AirPods Max Azul Céu', sku: 'APM-SKY', color: 'Azul Céu', colorCode: '#87CEEB', price: 5499.00, stock: 10 },
        { name: 'AirPods Max Verde', sku: 'APM-GRN', color: 'Verde', colorCode: '#2E8B57', price: 5499.00, stock: 8 },
        { name: 'AirPods Max Rosa', sku: 'APM-PNK', color: 'Rosa', colorCode: '#FFB6C1', price: 5499.00, stock: 8 },
        { name: 'AirPods Max Prata', sku: 'APM-SLV', color: 'Prata', colorCode: '#E5E5EA', price: 5499.00, stock: 12 },
        { name: 'AirPods Max Cinza Espacial', sku: 'APM-GRY', color: 'Cinza Espacial', colorCode: '#8E8E93', price: 5499.00, stock: 10 },
      ]
    },
    {
      name: 'AirPods 4',
      slug: 'airpods-4',
      description: 'Novos AirPods com design open-ear, áudio espacial e chip H2.',
      brandSlug: 'apple',
      categorySlug: 'audio',
      price: 1499.00,
      discountPrice: 1399.00,
      featured: true,
      images: '/Produtos/Apple/airpods-4.png',
      variations: [
        { name: 'AirPods 4', sku: 'AP4-STD', color: 'Branco', colorCode: '#FFFFFF', price: 1399.00, stock: 30 },
        { name: 'AirPods 4 com ANC', sku: 'AP4-ANC', color: 'Branco', colorCode: '#FFFFFF', price: 1999.00, stock: 25 },
      ]
    },

    // ============= APPLE COMPUTERS =============
    {
      name: 'MacBook Pro 14" M4',
      slug: 'macbook-pro-14-m4',
      description: 'Poder profissional. Chip M4 Pro, tela Liquid Retina XDR e até 22h de bateria.',
      brandSlug: 'apple',
      categorySlug: 'computadores',
      price: 19999.00,
      discountPrice: 18999.00,
      featured: true,
      images: '/Produtos/Apple/Macbook Pro.png',
      variations: [
        { name: 'MacBook Pro 14" M4 Pro 512GB Cinza Espacial', sku: 'MBP14-M4P-512-GRY', color: 'Cinza Espacial', colorCode: '#8E8E93', storage: '512GB', price: 18999.00, stock: 8 },
        { name: 'MacBook Pro 14" M4 Pro 512GB Prateado', sku: 'MBP14-M4P-512-SLV', color: 'Prateado', colorCode: '#E5E5EA', storage: '512GB', price: 18999.00, stock: 6 },
        { name: 'MacBook Pro 14" M4 Max 1TB Preto Espacial', sku: 'MBP14-M4X-1TB-BLK', color: 'Preto Espacial', colorCode: '#1C1C1E', storage: '1TB', price: 28999.00, stock: 3 },
      ]
    },
    {
      name: 'MacBook Air 15" M3',
      slug: 'macbook-air-15-m3',
      description: 'Incrivelmente fino. Surpreendentemente poderoso. Com chip M3.',
      brandSlug: 'apple',
      categorySlug: 'computadores',
      price: 14999.00,
      discountPrice: 13999.00,
      featured: false,
      images: '/Produtos/Apple/Macbook Air.png',
      variations: [
        { name: 'MacBook Air 15" M3 256GB Meia-Noite', sku: 'MBA15-M3-256-MDN', color: 'Meia-Noite', colorCode: '#1C1C1E', storage: '256GB', price: 13999.00, stock: 10 },
        { name: 'MacBook Air 15" M3 256GB Estelar', sku: 'MBA15-M3-256-STR', color: 'Estelar', colorCode: '#F5F5F0', storage: '256GB', price: 13999.00, stock: 8 },
        { name: 'MacBook Air 15" M3 512GB Prateado', sku: 'MBA15-M3-512-SLV', color: 'Prateado', colorCode: '#E5E5EA', storage: '512GB', price: 15999.00, stock: 6 },
      ]
    },
    {
      name: 'iMac 24" M4',
      slug: 'imac-24-m4',
      description: 'O desktop all-in-one mais icônico. Agora com chip M4 e 7 cores vibrantes.',
      brandSlug: 'apple',
      categorySlug: 'computadores',
      price: 12999.00,
      discountPrice: null,
      featured: false,
      images: '/Produtos/Apple/Imac.png',
      variations: [
        { name: 'iMac 24" M4 256GB Azul', sku: 'IMAC24-M4-256-BLU', color: 'Azul', colorCode: '#0071E3', storage: '256GB', price: 12999.00, stock: 5 },
        { name: 'iMac 24" M4 256GB Verde', sku: 'IMAC24-M4-256-GRN', color: 'Verde', colorCode: '#2E8B57', storage: '256GB', price: 12999.00, stock: 4 },
        { name: 'iMac 24" M4 512GB Prata', sku: 'IMAC24-M4-512-SLV', color: 'Prata', colorCode: '#E5E5EA', storage: '512GB', price: 15499.00, stock: 3 },
      ]
    },
    {
      name: 'Mac Mini M4',
      slug: 'mac-mini-m4',
      description: 'Pequeno no tamanho. Gigante no desempenho. Agora com chip M4.',
      brandSlug: 'apple',
      categorySlug: 'computadores',
      price: 5499.00,
      discountPrice: 4999.00,
      featured: false,
      images: '/Produtos/Apple/MacMini.png',
      variations: [
        { name: 'Mac Mini M4 256GB', sku: 'MACMINI-M4-256', color: 'Prata', colorCode: '#E5E5EA', storage: '256GB', price: 4999.00, stock: 15 },
        { name: 'Mac Mini M4 Pro 512GB', sku: 'MACMINI-M4P-512', color: 'Prata', colorCode: '#E5E5EA', storage: '512GB', price: 9999.00, stock: 8 },
      ]
    },

    // ============= APPLE ACCESSORIES =============
    {
      name: 'Apple Pencil Pro',
      slug: 'apple-pencil-pro',
      description: 'A ferramenta definitiva para criar no iPad. Sensores de pressão e inclinação.',
      brandSlug: 'apple',
      categorySlug: 'acessorios',
      price: 1499.00,
      discountPrice: null,
      featured: false,
      images: '/Produtos/Apple/Apple-Pen.png',
      variations: [
        { name: 'Apple Pencil Pro', sku: 'APPRO', color: 'Branco', colorCode: '#FFFFFF', price: 1499.00, stock: 25 },
      ]
    },
    {
      name: 'Magic Keyboard',
      slug: 'magic-keyboard',
      description: 'Teclado sem fio da Apple com Touch ID e layout otimizado para Mac.',
      brandSlug: 'apple',
      categorySlug: 'acessorios',
      price: 1699.00,
      discountPrice: null,
      featured: false,
      images: '/Produtos/Apple/Teclado-Apple.png',
      variations: [
        { name: 'Magic Keyboard Preto', sku: 'MK-BLK', color: 'Preto', colorCode: '#1C1C1E', price: 1699.00, stock: 15 },
        { name: 'Magic Keyboard Branco', sku: 'MK-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 1699.00, stock: 12 },
      ]
    },
    {
      name: 'Magic Mouse',
      slug: 'magic-mouse',
      description: 'Mouse sem fio com superfície Multi-Touch para gestos intuitivos.',
      brandSlug: 'apple',
      categorySlug: 'acessorios',
      price: 899.00,
      discountPrice: null,
      featured: false,
      images: '/Produtos/Apple/Magic-Mouse.png',
      variations: [
        { name: 'Magic Mouse Preto', sku: 'MM-BLK', color: 'Preto', colorCode: '#1C1C1E', price: 899.00, stock: 20 },
        { name: 'Magic Mouse Branco', sku: 'MM-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 899.00, stock: 18 },
      ]
    },

    // ============= JBL AUDIO =============
    {
      name: 'JBL Boombox 3 Wi-Fi',
      slug: 'jbl-boombox-3-wifi',
      description: 'Caixa de som portátil com Wi-Fi, som potente e bateria de longa duração.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 3999.00,
      discountPrice: 3499.00,
      featured: true,
      images: '/Produtos/JBL/JBL Boombox 3 Wi-Fi.webp',
      variations: [
        { name: 'JBL Boombox 3 Wi-Fi Preto', sku: 'JBL-BB3W-BLK', color: 'Preto', colorCode: '#000000', price: 3499.00, stock: 15 },
      ]
    },
    {
      name: 'JBL Boombox 3',
      slug: 'jbl-boombox-3',
      description: 'Som massivo. O dia todo. 24 horas de bateria e graves profundos.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 3499.00,
      discountPrice: 2999.00,
      featured: true,
      images: '/Produtos/JBL/JBL Boombox 3.webp',
      variations: [
        { name: 'JBL Boombox 3 Preto', sku: 'JBL-BB3-BLK', color: 'Preto', colorCode: '#000000', price: 2999.00, stock: 20 },
        { name: 'JBL Boombox 3 Camuflado', sku: 'JBL-BB3-CAM', color: 'Camuflado', colorCode: '#4b5320', price: 3199.00, stock: 8 },
      ]
    },
    {
      name: 'JBL Partybox 710',
      slug: 'jbl-partybox-710',
      description: 'Sistema de som para festas com luzes sincronizadas e potência de 800W.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 5999.00,
      discountPrice: 5299.00,
      featured: true,
      images: '/Produtos/JBL/JBL Partybox 710.webp',
      variations: [
        { name: 'JBL Partybox 710 Preto', sku: 'JBL-PB710-BLK', color: 'Preto', colorCode: '#000000', price: 5299.00, stock: 10 },
      ]
    },
    {
      name: 'JBL Xtreme 4',
      slug: 'jbl-xtreme-4',
      description: 'Caixa de som portátil resistente com som poderoso e alça de transporte.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 2199.00,
      discountPrice: 1899.00,
      featured: false,
      images: '/Produtos/JBL/JBL Xtreme 4.webp',
      variations: [
        { name: 'JBL Xtreme 4 Preto', sku: 'JBL-XT4-BLK', color: 'Preto', colorCode: '#000000', price: 1899.00, stock: 18 },
        { name: 'JBL Xtreme 4 Azul', sku: 'JBL-XT4-BLU', color: 'Azul', colorCode: '#0071E3', price: 1899.00, stock: 12, image: '/Produtos/JBL/JBL Xtreme 4 Azul.webp' },
      ]
    },
    {
      name: 'JBL Flip Essential 2',
      slug: 'jbl-flip-essential-2',
      description: 'Caixa de som portátil à prova d\'água com JBL Original Pro Sound.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 599.00,
      discountPrice: 499.00,
      featured: false,
      images: '/Produtos/JBL/JBL Flip Essential 2.webp',
      variations: [
        { name: 'JBL Flip Essential 2 Preto', sku: 'JBL-FE2-BLK', color: 'Preto', colorCode: '#000000', price: 499.00, stock: 35 },
      ]
    },
    {
      name: 'JBL Go 4',
      slug: 'jbl-go-4',
      description: 'Caixa de som ultra portátil com clipe, ideal para aventuras.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 349.00,
      discountPrice: null,
      featured: false,
      images: '/Produtos/JBL/JBL Go 4.webp',
      variations: [
        { name: 'JBL Go 4 Preto', sku: 'JBL-GO4-BLK', color: 'Preto', colorCode: '#000000', price: 349.00, stock: 50 },
        { name: 'JBL Go 4 Azul', sku: 'JBL-GO4-BLU', color: 'Azul', colorCode: '#0071E3', price: 349.00, stock: 40 },
        { name: 'JBL Go 4 Rosa', sku: 'JBL-GO4-PNK', color: 'Rosa', colorCode: '#FFB6C1', price: 349.00, stock: 35 },
        { name: 'JBL Go 4 Verde', sku: 'JBL-GO4-GRN', color: 'Verde', colorCode: '#2E8B57', price: 349.00, stock: 30 },
      ]
    },
    {
      name: 'JBL Live 670NC',
      slug: 'jbl-live-670nc',
      description: 'Fone de ouvido over-ear com cancelamento de ruído adaptativo e 50h de bateria.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 799.00,
      discountPrice: 649.00,
      featured: true,
      images: '/Produtos/JBL/JBL Live 670NC.webp',
      variations: [
        { name: 'JBL Live 670NC Preto', sku: 'JBL-L670-BLK', color: 'Preto', colorCode: '#000000', price: 649.00, stock: 30 },
        { name: 'JBL Live 670NC Azul', sku: 'JBL-L670-BLU', color: 'Azul', colorCode: '#0071E3', price: 649.00, stock: 25, image: '/Produtos/JBL/JBL Live 670NC Azul.webp' },
        { name: 'JBL Live 670NC Branco', sku: 'JBL-L670-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 649.00, stock: 25, image: '/Produtos/JBL/JBL Live 670NC Branco.webp' },
        { name: 'JBL Live 670NC Dourado', sku: 'JBL-L670-GLD', color: 'Dourado', colorCode: '#FFD700', price: 649.00, stock: 20, image: '/Produtos/JBL/JBL Live 670NC Dourado.webp' },
      ]
    },
    {
      name: 'JBL Tour One M3',
      slug: 'jbl-tour-one-m3',
      description: 'Fone de ouvido premium com True Adaptive ANC e áudio Hi-Res.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 1799.00,
      discountPrice: 1499.00,
      featured: false,
      images: '/Produtos/JBL/JBL Tour One M3.webp',
      variations: [
        { name: 'JBL Tour One M3 Preto', sku: 'JBL-TOM3-BLK', color: 'Preto', colorCode: '#000000', price: 1499.00, stock: 15 },
        { name: 'JBL Tour One M3 Dourado', sku: 'JBL-TOM3-GLD', color: 'Dourado', colorCode: '#FFD700', price: 1499.00, stock: 10, image: '/Produtos/JBL/JBL Tour One M3 DOurado.webp' },
      ]
    },
    {
      name: 'JBL Tune Buds 2',
      slug: 'jbl-tune-buds-2',
      description: 'Fones intra-auriculares TWS com cancelamento de ruído e som JBL Pure Bass.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 499.00,
      discountPrice: 399.00,
      featured: false,
      images: '/Produtos/JBL/JBL Tune Buds 2.webp',
      variations: [
        { name: 'JBL Tune Buds 2 Preto', sku: 'JBL-TB2-BLK', color: 'Preto', colorCode: '#000000', price: 399.00, stock: 40 },
      ]
    },
    {
      name: 'JBL Wave Buds 2',
      slug: 'jbl-wave-buds-2',
      description: 'Fones TWS compactos com som poderoso e resistência IP54.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 349.00,
      discountPrice: 299.00,
      featured: false,
      images: '/Produtos/JBL/JBL Wave Buds 2.webp',
      variations: [
        { name: 'JBL Wave Buds 2 Preto', sku: 'JBL-WB2-BLK', color: 'Preto', colorCode: '#000000', price: 299.00, stock: 45, image: '/Produtos/JBL/JBL Wave Buds 2 Preto.webp' },
        { name: 'JBL Wave Buds 2 Branco', sku: 'JBL-WB2-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 299.00, stock: 40 },
      ]
    },

    // ============= XIAOMI SMARTPHONES =============
    {
      name: 'POCO X7 Pro',
      slug: 'poco-x7-pro',
      description: 'Desempenho extremo. Dimensity 8400 Ultra, tela AMOLED 120Hz e carregamento 90W.',
      brandSlug: 'xiaomi',
      categorySlug: 'smartphones',
      price: 2999.00,
      discountPrice: 2599.00,
      featured: true,
      images: '/Produtos/Xiomi/poco-x7-pro Banner.webp',
      variations: [
        { name: 'POCO X7 Pro 256GB Preto', sku: 'POCOX7P-256-BLK', color: 'Preto', colorCode: '#000000', storage: '256GB', price: 2599.00, stock: 25, image: '/Produtos/Xiomi/poco-x7-pro Combo.webp' },
        { name: 'POCO X7 Pro 512GB Amarelo', sku: 'POCOX7P-512-YLW', color: 'Amarelo', colorCode: '#FFD60A', storage: '512GB', price: 2999.00, stock: 15 },
      ]
    },
    {
      name: 'Redmi Note 14 Pro 5G',
      slug: 'redmi-note-14-pro-5g',
      description: 'Câmera de 200MP, tela AMOLED 120Hz e bateria de 5500mAh.',
      brandSlug: 'xiaomi',
      categorySlug: 'smartphones',
      price: 2499.00,
      discountPrice: 2199.00,
      featured: true,
      images: '/Produtos/Xiomi/redmi-note-14-pro-5g.webp',
      variations: [
        { name: 'Redmi Note 14 Pro 5G 256GB Preto', sku: 'RN14P5G-256-BLK', color: 'Preto', colorCode: '#000000', storage: '256GB', price: 2199.00, stock: 30, image: '/Produtos/Xiomi/Redmi Note 14 Pro 5G Combo.webp' },
        { name: 'Redmi Note 14 Pro 5G 256GB Azul', sku: 'RN14P5G-256-BLU', color: 'Azul', colorCode: '#0071E3', storage: '256GB', price: 2199.00, stock: 25 },
      ]
    },
    {
      name: 'Xiaomi 13 Lite',
      slug: 'xiaomi-13-lite',
      description: 'Design elegante e fino com câmera de 50MP e tela AMOLED.',
      brandSlug: 'xiaomi',
      categorySlug: 'smartphones',
      price: 1999.00,
      discountPrice: 1699.00,
      featured: false,
      images: '/Produtos/Xiomi/Xiaomi 13 Lite Banner.webp',
      variations: [
        { name: 'Xiaomi 13 Lite 256GB Preto', sku: 'X13L-256-BLK', color: 'Preto', colorCode: '#000000', storage: '256GB', price: 1699.00, stock: 20, image: '/Produtos/Xiomi/Xiaomi 13 Lite Combo.webp' },
        { name: 'Xiaomi 13 Lite 256GB Rosa', sku: 'X13L-256-PNK', color: 'Rosa', colorCode: '#FFB6C1', storage: '256GB', price: 1699.00, stock: 15 },
      ]
    },

    // ============= XIAOMI TABLETS =============
    {
      name: 'Redmi Pad SE 8.7"',
      slug: 'redmi-pad-se-87',
      description: 'Tablet compacto com tela de 8.7" e bateria de longa duração.',
      brandSlug: 'xiaomi',
      categorySlug: 'tablets',
      price: 1299.00,
      discountPrice: 999.00,
      featured: false,
      images: '/Produtos/Xiomi/Redmi Pad Se.webp',
      variations: [
        { name: 'Redmi Pad SE 8.7" 64GB Grafite', sku: 'RPADSE87-64-GRF', color: 'Grafite', colorCode: '#4A4A4A', storage: '64GB', price: 999.00, stock: 30, image: '/Produtos/Xiomi/redmi-pad-se-8-7 Combo.webp' },
        { name: 'Redmi Pad SE 8.7" 128GB Azul', sku: 'RPADSE87-128-BLU', color: 'Azul', colorCode: '#0071E3', storage: '128GB', price: 1199.00, stock: 20 },
      ]
    },
    {
      name: 'Xiaomi 12 Lite',
      slug: 'xiaomi-12-lite',
      description: 'Smartphone fino e leve com Snapdragon 778G, tela AMOLED 120Hz e câmera de 108MP.',
      brandSlug: 'xiaomi',
      categorySlug: 'smartphones',
      price: 1799.00,
      discountPrice: 1499.00,
      featured: false,
      images: '/Produtos/Xiomi/Xiaomi 12 Lite Banner.jpg',
      variations: [
        { name: 'Xiaomi 12 Lite 128GB Preto', sku: 'X12L-128-BLK', color: 'Preto', colorCode: '#000000', storage: '128GB', price: 1499.00, stock: 18, image: '/Produtos/Xiomi/Xiaomi 12 Lite Combo.jpg' },
        { name: 'Xiaomi 12 Lite 128GB Verde', sku: 'X12L-128-GRN', color: 'Verde', colorCode: '#2E8B57', storage: '128GB', price: 1499.00, stock: 12 },
      ]
    },
    {
      name: 'Xiaomi Pad 5',
      slug: 'xiaomi-pad-5',
      description: 'Tablet premium com Snapdragon 860, tela 120Hz e som quad speaker.',
      brandSlug: 'xiaomi',
      categorySlug: 'tablets',
      price: 2799.00,
      discountPrice: 2399.00,
      featured: true,
      images: '/Produtos/Xiomi/Xiomi Pad 5',
      variations: [
        { name: 'Xiaomi Pad 5 128GB Branco Pérola', sku: 'XPAD5-128-WHT', color: 'Branco Pérola', colorCode: '#F5F5F5', storage: '128GB', price: 2399.00, stock: 15 },
        { name: 'Xiaomi Pad 5 256GB Cinza Cósmico', sku: 'XPAD5-256-GRY', color: 'Cinza Cósmico', colorCode: '#4A4A4A', storage: '256GB', price: 2699.00, stock: 10 },
      ]
    },
    {
      name: 'Mi Watch',
      slug: 'mi-watch',
      description: 'Smartwatch completo com GPS, monitor cardíaco e até 16 dias de bateria.',
      brandSlug: 'xiaomi',
      categorySlug: 'smartwatches',
      price: 999.00,
      discountPrice: 799.00,
      featured: false,
      images: '/Produtos/Xiomi/Mi Watch',
      variations: [
        { name: 'Mi Watch Preto', sku: 'MIWATCH-BLK', color: 'Preto', colorCode: '#000000', price: 799.00, stock: 25 },
        { name: 'Mi Watch Azul Marinho', sku: 'MIWATCH-NVY', color: 'Azul Marinho', colorCode: '#000080', price: 799.00, stock: 20 },
      ]
    },

    // ============= MORE JBL PRODUCTS =============
    {
      name: 'JBL PartyBox Club 120',
      slug: 'jbl-partybox-club-120',
      description: 'Sistema de som poderoso com luzes LED RGB sincronizadas para festas épicas.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 3999.00,
      discountPrice: 3499.00,
      featured: true,
      images: '/Produtos/JBL/JBL PartyBox Club 120.webp',
      variations: [
        { name: 'JBL PartyBox Club 120 Preto', sku: 'JBL-PBCLUB120-BLK', color: 'Preto', colorCode: '#000000', price: 3499.00, stock: 12 },
      ]
    },
    {
      name: 'JBL PartyBox Encore 2',
      slug: 'jbl-partybox-encore-2',
      description: 'Caixa de som portátil com 2 microfones sem fio inclusos. Perfeita para karaokê.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 2499.00,
      discountPrice: 2199.00,
      featured: false,
      images: '/Produtos/JBL/JBL PartyBox Encore 2.webp',
      variations: [
        { name: 'JBL PartyBox Encore 2 Preto', sku: 'JBL-PBE2-BLK', color: 'Preto', colorCode: '#000000', price: 2199.00, stock: 15 },
      ]
    },
    {
      name: 'JBL Tune 520BT',
      slug: 'jbl-tune-520bt',
      description: 'Fone Bluetooth on-ear com 57h de bateria e som JBL Pure Bass.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 299.00,
      discountPrice: 249.00,
      featured: false,
      images: '/Produtos/JBL/JBL Tune 520BT.webp',
      variations: [
        { name: 'JBL Tune 520BT Preto', sku: 'JBL-T520BT-BLK', color: 'Preto', colorCode: '#000000', price: 249.00, stock: 50 },
        { name: 'JBL Tune 520BT Branco', sku: 'JBL-T520BT-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 249.00, stock: 40, image: '/Produtos/JBL/JBL Tune 520BT Branco.webp' },
      ]
    },
    {
      name: 'JBL Tune 670NC',
      slug: 'jbl-tune-670nc',
      description: 'Fone Bluetooth com cancelamento de ruído ativo adaptativo.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 449.00,
      discountPrice: 379.00,
      featured: false,
      images: '/Produtos/JBL/JBL Tune 670NC.webp',
      variations: [
        { name: 'JBL Tune 670NC Preto', sku: 'JBL-T670NC-BLK', color: 'Preto', colorCode: '#000000', price: 379.00, stock: 35 },
        { name: 'JBL Tune 670NC Branco', sku: 'JBL-T670NC-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 379.00, stock: 30, image: '/Produtos/JBL/JBL Tune 670NC branco.webp' },
      ]
    },
    {
      name: 'JBL Tune Flex 2 Ghost Edition',
      slug: 'jbl-tune-flex-2-ghost',
      description: 'Fones TWS com design transparente exclusivo Ghost Edition.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 599.00,
      discountPrice: 499.00,
      featured: true,
      images: '/Produtos/JBL/JBL Tune Flex 2 Ghost Edition.webp',
      variations: [
        { name: 'JBL Tune Flex 2 Ghost Edition Transparente', sku: 'JBL-TF2GE-CLR', color: 'Transparente', colorCode: '#E8E8E8', price: 499.00, stock: 20 },
      ]
    },
    {
      name: 'JBL Go Essential',
      slug: 'jbl-go-essential',
      description: 'Caixa de som ultra-compacta com 5h de bateria e design portátil.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 199.00,
      discountPrice: 169.00,
      featured: false,
      images: '/Produtos/JBL/JBL Go Essential.webp',
      variations: [
        { name: 'JBL Go Essential Preto', sku: 'JBL-GOESS-BLK', color: 'Preto', colorCode: '#000000', price: 169.00, stock: 60 },
        { name: 'JBL Go Essential Azul', sku: 'JBL-GOESS-BLU', color: 'Azul', colorCode: '#0071E3', price: 169.00, stock: 45, image: '/Produtos/JBL/JBL Go Essential Azul.webp' },
        { name: 'JBL Go Essential Rosa', sku: 'JBL-GOESS-PNK', color: 'Rosa', colorCode: '#FFB6C1', price: 169.00, stock: 40, image: '/Produtos/JBL/JBL Go Essential Rosa.webp' },
      ]
    },
    {
      name: 'JBL Tune Buds',
      slug: 'jbl-tune-buds',
      description: 'Fones TWS com cancelamento de ruído e som Pure Bass.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 399.00,
      discountPrice: 349.00,
      featured: false,
      images: '/Produtos/JBL/JBL Tune Buds.webp',
      variations: [
        { name: 'JBL Tune Buds Preto', sku: 'JBL-TBUDS-BLK', color: 'Preto', colorCode: '#000000', price: 349.00, stock: 50 },
      ]
    },
    {
      name: 'JBL Wave Buds',
      slug: 'jbl-wave-buds',
      description: 'Fones TWS compactos com design ergonômico e bateria de longa duração.',
      brandSlug: 'jbl',
      categorySlug: 'audio',
      price: 279.00,
      discountPrice: 229.00,
      featured: false,
      images: '/Produtos/JBL/JBL Wave Buds.webp',
      variations: [
        { name: 'JBL Wave Buds Preto', sku: 'JBL-WBUDS-BLK', color: 'Preto', colorCode: '#000000', price: 229.00, stock: 55 },
        { name: 'JBL Wave Buds Branco', sku: 'JBL-WBUDS-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 229.00, stock: 45, image: '/Produtos/JBL/JBL Wave Buds Branco.webp' },
      ]
    },

    // ============= MORE APPLE PRODUCTS =============
    {
      name: 'Mac Pro',
      slug: 'mac-pro',
      description: 'O Mac mais poderoso de todos. Para fluxos de trabalho profissionais extremos.',
      brandSlug: 'apple',
      categorySlug: 'computadores',
      price: 49999.00,
      discountPrice: null,
      featured: false,
      images: '/Produtos/Apple/Mac Pro.png',
      variations: [
        { name: 'Mac Pro M2 Ultra 192GB', sku: 'MACPRO-M2U-192', color: 'Prata', colorCode: '#E5E5EA', storage: '1TB', price: 49999.00, stock: 2 },
        { name: 'Mac Pro M2 Ultra 384GB', sku: 'MACPRO-M2U-384', color: 'Prata', colorCode: '#E5E5EA', storage: '2TB', price: 79999.00, stock: 1 },
      ]
    },
    {
      name: 'Mac Studio',
      slug: 'mac-studio',
      description: 'Poder compacto para criadores. Chip M2 Max ou M2 Ultra em formato compacto.',
      brandSlug: 'apple',
      categorySlug: 'computadores',
      price: 24999.00,
      discountPrice: 22999.00,
      featured: false,
      images: '/Produtos/Apple/MacStudio.png',
      variations: [
        { name: 'Mac Studio M2 Max 32GB 512GB', sku: 'MACSTUDIO-M2M-32', color: 'Prata', colorCode: '#E5E5EA', storage: '512GB', price: 22999.00, stock: 5 },
        { name: 'Mac Studio M2 Ultra 64GB 1TB', sku: 'MACSTUDIO-M2U-64', color: 'Prata', colorCode: '#E5E5EA', storage: '1TB', price: 42999.00, stock: 3 },
      ]
    },
    {
      name: 'Pro Display XDR',
      slug: 'pro-display-xdr',
      description: 'Monitor profissional 6K Retina com tecnologia XDR. Referência para criadores.',
      brandSlug: 'apple',
      categorySlug: 'computadores',
      price: 39999.00,
      discountPrice: null,
      featured: false,
      images: '/Produtos/Apple/Pro Display.png',
      variations: [
        { name: 'Pro Display XDR Vidro Padrão', sku: 'PRODISPLAY-STD', color: 'Prata', colorCode: '#E5E5EA', price: 39999.00, stock: 3 },
        { name: 'Pro Display XDR Nano-texture', sku: 'PRODISPLAY-NANO', color: 'Prata', colorCode: '#E5E5EA', price: 44999.00, stock: 2 },
      ]
    },
    {
      name: 'Studio Display',
      slug: 'studio-display',
      description: 'Monitor 5K Retina de 27" com câmera e alto-falantes integrados.',
      brandSlug: 'apple',
      categorySlug: 'computadores',
      price: 12999.00,
      discountPrice: 11999.00,
      featured: false,
      images: '/Produtos/Apple/Studio Display.png',
      variations: [
        { name: 'Studio Display Vidro Padrão', sku: 'STUDIODISPLAY-STD', color: 'Prata', colorCode: '#E5E5EA', price: 11999.00, stock: 8 },
        { name: 'Studio Display Nano-texture', sku: 'STUDIODISPLAY-NANO', color: 'Prata', colorCode: '#E5E5EA', price: 14999.00, stock: 4 },
      ]
    },
    {
      name: 'Capa MagSafe iPhone',
      slug: 'capa-magsafe-iphone',
      description: 'Capa de silicone com MagSafe integrado. Proteção elegante para seu iPhone.',
      brandSlug: 'apple',
      categorySlug: 'acessorios',
      price: 449.00,
      discountPrice: 399.00,
      featured: false,
      images: '/Produtos/Apple/Capa-Mag.png',
      variations: [
        { name: 'Capa MagSafe Preto', sku: 'CAPA-MAG-BLK', color: 'Preto', colorCode: '#1C1C1E', price: 399.00, stock: 50 },
        { name: 'Capa MagSafe Azul', sku: 'CAPA-MAG-BLU', color: 'Azul', colorCode: '#0071E3', price: 399.00, stock: 40 },
        { name: 'Capa MagSafe Rosa', sku: 'CAPA-MAG-PNK', color: 'Rosa', colorCode: '#FFB6C1', price: 399.00, stock: 35 },
      ]
    },
    {
      name: 'Apple Teclado Magic Keyboard para Mac',
      slug: 'magic-keyboard-mac',
      description: 'Teclado sem fio compacto com Touch ID para Mac com Apple Silicon.',
      brandSlug: 'apple',
      categorySlug: 'acessorios',
      price: 1299.00,
      discountPrice: null,
      featured: false,
      images: '/Produtos/Apple/Teclado.png',
      variations: [
        { name: 'Magic Keyboard com Touch ID Preto', sku: 'MK-TID-BLK', color: 'Preto', colorCode: '#1C1C1E', price: 1299.00, stock: 20 },
        { name: 'Magic Keyboard com Touch ID Branco', sku: 'MK-TID-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 1299.00, stock: 18 },
      ]
    },
    {
      name: 'Apple Magic Trackpad',
      slug: 'magic-trackpad',
      description: 'Trackpad sem fio Multi-Touch com superfície de vidro ampla.',
      brandSlug: 'apple',
      categorySlug: 'acessorios',
      price: 1199.00,
      discountPrice: 999.00,
      featured: false,
      images: '/Produtos/Apple/Mac-Tela.png',
      variations: [
        { name: 'Magic Trackpad Preto', sku: 'MTRACKPAD-BLK', color: 'Preto', colorCode: '#1C1C1E', price: 999.00, stock: 15 },
        { name: 'Magic Trackpad Branco', sku: 'MTRACKPAD-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 999.00, stock: 15 },
      ]
    },

    // ============= SAMSUNG PRODUCTS =============
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'O smartphone Galaxy mais avançado com S Pen integrada e IA Galaxy.',
      brandSlug: 'samsung',
      categorySlug: 'smartphones',
      price: 9499.00,
      discountPrice: 8999.00,
      featured: true,
      images: '/Produtos/Samsung/galaxy-s24-ultra.png',
      variations: [
        { name: 'Galaxy S24 Ultra 256GB Titânio Preto', sku: 'S24U-256-BLK', color: 'Titânio Preto', colorCode: '#1C1C1E', storage: '256GB', price: 8999.00, stock: 10 },
        { name: 'Galaxy S24 Ultra 256GB Titânio Violeta', sku: 'S24U-256-VIO', color: 'Titânio Violeta', colorCode: '#8B5CF6', storage: '256GB', price: 8999.00, stock: 8 },
        { name: 'Galaxy S24 Ultra 512GB Titânio Amarelo', sku: 'S24U-512-YLW', color: 'Titânio Amarelo', colorCode: '#F5A623', storage: '512GB', price: 10499.00, stock: 5 },
      ]
    },
    {
      name: 'Samsung Galaxy Tab S9 Ultra',
      slug: 'samsung-galaxy-tab-s9-ultra',
      description: 'Tablet premium com tela AMOLED de 14.6" e S Pen incluída.',
      brandSlug: 'samsung',
      categorySlug: 'tablets',
      price: 8999.00,
      discountPrice: 7999.00,
      featured: false,
      images: '/Produtos/Samsung/galaxy-tab-s9-ultra.png',
      variations: [
        { name: 'Galaxy Tab S9 Ultra 256GB Grafite', sku: 'TABS9U-256-GRF', color: 'Grafite', colorCode: '#4A4A4A', storage: '256GB', price: 7999.00, stock: 8 },
        { name: 'Galaxy Tab S9 Ultra 512GB Bege', sku: 'TABS9U-512-BGE', color: 'Bege', colorCode: '#F5F5DC', storage: '512GB', price: 9499.00, stock: 5 },
      ]
    },
    {
      name: 'Samsung Galaxy Watch 6 Classic',
      slug: 'samsung-galaxy-watch-6-classic',
      description: 'Smartwatch premium com bisel rotativo e monitoramento avançado de saúde.',
      brandSlug: 'samsung',
      categorySlug: 'smartwatches',
      price: 3499.00,
      discountPrice: 2999.00,
      featured: false,
      images: '/Produtos/Samsung/galaxy-watch-6-classic.png',
      variations: [
        { name: 'Galaxy Watch 6 Classic 43mm Preto', sku: 'GW6C-43-BLK', color: 'Preto', colorCode: '#000000', price: 2999.00, stock: 15 },
        { name: 'Galaxy Watch 6 Classic 47mm Prata', sku: 'GW6C-47-SLV', color: 'Prata', colorCode: '#E5E5EA', price: 3299.00, stock: 12 },
      ]
    },
    {
      name: 'Samsung Galaxy Buds 3 Pro',
      slug: 'samsung-galaxy-buds-3-pro',
      description: 'Fones TWS premium com cancelamento de ruído inteligente e som Hi-Fi.',
      brandSlug: 'samsung',
      categorySlug: 'audio',
      price: 1499.00,
      discountPrice: 1299.00,
      featured: false,
      images: '/Produtos/Samsung/galaxy-buds-3-pro.png',
      variations: [
        { name: 'Galaxy Buds 3 Pro Prata', sku: 'GB3P-SLV', color: 'Prata', colorCode: '#E5E5EA', price: 1299.00, stock: 20 },
        { name: 'Galaxy Buds 3 Pro Branco', sku: 'GB3P-WHT', color: 'Branco', colorCode: '#FFFFFF', price: 1299.00, stock: 18 },
      ]
    },
  ];

  // Create products and variations
  for (const p of productsData) {
    const brand = dbBrands.find(b => b.slug === p.brandSlug);
    const category = dbCategories.find(c => c.slug === p.categorySlug);
    const supplier = dbSuppliers[0];

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.variations.reduce((acc, v) => acc + v.stock, 0),
        images: p.images,
        featured: p.featured,
        brandId: brand?.id,
        categoryId: category?.id,
        supplierId: supplier?.id,
        isActive: true,
        status: 'ACTIVE',
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.variations.reduce((acc, v) => acc + v.stock, 0),
        images: p.images,
        featured: p.featured,
        brandId: brand?.id,
        categoryId: category?.id,
        supplierId: supplier?.id,
        isActive: true,
        status: 'ACTIVE',
      },
    });

    // Delete existing variations and recreate
    await prisma.productVariation.deleteMany({ where: { productId: product.id } });

    for (const v of p.variations) {
      const variation: any = v;
      await prisma.productVariation.create({
        data: {
          productId: product.id,
          name: variation.name,
          sku: variation.sku,
          price: variation.price,
          stock: variation.stock,
          colorName: variation.color,
          colorCode: variation.colorCode,
          storage: variation.storage,
          image: variation.image || p.images,
          condition: variation.condition || 'new',
          status: 'ACTIVE',
          supplierId: supplier?.id,
        },
      });
    }
  }
  console.log('✅ Products & Variations seeded');

  // 6. Sample Orders
  const iphone = await prisma.product.findUnique({ where: { slug: 'iphone-16-pro-max' }, include: { variations: true } });
  
  if (iphone && iphone.variations.length > 0) {
    const variation = iphone.variations[0];
    
    // Delivered order
    await prisma.order.upsert({
      where: { id: 'order-sample-1' },
      update: {},
      create: {
        id: 'order-sample-1',
        userId: admin.id,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'PIX',
        subtotal: variation.price,
        shipping: 0,
        total: variation.price,
        shippingAddress: JSON.stringify({ street: 'Av. Paulista', number: '1000', city: 'São Paulo', state: 'SP', zip: '01310-100' }),
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

    // Pending order
    await prisma.order.upsert({
      where: { id: 'order-sample-2' },
      update: {},
      create: {
        id: 'order-sample-2',
        userId: manager.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CREDIT_CARD',
        subtotal: variation.price * 2,
        shipping: 50,
        total: variation.price * 2 + 50,
        shippingAddress: JSON.stringify({ street: 'Rua Oscar Freire', number: '500', city: 'São Paulo', state: 'SP', zip: '01426-001' }),
        orderItems: {
          create: {
            productId: iphone.id,
            variationId: variation.id,
            quantity: 2,
            price: variation.price,
            productName: variation.name,
            selectedColor: variation.colorName,
            selectedStorage: variation.storage,
          }
        }
      }
    });

    // Processing order
    await prisma.order.upsert({
      where: { id: 'order-sample-3' },
      update: {},
      create: {
        id: 'order-sample-3',
        userId: seller.id,
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        paymentMethod: 'PIX',
        saleType: 'presencial',
        subtotal: variation.price,
        shipping: 0,
        total: variation.price,
        shippingAddress: JSON.stringify({ street: 'Loja Física USS Brasil', number: '1', city: 'São Paulo', state: 'SP' }),
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
  console.log('✅ Orders seeded');

  // 7. Coupons
  const coupons = [
    {
      code: 'BEMVINDO10',
      type: 'PERCENTAGE',
      value: 10,
      description: 'Desconto de boas-vindas para novos clientes',
      minAmount: 200,
      usageLimit: 1000,
      startDate: new Date(),
      endDate: new Date('2025-12-31'),
    },
    {
      code: 'FRETEGRATIS',
      type: 'FREE_SHIPPING',
      value: 0,
      description: 'Frete grátis em compras acima de R$500',
      minAmount: 500,
      usageLimit: 500,
      startDate: new Date(),
      endDate: new Date('2025-12-31'),
    },
    {
      code: 'NATAL2025',
      type: 'PERCENTAGE',
      value: 15,
      description: 'Desconto especial de Natal',
      minAmount: 300,
      usageLimit: 200,
      startDate: new Date(),
      endDate: new Date('2025-12-26'),
    },
    {
      code: 'PIX5',
      type: 'PERCENTAGE',
      value: 5,
      description: 'Desconto extra para pagamento via PIX',
      minAmount: 100,
      usageLimit: null,
      startDate: new Date(),
      endDate: new Date('2026-06-30'),
    },
    {
      code: 'PRIMEIRACOMPRA',
      type: 'FIXED_AMOUNT',
      value: 50,
      description: 'R$50 OFF na primeira compra',
      minAmount: 250,
      usageLimit: 500,
      startDate: new Date(),
      endDate: new Date('2025-12-31'),
    },
    {
      code: 'IPHONE100',
      type: 'FIXED_AMOUNT',
      value: 100,
      description: 'R$100 OFF na compra de iPhones',
      minAmount: 5000,
      usageLimit: 100,
      startDate: new Date(),
      endDate: new Date('2025-12-31'),
    },
    {
      code: 'JBL20',
      type: 'PERCENTAGE',
      value: 20,
      description: '20% OFF em produtos JBL',
      minAmount: 200,
      usageLimit: 150,
      startDate: new Date(),
      endDate: new Date('2025-12-31'),
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
        minAmount: coupon.minAmount,
        usageLimit: coupon.usageLimit,
        usageCount: 0,
        isActive: true,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
      },
    });
  }
  console.log('✅ Coupons seeded (7 coupons)');

  // 8. Reviews
  const iphoneProduct = await prisma.product.findUnique({ where: { slug: 'iphone-16-pro-max' } });
  const airpodsProduct = await prisma.product.findUnique({ where: { slug: 'airpods-max' } });
  const jblProduct = await prisma.product.findUnique({ where: { slug: 'jbl-boombox-3' } });

  if (iphoneProduct) {
    await prisma.review.upsert({
      where: { userId_productId: { userId: admin.id, productId: iphoneProduct.id } },
      update: {},
      create: {
        userId: admin.id,
        productId: iphoneProduct.id,
        rating: 5,
        comment: 'Produto incrível! Chegou antes do prazo e a qualidade é excepcional. Recomendo muito!',
        verified: true,
      },
    });
    await prisma.review.upsert({
      where: { userId_productId: { userId: manager.id, productId: iphoneProduct.id } },
      update: {},
      create: {
        userId: manager.id,
        productId: iphoneProduct.id,
        rating: 5,
        comment: 'Melhor celular que já tive. Câmera sensacional e bateria dura o dia todo.',
        verified: true,
      },
    });
  }

  if (airpodsProduct) {
    await prisma.review.upsert({
      where: { userId_productId: { userId: seller.id, productId: airpodsProduct.id } },
      update: {},
      create: {
        userId: seller.id,
        productId: airpodsProduct.id,
        rating: 5,
        comment: 'Som de altíssima qualidade. Cancelamento de ruído perfeito!',
        verified: true,
      },
    });
  }

  if (jblProduct) {
    await prisma.review.upsert({
      where: { userId_productId: { userId: admin.id, productId: jblProduct.id } },
      update: {},
      create: {
        userId: admin.id,
        productId: jblProduct.id,
        rating: 5,
        comment: 'Potência absurda! Perfeita para festas e churrascos.',
        verified: true,
      },
    });
  }
  console.log('✅ Reviews seeded');

  // Calculate product stats
  const products = await prisma.product.findMany({ include: { reviews: true } });
  for (const product of products) {
    if (product.reviews.length > 0) {
      const avgRating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          rating: avgRating,
          totalReviews: product.reviews.length,
        },
      });
    }
  }

  // Final summary
  const totalProducts = await prisma.product.count();
  const totalVariations = await prisma.productVariation.count();
  const totalUsers = await prisma.user.count();
  const totalOrders = await prisma.order.count();
  const totalCoupons = await prisma.coupon.count();

  console.log('\n🎉 Database seed completed successfully!');
  console.log('═══════════════════════════════════════════════');
  console.log(`📦 Products:    ${totalProducts}`);
  console.log(`🎨 Variations:  ${totalVariations}`);
  console.log(`👥 Users:       ${totalUsers}`);
  console.log(`🛒 Orders:      ${totalOrders}`);
  console.log(`🎟️  Coupons:     ${totalCoupons}`);
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('📋 Admin Credentials:');
  console.log('   Email: admin@ussbrasil.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('🌐 Frontend: https://ussbrasil.pages.dev');
  console.log('🔧 Backend:  https://ussbrasil-api.onrender.com');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
