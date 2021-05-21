const dayjs = require('dayjs');
const chrono = require('chrono-node');

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

// Date format for Google and Yahoo
const DATE_GOOGLE_YAHOO = 'YYYYMMDD[T]HHmmss[Z]'

// Date format for Outlook and Office
const DATE_OUTLOOK_OFFICE = 'YYYY-MM-DD[T]HH[%3A]mm[%3A]ss[%2B00%3A00]';

// Calendar link generation
function generateCalendarLinks(start, end, title, description, location) {

    const startDate = dayjs(start).tz("UTC");
    const endDate = dayjs(end).tz("UTC");

    if (!startDate || !endDate) return null;

    // Link for Google
    const googleBase = `https://calendar.google.com/calendar/render?action=TEMPLATE`;
    const googleTime = `&dates=${startDate.format(DATE_GOOGLE_YAHOO)}%2F${endDate.format(DATE_GOOGLE_YAHOO)}`;
    const googleTitle = title ? `&text=${encodeURIComponent(title)}` : '';
    const googleDescription = description ? `&details=${encodeURIComponent(description)}` : '';
    const googleLocation = location ? `&location=${encodeURIComponent(location)}` : '';

    const googleLink = `${googleBase}${googleTime}${googleTitle}${googleDescription}${googleLocation}`;

    // Link for Yahoo
    const yahooBase = `https://calendar.yahoo.com?v=60`;
    const yahooTime = `&st=${startDate.format(DATE_GOOGLE_YAHOO)}&et=${endDate.format(DATE_GOOGLE_YAHOO)}`;
    const yahooTitle = title ? `&title=${encodeURIComponent(title)}` : '';
    const yahooDescription = description ? `&desc=${encodeURIComponent(description)}` : '';
    const yahooLocation = location ? `&in_loc=${encodeURIComponent(location)}` : '';

    const yahooLink = `${yahooBase}${yahooTime}${yahooTitle}${yahooDescription}${yahooLocation}`;

    // Link for Outlook
    const outlookBase = `https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent`
    const outlookTime = `&startdt=${startDate.format(DATE_OUTLOOK_OFFICE)}&enddt=${endDate.format(DATE_OUTLOOK_OFFICE)}`;
    const outlookTitle = title ? `&subject=${encodeURIComponent(title)}` : '';
    const outlookDescription = description ? `&body=${encodeURIComponent(description)}` : '';
    const outlookLocation = location ? `&location=${encodeURIComponent(location)}` : '';

    const outlookLink = `${outlookBase}${outlookTime}${outlookTitle}${outlookDescription}${outlookLocation}`;

    return [{
        name: 'Google Calendar',
        url: googleLink
    }, {
        name: 'Outlook',
        url: outlookLink
    }, {
        name: 'Yahoo Calendar',
        url: yahooLink
    }];
}

// Find dates/times in text
function extractDates(string) {
    const dates = chrono.parse(string);
    return dates;
}

module.exports = {
    generateCalendarLinks,
    extractDates
};