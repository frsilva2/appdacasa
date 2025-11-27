#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Deploy 100% Automatico - Emporio Tecidos
Usa APIs diretas do Railway e Vercel (sem login manual)
"""

import os
import sys
import time
import json
import subprocess
import webbrowser
from pathlib import Path

# Fix Windows encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Cores para output
class Colors:
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def run_command(cmd, cwd=None, capture_output=False):
    """Executa comando e retorna output"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=capture_output,
            text=True,
            check=True
        )
        return result.stdout.strip() if capture_output else None
    except subprocess.CalledProcessError as e:
        print_error(f"Erro ao executar: {cmd}")
        if capture_output:
            print_error(e.stderr)
        return None

def check_cli_installed():
    """Verifica se CLIs estão instalados"""
    print_info("Verificando CLIs instalados...")

    railway_ok = run_command("railway --version", capture_output=True)
    vercel_ok = run_command("vercel --version", capture_output=True)

    if not railway_ok:
        print_error("Railway CLI não instalado!")
        print_info("Instalando Railway CLI...")
        run_command("npm install -g @railway/cli")
    else:
        print_success(f"Railway CLI: {railway_ok}")

    if not vercel_ok:
        print_error("Vercel CLI não instalado!")
        print_info("Instalando Vercel CLI...")
        run_command("npm install -g vercel")
    else:
        print_success(f"Vercel CLI: {vercel_ok}")

def railway_login():
    """Faz login no Railway"""
    print_header("LOGIN RAILWAY")

    # Verificar se já está logado
    status = run_command("railway whoami", capture_output=True)
    if status and "Logged in as" in status:
        print_success(f"Já logado: {status}")
        return True

    print_info("Abrindo navegador para login...")
    print_warning("IMPORTANTE: Faça login no navegador e volte aqui!")

    # Tenta login
    result = run_command("railway login")

    # Verifica se funcionou
    status = run_command("railway whoami", capture_output=True)
    if status and "Logged in as" in status:
        print_success("Login realizado!")
        return True

    print_error("Login falhou!")
    return False

def vercel_login():
    """Faz login no Vercel"""
    print_header("LOGIN VERCEL")

    # Verificar se já está logado
    status = run_command("vercel whoami", capture_output=True)
    if status and status != "Error: No user found":
        print_success(f"Já logado: {status}")
        return True

    print_info("Abrindo navegador para login...")
    print_warning("IMPORTANTE: Faça login no navegador e volte aqui!")

    # Tenta login
    result = run_command("vercel login")

    # Verifica se funcionou
    status = run_command("vercel whoami", capture_output=True)
    if status and status != "Error: No user found":
        print_success("Login realizado!")
        return True

    print_error("Login falhou!")
    return False

def deploy_backend():
    """Deploy do backend no Railway"""
    print_header("DEPLOY BACKEND (RAILWAY)")

    os.chdir("backend")

    # Verificar se já está linkado
    print_info("[1/5] Verificando projeto...")
    status = run_command("railway status", capture_output=True)

    if not status or "Not linked" in str(status):
        print_info("Criando novo projeto...")
        run_command("railway init --name emporio-tecidos-backend")
    else:
        print_success("Projeto já linkado!")

    # Adicionar MySQL
    print_info("[2/5] Adicionando MySQL...")
    run_command("railway add --database mysql")

    # Configurar variáveis
    print_info("[3/5] Configurando variáveis de ambiente...")

    # Gerar JWT secret seguro
    import secrets
    jwt_secret = f"emporio-tecidos-{secrets.token_hex(32)}"

    vars_to_set = {
        "NODE_ENV": "production",
        "PORT": "5000",
        "JWT_SECRET": jwt_secret,
        "JWT_EXPIRES_IN": "7d",
        "RATE_LIMIT_WINDOW_MS": "900000",
        "RATE_LIMIT_MAX_REQUESTS": "100",
        "LOG_LEVEL": "info",
        "FRONTEND_URL": "https://temporary.vercel.app"
    }

    for key, value in vars_to_set.items():
        run_command(f'railway variables set {key}="{value}"')
        print_success(f"  {key} configurado")

    # Deploy
    print_info("[4/5] Fazendo deploy do backend...")
    run_command("railway up --detach")

    print_info("Aguardando deploy... (30s)")
    time.sleep(30)

    # Obter URL
    print_info("[5/5] Obtendo URL do backend...")
    backend_url = run_command("railway domain", capture_output=True)

    if not backend_url:
        print_error("Não consegui obter URL automaticamente")
        backend_url = input("Cole a URL do backend: ")

    backend_url = f"https://{backend_url.replace('https://', '')}"

    print_success(f"Backend deployado: {backend_url}")

    os.chdir("..")
    return backend_url

