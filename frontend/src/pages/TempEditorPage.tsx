// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Editor } from "@/components/smart/editor/editor";

export const TempEditorPage = () => {
  // const projectId = undefined;
  const projectId = "1";

  return <Editor projectId={projectId} />;
};
