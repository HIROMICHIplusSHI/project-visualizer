import React, { useState } from 'react';
import { Folder, File } from 'lucide-react';
import { type GitHubFile } from '../services/githubApi';

interface ProjectTreeViewProps {
  files: GitHubFile[];
  onFileSelect?: (file: GitHubFile) => void;
}

const ProjectTreeView: React.FC<ProjectTreeViewProps> = ({
  files,
  onFileSelect,
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const handleFileClick = (file: GitHubFile) => {
    setSelectedFile(file.path);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className='project-tree'
      style={{
        width: '300px',
        height: '100%',
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
          エクスプローラー
        </h3>

        <div>
          {files.map((file) => (
            <div
              key={file.path}
              onClick={() => handleFileClick(file)}
              style={{
                padding: '5px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                backgroundColor:
                  selectedFile === file.path
                    ? '#e3f2fd'
                    : hoveredFile === file.path
                    ? '#f0f0f0'
                    : 'transparent',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={() => setHoveredFile(file.path)}
              onMouseLeave={() => setHoveredFile(null)}
            >
              {file.type === 'dir' ? (
                <Folder
                  size={16}
                  style={{ marginRight: '5px', color: '#90a4ae' }}
                />
              ) : (
                <File
                  size={16}
                  style={{ marginRight: '5px', color: '#90a4ae' }}
                />
              )}

              <span style={{ fontSize: '13px' }}>{file.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTreeView;
