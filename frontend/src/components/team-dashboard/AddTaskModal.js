import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const AddTaskModal = ({ isOpen, closeModal, teamId, token, onTaskCreated, setMessage }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Ready');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [engineers, setEngineers] = useState([]);
  const [error, setError] = useState('');

  // Fetch engineers for the dropdown
  useEffect(() => {
    if (!teamId || !token) return;
    axios.get(`http://localhost:4000/api/teams/${teamId}/engineers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => setEngineers(response.data.engineers))
      .catch (err => console.error('Error fetching engineers:', err));
  }, [teamId, token]); 

  const validateForm = () => {
    if (!title || !description || !dueDate || !priority) {
      setError('Title, description, due date, and priority are required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:4000/api/tasks', {
        title,
        description,
        status,
        assignedTo,
        dueDate,
        priority
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      onTaskCreated(response.data.task);
      setMessage('Task created successfully.')
      setTimeout(() => setMessage(''), 3000);
      closeModal();  
    } catch (err) {
      setError('Error creating task, please try again later.');
    }
  };

  return (
    <Modal show={isOpen} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formTaskTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formTaskDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formTaskStatus">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Ready">Ready</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formTaskDueDate">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formTaskPriority">
            <Form.Label>Priority</Form.Label>
            <Form.Control
              as="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              <option value="">Select Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formTaskAssignedTo">
            <Form.Label>Assign to</Form.Label>
            <Form.Control
              as="select"
              value={assignedTo || ''}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Select Engineer</option>
              {engineers.map((engineer) => (
                <option key={engineer.id} value={engineer.id}>
                  {engineer.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Add Task</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddTaskModal;
