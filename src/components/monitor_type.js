// 报警类型
export const monitorType = {
  '40000': 'storm异常',
  '40100': 'ES组件异常',
  '40106': 'LNMP组件异常',
  '40120': 'firewall组件异常',
  '40300': '无日志',
  '40301': 'kafka到ES流程异常',
  '40310': '日志流量异常',
  '40320': 'storm日志丢失',
  '40400': '无拦截流量',
  '40500': '配置错误',
  '43200': '聚类失败',
  '43210': 'mlad组件异常',
  '43211': 'mlad无聚类',
  '45000': '整体负载过高',
  '45200': '内存使用过高',
  '45300': '磁盘使用过高',
  '40406': '拦截器规则过多',
  '45001': 'ansible执行失败',
  '45002': '云端升级异常',
  '40121': 'storm内存溢出',
  '45003': 'ansible语法出错'
}
export const atd_monitor = [
  '40000',
  '40100',
  '40106',
  '40500',
  '40120',
  '40300',
  '40310',
  '40320',
  '40400',
  '40301',
  '40406',
  '40121',
]
export const deep_monitor = [
  '43200',
  '43210',
  '43211',
]
export const op_monitor = [
  '45000',
  '45200',
  '45300',
  '45001',
  '45002',
  '45003',
]
export const interface_monitior = [
]
export const web_monitor = [
]
// 报警大类
export const monitorName = {
  '1': '报警监控',
  '2': '深度引擎监控',
  '4': '系统监控',
  '1024': '前端接口监控',
  '2048': '前端UI监控',
}
// 各大类对应
export const type_content = {
  '1': atd_monitor,
  '2': deep_monitor,
  '4': op_monitor,
  '1024': interface_monitior,
  '2048': web_monitor,
}
