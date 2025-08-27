// components/layouts/FileListSection.tsx
// ファイル一覧とフィルタリングUI - App.tsxから抽出

import React from 'react';
import type { GitHubFile } from '../../services/githubApi';
import ViewTabs from '../ViewTabs';

interface FileListSectionProps {
  files: GitHubFile[];
  filteredFiles: GitHubFile[];
  viewMode: 'list' | 'graph' | 'split';
  fileFilter: 'all' | 'withDeps' | 'main';
  impactMode: boolean;
  changedFiles: string[];
  currentDirHandle: any;
  isMonitoring: boolean;
  onViewChange: (view: 'list' | 'graph' | 'split') => void;
  onFileFilterChange: (filter: 'all' | 'withDeps' | 'main') => void;
  onImpactModeChange: (enabled: boolean) => void;
  onToggleMonitoring: () => void;
}

const FileListSection: React.FC<FileListSectionProps> = ({
  files,
  filteredFiles,
  viewMode,
  fileFilter,
  impactMode,
  changedFiles,
  currentDirHandle,
  isMonitoring,
  onViewChange,
  onFileFilterChange,
  onImpactModeChange,
  onToggleMonitoring,
}) => {
  const handleImpactModeChange = (checked: boolean) => {
    onImpactModeChange(checked);
  };

  return (
    <>
      <ViewTabs 
        currentView={viewMode} 
        onViewChange={onViewChange}
        showRealtimeMonitor={!!currentDirHandle}
        isMonitoring={isMonitoring}
        onToggleMonitoring={onToggleMonitoring}
      />

      {/* フィルターボタン */}
      <div
        style={{
          padding: '10px 20px',
          backgroundColor: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          表示フィルター:
        </span>
        <button
          onClick={() => onFileFilterChange('all')}
          style={{
            padding: '6px 12px',
            backgroundColor: fileFilter === 'all' ? '#3b82f6' : 'white',
            color: fileFilter === 'all' ? 'white' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          全て ({files.length})
        </button>
        <button
          onClick={() => onFileFilterChange('withDeps')}
          style={{
            padding: '6px 12px',
            backgroundColor:
              fileFilter === 'withDeps' ? '#3b82f6' : 'white',
            color: fileFilter === 'withDeps' ? 'white' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          依存関係あり (
          {
            files.filter(
              (f) =>
                (f.dependencies && f.dependencies.length > 0) ||
                files.some((ff) => ff.dependencies?.includes(f.name))
            ).length
          }
          )
        </button>
        <button
          onClick={() => onFileFilterChange('main')}
          style={{
            padding: '6px 12px',
            backgroundColor: fileFilter === 'main' ? '#3b82f6' : 'white',
            color: fileFilter === 'main' ? 'white' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          主要ファイル (
          {files.filter((f) => f.name.match(/\.(tsx?|jsx?)$/)).length})
        </button>

        {/* Impact Visualization チェックボックス */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '20px' }}>
          <input
            type="checkbox"
            checked={impactMode}
            onChange={(e) => handleImpactModeChange(e.target.checked)}
            style={{ width: '14px', height: '14px' }}
          />
          <span style={{ fontSize: '13px', color: '#4b5563' }}>
            影響範囲
          </span>
        </label>

        <span
          style={{
            marginLeft: 'auto',
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          表示中: {filteredFiles.length} / {files.length} ファイル
          {impactMode && changedFiles.length > 0 && (
            <span style={{ marginLeft: '10px', color: '#ea580c' }}>
              (影響: {changedFiles.map(f => f.split('/').pop()).join(', ')})
            </span>
          )}
        </span>
      </div>
    </>
  );
};

export default FileListSection;