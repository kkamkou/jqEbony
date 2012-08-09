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
 *  jQuery.jqEbonyOptions.color = '#FFF'; // global
 *  jQuery('#myDiv').jqEbony({
 *      'opacity': 0.5,
 *      'zIndex': 99999,
 *      'callbackClose': null,
 *      'callbackOpen': null,
 *      'animationSpeed': 200,
 *      'color': [0, 0, 0] // white
 *  });
 */
(function (doc, $) {
    "use strict";

    // default options
    $.jqEbonyOptions = {
        'opacity': 0.5,
        'zIndex': 99999,
        'callbackClose': null,
        'callbackOpen': null,
        'animationSpeed': 1, // in ms, for example: 200, 400 or 800
        'color': [0, 0, 0]
    };

    // main class
    var JqEbony = function (options, element) {
        // default members
        this.layout = null;
        this.element = element;
        this.options = $.extend($.jqEbonyOptions, options || {});
    };

    // extends
    JqEbony.prototype = {
        // returns the ebony layout
        getLayout: function () {
            return this.layout;
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
            return this.options;
        },

        // current element
        getElement: function () {
            return this.element;
        },

        // sets z-index value
        setIndexZ: function (val) {
            $('body').data('jqEbony', val);
            return this;
        },

        // updates the layout object
        setLayout: function (layout) {
            this.layout = layout;
            return this;
        },

        // checks if layout exists
        hasLayout: function () {
            return !!this.layout;
        },

        open: function () {
            // have layout? so, no features
            if (this.hasLayout()) {
                return this;
            }

            // default layout object
            this.setLayout(this.getDefaultLayout());

            // key listeners
            this._setListeners();

            // wrapper
            this.getElement().wrapAll(this.getLayout());

            this._transform() // overlay transformations
                .setIndexZ(this.getIndexZ() + 1); // z-index corrections

            // defaults
            var that = this;

            // we should display all we have so far
            this.getElement().parent().fadeIn(
                this.getOptions().animationSpeed,
                function () {
                    that.getElement()
                        .css('z-index', that.getIndexZ())
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
            // no layout - no features
            if (!this.hasLayout()) {
                return this;
            }

            // before close function
            if (typeof (this.getOptions().callbackClose) === 'function') {
                this.getOptions().callbackClose(this);
            }

            var that = this;

            // overlay close
            this.getElement().parent().fadeOut(
                this.getOptions().animationSpeed,
                function () {
                    // DOM cleanup
                    that.layoutRemove();
                }
            );

            return this;
        },

        // default element with style (black area)
        getDefaultLayout: function () {
            return $('<div />').addClass('jqEbony')
                .css({
                    'display': 'none',
                    'position': 'fixed',
                    'right': 0,
                    'top': 0,
                    'left': 0,
                    'bottom': 0,
                    'overflow': 'auto',
                    'zoom': 1,
                    'z-index': this.getIndexZ(),
                    'background': 'rgba('
                        + (this.getOptions().color).join(',') + ','
                        + this.getOptions().opacity
                        + ')'
                });
        },

        // adds events (escape and the mouse click)
        _setListeners: function () {
            var that = this;

            // escape key
            $(doc).one('keydown', function (event) {
                if ((event.keyCode || event.which) === 27) {
                    event.stopImmediatePropagation();
                    return that.close();
                }
            });

            // let's make the current event first
            $(doc).data('events').keydown.unshift(
                $(doc).data('events').keydown.pop()
            );

            // layout click
            this.getLayout().bind('click', function () {
                that.close();
                return false;
            });

            return this;
        },

        // element transformation
        _transform: function () {
            var $elem = this.getElement(),
                $body = $('body'),
                $html = $('html'),
                old = {
                    'outerWidth': $body.outerWidth(true),
                    'marginRight': parseInt($('body').css('margin-right'), 10),
                    'scrollTop': $html.scrollTop()
                };

            // storing old styles
            this.getLayout().data('jqEbonyData', {
                'element': {
                    'position': $elem.css('position'),
                    'display': $elem.css('display'),
                    'visibility': $elem.css('visibility')
                },
                'html': {'overflow': $('body').css('overflow-y')},
                'body': {'margin-right': $('body').css('margin-right')},
                'layout': old
            });

            // overflow corrections of the body
            $html.css('overflow', 'hidden');

            // scroll corrections
            $body.css(
                'margin-right',
                $body.outerWidth(true) - old.outerWidth + old.marginRight
            );

            // firefox fix
            $html.scrollTop(old.scrollTop);

            return this;
        },

        // custom data cleanup
        _revert: function () {
            // z-index corrections
            this.setIndexZ(this.getIndexZ() - 1);

            // we can get here another element
            if (!this.getLayout().data('jqEbonyData')) {
                return this;
            }

            // the layout object
            var $layout = this.getLayout(),
                oldScroll = $('html').scrollTop();

            // body revert
            if (!$('div.jqEbony').length) {
                $('body').css($layout.data('jqEbonyData').body);

                // html revert
                $('html').css($layout.data('jqEbonyData').html)
                    .scrollTop(oldScroll); // firefox fix
            }

            // element styles update
            this.getElement()
                .css($layout.data('jqEbonyData').element)
                .removeData('jqEbonyData');

            return this;
        },

        // removes black area from the DOM
        layoutRemove: function () {
            // layout cleanup
            this.getElement().unwrap();

            // design revert
            this._revert();

            // memory cleanup
            this.setLayout(null);

            return this;
        }
    };

    // jQuery plugin
    $.fn.jqEbony = function (options) {
        return (new JqEbony(options, $(this)));
    };
}(document, jQuery));
