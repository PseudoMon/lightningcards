(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* Riot v4.3.5, @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.riot = {}));
}(this, function (exports) { 'use strict';

  const COMPONENTS_IMPLEMENTATION_MAP = new Map(),
        DOM_COMPONENT_INSTANCE_PROPERTY = Symbol('riot-component'),
        PLUGINS_SET = new Set(),
        IS_DIRECTIVE = 'is',
        VALUE_ATTRIBUTE = 'value',
        ATTRIBUTES_KEY_SYMBOL = Symbol('attributes'),
        TEMPLATE_KEY_SYMBOL = Symbol('template');

  var globals = /*#__PURE__*/Object.freeze({
    COMPONENTS_IMPLEMENTATION_MAP: COMPONENTS_IMPLEMENTATION_MAP,
    DOM_COMPONENT_INSTANCE_PROPERTY: DOM_COMPONENT_INSTANCE_PROPERTY,
    PLUGINS_SET: PLUGINS_SET,
    IS_DIRECTIVE: IS_DIRECTIVE,
    VALUE_ATTRIBUTE: VALUE_ATTRIBUTE,
    ATTRIBUTES_KEY_SYMBOL: ATTRIBUTES_KEY_SYMBOL,
    TEMPLATE_KEY_SYMBOL: TEMPLATE_KEY_SYMBOL
  });

  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */
  function cleanNode(node) {
    clearChildren(node, node.childNodes);
  }
  /**
   * Clear multiple children in a node
   * @param   {HTMLElement} parent - parent node where the children will be removed
   * @param   {HTMLElement[]} children - direct children nodes
   * @returns {undefined}
   */


  function clearChildren(parent, children) {
    Array.from(children).forEach(n => parent.removeChild(n));
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
  /* get rid of the @ungap/essential-map polyfill */


  const append = (get, parent, children, start, end, before) => {
    if (end - start < 2) parent.insertBefore(get(children[start], 1), before);else {
      const fragment = parent.ownerDocument.createDocumentFragment();

      while (start < end) fragment.appendChild(get(children[start++], 1));

      parent.insertBefore(fragment, before);
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

  const remove = (get, parent, children, start, end) => {
    if (end - start < 2) parent.removeChild(get(children[start], -1));else {
      const range = parent.ownerDocument.createRange();
      range.setStartBefore(get(children[start], -1));
      range.setEndAfter(get(children[end - 1], -1));
      range.deleteContents();
    }
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

    const keymap = new Map();

    for (let i = currentStart; i < currentEnd; i++) keymap.set(currentNodes[i], i);

    for (let i = futureStart; i < futureEnd; i++) {
      const idxInOld = keymap.get(futureNodes[i]);

      if (idxInOld != null) {
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
    const live = new Map();
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
          live.set(futureNodes[futureStart], 1);
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
          if (live.has(currentNodes[currentStart])) currentStart++;else remove(get, parentNode, currentNodes, currentStart++, currentStart);
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
      remove(get, parentNode, currentNodes, currentStart, currentEnd);
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
          remove(get, parentNode, currentNodes, currentStart, i);
          remove(get, parentNode, currentNodes, i + futureChanges, currentEnd);
          return futureNodes;
        }
      } // common case with one replacement for many nodes
    // or many nodes replaced for a single one

    /* istanbul ignore else */


    if (currentChanges < 2 || futureChanges < 2) {
      append(get, parentNode, futureNodes, futureStart, futureEnd, get(currentNodes[currentStart], 0));
      remove(get, parentNode, currentNodes, currentStart, currentEnd);
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
   * Check if a value is null or undefined
   * @param   {*}  value - anything
   * @returns {boolean} true only for the 'undefined' and 'null' types
   */


  function isNil(value) {
    return value == null;
  }
  /**
   * Check if an element is a template tag
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if it's a <template>
   */


  function isTemplate(el) {
    return !isNil(el.content);
  }

  const EachBinding = Object.seal({
    // dynamic binding properties
    childrenMap: null,
    node: null,
    root: null,
    condition: null,
    evaluate: null,
    template: null,
    isTemplateTag: false,
    nodes: [],
    getKey: null,
    indexName: null,
    itemName: null,
    afterPlaceholder: null,
    placeholder: null,

    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const {
        placeholder
      } = this;
      const collection = this.evaluate(scope);
      const items = collection ? Array.from(collection) : [];
      const parent = placeholder.parentNode; // prepare the diffing

      const {
        newChildrenMap,
        batches,
        futureNodes
      } = createPatch(items, scope, parentScope, this); // patch the DOM only if there are new nodes

      if (futureNodes.length) {
        domdiff(parent, this.nodes, futureNodes, {
          before: placeholder,
          node: patch(Array.from(this.childrenMap.values()), parentScope)
        });
      } else {
        // remove all redundant templates
        unmountRedundant(this.childrenMap);
      } // trigger the mounts and the updates


      batches.forEach(fn => fn()); // update the children map

      this.childrenMap = newChildrenMap;
      this.nodes = futureNodes;
      return this;
    },

    unmount(scope, parentScope) {
      unmountRedundant(this.childrenMap, parentScope);
      this.childrenMap = new Map();
      this.nodes = [];
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
        const {
          template,
          context
        } = redundant.pop(); // notice that we pass null as last argument because
        // the root node and its children will be removed by domdiff

        template.unmount(context, parentScope, null);
      }

      return item;
    };
  }
  /**
   * Unmount the remaining template instances
   * @param   {Map} childrenMap - map containing the children template to unmount
   * @param   {*} parentScope - scope of the parent template
   * @returns {TemplateChunk[]} collection containing the template chunks unmounted
   */


  function unmountRedundant(childrenMap, parentScope) {
    return Array.from(childrenMap.values()).map((_ref) => {
      let {
        template,
        context
      } = _ref;
      return template.unmount(context, parentScope, true);
    });
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


  function extendScope(scope, _ref2) {
    let {
      itemName,
      indexName,
      index,
      item
    } = _ref2;
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
        componentTemplate.update(context, parentScope);
      } // create the collection of nodes to update or to add
      // in case of template tags we need to add all its children nodes


      if (isTemplateTag) {
        futureNodes.push(...(meta.children || componentTemplate.children));
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

  function create(node, _ref3) {
    let {
      evaluate,
      condition,
      itemName,
      indexName,
      getKey,
      template
    } = _ref3;
    const placeholder = document.createTextNode('');
    const parent = node.parentNode;
    const root = node.cloneNode();
    parent.insertBefore(placeholder, node);
    parent.removeChild(node);
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
    node: null,
    evaluate: null,
    parent: null,
    isTemplateTag: false,
    placeholder: null,
    template: null,

    // API methods
    mount(scope, parentScope) {
      this.parent.insertBefore(this.placeholder, this.node);
      this.parent.removeChild(this.node);
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const value = !!this.evaluate(scope);
      const mustMount = !this.value && value;
      const mustUnmount = this.value && !value;

      switch (true) {
        case mustMount:
          this.parent.insertBefore(this.node, this.placeholder);
          this.template = this.template.clone();
          this.template.mount(this.node, scope, parentScope);
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
      this.template.unmount(scope, parentScope);
      return this;
    }

  });

  function create$1(node, _ref4) {
    let {
      evaluate,
      template
    } = _ref4;
    return Object.assign({}, IfBinding, {
      node,
      evaluate,
      parent: node.parentNode,
      placeholder: document.createTextNode(''),
      template: template.createDOM(node)
    });
  }

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
  const REMOVE_ATTRIBUTE = 'removeAttribute';
  const SET_ATTIBUTE = 'setAttribute';
  /**
   * Add all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing the attributes names and values
   * @returns {undefined} sorry it's a void function :(
   */

  function setAllAttributes(node, attributes) {
    Object.entries(attributes).forEach((_ref5) => {
      let [name, value] = _ref5;
      return attributeExpression(node, {
        name
      }, value);
    });
  }
  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing all the attribute names
   * @returns {undefined} sorry it's a void function :(
   */


  function removeAllAttributes(node, attributes) {
    Object.keys(attributes).forEach(attribute => node.removeAttribute(attribute));
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


  function attributeExpression(node, _ref6, value, oldValue) {
    let {
      name
    } = _ref6;

    // is it a spread operator? {...attributes}
    if (!name) {
      // is the value still truthy?
      if (value) {
        setAllAttributes(node, value);
      } else if (oldValue) {
        // otherwise remove all the old attributes
        removeAllAttributes(node, oldValue);
      }

      return;
    } // handle boolean attributes


    if (typeof value === 'boolean') {
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
    return isNil(value) || value === false || value === '' || typeof value === 'object' ? REMOVE_ATTRIBUTE : SET_ATTIBUTE;
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
  /**
   * Set a new event listener
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @returns {undefined}
   */


  function eventExpression(node, _ref7, value) {
    let {
      name
    } = _ref7;
    node[name] = value;
  }
  /**
   * This methods handles a simple text expression update
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {number} expression.childNodeIndex - index to find the text node to update
   * @param   {*} value - new expression value
   * @returns {undefined}
   */


  function textExpression(node, _ref8, value) {
    let {
      childNodeIndex
    } = _ref8;
    const target = node.childNodes[childNodeIndex];
    const val = normalizeValue$1(value); // replace the target if it's a placeholder comment

    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode(val);
      node.replaceChild(textNode, target);
    } else {
      target.data = normalizeValue$1(val);
    }
  }
  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */


  function normalizeValue$1(value) {
    return value != null ? value : '';
  }
  /**
   * This methods handles the input fileds value updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */


  function valueExpression(node, expression, value) {
    node.value = value;
  }

  var expressions = {
    [ATTRIBUTE]: attributeExpression,
    [EVENT]: eventExpression,
    [TEXT]: textExpression,
    [VALUE]: valueExpression
  };
  const Expression = Object.seal({
    // Static props
    node: null,
    value: null,

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
      node
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

  function create$3(node, _ref9) {
    let {
      expressions
    } = _ref9;
    return Object.assign({}, flattenCollectionMethods(expressions.map(expression => create$2(node, expression)), ['mount', 'update', 'unmount']));
  }

  const SlotBinding = Object.seal({
    // dynamic binding properties
    node: null,
    name: null,
    template: null,

    // API methods
    mount(scope, parentScope) {
      const templateData = scope.slots ? scope.slots.find((_ref10) => {
        let {
          id
        } = _ref10;
        return id === this.name;
      }) : false;
      const {
        parentNode
      } = this.node;
      this.template = templateData && create$6(templateData.html, templateData.bindings).createDOM(parentNode);

      if (this.template) {
        this.template.mount(this.node, parentScope);
        moveSlotInnerContent(this.node);
      }

      parentNode.removeChild(this.node);
      return this;
    },

    update(scope, parentScope) {
      if (this.template && parentScope) {
        this.template.update(parentScope);
      }

      return this;
    },

    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.template) {
        this.template.unmount(parentScope, null, mustRemoveRoot);
      }

      return this;
    }

  });
  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLNode} slot - slot node
   * @returns {undefined} it's a void function
   */

  function moveSlotInnerContent(slot) {
    if (slot.firstChild) {
      slot.parentNode.insertBefore(slot.firstChild, slot);
      moveSlotInnerContent(slot);
    }
  }
  /**
   * Create a single slot binding
   * @param   {HTMLElement} node - slot node
   * @param   {string} options.name - slot id
   * @returns {Object} Slot binding object
   */


  function createSlot(node, _ref11) {
    let {
      name
    } = _ref11;
    return Object.assign({}, SlotBinding, {
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
    return slots.reduce((acc, _ref12) => {
      let {
        bindings
      } = _ref12;
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
    node: null,
    evaluate: null,
    name: null,
    slots: null,
    tag: null,
    attributes: null,
    getComponent: null,

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

  function create$4(node, _ref13) {
    let {
      evaluate,
      getComponent,
      slots,
      attributes
    } = _ref13;
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
   * Bind a new expression object to a DOM node
   * @param   {HTMLElement} root - DOM node where to bind the expression
   * @param   {Object} binding - binding data
   * @returns {Expression} Expression object
   */

  function create$5(root, binding) {
    const {
      selector,
      type,
      redundantAttribute,
      expressions
    } = binding; // find the node to apply the bindings

    const node = selector ? root.querySelector(selector) : root; // remove eventually additional attributes created only to select this node

    if (redundantAttribute) node.removeAttribute(redundantAttribute); // init the binding

    return (bindings[type] || bindings[SIMPLE])(node, Object.assign({}, binding, {
      expressions: expressions || []
    }));
  }
  /**
   * Check if an element is part of an svg
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if we are in an svg context
   */


  function isSvg(el) {
    const owner = el.ownerSVGElement;
    return !!owner || owner === null;
  } // in this case a simple innerHTML is enough


  function createHTMLTree(html, root) {
    const template = isTemplate(root) ? root : document.createElement('template');
    template.innerHTML = html;
    return template.content;
  } // for svg nodes we need a bit more work


  function creteSVGTree(html, container) {
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
    if (isSvg(root)) return creteSVGTree(html, root);
    return createHTMLTree(html, root);
  }
  /**
   * Move all the child nodes from a source tag to another
   * @param   {HTMLElement} source - source node
   * @param   {HTMLElement} target - target node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */
  // Ignore this helper because it's needed only for svg tags

  /* istanbul ignore next */


  function moveChildren(source, target) {
    if (source.firstChild) {
      target.appendChild(source.firstChild);
      moveChildren(source, target);
    }
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
    bindings: null,
    bindingsData: null,
    html: null,
    isTemplateTag: false,
    fragment: null,
    children: null,
    dom: null,
    el: null,

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
      this.isTemplateTag = isTemplate(el); // create the DOM if it wasn't created before

      this.createDOM(el);

      if (this.dom) {
        // create the new template dom fragment if it want already passed in via meta
        this.fragment = fragment || this.dom.cloneNode(true);
      } // store root node
      // notice that for template tags the root note will be the parent tag


      this.el = this.isTemplateTag ? parentNode : el; // create the children array only for the <template> fragments

      this.children = this.isTemplateTag ? children || Array.from(this.fragment.childNodes) : null; // inject the DOM into the el only if a fragment is available

      if (!avoidDOMInjection && this.fragment) injectDOM(el, this.fragment); // create the bindings

      this.bindings = this.bindingsData.map(binding => create$5(this.el, binding));
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

        if (mustRemoveRoot && this.el.parentNode) {
          this.el.parentNode.removeChild(this.el);
        } else if (mustRemoveRoot !== null) {
          if (this.children) {
            clearChildren(this.children[0].parentNode, this.children);
          } else {
            cleanNode(this.el);
          }
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
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */

  function isFunction(value) {
    return checkType(value, 'function');
  }

  /* eslint-disable fp/no-mutating-methods */
  /**
   * Throw an error
   * @param {string} error - error message
   * @returns {undefined} it's a IO void function
   */

  function panic(error) {
    throw new Error(error);
  }
  /**
   * Call the first argument received only if it's a function otherwise return it as it is
   * @param   {*} source - anything
   * @returns {*} anything
   */

  function callOrAssign(source) {
    return isFunction(source) ? source.prototype && source.prototype.constructor ? new source() : source() : source;
  }
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

  function dashToCamelCase(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  }
  /**
   * Define default properties if they don't exist on the source object
   * @param   {Object} source - object that will receive the default properties
   * @param   {Object} defaults - object containing additional optional keys
   * @returns {Object} the original object received enhanced
   */

  function defineDefaults(source, defaults) {
    Object.entries(defaults).forEach((_ref) => {
      let [key, value] = _ref;
      if (!source[key]) source[key] = value;
    });
    return source;
  } // doese simply nothing

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

    Object.defineProperty(source, key, Object.assign({
      value,
      enumerable: false,
      writable: false,
      configurable: true
    }, options));
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
    Object.entries(properties).forEach((_ref2) => {
      let [key, value] = _ref2;
      defineProperty(source, key, value, options);
    });
    return source;
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
        case !attribute.name && type === expressionTypes.ATTRIBUTE:
          return Object.assign({}, acc, {}, value);
        // value attribute

        case type === expressionTypes.VALUE:
          acc[VALUE_ATTRIBUTE] = attribute.value;
          break;
        // normal attributes

        default:
          acc[dashToCamelCase(attribute.name)] = attribute.value;
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

  /**
   * Get all the element attributes as object
   * @param   {HTMLElement} element - DOM node we want to parse
   * @returns {Object} all the attributes found as a key value pairs
   */

  function DOMattributesToObject(element) {
    return Array.from(element.attributes).reduce((acc, attribute) => {
      acc[dashToCamelCase(attribute.name)] = attribute.value;
      return acc;
    }, {});
  }
  /**
   * Get the tag name of any DOM node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */

  function getName(element) {
    return get(element, IS_DIRECTIVE) || element.tagName.toLowerCase();
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

  const COMPONENT_CORE_HELPERS = Object.freeze({
    // component helpers
    $(selector) {
      return $(selector, this.root)[0];
    },

    $$(selector) {
      return $(selector, this.root);
    }

  });
  const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
    shouldUpdate: noop,
    onBeforeMount: noop,
    onMounted: noop,
    onBeforeUpdate: noop,
    onUpdated: noop,
    onBeforeUnmount: noop,
    onUnmounted: noop
  });
  const MOCKED_TEMPLATE_INTERFACE = {
    update: noop,
    mount: noop,
    unmount: noop,
    clone: noop,
    createDOM: noop
    /**
     * Factory function to create the component templates only once
     * @param   {Function} template - component template creation function
     * @param   {Object} components - object containing the nested components
     * @returns {TemplateChunk} template chunk object
     */

  };

  function componentTemplateFactory(template, components) {
    return template(create$6, expressionTypes, bindingTypes, name => {
      return components[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name);
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


  function createComponent(_ref) {
    let {
      css,
      template,
      exports,
      name
    } = _ref;
    const templateFn = template ? componentTemplateFactory(template, exports ? createSubcomponents(exports.components) : {}) : MOCKED_TEMPLATE_INTERFACE;
    return (_ref2) => {
      let {
        slots,
        attributes,
        props
      } = _ref2;
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

  function defineComponent(_ref3) {
    let {
      css,
      template,
      componentAPI,
      name
    } = _ref3;
    // add the component css into the DOM
    if (css && name) cssManager.add(name, css);
    return curry(enhanceComponentAPI)(defineProperties( // set the component defaults without overriding the original component API
    defineDefaults(componentAPI, Object.assign({}, COMPONENT_LIFECYCLE_METHODS, {
      state: {}
    })), Object.assign({
      // defined during the component creation
      slots: null,
      root: null
    }, COMPONENT_CORE_HELPERS, {
      name,
      css,
      template
    })));
  }
  /**
   * Evaluate the component properties either from its real attributes or from its attribute expressions
   * @param   {HTMLElement} element - component root
   * @param   {Array}  attributeExpressions - attribute values generated via createAttributeBindings
   * @returns {Object} attributes key value pairs
   */

  function evaluateProps(element, attributeExpressions) {
    if (attributeExpressions === void 0) {
      attributeExpressions = [];
    }

    return Object.assign({}, DOMattributesToObject(element), {}, evaluateAttributeExpressions(attributeExpressions));
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

    const updateValues = method => scope => {
      expressions.forEach(e => e[method](scope));
      return binding;
    };

    return Object.assign(binding, {
      expressions,
      mount: updateValues('mount'),
      update: updateValues('update'),
      unmount: updateValues('unmount')
    });
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

    return Object.entries(callOrAssign(components)).reduce((acc, _ref4) => {
      let [key, value] = _ref4;
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
      set(element, 'is', name);
    }
  }
  /**
   * Component creation factory function that will enhance the user provided API
   * @param   {Object} component - a component implementation previously defined
   * @param   {Array} options.slots - component slots generated via riot compiler
   * @param   {Array} options.attributes - attribute expressions generated via riot compiler
   * @returns {Riot.Component} a riot component instance
   */


  function enhanceComponentAPI(component, _ref5) {
    let {
      slots,
      attributes,
      props
    } = _ref5;
    const initialProps = callOrAssign(props);
    return autobindMethods(runPlugins(defineProperties(Object.create(component), {
      mount(element, state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(element, attributes).mount(parentScope);
        this.props = Object.freeze(Object.assign({}, initialProps, {}, evaluateProps(element, this[ATTRIBUTES_KEY_SYMBOL].expressions)));
        this.state = computeState(this.state, state);
        this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone(); // link this object to the DOM node

        element[DOM_COMPONENT_INSTANCE_PROPERTY] = this; // add eventually the 'is' attribute

        component.name && addCssHook(element, component.name); // define the root element

        defineProperty(this, 'root', element); // define the slots array

        defineProperty(this, 'slots', slots); // before mount lifecycle event

        this.onBeforeMount(this.props, this.state); // mount the template

        this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope);
        this.onMounted(this.props, this.state);
        return this;
      },

      update(state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        if (parentScope) {
          this[ATTRIBUTES_KEY_SYMBOL].update(parentScope);
        }

        const newProps = evaluateProps(this.root, this[ATTRIBUTES_KEY_SYMBOL].expressions);
        if (this.shouldUpdate(newProps, this.props) === false) return;
        this.props = Object.freeze(Object.assign({}, initialProps, {}, newProps));
        this.state = computeState(this.state, state);
        this.onBeforeUpdate(this.props, this.state);
        this[TEMPLATE_KEY_SYMBOL].update(this, parentScope);
        this.onUpdated(this.props, this.state);
        return this;
      },

      unmount(preserveRoot) {
        this.onBeforeUnmount(this.props, this.state);
        this[ATTRIBUTES_KEY_SYMBOL].unmount(); // if the preserveRoot is null the template html will be left untouched
        // in that case the DOM cleanup will happen differently from a parent node

        this[TEMPLATE_KEY_SYMBOL].unmount(this, {}, preserveRoot === null ? null : !preserveRoot);
        this.onUnmounted(this.props, this.state);
        return this;
      }

    })), Object.keys(component).filter(prop => isFunction(component[prop])));
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
    if (!isFunction(plugin)) panic('Plugins must be of type function');
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
    return (el, props) => compose(c => c.mount(el), c => c({
      props
    }), createComponent)(implementation);
  }
  /** @type {string} current riot version */

  const version = 'v4.3.5'; // expose some internal stuff that might be used from external tools

  const __ = {
    cssManager,
    defineComponent,
    globals
  };

  exports.__ = __;
  exports.component = component;
  exports.install = install;
  exports.mount = mount;
  exports.register = register;
  exports.uninstall = uninstall;
  exports.unmount = unmount;
  exports.unregister = unregister;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

},{}],2:[function(require,module,exports){
const Container = require('./container.riot').default
const HeadNav = require('./headnav.riot').default
const ImportExporter = require('./importexporter.riot').default
const CardEdit = require('./cardedit.riot').default
const PlayingContainer = require('./playing/playing-container.riot').default
const DeckEditContainer = require('./deck-view/deckeditcontainer.riot').default
const MainMenu = require('./main-menu.riot').default

const { registerPreprocessor, register, mount } = require('riot')

// Get our Deck object
// It contains all the card data and functions
// Is this basically our back-end? Ha!
const deck = require('./store.js')

// Registering all the main components
// Some components are registered in their parent components' file
register('container', Container)
register('headnav', HeadNav)
register('import-exporter', ImportExporter)
register('card-edit', CardEdit)
register('playing-container', PlayingContainer)
register('deck-edit-container', DeckEditContainer)
register('main-menu', MainMenu)

// Mounting the main app
mount('container', {deck: deck})

},{"./cardedit.riot":3,"./container.riot":4,"./deck-view/deckeditcontainer.riot":6,"./headnav.riot":8,"./importexporter.riot":9,"./main-menu.riot":10,"./playing/playing-container.riot":13,"./store.js":14,"riot":1}],3:[function(require,module,exports){
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
  'css': `card-edit .card,[is="card-edit"] .card{ text-align: center; font-size: 5rem; width: 80%; margin: 1.5rem auto; height: 400px; } card-edit .half,[is="card-edit"] .half{ position: relative; padding: 0 2rem; box-sizing: border-box; border-radius: 5px; box-shadow: 2px 2px #8f8989; margin: 1rem; display: flex; flex-direction: column; justify-content: center; height: 50%; } card-edit .half.top,[is="card-edit"] .half.top{ background-color: #eeeeee; } card-edit .half.bottom,[is="card-edit"] .half.bottom{ background-color: #bdccff; } card-edit .buttons,[is="card-edit"] .buttons{ width: 80%; margin: 3rem auto; padding: 0 0.5rem; text-align: center; }`,
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
      this.props.finishEditing();
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div class="card editing"><div class="half top"><half-card expr22 front-or-back="front"></half-card></div><div class="half bottom"><half-card expr23 front-or-back="back"></half-card></div></div><div expr24 class="buttons"><button>Save card</button></div>', [{
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'half-card';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'front-or-back',
        'evaluate': function () {
          return 'front';
        }
      }, {
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
        'name': 'front-or-back',
        'evaluate': function () {
          return 'back';
        }
      }, {
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
},{"./halfcardedit.riot":7,"riot":1}],4:[function(require,module,exports){
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
        notificationMessage: ''
      };
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
      this.props.deck.startNewSession(); // Give warning window whenever user try to leave

      window.onbeforeunload = function () {
        return true;
      };

      this.update({
        outOfCards: false,
        cardBeingShown: this.props.deck.drawCard()
      });
    },

    openScreen(screen) {
      if (screen === 'playing') {
        this.startNewSession();
      }

      if (screen === 'deck view' || screen === 'main menu' || screen === 'playing') {
        this.update({
          currentScreen: screen
        });
      } else {// Put error notification
      }
    },

    onUpdated(state, props) {
      if (state.screen != 'playing') {
        // Remove warning-before-leaving when not currently playing
        window.onbeforeunload = function () {
          return true;
        };
      }
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div><notification expr160></notification><headnav expr161 title="Lightning Cards"></headnav><main-menu expr162></main-menu><deck-edit-container expr163></deck-edit-container><playing-container expr164></playing-container></div>', [{
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'notification';
      },
      'slots': [{
        'id': 'default',
        'html': '<!---->',
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
      'redundantAttribute': 'expr160',
      'selector': '[expr160]'
    }, {
      'type': bindingTypes.TAG,
      'getComponent': getComponent,
      'evaluate': function (scope) {
        return 'headnav';
      },
      'slots': [],
      'attributes': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'title',
        'evaluate': function () {
          return 'Lightning Cards';
        }
      }, {
        'type': expressionTypes.ATTRIBUTE,
        'name': 'session',
        'evaluate': function (scope) {
          return scope.props.deck.currentSession;
        }
      }, {
        'type': expressionTypes.EVENT,
        'name': 'on-open-screen',
        'evaluate': function (scope) {
          return screen => scope.openScreen(screen);
        }
      }],
      'redundantAttribute': 'expr161',
      'selector': '[expr161]'
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
      'redundantAttribute': 'expr162',
      'selector': '[expr162]'
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
      'redundantAttribute': 'expr163',
      'selector': '[expr163]'
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
      'redundantAttribute': 'expr164',
      'selector': '[expr164]'
    }]);
  },
  'name': 'container'
};
exports.default = _default;
},{}],5:[function(require,module,exports){
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
    return template('<h2 class="deckname"><span expr145></span><form expr146></form></h2><div class="header"><button expr148>Edit Deck Name</button><button expr149>Add New Card</button><button expr150>Import/Export Deck</button></div><div class="cardlist"><div expr151 class="smallcard"></div></div>', [{
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.editingName;
      },
      'redundantAttribute': 'expr145',
      'selector': '[expr145]',
      'template': template('<!---->', [{
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
      'redundantAttribute': 'expr146',
      'selector': '[expr146]',
      'template': template('<input expr147 id="namefield" type="text" name="newname" autocomplete="off"/>', [{
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onsubmit',
          'evaluate': function (scope) {
            return scope.enterName;
          }
        }]
      }, {
        'redundantAttribute': 'expr147',
        'selector': '[expr147]',
        'expressions': [{
          'type': expressionTypes.VALUE,
          'evaluate': function (scope) {
            return scope.state.name;
          }
        }]
      }])
    }, {
      'redundantAttribute': 'expr148',
      'selector': '[expr148]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.startEditingName;
        }
      }]
    }, {
      'redundantAttribute': 'expr149',
      'selector': '[expr149]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onAddNewCard;
        }
      }]
    }, {
      'redundantAttribute': 'expr150',
      'selector': '[expr150]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onOpenImportExporter;
        }
      }]
    }, {
      'type': bindingTypes.EACH,
      'getKey': null,
      'condition': null,
      'template': template('<div expr152 class="xbutton">\r\n        x\r\n      </div><div expr153 class="front"><!----></div><div expr154 class="back"><!----></div>', [{
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
        'redundantAttribute': 'expr152',
        'selector': '[expr152]',
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
        'redundantAttribute': 'expr153',
        'selector': '[expr153]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return ['\r\n        ', scope.card.front, '\r\n      '].join('');
          }
        }, {
          'type': expressionTypes.ATTRIBUTE,
          'name': 'data-cardindex',
          'evaluate': function (scope) {
            return scope.i;
          }
        }]
      }, {
        'redundantAttribute': 'expr154',
        'selector': '[expr154]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return ['\r\n        ', scope.card.back, '\r\n      '].join('');
          }
        }, {
          'type': expressionTypes.ATTRIBUTE,
          'name': 'data-cardindex',
          'evaluate': function (scope) {
            return scope.i;
          }
        }]
      }]),
      'redundantAttribute': 'expr151',
      'selector': '[expr151]',
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
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const CardList = require('./cardlist.riot').default;

const {
  register
} = require('riot');

register('card-list', CardList);
var _default = {
  'css': null,
  'exports': {
    onBeforeMount() {
      this.state = {
        editingCard: false,
        isImportExporting: false
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
    }

  },
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr25></div>', [{
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.props.show;
      },
      'redundantAttribute': 'expr25',
      'selector': '[expr25]',
      'template': template('<card-list expr26></card-list><card-edit expr27></card-edit><import-exporter expr28></import-exporter>', [{
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return !scope.state.editingCard && !scope.state.isImportExporting;
        },
        'redundantAttribute': 'expr26',
        'selector': '[expr26]',
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
        'redundantAttribute': 'expr27',
        'selector': '[expr27]',
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
        'redundantAttribute': 'expr28',
        'selector': '[expr28]',
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
},{"./cardlist.riot":5,"riot":1}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `half-card .label,[is="half-card"] .label{ position: absolute; left: 0.5em; top: 0.25em; text-transform: capitalize; font-size: 3rem; opacity: 0.5; } half-card .synonyms,[is="half-card"] .synonyms{ font-size: 0.5em; } half-card .synonyms button,[is="half-card"] .synonyms button{ border: none; } half-card .syn,[is="half-card"] .syn{ padding: 0.1em 0.2em; } half-card .syn .xbutton,[is="half-card"] .syn .xbutton{ color: grey; cursor: pointer; } half-card .syn .xbutton:hover,[is="half-card"] .syn .xbutton:hover{ color: #FF6860; } half-card .syn::after,[is="half-card"] .syn::after{ content: ", "; } half-card .syn:last-of-type::after,[is="half-card"] .syn:last-of-type::after{ content: ""; } half-card .maintext form,[is="half-card"] .maintext form{ margin-bottom: 0; } half-card .maintext input,[is="half-card"] .maintext input,half-card .synonyms input,[is="half-card"] .synonyms input{ background-color: transparent; border-top: none; border-left: none; border-right: none; border-color: #5b5b5b; } half-card .maintext input,[is="half-card"] .maintext input{ text-align: center; height: 1.2em; } half-card .maintext input:focus,[is="half-card"] .maintext input:focus,half-card .synonyms input:focus,[is="half-card"] .synonyms input:focus{ border-top: none; border-left: none; border-right: none; } half-card .synonyms input,[is="half-card"] .synonyms input{ font-size: 0.7em; } half-card .synonyms form,[is="half-card"] .synonyms form{ display: inline; }`,
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
    return template('<div expr29 class="label"><!----></div><div class="maintext"><span expr30></span><form expr31></form></div><div class="synonyms"><span expr33 class="syn"></span><form expr35></form><button expr37></button></div>', [{
      'redundantAttribute': 'expr29',
      'selector': '[expr29]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return ['\r\n    ', scope.props.frontOrBack, '\r\n  '].join('');
        }
      }]
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.editing;
      },
      'redundantAttribute': 'expr30',
      'selector': '[expr30]',
      'template': template('<!---->', [{
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
      'redundantAttribute': 'expr31',
      'selector': '[expr31]',
      'template': template('<input expr32 id="mainfield" type="text" autocomplete="off"/>', [{
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onsubmit',
          'evaluate': function (scope) {
            return scope.enterText;
          }
        }]
      }, {
        'redundantAttribute': 'expr32',
        'selector': '[expr32]',
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
      'template': template('<!----><span expr34 class="xbutton">x</span>', [{
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return ['\r\n      ', scope.syn, '\r\n      '].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr34',
        'selector': '[expr34]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return e => scope.removeSyn(scope.i);
          }
        }]
      }]),
      'redundantAttribute': 'expr33',
      'selector': '[expr33]',
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
      'redundantAttribute': 'expr35',
      'selector': '[expr35]',
      'template': template('<input expr36 id="synfield" type="text" autocomplete="off"/><button type="submit">Submit</button>', [{
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onsubmit',
          'evaluate': function (scope) {
            return scope.submitSyn;
          }
        }]
      }, {
        'redundantAttribute': 'expr36',
        'selector': '[expr36]',
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
      'redundantAttribute': 'expr37',
      'selector': '[expr37]',
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
},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `headnav,[is="headnav"]{ width: 100%; display: flex; justify-content: space-between; height: 60px; } headnav .title,[is="headnav"] .title{ font-weight: 500; } headnav h1,[is="headnav"] h1{line-height: 60px; } headnav div,[is="headnav"] div{line-height: 60px; } headnav .navlinks a,[is="headnav"] .navlinks a{ margin: 0 1.2em; text-decoration: none; }`,
  'exports': null,
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr138 class="title"><!----></div><div class="navlinks"><a expr139 href="#mainmenu">Main Menu</a><a expr140 href="#deckview">View Deck</a><a expr141 href="#playing">Start Practice</a></div><div class="sessioncounter"><span expr142 class="correct"><!----></span>/<span expr143 class="wrong"><!----></span>/<span expr144 class="total"><!----></span></div>', [{
      'redundantAttribute': 'expr138',
      'selector': '[expr138]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return scope.props.title;
        }
      }]
    }, {
      'redundantAttribute': 'expr139',
      'selector': '[expr139]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return () => scope.props.onOpenScreen('main menu');
        }
      }]
    }, {
      'redundantAttribute': 'expr140',
      'selector': '[expr140]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return () => scope.props.onOpenScreen('deck view');
        }
      }]
    }, {
      'redundantAttribute': 'expr141',
      'selector': '[expr141]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return () => scope.props.onOpenScreen('playing');
        }
      }]
    }, {
      'redundantAttribute': 'expr142',
      'selector': '[expr142]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return ['\r\n        ', scope.props.session.correctCounter, '\r\n      '].join('');
        }
      }]
    }, {
      'redundantAttribute': 'expr143',
      'selector': '[expr143]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return ['\r\n        ', scope.props.session.playedCounter, '\r\n      '].join('');
        }
      }]
    }, {
      'redundantAttribute': 'expr144',
      'selector': '[expr144]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return ['\r\n        ', scope.props.session.totalCount, ' Cards\r\n      '].join('');
        }
      }]
    }]);
  },
  'name': 'headnav'
};
exports.default = _default;
},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `import-exporter,[is="import-exporter"]{ display: block; text-align: center; } import-exporter textarea,[is="import-exporter"] textarea{ min-width: 80%; }`,
  'exports': {
    onBeforeMount() {
      this.state = {
        exportedDeck: '',
        deckToImport: '',
        imported: false
      };
    },

    onMounted() {
      this.getDeckExport();
    },

    getDeckExport() {
      let cards = this.props.deck.cards;
      let deck = {
        name: this.props.deck.name,
        cards: cards
      };
      let exportedDeck = JSON.stringify(deck);
      this.update({
        exportedDeck: exportedDeck
      });
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
    return template('<div class="export"><h3>Deck Export</h3><p>Select everything in the textarea below and copy it somewhere safe.</p><div><textarea expr4><!----></textarea></div></div><div class="import"><h3>Import Deck</h3><p>Paste card data here.</p><div><textarea expr5><!----></textarea></div><div><button expr6>Click to import cards</button></div><h5 expr7></h5></div><div><button expr8>Go Back</button></div>', [{
      'redundantAttribute': 'expr4',
      'selector': '[expr4]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return scope.state.exportedDeck;
        }
      }]
    }, {
      'redundantAttribute': 'expr5',
      'selector': '[expr5]',
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
      'redundantAttribute': 'expr6',
      'selector': '[expr6]',
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
      'redundantAttribute': 'expr7',
      'selector': '[expr7]',
      'template': template('Ok!', [])
    }, {
      'redundantAttribute': 'expr8',
      'selector': '[expr8]',
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
},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `main-menu,[is="main-menu"]{ text-align: center; } main-menu h3,[is="main-menu"] h3{ margin-top: 100px; } main-menu button,[is="main-menu"] button{ margin: 1em; } main-menu .decktitle,[is="main-menu"] .decktitle{ font-weight: 500; }`,
  'exports': null,
  'template': function (template, expressionTypes, bindingTypes, getComponent) {
    return template('<div expr9></div>', [{
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.props.show;
      },
      'redundantAttribute': 'expr9',
      'selector': '[expr9]',
      'template': template('<h3>Welcome to Lightning Cards</h3><div><p>Your currently loaded deck is\r\n        <span expr10 class="decktitle"><!----></span></p></div><div><button expr11>Start Practice</button><button expr12>See/Edit Deck</button></div>', [{
        'redundantAttribute': 'expr10',
        'selector': '[expr10]',
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return scope.props.currentDeckTitle;
          }
        }]
      }, {
        'redundantAttribute': 'expr11',
        'selector': '[expr11]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.props.onStartPractice;
          }
        }]
      }, {
        'redundantAttribute': 'expr12',
        'selector': '[expr12]',
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
},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  'css': `card-display .card,[is="card-display"] .card{ text-align: center; font-size: 5rem; width: 80%; margin: 2.5rem auto; padding: 0 2rem; border-radius: 5px; background-color: #eeeeee; box-shadow: 5px 5px #8f8989; height: 300px; display: flex; flex-direction: column; justify-content: center; } card-display .card.correct,[is="card-display"] .card.correct{ background-color: #bcf15b; color: #231717; } card-display .card.wrong,[is="card-display"] .card.wrong{ background-color: #FF6860; color: #563737; } card-display .card.wrong .answer,[is="card-display"] .card.wrong .answer{ color: #fff; } card-display .answered .question,[is="card-display"] .answered .question{ font-size: 0.8em; opacity: 0.5; } card-display .answered .synonym,[is="card-display"] .answered .synonym{ font-size: 0.5em; } card-display .syn,[is="card-display"] .syn{ padding: 0.1em 0.2em; } card-display .syn::after,[is="card-display"] .syn::after{ content: ", "; } card-display .syn:last-of-type::after,[is="card-display"] .syn:last-of-type::after{ content: ""; } card-display .card-answer,[is="card-display"] .card-answer{ width: 80%; margin: 1rem auto; padding: 0 0.5rem; text-align: center; } card-display .card-answer.answered button,[is="card-display"] .card-answer.answered button{ margin: 0 2em; } card-display .card-answer input,[is="card-display"] .card-answer input{ width: 80%; text-align: center; } card-display .card-answer.asking .button-primary,[is="card-display"] .card-answer.asking .button-primary{ width: 60%; }`,
  'exports': {
    onBeforeMount() {
      this.state = {
        answerBox: '',
        cardClasses: '',
        asking: true,
        correct: false
      };
    },

    onUpdated() {
      if (!this.state.asking) {
        this.$('#nextbutton').focus();
      } else if (this.state.asking) {
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

      let card = String(this.props.card.back).toLowerCase();
      let synonyms = this.props.card.synBack.map(syn => syn.toLowerCase());

      if (answer === card || synonyms.includes(answer)) {
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
    return template('<div expr52><div expr53 class="question"><!----></div><div expr54 class="answer"></div><div expr55 class="synonym"></div></div><div expr57 class="card-answer asking"></div><div expr60 class="card-answer answered"></div>', [{
      'redundantAttribute': 'expr52',
      'selector': '[expr52]',
      'expressions': [{
        'type': expressionTypes.ATTRIBUTE,
        'name': 'class',
        'evaluate': function (scope) {
          return ['card ', scope.state.cardClasses].join('');
        }
      }]
    }, {
      'redundantAttribute': 'expr53',
      'selector': '[expr53]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return ['\r\n    ', scope.props.card.front, '\r\n    '].join('');
        }
      }]
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.asking;
      },
      'redundantAttribute': 'expr54',
      'selector': '[expr54]',
      'template': template('<!---->', [{
        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,
          'evaluate': function (scope) {
            return ['\r\n      ', scope.props.card.back, '\r\n    '].join('');
          }
        }]
      }])
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return !scope.state.asking;
      },
      'redundantAttribute': 'expr55',
      'selector': '[expr55]',
      'template': template('<span expr56 class="syn"></span>', [{
        'type': bindingTypes.EACH,
        'getKey': null,
        'condition': null,
        'template': template('<!---->', [{
          'expressions': [{
            'type': expressionTypes.TEXT,
            'childNodeIndex': 0,
            'evaluate': function (scope) {
              return scope.syn;
            }
          }]
        }]),
        'redundantAttribute': 'expr56',
        'selector': '[expr56]',
        'itemName': 'syn',
        'indexName': null,
        'evaluate': function (scope) {
          return scope.props.card.synBack;
        }
      }])
    }, {
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.state.asking;
      },
      'redundantAttribute': 'expr57',
      'selector': '[expr57]',
      'template': template('<form><input expr58 id="answerinput" type="text" autocomplete="off" placeholder="Answer"/><button expr59 class="button-primary">Enter</button></form>', [{
        'redundantAttribute': 'expr58',
        'selector': '[expr58]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'oninput',
          'evaluate': function (scope) {
            return scope.changeAnswer;
          }
        }]
      }, {
        'redundantAttribute': 'expr59',
        'selector': '[expr59]',
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
      'redundantAttribute': 'expr60',
      'selector': '[expr60]',
      'template': template('<button expr61 class="button">Edit card</button><button expr62 id="nextbutton" class="button-primary">Next</button>', [{
        'redundantAttribute': 'expr61',
        'selector': '[expr61]',
        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',
          'evaluate': function (scope) {
            return scope.startEditing;
          }
        }]
      }, {
        'redundantAttribute': 'expr62',
        'selector': '[expr62]',
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
},{}],12:[function(require,module,exports){
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
    return template('<h3>Session done!</h3><p expr38><!----></p><div><button expr39>Practice again</button><button expr40>Edit deck</button></div>', [{
      'redundantAttribute': 'expr38',
      'selector': '[expr38]',
      'expressions': [{
        'type': expressionTypes.TEXT,
        'childNodeIndex': 0,
        'evaluate': function (scope) {
          return ['You\'ve gone through all the cards in your deck. You got ', scope.state.correctCounter, ' correct out of ', scope.state.totalCount, ' (', scope.state.percentCorrect, '%).'].join('');
        }
      }]
    }, {
      'redundantAttribute': 'expr39',
      'selector': '[expr39]',
      'expressions': [{
        'type': expressionTypes.EVENT,
        'name': 'onclick',
        'evaluate': function (scope) {
          return scope.props.onPracticeAgain;
        }
      }]
    }, {
      'redundantAttribute': 'expr40',
      'selector': '[expr40]',
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
},{}],13:[function(require,module,exports){
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
  'css': null,
  'exports': {
    onBeforeMount() {
      this.state = {
        editing: false
      };
    },

    // onMounted() {
    //   // Give warning window whenever user try to leave
    //   window.onbeforeunload = function() {
    //       return true;
    //   };
    // },
    //
    // onBeforeUnmount() {
    //   window.onbeforeunload = function() {
    //       return false;
    //   };
    // },
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
    return template('<div expr18></div>', [{
      'type': bindingTypes.IF,
      'evaluate': function (scope) {
        return scope.props.show;
      },
      'redundantAttribute': 'expr18',
      'selector': '[expr18]',
      'template': template('<card-display expr19></card-display><card-edit expr20></card-edit><end-screen expr21></end-screen><div></div>', [{
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return !scope.state.editing && !scope.props.outOfCards;
        },
        'redundantAttribute': 'expr19',
        'selector': '[expr19]',
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
          }]
        }])
      }, {
        'type': bindingTypes.IF,
        'evaluate': function (scope) {
          return scope.state.editing;
        },
        'redundantAttribute': 'expr20',
        'selector': '[expr20]',
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
        'redundantAttribute': 'expr21',
        'selector': '[expr21]',
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
},{"./carddisplay.riot":11,"./end-screen.riot":12,"riot":1}],14:[function(require,module,exports){
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

  startNewSession() {
    this.currentSession.correctCounter = 0
    this.currentSession.playedCounter = 0
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
}

const currentDeck = new Deck(sampleCards)


module.exports = currentDeck

},{}]},{},[2]);
