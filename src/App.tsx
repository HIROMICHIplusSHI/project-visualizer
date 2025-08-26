// src/App.tsx
import { useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import URLInput from './components/URLInput';
import ForceGraph from './components/ForceGraph';
import ViewTabs from './components/ViewTabs';
import ProjectTreeView from './components/ProjectTreeView';
import { useFileManagement } from './hooks/useFileManagement';
import { useRealtimeMonitoring } from './hooks/useRealtimeMonitoring';
import { useFileFiltering } from './hooks/useFileFiltering';

function App() {
  // Custom hooks
  const {
    files,
    setFiles,
    repoUrl,
    error,
    isLoading,
    recentUrls,
    setRecentUrls,
    handleURLSubmit,
    handleLocalFolder,
    handleDirectoryPicker,
    clearAll,
  } = useFileManagement();

  const {
    isMonitoring,
    currentDirHandle,
    setCurrentDirHandle,
    filesRef,
    startMonitoring,
    stopMonitoring,
  } = useRealtimeMonitoring();

  const {
    fileFilter,
    setFileFilter,
    filteredFiles,
    viewMode,
    setViewMode,
    selectedFile,
    impactMode,
    changedFiles,
    handleFileSelect,
    handleImpactModeChange,
  } = useFileFiltering(files);

  // URL履歴の復元
  useEffect(() => {
    const saved = localStorage.getItem('recentUrls');
    if (saved) {
      try {
        const urls = JSON.parse(saved);
        if (Array.isArray(urls)) {
          setRecentUrls(urls);
        }
      } catch (error) {
        console.warn('URL履歴の復元に失敗:', error);
      }
    }
  }, [setRecentUrls]);

  // Enhanced handleDirectoryPicker for real-time monitoring
  const handleDirectoryPickerWithMonitoring = async () => {
    const dirHandle = await handleDirectoryPicker();
    
    if (dirHandle) {
      setCurrentDirHandle(dirHandle);
      filesRef.current = files;
    }
  };

  return (
    <div className='App'>
      <Header title='Project Visualizer' onNewProject={clearAll} />
      
      {/* アプリケーションの概要説明 */}
      {files.length === 0 && (
        <div style={{ 
          padding: '40px 20px 30px', 
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb' 
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              React プロジェクト可視化ツール
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: '#6b7280',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              React/TypeScriptプロジェクトの構造を直感的に可視化し、<br />
              ファイル間の依存関係をインタラクティブなグラフで表示します
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '32px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#06b6d4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  color: 'white'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  依存関係の可視化
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  TypeScript/React ファイル間のimport/export関係を自動解析してグラフ表示
                </p>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  color: 'white'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  リアルタイム更新
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  ローカルプロジェクトの変更をリアルタイムで検出・反映
                </p>
              </div>
              
              <div style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  color: 'white'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  影響範囲分析
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  ファイル変更時の影響範囲を色分けで直感的に表示
                </p>
              </div>
            </div>
            
            {/* 技術情報 */}
            <div style={{
              marginTop: '40px',
              paddingTop: '32px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px'
              }}>
                技術仕様
              </h3>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                fontSize: '14px'
              }}>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '16px',
                  fontWeight: '500'
                }}>
                  React 19.1.1
                </span>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '16px',
                  fontWeight: '500'
                }}>
                  TypeScript 5.8.3
                </span>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '16px',
                  fontWeight: '500'
                }}>
                  D3.js
                </span>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '16px',
                  fontWeight: '500'
                }}>
                  File System Access API
                </span>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3e8ff',
                  color: '#7c3aed',
                  borderRadius: '16px',
                  fontWeight: '500'
                }}>
                  Vite
                </span>
              </div>
              
              <p style={{
                fontSize: '13px',
                color: '#9ca3af',
                marginTop: '16px',
                lineHeight: '1.5'
              }}>
                ※ Reactプロジェクトに最適化されていますが、TypeScript/JavaScriptファイルも部分的にサポート
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* 左右分割レイアウト */}
      {files.length === 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 'calc(100vh - 400px)',
          backgroundColor: '#f3f4f6'
        }}>
        {/* 左側: ローカルプロジェクト */}
        <div style={{
          padding: '40px 30px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px',
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'white'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '12px',
              margin: 0
            }}>
              ローカルプロジェクト
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.5',
              margin: 0
            }}>
              PCに保存されているプロジェクトを<br />
              直接読み込み・リアルタイム監視
            </p>
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#9ca3af'
            }}>
              推奨: Chrome/Edge
            </div>
          </div>
          
          {/* ローカルファイル選択機能 */}
          <div>
            <h3 style={{ marginBottom: '20px' }}>ローカルファイルを選択</h3>

            {/* 高速版ボタン */}
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={handleDirectoryPickerWithMonitoring}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  width: '100%'
                }}
              >
                フォルダを選択（高速版）
              </button>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                node_modules自動除外・リアルタイム更新対応
                <br />
                <span style={{ color: '#059669', fontWeight: '500' }}>
                  ※ Chrome・Edgeでのみ利用可能
                </span>
              </div>
            </div>

            {/* 従来の方法（非推奨） */}
            <div style={{
              padding: '15px',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca',
            }}>
              <p style={{
                fontSize: '14px',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#dc2626',
              }}>
                ⚠️ 従来の方法（非推奨）：
              </p>
              <p style={{
                fontSize: '12px',
                marginBottom: '12px',
                color: '#7f1d1d',
                lineHeight: '1.4',
              }}>
                node_modulesを含む全ファイル（1万ファイル超）を読み込むため、
                <br />ブラウザがフリーズする可能性があります。大きなプロジェクトでは使用しないでください。
              </p>
              <input
                type='file'
                // @ts-expect-error - webkitdirectoryは標準のHTML属性ではないため
                webkitdirectory=''
                directory=''
                multiple
                onChange={handleLocalFolder}
                style={{ 
                  width: '100%',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
        </div>
        
        {/* 右側: GitHub プロジェクト */}
        <div style={{
          padding: '40px 30px',
          backgroundColor: 'white'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ 
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'white'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: '12px',
              margin: 0
            }}>
              GitHub リポジトリ
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.5',
              margin: 0
            }}>
              オンラインのGitHubリポジトリを<br />
              URLから直接読み込み
            </p>
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#9ca3af'
            }}>
              API制限: 60回/時間（未認証時）
            </div>
          </div>
          
          {/* GitHub URL入力 */}
          <URLInput onSubmit={handleURLSubmit} />
        </div>
        </div>
      )}

      {/* URL履歴表示 */}
      {recentUrls.length > 0 && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#f8f9fa',
            margin: '0 20px 10px',
            borderRadius: '6px',
          }}
        >
          <small style={{ color: '#6b7280' }}>最近のリポジトリ：</small>
          {recentUrls.map((url) => (
            <button
              key={url}
              onClick={() => handleURLSubmit(url)}
              style={{
                marginLeft: '10px',
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {url.split('/').slice(-2).join('/')}
            </button>
          ))}
        </div>
      )}

      {/* 現在のリポジトリとクリアボタン */}
      {repoUrl && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#e8f4fd',
            margin: '0 20px',
            borderRadius: '6px',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            現在のリポジトリ: <strong>{repoUrl}</strong>
          </span>
          <button
            onClick={clearAll}
            style={{
              padding: '5px 10px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            クリア
          </button>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: '#fee',
            margin: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#c00',
          }}
        >
          ⚠️ エラー: {error}
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            fontSize: '16px',
            color: '#6b7280',
          }}
        >
          ⏳ リポジトリを読み込み中...
        </div>
      )}

      {/* ファイル読み込み完了後の表示部分 */}
      {files.length > 0 && (
        <>
          <ViewTabs 
            currentView={viewMode} 
            onViewChange={setViewMode}
            showRealtimeMonitor={!!currentDirHandle}
            isMonitoring={isMonitoring}
            onToggleMonitoring={isMonitoring ? stopMonitoring : () => startMonitoring(setFiles)}
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
              onClick={() => setFileFilter('all')}
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
              onClick={() => setFileFilter('withDeps')}
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
              onClick={() => setFileFilter('main')}
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

          {/* メインのビュー表示部分 */}
          <div style={{ height: 'calc(100vh - 350px)' }}>
            {/* リストビュー */}
            {viewMode === 'list' && (
              <div style={{ display: 'flex', height: '100%' }}>
                <ProjectTreeView
                  files={filteredFiles}
                  selectedFile={selectedFile}
                  onFileSelect={handleFileSelect}
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
                          selectedFile.dependencies.length > 0 && (
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
                onFileSelect={handleFileSelect}
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
                  onFileSelect={handleFileSelect}
                />
                <div style={{ flex: 1 }}>
                  <ForceGraph 
                    files={filteredFiles}
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
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
                      <h4 style={{ marginBottom: '10px' }}>
                        📄 {selectedFile.name}
                      </h4>

                      {/* ファイル情報 */}
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '15px',
                        }}
                      >
                        <div>📁 {selectedFile.path}</div>
                        <div>
                          統計{' '}
                          {selectedFile.size
                            ? `${(selectedFile.size / 1024).toFixed(2)} KB`
                            : 'サイズ不明'}
                        </div>
                      </div>

                      {/* 依存関係の統計 */}
                      <div
                        style={{
                          padding: '10px',
                          backgroundColor: '#f0f8ff',
                          borderRadius: '5px',
                          marginBottom: '15px',
                        }}
                      >
                        <div
                          style={{ fontWeight: 'bold', marginBottom: '5px' }}
                        >
                          詳細情報
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          📋 ファイル詳細機能は実装予定です
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>
                          依存関係の詳細分析なども今後追加されます
                        </div>
                      </div>

                      {/* 依存ファイルリスト - TSXファイルでは無効化 */}
                      {selectedFile.dependencies &&
                        selectedFile.dependencies.length > 0 &&
                        !selectedFile.name.endsWith('.tsx') && (
                          <div>
                            <div
                              style={{
                                fontWeight: 'bold',
                                fontSize: '12px',
                                marginBottom: '5px',
                              }}
                            >
                              このファイルが依存:
                            </div>
                            <ul
                              style={{ fontSize: '12px', paddingLeft: '20px' }}
                            >
                              {selectedFile.dependencies.map((dep, i) => (
                                <li
                                  key={i}
                                  style={{
                                    cursor: 'pointer',
                                    color: '#0066cc',
                                  }}
                                >
                                  {dep}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* TSXファイル用の注意メッセージ */}
                      {selectedFile.name.endsWith('.tsx') && (
                        <div
                          style={{
                            padding: '10px',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '5px',
                            marginTop: '10px',
                          }}
                        >
                          <div style={{ fontSize: '12px', color: '#856404' }}>
                            📝 TSXファイルの依存関係表示機能は開発中のため、
                            一時的に無効化されています
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p
                      style={{
                        color: '#999',
                        fontSize: '14px',
                        textAlign: 'center',
                      }}
                    >
                      ファイルを選択してください
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;