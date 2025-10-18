import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@etp.gov.br' },
    update: {},
    create: {
      email: 'admin@etp.gov.br',
      nome: 'Administrador Teste',
    },
  });

  console.log('✓ Created user:', usuario.email);

  // Create test project
  const projeto = await prisma.projeto.create({
    data: {
      nome: 'Licitações TI 2025',
      descricao: 'Projeto de teste para desenvolvimento do sistema ETP Constructor',
      cor: '#3b82f6',
      usuarioId: usuario.id,
    },
  });

  console.log('✓ Created project:', projeto.nome);

  // Create sample document
  const documento = await prisma.documento.create({
    data: {
      titulo: 'ETP - Exemplo de Desenvolvimento',
      tipo: 'ETP',
      status: 'RASCUNHO',
      dadosColetados: {
        objeto_contratacao: 'Contratação de serviços de desenvolvimento de software',
        descricao_detalhada:
          'Desenvolvimento de sistema web para gestão de licitações públicas',
      },
      usuarioId: usuario.id,
      projetoId: projeto.id,
    },
  });

  console.log('✓ Created document:', documento.titulo);

  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Users: 1 (${usuario.email})`);
  console.log(`   Projects: 1 (${projeto.nome})`);
  console.log(`   Documents: 1 (${documento.titulo})`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
