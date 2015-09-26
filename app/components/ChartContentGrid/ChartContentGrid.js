import React from 'react';
import moment from 'moment';
import PlanStore from 'stores/PlanStore';
import SettingsStore from 'stores/SettingsStore';
import getAmountOfDaysInMonth from 'helpers/getAmountOfDaysInMonth';
import getEndDateByPlan from 'helpers/getEndDateByPlan';
import getStartDateByPlan from 'helpers/getStartDateByPlan';
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
            width: SettingsStore.get('dayWidth') + 'px',
            left: moment().diff(startDate, 'days') * SettingsStore.get('dayWidth') + 'px',
        }
            
        while (startDate.isBefore(endDate)) {
            let columnTitle = startDate.format('MMMM YYYY');
            let columnStyles = {width: getAmountOfDaysInMonth(startDate) * SettingsStore.get('dayWidth') + 'px'};

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

export default ChartContentGrid;
