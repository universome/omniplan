import React from 'react';
// import styles from './Application.styl';
import Chart from 'components/Chart';
import ChartGrid from 'components/ChartGrid';

class Application extends React.Component {
    render() {
        return (
            <div>
                <h2>Omniplan</h2>  
                <div style={{position: 'relative'}}>
                    <ChartGrid />
                    <Chart />
                </div>
            </div>
        );
    }
};

export default Application;
