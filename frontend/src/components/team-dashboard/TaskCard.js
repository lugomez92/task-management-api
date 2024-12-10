import React from 'react';
import { Card, DropdownButton, Dropdown, Badge } from 'react-bootstrap';
import { FaExclamationCircle, FaClipboardList } from 'react-icons/fa';

function TaskCard({ task, onStatusChange, role, activeTab, onCardClick }) {
  let borderClass;
  let bgClass;
  let priorityBadge;

  // Set classes based on priority
  switch (task.priority) {
    case 'High':
      borderClass = 'border-danger';
      bgClass = 'bg-light-danger';
      priorityBadge = <Badge bg="danger">High</Badge>;
      break;
    case 'Medium':
      borderClass = 'border-warning';
      bgClass = 'bg-light-warning';
      priorityBadge = <Badge bg="warning">Medium</Badge>;
      break;
    case 'Low':
      borderClass = 'border-success';
      bgClass = 'bg-light-success';
      priorityBadge = <Badge bg="success">Low</Badge>;
      break;
    default:
      borderClass = 'border-secondary';
      bgClass = 'bg-light-secondary';
      priorityBadge = <Badge bg="secondary">None</Badge>;
  }

  const handleStatusChange = (newStatus) => {
    onStatusChange(task.id, newStatus);
  };

  const handleMoveToClick = (e) => {
    e.stopPropagation();
  };

  const statusOptions = () => {
    switch (task.status) {
      case 'Ready':
        return ['In Progress', 'Done'];
      case 'In Progress':
        return ['Ready', 'Done'];
      case 'Done':
        return ['Ready', 'In Progress'];
      default:
        return [];
    }
  };

  return (
    <Card
      className={`mb-3 ${borderClass} ${bgClass} border-3 shadow-sm rounded-3`}
      onClick={() => onCardClick(task.id)}
      style={{ cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title className="mb-0">{task.title}</Card.Title>
          {priorityBadge}
        </div>
        <Card.Text className="text-muted">
          <FaClipboardList className="me-2" />
          {task.description}
        </Card.Text>
        <Card.Text>
          <FaExclamationCircle className="me-2" />
          <strong>Status:</strong> {task.status}
        </Card.Text>
        {role === 'engineer' && activeTab === 'myBoard' && (
          <DropdownButton
            variant="outline-secondary"
            id="dropdown-basic-button"
            title="Move to..."
            align="end"
            onClick={handleMoveToClick}
            className="mt-3"
          >
            {statusOptions().map((status) => (
              <Dropdown.Item key={status} onClick={() => handleStatusChange(status)}>
                Move to {status}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        )}
      </Card.Body>
    </Card>
  );
}

export default TaskCard;
