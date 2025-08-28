// src/App.tsx
import './App.css';
import Header from './components/Header';


import { useFileManagement } from './hooks/useFileManagement';
import { useRealtimeMonitoring } from './hooks/useRealtimeMonitoring';
import { useFileFiltering } from './hooks/useFileFiltering';
import WelcomeSection from './components/layouts/WelcomeSection';
import ProjectInputSection from './components/layouts/ProjectInputSection';
import FileListSection from './components/layouts/FileListSection';
import MainViewSection from './components/layouts/MainViewSection';
import StatusSection from './components/layouts/StatusSection';
import { useRecentUrls } from './hooks/useLocalStorage';
import { sampleReactProject } from './data/sampleReactProject';

function App() {
  // Custom hooks
  const [recentUrls] = useRecentUrls();
  const {
    files,
    setFiles,
    repoUrl,
    error,
    isLoading,

    handleURLSubmit,
    handleLocalFolder,
    handleDirectoryPicker,
    clearAll,
  } = useFileManagement();

  const {
    isMonitoring,
    currentDirHandle,
    setCurrentDirHandle,
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
    handleResetImpactMode,
  } = useFileFiltering(files);

  // URL履歴はuseFileStorageで自動復元されるため、ここでの処理は不要

  // デモ機能のハンドラー
  const handleDemoClick = () => {
    setFiles(sampleReactProject);
    setViewMode('split'); // デモでは分割ビューを表示
    // 影響範囲機能をデモンストレーション用に有効化
    setTimeout(() => {
      handleImpactModeChange(true); // 影響範囲モードを有効化
      // changedFilesは内部的に設定される
    }, 1000); // 1秒後に影響範囲を表示
  };

  // Enhanced handleDirectoryPicker for real-time monitoring
  const enhancedHandleDirectoryPicker = async () => {
    try {
      const dirHandle = await handleDirectoryPicker();
      if (dirHandle) {
        // リアルタイム監視用にディレクトリハンドルを設定
        setCurrentDirHandle(dirHandle);
        console.log('📁 ディレクトリハンドル取得:', dirHandle.name);
      }
    } catch (error) {
      console.error('Directory picker エラー:', error);
    }
  };

  // 完全リセット関数（ファイル選択 + 影響範囲機能）
  const handleCompleteReset = () => {
    handleFileSelect(null);     // ファイル選択を解除
    handleResetImpactMode();    // 影響範囲機能をリセット
  };


  return (
    <div className='App'>
      <Header title='Project Visualizer' onNewProject={clearAll} />
      
      <WelcomeSection show={files.length === 0} onDemoClick={handleDemoClick} />
      
      <ProjectInputSection 
        show={files.length === 0} 
        onDirectorySelect={enhancedHandleDirectoryPicker}
        onLocalFolderSelect={handleLocalFolder}
        onURLSubmit={handleURLSubmit}
      />

      <StatusSection 
        recentUrls={recentUrls}
        repoUrl={repoUrl}
        error={error}
        isLoading={isLoading}
        onUrlSelect={handleURLSubmit}
        onClear={clearAll}
      />

      {/* ファイル読み込み完了後の表示部分 */}
      {files.length > 0 && (
        <>
          <FileListSection 
            files={files}
            filteredFiles={filteredFiles}
            viewMode={viewMode}
            fileFilter={fileFilter}
            impactMode={impactMode}
            changedFiles={changedFiles}
            currentDirHandle={currentDirHandle}
            isMonitoring={isMonitoring}
            onViewChange={setViewMode}
            onFileFilterChange={setFileFilter}
            onImpactModeChange={handleImpactModeChange}
            onToggleMonitoring={isMonitoring ? stopMonitoring : () => startMonitoring(setFiles)}
            onFileSelect={handleFileSelect}
            onResetAll={handleCompleteReset}
          />

          <MainViewSection 
            viewMode={viewMode}
            filteredFiles={filteredFiles}
            selectedFile={selectedFile}
            impactMode={impactMode}
            changedFiles={changedFiles}
            onFileSelect={handleFileSelect}
            onResetImpactMode={handleResetImpactMode}
          />
        </>
      )}
    </div>
  );
}

export default App;