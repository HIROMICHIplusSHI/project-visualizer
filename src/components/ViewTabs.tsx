import { List, GitBranch, Columns } from 'lucide-react';
import { theme } from '../styles/theme';

interface ViewTabsProps {
  currentView: 'list' | 'graph' | 'split';
  onViewChange: (view: 'list' | 'graph' | 'split') => void;
}

function ViewTabs({ currentView, onViewChange }: ViewTabsProps) {
  const containerStyle = {
    display: 'flex',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
  };

  const getTabStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: isActive ? 'white' : 'transparent',
    border: isActive
      ? `1px solid ${theme.colors.border}`
      : '1px solid transparent',
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? theme.colors.primary : theme.colors.secondary,
    transition: 'all 0.2s ease',
    boxShadow: isActive ? theme.shadow.sm : 'none',
  });

  const tabs = [
    { id: 'list', label: 'リストビュー', icon: List },
    { id: 'graph', label: 'グラフビュー', icon: GitBranch },
    { id: 'split', label: '分割ビュー', icon: Columns },
  ];

  return (
    <div style={containerStyle}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          style={getTabStyle(currentView === id)}
          onClick={() => onViewChange(id as 'list' | 'graph' | 'split')}
          onMouseEnter={(e) => {
            if (currentView !== id) {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = theme.shadow.sm;
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== id) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </div>
  );
}

export default ViewTabs;
