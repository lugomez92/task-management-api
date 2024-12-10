import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Dropdown, DropdownButton } from 'react-bootstrap';
import axios from 'axios';

const NewUser = ({ token, onClose, onUserCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('engineer');
  const [teamId, setTeamId] = useState(null);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all teams
    axios.get('http://localhost:4000/api/teams', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      setTeams(response.data.teams);
    })
    .catch((err) => setError('Failed to load teams'));
  }, [token]);

  const handleSubmit = () => {
    if (!name || !email || !password) {
      setError('Name, email, and password are required');
      return;
    }

    const newUser = { name, email, password, role, teamId };

    // Create new user
    axios.post('http://localhost:4000/api/users', newUser, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      onUserCreated('User created successfully', response.data.user);
    })
    .catch((err) => {
      setError('Failed to create user');
    });
  };

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <Form.Group controlId="formUserName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group controlId="formRole">
            <Form.Label>Role</Form.Label>
            <DropdownButton
              variant="outline-secondary"
              title={role.charAt(0).toUpperCase() + role.slice(1)}
              onSelect={(role) => setRole(role)}
            >
              <Dropdown.Item eventKey="engineer">Engineer</Dropdown.Item>
              <Dropdown.Item eventKey="pm">PM</Dropdown.Item>
              <Dropdown.Item eventKey="manager">Manager</Dropdown.Item>
            </DropdownButton>
          </Form.Group>
          
          <Form.Group controlId="formTeam">
            <Form.Label>Assign to Team</Form.Label>
            <DropdownButton
              variant="outline-secondary"
              title={teamId ? `Team ${teamId}` : 'Select a team'}
              onSelect={(teamId) => setTeamId(teamId)}
            >
              {teams.map(team => (
                <Dropdown.Item key={team.id} eventKey={team.id}>
                  {team.name}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add User
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewUser;
