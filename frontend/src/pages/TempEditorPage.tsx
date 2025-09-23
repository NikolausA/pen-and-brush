// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Editor } from "@/components/smart/Editor/Editor";

export const TempEditorPage = () => {
  // const projectId = undefined;
  const projectId = "1";

  return <Editor projectId={projectId} />;
};
