import { useState } from 'react';
import { Pane, majorScale } from 'evergreen-ui';
import { NewProjectModal } from '@/components/simple';
import { ProjectList } from '@/components/smart';
import { HeaderHome } from '@/components/ui';

export const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([
    { id: '1', name: 'My Project 1' },
    { id: '2', name: 'My Project 2' },
    { id: '3', name: 'My Project 3' },
    { id: '4', name: 'My Project 4' },
    { id: '5', name: 'My Project 5' },
    { id: '6', name: 'My Project 6' }
  ]);

  const handleClick = () => setIsModalOpen(true);

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Pane 
      padding={majorScale(4)} 
      display="flex" 
      flexDirection="column" 
      alignItems="center"
      maxWidth={1200}
      width="100%"
      margin="auto"
    >
      <HeaderHome
        title="Мои проекты" buttonText="Новый проект"
        searchQuery={searchQuery} onButtonClick={handleClick}
        onSearchChange={setSearchQuery}
      />
      <ProjectList projects={filteredProjects} onDelete={handleDelete} />
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={() => { console.log('create')}}/>
    </Pane>
  );
};