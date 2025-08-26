# ArgoChainHub 前端管理后台部署文档

## 📋 项目信息

### 🌐 服务信息
- **项目名称**: ArgoChainHub 前端管理后台
- **技术栈**: Next.js 15 + TypeScript + Tailwind CSS
- **运行端口**: 3060
- **后端API**: http://localhost:3050/api/v1

### 📍 部署信息
- **服务器**: WSL Ubuntu (100.72.60.117:2222)
- **部署路径**: /home/wsuo/argochainhub-admin
- **运行方式**: PM2 + Node.js
- **进程名称**: argochainhub-admin

## 🚀 一键部署

### 前提条件
1. 确保已安装 pnpm
2. 确保SSH密钥已配置
3. 确保服务器已安装Node.js和PM2

### 部署命令
```bash
# 部署到生产环境（默认）
./deploy/deploy.sh

# 部署到开发环境
./deploy/deploy.sh -e dev

# 显示帮助信息
./deploy/deploy.sh -h
```

### 部署流程
1. **SSH连接检查** - 验证服务器连接
2. **本地构建** - 执行 pnpm build
3. **文件传输** - rsync 同步构建产物
4. **服务器部署** - 安装依赖并启动PM2服务
5. **健康检查** - 验证服务正常运行

## 🔗 访问地址

### 生产环境
- **外网访问**: https://agro-admin.wsuo.top
- **内网访问**: http://localhost:3060

### API集成
- **后端API**: http://localhost:3050/api/v1
- **前端调用**: 使用localhost（同服务器部署）

## 📊 服务管理

### PM2 命令
```bash
# SSH连接到服务器
ssh -p 2222 wsuo@100.72.60.117

# 查看服务状态
export PATH=$HOME/nodejs/bin:$PATH
pm2 status

# 查看日志
pm2 logs argochainhub-admin

# 重启服务
pm2 restart argochainhub-admin

# 停止服务  
pm2 stop argochainhub-admin
```

### 日志文件路径
- **错误日志**: /home/wsuo/logs/argochainhub-admin-error.log
- **输出日志**: /home/wsuo/logs/argochainhub-admin-out.log
- **综合日志**: /home/wsuo/logs/argochainhub-admin-combined.log

## 🔧 配置文件

### 环境变量 (.env.prod)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3050/api/v1
FRONTEND_DEV_PORT=3060
FRONTEND_PROD_PORT=3060
BACKEND_PORT=3050
NODE_ENV=production
```

### PM2配置 (ecosystem.config.js)
- **运行模式**: fork
- **实例数量**: 1
- **内存限制**: 500M
- **自动重启**: 是
- **监控**: 启用

## 🔍 故障排查

### 常见问题
1. **构建失败**
   - 检查依赖安装: `pnpm install`
   - 检查TypeScript错误: `pnpm run build`

2. **服务无法启动**
   - 检查端口占用: `lsof -i:3060`
   - 查看PM2日志: `pm2 logs argochainhub-admin`

3. **API连接问题**
   - 确认后端服务运行: `curl http://localhost:3050/api/v1/`
   - 检查环境变量配置

### 健康检查
```bash
# 检查前端服务
curl http://localhost:3060/

# 检查后端API
curl http://localhost:3050/api/v1/
```

## 📞 技术支持

### 常用操作
```bash
# 快速重新部署
./deploy/deploy.sh

# 查看实时日志
ssh -p 2222 wsuo@100.72.60.117 'export PATH=$HOME/nodejs/bin:$PATH && pm2 logs argochainhub-admin --lines 50'

# 重启所有服务
ssh -p 2222 wsuo@100.72.60.117 'export PATH=$HOME/nodejs/bin:$PATH && pm2 restart all'
```

---

**最后更新**: 2025-08-23  
**文档维护**: ArgoChainHub DevOps Team