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

// リポジトリの構造を取得する関数（ここが重要！）
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
    console.log('GitHubから取得したデータ:', data); // 👈 これを追加！
    return data as GitHubFile[];
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
