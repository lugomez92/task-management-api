import React, { useState, useEffect } from 'react';
import { Container, Tab, Tabs, Row, Col, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

import AddTaskModal from './AddTaskModal';
import EngineerBoard from './EngineerBoard';
import MyBoard from './MyBoard';
import Navbar from './Navbar';
import TaskModal from './TaskModal';
import TeamBoard from './TeamBoard';

const TeamDashboard = ({ token, role, teamId, userId, onLogout }) => {
  const [engineers, setEngineers] = useState([]);
  const [activeTab, setActiveTab] = useState(role === 'engineer' ? 'myBoard' : 'teamBoard');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [tasksReady, setTasksReady] = useState([]);
  const [tasksInProgress, setTasksInProgress] = useState([]);
  const [tasksDone, setTasksDone] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [message, setMessage] = useState('');
  
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/tasks/', {
          headers: { Authorization: `Bearer ${token}` },
        });
      const tasks = response.data.tasks;
      console.log('Fetched Tasks: ', tasks);
      setTasksReady(tasks.filter(task => task.status === 'Ready'));
      setTasksInProgress(tasks.filter(task => task.status === 'In Progress'));
      setTasksDone(tasks.filter(task => task.status === 'Done'));
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [teamId, token]);

  useEffect(() => {
    const fetchEngineers = async () => {
      if (role === 'manager') {
        try {
          const response = await axios.get(`http://localhost:4000/api/teams/${teamId}/engineers`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEngineers(response.data.engineers);
        } catch (err) {
          console.error('Error fetching engineers:', err);
        }
      }
    };
    fetchEngineers();
  }, [role, teamId, token]);

  const handleTabSelect = (key) => {
    setActiveTab(key);
  };

  const handleCardClick = (id) => {
    setTaskId(id);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdated = (msg) => {
    console.log('Updating Task...');
    fetchTasks();
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTaskDeleted = (msg) => {
    console.log('Deleting Task...');
    fetchTasks();
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddTaskClick = () => {
    setIsAddTaskModalOpen(true);
  };

  const closeModal = () => {
    setIsAddTaskModalOpen(false);
    setIsTaskModalOpen(false);
    setTaskId(null);
  };

  const handleTaskCreated = (msg) => {
    console.log('Creating Task...');
    fetchTasks();
    setMessage(msg);
  };

  return (
    <div>
      <Navbar onLogout={onLogout} />
      <Container className='mt-4'>
        {(role === 'manager' || role === 'pm') && (
          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <Button variant="success" onClick={handleAddTaskClick}>+ Add Task</Button>
            </Col>
          </Row>
        )}
        <Tabs id="team-dashboard-tabs" activeKey={activeTab} onSelect={handleTabSelect} className="mb-3">
          <Tab eventKey="teamBoard" title="Team Board">
            <TeamBoard 
              token={token} 
              teamId={teamId} 
              tasksReady={tasksReady}
              tasksInProgress={tasksInProgress}
              tasksDone={tasksDone}
              onCardClick={handleCardClick}

            />
          </Tab>
          {role === 'engineer' && (
            <Tab eventKey="myBoard" title="My Board">
              <MyBoard 
                token={token} 
                userId={userId} 
                role={role} 
                activeTab={activeTab} 
                onCardClick={handleCardClick}   
              />
            </Tab>
          )}
          {role === 'manager' &&
            engineers.map((engineer) => (
              <Tab eventKey={`engineer-${engineer.id}`} title={engineer.name} key={engineer.id}>
                <EngineerBoard 
                  token={token} 
                  engineerId={engineer.id} 
                  tasksReady={tasksReady}
                  tasksInProgress={tasksInProgress}
                  tasksDone={tasksDone}
                  onCardClick={handleCardClick}

                />
              </Tab>
            ))}
        </Tabs>
      </Container>

      {message && <Alert variant="success">{message}</Alert>}

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        closeModal={closeModal}
        teamId={teamId}
        token={token}
        onTaskCreated={handleTaskCreated}
        setMessage={setMessage}
      />

      {taskId && (
        <TaskModal
          taskId={taskId}
          onClose={closeModal}
          token={token}
          onTaskDeleted={handleTaskDeleted}
          onTaskUpdated={handleTaskUpdated}
          setMessage={setMessage}
          role={role}
        />
      )}
    </div>
  );
};

export default TeamDashboard;