import { GitBranch, FolderPlus } from 'lucide-react';
import { theme } from '../styles/theme';

interface HeaderProps {
  title: string;
  onNewProject?: () => void;
}

function Header({ title, onNewProject }: HeaderProps) {
  const headerStyle = {
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: `${theme.spacing.md} 0`,
    boxShadow: theme.shadow.sm,
  };

  const containerStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    padding: `0 ${theme.spacing.lg}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'white',
    letterSpacing: '-0.5px',
  };

  const navStyle = {
    display: 'flex',
    gap: theme.spacing.sm,
  };

  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={logoStyle}>
          <GitBranch color='white' size={28} />
          <h1 style={titleStyle}>{title}</h1>
        </div>
        <nav style={navStyle}>
          <button
            style={{
              ...buttonStyle,
              gap: theme.spacing.sm,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            }}
            onClick={onNewProject || (() => {})}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            title='新しいプロジェクト'
          >
            <FolderPlus size={20} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              新しいプロジェクト
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
