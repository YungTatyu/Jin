import React from 'react';
import Link from 'next/link';
import styles from '../../styles/Header/JinLogo.module.css';

const JinLogo: React.FC = () => {
  return (
    <Link href="/" className={styles.logo}>
      Jin
    </Link>
  );
};

export default JinLogo;
