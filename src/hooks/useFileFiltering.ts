import { useState, useMemo } from 'react';
import { type GitHubFile } from '../services/githubApi';
import type { FileFilterType } from '../types/common';

// 型エイリアスで互換性を保持（将来的に削除予定）
export type FileFilter = FileFilterType;
export type ViewMode = 'list' | 'graph' | 'split';

export const useFileFiltering = (files: GitHubFile[]) => {
  const [fileFilter, setFileFilter] = useState<FileFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [impactMode, setImpactMode] = useState<boolean>(false);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);

  const filteredFiles = useMemo(() => {
    switch (fileFilter) {
      case 'withDeps':
        return files.filter(
          (f) =>
            (f.dependencies && f.dependencies.length > 0) ||
            files.some((ff) => ff.dependencies?.includes(f.name))
        );
      case 'main':
        return files.filter((f) => f.name.match(/\.(tsx?|jsx?)$/));
      case 'all':
      default:
        return files;
    }
  }, [files, fileFilter]);

  const handleFileSelect = (file: GitHubFile | null) => {
    setSelectedFile(file);
    
    // Impact visualizationが有効で、ファイルが選択された場合は自動更新
    if (impactMode && file?.path) {
      setChangedFiles([file.path]);
    } else if (!impactMode) {
      setChangedFiles([]);
    }
  };

  const handleImpactModeChange = (isChecked: boolean) => {
    setImpactMode(isChecked);
    
    // チェックON時に選択中のファイルがあれば自動的に設定
    if (isChecked && selectedFile?.path) {
      setChangedFiles([selectedFile.path]);
    } else if (!isChecked) {
      setChangedFiles([]);
    }
  };

  const handleResetImpactMode = () => {
    setImpactMode(false);
    setChangedFiles([]);
  };

  return {
    // Filter states
    fileFilter,
    setFileFilter,
    filteredFiles,

    // View states
    viewMode,
    setViewMode,
    selectedFile,
    setSelectedFile,
    
    // Impact visualization states
    impactMode,
    setImpactMode,
    changedFiles,
    setChangedFiles,

    // Actions
    handleFileSelect,
    handleImpactModeChange,
    handleResetImpactMode,
  };
};