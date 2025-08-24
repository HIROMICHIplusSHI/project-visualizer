// src/services/githubApi.ts（完全版）

// GitHubのファイル情報の型
export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
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
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error('ファイル内容の取得に失敗');
    }
    return await response.text();
  } catch (error) {
    console.error('File fetch error:', error);
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
        // ファイルを追加
        allFiles.push(item);
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
      // TypeScript/React系のファイルはデフォルトで.tsx
      // その他は.jsをデフォルトに
      if (filePath.includes('.tsx') || filePath.includes('.jsx')) {
        resolvedPath = resolvedPath + '.tsx';
      } else {
        resolvedPath = resolvedPath + '.ts';
      }
    }

    return resolvedPath;
  };

  // importを抽出
  let match;
  while ((match = importRegex.exec(withoutComments)) !== null) {
    const resolved = processImport(match[1]);
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

  // 重複を削除
  return [...new Set(dependencies)];
}
