// src/App.tsx
import { useEffect } from 'react';
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

function App() {
  // Custom hooks
  const [recentUrls, setRecentUrls] = useRecentUrls();
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


  return (
    <div className='App'>
      <Header title='Project Visualizer' onNewProject={clearAll} />
      
      <WelcomeSection show={files.length === 0} />
      
      <ProjectInputSection 
        show={files.length === 0} 
        onDirectorySelect={handleDirectoryPicker}
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
          />

          <MainViewSection 
            viewMode={viewMode}
            filteredFiles={filteredFiles}
            selectedFile={selectedFile}
            impactMode={impactMode}
            changedFiles={changedFiles}
            onFileSelect={handleFileSelect}
          />
        </>
      )}
    </div>
  );
}

export default App;