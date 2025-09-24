const express = require('express');
const { validate: isUUID } = require('uuid');
const { Project, Layer, History } = require('./models.js');

const router = express.Router();

// ==== PROJECTS ====

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.findAll({ 
      include: [{ model: Layer, as: 'layers' }] 
    });
    res.json(projects || []);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *             required:
 *               - name
 *               - width
 *               - height
 *     responses:
 *       201:
 *         description: Project created
 */
router.post('/projects', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /projects/{projectId}:
 *   patch:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Project updated
 */
router.patch('/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!isUUID(projectId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Invalid projectId format' });
    }

    const project = await Project.findByPk(projectId, {
      include: [{ model: Layer, as: 'layers' }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await project.update({
      name: req.body.name,
      width: req.body.width,
      height: req.body.height,
      updatedAt: new Date()
    });

    // Если есть слои для обновления
    if (req.body.layers && Array.isArray(req.body.layers)) {
      const incomingLayerIds = req.body.layers.map(layer => layer.id).filter(Boolean);
      const existingLayerIds = project.layers.map(layer => layer.id);

      // Удаляем слои, которых нет в новом списке
      await Layer.destroy({
        where: {
          projectId,
          id: { [require('sequelize').Op.notIn]: incomingLayerIds }
        }
      });

      // Обновляем или создаем слои
      const layerPromises = req.body.layers.map(async layer => {
        if (layer.id && existingLayerIds.includes(layer.id)) {
          // Обновляем существующий слой
          const existingLayer = await Layer.findByPk(layer.id);
          if (existingLayer) {
            await existingLayer.update({
              name: layer.name,
              order: layer.order,
              isVisible: layer.isVisible !== undefined ? layer.isVisible : true,
              opacity: layer.opacity !== undefined ? layer.opacity : 100,
              data: layer.data || {},
              updatedAt: new Date()
            });
          }
        } else {
          // Создаем новый слой
          await Layer.create({
            ...layer,
            projectId,
            isVisible: layer.isVisible !== undefined ? layer.isVisible : true,
            opacity: layer.opacity !== undefined ? layer.opacity : 100,
            data: layer.data || {}
          });
        }
      });

      await Promise.all(layerPromises);
    }

    const finalProject = await Project.findByPk(projectId, {
      include: [{ model: Layer, as: 'layers' }]
    });

    res.json(finalProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: Project deleted
 */
router.delete('/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!isUUID(projectId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Invalid projectId format' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ==== LAYERS ====

/**
 * @swagger
 * /layers:
 *   get:
 *     summary: Get all layers for a project
 *     tags: [Layers]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: List of layers
 */
router.get('/layers', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Bad request', message: 'projectId is required' });
    }

    if (!isUUID(projectId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Invalid projectId format' });
    }

    // Проверяем что проект существует
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Получаем слои с сортировкой
    const layers = await Layer.findAll({ 
      where: { projectId },
      order: [['order', 'ASC']]
    });
    
    console.log(`Found ${layers.length} layers for project ${projectId}`);
    res.json(layers);
  } catch (error) {
    console.error('Error getting layers:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /layers:
 *   post:
 *     summary: Create a new layer
 *     tags: [Layers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *               name:
 *                 type: string
 *               order:
 *                 type: integer
 *               isVisible:
 *                 type: boolean
 *               opacity:
 *                 type: number
 *               data:
 *                 type: object
 *             required:
 *               - projectId
 *               - name
 *               - order
 *     responses:
 *       201:
 *         description: Layer created
 */
router.post('/layers', async (req, res) => {
  try {
    const { projectId, name, order } = req.body;

    if (!projectId || !isUUID(projectId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Valid projectId is required' });
    }

    if (!name || typeof order !== 'number') {
      return res.status(400).json({ error: 'Bad request', message: 'Name and order are required' });
    }

    // Проверяем что проект существует
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const layer = await Layer.create({ 
      ...req.body, 
      projectId,
      isVisible: req.body.isVisible !== undefined ? req.body.isVisible : true,
      opacity: req.body.opacity !== undefined ? req.body.opacity : 100.0,
      data: req.body.data || {}
    });

    console.log('Layer created successfully:', layer.id);
    res.status(201).json(layer);
  } catch (error) {
    console.error('Error creating layer:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /layers/{layerId}:
 *   patch:
 *     summary: Update a layer
 *     tags: [Layers]
 *     parameters:
 *       - in: path
 *         name: layerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the layer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *             required:
 *               - projectId
 *     responses:
 *       200:
 *         description: Layer updated
 */
router.patch('/layers/:layerId', async (req, res) => {
  try {
    const { layerId } = req.params;
    const { projectId } = req.body;

    if (!isUUID(layerId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Invalid layerId format' });
    }

    if (!projectId || !isUUID(projectId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Valid projectId is required' });
    }

    const layer = await Layer.findOne({ where: { id: layerId, projectId } });
    if (!layer) {
      return res.status(404).json({ error: 'Layer not found' });
    }

    await layer.update(req.body);
    console.log('Layer updated successfully');
    res.json(layer);
  } catch (error) {
    console.error('Error updating layer:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /layers/{layerId}:
 *   delete:
 *     summary: Delete a layer
 *     tags: [Layers]
 *     parameters:
 *       - in: path
 *         name: layerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the layer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *             required:
 *               - projectId
 *     responses:
 *       200:
 *         description: Layer deleted
 */
router.delete('/layers/:layerId', async (req, res) => {
  try {
    const { layerId } = req.params;
    const { projectId } = req.body;

    if (!isUUID(layerId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Invalid layerId format' });
    }

    if (!projectId || !isUUID(projectId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Valid projectId is required' });
    }

    const layer = await Layer.findOne({ where: { id: layerId, projectId } });
    if (!layer) {
      return res.status(404).json({ error: 'Layer not found' });
    }

    await layer.destroy();
    console.log('Layer deleted successfully');
    res.json({ message: 'Layer deleted' });
  } catch (error) {
    console.error('Error deleting layer:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ==== HISTORY ====

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get all history records for a project
 *     tags: [History]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: List of history records
 */
router.get('/history', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Bad request', message: 'projectId is required' });
    }

    if (!isUUID(projectId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Invalid projectId format' });
    }

    // Проверяем что проект существует
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Получаем историю с сортировкой по дате создания (новые сверху)
    const history = await History.findAll({ 
      where: { projectId },
      order: [['createdAt', 'DESC']],
      limit: 100 // Ограничиваем количество записей
    });
    
    console.log(`Found ${history.length} history records for project ${projectId}`);
    res.json(history);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /history:
 *   post:
 *     summary: Add a new history record
 *     tags: [History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *               layerId:
 *                 type: string
 *                 nullable: true
 *               action:
 *                 type: string
 *               data:
 *                 type: object
 *             required:
 *               - projectId
 *               - action
 *     responses:
 *       201:
 *         description: History record created
 */
router.post('/history', async (req, res) => {
  try {
    const { projectId, layerId, action, data } = req.body;

    if (!projectId || !isUUID(projectId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Valid projectId is required' });
    }

    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'Bad request', message: 'Action is required' });
    }

    // Проверяем что проект существует
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Если указан layerId, проверяем что слой существует
    if (layerId) {
      if (!isUUID(layerId)) {
        return res.status(400).json({ error: 'Bad request', message: 'Invalid layerId format' });
      }
      
      const layer = await Layer.findOne({ where: { id: layerId, projectId } });
      if (!layer) {
        return res.status(404).json({ error: 'Layer not found' });
      }
    }

    const historyRecord = await History.create({ 
      projectId,
      layerId: layerId || null,
      action,
      data: data || {}
    });

    console.log('History record created successfully:', historyRecord.id);
    res.status(201).json(historyRecord);
  } catch (error) {
    console.error('Error creating history record:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /history/{historyId}:
 *   delete:
 *     summary: Delete a history record
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: historyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the history record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *             required:
 *               - projectId
 *     responses:
 *       200:
 *         description: History record deleted
 */
router.delete('/history/:historyId', async (req, res) => {
  try {
    const { historyId } = req.params;
    const { projectId } = req.body;

    if (!isUUID(historyId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Invalid historyId format' });
    }

    if (!projectId || !isUUID(projectId)) {
      return res.status(400).json({ error: 'Bad request', message: 'Valid projectId is required' });
    }

    const historyRecord = await History.findOne({ where: { id: historyId, projectId } });
    if (!historyRecord) {
      return res.status(404).json({ error: 'History record not found' });
    }

    await historyRecord.destroy();
    console.log('History record deleted successfully');
    res.json({ message: 'History record deleted' });
  } catch (error) {
    console.error('Error deleting history record:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;