#!/bin/bash

# ETP Constructor - Development Helper Script
# Utilitário para facilitar comandos comuns durante o desenvolvimento

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ETP Constructor - Dev Helper        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

show_menu() {
    echo -e "${GREEN}Escolha uma opção:${NC}"
    echo "1. Iniciar Docker (PostgreSQL + Redis)"
    echo "2. Parar Docker"
    echo "3. Ver logs do Docker"
    echo "4. Abrir Prisma Studio"
    echo "5. Aplicar migrations"
    echo "6. Popular banco com dados de teste"
    echo "7. Iniciar backend (NestJS)"
    echo "8. Iniciar frontend (Vite)"
    echo "9. Iniciar tudo (Turborepo)"
    echo "10. Ver status dos serviços"
    echo "0. Sair"
    echo ""
    read -p "Opção: " choice
}

start_docker() {
    echo -e "${YELLOW}Iniciando Docker containers...${NC}"
    docker compose up -d
    echo -e "${GREEN}✓ Docker iniciado${NC}"
}

stop_docker() {
    echo -e "${YELLOW}Parando Docker containers...${NC}"
    docker compose down
    echo -e "${GREEN}✓ Docker parado${NC}"
}

docker_logs() {
    echo -e "${YELLOW}Mostrando logs do Docker (Ctrl+C para sair)...${NC}"
    docker compose logs -f
}

prisma_studio() {
    echo -e "${YELLOW}Abrindo Prisma Studio...${NC}"
    cd apps/backend && npx prisma studio
}

apply_migrations() {
    echo -e "${YELLOW}Aplicando migrations...${NC}"
    cd apps/backend && npx prisma migrate dev
    echo -e "${GREEN}✓ Migrations aplicadas${NC}"
}

seed_database() {
    echo -e "${YELLOW}Populando banco de dados...${NC}"
    cd apps/backend && npx ts-node prisma/seed.ts
    echo -e "${GREEN}✓ Banco populado${NC}"
}

start_backend() {
    echo -e "${YELLOW}Iniciando backend NestJS...${NC}"
    cd apps/backend && pnpm dev
}

start_frontend() {
    echo -e "${YELLOW}Iniciando frontend Vite...${NC}"
    cd apps/web && pnpm dev
}

start_all() {
    echo -e "${YELLOW}Iniciando todos os servidores com Turborepo...${NC}"
    pnpm dev
}

check_status() {
    echo -e "${BLUE}═══ Status dos Serviços ═══${NC}"
    echo ""
    
    # Check Docker
    if docker ps | grep -q "etp-constructor"; then
        echo -e "${GREEN}✓ Docker: Rodando${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}" | grep etp-constructor
    else
        echo -e "${YELLOW}✗ Docker: Parado${NC}"
    fi
    
    echo ""
    
    # Check ports
    echo "Portas em uso:"
    lsof -i :3000 2>/dev/null | grep LISTEN && echo -e "${GREEN}✓ Frontend: http://localhost:3000${NC}" || echo -e "${YELLOW}✗ Frontend: Não rodando${NC}"
    lsof -i :3001 2>/dev/null | grep LISTEN && echo -e "${GREEN}✓ Backend: http://localhost:3001${NC}" || echo -e "${YELLOW}✗ Backend: Não rodando${NC}"
    lsof -i :5432 2>/dev/null | grep LISTEN && echo -e "${GREEN}✓ PostgreSQL: localhost:5432${NC}" || echo -e "${YELLOW}✗ PostgreSQL: Não disponível${NC}"
    lsof -i :6379 2>/dev/null | grep LISTEN && echo -e "${GREEN}✓ Redis: localhost:6379${NC}" || echo -e "${YELLOW}✗ Redis: Não disponível${NC}"
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1) start_docker ;;
        2) stop_docker ;;
        3) docker_logs ;;
        4) prisma_studio ;;
        5) apply_migrations ;;
        6) seed_database ;;
        7) start_backend ;;
        8) start_frontend ;;
        9) start_all ;;
        10) check_status ;;
        0) echo -e "${GREEN}Até logo!${NC}"; exit 0 ;;
        *) echo -e "${YELLOW}Opção inválida${NC}" ;;
    esac
    
    echo ""
    read -p "Pressione Enter para continuar..."
    clear
done
