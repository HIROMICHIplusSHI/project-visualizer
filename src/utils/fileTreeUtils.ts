// utils/fileTreeUtils.ts
// ファイル階層構造変換ユーティリティ

import type { GitHubFile } from '../services/githubApi';
import type { FileTreeNode } from '../types/common';

// TODO(human): FileTreeNode 型定義を common.ts に移行完了

/**
 * フォルダを初期状態で展開すべきかを判定
 */
const shouldExpandInitially = (folderName: string, level: number, fullPath: string): boolean => {
  // レベル0（ルート直下）のフォルダは基本的に展開
  if (level === 0) {
    const importantRootFolders = ['src', 'public', 'components', 'pages', 'lib', 'utils', 'hooks', 'services', 'assets'];
    return importantRootFolders.includes(folderName.toLowerCase());
  }
  
  // レベル1（src下など）の重要フォルダも展開
  if (level === 1) {
    const importantSubFolders = ['components', 'pages', 'layouts', 'hooks', 'utils', 'services', 'stores', 'context', 'api'];
    if (importantSubFolders.includes(folderName.toLowerCase())) {
      return true;
    }
    
    // src/components のようなパスの場合
    if (fullPath.toLowerCase().includes('src/components') || 
        fullPath.toLowerCase().includes('src/pages') ||
        fullPath.toLowerCase().includes('src/layouts')) {
      return true;
    }
  }
  
  // それ以外は折りたたみ状態
  return false;
};

/**
 * フラットなファイルリストを階層構造に変換
 */
export const buildFileTree = (files: GitHubFile[]): FileTreeNode[] => {
  const root: FileTreeNode[] = [];
  const nodeMap = new Map<string, FileTreeNode>();
  
  // すべてのファイルを処理
  files.forEach((file) => {
    const pathParts = file.path.split('/').filter(part => part !== '');
    
    pathParts.forEach((part, index) => {
      const currentPath = pathParts.slice(0, index + 1).join('/');
      const isFile = index === pathParts.length - 1;
      
      if (!nodeMap.has(currentPath)) {
        const node: FileTreeNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'directory',
          level: index,
          isExpanded: shouldExpandInitially(part, index, currentPath),
          file: isFile ? file : undefined,
          children: isFile ? undefined : []
        };
        
        nodeMap.set(currentPath, node);
        
        // 親ノードに追加
        if (index === 0) {
          root.push(node);
        } else {
          const parentPath = pathParts.slice(0, index).join('/');
          const parent = nodeMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        }
      }
    });
  });
  
  // ソート関数
  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    }).map(node => {
      if (node.children) {
        node.children = sortNodes(node.children);
      }
      return node;
    });
  };
  
  return sortNodes(root);
};

/**
 * ファイルツリーをフラット化して表示用リストに変換
 * 展開/折りたたみ状態を考慮
 */
export const flattenFileTree = (
  nodes: FileTreeNode[], 
  showHidden: boolean = false
): FileTreeNode[] => {
  const result: FileTreeNode[] = [];
  
  const traverse = (nodes: FileTreeNode[], level: number = 0) => {
    nodes.forEach(node => {
      // 隠しファイル/フォルダの処理
      if (!showHidden && node.name.startsWith('.')) {
        return;
      }
      
      // レベルを更新
      const nodeWithLevel = { ...node, level };
      result.push(nodeWithLevel);
      
      // ディレクトリが展開されている場合のみ子要素を追加
      if (node.type === 'directory' && node.isExpanded && node.children) {
        traverse(node.children, level + 1);
      }
    });
  };
  
  traverse(nodes);
  return result;
};

/**
 * ツリーノードの展開状態を更新
 */
export const toggleNodeExpansion = (
  nodes: FileTreeNode[], 
  targetPath: string
): FileTreeNode[] => {
  return nodes.map(node => {
    if (node.path === targetPath) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    
    if (node.children) {
      return {
        ...node,
        children: toggleNodeExpansion(node.children, targetPath)
      };
    }
    
    return node;
  });
};

/**
 * 指定されたパスのファイル/ディレクトリを検索
 */
export const findNodeByPath = (
  nodes: FileTreeNode[], 
  targetPath: string
): FileTreeNode | null => {
  for (const node of nodes) {
    if (node.path === targetPath) {
      return node;
    }
    
    if (node.children) {
      const found = findNodeByPath(node.children, targetPath);
      if (found) return found;
    }
  }
  
  return null;
};

/**
 * VS Code風のファイル拡張子からアイコンを取得
 */
