const Team = require('../models/teams');
const User = require('../models/users');

const createTeam = async (req, res) => {
  const { name, managerId, pmId } = req.body;
  try {
    const newTeam = await Team.create({ name, managerId, pmId });
    return res.status(201).json({ message: 'Team created successfully', team: newTeam });
  } catch (err) {
    console.error('Error creating team:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

const getTeam = async (req, res) => {
  const { teamId } = req.params;
  try {
    const team = await Team.findById(teamId);
    const members = await Team.getTeamMembers(teamId);
    return res.status(200).json({ team, members });
  } catch (err) {
    console.error('Error fetching team:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll();
    return res.status(200).json({ teams });
  } catch (err) {
    console.error('Error fetching all teams:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all engineers in a specific team
const getEngineersInTeam = async (req, res) => {
  const { teamId } = req.params;
  try {
    const engineers = await Team.getEngineersInTeam(teamId);
    return res.status(200).json({ engineers });
  } catch (err) {
    console.error('Error fetching engineers in team: ', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTeam = async (req, res) => {
  const { teamId } = req.params;
  const { name, managerId, pmId } = req.body;
  try {
    const updatedTeam = await Team.update(teamId, { name, managerId, pmId });
    return res.status(200).json({ message: 'Team updated successfully', team: updatedTeam });
  } catch (err) {
    console.error('Error updating team:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add multiple engineers to team.
const addEngineersToTeam = async (req, res) => {
  const { teamId } = req.params;
  const { engineerIds } = req.body;

  if (!Array.isArray(engineerIds) || engineerIds.length === 0) {
    return res.status(400).json({ message: 'Engineer IDs must be a non-empty array' });
  }

  try {
    await Team.addEngineers(teamId, engineerIds);
    return res.status(200).json({ message: 'Engineer/s added to team successfully', engineerIds });
  } catch (err) {
    console.error('Error adding engineers:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove one or multiple engineers from a team.
const removeEngineersFromTeam = async (req, res) => {
  const { teamId } = req.params;
  const { engineerIds } = req.body;

  if (!Array.isArray(engineerIds) || engineerIds.length === 0) {
    return res.status(400).json({ message: 'Engineer IDs must be a non-empty array' });
  }

  console.log(`Attempting to remove engineers with IDs ${engineerIds} from team ${teamId}`);

  try {
    const engineersInTeam = await Team.getEngineersInTeam(teamId);
    console.log('Engineers in team:', engineersInTeam);
    console.log('Engineers to be removed:', engineerIds);

    const engineerExists = engineerIds.every(engineerId =>
      engineersInTeam.some(engineer => engineer.id === parseInt(engineerId))
    );

    if (!engineerExists) {
      console.log(`One or more engineers with IDs ${engineerIds} not found in team ${teamId}`);
      return res.status(404).json({ message: 'One or more engineers not found in team' });
    }

    await Team.removeEngineers(teamId, engineerIds);
    console.log(`Engineers with IDs ${engineerIds} removed from team ${teamId}`);
    return res.status(200).json({ message: 'Engineer/s removed from team successfully' });
  } catch (err) {
    console.error('Error removing engineers:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Could be handled by updateUser - keeping here for clarity.
const moveUserToAnotherTeam = async (req, res) => {
  const { userId, newTeamId } = req.body;
  if (!userId || !newTeamId) {
    return res.status(400).json({ message: 'Both userId and newTeamId are required' });
  }
  
  try {
    await Team.moveUserToTeam(userId, newTeamId);
    return res.status(200).json({ message: 'User moved to new team' });
  } catch (err) {
    console.error('Error moving user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteTeam = async (req, res) => {
  const { teamId } = req.params;
  try {
    await Team.deleteTeam(teamId);
    return res.status(200).json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Error deleting team:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createTeam,
  getTeam,
  getAllTeams,
  getEngineersInTeam,
  addEngineersToTeam,
  removeEngineersFromTeam,
  moveUserToAnotherTeam,
  deleteTeam,
  updateTeam
};
