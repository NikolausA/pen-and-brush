import { ButtonPrimary } from '@/components/ordinary';

import styles from './home.module.scss';

export const Home = () => {

  const handleClick = () => {
    console.log('новый проект тест;');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Проекты отсутствуют</h1>
      <ButtonPrimary text="Новый проект" onClick={handleClick}/>
    </div>
  );
};