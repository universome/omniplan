import React from 'react';
import SettingsStore from 'stores/SettingsStore';
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
        let top    = Math.min(fromTask.position, toTask.position) * SettingsStore.get('taskHeight');
        let left   = (fromTask.offset + fromTask.leadTime) * SettingsStore.get('dayWidth');
        let height = Math.abs(fromTask.position - toTask.position) * SettingsStore.get('taskHeight');
        let width  = (toTask.offset - (fromTask.offset + fromTask.leadTime)) * SettingsStore.get('dayWidth');

        // Add a little to top and substract from height, so our arrows appear nicely (be at the middle of the bar)
        top += (SettingsStore.get('taskHeight') / 2);
        height -= (SettingsStore.get('taskHeight') / 2);

        // Add a little offset to arrow pointer (the larger toTask's width the larger we should add)
        width += toTask.effort > 1 ? SettingsStore.get('dayWidth') : SettingsStore.get('dayWidth') / 2;

        let style = {
        	top: top + 'px',
        	left: left + 'px',
        	height: height + 'px',
        	width: width + 'px'
        }

        // If our arrow goes from bottom to top – we will have a bit different styles
        let isFromBottomToTop = fromTask.position > toTask.position;
        let classNames = `${ChartContentTaskArrowStyles.Arrow} ${isFromBottomToTop ? ChartContentTaskArrowStyles.FromBottomToTop : ChartContentTaskArrowStyles.FromTopToBottom}`

        return (
        	<div className={classNames} style={style}/>
    	);
    }
}

export default ChartContentTaskArrow;
