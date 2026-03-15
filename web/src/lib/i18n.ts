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
    'agent.welcome_title': 'RustClaw Agent',
    'agent.welcome_subtitle': 'Send a message to start the conversation',
    'agent.error_send': 'Failed to send message. Please try again.',
    'agent.error_connection': 'Connection error. Attempting to reconnect...',
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
    'tools.agent_tools': 'Agent Tools',
    'tools.cli_tools': 'CLI Tools',
    'tools.no_tools': 'No tools match your search.',
    'tools.parameter_schema': 'Parameter Schema',
    'tools.path': 'Path',
    'tools.version': 'Version',
    'tools.load_error': 'Failed to load tools',

    // Cron
    'cron.title': 'Scheduled Jobs',
    'cron.add': 'Add Job',
    'cron.adding': 'Adding...',
    'cron.delete': 'Delete',
    'cron.delete_confirm': 'Delete?',
    'cron.enable': 'Enable',
    'cron.disable': 'Disable',
    'cron.status_enabled': 'Enabled',
    'cron.status_disabled': 'Disabled',
    'cron.name': 'Name',
    'cron.command': 'Command',
    'cron.schedule': 'Schedule',
    'cron.next_run': 'Next Run',
    'cron.last_run': 'Last Run',
    'cron.last_status': 'Last Status',
    'cron.enabled': 'Enabled',
    'cron.empty': 'No scheduled jobs.',
    'cron.no_tasks': 'No scheduled tasks configured.',
    'cron.scheduled_tasks': 'Scheduled Tasks',
    'cron.add_job_title': 'Add Cron Job',
    'cron.form_name': 'Name (optional)',
    'cron.form_schedule': 'Schedule',
    'cron.form_command': 'Command',
    'cron.form_error_required': 'Schedule and command are required.',
    'cron.form_error_add': 'Failed to add job',
    'cron.load_error': 'Failed to load cron jobs',
    'cron.id': 'ID',
    'cron.history_loading': 'Loading run history...',
    'cron.history_load_error': 'Failed to load run history',
    'cron.history_empty': 'No runs recorded yet.',
    'cron.history_recent': 'Recent Runs',
    'cron.history_refresh': 'Refresh runs',
    'cron.history_duration': 'Duration',
    'cron.confirm_delete': 'Are you sure you want to delete this job?',

    // Integrations
    'integrations.title': 'Integrations',
    'integrations.available': 'Available',
    'integrations.active': 'Active',
    'integrations.coming_soon': 'Coming Soon',
    'integrations.category': 'Category',
    'integrations.all_categories': 'All Categories',
    'integrations.load_error': 'Failed to load integrations',
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
    'memory.no_entries': 'No memory entries found.',
    'memory.add_memory_title': 'Add Memory',
    'memory.form_key': 'Key',
    'memory.form_content': 'Content',
    'memory.form_category': 'Category (optional)',
    'memory.form_error_required': 'Key and content are required.',
    'memory.form_error_add': 'Failed to store memory',
    'memory.form_error_delete': 'Failed to delete memory',
    'memory.load_error': 'Failed to load memory',
    'memory.saving': 'Saving...',
    'memory.search_placeholder': 'Search memory entries...',
    'memory.delete_confirm': 'Delete?',
    'memory.confirm_delete': 'Are you sure you want to delete this memory entry?',
    'memory.all_categories': 'All Categories',

    // Config
    'config.title': 'Configuration',
    'config.save': 'Save',
    'config.saving': 'Saving...',
    'config.reset': 'Reset',
    'config.saved': 'Configuration saved successfully.',
    'config.error': 'Failed to save configuration.',
    'config.loading': 'Loading configuration...',
    'config.sensitive_note': 'Sensitive fields are masked',
    'config.sensitive_desc': 'API keys, tokens, and passwords are hidden for security. To update a masked field, replace the entire masked value with your new value.',
    'config.editor_title': 'TOML Configuration',
    'config.lines': 'lines',
    'config.editor_placeholder': 'TOML configuration...',

    // Cost
    'cost.title': 'Cost Tracker',
    'cost.session': 'Session Cost',
    'cost.daily': 'Daily Cost',
    'cost.monthly': 'Monthly Cost',
    'cost.total_tokens': 'Total Tokens',
    'cost.request_count': 'Requests',
    'cost.total_requests': 'Total Requests',
    'cost.token_stats': 'Token Statistics',
    'cost.avg_tokens': 'Avg Tokens / Request',
    'cost.cost_per_1k': 'Cost per 1K Tokens',
    'cost.model_breakdown': 'Model Breakdown',
    'cost.share': 'Share',
    'cost.no_data': 'No cost data available.',
    'cost.load_error': 'Failed to load cost data',
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
    'logs.live_logs': 'Live Logs',
    'logs.events': 'events',
    'logs.jump_to_bottom': 'Jump to bottom',
    'logs.filter_by_type': 'Filter:',
    'logs.clear_filters': 'Clear',
    'logs.waiting': 'Waiting for events...',
    'logs.paused_message': 'Log streaming is paused.',
    'logs.filter': 'Filter logs...',
    'logs.empty': 'No log entries.',
    'logs.connected': 'Connected to event stream.',
    'logs.disconnected': 'Disconnected from event stream.',

    // Doctor
    'doctor.title': 'System Diagnostics',
    'doctor.run': 'Run Diagnostics',
    'doctor.running': 'Running...',
    'doctor.ok': 'OK',
    'doctor.warn': 'Warning',
    'doctor.warnings': 'Warnings',
    'doctor.error': 'Error',
    'doctor.errors': 'Errors',
    'doctor.issues_found': 'Issues Found',
    'doctor.all_clear': 'All Clear',
    'doctor.empty_title': 'System Diagnostics',
    'doctor.empty_desc': 'Click "Run Diagnostics" to check your RustClaw installation.',
    'doctor.loading_desc': 'Running diagnostics...',
    'doctor.loading_time_note': 'This may take a few seconds.',
    'doctor.error_run': 'Failed to run diagnostics',
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
    'agent.welcome_title': 'RustClaw 智能体',
    'agent.welcome_subtitle': '发送消息以开始对话',
    'agent.error_send': '发送消息失败，请重试。',
    'agent.error_connection': '连接错误，正在尝试重新连接...',
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
    'tools.agent_tools': '智能体工具',
    'tools.cli_tools': 'CLI 工具',
    'tools.no_tools': '没有匹配搜索的工具。',
    'tools.parameter_schema': '参数 Schema',
    'tools.path': '路径',
    'tools.version': '版本',
    'tools.load_error': '加载工具失败',

    // Cron
    'cron.title': '定时任务',
    'cron.add': '添加任务',
    'cron.adding': '正在添加...',
    'cron.delete': '删除',
    'cron.delete_confirm': '确定删除？',
    'cron.enable': '启用',
    'cron.disable': '禁用',
    'cron.status_enabled': '已启用',
    'cron.status_disabled': '已禁用',
    'cron.name': '名称',
    'cron.command': '命令',
    'cron.schedule': '调度',
    'cron.next_run': '下次运行',
    'cron.last_run': '上次运行',
    'cron.last_status': '上次状态',
    'cron.enabled': '已启用',
    'cron.empty': '无定时任务。',
    'cron.no_tasks': '尚未配置定时任务。',
    'cron.scheduled_tasks': '定时任务',
    'cron.add_job_title': '添加定时任务',
    'cron.form_name': '名称（可选）',
    'cron.form_schedule': '调度',
    'cron.form_command': '命令',
    'cron.form_error_required': '调度和命令是必填项。',
    'cron.form_error_add': '添加任务失败',
    'cron.load_error': '加载定时任务失败',
    'cron.id': 'ID',
    'cron.history_loading': '正在加载运行历史...',
    'cron.history_load_error': '加载运行历史失败',
    'cron.history_empty': '尚未记录运行。',
    'cron.history_recent': '最近运行',
    'cron.history_refresh': '刷新运行',
    'cron.history_duration': '耗时',
    'cron.confirm_delete': '您确定要删除此任务吗？',

    // Integrations
    'integrations.title': '集成',
    'integrations.available': '可用',
    'integrations.active': '已激活',
    'integrations.coming_soon': '敬请期待',
    'integrations.category': '类别',
    'integrations.all_categories': '所有类别',
    'integrations.load_error': '加载集成失败',
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
    'memory.no_entries': '未找到记忆条目。',
    'memory.add_memory_title': '添加记忆',
    'memory.form_key': '键值',
    'memory.form_content': '内容',
    'memory.form_category': '类别（可选）',
    'memory.form_error_required': '键值和内容是必填项。',
    'memory.form_error_add': '存储记忆失败',
    'memory.form_error_delete': '删除记忆失败',
    'memory.load_error': '加载记忆失败',
    'memory.saving': '正在保存...',
    'memory.search_placeholder': '搜索记忆条目...',
    'memory.delete_confirm': '确定删除？',
    'memory.confirm_delete': '您确定要删除此记忆条目吗？',
    'memory.all_categories': '所有类别',

    // Config
    'config.title': '配置',
    'config.save': '保存',
    'config.saving': '正在保存...',
    'config.reset': '重置',
    'config.saved': '配置保存成功。',
    'config.error': '保存配置失败。',
    'config.loading': '正在加载配置...',
    'config.sensitive_note': '敏感字段已脱敏',
    'config.sensitive_desc': 'API 密钥、令牌和密码为了安全已隐藏。要更新脱敏字段，请用您的新值替换整个脱敏值。',
    'config.editor_title': 'TOML 配置',
    'config.lines': '行',
    'config.editor_placeholder': 'TOML 配置...',

    // Cost
    'cost.title': '成本追踪',
    'cost.session': '会话成本',
    'cost.daily': '当日成本',
    'cost.monthly': '当月成本',
    'cost.total_tokens': 'Token 总数',
    'cost.request_count': '请求数',
    'cost.total_requests': '总请求数',
    'cost.token_stats': 'Token 统计',
    'cost.avg_tokens': '平均每请求 Token 数',
    'cost.cost_per_1k': '每 1K Token 成本',
    'cost.model_breakdown': '模型费用明细',
    'cost.share': '占比',
    'cost.no_data': '暂无成本数据。',
    'cost.load_error': '加载成本数据失败',
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
    'logs.live_logs': '实时日志',
    'logs.events': '个事件',
    'logs.jump_to_bottom': '跳转到底部',
    'logs.filter_by_type': '过滤：',
    'logs.clear_filters': '清除',
    'logs.waiting': '等待事件中...',
    'logs.paused_message': '日志流已暂停。',
    'logs.filter': '过滤日志...',
    'logs.empty': '无日志条目。',
    'logs.connected': '已连接到事件流。',
    'logs.disconnected': '已从事件流断开。',

    // Doctor
    'doctor.title': '系统诊断',
    'doctor.run': '运行诊断',
    'doctor.running': '正在运行...',
    'doctor.ok': '正常',
    'doctor.warn': '警告',
    'doctor.warnings': '个警告',
    'doctor.error': '错误',
    'doctor.errors': '个错误',
    'doctor.issues_found': '发现问题',
    'doctor.all_clear': '一切正常',
    'doctor.empty_title': '系统诊断',
    'doctor.empty_desc': '点击“运行诊断”以检查您的 RustClaw 安装情况。',
    'doctor.loading_desc': '正在运行诊断...',
    'doctor.loading_time_note': '这可能需要几秒钟。',
    'doctor.error_run': '运行诊断失败',
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

