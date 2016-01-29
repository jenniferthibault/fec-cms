'use strict';

var $ = require('jquery');
var URI = require('urijs');
var _ = require('underscore');
var moment = require('moment');

var urls = require('fec-style/js/urls');
var dropdown = require('fec-style/js/dropdowns');
require('fec-style/js/helpers');

require('fullcalendar');

var templates = {
  details: require('../hbs/calendar/details.hbs'),
  download: require('../hbs/calendar/download.hbs'),
  subscribe: require('../hbs/calendar/subscribe.hbs'),
  events: require('../hbs/calendar/events.hbs')
};

function Listeners() {
  this.listeners = [];
}

Listeners.prototype.on = function($elm) {
  var args = _.toArray(arguments).slice(1);
  this.listeners = this._listeners || [];
  this.listeners.push({$elm: $elm, args: args});
  $elm.on.apply($elm, args);
};

Listeners.prototype.off = function() {
  this.listeners.forEach(function(listener) {
    var $elm = listener.$elm;
    var args = listener.args;
    $elm.off.apply($elm, args);
  });
};

var FC = $.fullCalendar;
var View = FC.View;

var categories = {
  Elections: ['election'],
  Deadlines: ['report', 'ie', 'ec'],
  Outreach: ['roundtables', 'conferences'],
  Meetings: ['open', 'executive'],
  Rules: ['aos'],
  Other: ['litigation', 'fea']
};

var categoriesInverse = _.reduce(_.pairs(categories), function(memo, pair) {
  var key = pair[0];
  var values = pair[1];
  _.each(values, function(value) {
    memo[value] = key;
  });
  return memo;
}, {});

var ListView = View.extend({

  setDate: function(date) {
    var intervalUnit = this.options.duration.intervalUnit || this.intervalUnit;
    View.prototype.setDate.call(this, date.startOf(intervalUnit));
  },

  renderEvents: function(events) {
    var self = this;
    var groups = _.chain(events)
      .filter(function(event) {
        return self.start <= event.start && event.start < self.end;
      })
      .sortBy('start')
      .groupBy(function(event) {
        var category = event.category ? event.category.split(/[ -]+/)[0].toLowerCase() : null;
        return categoriesInverse[category];
      })
      .map(function(values, key) {
        return {
          title: key,
          events: values
        };
      })
      .sortBy(function(group) {
        return Object.keys(categories).indexOf(group.title);
      })
      .value();
    this.el.html(templates.events({groups: groups}));
    this.dropdowns = $(this.el.html).find('.dropdown').map(function(idx, elm) {
      return new dropdown.Dropdown($(elm), {checkboxes: false});
    });
  },

  unrenderEvents: function() {
    this.dropdowns.each(function(idx, dropdown) {
      dropdown.destroy();
    });
    this.el.html('');
  }

});

FC.views.list = ListView;

function Calendar(opts) {
  this.opts = $.extend({}, this.defaultOpts(), opts);

  this.$calendar = $(this.opts.selector).fullCalendar(this.opts.calendarOpts);
  this.url = URI(this.opts.url);
  this.exportUrl = URI(this.opts.exportUrl);
  this.filterPanel = this.opts.filterPanel;
  this.filterSet = this.filterPanel.filterSet;

  this.sources = null;
  this.params = null;

  this.$download = $(opts.download);
  this.$subscribe = $(opts.subscribe);

  this.$calendar.on('calendar:rendered', this.filterPanel.setHeight());
  this.filterPanel.$form.on('change', this.filter.bind(this));
  $(window).on('popstate', this.filter.bind(this));

  urls.updateQuery(this.filterSet.serialize(), this.filterSet.fields);

  this.filter();
  this.styleButtons();
  this.filterPanel.setHeight();
}

Calendar.prototype.defaultOpts = function() {
  return {
    calendarOpts: {
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'agendaWeek,month,quarter'
      },
      buttonIcons: false,
      buttonText: {
        today: 'Today',
        week: 'Week',
      },
      dayRender: this.handleDayRender.bind(this),
      dayPopoverFormat: 'MMM D, YYYY',
      eventAfterAllRender: this.handleRender.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventLimit: true,
      nowIndicator: true,
      views: {
        agenda: {
          scrollTime: '09:00:00',
          minTime: '08:00:00',
          maxTime: '20:00:00'
        },
        month: {
          eventLimit: 3,
          buttonText: 'Month'
        },
        quarter: {
          type: 'list',
          buttonText: 'Quarter',
          duration: {quarters: 1, intervalUnit: 'quarter'}
        }
      }
    },
    sourceOpts: {
      startParam: 'min_start_date',
      endParam: 'max_start_date',
      success: this.success.bind(this)
    }
  };
};

Calendar.prototype.filter = function() {
  var params = this.filterSet.serialize();
  if (_.isEqual(params, this.params)) {
    return;
  }
  var url = this.url.clone().addQuery(params || {}).toString();
  urls.pushQuery(this.filterSet.serialize(), this.filterSet.fields);
  this.$calendar.fullCalendar('removeEventSource', this.sources);
  this.sources = $.extend({}, this.opts.sourceOpts, {url: url});
  this.$calendar.fullCalendar('addEventSource', this.sources);
  this.updateLinks(params);
  this.params = params;
};

