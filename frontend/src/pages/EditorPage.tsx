import { useParams } from 'react-router-dom';
import { Editor } from '@/components/smart/Editor';

export const EditorPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <Editor projectId={projectId} />
  );
};
