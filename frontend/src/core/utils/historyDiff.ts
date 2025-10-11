import type { Layer } from "@/core/types/interfaces/entities";
import type { GraphicObject } from "@/core/types/interfaces/igraphic-objects";

export const computeDiffAndDeleteObjects = async (
  prevLayers: Layer[],
  deletedLayers: Layer[],
  currentLayers: Layer[],
  updateLayer: any,
  projectId: string
): Promise<boolean> => {
  let deletedAny = false;

  console.log("🔍 [DIFF] Starting diff computation");
  console.log("🔍 [DIFF] Prev layers count:", prevLayers.length);
  console.log("🔍 [DIFF] Deleted layers count:", deletedLayers.length);
  console.log("🔍 [DIFF] Current layers count:", currentLayers.length);

  for (const prevLayer of prevLayers) {
    const deletedLayer = deletedLayers.find((l) => l.id === prevLayer.id);
    const currentLayer = currentLayers.find((l) => l.id === prevLayer.id);

    if (!deletedLayer || !currentLayer) {
      console.warn("⚠️ [DIFF] Layer not found in deleted or current state");
      continue;
    }

    // IDs объектов из снимков
    const prevIds = new Set(prevLayer.data.map((obj: GraphicObject) => obj.id));
    const deletedIds = new Set(
      deletedLayer.data.map((obj: GraphicObject) => obj.id)
    );

    console.log(`🔍 [DIFF] Layer ${prevLayer.name}:`);
    console.log("  - Prev objects:", Array.from(prevIds));
    console.log("  - Deleted snapshot objects:", Array.from(deletedIds));

    // Объекты, добавленные в удаляемом шаге: deleted - prev
    const addedInStepIds = [...deletedIds].filter((id) => !prevIds.has(id));

    if (addedInStepIds.length === 0) {
      console.log("  - No objects to delete (empty diff)");
      continue;
    }

    console.log(
      `🗑️ [DIFF] Found ${addedInStepIds.length} objects to delete:`,
      addedInStepIds
    );

    // Текущие объекты в слое
    const currentObjectIds = currentLayer.data.map(
      (obj: GraphicObject) => obj.id
    );
    console.log("  - Current objects in layer:", currentObjectIds);

    // Фильтруем: удаляем только те, что были добавлены в удаляемом шаге
    const updatedData = currentLayer.data.filter(
      (obj: GraphicObject) => !addedInStepIds.includes(obj.id)
    );

    console.log(`  - Objects after filtering: ${updatedData.length}`);
    console.log(
      "  - Remaining object IDs:",
      updatedData.map((o: GraphicObject) => o.id)
    );

    try {
      // КРИТИЧНО: Явное обновление с полными данными слоя
      const updateResult = await updateLayer({
        layerId: prevLayer.id,
        projectId,
        data: {
          name: currentLayer.name,
          order: currentLayer.order,
          isVisible: currentLayer.isVisible,
          opacity: currentLayer.opacity,
          data: updatedData, // Обновленный массив объектов
        },
      }).unwrap();

      console.log("✅ [DIFF] Layer updated successfully:", updateResult);
      console.log(
        "✅ [DIFF] Server returned data length:",
        updateResult.data?.length
      );

      deletedAny = true;
    } catch (error) {
      console.error("❌ [DIFF] Failed to update layer:", error);
    }
  }

  console.log(`🔍 [DIFF] Diff completed. Deleted any objects: ${deletedAny}`);
  return deletedAny;
};
