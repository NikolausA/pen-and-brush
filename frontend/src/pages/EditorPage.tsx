// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useParams } from "react-router-dom";
import { Editor } from "@/components/smart/Editor/Editor";

export const EditorPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return <Editor projectId={projectId} />;
};
