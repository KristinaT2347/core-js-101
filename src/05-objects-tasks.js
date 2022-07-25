/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;

  this.getArea = function getArea() {
    return this.width * this.height;
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.assign(Object.create(proto), JSON.parse(json));
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used asd facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class Builder {
  constructor(base, newValue, fields) {
    this.value = newValue || '';
    this.withElement = (base && base.withElement) || false;
    this.withId = (base && base.withId) || false;
    this.withClass = (base && base.withClass) || false;
    this.withAttribute = (base && base.withAttribute) || false;
    this.withPseudoClass = (base && base.withPseudoClass) || false;
    this.withPseudoElement = (base && base.withPseudoElement) || false;

    if (fields) {
      Object.assign(this, fields);
    }
  }

  element(value) {
    if (this.withElement) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    if (
      this.withId
      || this.withClass
      || this.withAttribute
      || this.withPseudoClass
      || this.withPseudoElement
    ) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    return new Builder(this, this.value + value, { withElement: true });
  }

  id(value) {
    if (this.withId) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    if (
      this.withClass
      || this.withAttribute
      || this.withPseudoClass
      || this.withPseudoElement
    ) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    return new Builder(this, `${this.value}#${value}`, { withId: true });
  }

  class(value) {
    if (this.withAttribute || this.withPseudoClass || this.withPseudoElement) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    return new Builder(this, `${this.value}.${value}`, { withClass: true });
  }

  attr(value) {
    if (this.withPseudoClass || this.withPseudoElement) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    return new Builder(this, `${this.value}[${value}]`, {
      withAttribute: true,
    });
  }

  pseudoClass(value) {
    if (this.withPseudoElement) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    return new Builder(this, `${this.value}:${value}`, {
      withPseudoClass: true,
    });
  }

  pseudoElement(value) {
    if (this.withPseudoElement) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    return new Builder(this, `${this.value}::${value}`, {
      withPseudoElement: true,
    });
  }

  combine(selector1, combinator, selector2) {
    return new Builder(
      this,
      `${selector1.stringify()} ${combinator} ${selector2.stringify()}`,
    );
  }

  stringify() {
    return this.value;
  }
}

const emptyBuilder = new Builder();

const cssSelectorBuilder = {
  element: emptyBuilder.element.bind(emptyBuilder),
  id: emptyBuilder.id.bind(emptyBuilder),
  class: emptyBuilder.class.bind(emptyBuilder),
  attr: emptyBuilder.attr.bind(emptyBuilder),
  pseudoClass: emptyBuilder.pseudoClass.bind(emptyBuilder),
  pseudoElement: emptyBuilder.pseudoElement.bind(emptyBuilder),
  combine: emptyBuilder.combine.bind(emptyBuilder),
  stringify: emptyBuilder.stringify.bind(emptyBuilder),
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
