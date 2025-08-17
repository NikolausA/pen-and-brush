const { Layer, Project } = require('../models/index.js');

module.exports = {
  async createLayer(projectId, data) {
    const project = await Project.findByPk(projectId);
    if (!project) throw new Error('Project not found');
    const layer = await Layer.create({ ...data, projectId: projectId }); // Use projectId key
    return layer;
  },

  async updateLayer(projectId, layerId, data) {
    const layer = await Layer.findOne({ where: { id: layerId, projectId: projectId } });
    if (!layer) throw new Error('Layer not found');
    await layer.update(data);
    return layer;
  },

  async deleteLayer(projectId, layerId) {
    const layer = await Layer.findOne({ where: { id: layerId, projectId: projectId } });
    if (!layer) throw new Error('Layer not found');
    await layer.destroy();
  }
};