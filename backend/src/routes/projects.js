const express = require('express');
const { createProject, getProjects, deleteProject, updateProject } = require('../controllers/project-controller.js');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         width:
 *           type: integer
 *         height:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         layers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Layer'
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
router.get('/', getProjects);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       500:
 *         description: Internal server error
 */
router.post('/', createProject);

/**
 * @swagger
 * /projects/{projectId}:
 *   patch:
 *     summary: Update a project and its layers
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
 *             properties:
 *               name:
 *                 type: string
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *               layers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Layer'
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:projectId', updateProject);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:projectId', deleteProject);

module.exports = router;