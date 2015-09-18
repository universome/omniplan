import React from 'react';
import moment from 'moment';
import PlanStore from 'stores/PlanStore';
import {view} from 'stores/ConfigStore';
import chartContentGridStyles from './ChartContentGrid.css';

class ChartContentGrid extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
        let columns = [];
        let startDate = getStartDateByPlan(this.props.plan);
        let endDate = getEndDateByPlan(this.props.plan);
        let todayLineStyles = {
            width: view.dayWidth + 'px',
            left: moment().diff(startDate, 'days') * view.dayWidth + 'px',
        }
            
        while (startDate.isBefore(endDate)) {
            let columnTitle = startDate.format('MMMM YYYY');
            let columnStyles = {width: getAmountOfDaysInMonth(startDate) * view.dayWidth + 'px'};

            columns.push(<div className={chartContentGridStyles.chartContentGridColumn} key={columnTitle} style={columnStyles}>{columnTitle}</div>);
            startDate.add(1, 'months');
        }

        return (
            <div className={chartContentGridStyles.chartContentGrid}>
                {columns}
                <span className={chartContentGridStyles.chardContentGridTodayColumn} style={todayLineStyles}></span>
            </div>
        );
    }
};

function getAmountOfDaysInMonth(date) {
    
    let nextMonthFirstDay = moment({ year: date.year(), month: date.month() + 1, date: 1 });
    let monthLastDay = nextMonthFirstDay.add(-1, 'days');

    return monthLastDay.date();
}

function getStartDateByPlan(plan) {
    if (!plan || !plan.creationDate) return moment();
    return moment(plan.creationDate);
}

function getEndDateByPlan(plan) {
    if (!plan || !plan.tasks || !plan.tasks[0]) return moment();
    return moment(plan.tasks[0].endDate);
}

export default ChartContentGrid;
