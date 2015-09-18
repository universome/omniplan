import React from 'react';
import ChartContent from 'components/ChartContent';
import ChartNav from 'components/ChartNav';
import ChartSuggest from 'components/ChartSuggest';
import ChartStyles from './Chart.css';

class Chart extends React.Component {
    render() {
        return (
        	<div>
        		<ChartSuggest />
	            <div className={ChartStyles.Chart}>
	                <ChartNav />
	                <ChartContent />
	            </div>
        	</div>
        );
    }
};

export default Chart;
