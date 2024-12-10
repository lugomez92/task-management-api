import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Container, Tab, Tabs, Table, Dropdown } from 'react-bootstrap';
import { FaUserCircle, FaPen, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import NewTeam from './newTeam';
import NewUser from './newUser';
import EditTeam from './editTeam';
import EditUser from './editUser';
import DeleteTeam from './deleteTeam';
import DeleteUser from './deleteUser';

const Dashboard = ({ token, onLogout }) => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('teams');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all teams
    axios.get(`http://localhost:4000/api/teams`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then((response) => {
      const teamData = response.data.teams;
      const teamPromises = teamData.map(team => {
        // For each team, fetch its members
        return axios.get(`http://localhost:4000/api/teams/${team.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        .then((membersResponse) => {
          console.log(`Members for team ${team.id}: `, membersResponse.data.members);
          // Combine team info with its members
          return {
            ...team,
            members: membersResponse.data.members
          };
        });
      });

      // Wait for all promises to resolve
      Promise.all(teamPromises)
        .then((teamsWithMembers) => {
          console.log('Teams with members: ', teamsWithMembers);
          setTeams(teamsWithMembers);
        });
    })
    .catch((err) => setError('Failed to load teams'));

    // Fetch all users
    console.log('Fetching users...')
    axios.get(`http://localhost:4000/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then((response) => {
      console.log('Users fetched:', response.data.users);
      setUsers(response.data.users);
    })
    .catch((err) => setError('Failed to load users'));
  }, [token]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/'); 
  };

  // New Team
  const handleNewTeamCreated = (msg, newTeam) => {
    setMessage(msg);
    setShowNewTeamModal(false);
    setTeams((prevTeams) => [...prevTeams, newTeam]);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  // New User
  const handleNewUserCreated = (msg, newUser) => {
    setMessage(msg);
    setShowNewUserModal(false);
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  // Delete Team
  const handleDeleteTeam = (teamId) => {
    setSelectedTeamId(teamId);
    setShowDeleteTeamModal(true);
  };

  const handleTeamDeleted = (msg) => {
    setMessage(msg);
    setTeams((prevTeams) => prevTeams.filter((team) => team.id !== selectedTeamId));
    setShowDeleteTeamModal(false);
    setTimeout(() => setMessage(''), 3000);
  };

  // Delete User
  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setShowDeleteUserModal(true); 
  };

  const handleUserDeleted = (msg) => {
    setMessage(msg);
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUserId));
    setShowDeleteUserModal(false); 
    setTimeout(() => setMessage(''), 3000);
  };


  // Edit Team
  const handleEditTeam = (teamId) => {
    setSelectedTeamId(teamId);
    setShowEditTeamModal(true);
  };

  const handleTeamUpdated = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
    setShowEditTeamModal(false);
  };

  // Edit User
  const handleEditUser = (userId) => {
    console.log('Edit user requested for userId:', userId);
    setSelectedUserId(userId);
    setShowEditUserModal(true);
  };
  const handleUserUpdated = (msg) => {
    setMessage(msg);
    setShowEditUserModal(false);
    setTimeout(() => setMessage(''), 3000);
  }

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand href="#">Dashboard</Navbar.Brand>
          <Navbar.Collapse id="navbarNav" className="d-flex justify-content-between">
            {/* Quick Actions Menu */}
            <Nav className="mr-auto d-flex">
              <NavDropdown title="Quick Actions" id="quick-actions-dropdown" menuVariant="dark">
                <NavDropdown.Item onClick={() => setShowNewTeamModal(true)}>New Team</NavDropdown.Item>
                <NavDropdown.Item onClick={() => setShowNewUserModal(true)}>New User</NavDropdown.Item>
              </NavDropdown>
            </Nav>

            {/* User Profile Dropdown - Logout */}
            <Nav className="ml-auto">
              <Dropdown>
                <Dropdown.Toggle as="div" className="d-flex align-items-center text-light" style={{ cursor: 'pointer' }}>
                  <FaUserCircle size={30} />
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Tab Navigation */}
      <Container className="mt-4">
        <Tabs
          id="dashboard-tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          {/* Teams Tab */}
          <Tab eventKey="teams" title="Teams">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Manager</th>
                  <th>PM</th>
                  <th>Engineers</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td>{team.name}</td>
                    <td className='text-dark fs-6'>{team.members?.find(member => member.role === 'manager')?.name || 'N/A'}</td>
                    <td className='text-dark fs-6'>{team.members?.find(member => member.role === 'pm')?.name || 'N/A'}</td>
                    <td className='text-dark fs-6'>{team.members?.filter(member => member.role === 'engineer').map((engineer) => engineer.name).join(', ') || 'N/A'}</td>
                    <td>
                    <Dropdown>
                     <Dropdown.Toggle variant="link" id="dropdown-basic" className="p-0">
                     </Dropdown.Toggle>
                     <Dropdown.Menu>
                       <Dropdown.Item onClick={() => handleEditTeam(team.id)}>
                         <FaPen/> Edit Team
                        </Dropdown.Item>
                       <Dropdown.Item onClick={() => handleDeleteTeam(team.id)}>
                         <FaTrashAlt /> Delete Team
                        </Dropdown.Item>
                     </Dropdown.Menu>
                    </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          {/* Users Tab */}
          <Tab eventKey="users" title="Users">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.teamId ? `Team ${user.teamId}` : 'No team'}</td>
                    <td>
                    <Dropdown>
                     <Dropdown.Toggle variant="link" id="dropdown-basic" className="p-0">
                     </Dropdown.Toggle>
                     <Dropdown.Menu>
                       <Dropdown.Item onClick={() => handleEditUser(user.id)}>
                         <FaPen/> Edit User
                        </Dropdown.Item>
                       <Dropdown.Item onClick={() => handleDeleteUser(user.id)}>
                         <FaTrashAlt /> Delete User
                        </Dropdown.Item>
                     </Dropdown.Menu>
                    </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
      </Container>

      {/* Error handling */}
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div className="alert alert-success mt-3" role="alert">
          {message}
        </div>
      )}

      {/* Show NewTeam Modal */}
      {showNewTeamModal && (
        <NewTeam
          token={token}
          onClose={() => setShowNewTeamModal(false)}
          onTeamCreated={handleNewTeamCreated}
        />
      )}

      {/* Show NewUser Modal */}
      {showNewUserModal && (
        <NewUser
          token={token}
          onClose={() => setShowNewUserModal(false)}
          onUserCreated={handleNewUserCreated}
        />
      )}

      {/* Show EditTeam Modal */}
      {showEditTeamModal && (
        <EditTeam
          token={token}
          teamId={selectedTeamId}
          onClose={() => setShowEditTeamModal(false)}
          onTeamUpdated={handleTeamUpdated}
        />
      )}

      {/* Show EditUserModal */}
      {showEditUserModal && (
        <EditUser
          token={token}
          userId={selectedUserId}
          onClose={() => setShowEditUserModal(false)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Show DeleteTeam Modal */}
      {showDeleteTeamModal && (
        <DeleteTeam
          token={token}
          teamId={selectedTeamId}
          onClose={() => setShowDeleteTeamModal(false)}
          onTeamDeleted={handleTeamDeleted}
        />
      )}

      {/* Show DeleteUser Modal */}
      {showDeleteUserModal && (
        <DeleteUser
          token={token}
          userId={selectedUserId}
          onClose={() => setShowDeleteUserModal(false)}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </>
  );
};

export default Dashboard;
