const { Project, Layer } = require('../models/index.js');

module.exports = {
  async createProject(data) {
    const project = await Project.create(data);
    return project;
  },

  async getProjects() {
    return Project.findAll({ include: [{ model: Layer, as: 'layers' }] });
  },

  async deleteProject(projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) throw new Error('Project not found');
    await project.destroy();
  }
};