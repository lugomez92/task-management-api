import { Row, Col } from 'react-bootstrap';  
import TaskColumn from './TaskColumn';
const TeamBoard = ({ token, teamId, tasksReady, tasksInProgress, tasksDone, onCardClick }) => {

  return (
    <>
      <Row>
        <Col sm={4}>
          {console.log('Tasks for Ready: ', tasksReady)}
          <TaskColumn title="Ready" tasks={tasksReady} onCardClick={onCardClick}/> 
        </Col>
        <Col sm={4}>
          {console.log('Tasks for In Progress: ', tasksInProgress)}
          <TaskColumn title="In Progress" tasks={tasksInProgress} onCardClick={onCardClick} /> 
        </Col>
        <Col sm={4}>
          {console.log('Tasks for Done: ', tasksDone)}
          <TaskColumn title="Done" tasks={tasksDone} onCardClick={onCardClick}/> 
        </Col>
      </Row>
    </>
  );
};

export default TeamBoard;