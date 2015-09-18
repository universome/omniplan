import React from 'react';
import {Typeahead} from 'react-typeahead';
import PlanActions from 'actions/PlanActions';
import ChartSuggestStyles from './ChartSuggest.css';

class ChartSuggest extends React.Component {
    constructor(...args) {
        super(args);
    }

    render() {
    	let options = getOptionsFromPlan(this.props.plan);

      	return (
      		<div className={ChartSuggestStyles.Container}>
      			<div className={ChartSuggestStyles.Wrapper}>
      				<Typeahead
      					placeholder = 'Start entering resource name'
      					options = {options}
      					maxVisible = {10}
      					customClasses = {{
      						input: ChartSuggestStyles.Input,
      						hover: ChartSuggestStyles.OptionHovered
      					}}
      					filterOption = {filterOption}
      					displayOption = {displayOption}
      					onOptionSelected = {applyFilter}
      				/>
      			</div>
      		</div>
  		);
    }
}

// function getOptionsFromPlan(plan) {
// 	return plan && plan.resources ? plan.resources.filter(r => r.name).map(r => r.name) : [];
// }

function getOptionsFromPlan(plan) {
	return plan && plan.resources ? plan.resources.filter(r => r.name) : [];
}

function filterOption(inputValue, resource) {
	return resource.name.indexOf(inputValue) >= 0;
}

function displayOption(resource) {
	return resource.name;
}

function applyFilter(resource) {
  PlanActions.resetFilters();
	PlanActions.applyFilter({name: 'resourceId', value: resource.id});
}

export default ChartSuggest;
