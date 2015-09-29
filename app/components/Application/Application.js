import React from 'react';
import Chart from 'components/Chart';
import TaskDetails from 'components/TaskDetails';
import ApplicationStyles from './Application.css';

class Application extends React.Component {
    render() {
        return (
            <div className={ApplicationStyles.Application}>
            	<TaskDetails />
                <Chart />
            </div>
        );
    }
};

export default Application;
