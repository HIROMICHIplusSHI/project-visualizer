// data/sampleReactProject.ts
// Reactプロジェクトのデモ用サンプルデータ

import type { GitHubFile } from '../services/githubApi';

// リアルなReactプロジェクトのサンプルデータ
export const sampleReactProject: GitHubFile[] = [
  // App.tsx - メインアプリケーション
  {
    id: 1,
    name: 'App.tsx',
    path: 'src/App.tsx',
    type: 'file',
    size: 2847,
    lineCount: 89,
    dependencies: [
      'src/components/Header.tsx',
      'src/hooks/useFileManagement.ts',
      'src/hooks/useRealtimeMonitoring.ts',
      'src/hooks/useFileFiltering.ts',
      'src/components/layouts/WelcomeSection.tsx',
      'src/components/layouts/ProjectInputSection.tsx',
      'src/components/layouts/FileListSection.tsx',
      'src/components/layouts/MainViewSection.tsx',
      'src/components/layouts/StatusSection.tsx',
      'src/hooks/useLocalStorage.ts',
      'src/App.css'
    ],
    content: `import './App.css';
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
  // Custom hooks for project visualization
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

  // File filtering and view management
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

  return (
    <div className="App">
      <Header title="Project Visualizer" onNewProject={clearAll} />
      <WelcomeSection show={files.length === 0} onDemoClick={() => {}} />
      <ProjectInputSection show={files.length === 0} />
      <FileListSection 
        files={filteredFiles}
        fileFilter={fileFilter}
        onFileFilterChange={setFileFilter}
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
    </div>
  );
}

export default App;`
  },

  // Components
  {
    id: 2,
    name: 'Header.tsx',
    path: 'src/components/Header.tsx',
    type: 'file',
    size: 567,
    lineCount: 15,
    dependencies: ['src/components/UserCard.tsx', 'src/styles/components.css'],
    content: `import React from 'react';
import { UserCard } from './UserCard';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="header">
      <h1>Todo App</h1>
      <UserCard user={user} onLogout={onLogout} />
    </header>
  );
};`
  },

  {
    id: 3,
    name: 'Sidebar.tsx',
    path: 'src/components/Sidebar.tsx',
    type: 'file',
    size: 892,
    lineCount: 28,
    dependencies: ['src/utils/helpers.ts', 'src/styles/components.css'],
    content: `import React from 'react';
import { formatDate } from '../utils/helpers';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>Dashboard</li>
          <li>Tasks</li>
          <li>Calendar</li>
          <li>Settings</li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>Today: {formatDate(new Date())}</p>
      </div>
    </aside>
  );
};`
  },

  {
    id: 4,
    name: 'UserCard.tsx',
    path: 'src/components/UserCard.tsx',
    type: 'file',
    size: 1234,
    lineCount: 42,
    dependencies: ['src/utils/api.ts'],
    content: `import React, { useState } from 'react';
import { updateUserProfile } from '../utils/api';

interface UserCardProps {
  user: User | null;
  onLogout: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  if (!user) {
    return <div>Please login</div>;
  }

  const handleSave = async (userData: Partial<User>) => {
    await updateUserProfile(user.id, userData);
    setIsEditing(false);
  };

  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};`
  },

  {
    id: 5,
    name: 'TodoList.tsx',
    path: 'src/components/TodoList.tsx',
    type: 'file',
    size: 2156,
    lineCount: 67,
    dependencies: ['src/hooks/useTodos.ts', 'src/utils/helpers.ts', 'src/styles/components.css'],
    content: `import React, { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { formatDate, generateId } from '../utils/helpers';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (todo: Todo) => void;
  onToggleTodo: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
}) => {
  const [newTodoText, setNewTodoText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      onAddTodo({
        id: generateId(),
        text: newTodoText,
        completed: false,
        createdAt: new Date(),
      });
      setNewTodoText('');
    }
  };

  return (
    <div className="todo-list">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add new todo..."
        />
        <button type="submit">Add</button>
      </form>
      
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <small>{formatDate(todo.createdAt)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};`
  },

  // Hooks
  {
    id: 6,
    name: 'useAuth.ts',
    path: 'src/hooks/useAuth.ts',
    type: 'file',
    size: 1089,
    lineCount: 35,
    dependencies: ['src/utils/api.ts', 'src/types/types.ts'],
    content: `import { useState, useEffect } from 'react';
import { authenticateUser, logoutUser } from '../utils/api';
import type { User } from '../types/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await authenticateUser(email, password);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    localStorage.removeItem('user');
  };

  return { user, loading, login, logout };
};`
  },

  {
    id: 7,
    name: 'useTodos.ts',
    path: 'src/hooks/useTodos.ts',
    type: 'file',
    size: 1456,
    lineCount: 48,
    dependencies: ['src/utils/api.ts', 'src/utils/helpers.ts', 'src/types/types.ts'],
    content: `import { useState, useEffect } from 'react';
import { fetchTodos, createTodo, updateTodo } from '../utils/api';
import { generateId } from '../utils/helpers';
import type { Todo } from '../types/types';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const todoData = await fetchTodos();
        setTodos(todoData);
      } catch (error) {
        console.error('Failed to load todos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  const addTodo = async (todo: Omit<Todo, 'id'>) => {
    const newTodo = { ...todo, id: generateId() };
    setTodos(prev => [...prev, newTodo]);
    await createTodo(newTodo);
  };

  const toggleTodo = async (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  };

  return { todos, loading, addTodo, toggleTodo };
};`
  },

  // Utils
  {
    id: 8,
    name: 'api.ts',
    path: 'src/utils/api.ts',
    type: 'file',
    size: 723,
    lineCount: 23,
    dependencies: [],
    content: `const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const authenticateUser = async (email: string, password: string) => {
  const response = await fetch(\`\${API_BASE}/auth/login\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

export const logoutUser = async () => {
  await fetch(\`\${API_BASE}/auth/logout\`, { method: 'POST' });
};

export const fetchTodos = async () => {
  const response = await fetch(\`\${API_BASE}/todos\`);
  return response.json();
};

export const createTodo = async (todo: Todo) => {
  const response = await fetch(\`\${API_BASE}/todos\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo)
  });
  return response.json();
};`
  },

  {
    id: 9,
    name: 'helpers.ts',
    path: 'src/utils/helpers.ts',
    type: 'file',
    size: 945,
    lineCount: 31,
    dependencies: [],
    content: `export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str: string, length: number): string => {
  return str.length > length ? str.slice(0, length) + '...' : str;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};`
  },

  // CSS Files
  {
    id: 10,
    name: 'App.css',
    path: 'src/App.css',
    type: 'file',
    size: 1234,
    lineCount: 45,
    dependencies: [],
    content: `/* App.css - メインアプリケーションスタイル */
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.app-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #ffffff;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f3f4f6;
}

.todo-list {
  max-width: 600px;
}`
  },

  {
    id: 11,
    name: 'components.css',
    path: 'src/styles/components.css',
    type: 'file',
    size: 892,
    lineCount: 32,
    dependencies: [],
    content: `/* components.css - コンポーネント専用スタイル */
.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #ffffff;
  transition: all 0.2s;
}

.todo-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.todo-item.completed {
  opacity: 0.6;
  background: #f3f4f6;
}

.todo-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}`
  },

  // Configuration Files
  {
    id: 12,
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    size: 1567,
    lineCount: 47,
    dependencies: [],
    content: `{
  "name": "react-todo-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.4",
    "@testing-library/react": "^13.3.0",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.5.2",
    "@types/node": "^16.11.47",
    "@types/react": "^18.0.15",
    "@types/react-dom": "^18.0.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.7.4",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/**/*.{ts,tsx}",
    "typecheck": "tsc --noEmit"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@types/testing-library__jest-dom": "^5.14.5"
  }
}`
  },

  // Test Files
  {
    id: 13,
    name: 'App.test.tsx',
    path: 'src/__tests__/App.test.tsx',
    type: 'file',
    size: 678,
    lineCount: 24,
    dependencies: ['src/App.tsx'],
    content: `import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders todo app title', () => {
    render(<App />);
    const titleElement = screen.getByText(/todo app/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders sidebar navigation', () => {
    render(<App />);
    const dashboardLink = screen.getByText('Dashboard');
    const tasksLink = screen.getByText('Tasks');
    expect(dashboardLink).toBeInTheDocument();
    expect(tasksLink).toBeInTheDocument();
  });

  test('renders main content area', () => {
    render(<App />);
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
  });
});`
  },

  {
    id: 14,
    name: 'TodoList.test.tsx',
    path: 'src/__tests__/TodoList.test.tsx',
    type: 'file',
    size: 1045,
    lineCount: 38,
    dependencies: ['src/components/TodoList.tsx'],
    content: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoList } from '../components/TodoList';

const mockTodos = [
  { id: '1', text: 'Test todo 1', completed: false, createdAt: new Date() },
  { id: '2', text: 'Test todo 2', completed: true, createdAt: new Date() }
];

const mockProps = {
  todos: mockTodos,
  onAddTodo: jest.fn(),
  onToggleTodo: jest.fn()
};

describe('TodoList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders todo items', () => {
    render(<TodoList {...mockProps} />);
    expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test todo 2')).toBeInTheDocument();
  });

  test('calls onToggleTodo when checkbox is clicked', () => {
    render(<TodoList {...mockProps} />);
    const checkboxes = screen.getAllByType('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(mockProps.onToggleTodo).toHaveBeenCalledWith('1');
  });

  test('adds new todo on form submit', () => {
    render(<TodoList {...mockProps} />);
    const input = screen.getByPlaceholderText('Add new todo...');
    const submitBtn = screen.getByText('Add');
    
    fireEvent.change(input, { target: { value: 'New todo' } });
    fireEvent.click(submitBtn);
    
    expect(mockProps.onAddTodo).toHaveBeenCalled();
  });
});`
  },

  // 独立したファイル（依存関係なし）
  {
    id: 15,
    name: 'constants.ts',
    path: 'src/constants/constants.ts',
    type: 'file',
    size: 456,
    lineCount: 18,
    dependencies: [],
    content: `// constants.ts - アプリケーション定数
