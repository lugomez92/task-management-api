import React from "react";
import { Modal, Button } from 'react-bootstrap';
import axios from "axios";

const DeleteUser = ({ token, userId, onClose, onUserSelected, onUserDeleted }) => {
    const handleDelete = () => {
        axios.delete(`http://localhost:4000/api/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then (() => {
            onUserSelected('User deleted successfully');
        })
        .catch((err) => {
            console.error('Failed to delete user: ', err);
            onUserDeleted('Error deleting user');
        });
    };

    return (
        <Modal show={true} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Delete User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete this user?
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={onClose}>Cancel</Button>
                <Button variant='danger' onClick={handleDelete}>Delete User</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteUser;