(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* Riot v4.11.1, @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.riot = {}));
}(this, (function (exports) { 'use strict';

  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */

  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */
  function dashToCamelCase(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  }
  /**
   * Move all the child nodes from a source tag to another
   * @param   {HTMLElement} source - source node
   * @param   {HTMLElement} target - target node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */
  // Ignore this helper because it's needed only for svg tags


  function moveChildren(source, target) {
    if (source.firstChild) {
      target.appendChild(source.firstChild);
      moveChildren(source, target);
    }
  }
  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */


  function cleanNode(node) {
    clearChildren(node.childNodes);
  }
  /**
   * Clear multiple children in a node
   * @param   {HTMLElement[]} children - direct children nodes
   * @returns {undefined}
   */


  function clearChildren(children) {
    Array.from(children).forEach(removeNode);
  }
  /**
   * Remove a node from the DOM
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */


  function removeNode(node) {
    const {
      parentNode
    } = node;
    if (node.remove) node.remove();
    /* istanbul ignore else */
    else if (parentNode) parentNode.removeChild(node);
  }

  const EACH = 0;
  const IF = 1;
  const SIMPLE = 2;
  const TAG = 3;
  const SLOT = 4;
  var bindingTypes = {
    EACH,
    IF,
    SIMPLE,
    TAG,
    SLOT
  };
  const ATTRIBUTE = 0;
  const EVENT = 1;
  const TEXT = 2;
  const VALUE = 3;
  var expressionTypes = {
    ATTRIBUTE,
    EVENT,
    TEXT,
    VALUE
  };
  /**
   * Create the template meta object in case of <template> fragments
   * @param   {TemplateChunk} componentTemplate - template chunk object
   * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
   */

  function createTemplateMeta(componentTemplate) {
    const fragment = componentTemplate.dom.cloneNode(true);
    return {
      avoidDOMInjection: true,
      fragment,
      children: Array.from(fragment.childNodes)
    };
  }

  const {
    indexOf: iOF
  } = [];

  const append = (get, parent, children, start, end, before) => {
    const isSelect = ('selectedIndex' in parent);
    let noSelection = isSelect;

    while (start < end) {
      const child = get(children[start], 1);
      parent.insertBefore(child, before);

      if (isSelect && noSelection && child.selected) {
        noSelection = !noSelection;
        let {
          selectedIndex
        } = parent;
        parent.selectedIndex = selectedIndex < 0 ? start : iOF.call(parent.querySelectorAll('option'), child);
      }

      start++;
    }
  };

  const eqeq = (a, b) => a == b;

  const identity = O => O;

  const indexOf = (moreNodes, moreStart, moreEnd, lessNodes, lessStart, lessEnd, compare) => {
    const length = lessEnd - lessStart;
    /* istanbul ignore if */

    if (length < 1) return -1;

    while (moreEnd - moreStart >= length) {
      let m = moreStart;
      let l = lessStart;

      while (m < moreEnd && l < lessEnd && compare(moreNodes[m], lessNodes[l])) {
        m++;
        l++;
      }

      if (l === lessEnd) return moreStart;
      moreStart = m + 1;
    }

    return -1;
  };

  const isReversed = (futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare) => {
    while (currentStart < currentEnd && compare(currentNodes[currentStart], futureNodes[futureEnd - 1])) {
      currentStart++;
      futureEnd--;
    }

    return futureEnd === 0;
  };

  const next = (get, list, i, length, before) => i < length ? get(list[i], 0) : 0 < i ? get(list[i - 1], -0).nextSibling : before;

  const remove = (get, children, start, end) => {
    while (start < end) drop(get(children[start++], -1));
  }; // - - - - - - - - - - - - - - - - - - -
  // diff related constants and utilities
  // - - - - - - - - - - - - - - - - - - -


  const DELETION = -1;
  const INSERTION = 1;
  const SKIP = 0;
  const SKIP_OND = 50;

  const HS = (futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges) => {
    let k = 0;
    /* istanbul ignore next */

    let minLen = futureChanges < currentChanges ? futureChanges : currentChanges;
    const link = Array(minLen++);
    const tresh = Array(minLen);
    tresh[0] = -1;

    for (let i = 1; i < minLen; i++) tresh[i] = currentEnd;

    const nodes = currentNodes.slice(currentStart, currentEnd);

    for (let i = futureStart; i < futureEnd; i++) {
      const index = nodes.indexOf(futureNodes[i]);

      if (-1 < index) {
        const idxInOld = index + currentStart;
        k = findK(tresh, minLen, idxInOld);
        /* istanbul ignore else */

        if (-1 < k) {
          tresh[k] = idxInOld;
          link[k] = {
            newi: i,
            oldi: idxInOld,
            prev: link[k - 1]
          };
        }
      }
    }

    k = --minLen;
    --currentEnd;

    while (tresh[k] > currentEnd) --k;

    minLen = currentChanges + futureChanges - k;
    const diff = Array(minLen);
    let ptr = link[k];
    --futureEnd;

    while (ptr) {
      const {
        newi,
        oldi
      } = ptr;

      while (futureEnd > newi) {
        diff[--minLen] = INSERTION;
        --futureEnd;
      }

      while (currentEnd > oldi) {
        diff[--minLen] = DELETION;
        --currentEnd;
      }

      diff[--minLen] = SKIP;
      --futureEnd;
      --currentEnd;
      ptr = ptr.prev;
    }

    while (futureEnd >= futureStart) {
      diff[--minLen] = INSERTION;
      --futureEnd;
    }

    while (currentEnd >= currentStart) {
      diff[--minLen] = DELETION;
      --currentEnd;
    }

    return diff;
  }; // this is pretty much the same petit-dom code without the delete map part
  // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L556-L561


  const OND = (futureNodes, futureStart, rows, currentNodes, currentStart, cols, compare) => {
    const length = rows + cols;
    const v = [];
    let d, k, r, c, pv, cv, pd;

    outer: for (d = 0; d <= length; d++) {
      /* istanbul ignore if */
      if (d > SKIP_OND) return null;
      pd = d - 1;
      /* istanbul ignore next */

      pv = d ? v[d - 1] : [0, 0];
      cv = v[d] = [];

      for (k = -d; k <= d; k += 2) {
        if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
          c = pv[pd + k + 1];
        } else {
          c = pv[pd + k - 1] + 1;
        }

        r = c - k;

        while (c < cols && r < rows && compare(currentNodes[currentStart + c], futureNodes[futureStart + r])) {
          c++;
          r++;
        }

        if (c === cols && r === rows) {
          break outer;
        }

        cv[d + k] = c;
      }
    }

    const diff = Array(d / 2 + length / 2);
    let diffIdx = diff.length - 1;

    for (d = v.length - 1; d >= 0; d--) {
      while (c > 0 && r > 0 && compare(currentNodes[currentStart + c - 1], futureNodes[futureStart + r - 1])) {
        // diagonal edge = equality
        diff[diffIdx--] = SKIP;
        c--;
        r--;
      }

      if (!d) break;
      pd = d - 1;
      /* istanbul ignore next */

      pv = d ? v[d - 1] : [0, 0];
      k = c - r;

      if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
        // vertical edge = insertion
        r--;
        diff[diffIdx--] = INSERTION;
      } else {
        // horizontal edge = deletion
        c--;
        diff[diffIdx--] = DELETION;
      }
    }

    return diff;
  };

  const applyDiff = (diff, get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before) => {
    const live = [];
    const length = diff.length;
    let currentIndex = currentStart;
    let i = 0;

    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          futureStart++;
          currentIndex++;
          break;

        case INSERTION:
          // TODO: bulk appends for sequential nodes
          live.push(futureNodes[futureStart]);
          append(get, parentNode, futureNodes, futureStart++, futureStart, currentIndex < currentLength ? get(currentNodes[currentIndex], 0) : before);
          break;

        case DELETION:
          currentIndex++;
          break;
      }
    }

    i = 0;

    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          currentStart++;
          break;

        case DELETION:
          // TODO: bulk removes for sequential nodes
          if (-1 < live.indexOf(currentNodes[currentStart])) currentStart++;else remove(get, currentNodes, currentStart++, currentStart);
          break;
      }
    }
  };

  const findK = (ktr, length, j) => {
    let lo = 1;
    let hi = length;

    while (lo < hi) {
      const mid = (lo + hi) / 2 >>> 0;
      if (j < ktr[mid]) hi = mid;else lo = mid + 1;
    }

    return lo;
  };

  const smartDiff = (get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before) => {
    applyDiff(OND(futureNodes, futureStart, futureChanges, currentNodes, currentStart, currentChanges, compare) || HS(futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges), get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before);
  };

  const drop = node => (node.remove || dropChild).call(node);

  function dropChild() {
    const {
      parentNode
    } = this;
    /* istanbul ignore else */

    if (parentNode) parentNode.removeChild(this);
  }
  /*! (c) 2018 Andrea Giammarchi (ISC) */


  const domdiff = (parentNode, // where changes happen
  currentNodes, // Array of current items/nodes
  futureNodes, // Array of future items/nodes
  options // optional object with one of the following properties
  //  before: domNode
  //  compare(generic, generic) => true if same generic
  //  node(generic) => Node
  ) => {
    if (!options) options = {};
    const compare = options.compare || eqeq;
    const get = options.node || identity;
    const before = options.before == null ? null : get(options.before, 0);
    const currentLength = currentNodes.length;
    let currentEnd = currentLength;
    let currentStart = 0;
    let futureEnd = futureNodes.length;
    let futureStart = 0; // common prefix

    while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentStart], futureNodes[futureStart])) {
      currentStart++;
      futureStart++;
    } // common suffix


    while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])) {
      currentEnd--;
      futureEnd--;
    }

    const currentSame = currentStart === currentEnd;
    const futureSame = futureStart === futureEnd; // same list

    if (currentSame && futureSame) return futureNodes; // only stuff to add

    if (currentSame && futureStart < futureEnd) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentStart, currentLength, before));
      return futureNodes;
    } // only stuff to remove


    if (futureSame && currentStart < currentEnd) {
      remove(get, currentNodes, currentStart, currentEnd);
      return futureNodes;
    }

    const currentChanges = currentEnd - currentStart;
    const futureChanges = futureEnd - futureStart;
    let i = -1; // 2 simple indels: the shortest sequence is a subsequence of the longest

    if (currentChanges < futureChanges) {
      i = indexOf(futureNodes, futureStart, futureEnd, currentNodes, currentStart, currentEnd, compare); // inner diff

      if (-1 < i) {
        append(get, parentNode, futureNodes, futureStart, i, get(currentNodes[currentStart], 0));
        append(get, parentNode, futureNodes, i + currentChanges, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
        return futureNodes;
      }
    }
    /* istanbul ignore else */
    else if (futureChanges < currentChanges) {
        i = indexOf(currentNodes, currentStart, currentEnd, futureNodes, futureStart, futureEnd, compare); // outer diff

        if (-1 < i) {
          remove(get, currentNodes, currentStart, i);
          remove(get, currentNodes, i + futureChanges, currentEnd);
          return futureNodes;
        }
      } // common case with one replacement for many nodes
    // or many nodes replaced for a single one

    /* istanbul ignore else */


    if (currentChanges < 2 || futureChanges < 2) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, get(currentNodes[currentStart], 0));
      remove(get, currentNodes, currentStart, currentEnd);
      return futureNodes;
    } // the half match diff part has been skipped in petit-dom
    // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L391-L397
    // accordingly, I think it's safe to skip in here too
    // if one day it'll come out like the speediest thing ever to do
    // then I might add it in here too
    // Extra: before going too fancy, what about reversed lists ?
    //        This should bail out pretty quickly if that's not the case.


    if (currentChanges === futureChanges && isReversed(futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare)) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
      return futureNodes;
    } // last resort through a smart diff


    smartDiff(get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before);
    return futureNodes;
  };
  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */


  function checkType(element, type) {
    return typeof element === type;
  }
  /**
   * Check if an element is part of an svg
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if we are in an svg context
   */


  function isSvg(el) {
    const owner = el.ownerSVGElement;
    return !!owner || owner === null;
  }
  /**
   * Check if an element is a template tag
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if it's a <template>
   */


  function isTemplate(el) {
    return !isNil(el.content);
  }
  /**
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */


  function isFunction(value) {
    return checkType(value, 'function');
  }
  /**
   * Check if a value is a Boolean
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is a boolean
   */


  function isBoolean(value) {
    return checkType(value, 'boolean');
  }
  /**
   * Check if a value is an Object
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is an object
   */


  function isObject(value) {
    return !isNil(value) && checkType(value, 'object');
  }
  /**
   * Check if a value is null or undefined
   * @param   {*}  value - anything
   * @returns {boolean} true only for the 'undefined' and 'null' types
   */


  function isNil(value) {
    return value === null || value === undefined;
  }

  const UNMOUNT_SCOPE = Symbol('unmount');
  const EachBinding = Object.seal({
    // dynamic binding properties
    // childrenMap: null,
    // node: null,
    // root: null,
    // condition: null,
    // evaluate: null,
    // template: null,
    // isTemplateTag: false,
    nodes: [],

    // getKey: null,
    // indexName: null,
    // itemName: null,
    // afterPlaceholder: null,
    // placeholder: null,
    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const {
        placeholder,
        nodes,
        childrenMap
      } = this;
      const collection = scope === UNMOUNT_SCOPE ? null : this.evaluate(scope);
      const items = collection ? Array.from(collection) : [];
      const parent = placeholder.parentNode; // prepare the diffing

      const {
        newChildrenMap,
        batches,
        futureNodes
      } = createPatch(items, scope, parentScope, this); // patch the DOM only if there are new nodes

      domdiff(parent, nodes, futureNodes, {
        before: placeholder,
        node: patch(Array.from(childrenMap.values()), parentScope)
      }); // trigger the mounts and the updates

      batches.forEach(fn => fn()); // update the children map

      this.childrenMap = newChildrenMap;
      this.nodes = futureNodes;
      return this;
    },

    unmount(scope, parentScope) {
      this.update(UNMOUNT_SCOPE, parentScope);
      return this;
    }

  });
  /**
   * Patch the DOM while diffing
   * @param   {TemplateChunk[]} redundant - redundant tepmplate chunks
   * @param   {*} parentScope - scope of the parent template
   * @returns {Function} patch function used by domdiff
   */

  function patch(redundant, parentScope) {
    return (item, info) => {
      if (info < 0) {
        const element = redundant.pop();

        if (element) {
          const {
            template,
            context
          } = element; // notice that we pass null as last argument because
          // the root node and its children will be removed by domdiff

          template.unmount(context, parentScope, null);
        }
      }

      return item;
    };
  }
  /**
   * Check whether a template must be filtered from a loop
   * @param   {Function} condition - filter function
   * @param   {Object} context - argument passed to the filter function
   * @returns {boolean} true if this item should be skipped
   */


  function mustFilterItem(condition, context) {
    return condition ? Boolean(condition(context)) === false : false;
  }
  /**
   * Extend the scope of the looped template
   * @param   {Object} scope - current template scope
   * @param   {string} options.itemName - key to identify the looped item in the new context
   * @param   {string} options.indexName - key to identify the index of the looped item
   * @param   {number} options.index - current index
   * @param   {*} options.item - collection item looped
   * @returns {Object} enhanced scope object
   */


  function extendScope(scope, _ref) {
    let {
      itemName,
      indexName,
      index,
      item
    } = _ref;
    scope[itemName] = item;
    if (indexName) scope[indexName] = index;
    return scope;
  }
  /**
   * Loop the current template items
   * @param   {Array} items - expression collection value
   * @param   {*} scope - template scope
   * @param   {*} parentScope - scope of the parent template
   * @param   {EeachBinding} binding - each binding object instance
   * @returns {Object} data
   * @returns {Map} data.newChildrenMap - a Map containing the new children template structure
   * @returns {Array} data.batches - array containing the template lifecycle functions to trigger
   * @returns {Array} data.futureNodes - array containing the nodes we need to diff
   */


  function createPatch(items, scope, parentScope, binding) {
    const {
      condition,
      template,
      childrenMap,
      itemName,
      getKey,
      indexName,
      root,
      isTemplateTag
    } = binding;
    const newChildrenMap = new Map();
    const batches = [];
    const futureNodes = [];
    items.forEach((item, index) => {
      const context = extendScope(Object.create(scope), {
        itemName,
        indexName,
        index,
        item
      });
      const key = getKey ? getKey(context) : index;
      const oldItem = childrenMap.get(key);

      if (mustFilterItem(condition, context)) {
        return;
      }

      const componentTemplate = oldItem ? oldItem.template : template.clone();
      const el = oldItem ? componentTemplate.el : root.cloneNode();
      const mustMount = !oldItem;
      const meta = isTemplateTag && mustMount ? createTemplateMeta(componentTemplate) : {};

      if (mustMount) {
        batches.push(() => componentTemplate.mount(el, context, parentScope, meta));
      } else {
        batches.push(() => componentTemplate.update(context, parentScope));
      } // create the collection of nodes to update or to add
      // in case of template tags we need to add all its children nodes


      if (isTemplateTag) {
        const children = meta.children || componentTemplate.children;
        futureNodes.push(...children);
      } else {
        futureNodes.push(el);
      } // delete the old item from the children map


      childrenMap.delete(key); // update the children map

      newChildrenMap.set(key, {
        template: componentTemplate,
        context,
        index
      });
    });
    return {
      newChildrenMap,
      batches,
      futureNodes
    };
  }

  function create(node, _ref2) {
    let {
      evaluate,
      condition,
      itemName,
      indexName,
      getKey,
      template
    } = _ref2;
    const placeholder = document.createTextNode('');
    const parent = node.parentNode;
    const root = node.cloneNode();
    parent.insertBefore(placeholder, node);
    removeNode(node);
    return Object.assign({}, EachBinding, {
      childrenMap: new Map(),
      node,
      root,
      condition,
      evaluate,
      isTemplateTag: isTemplate(root),
      template: template.createDOM(node),
      getKey,
      indexName,
      itemName,
      placeholder
    });
  }
  /**
   * Binding responsible for the `if` directive
   */


  const IfBinding = Object.seal({
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // isTemplateTag: false,
    // placeholder: null,
    // template: null,
    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const value = !!this.evaluate(scope);
      const mustMount = !this.value && value;
      const mustUnmount = this.value && !value;

      const mount = () => {
        const pristine = this.node.cloneNode();
        this.placeholder.parentNode.insertBefore(pristine, this.placeholder);
        this.template = this.template.clone();
        this.template.mount(pristine, scope, parentScope);
      };

      switch (true) {
        case mustMount:
          mount();
          break;

        case mustUnmount:
          this.unmount(scope);
          break;

        default:
          if (value) this.template.update(scope, parentScope);
      }

      this.value = value;
      return this;
    },

    unmount(scope, parentScope) {
      this.template.unmount(scope, parentScope, true);
      return this;
    }

  });

  function create$1(node, _ref3) {
    let {
      evaluate,
      template
    } = _ref3;
    const parent = node.parentNode;
    const placeholder = document.createTextNode('');
    parent.insertBefore(placeholder, node);
    removeNode(node);
    return Object.assign({}, IfBinding, {
      node,
      evaluate,
      placeholder,
      template: template.createDOM(node)
    });
  }
  /**
   * Returns the memoized (cached) function.
   * // borrowed from https://www.30secondsofcode.org/js/s/memoize
   * @param {Function} fn - function to memoize
   * @returns {Function} memoize function
   */


  function memoize(fn) {
    const cache = new Map();

    const cached = val => {
      return cache.has(val) ? cache.get(val) : cache.set(val, fn.call(this, val)) && cache.get(val);
    };

    cached.cache = cache;
    return cached;
  }
  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @returns {Object} key value pairs with the result of the computation
   */


  function evaluateAttributeExpressions(attributes) {
    return attributes.reduce((acc, attribute) => {
      const {
        value,
        type
      } = attribute;

      switch (true) {
        // spread attribute
        case !attribute.name && type === ATTRIBUTE:
          return Object.assign({}, acc, {}, value);
        // value attribute

        case type === VALUE:
          acc.value = attribute.value;
          break;
        // normal attributes

        default:
          acc[dashToCamelCase(attribute.name)] = attribute.value;
      }

      return acc;
    }, {});
  }

  const REMOVE_ATTRIBUTE = 'removeAttribute';
  const SET_ATTIBUTE = 'setAttribute';
  const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype;
  const isNativeHtmlProperty = memoize(name => ElementProto.hasOwnProperty(name)); // eslint-disable-line

  /**
   * Add all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing the attributes names and values
   * @returns {undefined} sorry it's a void function :(
   */

  function setAllAttributes(node, attributes) {
    Object.entries(attributes).forEach((_ref4) => {
      let [name, value] = _ref4;
      return attributeExpression(node, {
        name
      }, value);
    });
  }
  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} newAttributes - object containing all the new attribute names
   * @param   {Object} oldAttributes - object containing all the old attribute names
   * @returns {undefined} sorry it's a void function :(
   */


  function removeAllAttributes(node, newAttributes, oldAttributes) {
    const newKeys = newAttributes ? Object.keys(newAttributes) : [];
    Object.keys(oldAttributes).filter(name => !newKeys.includes(name)).forEach(attribute => node.removeAttribute(attribute));
  }
  /**
   * This methods handles the DOM attributes updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - attribute name
   * @param   {*} value - new expression value
   * @param   {*} oldValue - the old expression cached value
   * @returns {undefined}
   */


  function attributeExpression(node, _ref5, value, oldValue) {
    let {
      name
    } = _ref5;

    // is it a spread operator? {...attributes}
    if (!name) {
      if (oldValue) {
        // remove all the old attributes
        removeAllAttributes(node, value, oldValue);
      } // is the value still truthy?


      if (value) {
        setAllAttributes(node, value);
      }

      return;
    } // handle boolean attributes


    if (!isNativeHtmlProperty(name) && (isBoolean(value) || isObject(value) || isFunction(value))) {
      node[name] = value;
    }

    node[getMethod(value)](name, normalizeValue(name, value));
  }
  /**
   * Get the attribute modifier method
   * @param   {*} value - if truthy we return `setAttribute` othewise `removeAttribute`
   * @returns {string} the node attribute modifier method name
   */


  function getMethod(value) {
    return isNil(value) || value === false || value === '' || isObject(value) || isFunction(value) ? REMOVE_ATTRIBUTE : SET_ATTIBUTE;
  }
  /**
   * Get the value as string
   * @param   {string} name - attribute name
   * @param   {*} value - user input value
   * @returns {string} input value as string
   */


  function normalizeValue(name, value) {
    // be sure that expressions like selected={ true } will be always rendered as selected='selected'
    if (value === true) return name;
    return value;
  }

  const RE_EVENTS_PREFIX = /^on/;

  const getCallbackAndOptions = value => Array.isArray(value) ? value : [value, false];
  /**
   * Set a new event listener
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @param   {*} oldValue - old expression value
   * @returns {value} the callback just received
   */


  function eventExpression(node, _ref6, value, oldValue) {
    let {
      name
    } = _ref6;
    const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '');

    if (oldValue) {
      node.removeEventListener(normalizedEventName, ...getCallbackAndOptions(oldValue));
    }

    if (value) {
      node.addEventListener(normalizedEventName, ...getCallbackAndOptions(value));
    }
  }
  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */


  function normalizeStringValue(value) {
    return isNil(value) ? '' : value;
  }
  /**
   * Get the the target text node to update or create one from of a comment node
   * @param   {HTMLElement} node - any html element containing childNodes
   * @param   {number} childNodeIndex - index of the text node in the childNodes list
   * @returns {HTMLTextNode} the text node to update
   */


  const getTextNode = (node, childNodeIndex) => {
    const target = node.childNodes[childNodeIndex];

    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode('');
      node.replaceChild(textNode, target);
      return textNode;
    }

    return target;
  };
  /**
   * This methods handles a simple text expression update
   * @param   {HTMLElement} node - target node
   * @param   {Object} data - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */


  function textExpression(node, data, value) {
    node.data = normalizeStringValue(value);
  }
  /**
   * This methods handles the input fileds value updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */


  function valueExpression(node, expression, value) {
    node.value = normalizeStringValue(value);
  }

  var expressions = {
    [ATTRIBUTE]: attributeExpression,
    [EVENT]: eventExpression,
    [TEXT]: textExpression,
    [VALUE]: valueExpression
  };
  const Expression = Object.seal({
    // Static props
    // node: null,
    // value: null,
    // API methods

    /**
     * Mount the expression evaluating its initial value
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    mount(scope) {
      // hopefully a pure function
      this.value = this.evaluate(scope); // IO() DOM updates

      apply(this, this.value);
      return this;
    },

    /**
     * Update the expression if its value changed
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    update(scope) {
      // pure function
      const value = this.evaluate(scope);

      if (this.value !== value) {
        // IO() DOM updates
        apply(this, value);
        this.value = value;
      }

      return this;
    },

    /**
     * Expression teardown method
     * @returns {Expression} self
     */
    unmount() {
      // unmount only the event handling expressions
      if (this.type === EVENT) apply(this, null);
      return this;
    }

  });
  /**
   * IO() function to handle the DOM updates
   * @param {Expression} expression - expression object
   * @param {*} value - current expression value
   * @returns {undefined}
   */

  function apply(expression, value) {
    return expressions[expression.type](expression.node, expression, value, expression.value);
  }

  function create$2(node, data) {
    return Object.assign({}, Expression, {}, data, {
      node: data.type === TEXT ? getTextNode(node, data.childNodeIndex) : node
    });
  }
  /**
   * Create a flat object having as keys a list of methods that if dispatched will propagate
   * on the whole collection
   * @param   {Array} collection - collection to iterate
   * @param   {Array<string>} methods - methods to execute on each item of the collection
   * @param   {*} context - context returned by the new methods created
   * @returns {Object} a new object to simplify the the nested methods dispatching
   */


  function flattenCollectionMethods(collection, methods, context) {
    return methods.reduce((acc, method) => {
      return Object.assign({}, acc, {
        [method]: scope => {
          return collection.map(item => item[method](scope)) && context;
        }
      });
    }, {});
  }

  function create$3(node, _ref7) {
    let {
      expressions
    } = _ref7;
    return Object.assign({}, flattenCollectionMethods(expressions.map(expression => create$2(node, expression)), ['mount', 'update', 'unmount']));
  }

  function extendParentScope(attributes, scope, parentScope) {
    if (!attributes || !attributes.length) return parentScope;
    const expressions = attributes.map(attr => Object.assign({}, attr, {
      value: attr.evaluate(scope)
    }));
    return Object.assign(Object.create(parentScope || null), evaluateAttributeExpressions(expressions));
  }

  const SlotBinding = Object.seal({
    // dynamic binding properties
    // node: null,
    // name: null,
    attributes: [],

    // template: null,
    getTemplateScope(scope, parentScope) {
      return extendParentScope(this.attributes, scope, parentScope);
    },

    // API methods
    mount(scope, parentScope) {
      const templateData = scope.slots ? scope.slots.find((_ref8) => {
        let {
          id
        } = _ref8;
        return id === this.name;
      }) : false;
      const {
        parentNode
      } = this.node;
      this.template = templateData && create$6(templateData.html, templateData.bindings).createDOM(parentNode);

      if (this.template) {
        this.template.mount(this.node, this.getTemplateScope(scope, parentScope));
        this.template.children = moveSlotInnerContent(this.node);
      }

      removeNode(this.node);
      return this;
    },

    update(scope, parentScope) {
      if (this.template) {
        this.template.update(this.getTemplateScope(scope, parentScope));
      }

      return this;
    },

    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.template) {
        this.template.unmount(this.getTemplateScope(scope, parentScope), null, mustRemoveRoot);
      }

      return this;
    }

  });
  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLNode} slot - slot node
   * @param   {HTMLElement} children - array to fill with the child nodes detected
   * @returns {HTMLElement[]} list of the node moved
   */

  function moveSlotInnerContent(slot, children) {
    if (children === void 0) {
      children = [];
    }

    const child = slot.firstChild;

    if (child) {
      slot.parentNode.insertBefore(child, slot);
      return [child, ...moveSlotInnerContent(slot)];
    }

    return children;
  }
  /**
   * Create a single slot binding
   * @param   {HTMLElement} node - slot node
   * @param   {string} options.name - slot id
   * @returns {Object} Slot binding object
   */


  function createSlot(node, _ref9) {
    let {
      name,
      attributes
    } = _ref9;
    return Object.assign({}, SlotBinding, {
      attributes,
      node,
      name
    });
  }
  /**
   * Create a new tag object if it was registered before, otherwise fallback to the simple
   * template chunk
   * @param   {Function} component - component factory function
   * @param   {Array<Object>} slots - array containing the slots markup
   * @param   {Array} attributes - dynamic attributes that will be received by the tag element
   * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
   */


  function getTag(component, slots, attributes) {
    if (slots === void 0) {
      slots = [];
    }

    if (attributes === void 0) {
      attributes = [];
    }

    // if this tag was registered before we will return its implementation
    if (component) {
      return component({
        slots,
        attributes
      });
    } // otherwise we return a template chunk


    return create$6(slotsToMarkup(slots), [...slotBindings(slots), {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
      expressions: attributes.map(attr => {
        return Object.assign({
          type: ATTRIBUTE
        }, attr);
      })
    }]);
  }
  /**
   * Merge all the slots bindings into a single array
   * @param   {Array<Object>} slots - slots collection
   * @returns {Array<Bindings>} flatten bindings array
   */


  function slotBindings(slots) {
    return slots.reduce((acc, _ref10) => {
      let {
        bindings
      } = _ref10;
      return acc.concat(bindings);
    }, []);
  }
  /**
   * Merge all the slots together in a single markup string
   * @param   {Array<Object>} slots - slots collection
   * @returns {string} markup of all the slots in a single string
   */


  function slotsToMarkup(slots) {
    return slots.reduce((acc, slot) => {
      return acc + slot.html;
    }, '');
  }

  const TagBinding = Object.seal({
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // name: null,
    // slots: null,
    // tag: null,
    // attributes: null,
    // getComponent: null,
    mount(scope) {
      return this.update(scope);
    },

    update(scope, parentScope) {
      const name = this.evaluate(scope); // simple update

      if (name === this.name) {
        this.tag.update(scope);
      } else {
        // unmount the old tag if it exists
        this.unmount(scope, parentScope, true); // mount the new tag

        this.name = name;
        this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
        this.tag.mount(this.node, scope);
      }

      return this;
    },

    unmount(scope, parentScope, keepRootTag) {
      if (this.tag) {
        // keep the root tag
        this.tag.unmount(keepRootTag);
      }

      return this;
    }

  });

  function create$4(node, _ref11) {
    let {
      evaluate,
      getComponent,
      slots,
      attributes
    } = _ref11;
    return Object.assign({}, TagBinding, {
      node,
      evaluate,
      slots,
      attributes,
      getComponent
    });
  }

  var bindings = {
    [IF]: create$1,
    [SIMPLE]: create$3,
    [EACH]: create,
    [TAG]: create$4,
    [SLOT]: createSlot
  };
  /**
   * Text expressions in a template tag will get childNodeIndex value normalized
   * depending on the position of the <template> tag offset
   * @param   {Expression[]} expressions - riot expressions array
   * @param   {number} textExpressionsOffset - offset of the <template> tag
   * @returns {Expression[]} expressions containing the text expressions normalized
   */

  function fixTextExpressionsOffset(expressions, textExpressionsOffset) {
    return expressions.map(e => e.type === TEXT ? Object.assign({}, e, {
      childNodeIndex: e.childNodeIndex + textExpressionsOffset
    }) : e);
  }
  /**
   * Bind a new expression object to a DOM node
   * @param   {HTMLElement} root - DOM node where to bind the expression
   * @param   {Object} binding - binding data
   * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
   * @returns {Binding} Binding object
   */


  function create$5(root, binding, templateTagOffset) {
    const {
      selector,
      type,
      redundantAttribute,
      expressions
    } = binding; // find the node to apply the bindings

    const node = selector ? root.querySelector(selector) : root; // remove eventually additional attributes created only to select this node

    if (redundantAttribute) node.removeAttribute(redundantAttribute);
    const bindingExpressions = expressions || []; // init the binding

    return (bindings[type] || bindings[SIMPLE])(node, Object.assign({}, binding, {
      expressions: templateTagOffset && !selector ? fixTextExpressionsOffset(bindingExpressions, templateTagOffset) : bindingExpressions
    }));
  } // in this case a simple innerHTML is enough


  function createHTMLTree(html, root) {
    const template = isTemplate(root) ? root : document.createElement('template');
    template.innerHTML = html;
    return template.content;
  } // for svg nodes we need a bit more work


  function createSVGTree(html, container) {
    // create the SVGNode
    const svgNode = container.ownerDocument.importNode(new window.DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`, 'application/xml').documentElement, true);
    return svgNode;
  }
  /**
   * Create the DOM that will be injected
   * @param {Object} root - DOM node to find out the context where the fragment will be created
   * @param   {string} html - DOM to create as string
   * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
   */


  function createDOMTree(root, html) {
    if (isSvg(root)) return createSVGTree(html, root);
    return createHTMLTree(html, root);
  }
  /**
   * Inject the DOM tree into a target node
   * @param   {HTMLElement} el - target element
   * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
   * @returns {undefined}
   */


  function injectDOM(el, dom) {
    switch (true) {
      case isSvg(el):
        moveChildren(dom, el);
        break;

      case isTemplate(el):
        el.parentNode.replaceChild(dom, el);
        break;

      default:
        el.appendChild(dom);
    }
  }
  /**
   * Create the Template DOM skeleton
   * @param   {HTMLElement} el - root node where the DOM will be injected
   * @param   {string} html - markup that will be injected into the root node
   * @returns {HTMLFragment} fragment that will be injected into the root node
   */


  function createTemplateDOM(el, html) {
    return html && (typeof html === 'string' ? createDOMTree(el, html) : html);
  }
  /**
   * Template Chunk model
   * @type {Object}
   */


  const TemplateChunk = Object.freeze({
    // Static props
    // bindings: null,
    // bindingsData: null,
    // html: null,
    // isTemplateTag: false,
    // fragment: null,
    // children: null,
    // dom: null,
    // el: null,

    /**
     * Create the template DOM structure that will be cloned on each mount
     * @param   {HTMLElement} el - the root node
     * @returns {TemplateChunk} self
     */
    createDOM(el) {
      // make sure that the DOM gets created before cloning the template
      this.dom = this.dom || createTemplateDOM(el, this.html);
      return this;
    },

    // API methods

    /**
     * Attach the template to a DOM node
     * @param   {HTMLElement} el - target DOM node
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
     * @returns {TemplateChunk} self
     */
    mount(el, scope, parentScope, meta) {
      if (meta === void 0) {
        meta = {};
      }

      if (!el) throw new Error('Please provide DOM node to mount properly your template');
      if (this.el) this.unmount(scope); // <template> tags require a bit more work
      // the template fragment might be already created via meta outside of this call

      const {
        fragment,
        children,
        avoidDOMInjection
      } = meta; // <template> bindings of course can not have a root element
      // so we check the parent node to set the query selector bindings

      const {
        parentNode
      } = children ? children[0] : el;
      const isTemplateTag = isTemplate(el);
      const templateTagOffset = isTemplateTag ? Math.max(Array.from(parentNode.childNodes).indexOf(el), 0) : null;
      this.isTemplateTag = isTemplateTag; // create the DOM if it wasn't created before

      this.createDOM(el);

      if (this.dom) {
        // create the new template dom fragment if it want already passed in via meta
        this.fragment = fragment || this.dom.cloneNode(true);
      } // store root node
      // notice that for template tags the root note will be the parent tag


      this.el = this.isTemplateTag ? parentNode : el; // create the children array only for the <template> fragments

      this.children = this.isTemplateTag ? children || Array.from(this.fragment.childNodes) : null; // inject the DOM into the el only if a fragment is available

      if (!avoidDOMInjection && this.fragment) injectDOM(el, this.fragment); // create the bindings

      this.bindings = this.bindingsData.map(binding => create$5(this.el, binding, templateTagOffset));
      this.bindings.forEach(b => b.mount(scope, parentScope));
      return this;
    },

    /**
     * Update the template with fresh data
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @returns {TemplateChunk} self
     */
    update(scope, parentScope) {
      this.bindings.forEach(b => b.update(scope, parentScope));
      return this;
    },

    /**
     * Remove the template from the node where it was initially mounted
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {boolean|null} mustRemoveRoot - if true remove the root element,
     * if false or undefined clean the root tag content, if null don't touch the DOM
     * @returns {TemplateChunk} self
     */
    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.el) {
        this.bindings.forEach(b => b.unmount(scope, parentScope, mustRemoveRoot));

        switch (true) {
          // <template> tags should be treated a bit differently
          // we need to clear their children only if it's explicitly required by the caller
          // via mustRemoveRoot !== null
          case this.children && mustRemoveRoot !== null:
            clearChildren(this.children);
            break;
          // remove the root node only if the mustRemoveRoot === true

          case mustRemoveRoot === true:
            removeNode(this.el);
            break;
          // otherwise we clean the node children

          case mustRemoveRoot !== null:
            cleanNode(this.el);
            break;
        }

        this.el = null;
      }

      return this;
    },

    /**
     * Clone the template chunk
     * @returns {TemplateChunk} a clone of this object resetting the this.el property
     */
    clone() {
      return Object.assign({}, this, {
        el: null
      });
    }

  });
  /**
   * Create a template chunk wiring also the bindings
   * @param   {string|HTMLElement} html - template string
   * @param   {Array} bindings - bindings collection
   * @returns {TemplateChunk} a new TemplateChunk copy
   */

  function create$6(html, bindings) {
    if (bindings === void 0) {
      bindings = [];
    }

    return Object.assign({}, TemplateChunk, {
      html,
      bindingsData: bindings
    });
  }

  var DOMBindings = /*#__PURE__*/Object.freeze({
    __proto__: null,
    bindingTypes: bindingTypes,
    createBinding: create$5,
    createExpression: create$2,
    expressionTypes: expressionTypes,
    template: create$6
  });

  const COMPONENTS_IMPLEMENTATION_MAP = new Map(),
        DOM_COMPONENT_INSTANCE_PROPERTY = Symbol('riot-component'),
        PLUGINS_SET = new Set(),
        IS_DIRECTIVE = 'is',
        VALUE_ATTRIBUTE = 'value',
        MOUNT_METHOD_KEY = 'mount',
        UPDATE_METHOD_KEY = 'update',
        UNMOUNT_METHOD_KEY = 'unmount',
        SHOULD_UPDATE_KEY = 'shouldUpdate',
        ON_BEFORE_MOUNT_KEY = 'onBeforeMount',
        ON_MOUNTED_KEY = 'onMounted',
        ON_BEFORE_UPDATE_KEY = 'onBeforeUpdate',
        ON_UPDATED_KEY = 'onUpdated',
        ON_BEFORE_UNMOUNT_KEY = 'onBeforeUnmount',
        ON_UNMOUNTED_KEY = 'onUnmounted',
        PROPS_KEY = 'props',
        STATE_KEY = 'state',
        SLOTS_KEY = 'slots',
        ROOT_KEY = 'root',
        IS_PURE_SYMBOL = Symbol.for('pure'),
        PARENT_KEY_SYMBOL = Symbol('parent'),
        ATTRIBUTES_KEY_SYMBOL = Symbol('attributes'),
        TEMPLATE_KEY_SYMBOL = Symbol('template');

  var globals = /*#__PURE__*/Object.freeze({
    __proto__: null,
    COMPONENTS_IMPLEMENTATION_MAP: COMPONENTS_IMPLEMENTATION_MAP,
    DOM_COMPONENT_INSTANCE_PROPERTY: DOM_COMPONENT_INSTANCE_PROPERTY,
    PLUGINS_SET: PLUGINS_SET,
    IS_DIRECTIVE: IS_DIRECTIVE,
    VALUE_ATTRIBUTE: VALUE_ATTRIBUTE,
    MOUNT_METHOD_KEY: MOUNT_METHOD_KEY,
    UPDATE_METHOD_KEY: UPDATE_METHOD_KEY,
    UNMOUNT_METHOD_KEY: UNMOUNT_METHOD_KEY,
    SHOULD_UPDATE_KEY: SHOULD_UPDATE_KEY,
    ON_BEFORE_MOUNT_KEY: ON_BEFORE_MOUNT_KEY,
    ON_MOUNTED_KEY: ON_MOUNTED_KEY,
    ON_BEFORE_UPDATE_KEY: ON_BEFORE_UPDATE_KEY,
    ON_UPDATED_KEY: ON_UPDATED_KEY,
    ON_BEFORE_UNMOUNT_KEY: ON_BEFORE_UNMOUNT_KEY,
    ON_UNMOUNTED_KEY: ON_UNMOUNTED_KEY,
    PROPS_KEY: PROPS_KEY,
    STATE_KEY: STATE_KEY,
    SLOTS_KEY: SLOTS_KEY,
    ROOT_KEY: ROOT_KEY,
    IS_PURE_SYMBOL: IS_PURE_SYMBOL,
    PARENT_KEY_SYMBOL: PARENT_KEY_SYMBOL,
    ATTRIBUTES_KEY_SYMBOL: ATTRIBUTES_KEY_SYMBOL,
    TEMPLATE_KEY_SYMBOL: TEMPLATE_KEY_SYMBOL
  });

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */
  function checkType$1(element, type) {
    return typeof element === type;
  }
  /**
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */

  function isFunction$1(value) {
    return checkType$1(value, 'function');
  }

  function noop() {
    return this;
  }
  /**
   * Autobind the methods of a source object to itself
   * @param   {Object} source - probably a riot tag instance
   * @param   {Array<string>} methods - list of the methods to autobind
   * @returns {Object} the original object received
   */

  function autobindMethods(source, methods) {
    methods.forEach(method => {
      source[method] = source[method].bind(source);
    });
    return source;
  }
  /**
   * Call the first argument received only if it's a function otherwise return it as it is
   * @param   {*} source - anything
   * @returns {*} anything
   */

  function callOrAssign(source) {
    return isFunction$1(source) ? source.prototype && source.prototype.constructor ? new source() : source() : source;
  }

  /**
   * Helper function to set an immutable property
   * @param   {Object} source - object where the new property will be set
   * @param   {string} key - object key where the new property will be stored
   * @param   {*} value - value of the new property
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} - the original object modified
   */
  function defineProperty(source, key, value, options) {
    if (options === void 0) {
      options = {};
    }

    /* eslint-disable fp/no-mutating-methods */
    Object.defineProperty(source, key, Object.assign({
      value,
      enumerable: false,
      writable: false,
      configurable: true
    }, options));
    /* eslint-enable fp/no-mutating-methods */

    return source;
  }
  /**
   * Define multiple properties on a target object
   * @param   {Object} source - object where the new properties will be set
   * @param   {Object} properties - object containing as key pair the key + value properties
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} the original object modified
   */

  function defineProperties(source, properties, options) {
    Object.entries(properties).forEach((_ref) => {
      let [key, value] = _ref;
      defineProperty(source, key, value, options);
    });
    return source;
  }
  /**
   * Define default properties if they don't exist on the source object
   * @param   {Object} source - object that will receive the default properties
   * @param   {Object} defaults - object containing additional optional keys
   * @returns {Object} the original object received enhanced
   */

  function defineDefaults(source, defaults) {
    Object.entries(defaults).forEach((_ref2) => {
      let [key, value] = _ref2;
      if (!source[key]) source[key] = value;
    });
    return source;
  }

  const ATTRIBUTE$1 = 0;
  const VALUE$1 = 3;

  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */
  function camelToDashCase(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */

  function dashToCamelCase$1(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  }

  /**
   * Throw an error with a descriptive message
   * @param   { string } message - error message
   * @returns { undefined } hoppla.. at this point the program should stop working
   */

  function panic(message) {
    throw new Error(message);
  }
  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @returns {Object} key value pairs with the result of the computation
   */

  function evaluateAttributeExpressions$1(attributes) {
    return attributes.reduce((acc, attribute) => {
      const {
        value,
        type
      } = attribute;

      switch (true) {
        // spread attribute
        case !attribute.name && type === ATTRIBUTE$1:
          return Object.assign({}, acc, {}, value);
        // value attribute

        case type === VALUE$1:
          acc.value = attribute.value;
          break;
        // normal attributes

        default:
          acc[dashToCamelCase$1(attribute.name)] = attribute.value;
      }

      return acc;
    }, {});
  }

  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */
  function domToArray(els) {
    // can this object be already looped?
    if (!Array.isArray(els)) {
      // is it a node list?
      if (/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(els)) && typeof els.length === 'number') return Array.from(els);else // if it's a single node
        // it will be returned as "array" with one single entry
        return [els];
    } // this object could be looped out of the box


    return els;
  }

  /**
   * Simple helper to find DOM nodes returning them as array like loopable object
   * @param   { string|DOMNodeList } selector - either the query or the DOM nodes to arraify
   * @param   { HTMLElement }        ctx      - context defining where the query will search for the DOM nodes
   * @returns { Array } DOM nodes found as array
   */

  function $(selector, ctx) {
    return domToArray(typeof selector === 'string' ? (ctx || document).querySelectorAll(selector) : selector);
  }

  /**
   * Get all the element attributes as object
   * @param   {HTMLElement} element - DOM node we want to parse
   * @returns {Object} all the attributes found as a key value pairs
   */

  function DOMattributesToObject(element) {
    return Array.from(element.attributes).reduce((acc, attribute) => {
      acc[dashToCamelCase$1(attribute.name)] = attribute.value;
      return acc;
    }, {});
  }

  /**
   * Normalize the return values, in case of a single value we avoid to return an array
   * @param   { Array } values - list of values we want to return
   * @returns { Array|string|boolean } either the whole list of values or the single one found
   * @private
   */

  const normalize = values => values.length === 1 ? values[0] : values;
  /**
   * Parse all the nodes received to get/remove/check their attributes
   * @param   { HTMLElement|NodeList|Array } els    - DOM node/s to parse
   * @param   { string|Array }               name   - name or list of attributes
   * @param   { string }                     method - method that will be used to parse the attributes
   * @returns { Array|string } result of the parsing in a list or a single value
   * @private
   */


  function parseNodes(els, name, method) {
    const names = typeof name === 'string' ? [name] : name;
    return normalize(domToArray(els).map(el => {
      return normalize(names.map(n => el[method](n)));
    }));
  }
  /**
   * Set any attribute on a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Object }              name  - either the name of the attribute to set
   *                                                 or a list of properties as object key - value
   * @param   { string }                     value - the new value of the attribute (optional)
   * @returns { HTMLElement|NodeList|Array } the original array of elements passed to this function
   *
   * @example
   *
   * import { set } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * set(img, 'width', 100)
   *
   * // or also
   * set(img, {
   *   width: 300,
   *   height: 300
   * })
   *
   */


  function set(els, name, value) {
    const attrs = typeof name === 'object' ? name : {
      [name]: value
    };
    const props = Object.keys(attrs);
    domToArray(els).forEach(el => {
      props.forEach(prop => el.setAttribute(prop, attrs[prop]));
    });
    return els;
  }
  /**
   * Get any attribute from a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Array }               name  - name or list of attributes to get
   * @returns { Array|string } list of the attributes found
   *
   * @example
   *
   * import { get } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * get(img, 'width') // => '200'
   *
   * // or also
   * get(img, ['width', 'height']) // => ['200', '300']
   *
   * // or also
   * get([img1, img2], ['width', 'height']) // => [['200', '300'], ['500', '200']]
   */

  function get(els, name) {
    return parseNodes(els, name, 'getAttribute');
  }

  const CSS_BY_NAME = new Map();
  const STYLE_NODE_SELECTOR = 'style[riot]'; // memoized curried function

  const getStyleNode = (style => {
    return () => {
      // lazy evaluation:
      // if this function was already called before
      // we return its cached result
      if (style) return style; // create a new style element or use an existing one
      // and cache it internally

      style = $(STYLE_NODE_SELECTOR)[0] || document.createElement('style');
      set(style, 'type', 'text/css');
      /* istanbul ignore next */

      if (!style.parentNode) document.head.appendChild(style);
      return style;
    };
  })();
  /**
   * Object that will be used to inject and manage the css of every tag instance
   */


  var cssManager = {
    CSS_BY_NAME,

    /**
     * Save a tag style to be later injected into DOM
     * @param { string } name - if it's passed we will map the css to a tagname
     * @param { string } css - css string
     * @returns {Object} self
     */
    add(name, css) {
      if (!CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.set(name, css);
        this.inject();
      }

      return this;
    },

    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     * @returns {Object} self
     */
    inject() {
      getStyleNode().innerHTML = [...CSS_BY_NAME.values()].join('\n');
      return this;
    },

    /**
     * Remove a tag style from the DOM
     * @param {string} name a registered tagname
     * @returns {Object} self
     */
    remove(name) {
      if (CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.delete(name);
        this.inject();
      }

      return this;
    }

  };

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry(fn) {
    for (var _len = arguments.length, acc = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      acc[_key - 1] = arguments[_key];
    }

    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      args = [...acc, ...args];
      return args.length < fn.length ? curry(fn, ...args) : fn(...args);
    };
  }

  /**
   * Get the tag name of any DOM node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */

  function getName(element) {
    return get(element, IS_DIRECTIVE) || element.tagName.toLowerCase();
  }

  const COMPONENT_CORE_HELPERS = Object.freeze({
    // component helpers
    $(selector) {
      return $(selector, this.root)[0];
    },

    $$(selector) {
      return $(selector, this.root);
    }

  });
  const PURE_COMPONENT_API = Object.freeze({
    [MOUNT_METHOD_KEY]: noop,
    [UPDATE_METHOD_KEY]: noop,
    [UNMOUNT_METHOD_KEY]: noop
  });
  const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
    [SHOULD_UPDATE_KEY]: noop,
    [ON_BEFORE_MOUNT_KEY]: noop,
    [ON_MOUNTED_KEY]: noop,
    [ON_BEFORE_UPDATE_KEY]: noop,
    [ON_UPDATED_KEY]: noop,
    [ON_BEFORE_UNMOUNT_KEY]: noop,
    [ON_UNMOUNTED_KEY]: noop
  });
  const MOCKED_TEMPLATE_INTERFACE = Object.assign({}, PURE_COMPONENT_API, {
    clone: noop,
    createDOM: noop
  });
  /**
   * Evaluate the component properties either from its real attributes or from its initial user properties
   * @param   {HTMLElement} element - component root
   * @param   {Object}  initialProps - initial props
   * @returns {Object} component props key value pairs
   */

  function evaluateInitialProps(element, initialProps) {
    if (initialProps === void 0) {
      initialProps = {};
    }

    return Object.assign({}, DOMattributesToObject(element), {}, callOrAssign(initialProps));
  }
  /**
   * Bind a DOM node to its component object
   * @param   {HTMLElement} node - html node mounted
   * @param   {Object} component - Riot.js component object
   * @returns {Object} the component object received as second argument
   */


  const bindDOMNodeToComponentObject = (node, component) => node[DOM_COMPONENT_INSTANCE_PROPERTY] = component;
  /**
   * Wrap the Riot.js core API methods using a mapping function
   * @param   {Function} mapFunction - lifting function
   * @returns {Object} an object having the { mount, update, unmount } functions
   */


  function createCoreAPIMethods(mapFunction) {
    return [MOUNT_METHOD_KEY, UPDATE_METHOD_KEY, UNMOUNT_METHOD_KEY].reduce((acc, method) => {
      acc[method] = mapFunction(method);
      return acc;
    }, {});
  }
  /**
   * Factory function to create the component templates only once
   * @param   {Function} template - component template creation function
   * @param   {Object} components - object containing the nested components
   * @returns {TemplateChunk} template chunk object
   */


  function componentTemplateFactory(template, components) {
    return template(create$6, expressionTypes, bindingTypes, name => {
      return components[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name);
    });
  }
  /**
   * Create a pure component
   * @param   {Function} pureFactoryFunction - pure component factory function
   * @param   {Array} options.slots - component slots
   * @param   {Array} options.attributes - component attributes
   * @param   {Array} options.template - template factory function
   * @param   {Array} options.template - template factory function
   * @param   {any} options.props - initial component properties
   * @returns {Object} pure component object
   */


  function createPureComponent(pureFactoryFunction, _ref) {
    let {
      slots,
      attributes,
      props,
      css,
      template
    } = _ref;
    if (template) panic('Pure components can not have html');
    if (css) panic('Pure components do not have css');
    const component = defineDefaults(pureFactoryFunction({
      slots,
      attributes,
      props
    }), PURE_COMPONENT_API);
    return createCoreAPIMethods(method => function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // intercept the mount calls to bind the DOM node to the pure object created
      // see also https://github.com/riot/riot/issues/2806
      if (method === MOUNT_METHOD_KEY) {
        const [el] = args;
        bindDOMNodeToComponentObject(el, component);
      }

      component[method](...args);
      return component;
    });
  }
  /**
   * Create the component interface needed for the @riotjs/dom-bindings tag bindings
   * @param   {string} options.css - component css
   * @param   {Function} options.template - functon that will return the dom-bindings template function
   * @param   {Object} options.exports - component interface
   * @param   {string} options.name - component name
   * @returns {Object} component like interface
   */


  function createComponent(_ref2) {
    let {
      css,
      template,
      exports,
      name
    } = _ref2;
    const templateFn = template ? componentTemplateFactory(template, exports ? createSubcomponents(exports.components) : {}) : MOCKED_TEMPLATE_INTERFACE;
    return (_ref3) => {
      let {
        slots,
        attributes,
        props
      } = _ref3;
      // pure components rendering will be managed by the end user
      if (exports && exports[IS_PURE_SYMBOL]) return createPureComponent(exports, {
        slots,
        attributes,
        props,
        css,
        template
      });
      const componentAPI = callOrAssign(exports) || {};
      const component = defineComponent({
        css,
        template: templateFn,
        componentAPI,
        name
      })({
        slots,
        attributes,
        props
      }); // notice that for the components create via tag binding
      // we need to invert the mount (state/parentScope) arguments
      // the template bindings will only forward the parentScope updates
      // and never deal with the component state

      return {
        mount(element, parentScope, state) {
          return component.mount(element, state, parentScope);
        },

        update(parentScope, state) {
          return component.update(state, parentScope);
        },

        unmount(preserveRoot) {
          return component.unmount(preserveRoot);
        }

      };
    };
  }
  /**
   * Component definition function
   * @param   {Object} implementation - the componen implementation will be generated via compiler
   * @param   {Object} component - the component initial properties
   * @returns {Object} a new component implementation object
   */

  function defineComponent(_ref4) {
    let {
      css,
      template,
      componentAPI,
      name
    } = _ref4;
    // add the component css into the DOM
    if (css && name) cssManager.add(name, css);
    return curry(enhanceComponentAPI)(defineProperties( // set the component defaults without overriding the original component API
    defineDefaults(componentAPI, Object.assign({}, COMPONENT_LIFECYCLE_METHODS, {
      [STATE_KEY]: {}
    })), Object.assign({
      // defined during the component creation
      [SLOTS_KEY]: null,
      [ROOT_KEY]: null
    }, COMPONENT_CORE_HELPERS, {
      name,
      css,
      template
    })));
  }
  /**
   * Create the bindings to update the component attributes
   * @param   {HTMLElement} node - node where we will bind the expressions
   * @param   {Array} attributes - list of attribute bindings
   * @returns {TemplateChunk} - template bindings object
   */

  function createAttributeBindings(node, attributes) {
    if (attributes === void 0) {
      attributes = [];
    }

    const expressions = attributes.map(a => create$2(node, a));
    const binding = {};
    return Object.assign(binding, Object.assign({
      expressions
    }, createCoreAPIMethods(method => scope => {
      expressions.forEach(e => e[method](scope));
      return binding;
    })));
  }
  /**
   * Create the subcomponents that can be included inside a tag in runtime
   * @param   {Object} components - components imported in runtime
   * @returns {Object} all the components transformed into Riot.Component factory functions
   */


  function createSubcomponents(components) {
    if (components === void 0) {
      components = {};
    }

    return Object.entries(callOrAssign(components)).reduce((acc, _ref5) => {
      let [key, value] = _ref5;
      acc[camelToDashCase(key)] = createComponent(value);
      return acc;
    }, {});
  }
  /**
   * Run the component instance through all the plugins set by the user
   * @param   {Object} component - component instance
   * @returns {Object} the component enhanced by the plugins
   */


  function runPlugins(component) {
    return [...PLUGINS_SET].reduce((c, fn) => fn(c) || c, component);
  }
  /**
   * Compute the component current state merging it with its previous state
   * @param   {Object} oldState - previous state object
   * @param   {Object} newState - new state givent to the `update` call
   * @returns {Object} new object state
   */


  function computeState(oldState, newState) {
    return Object.assign({}, oldState, {}, callOrAssign(newState));
  }
  /**
   * Add eventually the "is" attribute to link this DOM node to its css
   * @param {HTMLElement} element - target root node
   * @param {string} name - name of the component mounted
   * @returns {undefined} it's a void function
   */


  function addCssHook(element, name) {
    if (getName(element) !== name) {
      set(element, IS_DIRECTIVE, name);
    }
  }
  /**
   * Component creation factory function that will enhance the user provided API
   * @param   {Object} component - a component implementation previously defined
   * @param   {Array} options.slots - component slots generated via riot compiler
   * @param   {Array} options.attributes - attribute expressions generated via riot compiler
   * @returns {Riot.Component} a riot component instance
   */


  function enhanceComponentAPI(component, _ref6) {
    let {
      slots,
      attributes,
      props
    } = _ref6;
    return autobindMethods(runPlugins(defineProperties(Object.create(component), {
      mount(element, state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(element, attributes).mount(parentScope);
        defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, evaluateInitialProps(element, props), {}, evaluateAttributeExpressions$1(this[ATTRIBUTES_KEY_SYMBOL].expressions))));
        this[STATE_KEY] = computeState(this[STATE_KEY], state);
        this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone(); // link this object to the DOM node

        bindDOMNodeToComponentObject(element, this); // add eventually the 'is' attribute

        component.name && addCssHook(element, component.name); // define the root element

        defineProperty(this, ROOT_KEY, element); // define the slots array

        defineProperty(this, SLOTS_KEY, slots); // before mount lifecycle event

        this[ON_BEFORE_MOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]); // mount the template

        this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope);
        this[PARENT_KEY_SYMBOL] = parentScope;
        this[ON_MOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      },

      update(state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        if (parentScope) {
          this[ATTRIBUTES_KEY_SYMBOL].update(parentScope);
        }

        const newProps = evaluateAttributeExpressions$1(this[ATTRIBUTES_KEY_SYMBOL].expressions);
        if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false) return;
        defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, this[PROPS_KEY], {}, newProps)));
        this[STATE_KEY] = computeState(this[STATE_KEY], state);
        this[ON_BEFORE_UPDATE_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[TEMPLATE_KEY_SYMBOL].update(this, this[PARENT_KEY_SYMBOL]);
        this[ON_UPDATED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      },

      unmount(preserveRoot) {
        this[ON_BEFORE_UNMOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[ATTRIBUTES_KEY_SYMBOL].unmount(); // if the preserveRoot is null the template html will be left untouched
        // in that case the DOM cleanup will happen differently from a parent node

        this[TEMPLATE_KEY_SYMBOL].unmount(this, this[PARENT_KEY_SYMBOL], preserveRoot === null ? null : !preserveRoot);
        this[ON_UNMOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      }

    })), Object.keys(component).filter(prop => isFunction$1(component[prop])));
  }
  /**
   * Component initialization function starting from a DOM node
   * @param   {HTMLElement} element - element to upgrade
   * @param   {Object} initialProps - initial component properties
   * @param   {string} componentName - component id
   * @returns {Object} a new component instance bound to a DOM node
   */

  function mountComponent(element, initialProps, componentName) {
    const name = componentName || getName(element);
    if (!COMPONENTS_IMPLEMENTATION_MAP.has(name)) panic(`The component named "${name}" was never registered`);
    const component = COMPONENTS_IMPLEMENTATION_MAP.get(name)({
      props: initialProps
    });
    return component.mount(element);
  }

  /**
   * Similar to compose but performs from left-to-right function composition.<br/>
   * {@link https://30secondsofcode.org/function#composeright see also}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */
  /**
   * Performs right-to-left function composition.<br/>
   * Use Array.prototype.reduce() to perform right-to-left function composition.<br/>
   * The last (rightmost) function can accept one or more arguments; the remaining functions must be unary.<br/>
   * {@link https://30secondsofcode.org/function#compose original source code}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */

  function compose() {
    for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      fns[_key2] = arguments[_key2];
    }

    return fns.reduce((f, g) => function () {
      return f(g(...arguments));
    });
  }

  const {
    DOM_COMPONENT_INSTANCE_PROPERTY: DOM_COMPONENT_INSTANCE_PROPERTY$1,
    COMPONENTS_IMPLEMENTATION_MAP: COMPONENTS_IMPLEMENTATION_MAP$1,
    PLUGINS_SET: PLUGINS_SET$1
  } = globals;
  /**
   * Riot public api
   */

  /**
   * Register a custom tag by name
   * @param   {string} name - component name
   * @param   {Object} implementation - tag implementation
   * @returns {Map} map containing all the components implementations
   */

  function register(name, _ref) {
    let {
      css,
      template,
      exports
    } = _ref;
    if (COMPONENTS_IMPLEMENTATION_MAP$1.has(name)) panic(`The component "${name}" was already registered`);
    COMPONENTS_IMPLEMENTATION_MAP$1.set(name, createComponent({
      name,
      css,
      template,
      exports
    }));
    return COMPONENTS_IMPLEMENTATION_MAP$1;
  }
  /**
   * Unregister a riot web component
   * @param   {string} name - component name
   * @returns {Map} map containing all the components implementations
   */

  function unregister(name) {
    if (!COMPONENTS_IMPLEMENTATION_MAP$1.has(name)) panic(`The component "${name}" was never registered`);
    COMPONENTS_IMPLEMENTATION_MAP$1.delete(name);
    cssManager.remove(name);
    return COMPONENTS_IMPLEMENTATION_MAP$1;
  }
  /**
   * Mounting function that will work only for the components that were globally registered
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @param   {Object} initialProps - the initial component properties
   * @param   {string} name - optional component name
   * @returns {Array} list of nodes upgraded
   */

  function mount(selector, initialProps, name) {
    return $(selector).map(element => mountComponent(element, initialProps, name));
  }
  /**
   * Sweet unmounting helper function for the DOM node mounted manually by the user
   * @param   {string|HTMLElement} selector - query for the selection or a DOM element
   * @param   {boolean|null} keepRootElement - if true keep the root element
   * @returns {Array} list of nodes unmounted
   */

  function unmount(selector, keepRootElement) {
    return $(selector).map(element => {
      if (element[DOM_COMPONENT_INSTANCE_PROPERTY$1]) {
        element[DOM_COMPONENT_INSTANCE_PROPERTY$1].unmount(keepRootElement);
      }

      return element;
    });
  }
  /**
   * Define a riot plugin
   * @param   {Function} plugin - function that will receive all the components created
   * @returns {Set} the set containing all the plugins installed
   */

  function install(plugin) {
    if (!isFunction$1(plugin)) panic('Plugins must be of type function');
    if (PLUGINS_SET$1.has(plugin)) panic('This plugin was already install');
    PLUGINS_SET$1.add(plugin);
    return PLUGINS_SET$1;
  }
  /**
   * Uninstall a riot plugin
   * @param   {Function} plugin - plugin previously installed
   * @returns {Set} the set containing all the plugins installed
   */

  function uninstall(plugin) {
    if (!PLUGINS_SET$1.has(plugin)) panic('This plugin was never installed');
    PLUGINS_SET$1.delete(plugin);
    return PLUGINS_SET$1;
  }
  /**
   * Helpter method to create component without relying on the registered ones
   * @param   {Object} implementation - component implementation
   * @returns {Function} function that will allow you to mount a riot component on a DOM node
   */

  function component(implementation) {
    return function (el, props, _temp) {
      let {
        slots,
        attributes,
        parentScope
      } = _temp === void 0 ? {} : _temp;
      return compose(c => c.mount(el, parentScope), c => c({
        props,
        slots,
        attributes
      }), createComponent)(implementation);
    };
  }
  /**
   * Lift a riot component Interface into a pure riot object
   * @param   {Function} func - RiotPureComponent factory function
   * @returns {Function} the lifted original function received as argument
   */

  function pure(func) {
    if (!isFunction$1(func)) panic('riot.pure accepts only arguments of type "function"');
    func[IS_PURE_SYMBOL] = true;
    return func;
  }
  /** @type {string} current riot version */

  const version = 'v4.11.1'; // expose some internal stuff that might be used from external tools

  const __ = {
    cssManager,
    DOMBindings,
    createComponent,
    defineComponent,
    globals
  };

  exports.__ = __;
  exports.component = component;
  exports.install = install;
  exports.mount = mount;
  exports.pure = pure;
  exports.register = register;
  exports.uninstall = uninstall;
  exports.unmount = unmount;
  exports.unregister = unregister;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `about div,[is="about"] div{ max-width: 800px; margin: 0 auto;}`,
  'exports': null,
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr25="expr25"></div>', [{
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.props.show;
      },
      'redundantAttribute': 'expr25',
      'selector': '[expr25]',
      'template': template('<h3>About</h3><p>Lightning Cards is a simple flash card web app made by Aliya N. Anindita a.k.a <a href="https://pseudomon.github.io">PseudoMon</a> simply because she needs a flash card app but is mildly annoyed that Anki is so complicated.</p><p>This app is completely front-end, so you can probably just save the page and it\'ll work offline. It automatically saves your decks locally in your browser, but you can also use the import/exporter feature to create a backup or to move to a different system/browser.</p><p>I give absolutely no guarantee that this app will work all the time. But if you encounter something fishy, you can contact me and I\'ll give it a look.</p><p>Got comments? Suggestions? Questions? Just want to say hi? Want to tell the developer that she hasn\'t been wasting her time making this thing? You can contact me on <a href="https://twitter.com/PseudoStygian">Twitter</a> or through <a href="https://pseudomon.github.io/contact">this form</a>.</p><p>For more info about the app, see the <a href="https://github.com/PseudoMon/lightningcards">Repository</a>.\r\n  </p>', [])
    }]);
  },
  'name': 'about'
};
exports.default = _default;
},{}],3:[function(require,module,exports){
const Container = require('./container.riot').default
const HeadNav = require('./headnav.riot').default
const FooterNav = require('./footernav.riot').default
const ImportExporter = require('./importexporter.riot').default
const CardEdit = require('./cardedit.riot').default
const PlayingContainer = require('./playing/playing-container.riot').default
const DeckEditContainer = require('./deck-view/deckeditcontainer.riot').default
const MainMenu = require('./main-menu.riot').default
const About = require('./about.riot').default

const { registerPreprocessor, register, mount } = require('riot')

// Get our Deck object
// It contains all the card data and functions
// Is this basically our back-end? Ha!
const deck = require('./store.js')

// Registering all the main components
// Some components are registered in their parent components' file
register('container', Container)
register('headnav', HeadNav)
register('footernav', FooterNav)
register('import-exporter', ImportExporter)
register('card-edit', CardEdit)
register('playing-container', PlayingContainer)
register('deck-edit-container', DeckEditContainer)
register('main-menu', MainMenu)
register('about', About)

// Mounting the main app
mount('container', {deck: deck})

},{"./about.riot":2,"./cardedit.riot":4,"./container.riot":5,"./deck-view/deckeditcontainer.riot":8,"./footernav.riot":9,"./headnav.riot":11,"./importexporter.riot":12,"./main-menu.riot":13,"./playing/playing-container.riot":16,"./store.js":17,"riot":1}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const HalfCard = require('./halfcardedit.riot').default;

const {
  register
} = require('riot');

register('half-card', HalfCard);
var _default = {
  'css': `card-edit .card,[is="card-edit"] .card{ text-align: center; font-size: 3rem; width: 80%; margin: 1.5rem auto; height: 400px; } @media (min-width: 750px) { card-edit .card,[is="card-edit"] .card{ font-size: 5rem; height: 400px; } } card-edit .half,[is="card-edit"] .half{ position: relative; padding: 0 2rem; box-sizing: border-box; border-radius: 5px; box-shadow: 2px 2px #8f8989; margin: 1rem; display: flex; flex-direction: column; justify-content: center; height: 50%; } card-edit .half.top,[is="card-edit"] .half.top{ background-color: #eeeeee; } card-edit .half.bottom,[is="card-edit"] .half.bottom{ background-color: #bdccff; } card-edit .buttons,[is="card-edit"] .buttons{ width: 80%; margin: 3rem auto; padding: 0 0.5rem; text-align: center; }`,
  'exports': {
    onBeforeMount() {
      this.state = {
        front: this.props.card.front,
        synFront: this.props.card.synFront || null,
        back: this.props.card.back,
        synBack: this.props.card.synBack || null,
        editingTop: false,
        editingBottom: true
      };
    },

    changeText(frontOrBack, data) {
      if (frontOrBack === 'front') {
        this.update({
          front: data
        });
      } else if (frontOrBack === 'back') {
        this.update({
          back: data
        });
      }
    },

    removeSyn(side, i) {
      this.props.card.removeSyn(side, i);
      this.props.updateDeck();
    },

    addSyn(side, newSyn) {
      this.props.card.addSyn(side, newSyn);
      this.props.updateDeck();
    },

    onFinishEditing(e) {
      e.preventDefault();
      this.props.card.changeFront(this.state.front);
      this.props.card.changeBack(this.state.back);
      this.props.updateDeck();
      this.props.finishEditing();
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div class="card editing"><div class="half top"><half-card expr22="expr22" front-or-back="front"></half-card></div><div class="half bottom"><half-card expr23="expr23" front-or-back="back"></half-card></div></div><div expr24="expr24" class="buttons"><button>Save card</button></div>', [{
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'half-card';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'text',
        'evaluate': function (scope) {
          return scope.state.front;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'synonyms',
        'evaluate': function (scope) {
          return scope.state.synFront;
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-change-text',
        'evaluate': function (scope) {
          return data => scope.changeText('front', data);
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-remove-syn',
        'evaluate': function (scope) {
          return i => scope.removeSyn('front', i);
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-add-syn',
        'evaluate': function (scope) {
          return newSyn => scope.addSyn('front', newSyn);
        }
      }],
      'redundantAttribute': 'expr22',
      'selector': '[expr22]'
    }, {
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'half-card';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'text',
        'evaluate': function (scope) {
          return scope.state.back;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'synonyms',
        'evaluate': function (scope) {
          return scope.state.synBack;
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-change-text',
        'evaluate': function (scope) {
          return data => scope.changeText('back', data);
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-remove-syn',
        'evaluate': function (scope) {
          return i => scope.removeSyn('back', i);
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-add-syn',
        'evaluate': function (scope) {
          return newSyn => scope.addSyn('back', newSyn);
        }
      }],
      'redundantAttribute': 'expr23',
      'selector': '[expr23]'
    }, {
      'redundantAttribute': 'expr24',
      'selector': '[expr24]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.onFinishEditing;
        }
      }]
    }]);
  },
  'name': 'card-edit'
};
exports.default = _default;
},{"./halfcardedit.riot":10,"riot":1}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `container,[is="container"]{ display: block; margin-top: 20px; }`,
  'exports': {
    onBeforeMount() {
      this.props.deck.getFromLocalStorage();
      this.props.deck.shuffleAllCards();
      let firstcard = this.props.deck.drawCard();
      this.state = {
        currentScreen: 'main menu',
        cardBeingShown: firstcard,
        outOfCards: false,
        notificationMessage: '',
        sessionSetting: 'default'
      };
      this.possibleScreens = ['deck view', 'main menu', 'playing', 'setting', 'about'];
    },

    updateDeck() {
      this.props.deck.saveToLocalStorage();
      this.update();
    },

    loadNextCard() {
      let nextCard = this.props.deck.drawCard();

      if (nextCard !== undefined) {
        this.update({
          cardBeingShown: nextCard
        });
      } else {
        this.update({
          outOfCards: true
        });
      }
    },

    startNewSession() {
      this.props.deck.startNewSession(this.state.sessionSetting); // Give warning window whenever user try to leave

      window.onbeforeunload = function () {
        return true;
      };

      this.update({
        outOfCards: false,
        cardBeingShown: this.props.deck.drawCard()
      });
    },

    changeSessionSetting(setting) {
      this.update({
        sessionSetting: setting
      });
    },

    openScreen(screen) {
      if (screen === 'playing') {
        this.startNewSession();
      } else {
        // Remove warning-before-leaving when not currently playing
        window.onbeforeunload = function () {
          return;
        };
      }

      if (this.possibleScreens.includes(screen)) {
        this.update({
          currentScreen: screen
        });
      } else {
        this.update({
          notificationMessage: "Error: No such screen as " + screen + "."
        });
      }
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div><notification expr0="expr0"></notification><headnav expr1="expr1" title="Lightning Cards"></headnav><about expr2="expr2"></about><main-menu expr3="expr3"></main-menu><deck-edit-container expr4="expr4"></deck-edit-container><playing-container expr5="expr5"></playing-container><footernav expr6="expr6"></footernav></div>', [{
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'notification';
      },
      'slots': [{
        'id': 'default',
        'html': ' ',
        'bindings': [{
          'expressions': [{
            'type': expressionTypes.TEXT,
            'childNodeIndex': 0,
            'evaluate': function (scope) {
              return scope.state.notificationMessage;
            }
          }]
        }]
      }],
      'attributes': [],
      'redundantAttribute': 'expr0',
      'selector': '[expr0]'
    }, {
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'headnav';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'session',
        'evaluate': function (scope) {
          return scope.props.deck.currentSession;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'is-playing',
        'evaluate': function (scope) {
          return scope.state.currentScreen === 'playing';
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-open-screen',
        'evaluate': function (scope) {
          return screen => scope.openScreen(screen);
        }
      }],
      'redundantAttribute': 'expr1',
      'selector': '[expr1]'
    }, {
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'about';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'show',
        'evaluate': function (scope) {
          return scope.state.currentScreen === 'about' ? true : false;
        }
      }],
      'redundantAttribute': 'expr2',
      'selector': '[expr2]'
    }, {
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'main-menu';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'show',
        'evaluate': function (scope) {
          return scope.state.currentScreen === 'main menu' ? true : false;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'current-deck-title',
        'evaluate': function (scope) {
          return scope.props.deck.name;
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-change-setting',
        'evaluate': function (scope) {
          return s => scope.changeSessionSetting(s);
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-start-practice',
        'evaluate': function (scope) {
          return () => scope.openScreen('playing');
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-see-deck',
        'evaluate': function (scope) {
          return () => scope.openScreen('deck view');
        }
      }],
      'redundantAttribute': 'expr3',
      'selector': '[expr3]'
    }, {
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'deck-edit-container';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'show',
        'evaluate': function (scope) {
          return scope.state.currentScreen === 'deck view' ? true : false;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'deck',
        'evaluate': function (scope) {
          return scope.props.deck;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'update-deck',
        'evaluate': function (scope) {
          return scope.updateDeck;
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'onBackToMenu',
        'evaluate': function (scope) {
          return () => scope.openScreen('main menu');
        }
      }],
      'redundantAttribute': 'expr4',
      'selector': '[expr4]'
    }, {
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'playing-container';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'show',
        'evaluate': function (scope) {
          return scope.state.currentScreen === 'playing' ? true : false;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'card',
        'evaluate': function (scope) {
          return scope.state.cardBeingShown;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'out-of-cards',
        'evaluate': function (scope) {
          return scope.state.outOfCards;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'session',
        'evaluate': function (scope) {
          return scope.props.deck.currentSession;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'load-next-card',
        'evaluate': function (scope) {
          return scope.loadNextCard;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'update-deck',
        'evaluate': function (scope) {
          return scope.updateDeck;
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-practice-again',
        'evaluate': function (scope) {
          return scope.startNewSession;
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-edit-deck',
        'evaluate': function (scope) {
          return () => scope.openScreen('deck view');
        }
      }],
      'redundantAttribute': 'expr5',
      'selector': '[expr5]'
    }, {
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'footernav';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.EVENT,
        'name': 'on-click-about',
        'evaluate': function (scope) {
          return () => scope.openScreen('about');
        }
      }],
      'redundantAttribute': 'expr6',
      'selector': '[expr6]'
    }]);
  },
  'name': 'container'
};
exports.default = _default;
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `card-list .cardlist,[is="card-list"] .cardlist{ margin-top: 10px; display: flex; flex-flow: row wrap; justify-content: center; } card-list .smallcard,[is="card-list"] .smallcard{ background-color: #bdccff; border-radius: 3px; box-shadow: 1px 1px #8f8989; width: 30%; min-width: 160px; min-height: 6em; padding: 0.2em; margin: 0.5em; cursor: pointer; text-align: center; display: flex; flex-direction: column; justify-content: center; position: relative; } card-list .smallcard:hover,[is="card-list"] .smallcard:hover{ background-color: #bcf15b; color: #231717; } card-list .smallcard .front,[is="card-list"] .smallcard .front{ font-size: 1.3em; } card-list .smallcard.red,[is="card-list"] .smallcard.red,card-list .smallcard.red.hover,[is="card-list"] .smallcard.red.hover{ background-color: #FF6860; color: #563737; } card-list .xbutton,[is="card-list"] .xbutton{ position: absolute; font-size: 1.2em; top: 0; right: 0.4em; } card-list .header,[is="card-list"] .header{ text-align: center; } card-list .header button,[is="card-list"] .header button{ margin: 0.5em 1em; } card-list .deckname input,[is="card-list"] .deckname input{ background-color: transparent; border-top: none; border-left: none; border-right: none; border-color: #5b5b5b; height: 1.2em; }`,
  'exports': {
    onBeforeMount() {
      this.state = {
        cards: this.props.deck.cards,
        name: this.props.deck.name,
        editingName: false
      };
    },

    clickCard(e) {
      const cardIndex = e.target.dataset.cardindex;
      this.props.onClickCard(cardIndex);
    },

    enterName(e) {
      e.preventDefault();
      this.props.deck.changeName(e.target.newname.value);
      this.props.updateDeck();
      this.update({
        name: this.props.deck.name,
        editingName: false
      });
    },

    startEditingName() {
      this.update({
        editingName: true
      });
      this.$('#namefield').focus();
    },

    hoverX(e) {
      e.target.style.color = "#fff";
      e.target.parentNode.className = "smallcard red";
    },

    unhoverX(e) {
      e.target.style.color = "initial";
      e.target.parentNode.className = "smallcard";
    },

    removeCard(e) {
      const cardIndex = e.target.parentNode.dataset.cardindex;
      this.props.deck.removeCard(cardIndex);
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<h2 class="deckname"><span expr58="expr58"></span><form expr59="expr59"></form></h2><div class="header"><button expr61="expr61">Edit Deck Name</button><button expr62="expr62">Add New Card</button><button expr63="expr63">Import/Export Deck</button><button expr64="expr64">Manage Decks</button></div><div class="cardlist"><div expr65="expr65" class="smallcard"></div></div>', [{
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.editingName;
      },
      'redundantAttribute': 'expr58',
      'selector': '[expr58]',
      'template': template(' ', [{
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return scope.state.name;
          }
        }]
      }])
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.state.editingName;
      },
      'redundantAttribute': 'expr59',
      'selector': '[expr59]',
      'template': template('<input expr60="expr60" id="namefield" type="text" name="newname" autocomplete="off"/>', [{
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onsubmit',
          'evaluate': function (scope) {
            return scope.enterName;
          }
        }]
      }, {
        'redundantAttribute': 'expr60',
        'selector': '[expr60]',
        'expressions': [{
          'type': expressionTypes.VALUE,
          'evaluate': function (scope) {
            return scope.state.name;
          }
        }]
      }])
    }, {
      'redundantAttribute': 'expr61',
      'selector': '[expr61]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.startEditingName;
        }
      }]
    }, {
      'redundantAttribute': 'expr62',
      'selector': '[expr62]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onAddNewCard;
        }
      }]
    }, {
      'redundantAttribute': 'expr63',
      'selector': '[expr63]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onOpenImportExporter;
        }
      }]
    }, {
      'redundantAttribute': 'expr64',
      'selector': '[expr64]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onOpenManagingDecks;
        }
      }]
    }, {
      'type': bindingTypes.EACH,
      'getKey': null,
      'condition': null,
      'template': template('<div expr66="expr66" class="xbutton">\r\n        x\r\n      </div><div expr67="expr67" class="front"> </div><div expr68="expr68" class="back"> </div>', [{
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.clickCard;
          }
        }, {
          'type': expressionTypes.ATTRIBUTE,
          'name': 'data-cardindex',
          'evaluate': function (scope) {
            return scope.i;
          }
        }]
      }, {
        'redundantAttribute': 'expr66',
        'selector': '[expr66]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.removeCard;
          }
        }, {
          'type': expressionTypes.EVENT,
          'name': 'onmouseover',
          'evaluate': function (scope) {
            return scope.hoverX;
          }
        }, {
          'type': expressionTypes.EVENT,
          'name': 'onmouseleave',
          'evaluate': function (scope) {
            return scope.unhoverX;
          }
        }]
      }, {
        'redundantAttribute': 'expr67',
        'selector': '[expr67]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return [scope.card.front].join('');
          }
        }, {
          'type': expressionTypes.ATTRIBUTE,
          'name': 'data-cardindex',
          'evaluate': function (scope) {
            return scope.i;
          }
        }]
      }, {
        'redundantAttribute': 'expr68',
        'selector': '[expr68]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return [scope.card.back].join('');
          }
        }, {
          'type': expressionTypes.ATTRIBUTE,
          'name': 'data-cardindex',
          'evaluate': function (scope) {
            return scope.i;
          }
        }]
      }]),
      'redundantAttribute': 'expr65',
      'selector': '[expr65]',
      'itemName': 'card',
      'indexName': 'i',
      'evaluate': function (scope) {
        return scope.state.cards;
      }
    }]);
  },
  'name': 'card-list'
};
exports.default = _default;
},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `deck-list .smalldeck,[is="deck-list"] .smalldeck{ background-color: #e8edff; border-radius: 3px; box-shadow: 1px 1px #8f8989; width: 80%; min-width: 160px; min-height: 80px; margin: 20px auto; padding: 0.2em; cursor: pointer; text-align: center; position: relative; } deck-list .smalldeck:hover,[is="deck-list"] .smalldeck:hover{ box-shadow: 1px 1px #000; } deck-list .smalldeck .innercard,[is="deck-list"] .smalldeck .innercard{ position: absolute; top: 8px; left: 12px; width: 100%; height: 100%; border-radius: 3px; background-color: #bdccff; box-shadow: 1px 1px #8f8989; font-size: 2rem; display: flex; align-items: center; justify-content: center; } deck-list .smalldeck .innercard:hover,[is="deck-list"] .smalldeck .innercard:hover{ background-color: #bcf15b; color: #231717; } deck-list .deckcontrol,[is="deck-list"] .deckcontrol{ text-align: center; } @media (min-width: 550px) { deck-list .deckcontrol,[is="deck-list"] .deckcontrol{ padding-top: 50px; text-align: left; } } deck-list .deckcontrol button,[is="deck-list"] .deckcontrol button{ margin: 0.5em; }`,
  'exports': {
    selectDeck(deck, i) {
      this.props.deck.removeFromLocalDecks(i);
      this.props.onSelectDeck(deck);
    },

    removeDeck(i) {
      this.props.deck.removeFromLocalDecks(i);
      this.props.updateDeck();
    },

    addNewDeck() {
      const emptyDeck = {
        name: "Unnamed Deck",
        cards: [{}]
      };
      this.props.onSelectDeck(emptyDeck);
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<h2>Decks</h2><p>These decks are saved locally in your browser. Use the export feature to keep a backup or to import them to a different system.</p><p><button expr50="expr50">New deck</button></p><div expr51="expr51" class="row deck"></div>', [{
      'redundantAttribute': 'expr50',
      'selector': '[expr50]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.addNewDeck;
        }
      }]
    }, {
      'type': bindingTypes.EACH,
      'getKey': null,
      'condition': null,
      'template': template('<div class="one-third column"><div class="smalldeck"><div expr52="expr52" class="innercard"> </div></div></div><div class="two-thirds column deckcontrol"><div><button expr53="expr53">\r\n            Use Deck\r\n          </button><button expr54="expr54">\r\n            Remove Deck\r\n          </button></div></div>', [{
        'redundantAttribute': 'expr52',
        'selector': '[expr52]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return [scope.deck.name].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr53',
        'selector': '[expr53]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return e => scope.selectDeck(scope.deck, scope.i);
          }
        }]
      }, {
        'redundantAttribute': 'expr54',
        'selector': '[expr54]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return e => scope.removeDeck(scope.i);
          }
        }]
      }]),
      'redundantAttribute': 'expr51',
      'selector': '[expr51]',
      'itemName': 'deck',
      'indexName': 'i',
      'evaluate': function (scope) {
        return scope.props.decksData;
      }
    }]);
  },
  'name': 'deck-list'
};
exports.default = _default;
},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const CardList = require('./card-list.riot').default;

