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

    // main class
    var JqEbony = function (options, element) {
        // default members
        this._layout = null;
        this._element = element;
        this._options = $.extend({
            'opacity': 0.5,
            'zIndex': 99999,
            'callbackClose': null,
            'callbackOpen': null,
            'animationSpeed': 0, // in ms, for example: 200, 400 or 800
            'color': '#000'
        }, options || {});
    };

    // extends
    JqEbony.prototype = {
        // returns the ebony layout
        getLayout: function () {
            if (!this._layout) {
                this._layout = this._getDefaultLayout();
            }
            return this._layout;
        },

        // returns z-index value
        getIndexZ: function () {
            return parseInt(
                $('body').data('jqEbony') || this.getOptions().zIndex,
                10
            );
        },

        // options here
        getOptions: function () {
            return this._options;
        },

        // current element
        getElement: function () {
            return this._element;
        },

        // sets z-index value
        setIndexZ: function (val) {
            $('body').data('jqEbony', val);
            return this;
        },

        // checks if layout exists
        hasLayout: function () {
            return !!this._layout;
        },

        open: function () {
            // have layout? so, no features
            if (this.hasLayout()) {
                return this;
            }

            // key binding
            this._setListener();
            this._transform();

            // z-index increase
            this.setIndexZ(this.getIndexZ() + 1);

            // defaults
            var that = this;

            // we should display all we have so far
            this.getLayout()
                .fadeIn(
                    this.getOptions().animationSpeed,
                    function () {
                        that.getElement().css('z-index', that.getIndexZ())
                            .fadeIn(
                                that.getOptions().animationSpeed,
                                function () {
                                    if (typeof (that.getOptions().callbackOpen) === 'function') {
                                        that.getOptions().callbackOpen(that);
                                    }
                                }
                            );
                    }
                );

            return this;
        },

        close: function () {
            // before close function
            if (typeof (this.getOptions().callbackClose) === 'function') {
                this.getOptions().callbackClose(this);
            }

            // no layout - no features
            if (!this.hasLayout()) {
                return this;
            }

            var that = this;

            // overlay close
            this.getElement().fadeOut(
                this.getOptions().animationSpeed || 0,
                function () {
                    // DOM cleanup
                    that.getLayout().fadeOut(
                        that.getOptions().animationSpeed * 0.5,
                        function () {
                            that._layoutRemove();
                        }
                    );
                }
            );

            return this;
        },

        // default element with style (black area)
        _getDefaultLayout: function () {
            return $('<div />').css({
                'bottom': 0,
                'display': 'none',
                'left': 0,
                'position': 'fixed',
                '_position': 'absolute', // ie fix
                'right': 0,
                'top': 0,
                'background-color' : this.getOptions().color,
                'z-index': this.getIndexZ(),
                'opacity': this.getOptions().opacity,
                'width': '100%',
                'height': '100%'
            });
        },

        // adds events (escape and the mouse click)
        _setListener: function () {
            var that = this;

            // escape key
            $(doc).one('keydown', function (event) {
                if ((event.keyCode || event.which) === 27) {
                    event.stopImmediatePropagation();
                    return that.close(that.getOptions().animationSpeed);
                }
            });

            // let's make the current event first
            $(doc).data('events').keydown.unshift(
                $(doc).data('events').keydown.pop()
            );

            // DOM update
            $('body').append(
                that.getLayout().bind('click', function () {
                    return that.close(that.getOptions().animationSpeed);
                })
            );
        },

        // element transformation
        _transform: function () {
            var $elem = this.getElement();

            // storing old styles
            $elem.data('jqEbonyData', {
                'position': $elem.css('position'),
                'display': $elem.css('display'),
                'visibility': $elem.css('visibility')
            });

            // storing old styles
            $elem.data('jqEbony', this);

            // position of the element
            $elem.css(
                'position',
                $elem.css('position') === 'static'
                    ? 'relative' : $elem.css('position')
            );

            return this;
        },

        // custom data cleanup
        _revert: function () {
            // we can get here another element
            if (!this.getElement().data('jqEbonyData')) {
                return this;
            }

            this.getElement()
                .css(this.getElement().data('jqEbonyData'))
                .removeData('jqEbonyData')
                .removeData('jqEbony');
            return this;
        },

        // removes black area from the DOM
        _layoutRemove: function () {
            this._revert()
                .setIndexZ(this.getIndexZ() - 1)
                .getLayout().remove();

            this._layout = null; // memory cleanup

            return this;
        }
    };

    // jQuery plugin
    $.fn.jqEbony = function (options) {
        if (this.data('jqEbony')) {
            return this.data('jqEbony');
        }
        return new JqEbony(options, this);
    };
}(document, jQuery));
