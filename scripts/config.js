// 构建脚本配置文件
import { APP_CONFIG } from './lib/config.js'

export const getDevScript = () => `next dev -p ${APP_CONFIG.PORTS.FRONTEND_DEV}`
export const getStartScript = () => `next start -p ${APP_CONFIG.PORTS.FRONTEND_PROD}`

export default {
  dev: getDevScript(),
  start: getStartScript(),
}