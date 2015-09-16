import React from 'react';
import ChartContent from 'components/ChartContent';
import ChartNav from 'components/ChartNav';
import ChartStyles from './Chart.css';

class Chart extends React.Component {
    render() {
        return (
            <div className={ChartStyles.Chart}>
                <ChartNav />
                <ChartContent />
            </div>
        );
    }
};

export default Chart;
