/*!
 *	jQuery Date Formatting Library
 *
 *	Copyright (c) Eric Garside
 *	Dual licensed under:
 *		MIT: http://www.opensource.org/licenses/mit-license.php
 *		GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */

"use strict";

/*global jQuery */

/*jslint white: true, browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 50, indent: 4 */

(function ($) {

	//------------------------------
	//
	//	Constants
	//
	//------------------------------

	//------------------------------
	//	 Date formatting
	//------------------------------

		/**
		 *	String formatting for each month, with January at index "0" and December at "11".
		 */
	var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	
		/**
		 *	String formatting for each day, with Sunday at index "0" and Saturday at index "6"
		 */
		DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		
		/**
		 *	The number of days in each month.
		 */
		COUNTS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
		
		/**
		 *	English ordinal suffix for corresponding days of the week.
		 */
		SUFFIX = [null, 'st', 'nd', 'rd'],
		
	//------------------------------
	//  Regex
	//------------------------------
		
		/**
		 *	Regex for replacing the time token in a timeformat string.
		 */
		RX_TIME_TOKEN = /%t/g,
		
	//------------------------------
	//	 Time formatting
	//------------------------------
		
		/**
		 *	Time constants
		 */
		TIME = {
			second: 1e3,
			minute: 6e4,
			hour: 36e5,
			day: 864e5,
			week: 6048e5
		},
		
	//------------------------------
	//
	//	Property Declaration
	//
	//------------------------------
		
		/**
		 *	Define the object which will hold reference to the actual formatting functions. By not directly prototyping these
		 *	into the date function, we vastly reduce the amount of bloat adding these options causes.
		 */
		_;
		
	//------------------------------
	//
	//	Internal Methods
	//
	//------------------------------
	
	/**
	 *	Left-pad the string with the provided string up to the provided length.
	 *
	 *	@param format	The string to pad.
	 *
	 *	@param string	The string to pad with.
	 *
	 *	@param length	The length to make the string (default is "0" if undefined).
	 *
	 *	@return The padded string.
	 */
	function pad(format, string, length) {
		format = format + '';
		length = length || 2;
	
		return format.length < length ? new Array(1 + length - format.length).join(string) + format : format;
	}
	
	/**
	 *	Right-pad the string with the provided string up to the provided length.
	 *
	 *	@param format	The string to pad.
	 *
	 *	@param string	The string to pad with.
	 *
	 *	@param length	The length to make the string (default is "0" if undefined).
	 *
	 *	@return The padded string.
	 */
	function rpad(format, string, length) {
		format = format + '';
		length = length || 2;
		
		return format.length < length ? format + new Array(1 + length - format.length).join(string) : format;
	}

	/**
	 *	Perform a modulus calculation on a date object to extract the desired value.
	 *
	 *	@param date The date object to perform the calculation on.
	 *
	 *	@param mod1 The value to divide the date value seconds by.
	 *
	 *	@param mod2 The modulus value.
	 *
	 *	@return The computed value.
	 */
	function modCalc(date, mod1, mod2) {
		return (Math.floor(Math.floor(date.valueOf() / 1e3) / mod1) % mod2);
	}
	
	/**
	 *	Given a string, return a properly formatted date string.
	 *
	 *	@param date		The date object being formatted.
	 *
	 *	@param format	The formatting string.
	 *
	 *	@return The formatted date string
	 */
	function formatDate(date, format) {
		if (format === null ||
				format === undefined) {
			format = "";		
		}
	
		format = format.split('');
		
		var output = '',
			
			/**
			 *	The characteracters '{' and '}' are the start and end characteracters of an escape. Anything between these
			 *	characteracters will not be treated as a formatting commands, and will merely be appended to the output
			 *	string. When the buffering property here is true, we are in the midst of appending escaped characteracters
			 *	to the output, and the formatting check should therefore be skipped.
			 */
			buffering = false,
	 
			character = '',
			
			index = 0;
			
		for (; index < format.length; index++) {
			character = format[index] + '';
			
			switch (character)
			{

			case ' ':
				output += character;
				break;
				
			case '{':
			case '}':
				buffering = character === '{';
				break;
			
			default:
				if (!buffering && _[character])
				{
					output += _[character].apply(date);
				}
				else
				{
					output += character;
				}
				break;

			}
		}
	 
		return output;
	}
	
	//------------------------------
	//
	//	Class Definition
	//
	//------------------------------
	
	/**
	 *	The formatting object holds all the actual formatting commands which should be accessible
	 *	for date formatting.
	 *
	 *	Each method should reference the date function via its "this" context, which will be set
	 *	by the formatter.
	 *
	 *	This function makes heavy use of the exponent notation for large numbers, to save space. In
	 *	javascript, any number with a set of trailing zeros can be expressed in exponent notation.
	 *
	 *	Ex. 15,000,000,000 === 15e9, where the number after "e" represents the number of zeros.
	 */
	_ =	 {
		//------------------------------
		//	Timer Formatting
		//------------------------------
		
		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of days since the epoch.
		 */
		V: function () {
			return modCalc(this, 864e2, 1e5);
		},
		
		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of days since the epoch, padded to 2 digits.
		 */
		v: function () {
			return pad(_.V.apply(this), 0);
		},

		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of days since the epoch, offset for years.
		 */
		K: function () {
			return _.V.apply(this) % 365;
		},
		
		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of days since the epoch, offset for years, padded to 2 digits.
		 */
		k: function () {
			return pad(_.K.apply(this), 0);
		},
		
		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of hours since the epoch.
		 */
		X: function () {
			return modCalc(this, 36e2, 24);
		},
		
		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of hours since the epoch, padded to two digits.
		 */
		x: function () {
			return pad(_.X.apply(this), 0);
		},
		
		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of minutes since the epoch.
		 */
		p: function () {
			return modCalc(this, 60, 60);
		},
		
		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of minutes since the epoch, padded to two digits.
		 */
		C: function () {
			return pad(_.p.apply(this), 0);
		},
		
		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of minutes since the epoch, uncapped. (1min 30seconds would be 90s)
		 */
		E: function () {
			return (_.X.apply(this) * 60) + _.p.apply(this);
		},
		
		/**
		 *	This is intended to be used for delta computation when subtracting one date object from another.
		 *
		 *	@return The number of minutes since the epoch, uncapped and padded to two digits. (1min 30seconds would be 90s)
		 */
		e: function () {
			return pad(_.E.apply(this), 0);
		},
		
		//------------------------------
		//	Day Formatting
		//------------------------------
		
		/**
		 *	@return The day of the month, padded to two digits.
		 */
		d: function () {
			return pad(this.getDate(), 0);
		},
		
		/**
		 *	@return A textual representation of the day, three letters.
		 */
		D: function () {
			return DAYS[this.getDay()].substring(0, 3);
		},
		
		/**
		 *	@return Day of the month without leading zeros.
		 */
		j: function () {
			return this.getDate();
		},
		
		/**
		 *	@return A full textual representation of the day of the week.
		 */
		l: function () {
			return DAYS[this.getDay()];
		},
		
		/**
		 *	@return ISO-8601 numeric representation of the day of the week.
		 */
		N: function () {
			return this.getDay() + 1;
		},
		
		/**
		 *	@return English ordinal suffix for the day of the month, two characteracters.
		 */
		S: function () {
			return SUFFIX[this.getDate()] || 'th';
		},
		
		/**
		 *	@return Numeric representation of the day of the week.
		 */
		w: function () {
			return this.getDay();
		},
		
		/**
		 *	@return The day of the year (starting from 0).
		 */
		z: function () {
			return Math.round((this - _.f.apply(this)) / 864e5);
		},
		
		//------------------------------
		//	Week
		//------------------------------
		
		/**
		 *	@return ISO-8601 week number of year, weeks starting on Monday 
		 */
		W: function () {
			return Math.ceil(((((this - _.f.apply(this)) / 864e5) + _.w.apply(_.f.apply(this))) / 7));
		},
		
		//------------------------------
		//	Month
		//------------------------------
		
		/**
		 *	@return A full textual representation of a month, such as January.
		 */
		F: function () {
			return MONTHS[this.getMonth()];
		},
		
		/**
		 *	@return Numeric representation of a month, padded to two digits.
		 */
		m: function () {
			return pad((this.getMonth() + 1), 0);
		},
		
		/**
		 *	@return A short textual representation of a month, three letters.
		 */
		M: function () {
			return MONTHS[this.getMonth()].substring(0, 3);
		},
		
		/**
		 *	@return Numeric representation of a month, without leading zeros.
		 */
		n: function () {
			return this.getMonth() + 1;
		},
		
		/**
		 *	@return Number of days in the given month.
		 */
		t: function () {
			//	For February on leap years, we must return 29.
			if (this.getMonth() === 1 && _.L.apply(this) === 1)
			{
				return 29;
			}
			
			return COUNTS[this.getMonth()];
		},
		
		
		//------------------------------
		//	Year
		//------------------------------
		
		/**
		 *	@return Whether it's a leap year. 1 if it is a leap year, 0 otherwise.
		 */
		L: function () {
			var Y = _.Y.apply(this);
		
			return Y % 4 ? 0 : Y % 100 ? 1 : Y % 400 ? 0 : 1;
		},
		
		/**
		 *	@return A Date object representing the first day of the current year.
		 */
		f: function () {
			return new Date(this.getFullYear(), 0, 1);
		},
		
		/**
		 *	@return A full numeric representation of the year, 4 digits.
		 */
		Y: function () {
			return this.getFullYear();
		},
		
		/**
		 *	@return A two digit representation of the year.
		 */
		y: function () {
			return ('' + this.getFullYear()).substr(2);
		},
		
		//------------------------------
		//	Time
		//------------------------------
		
		/**
		 *	@return Lowercase Ante/Post Meridiem values.
		 */
		a: function () {
			return this.getHours() < 12 ? 'am' : 'pm';
		},
		
		/**
		 *	@return Uppercase Ante/Post Meridiem values.
		 */
		A: function () {
			return _.a.apply(this).toUpperCase();
		},
		
		/**
		 *	If you ever use this for anything, email <eric@knewton.com>, cause he'd like to know how you found this nonsense useful.
		 *
		 *	@return Swatch internet time. 
		 */
		B: function () {
			return pad(Math.floor((((this.getHours()) * 36e5) + (this.getMinutes() * 6e4) + (this.getSeconds() * 1e3)) / 864e2), 0, 3);
		},
		
		/**
		 *	@return 12-hour format of an hour.
		 */
		g: function () {
			return this.getHours() % 12 || 12;
		},
		
		/**
		 *	@return 24-hour format of an hour.
		 */
		G: function () {
			return this.getHours();
		},
		
		/**
		 *	@return 12-hour format of an hour, padded to two digits.
		 */
		h: function () {
			return pad(_.g.apply(this), 0);
		},
		
		/**
		 *	@return 24-hour format of an hour, padded to two digits.
		 */
		H: function () {
			return pad(this.getHours(), 0);
		},
		
		/**
		 *	@return Minutes, padded to two digits.
		 */
		i: function () {
			return pad(this.getMinutes(), 0);
		},
		
		/**
		 *	@return Seconds, padded to two digits.
		 */
		s: function () {
			return pad(this.getSeconds(), 0);
		},
		
		/**
		 *	@return Microseconds
		 */
		u: function () {
			return this.getTime() % 1e3;
		},
		
		//------------------------------
		//	Timezone
		//------------------------------
		
		/**
		 *	@return Difference to GMT in hours.
		 */
		O: function () {
			var t = this.getTimezoneOffset() / 60;
			
			return rpad(pad((t >= 0 ? '+' : '-') + Math.abs(t), 0), 0, 4);
		},
		
		/**
		 *	@return Difference to GMT in hours, with colon between hours and minutes
		 */
		P: function () {
			var t = _.O.apply(this);
			
			return t.substr(0, 3) + ':' + t.substr(3);
		},
		
		/**
		 *	@return Timezone offset in seconds.
		 */
		Z: function () {
			return this.getTimezoneOffset() * 60;
		},
		
		//------------------------------
		//	Full Date/Time
		//------------------------------
		
		/**
		 *	@return ISO 8601 date
		 */
		c: function () {
			return _.Y.apply(this) + '-' + _.m.apply(this) + '-' + _.d.apply(this) + 'T' + _.H.apply(this) + ':' + _.i.apply(this) + ':' +	_.s.apply(this) + _.P.apply(this);
		},
		
		/**
		 *	@return RFC 2822 formatted date
		 */
		r: function () {
			return this.toString();
		},
		
		/**
		 *	@return The number of seconds since the epoch.
		 */
		U: function () {
			return this.getTime();
		}
	};
	
	//------------------------------
	//
	//	Native Prototype
	//
	//------------------------------
	
	$.extend(Date.prototype, {
		/**
		 *	Given a string of formatting commands, return the date object as a formatted string.
		 *
		 *	@param format	The formatting string.
		 *
		 *	@return The formatted date string
		 */
		format: function (format) {
			return formatDate(this, format);
		}
	});
	
	//------------------------------
	//
	//	Expose to jQuery
	//
	//------------------------------
	
	$.dateformat = {
		label: {
			/**
			 *	Display string for many years
			 */
			years: "%t years",
			
			/**
			 *	Display string for one year.
			 */
			year: "1 year",
			
			/**
			 *	Display string for many months.
			 */
			months: "%t months",
			
			/**
			 *	Display string for one month.
			 */
			month: "1 month",
			
			/**
			 *	Display string for some number of days.
			 */
			days: "%t days",
			
			/**
			 *	Display string for one day.
			 */
			day: "1 day",
			
			/**
			 *	Display string for today.
			 */
			today: "%d (ends today)",
			
			/**
			 *	Display string for days since.
			 */
			since: "%d (%r since)",
			
			/**
			 *	Display string for days until.
			 */
			until: "%d (%r left)"
		},
		
		/**
		 *	Get a reference to the formatting rules, or set custom rules.
		 *
		 *	@param custom	The custom rules to set for formatting.
		 *
		 *	@return The formatting rules.
		 */
		rules: function (custom) {
			if (custom !== undefined) {
				_ = $.extend(_, custom);
			}
			
			return _;
		},
		
		/**
		 *	Relative date format.
		 *
		 *	@param	date	The date to relative format.
		 *
		 *	@param	format	The format to use. Optional.
		 *
		 *	@return	A string describing the relative days, months, and years until/since the date.
		 */
		relative: function (date, format) {
			var relative = [],
			
				days = 0,
				
				years = 0,
				
				months = 0,
				
				now = new Date(),
				
				delta,
				
				display_label;
				
			if (now.valueOf() > date.valueOf()) {
				delta = new Date(now.valueOf() - date.valueOf());
				display_label = $.dateformat.label.since;
			} else {
				delta = new Date(date.valueOf() - now.valueOf());
				display_label = $.dateformat.label.until;
			}
			
			days = parseInt(formatDate(delta, "V"));
			
			if (days > 365) {
				years = Math.floor(days / 365);
				days = days % 365;
				
				if (years === 1) {
					relative.push($.dateformat.label.year);
				} else {
					relative.push($.dateformat.label.years.replace("%t", years));
				}
			}
			
			if (days > 30) {
				months = Math.floor(days / 30);
				days = days % 30;
				
				if (months === 1) {
					relative.push($.dateformat.label.month);
				} else {
					relative.push($.dateformat.label.months.replace("%t", months));
				}
			}
			
			days = Math.floor(days);
			
			if (days === 1) {
				relative.push($.dateformat.label.day);
			} else if (days > 0) {
				relative.push($.dateformat.label.days.replace("%t", days));
			}
			
			if (days === 0 && 
					months === 0 && 
					years === 0) {
				display_label = $.dateformat.label.today;
			}
			
			return display_label
				.replace("%d", formatDate(date, format))
				.replace("%r", relative.join(" "));
		},
		
		/**
		 *	Determine if the dateformat plugin has the requested formatting rule.
		 *
		 *	@param rule The formatting rule to check.
		 *
		 *	@return True if the rule exists, false otherwise.
		 */
		hasRule: function (rule) {
			return _[rule] !== undefined;
		},
	
		/**
		 *	Get a formatting value for a given date.
		 *
		 *	@param type The formatting characteracter type to get the value of.
		 *
		 *	@param date The date to extract the value from. Defaults to current.
		 */
		get: function (type, date) {
			return _[type].apply(date || new Date());
		},
		
		/**
		 *	Given a string of formatting commands, return the date object as a formatted string.
		 *
		 *	@param format	The formatting string.
		 *
		 *	@param date The date to extract the value from. Defaults to current.
		 *
		 *	@return The formatted date string
		 */
		format: function (format, date) {
			return formatDate(date || new Date(), format);
		},
		
		/**
		 *	@inheritDoc
		 */
		pad: pad,
		
		/**
		 *	@inheritDoc
		 */
		rpad: rpad
	};
	
	$.timeformat = {
		label: {
			/**
			 *	Display string for never (invalid date).
			 */
			never: "Never",
			
			/**
			 *	Display string for right now.
			 */
			now: "right now",
			
			/**
			 *	Display string for 2+ seconds ago.
			 */
			seconds: "%t seconds ago",
			
			/**
			 *	Display string for 1 minute ago.
			 */
			minute: "about 1 minute ago",
			
			/**
			 *	Display string for 2+ minutes ago.
			 */
			minutes: "%t minutes ago",
			
			/**
			 *	Display string for 1 hour ago.
			 */
			hour: "about 1 hour ago",
			
			/**
			 *	Display string for 2+ hours ago.
			 */
			hours: "%t hours ago",
			
			/**
			 *	Display string for yesterday.
			 */
			yesterday: "yesterday",
			
			/**
			 *	Display string for 2+ days.
			 */
			days: "%t days ago",
			
			/**
			 *	Display string for 1+ years
			 */
			years: "over a year ago"
		},
	
		/**
		 *	Relative time format.
		 *
		 *	@param	date	The date to timeformat.
		 *
		 *	@return	A relative date string. (right now, about a minute ago, 4 hours ago)
		 */
		relative: function (date) {
				//	The current date
			var now = new Date(),
				
				//	The difference between now and later
				difference = (new Date(now.valueOf() - date.valueOf())).valueOf(),
				
				//	Time to add into a display label in place of a %t token
				time,
				
				//	The relative time label
				label;
				
			if (isNaN(difference) || difference < 0) {
				label = $.timeformat.label.never;
			} else if (difference < TIME.second * 2) {
				label = $.timeformat.label.now;
			} else if (difference < TIME.minute) {
				time = Math.floor(difference / TIME.second);
				label = $.timeformat.label.seconds;
			} else if (difference < TIME.minute * 2) {
				label = $.timeformat.label.minute;
			} else if (difference < TIME.hour) {
				time = Math.floor(difference / TIME.minute);
				label = $.timeformat.label.minutes;
			} else if (difference < TIME.hour * 2) {
				label = $.timeformat.label.hour;
			} else if (difference < TIME.day) {
				time = Math.floor(difference / TIME.hour);
				label = $.timeformat.label.hours;
			} else if (difference > TIME.day &&
					difference < TIME.day * 2) {
				label = $.timeformat.label.yesterday;
			} else if (difference < TIME.day * 365) {
				time = Math.floor(difference / TIME.day);
				label = $.timeformat.label.days;
			} else {
				label = $.timeformat.label.years;
			}
			
			if (time !== undefined) {
				label = label.replace(RX_TIME_TOKEN, time);
			}
			
			return label;
		}
	};
		 
}(jQuery));

