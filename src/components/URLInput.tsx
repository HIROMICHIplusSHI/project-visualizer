import { useState } from 'react';

interface URLInputProps {
  onSubmit: (url: string) => void;
}

const URLInput: React.FC<URLInputProps> = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue(''); // 送信後クリア
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px',
      }}
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='https://github.com/user/repo'
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            border: '2px solid #e1e4e8',
            borderRadius: '6px',
            minWidth: '300px',
          }}
        />
        <button
          type='submit'
          style={{
            padding: '10px 20px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          読み込み
        </button>
      </div>
    </form>
  );
};

export default URLInput;
