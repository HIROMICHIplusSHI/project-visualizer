import React from 'react';
import { List, GitBranch, Columns } from 'lucide-react';
import { theme } from '../styles/theme';
import Tooltip from './ui/Tooltip';
import type { ViewTabsProps } from '../types/components';

// TODO(human): ViewTabsProps 型定義を components.ts に移行完了

function ViewTabs({
  currentView,
  onViewChange,
  showRealtimeMonitor = false,
  isMonitoring = false,
  onToggleMonitoring,
}: ViewTabsProps) {
  // タブコンテナのスタイル設定
  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between', // タブとボタンを両端に配置
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
  };

  // アクティブ状態に応じたタブスタイルを生成
  const getTabStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: isActive ? 'white' : 'transparent',
    border: isActive
      ? `1px solid ${theme.colors.border}`
      : '1px solid transparent',
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? theme.colors.primary : theme.colors.secondary,
    transition: 'all 0.2s ease',
    boxShadow: isActive ? theme.shadow.sm : 'none',
  });

  // 表示するタブの設定配列
  const tabs = [
    { id: 'list', label: 'リストビュー', icon: List },
    { id: 'graph', label: 'グラフビュー', icon: GitBranch },
    { id: 'split', label: '分割ビュー', icon: Columns },
  ];

  // キーボードナビゲーション処理
  const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onViewChange(tabId as 'list' | 'graph' | 'split');
    }
  };

  return (
    <div role='tablist' style={containerStyle}>
      <div style={{ display: 'flex', gap: theme.spacing.xs }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role='tab'
            aria-selected={currentView === id}
            aria-controls={`${id}-panel`}
            tabIndex={currentView === id ? 0 : -1}
            style={getTabStyle(currentView === id)}
            onClick={() => onViewChange(id as 'list' | 'graph' | 'split')}
            onKeyDown={(e) => handleKeyDown(e, id)}
            onMouseEnter={(e) => {
              if (currentView !== id) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.boxShadow = theme.shadow.sm;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* リアルタイム監視ボタン */}
      {showRealtimeMonitor && onToggleMonitoring && (
        <button
          onClick={onToggleMonitoring}
          title={isMonitoring ? 
            'リアルタイム監視を停止します' : 
            'ディレクトリの変更を3秒間隔で監視します（ページ更新時は再設定が必要）'
          }
          style={{
            padding: '6px 12px',
            backgroundColor: isMonitoring ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isMonitoring ? <>⏸ リアルタイム更新</> : <>🔄 リアルタイム更新</>}
        </button>
      )}
      
      {/* リアルタイム監視が非表示の理由を説明 */}
      {!showRealtimeMonitor && (
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'help',
            position: 'relative'
          }}
        >
          💡 監視機能
          <Tooltip 
            content="📁 ローカルプロジェクトを選択すると、ファイル変更を自動検出できます"
            position="left"
          >
            <span 
              style={{ 
                fontSize: '10px', 
                backgroundColor: '#e2e8f0',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '2px',
                cursor: 'help'
              }}
            >
              ?
            </span>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default ViewTabs;
