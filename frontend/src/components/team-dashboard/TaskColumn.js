import React from 'react';
import { Card } from 'react-bootstrap';
import TaskCard from './TaskCard';

function TaskColumn({ title, tasks = [], onStatusChange, role, activeTab, onCardClick }) {
  return (
    <Card className="task-column shadow-sm h-100">
      {/* Column Header */}
      <Card.Header className="text-center bg-dark text-light rounded-top">
        <h5 className="mb-0">{title}</h5>
      </Card.Header>

      {/* Task List */}
      <Card.Body className="overflow-auto" style={{ maxHeight: '60vh' }}>
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <TaskCard
              key={index}
              task={task}
              onStatusChange={onStatusChange}
              role={role}
              activeTab={activeTab}
              onCardClick={onCardClick}
            />
          ))
        ) : (
          <p className="text-center text-muted">No tasks available</p>
        )}
      </Card.Body>
    </Card>
  );
}

export default TaskColumn;