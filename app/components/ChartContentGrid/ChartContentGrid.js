import React from 'react';
import moment from 'moment';
import PlanStore from 'stores/PlanStore';
import SettingsStore from 'stores/SettingsStore';
import getAmountOfDaysInMonth from 'helpers/getAmountOfDaysInMonth';
import getEndDateByPlan from 'helpers/getEndDateByPlan';
import getStartDateByPlan from 'helpers/getStartDateByPlan';
import ChartContentGridStyles from './ChartContentGrid.css';

class ChartContentGrid extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
        let columns = [];
        let startDate = getStartDateByPlan(this.props.plan);
        let endDate = getEndDateByPlan(this.props.plan);
        let todayLineStyles = {
            width: SettingsStore.get('dayWidth') + 'px',
            left: moment().diff(startDate, 'days') * SettingsStore.get('dayWidth') + 'px',
        }
            
        while (startDate.isBefore(endDate)) {
            columns.push(<ChartContentGridColumn key={startDate.format()} startDate={moment(startDate)} />);
            startDate.add(1, 'months');
        }

        return (
            <div className={ChartContentGridStyles.chartContentGrid}>
                {columns}
                <span className={ChartContentGridStyles.chardContentGridTodayColumn} style={todayLineStyles}></span>
            </div>
        );
    }
};

class ChartContentGridColumn extends React.Component {
	constructor(...args) {
        super(args);
    }

    render() {
    	let startDate = this.props.startDate;
    	let title = startDate.format('MMMM YYYY');
    	let style = {width: getAmountOfDaysInMonth(startDate) * SettingsStore.get('dayWidth') + 'px'};

    	return (
    		<div className={ChartContentGridStyles.chartContentGridColumn} style={style}>
    			<div className={ChartContentGridStyles.ColumnHeader} style={{height: SettingsStore.get('chartGridHeaderHeight') + 'px'}}>{title}</div>
    		</div>
		);
    }
}

export default ChartContentGrid;
