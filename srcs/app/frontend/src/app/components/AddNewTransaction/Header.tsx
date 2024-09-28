import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/AddNewTransaction/Header.module.css';

const Header: React.FC = () => {
  const router = useRouter();

  const handleHome = () => {
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <button
        onClick={handleHome}
        className={styles.backButton}
        aria-label="Go to home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.backIcon}
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
    </header>
  );
};

export default Header;