const DeckList = require('./deck-list.riot').default;

const {
  register
} = require('riot');

register('deck-list', DeckList);
register('card-list', CardList);
var _default = {
  'css': null,
  'exports': {
    onBeforeMount() {
      this.state = {
        editingCard: false,
        isImportExporting: false,
        isManagingDecks: false,
        decksData: null
      };
    },

    editCard(i) {
      this.update({
        editingCard: this.props.deck.cards[i]
      });
    },

    finishEditing() {
      this.update({
        editingCard: false,
        addingNewCard: false
      });
    },

    addNewCard() {
      let newCard = this.props.deck.addCard({});
      this.update({
        editingCard: newCard
      });
    },

    openImportExporter() {
      this.update({
        isImportExporting: true
      });
    },

    finishImportExporting() {
      this.update({
        isImportExporting: false
      });
    },

    openManagingDecks() {
      // How this work is that
      // we'll always save a copy of the current deck whenever
      // we're switching deck. We'll destroy the copy of the
      // chosen deck when we load it.
      this.props.deck.saveCurrentDeckToLocalDecks();
      const decksData = this.props.deck.getLocalDecks();
      this.update({
        isManagingDecks: true,
        decksData: JSON.parse(decksData)
      });
    },

    updateDeckList() {
      const decksData = this.props.deck.getLocalDecks();
      this.update({
        decksData: JSON.parse(decksData)
      });
    },

    finishManagingDecks(chosenDeck) {
      this.props.deck.replaceDeck(chosenDeck);
      this.props.updateDeck();
      this.update({
        isManagingDecks: false
      });
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr32="expr32"></div>', [{
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.props.show;
      },
      'redundantAttribute': 'expr32',
      'selector': '[expr32]',
      'template': template('<deck-list expr33="expr33"></deck-list><card-list expr34="expr34"></card-list><card-edit expr35="expr35"></card-edit><import-exporter expr36="expr36"></import-exporter>', [{
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return scope.state.isManagingDecks;
        },
        'redundantAttribute': 'expr33',
        'selector': '[expr33]',
        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,
          'evaluate': function (scope) {
            return 'deck-list';
          },
          'slots': [],
          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'deck',
            'evaluate': function (scope) {
              return scope.props.deck;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'update-deck',
            'evaluate': function (scope) {
              return scope.updateDeckList;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'decks-data',
            'evaluate': function (scope) {
              return scope.state.decksData;
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'on-select-deck',
            'evaluate': function (scope) {
              return d => scope.finishManagingDecks(d);
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return !scope.state.editingCard && !scope.state.isImportExporting && !scope.state.isManagingDecks;
        },
        'redundantAttribute': 'expr34',
        'selector': '[expr34]',
        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,
          'evaluate': function (scope) {
            return 'card-list';
          },
          'slots': [],
          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'deck',
            'evaluate': function (scope) {
              return scope.props.deck;
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'on-add-new-card',
            'evaluate': function (scope) {
              return scope.addNewCard;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'update-deck',
            'evaluate': function (scope) {
              return scope.props.updateDeck;
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'on-open-import-exporter',
            'evaluate': function (scope) {
              return scope.openImportExporter;
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'on-open-managing-decks',
            'evaluate': function (scope) {
              return scope.openManagingDecks;
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'on-click-card',
            'evaluate': function (scope) {
              return i => scope.editCard(i);
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'on-back-to-menu',
            'evaluate': function (scope) {
              return scope.props.onBackToMenu;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return scope.state.editingCard;
        },
        'redundantAttribute': 'expr35',
        'selector': '[expr35]',
        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,
          'evaluate': function (scope) {
            return 'card-edit';
          },
          'slots': [],
          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'card',
            'evaluate': function (scope) {
              return scope.state.editingCard;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'finish-editing',
            'evaluate': function (scope) {
              return scope.finishEditing;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'update-deck',
            'evaluate': function (scope) {
              return scope.props.updateDeck;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return scope.state.isImportExporting;
        },
        'redundantAttribute': 'expr36',
        'selector': '[expr36]',
        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,
          'evaluate': function (scope) {
            return 'import-exporter';
          },
          'slots': [],
          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'deck',
            'evaluate': function (scope) {
              return scope.props.deck;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'update-deck',
            'evaluate': function (scope) {
              return scope.props.updateDeck;
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'on-go-back',
            'evaluate': function (scope) {
              return scope.finishImportExporting;
            }
          }]
        }])
      }])
    }]);
  },
  'name': 'deck-edit-container'
};
exports.default = _default;
},{"./card-list.riot":6,"./deck-list.riot":7,"riot":1}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `footernav,[is="footernav"]{ width: 100%; display: flex; justify-content: space-between; height: 60px; margin-top: 100px; } footernav div,[is="footernav"] div{ margin: 0 1em; }`,
  'exports': null,
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div>\r\n    V1.0\r\n  </div><div><a expr31="expr31" href="#">About</a></div>', [{
      'redundantAttribute': 'expr31',
      'selector': '[expr31]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onClickAbout;
        }
      }]
    }]);
  },
  'name': 'footernav'
};
exports.default = _default;
},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `half-card .label,[is="half-card"] .label{ position: absolute; left: 0.5em; top: 0.25em; text-transform: capitalize; font-size: 2.5rem; opacity: 0.5; } @media (min-width: 750px) { half-card .label,[is="half-card"] .label{ font-size: 2.5rem; } } half-card .synonyms,[is="half-card"] .synonyms{ font-size: 0.5em; } half-card .synonyms button,[is="half-card"] .synonyms button{ border: none; } half-card .syn,[is="half-card"] .syn{ padding: 0.1em 0.2em; } half-card .syn .xbutton,[is="half-card"] .syn .xbutton{ color: grey; cursor: pointer; } half-card .syn .xbutton:hover,[is="half-card"] .syn .xbutton:hover{ color: #FF6860; } half-card .syn::after,[is="half-card"] .syn::after{ content: ", "; } half-card .syn:last-of-type::after,[is="half-card"] .syn:last-of-type::after{ content: ""; } half-card .maintext form,[is="half-card"] .maintext form{ margin-bottom: 0; } half-card .maintext input,[is="half-card"] .maintext input,half-card .synonyms input,[is="half-card"] .synonyms input{ background-color: transparent; border-top: none; border-left: none; border-right: none; border-color: #5b5b5b; } half-card .maintext input,[is="half-card"] .maintext input{ text-align: center; height: 1.2em; max-width: 100%; } half-card .maintext input:focus,[is="half-card"] .maintext input:focus,half-card .synonyms input:focus,[is="half-card"] .synonyms input:focus{ border-top: none; border-left: none; border-right: none; } half-card .synonyms input,[is="half-card"] .synonyms input{ font-size: 0.7em; } half-card .synonyms form,[is="half-card"] .synonyms form{ display: inline; }`,
  'exports': {
    onBeforeMount() {
      this.state = {
        text: this.props.text,
        synonyms: this.props.synonyms || [],
        editing: true,
        addingSyn: false,
        newSyn: ''
      };
    },

    startEdit() {
      this.update({
        editing: true
      });
      this.$('#mainfield').focus();
    },

    editText(e) {
      this.update({
        text: e.target.value
      });
      this.props.onChangeText(this.state.text);
    },

    enterText(e) {
      e.preventDefault();
      this.update({
        editing: false
      });
    },

    removeSyn(i) {
      this.props.onRemoveSyn(i);
    },

    startAddingSyn(e) {
      e.preventDefault();
      this.update({
        addingSyn: true
      });
      this.$('#synfield').focus();
    },

    editNewSyn(e) {
      this.update({
        newSyn: e.target.value
      });
    },

    submitSyn(e) {
      e.preventDefault();
      this.update({
        addingSyn: false
      });
      this.props.onAddSyn(this.state.newSyn);
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr41="expr41" class="label"> </div><div class="maintext"><span expr42="expr42"></span><form expr43="expr43"></form></div><div class="synonyms"><span expr45="expr45" class="syn"></span><form expr47="expr47"></form><button expr49="expr49"></button></div>', [{
      'redundantAttribute': 'expr41',
      'selector': '[expr41]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return [scope.props.frontOrBack].join('');
        }
      }]
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.editing;
      },
      'redundantAttribute': 'expr42',
      'selector': '[expr42]',
      'template': template(' ', [{
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return scope.state.text;
          }
        }, {
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.startEdit;
          }
        }]
      }])
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.state.editing;
      },
      'redundantAttribute': 'expr43',
      'selector': '[expr43]',
      'template': template('<input expr44="expr44" id="mainfield" type="text" autocomplete="off"/>', [{
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onsubmit',
          'evaluate': function (scope) {
            return scope.enterText;
          }
        }]
      }, {
        'redundantAttribute': 'expr44',
        'selector': '[expr44]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'oninput',
          'evaluate': function (scope) {
            return scope.editText;
          }
        }, {
          'type': expressionTypes.VALUE,
          'evaluate': function (scope) {
            return scope.state.text;
          }
        }]
      }])
    }, {
      'type': bindingTypes.EACH,
      'getKey': null,
      'condition': null,
      'template': template(' <span expr46="expr46" class="xbutton">x</span>', [{
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return [scope.syn].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr46',
        'selector': '[expr46]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return e => scope.removeSyn(scope.i);
          }
        }]
      }]),
      'redundantAttribute': 'expr45',
      'selector': '[expr45]',
      'itemName': 'syn',
      'indexName': 'i',
      'evaluate': function (scope) {
        return scope.state.synonyms;
      }
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.state.addingSyn;
      },
      'redundantAttribute': 'expr47',
      'selector': '[expr47]',
      'template': template('<input expr48="expr48" id="synfield" type="text" autocomplete="off"/><button type="submit">Submit</button>', [{
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onsubmit',
          'evaluate': function (scope) {
            return scope.submitSyn;
          }
        }]
      }, {
        'redundantAttribute': 'expr48',
        'selector': '[expr48]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'oninput',
          'evaluate': function (scope) {
            return scope.editNewSyn;
          }
        }, {
          'type': expressionTypes.VALUE,
          'evaluate': function (scope) {
            return scope.state.newSyn;
          }
        }]
      }])
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.addingSyn;
      },
      'redundantAttribute': 'expr49',
      'selector': '[expr49]',
      'template': template('Add synonym', [{
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.startAddingSyn;
          }
        }]
      }])
    }]);
  },
  'name': 'half-card'
};
exports.default = _default;
},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `headnav,[is="headnav"]{ width: 100%; display: flex; justify-content: space-between; height: 60px; margin-bottom: 20px; } headnav .title,[is="headnav"] .title{ font-weight: 500; cursor: pointer; } headnav h1,[is="headnav"] h1{line-height: 60px; } headnav div,[is="headnav"] div{line-height: 60px; } headnav .navlinks,[is="headnav"] .navlinks{ display: none; } @media (min-width: 750px) { headnav .navlinks,[is="headnav"] .navlinks{ display: block; } } headnav .navlinks a,[is="headnav"] .navlinks a{ margin: 0 1.2em; text-decoration: none; } headnav .correct,[is="headnav"] .correct{ font-weight: 500; color: #71a314; } headnav .played,[is="headnav"] .played{ font-weight: 500; }`,
  'exports': null,
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr13="expr13" class="title"> </div><div class="navlinks"><a expr14="expr14" href="#">Main Menu</a><a expr15="expr15" href="#">View Deck</a><a expr16="expr16" href="#">Start Practice</a></div><div class="sessioncounter"><span expr17="expr17"></span><span expr21="expr21"></span></div>', [{
      'redundantAttribute': 'expr13',
      'selector': '[expr13]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return scope.props.title;
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return () => scope.props.onOpenScreen('main menu');
        }
      }]
    }, {
      'redundantAttribute': 'expr14',
      'selector': '[expr14]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return () => scope.props.onOpenScreen('main menu');
        }
      }]
    }, {
      'redundantAttribute': 'expr15',
      'selector': '[expr15]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return () => scope.props.onOpenScreen('deck view');
        }
      }]
    }, {
      'redundantAttribute': 'expr16',
      'selector': '[expr16]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return () => scope.props.onOpenScreen('playing');
        }
      }]
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.props.isPlaying;
      },
      'redundantAttribute': 'expr17',
      'selector': '[expr17]',
      'template': template('<span expr18="expr18" class="correct"> </span>/<span expr19="expr19" class="played"> </span>/<span expr20="expr20" class="total"> </span>', [{
        'redundantAttribute': 'expr18',
        'selector': '[expr18]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return [scope.props.session.correctCounter].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr19',
        'selector': '[expr19]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return [scope.props.session.playedCounter].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr20',
        'selector': '[expr20]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return [scope.props.session.totalCount, ' Cards'].join('');
          }
        }]
      }])
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.props.isPlaying;
      },
      'redundantAttribute': 'expr21',
      'selector': '[expr21]',
      'template': template(' ', [{
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return [scope.props.session.totalCount, ' cards in deck'].join('');
          }
        }]
      }])
    }]);
  },
  'name': 'headnav'
};
exports.default = _default;
},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `import-exporter,[is="import-exporter"]{ display: block; text-align: center; } import-exporter textarea,[is="import-exporter"] textarea{ min-width: 80%; } import-exporter .import,[is="import-exporter"] .import{ margin-top: 40px; }`,
  'exports': {
    onBeforeMount() {
      this.state = {
        exportedDeck: '',
        exportedDeckFile: '',
        deckToImport: '',
        imported: false
      };
    },

    onMounted() {
      this.getDeckExport();
    },

    getDeckExport() {
      let cards = this.props.deck.cards; // only get deck's name and cards, none of the functions etc

      let deck = {
        name: this.props.deck.name,
        cards: cards
      };
      let exportedDeck = JSON.stringify(deck); // this is the content of the downloadable file

      let exportedDeckFile = "data:text/json;charset=utf-8," + encodeURIComponent(exportedDeck);
      let exportedDeckFilename = this.createDeckFilename(deck);
      this.update({
        exportedDeck,
        exportedDeckFile,
        exportedDeckFilename
      });
    },

    createDeckFilename(deck) {
      let safeName = encodeURIComponent(deck.name).toLowerCase().replace('%20', '-');
      let name = "lightning-deck-" + safeName + ".json";
      return name;
    },

    importFileChosen(e) {
      // When a file is selected for import, read its content and put it into the state that fills the textbox.
      const theFile = e.target.files[0];
      let reader = new FileReader();

      reader.onload = (() => {
        return e => {
          this.update({
            deckToImport: e.target.result
          });
        };
      })();

      reader.readAsText(theFile);
    },

    importDeck() {
      const deckToImport = this.state.deckToImport;
      const importedDeck = JSON.parse(deckToImport);
      this.props.deck.replaceDeck(importedDeck);
      this.props.updateDeck();
      this.update({
        imported: true
      });
    },

    changeImportText(e) {
      this.update({
        deckToImport: e.target.value
      });
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div class="export"><h3>Deck Export</h3><p>Click the download button to save the backup file.</p><a expr184="expr184" class="button button-primary">Download</a><p>Alternatively, you can select everything in the textarea below and copy it somewhere safe.</p><div><textarea expr185="expr185"> </textarea></div></div><div class="import"><h3>Import Deck</h3><p>This will completely replace your current deck with the imported deck. If you want to keep your current deck, create a new deck in Manage Decks menu.</p><p>Open file or paste card data below and click the button.</p><input expr186="expr186" type="file"/><div><textarea expr187="expr187"> </textarea></div><div><button expr188="expr188">Click to import cards</button></div><h5 expr189="expr189"></h5></div><div><button expr190="expr190">Go Back</button></div>', [{
      'redundantAttribute': 'expr184',
      'selector': '[expr184]',
      'expressions': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'href',
        'evaluate': function (scope) {
          return scope.state.exportedDeckFile;
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'download',
        'evaluate': function (scope) {
          return scope.state.exportedDeckFilename;
        }
      }]
    }, {
      'redundantAttribute': 'expr185',
      'selector': '[expr185]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return scope.state.exportedDeck;
        }
      }]
    }, {
      'redundantAttribute': 'expr186',
      'selector': '[expr186]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onchange',
        'evaluate': function (scope) {
          return scope.importFileChosen;
        }
      }]
    }, {
      'redundantAttribute': 'expr187',
      'selector': '[expr187]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return scope.state.deckToImport;
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'oninput',
        'evaluate': function (scope) {
          return scope.changeImportText;
        }
      }]
    }, {
      'redundantAttribute': 'expr188',
      'selector': '[expr188]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.importDeck;
        }
      }]
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.state.imported;
      },
      'redundantAttribute': 'expr189',
      'selector': '[expr189]',
      'template': template('Ok!', [])
    }, {
      'redundantAttribute': 'expr190',
      'selector': '[expr190]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onGoBack;
        }
      }]
    }]);
  },
  'name': 'import-exporter'
};
exports.default = _default;
},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `main-menu,[is="main-menu"]{ text-align: center; } main-menu h3,[is="main-menu"] h3{ margin-top: 100px; } main-menu button,[is="main-menu"] button{ margin: 1em; } main-menu .decktitle,[is="main-menu"] .decktitle,main-menu .setting,[is="main-menu"] .setting{ font-weight: 500; }`,
  'exports': {
    changeSetting(e) {
      this.props.onChangeSetting(e.target.value);
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr26="expr26"></div>', [{
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.props.show;
      },
      'redundantAttribute': 'expr26',
      'selector': '[expr26]',
      'template': template('<h3>Welcome to Lightning Cards</h3><div><p>Your currently loaded deck is\r\n        <span expr27="expr27" class="decktitle"> </span></p><p>Your current practice setting is\r\n      <select expr28="expr28" class="setting"><option value="default">Default (Front->Back)</option><option value="reverse">Reverse (Back->Front)</option></select></p></div><div><button expr29="expr29">Start Practice</button><button expr30="expr30">See/Edit Deck</button></div>', [{
        'redundantAttribute': 'expr27',
        'selector': '[expr27]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return scope.props.currentDeckTitle;
          }
        }]
      }, {
        'redundantAttribute': 'expr28',
        'selector': '[expr28]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onchange',
          'evaluate': function (scope) {
            return scope.changeSetting;
          }
        }]
      }, {
        'redundantAttribute': 'expr29',
        'selector': '[expr29]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.props.onStartPractice;
          }
        }]
      }, {
        'redundantAttribute': 'expr30',
        'selector': '[expr30]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.props.onSeeDeck;
          }
        }]
      }])
    }]);
  },
  'name': 'main-menu'
};
exports.default = _default;
},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `card-display .card,[is="card-display"] .card{ text-align: center; font-size: 3rem; width: 80%; margin: 2.5rem auto; padding: 0.5rem 2rem; border-radius: 5px; background-color: #eeeeee; box-shadow: 5px 5px #8f8989; height: 120px; display: flex; flex-direction: column; justify-content: center; } @media (min-width: 750px) { card-display .card,[is="card-display"] .card{ height: 300px; font-size: 5rem; } } card-display .card.correct,[is="card-display"] .card.correct{ background-color: #bcf15b; color: #231717; } card-display .card.wrong,[is="card-display"] .card.wrong{ background-color: #FF6860; color: #563737; } card-display .card.wrong .answer,[is="card-display"] .card.wrong .answer{ color: #fff; } card-display .answered .question,[is="card-display"] .answered .question{ font-size: 0.8em; opacity: 0.5; } card-display .answered .synonym,[is="card-display"] .answered .synonym{ font-size: 0.5em; } card-display .syn,[is="card-display"] .syn{ padding: 0.1em 0.2em; } card-display .syn::after,[is="card-display"] .syn::after{ content: ", "; } card-display .syn:last-of-type::after,[is="card-display"] .syn:last-of-type::after{ content: ""; } card-display .card-answer,[is="card-display"] .card-answer{ width: 80%; margin: 1rem auto; padding: 0 0.5rem; text-align: center; } card-display .card-answer.answered button,[is="card-display"] .card-answer.answered button{ margin: 1em 2em; } card-display .card-answer input,[is="card-display"] .card-answer input{ width: 80%; text-align: center; } card-display .card-answer.answered input,[is="card-display"] .card-answer.answered input{ background-color: silver; color: gray; } card-display .card-answer.asking .button-primary,[is="card-display"] .card-answer.asking .button-primary{ width: 60%; }`,
  'exports': {
    onBeforeMount() {
      this.state = {
        answerBox: '',
        cardClasses: '',
        asking: true,
        correct: false // showingFront means the 'back' side is the part being asked

      };
    },

    onUpdated(props, state) {
      // Set focus
      if (!state.asking) {
        this.$('#nextbutton').focus();
      } else if (state.asking) {
        this.$('#answerinput').focus();
      }
    },

    changeAnswer(e) {
      this.update({
        answerBox: e.target.value
      });
    },

    enterAnswer(e) {
      e.preventDefault();
      let answer = String(this.state.answerBox).toLowerCase();

      if (!answer) {
        return;
      }

      let correctAnswer;
      let synonyms;

      if (this.props.showingFront) {
        correctAnswer = this.props.card.back;
        synonyms = this.props.card.synBack;
      } else if (this.props.showingFront === false) {
        correctAnswer = this.props.card.front;
        synonyms = this.props.card.synFront;
      }

      correctAnswer = correctAnswer.toLowerCase();
      synonyms = synonyms.map(syn => syn.toLowerCase());

      if (answer === correctAnswer || synonyms.includes(answer)) {
        this.answerCorrect();
      } else {
        this.answerWrong();
      }
    },

    answerCorrect() {
      this.props.card.addRight();
      this.props.session.correctCounter++;
      this.props.session.playedCounter++;
      this.props.updateDeck();
      this.update({
        cardClasses: 'answered correct',
        asking: false,
        correct: true
      });
    },

    answerWrong() {
      this.props.card.addWrong();
      this.props.session.playedCounter++;
      this.props.updateDeck();
      this.update({
        cardClasses: 'answered wrong',
        asking: false,
        correct: false
      });
    },

    nextCard(e) {
      e.preventDefault();
      this.update({
        cardClasses: '',
        asking: true
      });
      this.props.loadNextCard();
    },

    startEditing(e) {
      e.preventDefault();
      this.props.editCard();
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr69="expr69"><div expr70="expr70" class="question"> </div><div expr71="expr71" class="answer"></div><div expr72="expr72" class="synonym"></div></div><div expr75="expr75" class="card-answer asking"></div><div expr78="expr78" class="card-answer answered"></div>', [{
      'redundantAttribute': 'expr69',
      'selector': '[expr69]',
      'expressions': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'class',
        'evaluate': function (scope) {
          return ['card ', scope.state.cardClasses].join('');
        }
      }]
    }, {
      'redundantAttribute': 'expr70',
      'selector': '[expr70]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return [scope.props.showingFront ? scope.props.card.front : scope.props.card.back].join('');
        }
      }]
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.asking;
      },
      'redundantAttribute': 'expr71',
      'selector': '[expr71]',
      'template': template(' ', [{
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return [scope.props.showingFront ? scope.props.card.back : scope.props.card.front].join('');
          }
        }]
      }])
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.asking;
      },
      'redundantAttribute': 'expr72',
      'selector': '[expr72]',
      'template': template('<span expr73="expr73" class="syn"></span><span expr74="expr74" class="syn"></span>', [{
        'type': bindingTypes.EACH,
        'getKey': null,
        'condition': function (scope) {
          return scope.props.showingFront;
        },
        'template': template(' ', [{
          'expressions': [{
            'type': expressionTypes.TEXT,
            'childNodeIndex': 0,
            'evaluate': function (scope) {
              return scope.syn;
            }
          }]
        }]),
        'redundantAttribute': 'expr73',
        'selector': '[expr73]',
        'itemName': 'syn',
        'indexName': null,
        'evaluate': function (scope) {
          return scope.props.card.synBack;
        }
      }, {
        'type': bindingTypes.EACH,
        'getKey': null,
        'condition': function (scope) {
          return scope.props.showingFront === false;
        },
        'template': template(' ', [{
          'expressions': [{
            'type': expressionTypes.TEXT,
            'childNodeIndex': 0,
            'evaluate': function (scope) {
              return scope.syn;
            }
          }]
        }]),
        'redundantAttribute': 'expr74',
        'selector': '[expr74]',
        'itemName': 'syn',
        'indexName': null,
        'evaluate': function (scope) {
          return scope.props.card.synFront;
        }
      }])
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.state.asking;
      },
      'redundantAttribute': 'expr75',
      'selector': '[expr75]',
      'template': template('<form><input expr76="expr76" id="answerinput" type="text" autocomplete="off" placeholder="Answer"/><button expr77="expr77" class="button-primary">Enter</button></form>', [{
        'redundantAttribute': 'expr76',
        'selector': '[expr76]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'oninput',
          'evaluate': function (scope) {
            return scope.changeAnswer;
          }
        }]
      }, {
        'redundantAttribute': 'expr77',
        'selector': '[expr77]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.enterAnswer;
          }
        }]
      }])
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.asking;
      },
      'redundantAttribute': 'expr78',
      'selector': '[expr78]',
      'template': template('<input expr79="expr79" type="text" disabled/><button expr80="expr80" class="button">Edit card</button><button expr81="expr81" id="nextbutton" class="button-primary">Next</button>', [{
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return !scope.state.asking;
        },
        'redundantAttribute': 'expr79',
        'selector': '[expr79]',
        'template': template(null, [{
          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'value',
            'evaluate': function (scope) {
              return scope.state.answerBox;
            }
          }]
        }])
      }, {
        'redundantAttribute': 'expr80',
        'selector': '[expr80]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.startEditing;
          }
        }]
      }, {
        'redundantAttribute': 'expr81',
        'selector': '[expr81]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.nextCard;
          }
        }]
      }])
    }]);
  },
  'name': 'card-display'
};
exports.default = _default;
},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `end-screen,[is="end-screen"]{ text-align: center; } end-screen h3,[is="end-screen"] h3{ margin-top: 50px; } end-screen button,[is="end-screen"] button{ margin: 1em; }`,
  'exports': {
    onBeforeMount() {
      let correctCounter = this.props.session.correctCounter;
      let totalCount = this.props.session.totalCount;
      this.state = {
        correctCounter: correctCounter,
        totalCount: totalCount,
        percentCorrect: Math.floor(correctCounter / totalCount * 100)
      };
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<h3>Session done!</h3><p expr55="expr55"> </p><div><button expr56="expr56">Practice again</button><button expr57="expr57">Edit deck</button></div>', [{
      'redundantAttribute': 'expr55',
      'selector': '[expr55]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return ['You\'ve gone through all the cards in your deck. You got ', scope.state.correctCounter, ' correct out of ', scope.state.totalCount, ' (', scope.state.percentCorrect, '%).'].join('');
        }
      }]
    }, {
      'redundantAttribute': 'expr56',
      'selector': '[expr56]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onPracticeAgain;
        }
      }]
    }, {
      'redundantAttribute': 'expr57',
      'selector': '[expr57]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onEditDeck;
        }
      }]
    }]);
  },
  'name': 'end-screen'
};
exports.default = _default;
},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const CardDisplay = require('./carddisplay.riot').default;

