/**
 * Licensed under the MIT License
 * Redistributions of files must retain the copyright notice below.
 *
 * @category ThirdParty
 * @author   Kanstantsin A Kamkou (2ka.by)
 * @license  http://www.opensource.org/licenses/mit-license.php The MIT License
 * @link     https://github.com/kkamkou/jqEbony
 */

/**
 * Creates black area for the DOM element
 *
 * @example:
 *  jQuery('#myDiv').jqEbony({
 *      'opacity': 0.5,
 *      'zIndex': 99999,
 *      'callbackClose': null,
 *      'callbackOpen': null,
 *      'animationSpeed': 200,
 *      'color': '#000'
 *  });
 */
(function (doc, $) {
    "use strict";

    var jqEbony = function () {
        var layout = null,
            callbackClose = null;
    };

    jqEbony.prototype = {
        setCallbackClose: function (obj) {
            this.callbackClose = obj;
            return this;
        },

        setLayout: function (obj) {
            this.layout = obj;
            return this;
        },

        getLayout: function () {
            return this.layout;
        },

        setIndexZ: function (val) {
            $('body').data('jqEbony', val);
            return this;
        },

        getIndexZ: function () {
            return parseInt($('body').data('jqEbony'), 10);
        },

        close: function (speed) {
            var $self = this;

            // close callback
            if (typeof (this.callbackClose) === 'function') {
                this.callbackClose(this.getIndexZ() + 1);
            }

            // overlay close
            this.getLayout().fadeOut(speed || 0, function () {
                $self.setIndexZ($self.getIndexZ() - 1);
                $self.getLayout().remove();
            });

            return this;
        }
    };

    // jQuery plugin
    $.fn.jqEbony = function (options) {
        options = $.extend({
            'opacity': 0.5,
            'zIndex': 99999,
            'callbackClose': null,
            'callbackOpen': null,
            'animationSpeed': 0, // in ms, for example: 200, 400 or 800
            'color': '#000'
        }, options || {});

        var $self = this,
            $holder = $('<div />'),
            theOverlay = new jqEbony(),
            currentZ = (theOverlay.getIndexZ() || options.zIndex) + 1;

        $holder.css({
            'bottom': 0,
            'display': 'none',
            'left': 0,
            'position': 'fixed',
            '_position': 'absolute', // ie fix
            'right': 0,
            'top': 0,
            'background-color' : options.color,
            'z-index': currentZ,
            'opacity': options.opacity,
            'width': '100%',
            'height': '100%'
        });

        // escape key
        $(doc).one('keydown', function (event) {
            if ((event.keyCode || event.which) === 27) {
                event.stopImmediatePropagation();
                return theOverlay.close(options.animationSpeed);
            }
        });

        // let's make the current event first
        $(doc).data('events').keydown.unshift(
            $(doc).data('events').keydown.pop()
        );

        // DOM update
        $('body').append(
            $holder.bind('click', function () {
                return theOverlay.close(options.animationSpeed);
            })
        );

        // creating object
        theOverlay.setLayout($holder)
            .setCallbackClose(options.callbackClose)
            .setIndexZ(currentZ);

        // we should display all we have so far
        $holder.fadeIn(options.animationSpeed, function () {
            $self.css('z-index', currentZ + 1)
                .fadeIn(options.animationSpeed, function () {
                    if (typeof (options.callbackOpen) === 'function') {
                        options.callbackOpen();
                    }
                });
        });

        return theOverlay;
    };
}(document, jQuery));
