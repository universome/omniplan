import moment from 'moment';

export default function getAmountOfDaysInMonth(date) {
    
    let nextMonthFirstDay = moment({ year: date.year(), month: date.month() + 1, date: 1 });
    let monthLastDay = nextMonthFirstDay.add(-1, 'days');

    return monthLastDay.date();
}