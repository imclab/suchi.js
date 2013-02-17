/**
 * @preserve
 *
 * Suchi.js -- No user left behind.
 *
 * Copyright 2012-2013:
 *      Alex Russell <slightlyoff@chromium.org>
 *      Frances Berriman <phaeness@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(global) {
  // Somebody's already on it. Bail.
  if (typeof global["suchi"] != "undefined") { return; }

  var suchi = global.suchi = {};

  /*
   * There is no feature test for staleness.
   *
   * Tight regular expressions to test for the most prevalant stale browsers as
   * reported by:
   *  http://marketshare.hitslink.com/browser-market-share.aspx?qprid=2&qpcustomd=0
   *
   * This list will be actively maintained. I.e., as IE 10 is launched, IE 9
   * goes into the list; when Chrome 19 goes to stable, Chrome 18 goes in the
   * list, etc.
   *
   * Browsers are removed from the list as they fall below 1% global share.
   */
  suchi.laggards = {

    // IE 9:     XX%
    // Mozilla/5.0 (Windows; U; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727)
    // IE9: /^Mozilla\/5\.0 \(compatible; MSIE 9\.0; Windows NT \d\.\d(.*); Trident\/5\.0(.*)\)$/g,
    IE9: /^Mozilla\/5\.0 \(compatible; MSIE 9\.0; Windows NT \d\.\d(.*)\)$/g,

    // IE 8:     XX%
    // IE8: /^Mozilla\/4\.0 \(compatible; MSIE 8\.0; Windows NT \d\.\d;(.*)? Trident\/4\.0(;)?(.*)\)$/g,
    IE8: /^Mozilla\/4\.0 \(compatible; MSIE 8\.0; Windows NT \d\.\d(.*)\)$/g,

    // IE 7:      X%
    // FIXME: test for Trident version #
    IE7: /^Mozilla\/4\.0 \(compatible; MSIE 7\.0; Windows NT \d\.\d(.*)\)$/g,

    // IE 6:      X%
    // FIXME: test for Trident version #
    IE6: /^Mozilla\/4\.0 \(compatible; MSIE 6\.0; Windows NT \d\.\d(.*)\)$/g,

    // FF 3.6:    X%
    // Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6;en-US; rv:1.9.2.9) Gecko/20100824 Firefox/3.6.9
    FF36: /^Mozilla\/5\.0 \((Windows NT|Macintosh); U;(.*)rv\:1\.9\.2.(\d{1,2})\)( Gecko\/(\d{8}))? Firefox\/3\.6(\.\d{1,2})?( \(.+\))?$/g,

    // Chrome 18: X%
    CR18: /^Mozilla\/5\.0 \((Windows NT|Macintosh)(;)?( .*)\) AppleWebKit\/535\.19 \(KHTML, like Gecko\) Chrome\/18\.0\.\d{4}\.\d{1,2} Safari\/535\.19$/g,
    // Chrome 17: X%
    // Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.66 Safari/535.11
    // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.66 Safari/535.11
    CR17: /^Mozilla\/5\.0 \((Windows NT|Macintosh)(;)?( .*)\) AppleWebKit\/535\.11 \(KHTML, like Gecko\) Chrome\/17\.0\.\d{3}\.\d{1,2} Safari\/535\.11$/g,

    // FF 10:     X%
    // Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:10.0) Gecko/20100101 Firefox/10.0
    FF10: /^Mozilla\/5\.0 \((Windows NT|Macintosh); (.*)rv\:10\.0(\.\d{1,2})?\) Gecko\/\d{8} Firefox\/10\.0(\.\d{1,2})?$/g,
    // FF 11: (no stats yet, but for good measure)
    FF11: /^Mozilla\/5\.0 \((Windows NT|Macintosh); (.*)rv\:11\.0(\.\d{1,2})?\) Gecko\/\d{8} Firefox\/11\.0(\.\d{1,2})?$/g

    // FIXME(slightlyoff): need to add mobile laggads, but we need to
    // differentiate by OS in order to offer cogent choices
    //
    // Information sources we can mine to make these choices:
    //    http://developer.android.com/about/dashboards/index.html
    //      - looks like 2.3 is really the big issue
    //    http://goo.gl/7yfNy
    //      -
    //
  };

  var CHROME = "CHROME",
      GCF    = "GCF",
      FF     = "FF",
      SAFARI = "SAFARI",
      IE     = "IE",
      OPERA  = "OPERA";

  suchi.options = {
    IE9: {
      "vista": [     CHROME, FF, GCF, OPERA ],
      "win7":  [ IE, CHROME, FF, GCF, OPERA ]
    },
    IE8: {
      "xp":    [     CHROME, FF, GCF, OPERA ],
      "vista": [ IE, CHROME, FF, GCF, OPERA ],
      "win7":  [ IE, CHROME, FF, GCF, OPERA ]
    },
    IE7: {
      "xp":    [     CHROME, FF, GCF, OPERA ],
      "vista": [ IE, CHROME, FF, GCF, OPERA ]
    },
    IE6: {
      "xp":    [     CHROME, FF, GCF, OPERA ]
    }
    // FIXME: need to add mobile dead-ends/options here!
    // Mobile dead-enders that we care about:
    //  Android Browser
    //  Safari on devices that won't get updates
    //    - only evergreen iOS option is a proxy-browser, e.g. Opera Mini
    // Mobile evergreen options:
    //  Opera
    //  Chrome (For ICS+ Android users)
    //  FF: for ARMv7+ devices (see: http://goo.gl/PhQs9)
    // Inclusive-design mobile browsers (no hope, just fallbacks):
    //
  };

  var portable = [ "FF36", "CR18", "CR17", "FF10", "FF11" ];
  for(var x = 0; x < portable.length; x++) {
    suchi.options[portable[x]] = {
      "xp":    [     CHROME, FF, OPERA ],
      "vista": [ IE, CHROME, FF, OPERA ],
      "win7":  [ IE, CHROME, FF, OPERA ],
      "osx":   [     CHROME, FF, OPERA ]
    };
  }

  suchi.prompts = {

  };

  /**
   * Tests a string to see if it matches one of the current most frequently
   * used "left behind" browsers.
   * @param {string} ua The UA String to test.
   * @return {boolean}
   */
  suchi.isBehind = function(ua) {
    if (typeof ua != "string") { return false; }

    for (var x in this.laggards) {
      if (ua.match(this.laggards[x])) {
        return true;
      }
    }
    return false;
  };

  var ua = (global.navigator) ? global.navigator.userAgent : "";

  // TODO(slightlyoff):
  //  * attach to load event and place the promo
  //  * parse and respect the config
  //  * i18n infrastructure

  // TODO(slightlyoff):
  // Determine our current locale, if possible. If not, grab it from the
  // configuration. If all else fails, fall back to en-GB.

})(this);
