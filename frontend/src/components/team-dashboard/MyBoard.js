import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Row, Col } from 'react-bootstrap';  
import TaskColumn from './TaskColumn';  

const MyBoard = ({ token, role, activeTab, onCardClick }) => {
  const [tasksReady, setTasksReady] = useState([]);
  const [tasksInProgress, setTasksInProgress] = useState([]);
  const [tasksDone, setTasksDone] = useState([]);

  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/tasks/engineer/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tasks = response.data.tasks;
        setTasksReady(tasks.filter(task => task.status === 'Ready'));
        setTasksInProgress(tasks.filter(task => task.status === 'In Progress'));
        setTasksDone(tasks.filter(task => task.status === 'Done'));
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchTasks();
  }, [token, userId]);

  const handleStatusChange = (taskId, newStatus) => {
    const updateTaskStatus = async () => {
      try {
        const response = await axios.patch(
          `http://localhost:4000/api/tasks/${taskId}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedTask = response.data.task;
        console.log('Updated Task: ', updatedTask);

        // Update local state for each task column
        setTasksReady((prevTasks) => prevTasks.filter(task => task.id !== updatedTask.id));
        setTasksInProgress((prevTasks) => prevTasks.filter(task => task.id !== updatedTask.id));
        setTasksDone((prevTasks) => prevTasks.filter(task => task.id !== updatedTask.id));

        if (updatedTask.status === 'Ready') {
          setTasksReady((prevTasks) => [...prevTasks, updatedTask]);
        } else if (updatedTask.status === 'In Progress') {
          setTasksInProgress((prevTasks) => [...prevTasks, updatedTask]);
        } else if (updatedTask.status === 'Done') {
          setTasksDone((prevTasks) => [...prevTasks, updatedTask]);
        }
      } catch (err) {
        console.error('Error updating task status:', err);
      }
    };

  updateTaskStatus();
};

  return (
    <>
      <Row>
        <Col sm={4}>
          <TaskColumn 
           title="Ready" 
           tasks={tasksReady} 
           onStatusChange={handleStatusChange} 
           role={role} 
           activeTab={activeTab} 
           onCardClick={onCardClick} 
           />
        </Col>
        <Col sm={4}>
          <TaskColumn 
           title="In Progress" 
           tasks={tasksInProgress} 
           onStatusChange={handleStatusChange} 
           role={role} 
           activeTab={activeTab}
           onCardClick={onCardClick}
          />
        </Col>
        <Col sm={4}>
          <TaskColumn 
           title="Done" 
           tasks={tasksDone} 
           onStatusChange={handleStatusChange} 
           role={role} 
           activeTab={activeTab}
           onCardClick={onCardClick}
          />
        </Col>
      </Row>
    </>
  );
};


export default MyBoard;
