import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Dropdown, DropdownButton } from 'react-bootstrap';
import axios from 'axios';

const NewTeam = ({ token, onClose, onTeamCreated }) => {
  const [teamName, setTeamName] = useState('');
  const [manager, setManager] = useState(null);
  const [pm, setPm] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [availablePMs, setAvailablePMs] = useState([]);
  const [availableEngineers, setAvailableEngineers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all users with their roles (Manager, PM, Engineer)
    axios.get('http://localhost:4000/api/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      const users = response.data.users;
      setAvailableManagers(users.filter(user => user.role === 'manager'));
      setAvailablePMs(users.filter(user => user.role === 'pm'));
      setAvailableEngineers(users.filter(user => user.role === 'engineer'));
    })
    .catch(err => {
      setError('Failed to fetch users');
    });
  }, [token]);

  const handleSubmit = () => {
    if (!teamName) {
      setError('Team Name is required');
      return;
    }

    const teamData = {
      name: teamName,
      managerId: manager ? manager.id : null,
      pmId: pm ? pm.id : null,
      engineerIds: engineers.map(e => e.id)
    };

    // Create team
    axios.post('http://localhost:4000/api/teams', teamData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      const newTeam = response.data.team;
      onTeamCreated('Team created successfully!', newTeam);
      onClose();
    })
    .catch(err => {
      setError('Error creating team');
    });
  };

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>New Team</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form>
          <Form.Group controlId="teamName">
            <Form.Label>Team Name</Form.Label>
            <Form.Control
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="manager">
            <Form.Label>Manager</Form.Label>
            <DropdownButton
              variant="outline-secondary"
              title={manager ? manager.name : 'Select Manager'}
              onSelect={(e) => setManager(availableManagers.find(m => m.id === parseInt(e)))}
            >
              {availableManagers.map(m => (
                <Dropdown.Item key={m.id} eventKey={m.id}>{m.name}</Dropdown.Item>
              ))}
            </DropdownButton>
          </Form.Group>

          <Form.Group controlId="pm">
            <Form.Label>Product Manager</Form.Label>
            <DropdownButton
              variant="outline-secondary"
              title={pm ? pm.name : 'Select PM'}
              onSelect={(e) => setPm(availablePMs.find(p => p.id === parseInt(e)))}
            >
              {availablePMs.map(p => (
                <Dropdown.Item key={p.id} eventKey={p.id}>{p.name}</Dropdown.Item>
              ))}
            </DropdownButton>
          </Form.Group>

          <Form.Group controlId="engineers">
            <Form.Label>Engineers</Form.Label>
            <DropdownButton
              variant="outline-secondary"
              title="Select Engineers"
              onSelect={(e) => {
                const engineer = availableEngineers.find(e => e.id === parseInt(e));
                if (engineer && !engineers.includes(engineer)) {
                  setEngineers(prevState => [...prevState, engineer]);
                }
              }}
            >
              {availableEngineers.map(e => (
                <Dropdown.Item key={e.id} eventKey={e.id}>{e.name}</Dropdown.Item>
              ))}
            </DropdownButton>
            <div className="mt-2">
              {engineers.map(e => (
                <span key={e.id} className="badge badge-primary mr-1">{e.name}</span>
              ))}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add Team
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewTeam;
