const projectService = require('../services/project-service.js');

module.exports = {
  getProjects: async (req, res) => {
    try {
      const projects = await projectService.getProjects();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },
  createProject: async (req, res) => {
    try {
      const project = await projectService.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },
  deleteProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      await projectService.deleteProject(projectId);
      res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
};