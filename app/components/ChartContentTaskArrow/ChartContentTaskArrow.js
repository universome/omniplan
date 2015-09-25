import React from 'react';
import {view} from 'stores/ConfigStore';
import moment from 'moment';
import ChartContentTaskArrowStyles from './ChartContentTaskArrow.css';

class ChartContentTaskArrow extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
        let fromTask = this.props.fromTask;
        let toTask = this.props.toTask;

		// We display arrow as rectangle with top border and right border
		// So all we need to do is to calculate 4 properties: top, left, height, width
        let top    = Math.min(fromTask.order, toTask.order) * view.taskHeight;
        let left   = (fromTask.offset + fromTask.leadTime) * view.dayWidth;
        let height = Math.abs(fromTask.order - toTask.order) * view.taskHeight;
        let width  = (toTask.offset - (fromTask.offset + fromTask.leadTime)) * view.dayWidth;

        // Add a little to top and remove from height, so our arrows appear nicely (be at the middle of the bar)
        top += (view.taskHeight / 2);
        height -= (view.taskHeight / 2);

        width += toTask.effort > 1 ? view.dayWidth : view.dayWidth / 2; // Add a little offset to arrow pointer, if toTask's width is large enough

        let style = {
        	top: top + 'px',
        	left: left + 'px',
        	height: height + 'px',
        	width: width + 'px'
        }

        // If our arrow goes from bottom to top – we will have a bit different styles
        let isFromBottomToTop = fromTask.order > toTask.order;
        let classNames = `${ChartContentTaskArrowStyles.Arrow} ${isFromBottomToTop ? ChartContentTaskArrowStyles.FromBottomToTop : ChartContentTaskArrowStyles.FromTopToBottom}`

        return (
        	<div className={classNames} style={style}/>
    	);
    }
}

export default ChartContentTaskArrow;