let currentLocale: Locale = (localStorage.getItem('zeroclaw-locale') as Locale) || 'zh';

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  localStorage.setItem('zeroclaw-locale', locale);
  // Dispatch a custom event to notify all useLocale hooks
  window.dispatchEvent(new CustomEvent('zeroclaw-locale-change', { detail: locale }));
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
    // 1. Listen for manual locale changes within the same tab
    const handleLocaleChange = (e: Event) => {
      const newLocale = (e as CustomEvent).detail;
      setLocaleState(newLocale);
    };

    // 2. Listen for locale changes from other tabs via localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zeroclaw-locale' && e.newValue) {
        const newLocale = e.newValue as Locale;
        currentLocale = newLocale;
        setLocaleState(newLocale);
      }
    };

    window.addEventListener('zeroclaw-locale-change', handleLocaleChange);
    window.addEventListener('storage', handleStorageChange);

    // 3. Only fetch from API if we haven't manually set a locale yet
    const hasManualLocale = localStorage.getItem('zeroclaw-locale');
    if (hasManualLocale) {
      return () => {
        window.removeEventListener('zeroclaw-locale-change', handleLocaleChange);
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    let cancelled = false;
    getStatus()
      .then((status) => {
        if (cancelled) return;
        const normalizedLocale = status.locale?.toLowerCase() || '';
        let detected: Locale = 'zh';

        if (normalizedLocale.startsWith('en')) {
          detected = 'en';
        }

        // Only sync if still using auto-detected default
        if (!localStorage.getItem('zeroclaw-locale')) {
          setLocale(detected);
          setLocaleState(detected);
        }
      })
      .catch(() => {
        // Keep current default
      });

    return () => {
      cancelled = true;
      window.removeEventListener('zeroclaw-locale-change', handleLocaleChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    locale,
    t: (key: string) => tLocale(key, locale),
  };
}