export const getFileIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const baseName = fileName.toLowerCase();
  
  // 特殊ファイル名の処理（拡張子より優先）
  const specialFiles: Record<string, string> = {
    'package.json': '📦',
    'package-lock.json': '🔒',
    'yarn.lock': '🧶',
    'tsconfig.json': '⚙️',
    'vite.config.js': '⚡',
    'vite.config.ts': '⚡',
    'webpack.config.js': '📦',
    'rollup.config.js': '📦',
    'tailwind.config.js': '🎨',
    'postcss.config.js': '🎨',
    'dockerfile': '🐳',
    'docker-compose.yml': '🐳',
    '.gitignore': '🚫',
    '.gitattributes': '📝',
    '.env': '🔐',
    '.env.local': '🔐',
    '.env.production': '🔐',
    'readme.md': '📖',
    'license': '📄',
    'changelog.md': '📝',
    '.eslintrc.js': '📏',
    '.prettierrc': '💄',
    'jest.config.js': '🧪',
    'vitest.config.ts': '🧪'
  };
  
  if (specialFiles[baseName]) {
    return specialFiles[baseName];
  }
  
  // 拡張子別アイコンマッピング（VS Code風）
  const iconMap: Record<string, string> = {
    // JavaScript/TypeScript
    'js': '🟨',      // JavaScript yellow
    'mjs': '🟨',     // ES Module
    'jsx': '⚛️',      // React blue
    'ts': '🔷',      // TypeScript blue 
    'tsx': '⚛️',      // React TypeScript
    'json': '🟫',    // JSON brown
    
    // Web Technologies
    'html': '🌐',    // HTML orange
    'htm': '🌐',
    'xml': '📄',
    'vue': '🟢',     // Vue green
    'svelte': '🟠',  // Svelte orange
    
    // Styling
    'css': '🎨',     // CSS blue
    'scss': '💗',    // Sass pink
    'sass': '💗',
    'less': '🟦',    // Less blue
    'styl': '🟢',    // Stylus green
    
    // Images
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🎭',
    'webp': '🖼️',
    'ico': '🖼️',
    
    // Documents
    'md': '📝',      // Markdown
    'txt': '📄',
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    
    // Data
    'csv': '📊',
    'xlsx': '📊',
    'yaml': '⚙️',
    'yml': '⚙️',
    'toml': '⚙️',
    'ini': '⚙️',
    
    // Code/Config
    'sh': '⚡',      // Shell script
    'bash': '⚡',
    'zsh': '⚡',
    'fish': '⚡',
    'py': '🐍',      // Python
    'rb': '💎',      // Ruby
    'go': '🟦',      // Go
    'rs': '🦀',      // Rust
    'php': '🐘',     // PHP
    'java': '☕',     // Java
    'kt': '🟣',      // Kotlin
    'swift': '🧡',   // Swift
    'dart': '🎯',    // Dart
    'c': '🔵',       // C
    'cpp': '🔵',     // C++
    'h': '🔵',       // Header
    'hpp': '🔵',
    
    // Archives
    'zip': '📦',
    'rar': '📦',
    'tar': '📦',
    'gz': '📦',
    '7z': '📦',
    
    // Fonts
    'woff': '🔤',
    'woff2': '🔤',
    'ttf': '🔤',
    'otf': '🔤',
    'eot': '🔤',
    
    // Audio/Video
    'mp3': '🎵',
    'wav': '🎵',
    'mp4': '🎬',
    'avi': '🎬',
    'mov': '🎬',
    
    // Other
    'log': '📋',
    'lock': '🔒',
    'cache': '💾',
    'tmp': '🗂️',
    'backup': '💾'
  };
  
  return iconMap[ext || ''] || '📄';
};

/**
 * VS Code風のディレクトリアイコンを取得（名前と展開状態に応じて）
 */
export const getDirectoryIcon = (folderName: string, isExpanded: boolean): string => {
  const name = folderName.toLowerCase();
  
  // 特殊フォルダのアイコン
  const specialFolders: Record<string, { closed: string; open: string }> = {
    'src': { closed: '📁', open: '📂' },
    'components': { closed: '⚛️', open: '⚛️' },
    'pages': { closed: '📄', open: '📄' },
    'layouts': { closed: '📋', open: '📋' },
    'hooks': { closed: '🎣', open: '🎣' },
    'utils': { closed: '🔧', open: '🔧' },
    'services': { closed: '⚙️', open: '⚙️' },
    'stores': { closed: '🏪', open: '🏪' },
    'context': { closed: '🔗', open: '🔗' },
    'api': { closed: '🌐', open: '🌐' },
    'lib': { closed: '📚', open: '📚' },
    'assets': { closed: '🎨', open: '🎨' },
    'images': { closed: '🖼️', open: '🖼️' },
    'icons': { closed: '🎭', open: '🎭' },
    'styles': { closed: '💄', open: '💄' },
    'css': { closed: '🎨', open: '🎨' },
    'scss': { closed: '💗', open: '💗' },
    'public': { closed: '🌍', open: '🌍' },
    'static': { closed: '📦', open: '📦' },
    'build': { closed: '🏗️', open: '🏗️' },
    'dist': { closed: '📦', open: '📦' },
    'node_modules': { closed: '📦', open: '📦' },
    'tests': { closed: '🧪', open: '🧪' },
    'test': { closed: '🧪', open: '🧪' },
    '__tests__': { closed: '🧪', open: '🧪' },
    'docs': { closed: '📖', open: '📖' },
    'documentation': { closed: '📖', open: '📖' },
    'config': { closed: '⚙️', open: '⚙️' },
    'types': { closed: '🔷', open: '🔷' },
    'interfaces': { closed: '🔷', open: '🔷' },
    'models': { closed: '🏛️', open: '🏛️' },
    'database': { closed: '🗄️', open: '🗄️' },
    'db': { closed: '🗄️', open: '🗄️' },
    'middleware': { closed: '🔀', open: '🔀' },
    'guards': { closed: '🛡️', open: '🛡️' },
    'auth': { closed: '🔐', open: '🔐' },
    'authentication': { closed: '🔐', open: '🔐' },
    'security': { closed: '🛡️', open: '🛡️' }
  };
  
  if (specialFolders[name]) {
    return isExpanded ? specialFolders[name].open : specialFolders[name].closed;
  }
  
  // デフォルトのフォルダアイコン（より微妙な違い）
  return isExpanded ? '📂' : '📁';
};
