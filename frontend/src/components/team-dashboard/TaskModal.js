import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';

const TaskModal = ({ taskId, onClose, token, onTaskUpdated, onTaskDeleted, setMessage, role }) => {
  const [task, setTask] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [updatedTask, setUpdatedTask] = useState({
    title: '',
    description: '',
    priority: '',
    status: '',
    comments: '',
    dueDate: '',  
    assignedTo: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskResponse = await axios.get(`http://localhost:4000/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTask(taskResponse.data.task);
        setUpdatedTask({
          title: taskResponse.data.task.title,
          description: taskResponse.data.task.description,
          priority: taskResponse.data.task.priority,
          status: taskResponse.data.task.status,
          comments: taskResponse.data.task.comments || '',
          dueDate: taskResponse.data.task.dueDate || '',  
          assignedTo: taskResponse.data.task.assignedTo || '',
        });

        const engineersResponse = await axios.get(`http://localhost:4000/api/teams/${taskResponse.data.task.teamId}/engineers`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEngineers(engineersResponse.data.engineers);
      } catch (error) {
        console.error('Error fetching task or engineers: ', error);
        setError('Error fetching task details or engineers.');
      }
    };    
    if (taskId) fetchData();
  }, [taskId, token]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onTaskDeleted(taskId, task.title);
      setMessage(`Task "${task.title}" deleted successfully.`);
      setTimeout(() => setMessage(''), 3000);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const taskToUpdate = { ...updatedTask };
      if (taskToUpdate.assignedTo === '') {
        taskToUpdate.assignedTo = null;
      }
    
      const response = await axios.put(
        `http://localhost:4000/api/tasks/${taskId}`,
        updatedTask,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onTaskUpdated(response.data.task); 
      setMessage('Task updated successfully.');  
      setTimeout(() => setMessage(''), 3000);
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Error updating task.')
    }
  };

  const handleDeleteConfirm = () => setShowDeleteConfirm(true);
  const handleCancelDelete = () => setShowDeleteConfirm(false);

  if (!task || !engineers.length) return <div>Loading...</div>;
  const isEngineer = role === 'engineer';

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="taskTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={updatedTask.title}
              onChange={(e) => setUpdatedTask({ ...updatedTask, title: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="taskDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              value={updatedTask.description}
              onChange={(e) => setUpdatedTask({ ...updatedTask, description: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="taskPriority">
            <Form.Label>Priority</Form.Label>
            <Form.Control
              as="select"
              value={updatedTask.priority}
              onChange={(e) => setUpdatedTask({ ...updatedTask, priority: e.target.value })}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="taskStatus">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              value={updatedTask.status}
              onChange={(e) => setUpdatedTask({ ...updatedTask, status: e.target.value })}
            >
              <option>Ready</option>
              <option>In Progress</option>
              <option>Done</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="taskComments">
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              value={updatedTask.comments}
              onChange={(e) => setUpdatedTask({ ...updatedTask, comments: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="taskDueDate">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={updatedTask.dueDate}
              onChange={(e) => setUpdatedTask({ ...updatedTask, dueDate: e.target.value })}
            />
          </Form.Group>

          {/* Assigned to Dropdown */}
          <Form.Group controlId="taskAssignedTo">
            <Form.Label>Assigned To</Form.Label>
            <Form.Control
              as="select" 
              value={updatedTask.assignedTo || ''}
              onChange={(e) => {
                const selectedValue = e.target.value === '' ? null : e.target.value;
                setUpdatedTask({ ...updatedTask, assignedTo: selectedValue });
                }}
            >
              <option value="">Unassigned</option>
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
        <OverlayTrigger
          placement="top"
          overlay={
            isEngineer ? (
              <Tooltip>You don't have permission to update tasks</Tooltip>
            ) : (
              <></>
            )
          }
        >
          <span className="d-inline-block">
            <Button variant="primary" onClick={handleUpdate} disabled={isEngineer}>
              Update
            </Button>
          </span>
        </OverlayTrigger>
        <OverlayTrigger
          placement="top"
          overlay={
            isEngineer ? (
              <Tooltip>You don't have permission to delete tasks</Tooltip>
            ) : (
              <></>
            )
          }
        >
          <span className="d-inline-block">
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={isEngineer}>
              Delete
            </Button>
          </span>
        </OverlayTrigger>
      </Modal.Footer>

      {/* Delete confirmation */}
      <Modal show={showDeleteConfirm} onHide={handleCancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this task?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default TaskModal;
