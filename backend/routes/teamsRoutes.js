const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');
const { authenticateToken, authorizeRole } = require('../middleware/basicAuth');

// Admin only: Create a new team
router.post('/', authenticateToken, authorizeRole(['admin']), teamsController.createTeam);

// Admin only: Update a team's information
router.put('/:teamId', authenticateToken, authorizeRole(['admin']), teamsController.updateTeam);

// Admin only: Delete a team
router.delete('/:teamId', authenticateToken, authorizeRole(['admin']), teamsController.deleteTeam);

// Admin only: Add engineers to a team
router.post('/:teamId/engineers', authenticateToken, authorizeRole(['admin']), teamsController.addEngineersToTeam);

// Admin only: Remove engineers from a team
router.delete('/:teamId/engineers', authenticateToken, authorizeRole(['admin']), teamsController.removeEngineersFromTeam);

// Admin only: Move user to another team
router.patch('/:teamId/move-user', authenticateToken, authorizeRole(['admin']), teamsController.moveUserToAnotherTeam);

// Admin only: Get team by ID
router.get('/:teamId', authenticateToken, authorizeRole(['admin']), teamsController.getTeam);

// Admin only: Get all teams
router.get('/', authenticateToken, authorizeRole(['admin']), teamsController.getAllTeams);

// Adminm manager, pm & engineer: Get all engineers in a team
router.get('/:teamId/engineers', authenticateToken, authorizeRole(['admin', 'manager', 'pm', 'engineer']), teamsController.getEngineersInTeam);


module.exports = router;
