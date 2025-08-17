const layerService = require('../services/layer-service.js');

module.exports = {
  createLayer: async (req, res) => {
    try {
      const { projectId } = req.params;
      const layer = await layerService.createLayer(projectId, req.body);
      res.status(201).json(layer);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },
  updateLayer: async (req, res) => {
    try {
      const { projectId, layerId } = req.params;
      const layer = await layerService.updateLayer(projectId, layerId, req.body);
      res.status(200).json(layer);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },
  deleteLayer: async (req, res) => {
    try {
      const { projectId, layerId } = req.params;
      await layerService.deleteLayer(projectId, layerId);
      res.status(200).json({ message: 'Layer deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
};