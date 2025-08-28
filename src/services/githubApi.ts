// src/services/githubApi.ts（完全版）
import { countLines } from '../utils/fileUtils';

// GitHubのファイル情報の型
export interface GitHubFile {
  name: string;
  path: string; // 必須のまま
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
  dependencies?: string[];
  id: number; // 必須に変更（?を削除）
  content?: string; // ファイル内容
  lineCount?: number; // 行数情報
}

// URLからownerとrepoを取り出す関数
export const parseGitHubUrl = (url: string) => {
  const regex = /github\.com\/([^/]+)\/([^/]+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('正しいGitHubのURLを入力してください');
  }

  return {
    owner: match[1],
    repo: match[2].replace('.git', ''),
  };
};

// リポジトリの構造を取得する関数
export const fetchRepoStructure = async (
  url: string
): Promise<GitHubFile[]> => {
  try {
    const { owner, repo } = parseGitHubUrl(url);

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          'リポジトリが見つかりません（プライベートリポジトリかも？）'
        );
      }
      throw new Error('データの取得に失敗しました');
    }

    const data = await response.json();
    console.log('GitHubから取得したデータ:', data);
    return data as GitHubFile[];
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ファイルの中身を取得する関数
export const fetchFileContent = async (
  downloadUrl: string
): Promise<string> => {
  try {
    // より詳細なエラー情報を提供
    console.log(`🔄 ファイル内容を取得中: ${downloadUrl}`);
    
    const response = await fetch(downloadUrl, {
      headers: {
        'Accept': 'text/plain, application/octet-stream, */*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    console.log(`📄 取得完了: ${content.length}文字`);
    return content;
  } catch (error) {
    console.error('File fetch error:', error);
    // ネットワークエラーやCORSエラーの場合は空文字を返す
    return '';
  }
};

// fetchRepoStructureRecursive を改善（深さ制限付き）
export const fetchRepoStructureRecursive = async (
  url: string,
  path: string = '',
  depth: number = 0,
  maxDepth: number = 2
): Promise<GitHubFile[]> => {
  // 深さ制限
  if (depth >= maxDepth) {
    console.log(`  ↳ 深さ制限 (${maxDepth}) に到達`);
    return [];
  }

  try {
    const { owner, repo } = parseGitHubUrl(url);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.warn(`Failed to fetch: ${path}`);
      return [];
    }

    const data = await response.json();
    let allFiles: GitHubFile[] = [];

    // 除外するフォルダ
    const excludeDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      'coverage',
      '.next',
      '__tests__',
      'test',
    ];

    for (const item of data) {
      if (item.type === 'file') {
        // ファイル内容を取得
        let content = '';
        
        // デバッグ用ログ
        console.log(`📄 ${item.name}: content=${!!item.content}, download_url=${!!item.download_url}, size=${item.size}`);
        
        // GitHub APIから直接content（base64）がある場合
        if (item.content && typeof item.content === 'string') {
          try {
            // base64の改行を削除してからデコード
            const cleanBase64 = item.content.replace(/\s/g, '');
            content = atob(cleanBase64);
            console.log(`✅ Base64デコード成功: ${item.name} (${content.length}文字)`);
          } catch (error) {
            console.warn(`⚠️ Base64デコードエラー ${item.name}:`, error);
            // base64デコードに失敗した場合はdownload_urlから取得を試行
            if (item.download_url) {
              try {
                content = await fetchFileContent(item.download_url);
                console.log(`✅ download_urlから取得成功: ${item.name}`);
              } catch (fetchError) {
                console.warn(`❌ download_url取得エラー ${item.name}:`, fetchError);
              }
            }
          }
        }
        // contentが空またはない場合はdownload_urlから取得を試行
        else if (item.download_url) {
          try {
            content = await fetchFileContent(item.download_url);
            console.log(`✅ download_urlから取得成功: ${item.name} (${content.length}文字)`);
          } catch (error) {
            console.warn(`❌ ファイル内容取得エラー ${item.name}:`, error);
          }
        } else {
          console.warn(`⚠️ ファイル内容の取得方法なし: ${item.name}`);
        }
        
        // ファイルを追加（内容も含む）
        allFiles.push({
          ...item,
          content: content,
          lineCount: content ? countLines(content) : undefined
        });
      } else if (item.type === 'dir' && !excludeDirs.includes(item.name)) {
        // 再帰的に探索
        console.log(`  ${'  '.repeat(depth)}↳ ${item.name}/`);
        const subFiles = await fetchRepoStructureRecursive(
          url,
          item.path,
          depth + 1,
          maxDepth
        );
        allFiles = allFiles.concat(subFiles);
      }
    }

    return allFiles;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return [];
  }
};
// import文を解析する関数（シンプル版に戻す）
export function extractDependencies(
  content: string,
  filePath: string
): string[] {
  const dependencies: string[] = [];
  
  // デバッグ用：TSファイルやCSSファイルの場合もログ出力
  if (filePath.includes('App.tsx') || filePath.includes('main.tsx') || 
      filePath.endsWith('.ts') || filePath.endsWith('.css') || 
      filePath.endsWith('.scss') || filePath.endsWith('.sass')) {
    console.log(`=== ${filePath} 依存関係解析 ===`);
    console.log('File path:', filePath);
    console.log('File extension:', filePath.split('.').pop());
  }

  // コメントを除去
  const withoutSingleLineComments = content.replace(/\/\/.*$/gm, '');
  const withoutComments = withoutSingleLineComments.replace(
    /\/\*[\s\S]*?\*\//g,
    ''
  );

  // importとrequireのパターン
  const importRegex =
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g;

  // 現在のファイルのディレクトリを取得
  const currentDir = filePath.substring(0, filePath.lastIndexOf('/'));

  // import文を処理
  const processImport = (importPath: string): string | null => {
    // 外部パッケージは除外
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return null;
    }

    let resolvedPath = '';

    if (importPath.startsWith('./')) {
      // 同じディレクトリからの相対パス
      resolvedPath = currentDir + '/' + importPath.substring(2);
    } else if (importPath.startsWith('../')) {
      // 上位ディレクトリへの相対パス
      const parts = currentDir.split('/').filter((p) => p !== '');
      let tempPath = importPath;

      while (tempPath.startsWith('../')) {
        if (parts.length > 0) parts.pop();
        tempPath = tempPath.substring(3);
      }

      resolvedPath = (parts.length > 0 ? parts.join('/') : '') + '/' + tempPath;
    } else if (importPath.startsWith('/')) {
      // 絶対パス（srcからの相対）
      resolvedPath = importPath.substring(1);
    } else {
      // 相対パス指定なし（同じディレクトリと仮定）
      resolvedPath = currentDir + '/' + importPath;
    }

    // 先頭のスラッシュを削除
    if (resolvedPath.startsWith('/')) {
      resolvedPath = resolvedPath.substring(1);
    }

    // 拡張子を補完
    if (
      resolvedPath &&
      !resolvedPath.match(
        /\.(tsx?|jsx?|css|scss|sass|less|json|svg|png|jpg|jpeg|gif)$/
      )
    ) {
      // より包括的な拡張子補完 - すべてのファイル形式に対応
      const sourceExt = filePath.split('.').pop()?.toLowerCase();
      
      // ソースファイルの種類に応じて適切な拡張子を推測
      switch (sourceExt) {
        case 'tsx':
        case 'jsx':
          // Reactファイルは .tsx, .ts, .css, .scss などをimport
          resolvedPath = resolvedPath + '.tsx'; // デフォルトは .tsx (Reactコンポーネント)
          break;
        case 'ts':
        case 'js':
          // TypeScript/JSファイルは同種の拡張子
          resolvedPath = resolvedPath + '.' + sourceExt;
          break;
        default:
          resolvedPath = resolvedPath + '.ts'; // フォールバック
      }
    }

    return resolvedPath;
  };

  // importを抽出
  let match;
  while ((match = importRegex.exec(withoutComments)) !== null) {
    const resolved = processImport(match[1]);
    
    // デバッグ用：特定ファイルの場合のみログ出力
    if (filePath.includes('App.tsx') || filePath.includes('main.tsx')) {
      console.log(`Import発見: "${match[1]}" -> 解決後: "${resolved}"`);
    }
    
    if (resolved) {
      dependencies.push(resolved);
    }
  }

  // requireも抽出
  while ((match = requireRegex.exec(withoutComments)) !== null) {
    const resolved = processImport(match[1]);
    if (resolved) {
      dependencies.push(resolved);
    }
  }

  // CSSファイルの場合は@import文も処理
  const fileExt = filePath.split('.').pop()?.toLowerCase();
  if (fileExt === 'css' || fileExt === 'scss' || fileExt === 'sass') {
    const cssImports = extractCssImports(withoutComments);
    for (const importPath of cssImports) {
      const resolved = processImport(importPath);
      if (resolved) {
        dependencies.push(resolved);
      }
    }
  }

  // 重複を削除
  const finalDependencies = [...new Set(dependencies)];
  
  // デバッグ用：TSファイルやCSSファイルの場合もログ出力
  if (filePath.includes('App.tsx') || filePath.includes('main.tsx') || 
      filePath.endsWith('.ts') || filePath.endsWith('.css') || 
      filePath.endsWith('.scss') || filePath.endsWith('.sass')) {
    console.log('最終的な依存関係:', finalDependencies);
    console.log('=== 解析完了 ===');
  }
  
  return finalDependencies;
}

// CSSファイルの@import文を抽出する関数
function extractCssImports(content: string): string[] {
  const imports: string[] = [];
  
  // @import "path"; または @import 'path'; パターン
  const simpleImportRegex = /@import\s+['"]([^'"]+)['"]/g;
  
  // @import url("path"); または @import url('path'); パターン  
  const urlImportRegex = /@import\s+url\(['"]([^'"]+)['"]\)/g;
  
  let match;
  
  // シンプルな@import文を抽出
  while ((match = simpleImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // url()付きの@import文を抽出
  while ((match = urlImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}
