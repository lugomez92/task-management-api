import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap'; 
import TaskColumn from './TaskColumn';  

const EngineerBoard = ({ token, engineerId, teamId, onCardClick }) => {
  const [tasksReady, setTasksReady] = useState([]);
  const [tasksInProgress, setTasksInProgress] = useState([]);
  const [tasksDone, setTasksDone] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/tasks/engineer/${engineerId}`, {
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
  }, [token, engineerId, teamId]);

  return (
    <>
      <Row>
        <Col sm={4}>
          <TaskColumn title="Ready" tasks={tasksReady} onCardClick={onCardClick}/> 
        </Col>
        <Col sm={4}>
          <TaskColumn title="In Progress" tasks={tasksInProgress} onCardClick={onCardClick}/>
        </Col>
        <Col sm={4}>
          <TaskColumn title="Done" tasks={tasksDone} onCardClick={onCardClick}/> 
        </Col>
      </Row>
    </>
  );
};

export default EngineerBoard;