Calendar.prototype.success = function(response) {
  var self = this;
  return response.results.map(function(event) {
    var processed = {
      category: event.category,
      location: event.location,
      title: event.description || 'Event title',
      summary: event.summary || 'Event summary',
      state: event.state ? event.state.join(', ') : null,
      start: event.start_date ? moment.utc(event.start_date) : null,
      end: event.end_date ? moment.utc(event.end_date) : null,
      allDay: moment.utc(event.start_date).format('HHmmss') === '000000' && event.end_date === null,
      className: getEventClass(event)
    };
    _.extend(processed, {
      google: getGoogleUrl(processed),
      download: self.exportUrl.clone().addQuery({event_id: event.event_id}).toString()
    });
    return processed;
  });
};

Calendar.prototype.updateLinks = function(params) {
  var url = this.exportUrl.clone().addQuery(params || {});
  var urls = {
    ics: url.toString(),
    csv: url.clone().query({renderer: 'csv'}).toString(),
    google: 'https://calendar.google.com/calendar/render?cid=' + url.toString(),
    calendar: url.protocol('webcal').toString()
  };
  this.$download.html(templates.download(urls));
  this.$subscribe.html(templates.subscribe(urls));

  if (this.downloadButton) {
    this.downloadButton.destroy();
  }

  if (this.subscribeButton) {
    this.subscribeButton.destroy();
  }

  this.downloadButton = new dropdown.Dropdown(this.$download, {checkboxes: false});
  this.subscribeButton = new dropdown.Dropdown(this.$subscribe, {checkboxes: false});
};

Calendar.prototype.styleButtons = function() {
  var baseClasses = 'button button--neutral';
  this.$calendar.find('.fc-button').addClass(baseClasses);
  this.$calendar.find('.fc-next-button').addClass('button--next');
  this.$calendar.find('.fc-prev-button').addClass('button--previous');
  this.$calendar.find('.fc-right .fc-button-group').addClass('toggles--buttons');
};

Calendar.prototype.handleRender = function(view) {
  $(document.body).trigger($.Event('calendar:rendered'));
  this.highlightToday();
};

Calendar.prototype.handleDayRender = function(date, cell) {
  if (date.date() === 1) {
    cell.append(date.format('MMMM'));
  }
};

Calendar.prototype.handleEventClick = function(calEvent, jsEvent, view) {
  var $eventContainer = $(jsEvent.target).closest('.fc-content');
  var tooltip = new CalendarTooltip(templates.details(calEvent));
  $eventContainer.append(tooltip.$content);
};

Calendar.prototype.highlightToday = function() {
  var $today = $('thead .fc-today');
  var todayIndex = $today.index() + 1;
  $today
    .closest('table')
    .find('tbody tr td:nth-child(' + todayIndex + ')')
    .addClass('fc-today');
};

var classMap = {
  aos: 'fc--rules',
  election: 'fc--election',
  report: 'fc--deadline',
  open: 'fc--meeting',
  executive: 'fc--meeting',
  roundtables: 'fc--outreach',
  conferences: 'fc--outreach',
  litigation: 'fc--other',
  fea: 'fc--other',
  ie: 'fc--deadline',
  ec: 'fc--deadline'
};

function getEventClass(event) {
  var className = '';
  var category = event.category ? event.category.split(/[ -]+/)[0] : null;

  className += event.end_date === null ? 'fc--allday' : '';
  className += category ? ' ' + classMap[category.toLowerCase()] : '';
  return className;
}

function getGoogleUrl(event) {
  var fmt, dates;
  if (event.end) {
    fmt = 'YYYYMMDD[T]HHmmss';
    dates = event.start.format(fmt) + '/' + event.end.format(fmt);
  } else {
    fmt = 'YYYYMMDD';
    dates = event.start.format(fmt) + '/' + event.start.clone().add(1, 'day').format(fmt);
  }
  return URI('https://calendar.google.com/calendar/render')
    .addQuery({
      action: 'TEMPLATE',
      text: event.title,
      details: event.summary,
      dates: dates
    })
    .toString();
}

function getUrl(path, params) {
  return URI(window.API_LOCATION)
    .path(Array.prototype.concat(window.API_VERSION, path || [], '').join('/'))
    .addQuery({
      api_key: window.API_KEY,
      per_page: 500
    })
    .addQuery(params || {})
    .toString();
}

function CalendarTooltip(content) {
  this.$content = $(content);
  this.$close = this.$content.find('.js-close');
  this.$dropdown = this.$content.find('.dropdown');
  this.exportDropdown = new dropdown.Dropdown(this.$dropdown, {checkboxes: false});
  this.events = new Listeners();
  this.events.on(this.$close, 'click', this.close.bind(this));

  var $body = $(document.body);
  $body.trigger($.Event('tooltip:opened'));
  this.events.on($body, 'tooltip:opened', this.close.bind(this));
}

CalendarTooltip.prototype.close = function() {
  this.$content.remove();
  this.exportDropdown.destroy();
  this.events.off();
};

module.exports = {
  Calendar: Calendar,
  getUrl: getUrl
};
