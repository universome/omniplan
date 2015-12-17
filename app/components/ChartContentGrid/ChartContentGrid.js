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
            display: startDate.isBefore(moment()) ? 'block' : 'none'
        }

        while (startDate.isBefore(endDate)) {
            columns.push(<ChartContentGridMonthColumn key={startDate.format()} startDate={moment(startDate)} />);
            startDate.add(1, 'months');
        }

        return (
            <div className={ChartContentGridStyles.chartContentGrid}>
                {columns}
                <span className={ChartContentGridStyles.Today} style={todayLineStyles}></span>
            </div>
        );
    }
};

class ChartContentGridMonthColumn extends React.Component {
	constructor(...args) {
        super(args);
    }

    render() {
    	let startDate = this.props.startDate;
    	let amountOfDays = getAmountOfDaysInMonth(startDate);
    	let title = startDate.format('MMMM YYYY');
    	let style = {width: amountOfDays * SettingsStore.get('dayWidth') + 'px'};
    	let days = Array
    		.apply(null, {length: amountOfDays})
    		.map(Number.call, Number)
    		.map((day, i) => <ChartContentGridDayColumn date={startDate.clone().add(i)} key={i} />)

    	return (
    		<div className={ChartContentGridStyles.chartContentGridColumn} style={style}>
    			<p className={ChartContentGridStyles.ColumnHeader} style={{height: SettingsStore.get('chartGridHeaderHeight') + 'px'}}>{title}</p>
    			<div className={ChartContentGridStyles.DaysColumns}>{days}</div>
    		</div>
		);
    }
}

class ChartContentGridDayColumn extends React.Component {
	constructor(...args) {
        super(args);
    }

    render() {
    	let date = this.props.date;
    	let styles = {width: SettingsStore.get('dayWidth') + 'px'};

    	return <div className={ChartContentGridStyles.DayColumn} style={styles} />;
    }
}

export default ChartContentGrid;
