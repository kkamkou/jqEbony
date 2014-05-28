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
 * v1.2
 *
 * Creates black area for the DOM element
 *
 * @example:
 *  jQuery.jqEbonyOptions.color = [0, 0, 0]; // global
 *  jQuery('#myDiv').jqEbony({
 *      'opacity': 0.5,
 *      'zIndex': 99999,
 *      'callbackClose': null,
 *      'callbackCloseBefore': null,
 *      'callbackOpen': null,
 *      'escapeCloses': true,
 *      'clickCloses': true,
 *      'animationSpeed': 200,
 *      'color': [0, 0, 0] // white
 *  });
 */
(function (doc, $) {
  "use strict";

  // default options
  $.jqEbonyOptions = {
    'opacity': 0.7,
    'zIndex': 99999,
    'escapeCloses': true,
    'clickCloses': true,
    'clickCloseArea': null,
    'callbackClose': null,
    'callbackCloseBefore': null,
    'callbackOpen': null,
    'animationSpeed': 0, // in ms, for example: 200, 400 or 800
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
        $('body').data('jqEbony') || this.getOptions().zIndex, 10
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

    // creates overlay and shows it
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
      this.getElement().hide().parent().fadeIn(
        this.getOptions().animationSpeed,
        function () {
          that.getElement()
            .css('z-index', that.getIndexZ())
            .fadeIn(
              parseInt(that.getOptions().animationSpeed / 2, 10),
              function () {
                if ($.isFunction(that.getOptions().callbackOpen)) {
                  that.getOptions().callbackOpen.call(that);
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

      // defaults
      var that = this,
        $element = this.getElement();

      // pre-close callback
      if ($.isFunction(this.getOptions().callbackCloseBefore)) {
        this.getOptions().callbackCloseBefore($element);
      }

      // overlay close
      $element.parent().fadeOut(
        this.getOptions().animationSpeed,
        function () {
          // DOM cleanup
          $element.unwrap();

          // design revert
          that._revert();

          // memory cleanup
          that.setLayout(null);

          // before close function
          if ($.isFunction(that.getOptions().callbackClose)) {
            that.getOptions().callbackClose.call(that);
          }
        }
      );

      return this;
    },

    // default element with style (black area)
    getDefaultLayout: function () {
      var rgba = [];

      rgba.push(this.getOptions().color);
      rgba.push(this.getOptions().opacity);

      return $('<div />').addClass('jqEbony')
        .css({
          'display': 'none',
          'position': 'fixed',
          'right': 0,
          'top': 0,
          'left': 0,
          'bottom': 0,
          'overflow': 'auto',
          'z-index': this.getIndexZ(),
          'background': 'rgba(' + rgba.join(',') + ')'
        });
    },

    // adds events (escape and the mouse click)
    _setListeners: function () {
      var that = this;

      // escape key
      if (this.options.escapeCloses) {
        $(doc).one('keyup.jqEbony', function (event) {
          if ((event.keyCode || event.which) === 27) {
            event.stopImmediatePropagation();
            return that.close();
          }
        });

        // let's make the current event first
        $._data(doc, 'events').keyup.unshift(
          $._data(doc, 'events').keyup.pop()
        );
      }

      // layout click
      if (this.options.clickCloses) {
        // default click target
        var $clickArea = this.getElement().parent();

        // click target changeg by options
        if (this.getOptions().clickCloseArea !== null) {
          $clickArea = $(this.getOptions().clickCloseArea);
        }

        // click listener
        this.getElement().bind('click.jqEbony', function (e) {
          var $target = $(e.target);
          $('>*', $clickArea).each(function () {
            if (e.target !== this &&
              !$(this).is('script') && !$(this).is('style') &&
              $target.closest('html', this).length) {
              return that.close();
            }
          });
        });
      }

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

      // storing object
      $elem.data('jqEbony', this);

      // storing old styles
      this.getLayout().data('jqEbonyData', {
        'element': {
          'position': $elem.css('position'),
          'display': $elem.css('display'),
          'visibility': $elem.css('visibility')
        },
        'html': {'overflow': $('html').css('overflow-y')},
        'body': {'margin-right': $('body').css('margin-right')}
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
        .removeData('jqEbonyData')
        .removeData('jqEbony');

      return this;
    }
  };

  // jQuery plugin
  $.fn.jqEbony = function (options) {
    return (this.data('jqEbony') || new JqEbony(options, $(this)));
  };
}(document, jQuery));
