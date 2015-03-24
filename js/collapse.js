/* ========================================================================
 * Bootstrap: collapse.js v3.3.4
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


 // The + sign is used to force the JavaScript compiler into seeing the next statement
 // as a function expression.
 // Immediately Invoked Function Expression (IIFE) used to scope all variables.
+function ($) {
  // Use strict mode (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)
  'use strict';

  // ## COLLAPSE PUBLIC CLASS DEFINITION

  /*
   * Collapse constructor
   * @param element - the DOM element that should be expanded / collapsed
   * param options - an options dictionary */
  var Collapse = function (element, options) {
    // Use the DOM element to create a jQuery object
    this.$element      = $(element) 

    // $.extend is used to create a options dictionary. It starts with the empty object {}, adds the default
    // properties and adds/overwrites using the options parameter
    this.options       = $.extend({}, Collapse.DEFAULTS, options)

    // Find the elements that can trigger the expand / collapse by looking for all elements
    // that link to the elements ID, either by href of a data-target attribute
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]') 

    // Is the element currently being collapsed / expanded?
    this.transitioning = null

    // A parent selector can be defined to collapse all other child elements when expanding
    // an element. In that case create a jQuery object containing the parent element and ...
    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  // Bootstrap version number constant
  Collapse.VERSION  = '3.3.4'

  // How many milliseconds a transition takes
  Collapse.TRANSITION_DURATION = 350

  // The default options dictionary
  Collapse.DEFAULTS = {
    toggle: true
  }

  // __dimension__
  //
  // if the element has a `width` class return `width` otherwise `height`
  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  // __show__
  Collapse.prototype.show = function () {
    // stop if the element is transitioning or already open
    if (this.transitioning || this.$element.hasClass('in')) return

    // get all other collapsible elements for the parent of the element
    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      // TODO: i think the data bs.collapse isn't a data attribute, but a jQuery data object
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    // Trigger the `show.bs.collapse` event. This is to allow an event handler to cancel the expanding
    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    // collapse all other collapsible elements belonging the elements parent by calling
    // `hide` on them.
    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      // TODO: not a clue what this does
      activesData || actives.data('bs.collapse', null)
    }

    // the dimension contains the jQuery function to call on the element to set either
    // the `height` or `width` to 0.
    var dimension = this.dimension()

    // expand the element
    this.$element
      .removeClass('collapse')
      // The `[dimension](0)` is used to set the direction in which the expansion should occur to 0.
      // basically it does e.g. `$element.height(0)`.
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    // tell the triggers that the element is now expanded.
    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    // the `complete` function will be used when the transition animation is done
    var complete = function () {
      // remove the `collapsing` class, add the `collapse` and `in` class and remove the `height` or
      // `width` attribute.
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0

      // trigger the `shown.bs.collapse` than an event handler can use to be notified when an element
      // has been expanded.
      this.$element
        .trigger('shown.bs.collapse')
    }

    // If there is no support for css3 transition events directly call the `complete` function. 
    // `$.support.transition` is added by Bootstraps `transition.js`.
    if (!$.support.transition) return complete.call(this)

    // scrollSize is either `scrollHeight` or `scrollWidth` depending on the direction of the
    // collapse / expand.
    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      // add a one time event handler that calls the `complete` function when the `bsTransitionEnd` event
      // is fired. This event is defined in `transition.js` and is fired when the browser specific 
      // `transitionend` occurs.
      .one('bsTransitionEnd', $.proxy(complete, this))
      // This provides a fallback to fire the `bsTransitionEnd` event in case the 'transitionend' event isn't
      // fired by the browser (usually in case a paint isn't triggered).
      // the `[dimension...` sets the dimension (either `height` or `width`) to the size of the
      // elements content and does the actual expanding of the element.
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  // __hide__
  Collapse.prototype.hide = function () {
    // stop if the element is transitioning or collapsed
    if (this.transitioning || !this.$element.hasClass('in')) return

    // create and trigger a `hide.bs.collapse` event on the element. This can be used by an event handler
    // to halt the collapse.
    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    // get the direction of the collapse movement, either `height` or `width`.
    var dimension = this.dimension()

    // This changes the `height: auto` to a fixed height by getting and setting the height
    // using jQuery. The `offsetHeight` is read to force a reflow. After this step the CSS animation can be
    // used to animate from e.g. `height: 400px` to `height: 0`. Transitioning from `height: auto` to
    // `height: 0;` isn't possible.
    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  /* 
  // __toggle__
  //
  // The conditional operator is used to decide which function should be executed, if the element has the
  // class `in` it should `hide` the element, otherwise it should `show` the element.
  // The function expression to execute is located on the object by e.g. `this['hide']` and executed 
  // by adding the `()` which basically does e.g. `this.hide()`.
  */
  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  // __getParent__
  //
  // find all collapsible/expandable elements belonging to the parent element by looking for
  // child elements of the parent that have a data-attribute `data-toggle` set to `collapse`, and a
  // `data-parent` data-attribute set to the `this.options.parent` selector.
  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  // __addAriaAndCollapsedClass__
  //
  // Sets the [`aria-expanded`](http://www.w3.org/TR/wai-aria/states_and_properties#aria-expanded)
  // accessibility attribute and adds or removes the `collapsed` class on the triggering element.
  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  // __getTargetFromTrigger__
  //
  // The target element is taken from the `data-target` or `href` attribute on the trigger. As an `href`
  // attribute like `#example` is seen by Internet Explorer 7 as e.g. `http://www.example.com/#example`
  // there is some cleanup to be done. The regular expression uses a positive lookahead to remove everything
  // up to the last `#` character.
  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // ## COLLAPSE PLUGIN DEFINITION

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // ## COLLAPSE NO CONFLICT
  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // ## COLLAPSE DATA-API

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);
