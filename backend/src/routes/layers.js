const express = require('express');
const { createLayer, updateLayer, deleteLayer } = require('../controllers/layer-controller.js');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Layers
 *   description: Layer management within projects
 */

/**
 * @swagger
 * /projects/{projectId}/layers:
 *   get:
 *     summary: Get all layers for a project
 *     tags: [Layers]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: List of layers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Layer'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *     Layer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         projectId:
 *           type: string
 *         name:
 *           type: string
 *         order:
 *           type: integer
 *         isVisible:
 *           type: boolean
 *         opacity:
 *           type: number
 *         data:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
router.get('/:projectId/layers', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await require('../models/index.js').Project.findByPk(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const layers = await require('../services/layer-service.js').getLayers(projectId); // Assuming getLayers is added
    res.status(200).json(layers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /projects/{projectId}/layers:
 *   post:
 *     summary: Create a new layer
 *     tags: [Layers]
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
 *             properties:
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
 *               - name
 *               - order
 *     responses:
 *       201:
 *         description: Layer created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Layer'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.post('/:projectId/layers', createLayer);

/**
 * @swagger
 * /projects/{projectId}/layers/{layerId}:
 *   patch:
 *     summary: Update a layer
 *     tags: [Layers]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
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
 *     responses:
 *       200:
 *         description: Layer updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Layer'
 *       404:
 *         description: Layer not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:projectId/layers/:layerId', updateLayer);

/**
 * @swagger
 * /projects/{projectId}/layers/{layerId}:
 *   delete:
 *     summary: Delete a layer
 *     tags: [Layers]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: layerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the layer
 *     responses:
 *       200:
 *         description: Layer deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Layer not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:projectId/layers/:layerId', deleteLayer);

module.exports = router;