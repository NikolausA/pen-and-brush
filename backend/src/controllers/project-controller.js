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
  updateProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      const updatedProject = await projectService.updateProject(projectId, req.body);
      res.status(200).json(updatedProject);
    } catch (error) {
      if (error.message === 'Project not found') {
        res.status(404).json({ error: 'Project not found', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error', message: error.message });
      }
    }
  },
  deleteProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      await projectService.deleteProject(projectId);
      res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
      if (error.message === 'Project not found') {
        res.status(404).json({ error: 'Project not found', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error', message: error.message });
      }
    }
  },
};