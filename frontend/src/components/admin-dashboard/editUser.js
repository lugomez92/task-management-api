import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const EditUser = ({ token, userId, onClose, onUserUpdated }) => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');

useEffect(() => {
  axios.get(`http://localhost:4000/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  .then((response) => {
    const { name, email, role, teamId } = response.data.user;
    setUser(response.data.user);
    setName(name);
    setEmail(email);
    setRole(role);
    setTeamId(teamId);
  })
  .catch((err) => {
    console.log('Error fetching user details:', err);
    setError('Failed to load user details');
  });

  axios.get('http://localhost:4000/api/teams', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  .then((response) => {
    setTeams(response.data.teams);
  })
  .catch((err) => {
    setError('Failed to load teams');
  });
}, [userId, token]);

const handleSubmit = (e) => {
  e.preventDefault();
  const updatedUser = { name, email, role, teamId };

  axios.put(`http://localhost:4000/api/users/${userId}`, updatedUser, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  .then((response) => {
    onUserUpdated(response.data.message, response.data.updatedUser);
    onClose();
  })
  .catch((err) => {
    setError('Failed to update user');
  });
};

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Control
              as="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="pm">PM</option>
              <option value="engineer">Engineer</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="teamId">
            <Form.Label>Team</Form.Label>
            <Form.Control
              as="select"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Modal.Footer>
          <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditUser;