// source: https://unpkg.com/dayjs@v1.10.4/locale/fa.js
// see: https://github.com/iamkun/dayjs/blob/v1.10.4/src/locale/fa.js

!(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["dayjs-jalali"] = factory());
})(this, (function () {
    'use strict';

    /*
      Expose functions.
    */
    var jalaaliJs =
    {
        toJalaali: toJalaali
        , toGregorian: toGregorian
        , isValidJalaaliDate: isValidJalaaliDate
        , isLeapJalaaliYear: isLeapJalaaliYear
        , jalaaliMonthLength: jalaaliMonthLength
        , jalCal: jalCal
        , j2d: j2d
        , d2j: d2j
        , g2d: g2d
        , d2g: d2g
    };
    window['jalaaliJs'] = jalaaliJs

    /*
      Converts a Gregorian date to Jalaali.
    */
    function toJalaali(gy, gm, gd) {
        if (Object.prototype.toString.call(gy) === '[object Date]') {
            gd = gy.getDate();
            gm = gy.getMonth() + 1;
            gy = gy.getFullYear();
        }
        return d2j(g2d(gy, gm, gd))
    }

    /*
      Converts a Jalaali date to Gregorian.
    */
    function toGregorian(jy, jm, jd) {
        return d2g(j2d(jy, jm, jd))
    }

    /*
      Checks whether a Jalaali date is valid or not.
    */
    function isValidJalaaliDate(jy, jm, jd) {
        return jy >= -61 && jy <= 3177 &&
            jm >= 1 && jm <= 12 &&
            jd >= 1 && jd <= jalaaliMonthLength(jy, jm)
    }

    /*
      Is this a leap year or not?
    */
    function isLeapJalaaliYear(jy) {
        return jalCal(jy).leap === 0
    }

    /*
      Number of days in a given month in a Jalaali year.
    */
    function jalaaliMonthLength(jy, jm) {
        if (jm <= 6) return 31
        if (jm <= 11) return 30
        if (isLeapJalaaliYear(jy)) return 30
        return 29
    }

    /*
      This function determines if the Jalaali (Persian) year is
      leap (366-day long) or is the common year (365 days), and
      finds the day in March (Gregorian calendar) of the first
      day of the Jalaali year (jy).
  
      @param jy Jalaali calendar year (-61 to 3177)
      @return
        leap: number of years since the last leap year (0 to 4)
        gy: Gregorian year of the beginning of Jalaali year
        march: the March day of Farvardin the 1st (1st day of jy)
      @see: http://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm
      @see: http://www.fourmilab.ch/documents/calendar/
    */
    function jalCal(jy) {
        // Jalaali years starting the 33-year rule.
        var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210
            , 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
        ]
            , bl = breaks.length
            , gy = jy + 621
            , leapJ = -14
            , jp = breaks[0]
            , jm
            , jump
            , leap
            , leapG
            , march
            , n
            , i;

        if (jy < jp || jy >= breaks[bl - 1])
            throw new Error('Invalid Jalaali year ' + jy)

        // Find the limiting years for the Jalaali year jy.
        for (i = 1; i < bl; i += 1) {
            jm = breaks[i];
            jump = jm - jp;
            if (jy < jm)
                break
            leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
            jp = jm;
        }
        n = jy - jp;

        // Find the number of leap years from AD 621 to the beginning
        // of the current Jalaali year in the Persian calendar.
        leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
        if (mod(jump, 33) === 4 && jump - n === 4)
            leapJ += 1;

        // And the same in the Gregorian calendar (until the year gy).
        leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;

        // Determine the Gregorian date of Farvardin the 1st.
        march = 20 + leapJ - leapG;

        // Find how many years have passed since the last leap year.
        if (jump - n < 6)
            n = n - jump + div(jump + 4, 33) * 33;
        leap = mod(mod(n + 1, 33) - 1, 4);
        if (leap === -1) {
            leap = 4;
        }

        return {
            leap: leap
            , gy: gy
            , march: march
        }
    }

    /*
      Converts a date of the Jalaali calendar to the Julian Day number.
  
      @param jy Jalaali year (1 to 3100)
      @param jm Jalaali month (1 to 12)
      @param jd Jalaali day (1 to 29/31)
      @return Julian Day number
    */
    function j2d(jy, jm, jd) {
        var r = jalCal(jy);
        return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
    }

    /*
      Converts the Julian Day number to a date in the Jalaali calendar.
  
      @param jdn Julian Day number
      @return
        jy: Jalaali year (1 to 3100)
        jm: Jalaali month (1 to 12)
        jd: Jalaali day (1 to 29/31)
    */
    function d2j(jdn) {
        var gy = d2g(jdn).gy // Calculate Gregorian year (gy).
            , jy = gy - 621
            , r = jalCal(jy)
            , jdn1f = g2d(gy, 3, r.march)
            , jd
            , jm
            , k;

        // Find number of days that passed since 1 Farvardin.
        k = jdn - jdn1f;
        if (k >= 0) {
            if (k <= 185) {
                // The first 6 months.
                jm = 1 + div(k, 31);
                jd = mod(k, 31) + 1;
                return {
                    jy: jy
                    , jm: jm
                    , jd: jd
                }
            } else {
                // The remaining months.
                k -= 186;
            }
        } else {
            // Previous Jalaali year.
            jy -= 1;
            k += 179;
            if (r.leap === 1)
                k += 1;
        }
        jm = 7 + div(k, 30);
        jd = mod(k, 30) + 1;
        return {
            jy: jy
            , jm: jm
            , jd: jd
        }
    }

    /*
      Calculates the Julian Day number from Gregorian or Julian
      calendar dates. This integer number corresponds to the noon of
      the date (i.e. 12 hours of Universal Time).
      The procedure was tested to be good since 1 March, -100100 (of both
      calendars) up to a few million years into the future.
  
      @param gy Calendar year (years BC numbered 0, -1, -2, ...)
      @param gm Calendar month (1 to 12)
      @param gd Calendar day of the month (1 to 28/29/30/31)
      @return Julian Day number
    */
    function g2d(gy, gm, gd) {
        var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
            + div(153 * mod(gm + 9, 12) + 2, 5)
            + gd - 34840408;
        d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
        return d
    }

    /*
      Calculates Gregorian and Julian calendar dates from the Julian Day number
      (jdn) for the period since jdn=-34839655 (i.e. the year -100100 of both
      calendars) to some millions years ahead of the present.
  
      @param jdn Julian Day number
      @return
        gy: Calendar year (years BC numbered 0, -1, -2, ...)
        gm: Calendar month (1 to 12)
        gd: Calendar day of the month M (1 to 28/29/30/31)
    */
    function d2g(jdn) {
        var j
            , i
            , gd
            , gm
            , gy;
        j = 4 * jdn + 139361631;
        j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
        i = div(mod(j, 1461), 4) * 5 + 308;
        gd = div(mod(i, 153), 5) + 1;
        gm = mod(div(i, 153), 12) + 1;
        gy = div(j, 1461) - 100100 + div(8 - gm, 6);
        return {
            gy: gy
            , gm: gm
            , gd: gd
        }
    }

    /*
      Utility helper functions.
    */

    function div(a, b) {
        return ~~(a / b)
    }

    function mod(a, b) {
        return a - ~~(a / b) * b
    }

    const localeObject = {
        name: 'fa',
        weekdays: 'یک‌شنبه_دوشنبه_سه‌شنبه_چهارشنبه_پنج‌شنبه_جمعه_شنبه'.split('_'),
        weekdaysShort: 'یک‌_دو_سه‌_چه_پن_جم_شن'.split('_'),
        weekdaysMin: 'ی‌_د_س‌_چ_پ_ج_ش'.split('_'),
        months: 'فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند'.split('_'),
        monthsShort: 'فرو_ارد_خرد_تیر_مرد_شهر_مهر_آبا_آذر_دی_بهم_اسف'.split('_'),
        ordinal: function (number) {
            return number; // No specific ordinal formatting
        },
        relativeTime: {
            future: 'در %s',
            past: '%s قبل',
            s: 'چند ثانیه',
            m: 'یک دقیقه',
            mm: '%d دقیقه',
            h: 'یک ساعت',
            hh: '%d ساعت',
            d: 'یک روز',
            dd: '%d روز',
            M: 'یک ماه',
            MM: '%d ماه',
            y: 'یک سال',
            yy: '%d سال'
        },
        formats: {
            LT: "HH:mm",
            // Time format
            LTS: "HH:mm:ss",
            // Time with seconds
            L: "DD/MM/YYYY",
            // Short date format
            LL: "D MMMM YYYY",
            // Long date format
            LLL: "D MMMM YYYY HH:mm",
            // Long date with time
            LLLL: "dddd, D MMMM YYYY HH:mm" // Full date with time
        }
    };
    const isISODateFormat = (dateString) => {
        const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        return isoDatePattern.test(dateString);
    };
    const REGEX_PARSE = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])(\D?([01]\d|2[0-3])\D?([0-5]\d)\D?([0-5]\d)?\D?(\d{3})?([zZ]|([+-])([01]\d|2[0-3])\D?([0-5]\d)?)?)?$/;
    const REGEX_FORMAT = /\[.*?\]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;
    var index = ((options, dayjsClass, dayjsFactory) => {
        dayjsFactory.locale(localeObject, null, true);
        const classProto = dayjsClass.prototype;
        const oldFormat = classProto.format;
        const oldParse = classProto.parse;

        classProto.parse = function (cfg) {
            cfg.date = cfg.date || new Date();
            let {
                date,
                jalali
            } = cfg;



            if ((date instanceof Date || typeof date === 'number' || isISODateFormat(date))) {

                date = new Date(date);

                if (Number(date.getFullYear()) > 10) {

                    const time = String(date.getHours()).padStart(2, '0') + ':' +
                        String(date.getMinutes()).padStart(2, '0') + ':' +
                        String(date.getSeconds()).padStart(2, '0');

                    if (Number(date.getFullYear()) < 1500) {
                        cfg.date = date;
                    } else {

                        const {
                            jy,
                            jm,
                            jd
                        } = jalaaliJs.toJalaali(
                            Number(date.getFullYear()),
                            Number(date.getMonth() + 1),
                            Number(date.getDate())
                        );
                        cfg.date = `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')} ${time || ''}`;
                    }
                }
            } else {
                const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2})$/;
                // Check if the string matches the format
                if (regex.test(dateString)) {
                    const convertedDateString = dateString.replace(/([+-]\d{2}:\d{2})$/, '');
                    cfg.date = convertedDateString
                }
            }


            return oldParse.bind(this)(cfg);
        };

    });

    return index;

}));
dayjs.prototype.from = function () {
    return this.format('YYYY/MM/DD HH:mm:ss');  // or any other default format you prefer
};

dayjs.prototype.fromNow = function () {
    const REGEX_PARSE = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])(\D?([01]\d|2[0-3])\D?([0-5]\d)\D?([0-5]\d)?\D?(\d{3})?([zZ]|([+-])([01]\d|2[0-3])\D?([0-5]\d)?)?)?$/;

    // Convert the current Day.js instance to ISO string
    const date = this.toISOString();
    const reg = date.match(REGEX_PARSE);

    if (!reg) {
        return 'Invalid date';
    }

    const [, year, month, day, time] = reg;

    // Convert Jalali date to Gregorian date
    const { gy, gm, gd } = window['jalaaliJs'].toGregorian(Number(year), Number(month), Number(day));

    // Create a new Day.js instance for the converted Gregorian date
    const gregorianDate = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')} ${this.format('HH:mm:ss') || ''}`;
    const date2 = new Date(gregorianDate);
    const now = new Date();

    // Calculate the difference in milliseconds
    const diffInSeconds = Math.floor((now.getTime() - date2.getTime()) / 1000); // Ensure to use getTime()

    // Define time intervals
    const intervals = [
        { label: 'سال', seconds: 31536000 }, // 60 * 60 * 24 * 365
        { label: 'ماه', seconds: 2592000 }, // 60 * 60 * 24 * 30
        { label: 'روز', seconds: 86400 },      // 60 * 60 * 24
        { label: 'ساعت', seconds: 3600 },      // 60 * 60
        { label: 'دقیقه', seconds: 60 },      // 60
    ];

    // Determine the correct interval
    for (const interval of intervals) {
        const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
        if (count > 0) {
            return `${count} ${interval.label}${count > 1 ? '' : ''} ${diffInSeconds < 0 ? 'بعد' : 'پیش'}`;
        }
    }

    return 'لحظاتی پیش';
}

dayjs.extend(window['dayjs-jalali']);
dayjs.locale('fa');

