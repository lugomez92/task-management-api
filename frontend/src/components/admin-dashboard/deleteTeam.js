import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

const DeleteTeam = ({ token, teamId, onClose, onTeamDeleted }) => {

  const handleDelete = () => {
    axios.delete(`http://localhost:4000/api/teams/${teamId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      onTeamDeleted('Team deleted successfully');
    })
    .catch((err) => {
      console.error('Failed to delete team:', err);
      onTeamDeleted('Error deleting team');
    });
  };

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Team</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this team?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={handleDelete}>Delete Team</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteTeam;
