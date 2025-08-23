const { Project, Layer } = require('../models/index.js');
const { Sequelize } = require('sequelize');

module.exports = {
  async createProject(data) {
    const project = await Project.create(data);
    return project;
  },

  async getProjects() {
    return Project.findAll({ include: [{ model: Layer, as: 'layers' }] });
  },

  async updateProject(projectId, data) {
    const transaction = await Project.sequelize.transaction();
    try {
      const project = await Project.findByPk(projectId, {
        include: [{ model: Layer, as: 'layers' }],
        transaction,
      });
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedProject = await project.update(
        {
          name: data.name,
          width: data.width,
          height: data.height,
          updatedAt: new Date(),
        },
        { transaction }
      );

      const incomingLayerIds = (data.layers || []).map(layer => layer.id).filter(Boolean);
      const existingLayerIds = project.layers.map(layer => layer.id);

      await Layer.destroy({
        where: {
          projectId,
          id: { [Sequelize.Op.notIn]: incomingLayerIds },
        },
        transaction,
      });
      const layerPromises = (data.layers || []).map(async layer => {
        if (layer.id && existingLayerIds.includes(layer.id)) {
          // Update existing layer
          const existingLayer = await Layer.findByPk(layer.id, { transaction });
          if (existingLayer) {
            await existingLayer.update(
              {
                name: layer.name,
                order: layer.order,
                isVisible: layer.isVisible ?? true,
                opacity: layer.opacity ?? 100,
                data: layer.data || {},
                updatedAt: new Date(),
              },
              { transaction }
            );
          }
        } else {
          await Layer.create(
            {
              ...layer,
              projectId,
              isVisible: layer.isVisible ?? true,
              opacity: layer.opacity ?? 100,
              data: layer.data || {},
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { transaction }
          );
        }
      });

      await Promise.all(layerPromises);

      const finalProject = await Project.findByPk(projectId, {
        include: [{ model: Layer, as: 'layers' }],
        transaction,
      });

      await transaction.commit();
      return finalProject;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async deleteProject(projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) throw new Error('Project not found');
    await project.destroy();
  },
};