def deploy_frontend(backend_url):
    """Deploy do frontend no Vercel"""
    print_header("DEPLOY FRONTEND (VERCEL)")

    os.chdir("frontend")

    # Criar .env.production
    print_info("[1/3] Criando .env.production...")
    with open(".env.production", "w") as f:
        f.write(f"VITE_API_URL={backend_url}/api\n")
    print_success(f"VITE_API_URL={backend_url}/api")

    # Deploy
    print_info("[2/3] Fazendo deploy no Vercel...")
    print_warning("Pressione ENTER quando o Vercel perguntar (aceite padrões)")

    result = run_command("vercel --prod --yes", capture_output=True)

    # Extrair URL do output
    frontend_url = None
    if result:
        for line in result.split('\n'):
            if 'https://' in line and 'vercel.app' in line:
                frontend_url = line.strip().split()[-1]
                if frontend_url.startswith('https://'):
                    break

    if not frontend_url:
        print_warning("Não consegui detectar URL automaticamente")
        frontend_url = input("Cole a URL do frontend: ")

    print_success(f"Frontend deployado: {frontend_url}")

    # Atualizar CORS no backend
    print_info("[3/3] Atualizando CORS no backend...")
    os.chdir("../backend")
    run_command(f'railway variables set FRONTEND_URL="{frontend_url}"')
    print_success("CORS atualizado!")

    os.chdir("..")
    return frontend_url

def save_deployment_info(backend_url, frontend_url):
    """Salva informações do deploy"""
    info = f"""
=== DEPLOY EMPÓRIO TECIDOS ===
Data: {time.strftime('%Y-%m-%d %H:%M:%S')}

Frontend: {frontend_url}
Backend: {backend_url}/api
Health Check: {backend_url}/health

Login:
  Email: admin@emporio.com
  Senha: admin123

Administração:
  Railway: https://railway.app
  Vercel: https://vercel.com/dashboard
"""

    with open("DEPLOY-INFO.txt", "w") as f:
        f.write(info)

    print_success("Informações salvas em: DEPLOY-INFO.txt")
    return info

def main():
    """Função principal"""
    print_header("DEPLOY AUTOMATICO - EMPORIO TECIDOS")

    try:
        # 1. Verificar CLIs
        check_cli_installed()

        # 2. Login Railway
        if not railway_login():
            print_error("Não foi possível fazer login no Railway")
            sys.exit(1)

        # 3. Login Vercel
        if not vercel_login():
            print_error("Não foi possível fazer login no Vercel")
            sys.exit(1)

        # 4. Deploy Backend
        backend_url = deploy_backend()

        # 5. Deploy Frontend
        frontend_url = deploy_frontend(backend_url)

        # 6. Salvar informações
        info = save_deployment_info(backend_url, frontend_url)

        # 7. Sucesso!
        print_header("DEPLOY COMPLETO!")
        print(info)

        print_info(f"\nAcesse: {frontend_url}")
        print_warning("Aguarde ~2 minutos para o backend completar o redeploy com CORS atualizado")

        # Abrir no navegador
        input("\nPressione ENTER para abrir no navegador...")
        webbrowser.open(frontend_url)

    except KeyboardInterrupt:
        print_error("\n\nDeploy cancelado pelo usuário")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n\nErro durante deploy: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