const EndScreen = require('./end-screen.riot').default;

const {
  register
} = require('riot');

register('card-display', CardDisplay);
register('end-screen', EndScreen);
var _default = {
  'css': `playing-container .startscreen,[is="playing-container"] .startscreen{ text-align: center; } playing-container .startscreen button,[is="playing-container"] .startscreen button{ display: block; }`,
  'exports': {
    onBeforeMount() {
      this.state = {
        editing: false,
        defaultPlay: true // default play is showing front and asking for back

      };
    },

    onBeforeUpdate(props, state) {
      if (props.session.setting == 'default') {
        this.state.defaultPlay = true;
      } else if (props.session.setting == 'reverse') {
        this.state.defaultPlay = false;
      }
    },

    finishEditing() {
      this.update({
        editing: false
      });
      this.props.loadNextCard();
    },

    startEditing() {
      this.update({
        editing: true
      });
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr37="expr37"></div>', [{
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.props.show;
      },
      'redundantAttribute': 'expr37',
      'selector': '[expr37]',
      'template': template('<card-display expr38="expr38"></card-display><card-edit expr39="expr39"></card-edit><end-screen expr40="expr40"></end-screen>', [{
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return !scope.state.editing && !scope.props.outOfCards;
        },
        'redundantAttribute': 'expr38',
        'selector': '[expr38]',
        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,
          'evaluate': function (scope) {
            return 'card-display';
          },
          'slots': [],
          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'card',
            'evaluate': function (scope) {
              return scope.props.card;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'edit-card',
            'evaluate': function (scope) {
              return scope.startEditing;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'session',
            'evaluate': function (scope) {
              return scope.props.session;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'load-next-card',
            'evaluate': function (scope) {
              return scope.props.loadNextCard;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'update-deck',
            'evaluate': function (scope) {
              return scope.props.updateDeck;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'showing-front',
            'evaluate': function (scope) {
              return scope.state.defaultPlay;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return scope.state.editing;
        },
        'redundantAttribute': 'expr39',
        'selector': '[expr39]',
        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,
          'evaluate': function (scope) {
            return 'card-edit';
          },
          'slots': [],
          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'card',
            'evaluate': function (scope) {
              return scope.props.card;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'finish-editing',
            'evaluate': function (scope) {
              return scope.finishEditing;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'update-deck',
            'evaluate': function (scope) {
              return scope.props.updateDeck;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return scope.props.outOfCards;
        },
        'redundantAttribute': 'expr40',
        'selector': '[expr40]',
        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,
          'evaluate': function (scope) {
            return 'end-screen';
          },
          'slots': [],
          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'session',
            'evaluate': function (scope) {
              return scope.props.session;
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'on-practice-again',
            'evaluate': function (scope) {
              return scope.props.onPracticeAgain;
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'on-edit-deck',
            'evaluate': function (scope) {
              return scope.props.onEditDeck;
            }
          }]
        }])
      }])
    }]);
  },
  'name': 'playing-container'
};
exports.default = _default;
},{"./carddisplay.riot":14,"./end-screen.riot":15,"riot":1}],17:[function(require,module,exports){
// Utility function to shuffle array
// Using the Fisher-Yates shuffle
// Thanks academia!
function shuffle(oldArray) {
  let array = oldArray.slice(0)
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // swap elements
  }

  return array
}

class Card {
  constructor(cardData) {
    this.front = cardData.front || ''
    this.back = cardData.back || ''
    this.subFront = cardData.subFront || ''
    this.subBack = cardData.subBack || ''
    this.synFront = cardData.synFront || []
    this.synBack = cardData.synBack || []
    this.totalRight = cardData.totalRight || 0
    this.totalWrong = cardData.totalWrong || 0

    // synFront/Back is synonym for front/back.
    /// So you can add that as an alternate answer
    /// when typing into the textbox
  }

  changeFront(newText) {
    this.front = newText
  }

  changeBack(newText) {
    this.back = newText
  }

  addRight() {
    this.totalRight++
  }

  addWrong() {
    this.totalWrong++
  }

  addSyn(side, synonym) {
    // side should be either 'front' or 'back'
    switch(side) {
      case 'front':
        this.synFront.push(synonym)
        break
      case 'back':
        this.synBack.push(synonym)
        break
      default:
        console.log("Seems like you're trying to add a synonym to a nonexistent side, boyo")
    }
  }

  removeSyn(side, i) {
    switch(side) {
      case 'front':
        this.synFront.splice(i, 1)
        break
      case 'back':
        this.synBack.splice(i, 1)
        break
      default:
        console.log("Seems like you're trying to add a synonym to a nonexistent side, boyo")
    }
  }
}

let sampleCards = [
  new Card({
    front: "éclair",
    back: "flash of lightning",
    synBack: ["lightning"]
  }),
  new Card({
    front: "雷",
    back: "thunder",
    synBack: ["thunder", "lightning", "thunderbolt"]
  }),
  new Card({
    front: "kilat",
    back: "lightning",
    synFront: ["petir"],
  })
]

class Deck {
  // Deck contains all the cards that can be played.
  // "100 French Words" or "JLPT N4 Vocabulary" would be a Deck
  // The deck of cards currently being played
  // is in currentSession.deck

  constructor(cards) {
    this.name = "Sample Cards"
    this.cards = cards || sampleCards
    this.currentSession = {
      deck: this.cards.slice(0),
      correctCounter: 0,
      playedCounter: 0,
      setting: 'default',
    }
    this.currentSession.totalCount = this.cards.length
  }

  addCard(cardData) {
    let newCard = new Card(cardData)
    this.cards.push(newCard)
    return newCard
  }

  shuffleAllCards() {
    let allCards = this.cards.slice(0)
    this.currentSession.deck = shuffle(allCards)
    this.currentSession.totalCount = allCards.length
  }

  startNewSession(setting='default') {
    this.currentSession.correctCounter = 0
    this.currentSession.playedCounter = 0
    this.currentSession.setting = setting
    this.shuffleAllCards()
  }

  drawCard() {
    // return a card from the end and remove it from the deck
    return this.currentSession.deck.pop()
  }

  removeCard(i) {
    this.cards.splice(i, 1)
  }

  changeName(newName) {
    this.name = newName
  }

  replaceDeck(deckData) {
    // Changing name
    this.changeName(deckData.name)
    const newCards = deckData.cards

    // Emptying cards in the Deck
    this.cards = []

    // Putting in all the new cards
    newCards.forEach((card) => {
      this.addCard(card)
    })

    // Shuffling the new deck
    this.shuffleAllCards()
  }

  saveToLocalStorage() {
    //holy shit is it really this easy??
    let cards = this.cards
    let deck = { name: this.name, cards: cards }
    let exportedDeck = JSON.stringify(deck)
    localStorage.setItem("deck", exportedDeck)
  }

  getFromLocalStorage() {
    const deckToImport = localStorage.getItem("deck")

    // If there's no data stored, return
    if (!deckToImport) { return }

    // Else, import it
    const importedDeck = JSON.parse(deckToImport)

    this.replaceDeck(importedDeck)
  }

  getLocalDecks() {
    // This function retrieve all saved deck data
    // and return them without processing
    const decksData = localStorage.getItem("alldecks")

    // If there's no data stored, return
    if (!decksData) { return }

    return decksData
  }

  saveCurrentDeckToLocalDecks() {
    // Local Decks is just all the decks currently saved in Local Storage
    // This method is useful for when you want to change the current deck
    const cards = this.cards
    const deck = { name: this.name, cards: cards }

    const oldDecks = JSON.parse(localStorage.getItem("alldecks"))
    let newDecks

    // If there's none stored yet, make a new array
    if (oldDecks) {
      newDecks = oldDecks.concat([deck])
    }
    else {
      newDecks = [deck]
    }

    localStorage.setItem("alldecks", JSON.stringify(newDecks))
  }

  removeFromLocalDecks(i) {
    let newDecks = JSON.parse(localStorage.getItem("alldecks")).slice()
    newDecks.splice(i, 1)
    localStorage.setItem("alldecks", JSON.stringify(newDecks))
  }

  destroyLocalDecks() {
    localStorage.removeItem("alldecks")
  }

}

const currentDeck = new Deck(sampleCards)


module.exports = currentDeck

},{}]},{},[3]);
