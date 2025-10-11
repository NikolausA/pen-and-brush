import Konva from "konva";

export interface ExportOptions {
  fileName?: string;
  pixelRatio?: number;
  quality?: number;
  width?: number;
  height?: number;
}

/**
 * Экспорт Konva Stage в PNG файл
 * @param stage - Konva Stage для экспорта
 * @param options - Опции экспорта
 * @returns Результат операции с dataURL
 */
export const exportStageToPNG = (
  stage: Konva.Stage,
  options: ExportOptions = {}
): { success: boolean; dataURL?: string; error?: unknown } => {
  const {
    fileName = `drawing-${new Date().toISOString().slice(0, 10)}.png`,
    pixelRatio = 2, // Высокое качество для четкости
    quality = 1,
  } = options;

  try {
    // Получаем dataURL из stage с высоким качеством
    const dataURL = stage.toDataURL({
      mimeType: "image/png",
      quality,
      pixelRatio,
    });

    // Создаем временную ссылку для скачивания
    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataURL;

    // Добавляем в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ Image exported successfully:", fileName);
    return { success: true, dataURL };
  } catch (error) {
    console.error("❌ Export error:", error);
    return { success: false, error };
  }
};

/**
 * Получить Blob из Stage (для потенциальной отправки на сервер)
 * @param stage - Konva Stage
 * @param options - Опции экспорта
 * @returns Promise с Blob или null
 */
export const stageToBlob = async (
  stage: Konva.Stage,
  options: ExportOptions = {}
): Promise<Blob | null> => {
  const { pixelRatio = 2, quality = 1 } = options;

  return new Promise((resolve) => {
    stage.toBlob({
      callback: (blob) => {
        if (blob) {
          console.log(
            "✅ Blob created, size:",
            (blob.size / 1024).toFixed(2),
            "KB"
          );
        }
        resolve(blob);
      },
      mimeType: "image/png",
      quality,
      pixelRatio,
    });
  });
};

/**
 * Получить preview изображения как dataURL
 * @param stage - Konva Stage
 * @param maxWidth - Максимальная ширина preview
 * @param maxHeight - Максимальная высота preview
 * @returns dataURL для preview
 */
export const getPreviewDataURL = (
  stage: Konva.Stage,
  maxWidth: number = 200,
  maxHeight: number = 200
): string => {
  const stageWidth = stage.width();
  const stageHeight = stage.height();

  // Вычисляем pixelRatio для уменьшенного preview
  const scaleX = maxWidth / stageWidth;
  const scaleY = maxHeight / stageHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  return stage.toDataURL({
    mimeType: "image/png",
    quality: 0.8,
    pixelRatio: scale,
  });
};
