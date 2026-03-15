import { useState, useEffect } from 'react';
import { getStatus } from './api';

// ---------------------------------------------------------------------------
// Translation dictionaries
// ---------------------------------------------------------------------------

export type Locale = 'en' | 'zh';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.agent': 'Agent',
    'nav.tools': 'Tools',
    'nav.cron': 'Scheduled Jobs',
    'nav.integrations': 'Integrations',
    'nav.memory': 'Memory',
    'nav.config': 'Configuration',
    'nav.cost': 'Cost Tracker',
    'nav.logs': 'Logs',
    'nav.doctor': 'Doctor',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.provider': 'Provider',
    'dashboard.model': 'Model',
    'dashboard.uptime': 'Uptime',
    'dashboard.temperature': 'Temperature',
    'dashboard.gateway_port': 'Gateway Port',
    'dashboard.locale': 'Locale',
    'dashboard.memory_backend': 'Memory Backend',
    'dashboard.paired': 'Paired',
    'dashboard.provider_model': 'Provider / Model',
    'dashboard.since_restart': 'Since last restart',
    'dashboard.cost_overview': 'Cost Overview',
    'dashboard.no_channels': 'No channels configured',
    'dashboard.no_components': 'No components reporting',
    'dashboard.load_error': 'Failed to load dashboard',
    'dashboard.channels': 'Channels',
    'dashboard.health': 'Health',
    'dashboard.status': 'Status',
    'dashboard.overview': 'Overview',
    'dashboard.system_info': 'System Information',
    'dashboard.quick_actions': 'Quick Actions',

    // Agent / Chat
    'agent.title': 'Agent Chat',
    'agent.send': 'Send',
    'agent.placeholder': 'Type a message...',
    'agent.connecting': 'Connecting...',
    'agent.connected': 'Connected',
    'agent.disconnected': 'Disconnected',
    'agent.reconnecting': 'Reconnecting...',
    'agent.thinking': 'Thinking...',
    'agent.tool_call': 'Tool Call',
    'agent.tool_result': 'Tool Result',

    // Tools
    'tools.title': 'Available Tools',
    'tools.name': 'Name',
    'tools.description': 'Description',
    'tools.parameters': 'Parameters',
    'tools.search': 'Search tools...',
    'tools.empty': 'No tools available.',
    'tools.count': 'Total tools',

    // Cron
    'cron.title': 'Scheduled Jobs',
    'cron.add': 'Add Job',
    'cron.delete': 'Delete',
    'cron.enable': 'Enable',
    'cron.disable': 'Disable',
    'cron.name': 'Name',
    'cron.command': 'Command',
    'cron.schedule': 'Schedule',
    'cron.next_run': 'Next Run',
    'cron.last_run': 'Last Run',
    'cron.last_status': 'Last Status',
    'cron.enabled': 'Enabled',
    'cron.empty': 'No scheduled jobs.',
    'cron.confirm_delete': 'Are you sure you want to delete this job?',

    // Integrations
    'integrations.title': 'Integrations',
    'integrations.available': 'Available',
    'integrations.active': 'Active',
    'integrations.coming_soon': 'Coming Soon',
    'integrations.category': 'Category',
    'integrations.status': 'Status',
    'integrations.search': 'Search integrations...',
    'integrations.empty': 'No integrations found.',
    'integrations.activate': 'Activate',
    'integrations.deactivate': 'Deactivate',

    // Memory
    'memory.title': 'Memory Store',
    'memory.search': 'Search memory...',
    'memory.add': 'Store Memory',
    'memory.delete': 'Delete',
    'memory.key': 'Key',
    'memory.content': 'Content',
    'memory.category': 'Category',
    'memory.timestamp': 'Timestamp',
    'memory.session': 'Session',
    'memory.score': 'Score',
    'memory.empty': 'No memory entries found.',
    'memory.confirm_delete': 'Are you sure you want to delete this memory entry?',
    'memory.all_categories': 'All Categories',

    // Config
    'config.title': 'Configuration',
    'config.save': 'Save',
    'config.reset': 'Reset',
    'config.saved': 'Configuration saved successfully.',
    'config.error': 'Failed to save configuration.',
    'config.loading': 'Loading configuration...',
    'config.editor_placeholder': 'TOML configuration...',

    // Cost
    'cost.title': 'Cost Tracker',
    'cost.session': 'Session Cost',
    'cost.daily': 'Daily Cost',
    'cost.monthly': 'Monthly Cost',
    'cost.total_tokens': 'Total Tokens',
    'cost.request_count': 'Requests',
    'cost.by_model': 'Cost by Model',
    'cost.model': 'Model',
    'cost.tokens': 'Tokens',
    'cost.requests': 'Requests',
    'cost.usd': 'Cost (USD)',

    // Logs
    'logs.title': 'Live Logs',
    'logs.clear': 'Clear',
    'logs.pause': 'Pause',
    'logs.resume': 'Resume',
    'logs.filter': 'Filter logs...',
    'logs.empty': 'No log entries.',
    'logs.connected': 'Connected to event stream.',
    'logs.disconnected': 'Disconnected from event stream.',

    // Doctor
    'doctor.title': 'System Diagnostics',
    'doctor.run': 'Run Diagnostics',
    'doctor.running': 'Running diagnostics...',
    'doctor.ok': 'OK',
    'doctor.warn': 'Warning',
    'doctor.error': 'Error',
    'doctor.severity': 'Severity',
    'doctor.category': 'Category',
    'doctor.message': 'Message',
    'doctor.empty': 'No diagnostics have been run yet.',
    'doctor.summary': 'Diagnostic Summary',

    // Auth / Pairing
    'auth.pair': 'Pair Device',
    'auth.pairing_code': 'Pairing Code',
    'auth.pair_button': 'Pair',
    'auth.logout': 'Logout',
    'auth.pairing_success': 'Pairing successful!',
    'auth.pairing_failed': 'Pairing failed. Please try again.',
    'auth.enter_code': 'Enter your pairing code to connect to the agent.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred.',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.search': 'Search...',
    'common.no_data': 'No data available.',
    'common.refresh': 'Refresh',
    'common.back': 'Back',
    'common.actions': 'Actions',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.status': 'Status',
    'common.status_active': 'Active',
    'common.status_inactive': 'Inactive',
    'common.created': 'Created',
    'common.updated': 'Updated',

    // Health
    'health.title': 'System Health',
    'health.component': 'Component',
    'health.status': 'Status',
    'health.last_ok': 'Last OK',
    'health.last_error': 'Last Error',
    'health.restart_count': 'Restarts',
    'health.pid': 'Process ID',
    'health.uptime': 'Uptime',
    'health.updated_at': 'Last Updated',
  },

  zh: {
    // Navigation
    'nav.dashboard': '仪表盘',
    'nav.agent': '智能体',
    'nav.tools': '工具',
    'nav.cron': '定时任务',
    'nav.integrations': '集成',
    'nav.memory': '记忆',
    'nav.config': '配置',
    'nav.cost': '成本追踪',
    'nav.logs': '日志',
    'nav.doctor': '诊断',

    // Dashboard
    'dashboard.title': '仪表盘',
    'dashboard.provider': '提供商',
    'dashboard.model': '模型',
    'dashboard.uptime': '运行时间',
    'dashboard.temperature': '温度',
    'dashboard.gateway_port': '网关端口',
    'dashboard.locale': '语言区域',
    'dashboard.memory_backend': '记忆后端',
    'dashboard.paired': '已配对',
    'dashboard.provider_model': '提供商 / 模型',
    'dashboard.since_restart': '自上次重启以来',
    'dashboard.cost_overview': '成本概览',
    'dashboard.no_channels': '未配置渠道',
    'dashboard.no_components': '无组件报告',
    'dashboard.load_error': '无法加载仪表盘',
    'dashboard.channels': '渠道',
    'dashboard.health': '健康状态',
    'dashboard.status': '状态',
    'dashboard.overview': '概览',
    'dashboard.system_info': '系统信息',
    'dashboard.quick_actions': '快速操作',

    // Agent / Chat
    'agent.title': '智能体对话',
    'agent.send': '发送',
    'agent.placeholder': '输入消息...',
    'agent.connecting': '正在连接...',
    'agent.connected': '已连接',
    'agent.disconnected': '已断开连接',
    'agent.reconnecting': '正在重新连接...',
    'agent.thinking': '正在思考...',
    'agent.tool_call': '工具调用',
    'agent.tool_result': '工具结果',

    // Tools
    'tools.title': '可用工具',
    'tools.name': '名称',
    'tools.description': '描述',
    'tools.parameters': '参数',
    'tools.search': '搜索工具...',
    'tools.empty': '无可用工具。',
    'tools.count': '工具总数',

    // Cron
    'cron.title': '定时任务',
    'cron.add': '添加任务',
    'cron.delete': '删除',
    'cron.enable': '启用',
    'cron.disable': '禁用',
    'cron.name': '名称',
    'cron.command': '命令',
    'cron.schedule': '调度',
    'cron.next_run': '下次运行',
    'cron.last_run': '上次运行',
    'cron.last_status': '上次状态',
    'cron.enabled': '已启用',
    'cron.empty': '无定时任务。',
    'cron.confirm_delete': '您确定要删除此任务吗？',

    // Integrations
    'integrations.title': '集成',
    'integrations.available': '可用',
    'integrations.active': '已激活',
    'integrations.coming_soon': '敬请期待',
    'integrations.category': '类别',
    'integrations.status': '状态',
    'integrations.search': '搜索集成...',
    'integrations.empty': '未找到集成。',
    'integrations.activate': '激活',
    'integrations.deactivate': '停用',

    // Memory
    'memory.title': '记忆库',
    'memory.search': '搜索记忆...',
    'memory.add': '存储记忆',
    'memory.delete': '删除',
    'memory.key': '键值',
    'memory.content': '内容',
    'memory.category': '类别',
    'memory.timestamp': '时间戳',
    'memory.session': '会话',
    'memory.score': '评分',
    'memory.empty': '未找到记忆条目。',
    'memory.confirm_delete': '您确定要删除此记忆条目吗？',
    'memory.all_categories': '所有类别',

    // Config
    'config.title': '配置',
    'config.save': '保存',
    'config.reset': '重置',
    'config.saved': '配置保存成功。',
    'config.error': '保存配置失败。',
    'config.loading': '正在加载配置...',
    'config.editor_placeholder': 'TOML 配置...',

    // Cost
    'cost.title': '成本追踪',
    'cost.session': '会话成本',
    'cost.daily': '当日成本',
    'cost.monthly': '当月成本',
    'cost.total_tokens': 'Token 总数',
    'cost.request_count': '请求数',
    'cost.by_model': '按模型统计成本',
    'cost.model': '模型',
    'cost.tokens': 'Token 数',
    'cost.requests': '请求数',
    'cost.usd': '成本 (USD)',

    // Logs
    'logs.title': '实时日志',
    'logs.clear': '清除',
    'logs.pause': '暂停',
    'logs.resume': '继续',
    'logs.filter': '过滤日志...',
    'logs.empty': '无日志条目。',
    'logs.connected': '已连接到事件流。',
    'logs.disconnected': '已从事件流断开。',

    // Doctor
    'doctor.title': '系统诊断',
    'doctor.run': '运行诊断',
    'doctor.running': '正在运行诊断...',
    'doctor.ok': '正常',
    'doctor.warn': '警告',
    'doctor.error': '错误',
    'doctor.severity': '严重程度',
    'doctor.category': '类别',
    'doctor.message': '消息',
    'doctor.empty': '尚未运行诊断。',
    'doctor.summary': '诊断摘要',

    // Auth / Pairing
    'auth.pair': '配对设备',
    'auth.pairing_code': '配对码',
    'auth.pair_button': '配对',
    'auth.logout': '退出登录',
    'auth.pairing_success': '配对成功！',
    'auth.pairing_failed': '配对失败。请重试。',
    'auth.enter_code': '输入配对码以连接到智能体。',

    // Common
    'common.loading': '加载中...',
    'common.error': '发生错误。',
    'common.retry': '重试',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.close': '关闭',
    'common.yes': '是',
    'common.no': '否',
    'common.search': '搜索...',
    'common.no_data': '无可用数据。',
    'common.refresh': '刷新',
    'common.back': '返回',
    'common.actions': '操作',
    'common.name': '名称',
    'common.description': '描述',
    'common.status': '状态',
    'common.status_active': '活跃',
    'common.status_inactive': '不活跃',
    'common.created': '创建时间',
    'common.updated': '更新时间',

    // Health
    'health.title': '系统健康',
    'health.component': '组件',
    'health.status': '状态',
    'health.last_ok': '上次正常时间',
    'health.last_error': '上次错误时间',
    'health.restart_count': '重启次数',
    'health.pid': '进程 ID',
    'health.uptime': '运行时间',
    'health.updated_at': '上次更新时间',
  },
};

