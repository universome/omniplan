import React from 'react';
import moment from 'moment';
import PlanStore from 'stores/PlanStore';
import {view} from 'stores/ConfigStore';
import chartContentGridStyles from './ChartContentGrid.css';

class ChartContentGrid extends React.Component {
    constructor(...args) {
        super(args);
        this.state = {plan: PlanStore.getPlan()};
    }

    componentDidMount() {
        PlanStore.on('change', plan => this.setState({plan}));
    }

    render() {
        let columns = [];
        let startDate = moment(this.state.plan.creationDate);
        let endDate = PlanStore.getEndDate();
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

export default ChartContentGrid;
