import moment from 'moment';

export default function getStartDateByPlan(plan) {
    if (!plan || !plan.creationDate) return moment();
    return moment(plan.creationDate);
}