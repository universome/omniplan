import React from 'react';
import PlanStore from 'stores/PlanStore';

class CalendarHeader extends React.Component {
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
        var startDate = '';
        var dates = [];

        if (this.state.plan.creationDate) {
            var startDate = Number(this.state.plan.creationDate.slice(8, 10));
            for (let i = 0; i < 20; i++) {
                dates.push(<span key={startDate + i} style={{display: 'inline-block', width: 23, border: 'solid grey', borderWidth: '0 1px', textAlign: 'center'}}>{startDate + i}</span>);
            }
        }

        return (
            <div>
                <div>
                    <h2>CalendarHeader {startDate}</h2>
                </div>
                <div>
                    {dates}
                </div>
            </div>
        );
    }
};

export default CalendarHeader;