export const API_ENDPOINTS = {
  TODOS: '/api/todos',
  USERS: '/api/users',
  AUTH: '/api/auth'
} as const;

export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b'
} as const;

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PREFERENCES: 'user_prefs'
} as const;`
  },

  {
    id: 16,
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    size: 892,
    lineCount: 28,
    dependencies: [],
    content: `# React Todo App

A modern todo application built with React, TypeScript, and modern hooks.

## Features

- ✅ Add, edit, and delete todos
- 🔄 Real-time updates
- 💾 Local storage persistence
- 🎨 Modern UI with CSS modules
- 🧪 Comprehensive testing

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## Scripts

- \`npm start\` - Start development server
- \`npm build\` - Build for production
- \`npm test\` - Run tests
- \`npm run lint\` - Run ESLint

## Tech Stack

- React 18
- TypeScript
- Jest & React Testing Library
- CSS Modules`
  },

  {
    id: 17,
    name: 'types.ts',
    path: 'src/types/types.ts',
    type: 'file',
    size: 387,
    lineCount: 15,
    dependencies: [],
    content: `// types.ts - TypeScript型定義
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  userId?: string;
}`
  },

  {
    id: 18,
    name: 'tsconfig.json',
    path: 'tsconfig.json',
    type: 'file',
    size: 567,
    lineCount: 24,
    dependencies: [],
    content: `{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}`
  }
];

// デモプロジェクトの基本情報
export const sampleProjectInfo = {
  name: 'React Todo App',
  description: 'TypeScript + React Hooksを使ったモダンなTodoアプリケーション',
  fileCount: 18,
  totalLines: 633,
  dependencies: [
    'React Components (4ファイル)',
    'Custom Hooks (2ファイル)', 
    'Utility Functions (2ファイル)',
    'Styles (2ファイル)',
    'Tests (2ファイル)',
    'Config/Types (4ファイル)',
    'Main App (1ファイル)',
    'Docs (1ファイル)'
  ]
};