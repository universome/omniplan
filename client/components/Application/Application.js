import React from 'react';
// import styles from './Application.styl';
import Calendar from 'components/Calendar/Calendar';
import CalendarHeader from 'components/CalendarHeader';

class Application extends React.Component {
    render() {
        return (
            <div>
                <div>
                    <h1>Application</h1>
                </div>
                <div>
                    <CalendarHeader />
                    <Calendar />
                </div>
            </div>
        );
    }
};

export default Application;
