import { Pane, Button, Heading, majorScale, TextInput } from 'evergreen-ui';
import { FiSearch } from 'react-icons/fi';

import type { IHeaderProps } from '@/core/types/interfaces/iui/iheader';

import styles from './header-home.module.scss';

export const HeaderHome = ({
  title,
  buttonText,
  searchQuery,
  onButtonClick,
  onSearchChange,
}: IHeaderProps) => {
  return (
    <Pane className={styles.container}>
      <Pane className={styles.headerRow}>
        <Heading size={900} fontWeight={800} color="#1E293B">
          {title}
        </Heading>
        <Button
          appearance="primary"
          intent="success"
          height={majorScale(6)}
          fontSize="16px"
          paddingX={majorScale(3)}
          borderRadius={8}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </Pane>
      <Pane className={styles.searchWrapper}>
        <FiSearch className={styles.searchIcon} />
        <TextInput
          placeholder="Поиск проектов..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </Pane>
    </Pane>
  );
};
