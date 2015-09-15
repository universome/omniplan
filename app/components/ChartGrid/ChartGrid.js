import React from 'react';
import moment from 'moment';
import PlanStore from 'stores/PlanStore';
import {view} from 'stores/ConfigStore';

class ChartGrid extends React.Component {
    constructor(...args) {
        super(args);
        this.state = {
            plan: PlanStore.getPlan()
        };
    }

    componentDidMount() {
        PlanStore.on('change', plan => this.setState({plan}));
    }

    render() {
        let dates = [];
        let startDate = moment(this.state.plan.creationDate);
        let endDate = PlanStore.getEndDate();
        let headerStyles = {
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: 'none'
        }
            
        while (startDate.isBefore(endDate)) {
            let dateTitle = startDate.format('MMMM YYYY');
            let dateStyles = {
                display: 'inline-block',
                border: 'solid grey',
                borderWidth: '0 1px',
                textAlign: 'center',
                height: '100%',
                width: getAmountOfDaysInMonth(startDate) * view.dayWidth + 'px'
            }

            dates.push(<span key={dateTitle} style={dateStyles}>{dateTitle}</span>);
            
            startDate.add(1, 'months');
        }

        return (
            <div style={headerStyles}>{dates}</div>
        );
    }
};

function getAmountOfDaysInMonth(date) {
    
    let monthLastDay = moment({ year: date.year(), month: date.month() + 1, date: 1 }).add(-1, 'days');

    return monthLastDay.date();
}

export default ChartGrid;
