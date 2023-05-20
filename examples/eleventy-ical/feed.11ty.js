const {
  ICalCalendar,
  ICalAlarmType,
  ICalCalendarMethod,
} = require('ical-generator')

module.exports = class FeedTemplate {
  // Setup Eleventy data for this template,
  // namely set the name of the file to be generated
  data() {
    return {
      permalink: 'feed.ics',
    }
  }

  // The render method is called
  render({ calendar, collections }) {
    // Generate a calendar object based on the calendar configuration
    // plus information provided by eleventy
    const cal = new ICalCalendar({
      name: calendar.title,
      description: calendar.description,
      prodId: {
        company: calendar.organisation,
        product: 'Eleventy',
      },
      url: calendar.url + this.page.url,
      method: ICalCalendarMethod.PUBLISH,
    })

    // Loop through of each of our events using the collection
    for (const page of collections.events) {
      // Create a calendar event from each page
      const event = cal.createEvent({
        id: `${calendar.url}/${page.fileSlug}`,
        start: page.data.start,
        end: page.data.end,
        summary: page.data.title,
        description: page.template.frontMatter.content,
        location: page.data.location,
      })

      // Add an alert to the event
      const alarm = new Date(page.data.start)
      alarm.setMinutes(alarm.getMinutes() - 15)
      event.createAlarm({
        type: ICalAlarmType.display,
        trigger: alarm,
      })
    }

    // Generate the ical file and return it for Eleventy
    return cal.toString()
  }
}
