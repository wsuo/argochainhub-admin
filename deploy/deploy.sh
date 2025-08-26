#!/bin/bash

# ArgoChainHub 前端管理后台一键部署脚本
# 作者: ArgoChainHub Team
# 版本: 1.0

set -e  # 遇到错误立即退出

# 配置信息
SERVER_HOST="100.72.60.117"
SERVER_PORT="2222"
SERVER_USER="wsuo"
SERVER_PATH="/home/wsuo/argochainhub-admin"
LOCAL_PROJECT_PATH="$(cd "$(dirname "$0")/.." && pwd)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "ArgoChainHub 前端管理后台部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -e, --env <dev|prod>     设置部署环境 (默认: prod)"
    echo "  -h, --help              显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                      # 部署到生产环境"
    echo "  $0 -e dev              # 部署到开发环境"
    echo "  $0 --env prod          # 部署到生产环境"
}

# 检查SSH连接
check_ssh_connection() {
    log_info "检查SSH连接..."
    if ssh -p $SERVER_PORT -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST 'exit' 2>/dev/null; then
        log_success "SSH连接正常"
    else
        log_error "SSH连接失败，请检查网络连接和SSH配置"
        exit 1
    fi
}

# 传输源码到服务器
transfer_source() {
    log_info "正在传输源码到服务器..."
    
    # 确保服务器端目录存在
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $SERVER_PATH"
    
    # 传输源码和配置文件（排除node_modules和.next）
    log_info "传输源码文件..."
    rsync -avz --progress --delete \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude 'logs' \
        --exclude '*.log' \
        --exclude '.env.local' \
        -e "ssh -p $SERVER_PORT" \
        "$LOCAL_PROJECT_PATH/" \
        "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
    
    log_success "源码传输完成"
}

# 在服务器上构建项目
build_on_server() {
    log_info "在服务器上构建项目..."
    
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
        set -e
        export PATH=$HOME/nodejs/bin:$PATH
        cd /home/wsuo/argochainhub-admin
        
        echo "设置生产环境变量..."
        rm -f .env.local  # 删除可能存在的.env.local文件
        cp .env.prod .env
        
        echo "安装依赖..."
        npm install --legacy-peer-deps
        
        echo "构建Next.js项目..."
        npm run build
        
        echo "构建完成"
EOF
    
    log_success "服务器端构建完成"
}

# 启动服务
start_service() {
    log_info "启动PM2服务..."
    
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
        set -e
        export PATH=$HOME/nodejs/bin:$PATH
        cd /home/wsuo/argochainhub-admin
        
        echo "创建日志目录..."
        mkdir -p $HOME/logs
        
        echo "重启PM2服务..."
        if pm2 list | grep -q argochainhub-admin; then
            pm2 delete argochainhub-admin
        fi
        pm2 start ecosystem.config.js
        
        echo "等待服务启动..."
        sleep 5
EOF
    
    log_success "服务启动完成"
}


# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "健康检查第 $attempt 次..."
        
        if ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'curl -s http://localhost:3060/ > /dev/null'; then
            log_success "健康检查通过！前端服务运行正常"
            log_success "前端访问地址: https://agro-admin.wsuo.top"
            log_success "本地访问地址: http://localhost:3060"
            return 0
        fi
        
        log_warning "健康检查失败，等待重试..."
        sleep 5
        ((attempt++))
    done
    
    log_error "健康检查失败，服务可能未正常启动"
    return 1
}

# 显示PM2状态
show_pm2_status() {
    log_info "显示PM2服务状态..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'export PATH=$HOME/nodejs/bin:$PATH && pm2 status'
}

# 主函数
main() {
    local env="prod"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                env="$2"
                if [[ "$env" != "dev" && "$env" != "prod" ]]; then
                    log_error "环境参数只能是 dev 或 prod"
                    exit 1
                fi
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo ""
    echo "========================================="
    echo "  ArgoChainHub 前端管理后台自动部署脚本"
    echo "========================================="
    echo "部署环境: $env"
    echo "目标服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
    echo "========================================="
    echo ""
    
    # 执行部署流程
    check_ssh_connection
    transfer_source
    build_on_server
    start_service
    
    if health_check; then
        show_pm2_status
        echo ""
        log_success "🎉 部署完成！"
        echo ""
        echo "📋 访问地址:"
        echo "  前端管理后台: https://agro-admin.wsuo.top"
        echo "  本地测试: http://localhost:3060"
        echo ""
        echo "📊 管理命令:"
        echo "  查看日志: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'export PATH=\$HOME/nodejs/bin:\$PATH && pm2 logs argochainhub-admin'"
        echo "  重启服务: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'export PATH=\$HOME/nodejs/bin:\$PATH && pm2 restart argochainhub-admin'"
        echo "  停止服务: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'export PATH=\$HOME/nodejs/bin:\$PATH && pm2 stop argochainhub-admin'"
        echo ""
    else
        log_error "部署可能存在问题，请检查服务状态"
        exit 1
    fi
}

# 执行主函数
main "$@"