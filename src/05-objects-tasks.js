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
  this.getArea = () => width * height;
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
  this.obj = obj;
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
  this.proto = proto;
  this.json = json;
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
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
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
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

const SimpleSelector = class {
  constructor() {
    this.str = '';
    this.stack = [];
    this.isElement = false;
    this.isId = false;
    this.isPseudoElement = false;
  }

  stringify() {
    return this.str;
  }

  element(value) {
    if (this.isElement) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.isElement = true;
    this.str += value;
    const lastOrder = this.stack.pop();
    if (lastOrder && lastOrder > 0) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    } else {
      this.stack.push(0);
    }
    return this;
  }

  id(value) {
    if (this.isId) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.isId = true;
    this.str += `#${value}`;
    const lastOrder = this.stack.pop();
    if (lastOrder && lastOrder > 1) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    } else {
      this.stack.push(1);
    }
    return this;
  }

  class(value) {
    this.str += `.${value}`;
    const lastOrder = this.stack.pop();
    if (lastOrder && lastOrder > 2) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    } else {
      this.stack.push(2);
    }
    return this;
  }

  attr(value) {
    this.str += `[${value}]`;
    const lastOrder = this.stack.pop();
    if (lastOrder && lastOrder > 3) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    } else {
      this.stack.push(3);
    }
    return this;
  }

  pseudoClass(value) {
    this.str += `:${value}`;
    const lastOrder = this.stack.pop();
    if (lastOrder && lastOrder > 4) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    } else {
      this.stack.push(4);
    }
    return this;
  }

  pseudoElement(value) {
    if (this.isPseudoElement) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.isPseudoElement = true;
    this.str += `::${value}`;
    const lastOrder = this.stack.pop();
    if (lastOrder && lastOrder > 5) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    } else {
      this.stack.push(5);
    }
    return this;
  }

  combine(combinator, selector) {
    this.str += ` ${combinator} ${selector.stringify()}`;
    return this;
  }
};

const cssSelectorBuilder = {
  result: null,

  element(value) {
    this.result = new SimpleSelector();
    return this.result.element(value);
  },

  id(value) {
    this.result = new SimpleSelector();
    return this.result.id(value);
  },

  class(value) {
    this.result = new SimpleSelector();
    return this.result.class(value);
  },

  attr(value) {
    this.result = new SimpleSelector();
    return this.result.attr(value);
  },

  pseudoClass(value) {
    this.result = new SimpleSelector();
    return this.result.pseudoClass(value);
  },

  pseudoElement(value) {
    this.result = new SimpleSelector();
    return this.result.pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    this.result = selector1.combine(combinator, selector2);
    return this.result;
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
