// components/layouts/MainViewSection.tsx
// メインビュー表示部分（リスト、グラフ、分割ビュー） - App.tsxから抽出

import React from 'react';
import type { GitHubFile } from '../../services/githubApi';
import ProjectTreeView from '../ProjectTreeView';
import ForceGraph from '../ForceGraph';

interface MainViewSectionProps {
  viewMode: 'list' | 'graph' | 'split';
  filteredFiles: GitHubFile[];
  selectedFile: GitHubFile | null;
  impactMode: boolean;
  changedFiles: string[];
  onFileSelect: (file: GitHubFile | null) => void;
}

const MainViewSection: React.FC<MainViewSectionProps> = ({
  viewMode,
  filteredFiles,
  selectedFile,
  impactMode,
  changedFiles,
  onFileSelect,
}) => {
  return (
    <div style={{ height: 'calc(100vh - 350px)' }}>
      {/* リストビュー */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', height: '100%' }}>
          <ProjectTreeView
            files={filteredFiles}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
          <div
            style={{ flex: 1, padding: '20px', backgroundColor: '#fff' }}
          >
            {selectedFile ? (
              <div>
                <h3>📄 {selectedFile.name}</h3>
                <div style={{ marginTop: '20px' }}>
                  <p>
                    <strong>パス:</strong> {selectedFile.path}
                  </p>
                  <p>
                    <strong>サイズ:</strong>{' '}
                    {selectedFile.size
                      ? `${selectedFile.size} bytes`
                      : '不明'}
                  </p>
                  {selectedFile.dependencies &&
                    selectedFile.dependencies.length > 0 &&
                    !selectedFile.name.endsWith('.tsx') && (
                      <div>
                        <p>
                          <strong>依存関係:</strong>
                        </p>
                        <ul>
                          {selectedFile.dependencies.map(
                            (dep: string, i: number) => (
                              <li key={i}>{dep}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  color: '#999',
                  textAlign: 'center',
                  marginTop: '50px',
                }}
              >
                ファイルを選択してください
              </div>
            )}
          </div>
        </div>
      )}

      {/* グラフビュー */}
      {viewMode === 'graph' && (
        <ForceGraph 
          files={filteredFiles} 
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          impactMode={impactMode}
          changedFiles={changedFiles}
        />
      )}

      {/* 分割ビュー */}
      {viewMode === 'split' && (
        <div style={{ display: 'flex', height: '100%' }}>
          <ProjectTreeView
            files={filteredFiles}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
          <div style={{ flex: 1 }}>
            <ForceGraph 
              files={filteredFiles}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              impactMode={impactMode}
              changedFiles={changedFiles}
            />
          </div>
          <div
            style={{
              width: '300px',
              padding: '20px',
              borderLeft: '1px solid #e0e0e0',
              backgroundColor: '#fff',
            }}
          >
            {selectedFile ? (
              <div>
                <h3>📄 {selectedFile.name}</h3>
                <div style={{ marginTop: '20px' }}>
                  <p>
                    <strong>パス:</strong> {selectedFile.path}
                  </p>
                  <p>
                    <strong>サイズ:</strong>{' '}
                    {selectedFile.size
                      ? `${selectedFile.size} bytes`
                      : '不明'}
                  </p>
                  {selectedFile.dependencies &&
                    selectedFile.dependencies.length > 0 &&
                    !selectedFile.name.endsWith('.tsx') && (
                      <div>
                        <p>
                          <strong>依存関係:</strong>
                        </p>
                        <ul>
                          {selectedFile.dependencies.map(
                            (dep: string, i: number) => (
                              <li key={i}>{dep}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  color: '#999',
                  textAlign: 'center',
                  marginTop: '50px',
                }}
              >
                ファイルを選択してください
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainViewSection;