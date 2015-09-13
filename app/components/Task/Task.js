import React from 'react';
import R from 'ramda';
import taskStyles from './Task.css';

class Task extends React.Component {
    constructor(...args) {
        super(args);
        this.state = {plan: {}};
    }

    render() {
        return (
            <div className={taskStyles.test}></div>
        );
    }
}

export default Task;