// ---------------------------------------------------------------------------
// Current locale state
// ---------------------------------------------------------------------------

let currentLocale: Locale = 'zh';

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

// ---------------------------------------------------------------------------
// Translation function
// ---------------------------------------------------------------------------

/**
 * Translate a key using the current locale. Returns the key itself if no
 * translation is found.
 */
export function t(key: string): string {
  return translations[currentLocale]?.[key] ?? translations.en[key] ?? key;
}

/**
 * Get the translation for a specific locale. Falls back to English, then to the
 * raw key.
 */
export function tLocale(key: string, locale: Locale): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

/**
 * React hook that fetches the locale from /api/status on mount and keeps the
 * i18n module in sync. Returns the current locale and a `t` helper bound to it.
 */
export function useLocale(): { locale: Locale; t: (key: string) => string } {
  const [locale, setLocaleState] = useState<Locale>(currentLocale);

  useEffect(() => {
    let cancelled = false;

    getStatus()
      .then((status) => {
        if (cancelled) return;
        const normalizedLocale = status.locale?.toLowerCase() || '';
        let detected: Locale = 'zh';

        if (normalizedLocale.startsWith('en')) {
          detected = 'en';
        }

        setLocale(detected);
        setLocaleState(detected);
      })
      .catch(() => {
        // Keep default locale on error
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    locale,
    t: (key: string) => tLocale(key, locale),
  };
}

