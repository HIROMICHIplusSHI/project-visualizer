// src/components/ViewTabs.tsx を更新
import React from 'react';
import { List, GitBranch, LayoutGrid } from 'lucide-react';

interface ViewTabsProps {
  currentView: 'list' | 'graph' | 'split';
  onViewChange: (view: 'list' | 'graph' | 'split') => void;
}

const ViewTabs: React.FC<ViewTabsProps> = ({ currentView, onViewChange }) => {
  const tabs = [
    { id: 'list', icon: List, label: 'リスト', description: 'ファイル一覧' },
    { id: 'graph', icon: GitBranch, label: 'グラフ', description: '依存関係' },
    { id: 'split', icon: LayoutGrid, label: '分割', description: '両方表示' },
  ] as const;

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === tab.id ? '#3b82f6' : 'white',
              color: currentView === tab.id ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '100px',
            }}
          >
            <Icon size={20} />
            <div
              style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}
            >
              {tab.label}
            </div>
            <div
              style={{
                fontSize: '11px',
                opacity: 0.8,
                marginTop: '2px',
              }}
            >
              {tab.description}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ViewTabs;
