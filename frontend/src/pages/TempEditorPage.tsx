import { Editor } from '@/components/smart/Editor';

export const TempEditorPage = () => {
  // const projectId = undefined;
  const projectId = '1';

  return (
    <Editor projectId={projectId} />
  );
};
