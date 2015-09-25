import moment from 'moment';

export default function getEndDateByPlan(plan) {
    if (!plan || !plan.tasks || !plan.tasks[0]) return moment();
    return moment(plan.tasks[0].endDate);
}