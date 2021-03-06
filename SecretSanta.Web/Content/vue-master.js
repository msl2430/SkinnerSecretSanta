/*!
 * Vue.js v2.5.2
 * (c) 2014-2017 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.Vue = factory());
}(this, (function () { 'use strict';

/*  */

// these helpers produces better vm code in JS engines due to their
// explicitness and function inlining
    function isUndef (v) {
        return v === undefined || v === null
    }

    function isDef (v) {
        return v !== undefined && v !== null
    }

    function isTrue (v) {
        return v === true
    }

    function isFalse (v) {
        return v === false
    }

/**
 * Check if value is primitive
 */
    function isPrimitive (value) {
        return (
            typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean'
        )
    }

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
    function isObject (obj) {
        return obj !== null && typeof obj === 'object'
    }

/**
 * Get the raw type string of a value e.g. [object Object]
 */
    var _toString = Object.prototype.toString;

    function toRawType (value) {
        return _toString.call(value).slice(8, -1)
    }

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
    function isPlainObject (obj) {
        return _toString.call(obj) === '[object Object]'
    }

    function isRegExp (v) {
        return _toString.call(v) === '[object RegExp]'
    }

/**
 * Check if val is a valid array index.
 */
    function isValidArrayIndex (val) {
        var n = parseFloat(String(val));
        return n >= 0 && Math.floor(n) === n && isFinite(val)
    }

/**
 * Convert a value to a string that is actually rendered.
 */
    function toString (val) {
        return val == null
            ? ''
            : typeof val === 'object'
            ? JSON.stringify(val, null, 2)
            : String(val)
    }

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
    function toNumber (val) {
        var n = parseFloat(val);
        return isNaN(n) ? val : n
    }

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
    function makeMap (
        str,
        expectsLowerCase
    ) {
        var map = Object.create(null);
        var list = str.split(',');
        for (var i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }
        return expectsLowerCase
            ? function (val) { return map[val.toLowerCase()]; }
            : function (val) { return map[val]; }
    }

/**
 * Check if a tag is a built-in tag.
 */
    var isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if a attribute is a reserved attribute.
 */
    var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

/**
 * Remove an item from an array
 */
    function remove (arr, item) {
        if (arr.length) {
            var index = arr.indexOf(item);
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

/**
 * Check whether the object has the property.
 */
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwn (obj, key) {
        return hasOwnProperty.call(obj, key)
    }

/**
 * Create a cached version of a pure function.
 */
    function cached (fn) {
        var cache = Object.create(null);
        return (function cachedFn (str) {
            var hit = cache[str];
            return hit || (cache[str] = fn(str))
        })
    }

/**
 * Camelize a hyphen-delimited string.
 */
    var camelizeRE = /-(\w)/g;
    var camelize = cached(function (str) {
        return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
    });

/**
 * Capitalize a string.
 */
    var capitalize = cached(function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    });

/**
 * Hyphenate a camelCase string.
 */
    var hyphenateRE = /\B([A-Z])/g;
    var hyphenate = cached(function (str) {
        return str.replace(hyphenateRE, '-$1').toLowerCase()
    });

/**
 * Simple bind, faster than native
 */
    function bind (fn, ctx) {
        function boundFn (a) {
            var l = arguments.length;
            return l
                ? l > 1
                ? fn.apply(ctx, arguments)
                : fn.call(ctx, a)
                : fn.call(ctx)
        }
        // record original fn length
        boundFn._length = fn.length;
        return boundFn
    }

/**
 * Convert an Array-like object to a real Array.
 */
    function toArray (list, start) {
        start = start || 0;
        var i = list.length - start;
        var ret = new Array(i);
        while (i--) {
            ret[i] = list[i + start];
        }
        return ret
    }

/**
 * Mix properties into target object.
 */
    function extend (to, _from) {
        for (var key in _from) {
            to[key] = _from[key];
        }
        return to
    }

/**
 * Merge an Array of Objects into a single Object.
 */
    function toObject (arr) {
        var res = {};
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                extend(res, arr[i]);
            }
        }
        return res
    }

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
    function noop (a, b, c) {}

/**
 * Always return false.
 */
    var no = function (a, b, c) { return false; };

/**
 * Return same value
 */
    var identity = function (_) { return _; };

/**
 * Generate a static keys string from compiler modules.
 */
    function genStaticKeys (modules) {
        return modules.reduce(function (keys, m) {
            return keys.concat(m.staticKeys || [])
        }, []).join(',')
    }

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
    function looseEqual (a, b) {
        if (a === b) { return true }
        var isObjectA = isObject(a);
        var isObjectB = isObject(b);
        if (isObjectA && isObjectB) {
            try {
                var isArrayA = Array.isArray(a);
                var isArrayB = Array.isArray(b);
                if (isArrayA && isArrayB) {
                    return a.length === b.length && a.every(function (e, i) {
                        return looseEqual(e, b[i])
                    })
                } else if (!isArrayA && !isArrayB) {
                    var keysA = Object.keys(a);
                    var keysB = Object.keys(b);
                    return keysA.length === keysB.length && keysA.every(function (key) {
                        return looseEqual(a[key], b[key])
                    })
                } else {
                    /* istanbul ignore next */
                    return false
                }
            } catch (e) {
                /* istanbul ignore next */
                return false
            }
        } else if (!isObjectA && !isObjectB) {
            return String(a) === String(b)
        } else {
            return false
        }
    }

    function looseIndexOf (arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (looseEqual(arr[i], val)) { return i }
        }
        return -1
    }

/**
 * Ensure a function is called only once.
 */
    function once (fn) {
        var called = false;
        return function () {
            if (!called) {
                called = true;
                fn.apply(this, arguments);
            }
        }
    }

    var SSR_ATTR = 'data-server-rendered';

    var ASSET_TYPES = [
        'component',
        'directive',
        'filter'
    ];

    var LIFECYCLE_HOOKS = [
        'beforeCreate',
        'created',
        'beforeMount',
        'mounted',
        'beforeUpdate',
        'updated',
        'beforeDestroy',
        'destroyed',
        'activated',
        'deactivated',
        'errorCaptured'
    ];

/*  */

    var config = ({
        /**
         * Option merge strategies (used in core/util/options)
         */
        optionMergeStrategies: Object.create(null),

        /**
         * Whether to suppress warnings.
         */
        silent: false,

        /**
         * Show production mode tip message on boot?
         */
        productionTip: "development" !== 'production',

        /**
         * Whether to enable devtools
         */
        devtools: "development" !== 'production',

        /**
         * Whether to record perf
         */
        performance: false,

        /**
         * Error handler for watcher errors
         */
        errorHandler: null,

        /**
         * Warn handler for watcher warns
         */
        warnHandler: null,

        /**
         * Ignore certain custom elements
         */
        ignoredElements: [],

        /**
         * Custom user key aliases for v-on
         */
        keyCodes: Object.create(null),

        /**
         * Check if a tag is reserved so that it cannot be registered as a
         * component. This is platform-dependent and may be overwritten.
         */
        isReservedTag: no,

        /**
         * Check if an attribute is reserved so that it cannot be used as a component
         * prop. This is platform-dependent and may be overwritten.
         */
        isReservedAttr: no,

        /**
         * Check if a tag is an unknown element.
         * Platform-dependent.
         */
        isUnknownElement: no,

        /**
         * Get the namespace of an element
         */
        getTagNamespace: noop,

        /**
         * Parse the real tag name for the specific platform.
         */
        parsePlatformTagName: identity,

        /**
         * Check if an attribute must be bound using property, e.g. value
         * Platform-dependent.
         */
        mustUseProp: no,

        /**
         * Exposed for legacy reasons
         */
        _lifecycleHooks: LIFECYCLE_HOOKS
    });

/*  */

    var emptyObject = Object.freeze({});

/**
 * Check if a string starts with $ or _
 */
    function isReserved (str) {
        var c = (str + '').charCodeAt(0);
        return c === 0x24 || c === 0x5F
    }

/**
 * Define a property.
 */
    function def (obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
        });
    }

/**
 * Parse simple path.
 */
    var bailRE = /[^\w.$]/;
    function parsePath (path) {
        if (bailRE.test(path)) {
            return
        }
        var segments = path.split('.');
        return function (obj) {
            for (var i = 0; i < segments.length; i++) {
                if (!obj) { return }
                obj = obj[segments[i]];
            }
            return obj
        }
    }

/*  */

// can we use __proto__?
    var hasProto = '__proto__' in {};

// Browser environment sniffing
    var inBrowser = typeof window !== 'undefined';
    var UA = inBrowser && window.navigator.userAgent.toLowerCase();
    var isIE = UA && /msie|trident/.test(UA);
    var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
    var isEdge = UA && UA.indexOf('edge/') > 0;
    var isAndroid = UA && UA.indexOf('android') > 0;
    var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
    var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// Firefox has a "watch" function on Object.prototype...
    var nativeWatch = ({}).watch;

    var supportsPassive = false;
    if (inBrowser) {
        try {
            var opts = {};
            Object.defineProperty(opts, 'passive', ({
                get: function get () {
                    /* istanbul ignore next */
                    supportsPassive = true;
                }
            })); // https://github.com/facebook/flow/issues/285
            window.addEventListener('test-passive', null, opts);
        } catch (e) {}
    }

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
    var _isServer;
    var isServerRendering = function () {
        if (_isServer === undefined) {
            /* istanbul ignore if */
            if (!inBrowser && typeof global !== 'undefined') {
                // detect presence of vue-server-renderer and avoid
                // Webpack shimming the process
                _isServer = global['process'].env.VUE_ENV === 'server';
            } else {
                _isServer = false;
            }
        }
        return _isServer
    };

// detect devtools
    var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
    function isNative (Ctor) {
        return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
    }

    var hasSymbol =
        typeof Symbol !== 'undefined' && isNative(Symbol) &&
            typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

    var _Set;
/* istanbul ignore if */ // $flow-disable-line
    if (typeof Set !== 'undefined' && isNative(Set)) {
        // use native Set when available.
        _Set = Set;
    } else {
        // a non-standard Set polyfill that only works with primitive keys.
        _Set = (function () {
            function Set () {
                this.set = Object.create(null);
            }
            Set.prototype.has = function has (key) {
                return this.set[key] === true
            };
            Set.prototype.add = function add (key) {
                this.set[key] = true;
            };
            Set.prototype.clear = function clear () {
                this.set = Object.create(null);
            };

            return Set;
        }());
    }

/*  */

    var warn = noop;
    var tip = noop;
    var generateComponentTrace = (noop); // work around flow check
    var formatComponentName = (noop);

    {
        var hasConsole = typeof console !== 'undefined';
        var classifyRE = /(?:^|[-_])(\w)/g;
        var classify = function (str) { return str
            .replace(classifyRE, function (c) { return c.toUpperCase(); })
            .replace(/[-_]/g, ''); };

        warn = function (msg, vm) {
            var trace = vm ? generateComponentTrace(vm) : '';

            if (config.warnHandler) {
                config.warnHandler.call(null, msg, vm, trace);
            } else if (hasConsole && (!config.silent)) {
                console.error(("[Vue warn]: " + msg + trace));
            }
        };

        tip = function (msg, vm) {
            if (hasConsole && (!config.silent)) {
                console.warn("[Vue tip]: " + msg + (
                    vm ? generateComponentTrace(vm) : ''
                ));
            }
        };

        formatComponentName = function (vm, includeFile) {
            if (vm.$root === vm) {
                return '<Root>'
            }
            var options = typeof vm === 'function' && vm.cid != null
                ? vm.options
                : vm._isVue
                ? vm.$options || vm.constructor.options
                : vm || {};
            var name = options.name || options._componentTag;
            var file = options.__file;
            if (!name && file) {
                var match = file.match(/([^/\\]+)\.vue$/);
                name = match && match[1];
            }

            return (
                (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
                    (file && includeFile !== false ? (" at " + file) : '')
            )
        };

        var repeat = function (str, n) {
            var res = '';
            while (n) {
                if (n % 2 === 1) { res += str; }
                if (n > 1) { str += str; }
                n >>= 1;
            }
            return res
        };

        generateComponentTrace = function (vm) {
            if (vm._isVue && vm.$parent) {
                var tree = [];
                var currentRecursiveSequence = 0;
                while (vm) {
                    if (tree.length > 0) {
                        var last = tree[tree.length - 1];
                        if (last.constructor === vm.constructor) {
                            currentRecursiveSequence++;
                            vm = vm.$parent;
                            continue
                        } else if (currentRecursiveSequence > 0) {
                            tree[tree.length - 1] = [last, currentRecursiveSequence];
                            currentRecursiveSequence = 0;
                        }
                    }
                    tree.push(vm);
                    vm = vm.$parent;
                }
                return '\n\nfound in\n\n' + tree
                    .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
                        ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
                        : formatComponentName(vm))); })
                    .join('\n')
            } else {
                return ("\n\n(found in " + (formatComponentName(vm)) + ")")
            }
        };
    }

/*  */


    var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
    var Dep = function Dep () {
        this.id = uid++;
        this.subs = [];
    };

    Dep.prototype.addSub = function addSub (sub) {
        this.subs.push(sub);
    };

    Dep.prototype.removeSub = function removeSub (sub) {
        remove(this.subs, sub);
    };

    Dep.prototype.depend = function depend () {
        if (Dep.target) {
            Dep.target.addDep(this);
        }
    };

    Dep.prototype.notify = function notify () {
        // stabilize the subscriber list first
        var subs = this.subs.slice();
        for (var i = 0, l = subs.length; i < l; i++) {
            subs[i].update();
        }
    };

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
    Dep.target = null;
    var targetStack = [];

    function pushTarget (_target) {
        if (Dep.target) { targetStack.push(Dep.target); }
        Dep.target = _target;
    }

    function popTarget () {
        Dep.target = targetStack.pop();
    }

/*  */

    var VNode = function VNode (
        tag,
        data,
        children,
        text,
        elm,
        context,
        componentOptions,
        asyncFactory
    ) {
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.ns = undefined;
        this.context = context;
        this.functionalContext = undefined;
        this.functionalOptions = undefined;
        this.functionalScopeId = undefined;
        this.key = data && data.key;
        this.componentOptions = componentOptions;
        this.componentInstance = undefined;
        this.parent = undefined;
        this.raw = false;
        this.isStatic = false;
        this.isRootInsert = true;
        this.isComment = false;
        this.isCloned = false;
        this.isOnce = false;
        this.asyncFactory = asyncFactory;
        this.asyncMeta = undefined;
        this.isAsyncPlaceholder = false;
    };

    var prototypeAccessors = { child: { configurable: true } };

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
    prototypeAccessors.child.get = function () {
        return this.componentInstance
    };

    Object.defineProperties( VNode.prototype, prototypeAccessors );

    var createEmptyVNode = function (text) {
        if ( text === void 0 ) text = '';

        var node = new VNode();
        node.text = text;
        node.isComment = true;
        return node
    };

    function createTextVNode (val) {
        return new VNode(undefined, undefined, undefined, String(val))
    }

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
    function cloneVNode (vnode, deep) {
        var cloned = new VNode(
            vnode.tag,
            vnode.data,
            vnode.children,
            vnode.text,
            vnode.elm,
            vnode.context,
            vnode.componentOptions,
            vnode.asyncFactory
        );
        cloned.ns = vnode.ns;
        cloned.isStatic = vnode.isStatic;
        cloned.key = vnode.key;
        cloned.isComment = vnode.isComment;
        cloned.isCloned = true;
        if (deep && vnode.children) {
            cloned.children = cloneVNodes(vnode.children);
        }
        return cloned
    }

    function cloneVNodes (vnodes, deep) {
        var len = vnodes.length;
        var res = new Array(len);
        for (var i = 0; i < len; i++) {
            res[i] = cloneVNode(vnodes[i], deep);
        }
        return res
    }

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

    var arrayProto = Array.prototype;
    var arrayMethods = Object.create(arrayProto);[
            'push',
            'pop',
            'shift',
            'unshift',
            'splice',
            'sort',
            'reverse'
        ]
        .forEach(function (method) {
            // cache original method
            var original = arrayProto[method];
            def(arrayMethods, method, function mutator () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                var result = original.apply(this, args);
                var ob = this.__ob__;
                var inserted;
                switch (method) {
                case 'push':
                case 'unshift':
                    inserted = args;
                    break
                case 'splice':
                    inserted = args.slice(2);
                    break
                }
                if (inserted) { ob.observeArray(inserted); }
                // notify change
                ob.dep.notify();
                return result
            });
        });

/*  */

    var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
    var observerState = {
        shouldConvert: true
    };

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
    var Observer = function Observer (value) {
        this.value = value;
        this.dep = new Dep();
        this.vmCount = 0;
        def(value, '__ob__', this);
        if (Array.isArray(value)) {
            var augment = hasProto
                ? protoAugment
                : copyAugment;
            augment(value, arrayMethods, arrayKeys);
            this.observeArray(value);
        } else {
            this.walk(value);
        }
    };

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
    Observer.prototype.walk = function walk (obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]]);
        }
    };

/**
 * Observe a list of Array items.
 */
    Observer.prototype.observeArray = function observeArray (items) {
        for (var i = 0, l = items.length; i < l; i++) {
            observe(items[i]);
        }
    };

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
    function protoAugment (target, src, keys) {
        /* eslint-disable no-proto */
        target.__proto__ = src;
        /* eslint-enable no-proto */
    }

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
    function copyAugment (target, src, keys) {
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            def(target, key, src[key]);
        }
    }

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
    function observe (value, asRootData) {
        if (!isObject(value) || value instanceof VNode) {
            return
        }
        var ob;
        if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
            ob = value.__ob__;
        } else if (
            observerState.shouldConvert &&
                !isServerRendering() &&
                (Array.isArray(value) || isPlainObject(value)) &&
                Object.isExtensible(value) &&
                !value._isVue
        ) {
            ob = new Observer(value);
        }
        if (asRootData && ob) {
            ob.vmCount++;
        }
        return ob
    }

/**
 * Define a reactive property on an Object.
 */
    function defineReactive (
        obj,
        key,
        val,
        customSetter,
        shallow
    ) {
        var dep = new Dep();

        var property = Object.getOwnPropertyDescriptor(obj, key);
        if (property && property.configurable === false) {
            return
        }

        // cater for pre-defined getter/setters
        var getter = property && property.get;
        var setter = property && property.set;

        var childOb = !shallow && observe(val);
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter () {
                var value = getter ? getter.call(obj) : val;
                if (Dep.target) {
                    dep.depend();
                    if (childOb) {
                        childOb.dep.depend();
                        if (Array.isArray(value)) {
                            dependArray(value);
                        }
                    }
                }
                return value
            },
            set: function reactiveSetter (newVal) {
                var value = getter ? getter.call(obj) : val;
                /* eslint-disable no-self-compare */
                if (newVal === value || (newVal !== newVal && value !== value)) {
                    return
                }
                /* eslint-enable no-self-compare */
                if ("development" !== 'production' && customSetter) {
                    customSetter();
                }
                if (setter) {
                    setter.call(obj, newVal);
                } else {
                    val = newVal;
                }
                childOb = !shallow && observe(newVal);
                dep.notify();
            }
        });
    }

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
    function set (target, key, val) {
        if (Array.isArray(target) && isValidArrayIndex(key)) {
            target.length = Math.max(target.length, key);
            target.splice(key, 1, val);
            return val
        }
        if (hasOwn(target, key)) {
            target[key] = val;
            return val
        }
        var ob = (target).__ob__;
        if (target._isVue || (ob && ob.vmCount)) {
            "development" !== 'production' && warn(
                'Avoid adding reactive properties to a Vue instance or its root $data ' +
                'at runtime - declare it upfront in the data option.'
            );
            return val
        }
        if (!ob) {
            target[key] = val;
            return val
        }
        defineReactive(ob.value, key, val);
        ob.dep.notify();
        return val
    }

/**
 * Delete a property and trigger change if necessary.
 */
    function del (target, key) {
        if (Array.isArray(target) && isValidArrayIndex(key)) {
            target.splice(key, 1);
            return
        }
        var ob = (target).__ob__;
        if (target._isVue || (ob && ob.vmCount)) {
            "development" !== 'production' && warn(
                'Avoid deleting properties on a Vue instance or its root $data ' +
                '- just set it to null.'
            );
            return
        }
        if (!hasOwn(target, key)) {
            return
        }
        delete target[key];
        if (!ob) {
            return
        }
        ob.dep.notify();
    }

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
    function dependArray (value) {
        for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
            if (Array.isArray(e)) {
                dependArray(e);
            }
        }
    }

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
    var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
    {
        strats.el = strats.propsData = function (parent, child, vm, key) {
            if (!vm) {
                warn(
                    "option \"" + key + "\" can only be used during instance " +
                    'creation with the `new` keyword.'
                );
            }
            return defaultStrat(parent, child)
        };
    }

/**
 * Helper that recursively merges two data objects together.
 */
    function mergeData (to, from) {
        if (!from) { return to }
        var key, toVal, fromVal;
        var keys = Object.keys(from);
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            toVal = to[key];
            fromVal = from[key];
            if (!hasOwn(to, key)) {
                set(to, key, fromVal);
            } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
                mergeData(toVal, fromVal);
            }
        }
        return to
    }

/**
 * Data
 */
    function mergeDataOrFn (
        parentVal,
        childVal,
        vm
    ) {
        if (!vm) {
            // in a Vue.extend merge, both should be functions
            if (!childVal) {
                return parentVal
            }
            if (!parentVal) {
                return childVal
            }
            // when parentVal & childVal are both present,
            // we need to return a function that returns the
            // merged result of both functions... no need to
            // check if parentVal is a function here because
            // it has to be a function to pass previous merges.
            return function mergedDataFn () {
                return mergeData(
                    typeof childVal === 'function' ? childVal.call(this) : childVal,
                    typeof parentVal === 'function' ? parentVal.call(this) : parentVal
                )
            }
        } else if (parentVal || childVal) {
            return function mergedInstanceDataFn () {
                // instance merge
                var instanceData = typeof childVal === 'function'
                    ? childVal.call(vm)
                    : childVal;
                var defaultData = typeof parentVal === 'function'
                    ? parentVal.call(vm)
                    : parentVal;
                if (instanceData) {
                    return mergeData(instanceData, defaultData)
                } else {
                    return defaultData
                }
            }
        }
    }

    strats.data = function (
        parentVal,
        childVal,
        vm
    ) {
        if (!vm) {
            if (childVal && typeof childVal !== 'function') {
                "development" !== 'production' && warn(
                    'The "data" option should be a function ' +
                    'that returns a per-instance value in component ' +
                    'definitions.',
                    vm
                );

                return parentVal
            }
            return mergeDataOrFn.call(this, parentVal, childVal)
        }

        return mergeDataOrFn(parentVal, childVal, vm)
    };

/**
 * Hooks and props are merged as arrays.
 */
    function mergeHook (
        parentVal,
        childVal
    ) {
        return childVal
            ? parentVal
            ? parentVal.concat(childVal)
            : Array.isArray(childVal)
            ? childVal
            : [childVal]
            : parentVal
    }

    LIFECYCLE_HOOKS.forEach(function (hook) {
        strats[hook] = mergeHook;
    });

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
    function mergeAssets (
        parentVal,
        childVal,
        vm,
        key
    ) {
        var res = Object.create(parentVal || null);
        if (childVal) {
            "development" !== 'production' && assertObjectType(key, childVal, vm);
            return extend(res, childVal)
        } else {
            return res
        }
    }

    ASSET_TYPES.forEach(function (type) {
        strats[type + 's'] = mergeAssets;
    });

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
    strats.watch = function (
        parentVal,
        childVal,
        vm,
        key
    ) {
        // work around Firefox's Object.prototype.watch...
        if (parentVal === nativeWatch) { parentVal = undefined; }
        if (childVal === nativeWatch) { childVal = undefined; }
        /* istanbul ignore if */
        if (!childVal) { return Object.create(parentVal || null) }
        {
            assertObjectType(key, childVal, vm);
        }
        if (!parentVal) { return childVal }
        var ret = {};
        extend(ret, parentVal);
        for (var key$1 in childVal) {
            var parent = ret[key$1];
            var child = childVal[key$1];
            if (parent && !Array.isArray(parent)) {
                parent = [parent];
            }
            ret[key$1] = parent
                ? parent.concat(child)
                : Array.isArray(child) ? child : [child];
        }
        return ret
    };

/**
 * Other object hashes.
 */
    strats.props =
        strats.methods =
        strats.inject =
        strats.computed = function (
            parentVal,
            childVal,
            vm,
            key
        ) {
            if (childVal && "development" !== 'production') {
                assertObjectType(key, childVal, vm);
            }
            if (!parentVal) { return childVal }
            var ret = Object.create(null);
            extend(ret, parentVal);
            if (childVal) { extend(ret, childVal); }
            return ret
        };
    strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
    var defaultStrat = function (parentVal, childVal) {
        return childVal === undefined
            ? parentVal
            : childVal
    };

/**
 * Validate component names
 */
    function checkComponents (options) {
        for (var key in options.components) {
            var lower = key.toLowerCase();
            if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
                warn(
                    'Do not use built-in or reserved HTML elements as component ' +
                    'id: ' + key
                );
            }
        }
    }

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
    function normalizeProps (options, vm) {
        var props = options.props;
        if (!props) { return }
        var res = {};
        var i, val, name;
        if (Array.isArray(props)) {
            i = props.length;
            while (i--) {
                val = props[i];
                if (typeof val === 'string') {
                    name = camelize(val);
                    res[name] = { type: null };
                } else {
                    warn('props must be strings when using array syntax.');
                }
            }
        } else if (isPlainObject(props)) {
            for (var key in props) {
                val = props[key];
                name = camelize(key);
                res[name] = isPlainObject(val)
                    ? val
                    : { type: val };
            }
        } else {
            warn(
                "Invalid value for option \"props\": expected an Array or an Object, " +
                "but got " + (toRawType(props)) + ".",
                vm
            );
        }
        options.props = res;
    }

/**
 * Normalize all injections into Object-based format
 */
    function normalizeInject (options, vm) {
        var inject = options.inject;
        var normalized = options.inject = {};
        if (Array.isArray(inject)) {
            for (var i = 0; i < inject.length; i++) {
                normalized[inject[i]] = { from: inject[i] };
            }
        } else if (isPlainObject(inject)) {
            for (var key in inject) {
                var val = inject[key];
                normalized[key] = isPlainObject(val)
                    ? extend({ from: key }, val)
                    : { from: val };
            }
        } else if ("development" !== 'production' && inject) {
            warn(
                "Invalid value for option \"inject\": expected an Array or an Object, " +
                "but got " + (toRawType(inject)) + ".",
                vm
            );
        }
    }

/**
 * Normalize raw function directives into object format.
 */
    function normalizeDirectives (options) {
        var dirs = options.directives;
        if (dirs) {
            for (var key in dirs) {
                var def = dirs[key];
                if (typeof def === 'function') {
                    dirs[key] = { bind: def, update: def };
                }
            }
        }
    }

    function assertObjectType (name, value, vm) {
        if (!isPlainObject(value)) {
            warn(
                "Invalid value for option \"" + name + "\": expected an Object, " +
                "but got " + (toRawType(value)) + ".",
                vm
            );
        }
    }

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
    function mergeOptions (
        parent,
        child,
        vm
    ) {
        {
            checkComponents(child);
        }

        if (typeof child === 'function') {
            child = child.options;
        }

        normalizeProps(child, vm);
        normalizeInject(child, vm);
        normalizeDirectives(child);
        var extendsFrom = child.extends;
        if (extendsFrom) {
            parent = mergeOptions(parent, extendsFrom, vm);
        }
        if (child.mixins) {
            for (var i = 0, l = child.mixins.length; i < l; i++) {
                parent = mergeOptions(parent, child.mixins[i], vm);
            }
        }
        var options = {};
        var key;
        for (key in parent) {
            mergeField(key);
        }
        for (key in child) {
            if (!hasOwn(parent, key)) {
                mergeField(key);
            }
        }
        function mergeField (key) {
            var strat = strats[key] || defaultStrat;
            options[key] = strat(parent[key], child[key], vm, key);
        }
        return options
    }

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
    function resolveAsset (
        options,
        type,
        id,
        warnMissing
    ) {
        /* istanbul ignore if */
        if (typeof id !== 'string') {
            return
        }
        var assets = options[type];
        // check local registration variations first
        if (hasOwn(assets, id)) { return assets[id] }
        var camelizedId = camelize(id);
        if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
        var PascalCaseId = capitalize(camelizedId);
        if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
        // fallback to prototype chain
        var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
        if ("development" !== 'production' && warnMissing && !res) {
            warn(
                'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
                options
            );
        }
        return res
    }

/*  */

    function validateProp (
        key,
        propOptions,
        propsData,
        vm
    ) {
        var prop = propOptions[key];
        var absent = !hasOwn(propsData, key);
        var value = propsData[key];
        // handle boolean props
        if (isType(Boolean, prop.type)) {
            if (absent && !hasOwn(prop, 'default')) {
                value = false;
            } else if (!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
                value = true;
            }
        }
        // check default value
        if (value === undefined) {
            value = getPropDefaultValue(vm, prop, key);
            // since the default value is a fresh copy,
            // make sure to observe it.
            var prevShouldConvert = observerState.shouldConvert;
            observerState.shouldConvert = true;
            observe(value);
            observerState.shouldConvert = prevShouldConvert;
        }
        {
            assertProp(prop, key, value, vm, absent);
        }
        return value
    }

/**
 * Get the default value of a prop.
 */
    function getPropDefaultValue (vm, prop, key) {
        // no default, return undefined
        if (!hasOwn(prop, 'default')) {
            return undefined
        }
        var def = prop.default;
        // warn against non-factory defaults for Object & Array
        if ("development" !== 'production' && isObject(def)) {
            warn(
                'Invalid default value for prop "' + key + '": ' +
                'Props with type Object/Array must use a factory function ' +
                'to return the default value.',
                vm
            );
        }
        // the raw prop value was also undefined from previous render,
        // return previous default value to avoid unnecessary watcher trigger
        if (vm && vm.$options.propsData &&
            vm.$options.propsData[key] === undefined &&
            vm._props[key] !== undefined
        ) {
            return vm._props[key]
        }
        // call factory function for non-Function types
        // a value is Function if its prototype is function even across different execution context
        return typeof def === 'function' && getType(prop.type) !== 'Function'
            ? def.call(vm)
            : def
    }

/**
 * Assert whether a prop is valid.
 */
    function assertProp (
        prop,
        name,
        value,
        vm,
        absent
    ) {
        if (prop.required && absent) {
            warn(
                'Missing required prop: "' + name + '"',
                vm
            );
            return
        }
        if (value == null && !prop.required) {
            return
        }
        var type = prop.type;
        var valid = !type || type === true;
        var expectedTypes = [];
        if (type) {
            if (!Array.isArray(type)) {
                type = [type];
            }
            for (var i = 0; i < type.length && !valid; i++) {
                var assertedType = assertType(value, type[i]);
                expectedTypes.push(assertedType.expectedType || '');
                valid = assertedType.valid;
            }
        }
        if (!valid) {
            warn(
                "Invalid prop: type check failed for prop \"" + name + "\"." +
                " Expected " + (expectedTypes.map(capitalize).join(', ')) +
                ", got " + (toRawType(value)) + ".",
                vm
            );
            return
        }
        var validator = prop.validator;
        if (validator) {
            if (!validator(value)) {
                warn(
                    'Invalid prop: custom validator check failed for prop "' + name + '".',
                    vm
                );
            }
        }
    }

    var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

    function assertType (value, type) {
        var valid;
        var expectedType = getType(type);
        if (simpleCheckRE.test(expectedType)) {
            var t = typeof value;
            valid = t === expectedType.toLowerCase();
            // for primitive wrapper objects
            if (!valid && t === 'object') {
                valid = value instanceof type;
            }
        } else if (expectedType === 'Object') {
            valid = isPlainObject(value);
        } else if (expectedType === 'Array') {
            valid = Array.isArray(value);
        } else {
            valid = value instanceof type;
        }
        return {
            valid: valid,
            expectedType: expectedType
        }
    }

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
    function getType (fn) {
        var match = fn && fn.toString().match(/^\s*function (\w+)/);
        return match ? match[1] : ''
    }

    function isType (type, fn) {
        if (!Array.isArray(fn)) {
            return getType(fn) === getType(type)
        }
        for (var i = 0, len = fn.length; i < len; i++) {
            if (getType(fn[i]) === getType(type)) {
                return true
            }
        }
        /* istanbul ignore next */
        return false
    }

/*  */

    function handleError (err, vm, info) {
        if (vm) {
            var cur = vm;
            while ((cur = cur.$parent)) {
                var hooks = cur.$options.errorCaptured;
                if (hooks) {
                    for (var i = 0; i < hooks.length; i++) {
                        try {
                            var capture = hooks[i].call(cur, err, vm, info) === false;
                            if (capture) { return }
                        } catch (e) {
                            globalHandleError(e, cur, 'errorCaptured hook');
                        }
                    }
                }
            }
        }
        globalHandleError(err, vm, info);
    }

    function globalHandleError (err, vm, info) {
        if (config.errorHandler) {
            try {
                return config.errorHandler.call(null, err, vm, info)
            } catch (e) {
                logError(e, null, 'config.errorHandler');
            }
        }
        logError(err, vm, info);
    }

    function logError (err, vm, info) {
        {
            warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
        }
        /* istanbul ignore else */
        if (inBrowser && typeof console !== 'undefined') {
            console.error(err);
        } else {
            throw err
        }
    }

/*  */
/* globals MessageChannel */

    var callbacks = [];
    var pending = false;

    function flushCallbacks () {
        pending = false;
        var copies = callbacks.slice(0);
        callbacks.length = 0;
        for (var i = 0; i < copies.length; i++) {
            copies[i]();
        }
    }

// Here we have async deferring wrappers using both micro and macro tasks.
// In < 2.4 we used micro tasks everywhere, but there are some scenarios where
// micro tasks have too high a priority and fires in between supposedly
// sequential events (e.g. #4521, #6690) or even between bubbling of the same
// event (#6566). However, using macro tasks everywhere also has subtle problems
// when state is changed right before repaint (e.g. #6813, out-in transitions).
// Here we use micro task by default, but expose a way to force macro task when
// needed (e.g. in event handlers attached by v-on).
    var microTimerFunc;
    var macroTimerFunc;
    var useMacroTask = false;

// Determine (macro) Task defer implementation.
// Technically setImmediate should be the ideal choice, but it's only available
// in IE. The only polyfill that consistently queues the callback after all DOM
// events triggered in the same loop is by using MessageChannel.
/* istanbul ignore if */
    if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
        macroTimerFunc = function () {
            setImmediate(flushCallbacks);
        };
    } else if (typeof MessageChannel !== 'undefined' && (
        isNative(MessageChannel) ||
            // PhantomJS
            MessageChannel.toString() === '[object MessageChannelConstructor]'
    )) {
        var channel = new MessageChannel();
        var port = channel.port2;
        channel.port1.onmessage = flushCallbacks;
        macroTimerFunc = function () {
            port.postMessage(1);
        };
    } else {
        /* istanbul ignore next */
        macroTimerFunc = function () {
            setTimeout(flushCallbacks, 0);
        };
    }

// Determine MicroTask defer implementation.
/* istanbul ignore next, $flow-disable-line */
    if (typeof Promise !== 'undefined' && isNative(Promise)) {
        var p = Promise.resolve();
        microTimerFunc = function () {
            p.then(flushCallbacks);
            // in problematic UIWebViews, Promise.then doesn't completely break, but
            // it can get stuck in a weird state where callbacks are pushed into the
            // microtask queue but the queue isn't being flushed, until the browser
            // needs to do some other work, e.g. handle a timer. Therefore we can
            // "force" the microtask queue to be flushed by adding an empty timer.
            if (isIOS) { setTimeout(noop); }
        };
    } else {
        // fallback to macro
        microTimerFunc = macroTimerFunc;
    }

/**
 * Wrap a function so that if any code inside triggers state change,
 * the changes are queued using a Task instead of a MicroTask.
 */
    function withMacroTask (fn) {
        return fn._withTask || (fn._withTask = function () {
            useMacroTask = true;
            var res = fn.apply(null, arguments);
            useMacroTask = false;
            return res
        })
    }

    function nextTick (cb, ctx) {
        var _resolve;
        callbacks.push(function () {
            if (cb) {
                try {
                    cb.call(ctx);
                } catch (e) {
                    handleError(e, ctx, 'nextTick');
                }
            } else if (_resolve) {
                _resolve(ctx);
            }
        });
        if (!pending) {
            pending = true;
            if (useMacroTask) {
                macroTimerFunc();
            } else {
                microTimerFunc();
            }
        }
        // $flow-disable-line
        if (!cb && typeof Promise !== 'undefined') {
            return new Promise(function (resolve) {
                _resolve = resolve;
            })
        }
    }

/*  */

    var mark;
    var measure;

    {
        var perf = inBrowser && window.performance;
        /* istanbul ignore if */
        if (
            perf &&
                perf.mark &&
                perf.measure &&
                perf.clearMarks &&
                perf.clearMeasures
        ) {
            mark = function (tag) { return perf.mark(tag); };
            measure = function (name, startTag, endTag) {
                perf.measure(name, startTag, endTag);
                perf.clearMarks(startTag);
                perf.clearMarks(endTag);
                perf.clearMeasures(name);
            };
        }
    }

/* not type checking this file because flow doesn't play well with Proxy */

    var initProxy;

    {
        var allowedGlobals = makeMap(
            'Infinity,undefined,NaN,isFinite,isNaN,' +
            'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
            'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
            'require' // for Webpack/Browserify
        );

        var warnNonPresent = function (target, key) {
            warn(
                "Property or method \"" + key + "\" is not defined on the instance but " +
                'referenced during render. Make sure that this property is reactive, ' +
                'either in the data option, or for class-based components, by ' +
                'initializing the property. ' +
                'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
                target
            );
        };

        var hasProxy =
            typeof Proxy !== 'undefined' &&
                Proxy.toString().match(/native code/);

        if (hasProxy) {
            var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
            config.keyCodes = new Proxy(config.keyCodes, {
                set: function set (target, key, value) {
                    if (isBuiltInModifier(key)) {
                        warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
                        return false
                    } else {
                        target[key] = value;
                        return true
                    }
                }
            });
        }

        var hasHandler = {
            has: function has (target, key) {
                var has = key in target;
                var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
                if (!has && !isAllowed) {
                    warnNonPresent(target, key);
                }
                return has || !isAllowed
            }
        };

        var getHandler = {
            get: function get (target, key) {
                if (typeof key === 'string' && !(key in target)) {
                    warnNonPresent(target, key);
                }
                return target[key]
            }
        };

        initProxy = function initProxy (vm) {
            if (hasProxy) {
                // determine which proxy handler to use
                var options = vm.$options;
                var handlers = options.render && options.render._withStripped
                    ? getHandler
                    : hasHandler;
                vm._renderProxy = new Proxy(vm, handlers);
            } else {
                vm._renderProxy = vm;
            }
        };
    }

/*  */

    var normalizeEvent = cached(function (name) {
        var passive = name.charAt(0) === '&';
        name = passive ? name.slice(1) : name;
        var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
        name = once$$1 ? name.slice(1) : name;
        var capture = name.charAt(0) === '!';
        name = capture ? name.slice(1) : name;
        return {
            name: name,
            once: once$$1,
            capture: capture,
            passive: passive
        }
    });

    function createFnInvoker (fns) {
        function invoker () {
            var arguments$1 = arguments;

            var fns = invoker.fns;
            if (Array.isArray(fns)) {
                var cloned = fns.slice();
                for (var i = 0; i < cloned.length; i++) {
                    cloned[i].apply(null, arguments$1);
                }
            } else {
                // return handler return value for single handlers
                return fns.apply(null, arguments)
            }
        }
        invoker.fns = fns;
        return invoker
    }

    function updateListeners (
        on,
        oldOn,
        add,
        remove$$1,
        vm
    ) {
        var name, cur, old, event;
        for (name in on) {
            cur = on[name];
            old = oldOn[name];
            event = normalizeEvent(name);
            if (isUndef(cur)) {
                "development" !== 'production' && warn(
                    "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
                    vm
                );
            } else if (isUndef(old)) {
                if (isUndef(cur.fns)) {
                    cur = on[name] = createFnInvoker(cur);
                }
                add(event.name, cur, event.once, event.capture, event.passive);
            } else if (cur !== old) {
                old.fns = cur;
                on[name] = old;
            }
        }
        for (name in oldOn) {
            if (isUndef(on[name])) {
                event = normalizeEvent(name);
                remove$$1(event.name, oldOn[name], event.capture);
            }
        }
    }

/*  */

    function mergeVNodeHook (def, hookKey, hook) {
        var invoker;
        var oldHook = def[hookKey];

        function wrappedHook () {
            hook.apply(this, arguments);
            // important: remove merged hook to ensure it's called only once
            // and prevent memory leak
            remove(invoker.fns, wrappedHook);
        }

        if (isUndef(oldHook)) {
            // no existing hook
            invoker = createFnInvoker([wrappedHook]);
        } else {
            /* istanbul ignore if */
            if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
                // already a merged invoker
                invoker = oldHook;
                invoker.fns.push(wrappedHook);
            } else {
                // existing plain hook
                invoker = createFnInvoker([oldHook, wrappedHook]);
            }
        }

        invoker.merged = true;
        def[hookKey] = invoker;
    }

/*  */

    function extractPropsFromVNodeData (
        data,
        Ctor,
        tag
    ) {
        // we are only extracting raw values here.
        // validation and default values are handled in the child
        // component itself.
        var propOptions = Ctor.options.props;
        if (isUndef(propOptions)) {
            return
        }
        var res = {};
        var attrs = data.attrs;
        var props = data.props;
        if (isDef(attrs) || isDef(props)) {
            for (var key in propOptions) {
                var altKey = hyphenate(key);
                {
                    var keyInLowerCase = key.toLowerCase();
                    if (
                        key !== keyInLowerCase &&
                            attrs && hasOwn(attrs, keyInLowerCase)
                    ) {
                        tip(
                            "Prop \"" + keyInLowerCase + "\" is passed to component " +
                            (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
                            " \"" + key + "\". " +
                            "Note that HTML attributes are case-insensitive and camelCased " +
                            "props need to use their kebab-case equivalents when using in-DOM " +
                            "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
                        );
                    }
                }
                checkProp(res, props, key, altKey, true) ||
                    checkProp(res, attrs, key, altKey, false);
            }
        }
        return res
    }

    function checkProp (
        res,
        hash,
        key,
        altKey,
        preserve
    ) {
        if (isDef(hash)) {
            if (hasOwn(hash, key)) {
                res[key] = hash[key];
                if (!preserve) {
                    delete hash[key];
                }
                return true
            } else if (hasOwn(hash, altKey)) {
                res[key] = hash[altKey];
                if (!preserve) {
                    delete hash[altKey];
                }
                return true
            }
        }
        return false
    }

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
    function simpleNormalizeChildren (children) {
        for (var i = 0; i < children.length; i++) {
            if (Array.isArray(children[i])) {
                return Array.prototype.concat.apply([], children)
            }
        }
        return children
    }

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
    function normalizeChildren (children) {
        return isPrimitive(children)
            ? [createTextVNode(children)]
            : Array.isArray(children)
            ? normalizeArrayChildren(children)
            : undefined
    }

    function isTextNode (node) {
        return isDef(node) && isDef(node.text) && isFalse(node.isComment)
    }

    function normalizeArrayChildren (children, nestedIndex) {
        var res = [];
        var i, c, lastIndex, last;
        for (i = 0; i < children.length; i++) {
            c = children[i];
            if (isUndef(c) || typeof c === 'boolean') { continue }
            lastIndex = res.length - 1;
            last = res[lastIndex];
            //  nested
            if (Array.isArray(c)) {
                if (c.length > 0) {
                    c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
                    // merge adjacent text nodes
                    if (isTextNode(c[0]) && isTextNode(last)) {
                        res[lastIndex] = createTextVNode(last.text + (c[0]).text);
                        c.shift();
                    }
                    res.push.apply(res, c);
                }
            } else if (isPrimitive(c)) {
                if (isTextNode(last)) {
                    // merge adjacent text nodes
                    // this is necessary for SSR hydration because text nodes are
                    // essentially merged when rendered to HTML strings
                    res[lastIndex] = createTextVNode(last.text + c);
                } else if (c !== '') {
                    // convert primitive to vnode
                    res.push(createTextVNode(c));
                }
            } else {
                if (isTextNode(c) && isTextNode(last)) {
                    // merge adjacent text nodes
                    res[lastIndex] = createTextVNode(last.text + c.text);
                } else {
                    // default key for nested array children (likely generated by v-for)
                    if (isTrue(children._isVList) &&
                        isDef(c.tag) &&
                        isUndef(c.key) &&
                        isDef(nestedIndex)) {
                        c.key = "__vlist" + nestedIndex + "_" + i + "__";
                    }
                    res.push(c);
                }
            }
        }
        return res
    }

/*  */

    function ensureCtor (comp, base) {
        if (
            comp.__esModule ||
                (hasSymbol && comp[Symbol.toStringTag] === 'Module')
        ) {
            comp = comp.default;
        }
        return isObject(comp)
            ? base.extend(comp)
            : comp
    }

    function createAsyncPlaceholder (
        factory,
        data,
        context,
        children,
        tag
    ) {
        var node = createEmptyVNode();
        node.asyncFactory = factory;
        node.asyncMeta = { data: data, context: context, children: children, tag: tag };
        return node
    }

    function resolveAsyncComponent (
        factory,
        baseCtor,
        context
    ) {
        if (isTrue(factory.error) && isDef(factory.errorComp)) {
            return factory.errorComp
        }

        if (isDef(factory.resolved)) {
            return factory.resolved
        }

        if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
            return factory.loadingComp
        }

        if (isDef(factory.contexts)) {
            // already pending
            factory.contexts.push(context);
        } else {
            var contexts = factory.contexts = [context];
            var sync = true;

            var forceRender = function () {
                for (var i = 0, l = contexts.length; i < l; i++) {
                    contexts[i].$forceUpdate();
                }
            };

            var resolve = once(function (res) {
                // cache resolved
                factory.resolved = ensureCtor(res, baseCtor);
                // invoke callbacks only if this is not a synchronous resolve
                // (async resolves are shimmed as synchronous during SSR)
                if (!sync) {
                    forceRender();
                }
            });

            var reject = once(function (reason) {
                "development" !== 'production' && warn(
                    "Failed to resolve async component: " + (String(factory)) +
                    (reason ? ("\nReason: " + reason) : '')
                );
                if (isDef(factory.errorComp)) {
                    factory.error = true;
                    forceRender();
                }
            });

            var res = factory(resolve, reject);

            if (isObject(res)) {
                if (typeof res.then === 'function') {
                    // () => Promise
                    if (isUndef(factory.resolved)) {
                        res.then(resolve, reject);
                    }
                } else if (isDef(res.component) && typeof res.component.then === 'function') {
                    res.component.then(resolve, reject);

                    if (isDef(res.error)) {
                        factory.errorComp = ensureCtor(res.error, baseCtor);
                    }

                    if (isDef(res.loading)) {
                        factory.loadingComp = ensureCtor(res.loading, baseCtor);
                        if (res.delay === 0) {
                            factory.loading = true;
                        } else {
                            setTimeout(function () {
                                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                                    factory.loading = true;
                                    forceRender();
                                }
                            }, res.delay || 200);
                        }
                    }

                    if (isDef(res.timeout)) {
                        setTimeout(function () {
                            if (isUndef(factory.resolved)) {
                                reject(
                                    "timeout (" + (res.timeout) + "ms)"
                                );
                            }
                        }, res.timeout);
                    }
                }
            }

            sync = false;
            // return in case resolved synchronously
            return factory.loading
                ? factory.loadingComp
                : factory.resolved
        }
    }

/*  */

    function isAsyncPlaceholder (node) {
        return node.isComment && node.asyncFactory
    }

/*  */

    function getFirstComponentChild (children) {
        if (Array.isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                var c = children[i];
                if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
                    return c
                }
            }
        }
    }

/*  */

/*  */

    function initEvents (vm) {
        vm._events = Object.create(null);
        vm._hasHookEvent = false;
        // init parent attached events
        var listeners = vm.$options._parentListeners;
        if (listeners) {
            updateComponentListeners(vm, listeners);
        }
    }

    var target;

    function add (event, fn, once) {
        if (once) {
            target.$once(event, fn);
        } else {
            target.$on(event, fn);
        }
    }

    function remove$1 (event, fn) {
        target.$off(event, fn);
    }

    function updateComponentListeners (
        vm,
        listeners,
        oldListeners
    ) {
        target = vm;
        updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
    }

    function eventsMixin (Vue) {
        var hookRE = /^hook:/;
        Vue.prototype.$on = function (event, fn) {
            var this$1 = this;

            var vm = this;
            if (Array.isArray(event)) {
                for (var i = 0, l = event.length; i < l; i++) {
                    this$1.$on(event[i], fn);
                }
            } else {
                (vm._events[event] || (vm._events[event] = [])).push(fn);
                // optimize hook:event cost by using a boolean flag marked at registration
                // instead of a hash lookup
                if (hookRE.test(event)) {
                    vm._hasHookEvent = true;
                }
            }
            return vm
        };

        Vue.prototype.$once = function (event, fn) {
            var vm = this;
            function on () {
                vm.$off(event, on);
                fn.apply(vm, arguments);
            }
            on.fn = fn;
            vm.$on(event, on);
            return vm
        };

        Vue.prototype.$off = function (event, fn) {
            var this$1 = this;

            var vm = this;
            // all
            if (!arguments.length) {
                vm._events = Object.create(null);
                return vm
            }
            // array of events
            if (Array.isArray(event)) {
                for (var i = 0, l = event.length; i < l; i++) {
                    this$1.$off(event[i], fn);
                }
                return vm
            }
            // specific event
            var cbs = vm._events[event];
            if (!cbs) {
                return vm
            }
            if (arguments.length === 1) {
                vm._events[event] = null;
                return vm
            }
            if (fn) {
                // specific handler
                var cb;
                var i$1 = cbs.length;
                while (i$1--) {
                    cb = cbs[i$1];
                    if (cb === fn || cb.fn === fn) {
                        cbs.splice(i$1, 1);
                        break
                    }
                }
            }
            return vm
        };

        Vue.prototype.$emit = function (event) {
            var vm = this;
            {
                var lowerCaseEvent = event.toLowerCase();
                if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
                    tip(
                        "Event \"" + lowerCaseEvent + "\" is emitted in component " +
                        (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
                        "Note that HTML attributes are case-insensitive and you cannot use " +
                        "v-on to listen to camelCase events when using in-DOM templates. " +
                        "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
                    );
                }
            }
            var cbs = vm._events[event];
            if (cbs) {
                cbs = cbs.length > 1 ? toArray(cbs) : cbs;
                var args = toArray(arguments, 1);
                for (var i = 0, l = cbs.length; i < l; i++) {
                    try {
                        cbs[i].apply(vm, args);
                    } catch (e) {
                        handleError(e, vm, ("event handler for \"" + event + "\""));
                    }
                }
            }
            return vm
        };
    }

/*  */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
    function resolveSlots (
        children,
        context
    ) {
        var slots = {};
        if (!children) {
            return slots
        }
        var defaultSlot = [];
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            var data = child.data;
            // remove slot attribute if the node is resolved as a Vue slot node
            if (data && data.attrs && data.attrs.slot) {
                delete data.attrs.slot;
            }
            // named slots should only be respected if the vnode was rendered in the
            // same context.
            if ((child.context === context || child.functionalContext === context) &&
                data && data.slot != null
            ) {
                var name = child.data.slot;
                var slot = (slots[name] || (slots[name] = []));
                if (child.tag === 'template') {
                    slot.push.apply(slot, child.children);
                } else {
                    slot.push(child);
                }
            } else {
                defaultSlot.push(child);
            }
        }
        // ignore whitespace
        if (!defaultSlot.every(isWhitespace)) {
            slots.default = defaultSlot;
        }
        return slots
    }

    function isWhitespace (node) {
        return node.isComment || node.text === ' '
    }

    function resolveScopedSlots (
        fns, // see flow/vnode
        res
    ) {
        res = res || {};
        for (var i = 0; i < fns.length; i++) {
            if (Array.isArray(fns[i])) {
                resolveScopedSlots(fns[i], res);
            } else {
                res[fns[i].key] = fns[i].fn;
            }
        }
        return res
    }

/*  */

    var activeInstance = null;
    var isUpdatingChildComponent = false;

    function initLifecycle (vm) {
        var options = vm.$options;

        // locate first non-abstract parent
        var parent = options.parent;
        if (parent && !options.abstract) {
            while (parent.$options.abstract && parent.$parent) {
                parent = parent.$parent;
            }
            parent.$children.push(vm);
        }

        vm.$parent = parent;
        vm.$root = parent ? parent.$root : vm;

        vm.$children = [];
        vm.$refs = {};

        vm._watcher = null;
        vm._inactive = null;
        vm._directInactive = false;
        vm._isMounted = false;
        vm._isDestroyed = false;
        vm._isBeingDestroyed = false;
    }

    function lifecycleMixin (Vue) {
        Vue.prototype._update = function (vnode, hydrating) {
            var vm = this;
            if (vm._isMounted) {
                callHook(vm, 'beforeUpdate');
            }
            var prevEl = vm.$el;
            var prevVnode = vm._vnode;
            var prevActiveInstance = activeInstance;
            activeInstance = vm;
            vm._vnode = vnode;
            // Vue.prototype.__patch__ is injected in entry points
            // based on the rendering backend used.
            if (!prevVnode) {
                // initial render
                vm.$el = vm.__patch__(
                    vm.$el, vnode, hydrating, false /* removeOnly */,
                    vm.$options._parentElm,
                    vm.$options._refElm
                );
                // no need for the ref nodes after initial patch
                // this prevents keeping a detached DOM tree in memory (#5851)
                vm.$options._parentElm = vm.$options._refElm = null;
            } else {
                // updates
                vm.$el = vm.__patch__(prevVnode, vnode);
            }
            activeInstance = prevActiveInstance;
            // update __vue__ reference
            if (prevEl) {
                prevEl.__vue__ = null;
            }
            if (vm.$el) {
                vm.$el.__vue__ = vm;
            }
            // if parent is an HOC, update its $el as well
            if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
                vm.$parent.$el = vm.$el;
            }
            // updated hook is called by the scheduler to ensure that children are
            // updated in a parent's updated hook.
        };

        Vue.prototype.$forceUpdate = function () {
            var vm = this;
            if (vm._watcher) {
                vm._watcher.update();
            }
        };

        Vue.prototype.$destroy = function () {
            var vm = this;
            if (vm._isBeingDestroyed) {
                return
            }
            callHook(vm, 'beforeDestroy');
            vm._isBeingDestroyed = true;
            // remove self from parent
            var parent = vm.$parent;
            if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
                remove(parent.$children, vm);
            }
            // teardown watchers
            if (vm._watcher) {
                vm._watcher.teardown();
            }
            var i = vm._watchers.length;
            while (i--) {
                vm._watchers[i].teardown();
            }
            // remove reference from data ob
            // frozen object may not have observer.
            if (vm._data.__ob__) {
                vm._data.__ob__.vmCount--;
            }
            // call the last hook...
            vm._isDestroyed = true;
            // invoke destroy hooks on current rendered tree
            vm.__patch__(vm._vnode, null);
            // fire destroyed hook
            callHook(vm, 'destroyed');
            // turn off all instance listeners.
            vm.$off();
            // remove __vue__ reference
            if (vm.$el) {
                vm.$el.__vue__ = null;
            }
            // release circular reference (#6759)
            if (vm.$vnode) {
                vm.$vnode.parent = null;
            }
        };
    }

    function mountComponent (
        vm,
        el,
        hydrating
    ) {
        vm.$el = el;
        if (!vm.$options.render) {
            vm.$options.render = createEmptyVNode;
            {
                /* istanbul ignore if */
                if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
                    vm.$options.el || el) {
                    warn(
                        'You are using the runtime-only build of Vue where the template ' +
                        'compiler is not available. Either pre-compile the templates into ' +
                        'render functions, or use the compiler-included build.',
                        vm
                    );
                } else {
                    warn(
                        'Failed to mount component: template or render function not defined.',
                        vm
                    );
                }
            }
        }
        callHook(vm, 'beforeMount');

        var updateComponent;
        /* istanbul ignore if */
        if ("development" !== 'production' && config.performance && mark) {
            updateComponent = function () {
                var name = vm._name;
                var id = vm._uid;
                var startTag = "vue-perf-start:" + id;
                var endTag = "vue-perf-end:" + id;

                mark(startTag);
                var vnode = vm._render();
                mark(endTag);
                measure(("vue " + name + " render"), startTag, endTag);

                mark(startTag);
                vm._update(vnode, hydrating);
                mark(endTag);
                measure(("vue " + name + " patch"), startTag, endTag);
            };
        } else {
            updateComponent = function () {
                vm._update(vm._render(), hydrating);
            };
        }

        vm._watcher = new Watcher(vm, updateComponent, noop);
        hydrating = false;

        // manually mounted instance, call mounted on self
        // mounted is called for render-created child components in its inserted hook
        if (vm.$vnode == null) {
            vm._isMounted = true;
            callHook(vm, 'mounted');
        }
        return vm
    }

    function updateChildComponent (
        vm,
        propsData,
        listeners,
        parentVnode,
        renderChildren
    ) {
        {
            isUpdatingChildComponent = true;
        }

        // determine whether component has slot children
        // we need to do this before overwriting $options._renderChildren
        var hasChildren = !!(
            renderChildren ||               // has new static slots
                vm.$options._renderChildren ||  // has old static slots
                parentVnode.data.scopedSlots || // has new scoped slots
                vm.$scopedSlots !== emptyObject // has old scoped slots
        );

        vm.$options._parentVnode = parentVnode;
        vm.$vnode = parentVnode; // update vm's placeholder node without re-render

        if (vm._vnode) { // update child tree's parent
            vm._vnode.parent = parentVnode;
        }
        vm.$options._renderChildren = renderChildren;

        // update $attrs and $listeners hash
        // these are also reactive so they may trigger child update if the child
        // used them during render
        vm.$attrs = (parentVnode.data && parentVnode.data.attrs) || emptyObject;
        vm.$listeners = listeners || emptyObject;

        // update props
        if (propsData && vm.$options.props) {
            observerState.shouldConvert = false;
            var props = vm._props;
            var propKeys = vm.$options._propKeys || [];
            for (var i = 0; i < propKeys.length; i++) {
                var key = propKeys[i];
                props[key] = validateProp(key, vm.$options.props, propsData, vm);
            }
            observerState.shouldConvert = true;
            // keep a copy of raw propsData
            vm.$options.propsData = propsData;
        }

        // update listeners
        if (listeners) {
            var oldListeners = vm.$options._parentListeners;
            vm.$options._parentListeners = listeners;
            updateComponentListeners(vm, listeners, oldListeners);
        }
        // resolve slots + force update if has children
        if (hasChildren) {
            vm.$slots = resolveSlots(renderChildren, parentVnode.context);
            vm.$forceUpdate();
        }

        {
            isUpdatingChildComponent = false;
        }
    }

    function isInInactiveTree (vm) {
        while (vm && (vm = vm.$parent)) {
            if (vm._inactive) { return true }
        }
        return false
    }

    function activateChildComponent (vm, direct) {
        if (direct) {
            vm._directInactive = false;
            if (isInInactiveTree(vm)) {
                return
            }
        } else if (vm._directInactive) {
            return
        }
        if (vm._inactive || vm._inactive === null) {
            vm._inactive = false;
            for (var i = 0; i < vm.$children.length; i++) {
                activateChildComponent(vm.$children[i]);
            }
            callHook(vm, 'activated');
        }
    }

    function deactivateChildComponent (vm, direct) {
        if (direct) {
            vm._directInactive = true;
            if (isInInactiveTree(vm)) {
                return
            }
        }
        if (!vm._inactive) {
            vm._inactive = true;
            for (var i = 0; i < vm.$children.length; i++) {
                deactivateChildComponent(vm.$children[i]);
            }
            callHook(vm, 'deactivated');
        }
    }

    function callHook (vm, hook) {
        var handlers = vm.$options[hook];
        if (handlers) {
            for (var i = 0, j = handlers.length; i < j; i++) {
                try {
                    handlers[i].call(vm);
                } catch (e) {
                    handleError(e, vm, (hook + " hook"));
                }
            }
        }
        if (vm._hasHookEvent) {
            vm.$emit('hook:' + hook);
        }
    }

/*  */


    var MAX_UPDATE_COUNT = 100;

    var queue = [];
    var activatedChildren = [];
    var has = {};
    var circular = {};
    var waiting = false;
    var flushing = false;
    var index = 0;

/**
 * Reset the scheduler's state.
 */
    function resetSchedulerState () {
        index = queue.length = activatedChildren.length = 0;
        has = {};
        {
            circular = {};
        }
        waiting = flushing = false;
    }

/**
 * Flush both queues and run the watchers.
 */
    function flushSchedulerQueue () {
        flushing = true;
        var watcher, id;

        // Sort queue before flush.
        // This ensures that:
        // 1. Components are updated from parent to child. (because parent is always
        //    created before the child)
        // 2. A component's user watchers are run before its render watcher (because
        //    user watchers are created before the render watcher)
        // 3. If a component is destroyed during a parent component's watcher run,
        //    its watchers can be skipped.
        queue.sort(function (a, b) { return a.id - b.id; });

        // do not cache length because more watchers might be pushed
        // as we run existing watchers
        for (index = 0; index < queue.length; index++) {
            watcher = queue[index];
            id = watcher.id;
            has[id] = null;
            watcher.run();
            // in dev build, check and stop circular updates.
            if ("development" !== 'production' && has[id] != null) {
                circular[id] = (circular[id] || 0) + 1;
                if (circular[id] > MAX_UPDATE_COUNT) {
                    warn(
                        'You may have an infinite update loop ' + (
                            watcher.user
                                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                                : "in a component render function."
                        ),
                        watcher.vm
                    );
                    break
                }
            }
        }

        // keep copies of post queues before resetting state
        var activatedQueue = activatedChildren.slice();
        var updatedQueue = queue.slice();

        resetSchedulerState();

        // call component updated and activated hooks
        callActivatedHooks(activatedQueue);
        callUpdatedHooks(updatedQueue);

        // devtool hook
        /* istanbul ignore if */
        if (devtools && config.devtools) {
            devtools.emit('flush');
        }
    }

    function callUpdatedHooks (queue) {
        var i = queue.length;
        while (i--) {
            var watcher = queue[i];
            var vm = watcher.vm;
            if (vm._watcher === watcher && vm._isMounted) {
                callHook(vm, 'updated');
            }
        }
    }

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
    function queueActivatedComponent (vm) {
        // setting _inactive to false here so that a render function can
        // rely on checking whether it's in an inactive tree (e.g. router-view)
        vm._inactive = false;
        activatedChildren.push(vm);
    }

    function callActivatedHooks (queue) {
        for (var i = 0; i < queue.length; i++) {
            queue[i]._inactive = true;
            activateChildComponent(queue[i], true /* true */);
        }
    }

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
    function queueWatcher (watcher) {
        var id = watcher.id;
        if (has[id] == null) {
            has[id] = true;
            if (!flushing) {
                queue.push(watcher);
            } else {
                // if already flushing, splice the watcher based on its id
                // if already past its id, it will be run next immediately.
                var i = queue.length - 1;
                while (i > index && queue[i].id > watcher.id) {
                    i--;
                }
                queue.splice(i + 1, 0, watcher);
            }
            // queue the flush
            if (!waiting) {
                waiting = true;
                nextTick(flushSchedulerQueue);
            }
        }
    }

/*  */

    var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
    var Watcher = function Watcher (
        vm,
        expOrFn,
        cb,
        options
    ) {
        this.vm = vm;
        vm._watchers.push(this);
        // options
        if (options) {
            this.deep = !!options.deep;
            this.user = !!options.user;
            this.lazy = !!options.lazy;
            this.sync = !!options.sync;
        } else {
            this.deep = this.user = this.lazy = this.sync = false;
        }
        this.cb = cb;
        this.id = ++uid$2; // uid for batching
        this.active = true;
        this.dirty = this.lazy; // for lazy watchers
        this.deps = [];
        this.newDeps = [];
        this.depIds = new _Set();
        this.newDepIds = new _Set();
        this.expression = expOrFn.toString();
        // parse expression for getter
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            this.getter = parsePath(expOrFn);
            if (!this.getter) {
                this.getter = function () {};
                "development" !== 'production' && warn(
                    "Failed watching path: \"" + expOrFn + "\" " +
                    'Watcher only accepts simple dot-delimited paths. ' +
                    'For full control, use a function instead.',
                    vm
                );
            }
        }
        this.value = this.lazy
            ? undefined
            : this.get();
    };

/**
 * Evaluate the getter, and re-collect dependencies.
 */
    Watcher.prototype.get = function get () {
        pushTarget(this);
        var value;
        var vm = this.vm;
        try {
            value = this.getter.call(vm, vm);
        } catch (e) {
            if (this.user) {
                handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
            } else {
                throw e
            }
        } finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            if (this.deep) {
                traverse(value);
            }
            popTarget();
            this.cleanupDeps();
        }
        return value
    };

/**
 * Add a dependency to this directive.
 */
    Watcher.prototype.addDep = function addDep (dep) {
        var id = dep.id;
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if (!this.depIds.has(id)) {
                dep.addSub(this);
            }
        }
    };

/**
 * Clean up for dependency collection.
 */
    Watcher.prototype.cleanupDeps = function cleanupDeps () {
        var this$1 = this;

        var i = this.deps.length;
        while (i--) {
            var dep = this$1.deps[i];
            if (!this$1.newDepIds.has(dep.id)) {
                dep.removeSub(this$1);
            }
        }
        var tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        this.newDeps.length = 0;
    };

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
    Watcher.prototype.update = function update () {
        /* istanbul ignore else */
        if (this.lazy) {
            this.dirty = true;
        } else if (this.sync) {
            this.run();
        } else {
            queueWatcher(this);
        }
    };

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
    Watcher.prototype.run = function run () {
        if (this.active) {
            var value = this.get();
            if (
                value !== this.value ||
                    // Deep watchers and watchers on Object/Arrays should fire even
                    // when the value is the same, because the value may
                    // have mutated.
                    isObject(value) ||
                    this.deep
            ) {
                // set new value
                var oldValue = this.value;
                this.value = value;
                if (this.user) {
                    try {
                        this.cb.call(this.vm, value, oldValue);
                    } catch (e) {
                        handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
                    }
                } else {
                    this.cb.call(this.vm, value, oldValue);
                }
            }
        }
    };

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
    Watcher.prototype.evaluate = function evaluate () {
        this.value = this.get();
        this.dirty = false;
    };

/**
 * Depend on all deps collected by this watcher.
 */
    Watcher.prototype.depend = function depend () {
        var this$1 = this;

        var i = this.deps.length;
        while (i--) {
            this$1.deps[i].depend();
        }
    };

/**
 * Remove self from all dependencies' subscriber list.
 */
    Watcher.prototype.teardown = function teardown () {
        var this$1 = this;

        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            if (!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this);
            }
            var i = this.deps.length;
            while (i--) {
                this$1.deps[i].removeSub(this$1);
            }
            this.active = false;
        }
    };

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
    var seenObjects = new _Set();
    function traverse (val) {
        seenObjects.clear();
        _traverse(val, seenObjects);
    }

    function _traverse (val, seen) {
        var i, keys;
        var isA = Array.isArray(val);
        if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
            return
        }
        if (val.__ob__) {
            var depId = val.__ob__.dep.id;
            if (seen.has(depId)) {
                return
            }
            seen.add(depId);
        }
        if (isA) {
            i = val.length;
            while (i--) { _traverse(val[i], seen); }
        } else {
            keys = Object.keys(val);
            i = keys.length;
            while (i--) { _traverse(val[keys[i]], seen); }
        }
    }

/*  */

    var sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop
    };

    function proxy (target, sourceKey, key) {
        sharedPropertyDefinition.get = function proxyGetter () {
            return this[sourceKey][key]
        };
        sharedPropertyDefinition.set = function proxySetter (val) {
            this[sourceKey][key] = val;
        };
        Object.defineProperty(target, key, sharedPropertyDefinition);
    }

    function initState (vm) {
        vm._watchers = [];
        var opts = vm.$options;
        if (opts.props) { initProps(vm, opts.props); }
        if (opts.methods) { initMethods(vm, opts.methods); }
        if (opts.data) {
            initData(vm);
        } else {
            observe(vm._data = {}, true /* asRootData */);
        }
        if (opts.computed) { initComputed(vm, opts.computed); }
        if (opts.watch && opts.watch !== nativeWatch) {
            initWatch(vm, opts.watch);
        }
    }

    function initProps (vm, propsOptions) {
        var propsData = vm.$options.propsData || {};
        var props = vm._props = {};
        // cache prop keys so that future props updates can iterate using Array
        // instead of dynamic object key enumeration.
        var keys = vm.$options._propKeys = [];
        var isRoot = !vm.$parent;
        // root instance props should be converted
        observerState.shouldConvert = isRoot;
        var loop = function ( key ) {
            keys.push(key);
            var value = validateProp(key, propsOptions, propsData, vm);
            /* istanbul ignore else */
            {
                var hyphenatedKey = hyphenate(key);
                if (isReservedAttribute(hyphenatedKey) ||
                    config.isReservedAttr(hyphenatedKey)) {
                    warn(
                        ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
                        vm
                    );
                }
                defineReactive(props, key, value, function () {
                    if (vm.$parent && !isUpdatingChildComponent) {
                        warn(
                            "Avoid mutating a prop directly since the value will be " +
                            "overwritten whenever the parent component re-renders. " +
                            "Instead, use a data or computed property based on the prop's " +
                            "value. Prop being mutated: \"" + key + "\"",
                            vm
                        );
                    }
                });
            }
            // static props are already proxied on the component's prototype
            // during Vue.extend(). We only need to proxy props defined at
            // instantiation here.
            if (!(key in vm)) {
                proxy(vm, "_props", key);
            }
        };

        for (var key in propsOptions) loop( key );
        observerState.shouldConvert = true;
    }

    function initData (vm) {
        var data = vm.$options.data;
        data = vm._data = typeof data === 'function'
            ? getData(data, vm)
            : data || {};
        if (!isPlainObject(data)) {
            data = {};
            "development" !== 'production' && warn(
                'data functions should return an object:\n' +
                'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
                vm
            );
        }
        // proxy data on instance
        var keys = Object.keys(data);
        var props = vm.$options.props;
        var methods = vm.$options.methods;
        var i = keys.length;
        while (i--) {
            var key = keys[i];
            {
                if (methods && hasOwn(methods, key)) {
                    warn(
                        ("Method \"" + key + "\" has already been defined as a data property."),
                        vm
                    );
                }
            }
            if (props && hasOwn(props, key)) {
                "development" !== 'production' && warn(
                    "The data property \"" + key + "\" is already declared as a prop. " +
                    "Use prop default value instead.",
                    vm
                );
            } else if (!isReserved(key)) {
                proxy(vm, "_data", key);
            }
        }
        // observe data
        observe(data, true /* asRootData */);
    }

    function getData (data, vm) {
        try {
            return data.call(vm, vm)
        } catch (e) {
            handleError(e, vm, "data()");
            return {}
        }
    }

    var computedWatcherOptions = { lazy: true };

    function initComputed (vm, computed) {
        var watchers = vm._computedWatchers = Object.create(null);
        // computed properties are just getters during SSR
        var isSSR = isServerRendering();

        for (var key in computed) {
            var userDef = computed[key];
            var getter = typeof userDef === 'function' ? userDef : userDef.get;
            if ("development" !== 'production' && getter == null) {
                warn(
                    ("Getter is missing for computed property \"" + key + "\"."),
                    vm
                );
            }

            if (!isSSR) {
                // create internal watcher for the computed property.
                watchers[key] = new Watcher(
                    vm,
                    getter || noop,
                    noop,
                    computedWatcherOptions
                );
            }

            // component-defined computed properties are already defined on the
            // component prototype. We only need to define computed properties defined
            // at instantiation here.
            if (!(key in vm)) {
                defineComputed(vm, key, userDef);
            } else {
                if (key in vm.$data) {
                    warn(("The computed property \"" + key + "\" is already defined in data."), vm);
                } else if (vm.$options.props && key in vm.$options.props) {
                    warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
                }
            }
        }
    }

    function defineComputed (
        target,
        key,
        userDef
    ) {
        var shouldCache = !isServerRendering();
        if (typeof userDef === 'function') {
            sharedPropertyDefinition.get = shouldCache
                ? createComputedGetter(key)
                : userDef;
            sharedPropertyDefinition.set = noop;
        } else {
            sharedPropertyDefinition.get = userDef.get
                ? shouldCache && userDef.cache !== false
                ? createComputedGetter(key)
                : userDef.get
                : noop;
            sharedPropertyDefinition.set = userDef.set
                ? userDef.set
                : noop;
        }
        if ("development" !== 'production' &&
            sharedPropertyDefinition.set === noop) {
            sharedPropertyDefinition.set = function () {
                warn(
                    ("Computed property \"" + key + "\" was assigned to but it has no setter."),
                    this
                );
            };
        }
        Object.defineProperty(target, key, sharedPropertyDefinition);
    }

    function createComputedGetter (key) {
        return function computedGetter () {
            var watcher = this._computedWatchers && this._computedWatchers[key];
            if (watcher) {
                if (watcher.dirty) {
                    watcher.evaluate();
                }
                if (Dep.target) {
                    watcher.depend();
                }
                return watcher.value
            }
        }
    }

    function initMethods (vm, methods) {
        var props = vm.$options.props;
        for (var key in methods) {
            {
                if (methods[key] == null) {
                    warn(
                        "Method \"" + key + "\" has an undefined value in the component definition. " +
                        "Did you reference the function correctly?",
                        vm
                    );
                }
                if (props && hasOwn(props, key)) {
                    warn(
                        ("Method \"" + key + "\" has already been defined as a prop."),
                        vm
                    );
                }
                if ((key in vm) && isReserved(key)) {
                    warn(
                        "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
                        "Avoid defining component methods that start with _ or $."
                    );
                }
            }
            vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
        }
    }

    function initWatch (vm, watch) {
        for (var key in watch) {
            var handler = watch[key];
            if (Array.isArray(handler)) {
                for (var i = 0; i < handler.length; i++) {
                    createWatcher(vm, key, handler[i]);
                }
            } else {
                createWatcher(vm, key, handler);
            }
        }
    }

    function createWatcher (
        vm,
        keyOrFn,
        handler,
        options
    ) {
        if (isPlainObject(handler)) {
            options = handler;
            handler = handler.handler;
        }
        if (typeof handler === 'string') {
            handler = vm[handler];
        }
        return vm.$watch(keyOrFn, handler, options)
    }

    function stateMixin (Vue) {
        // flow somehow has problems with directly declared definition object
        // when using Object.defineProperty, so we have to procedurally build up
        // the object here.
        var dataDef = {};
        dataDef.get = function () { return this._data };
        var propsDef = {};
        propsDef.get = function () { return this._props };
        {
            dataDef.set = function (newData) {
                warn(
                    'Avoid replacing instance root $data. ' +
                    'Use nested data properties instead.',
                    this
                );
            };
            propsDef.set = function () {
                warn("$props is readonly.", this);
            };
        }
        Object.defineProperty(Vue.prototype, '$data', dataDef);
        Object.defineProperty(Vue.prototype, '$props', propsDef);

        Vue.prototype.$set = set;
        Vue.prototype.$delete = del;

        Vue.prototype.$watch = function (
            expOrFn,
            cb,
            options
        ) {
            var vm = this;
            if (isPlainObject(cb)) {
                return createWatcher(vm, expOrFn, cb, options)
            }
            options = options || {};
            options.user = true;
            var watcher = new Watcher(vm, expOrFn, cb, options);
            if (options.immediate) {
                cb.call(vm, watcher.value);
            }
            return function unwatchFn () {
                watcher.teardown();
            }
        };
    }

/*  */

    function initProvide (vm) {
        var provide = vm.$options.provide;
        if (provide) {
            vm._provided = typeof provide === 'function'
                ? provide.call(vm)
                : provide;
        }
    }

    function initInjections (vm) {
        var result = resolveInject(vm.$options.inject, vm);
        if (result) {
            observerState.shouldConvert = false;
            Object.keys(result).forEach(function (key) {
                /* istanbul ignore else */
                {
                    defineReactive(vm, key, result[key], function () {
                        warn(
                            "Avoid mutating an injected value directly since the changes will be " +
                            "overwritten whenever the provided component re-renders. " +
                            "injection being mutated: \"" + key + "\"",
                            vm
                        );
                    });
                }
            });
            observerState.shouldConvert = true;
        }
    }

    function resolveInject (inject, vm) {
        if (inject) {
            // inject is :any because flow is not smart enough to figure out cached
            var result = Object.create(null);
            var keys = hasSymbol
                ? Reflect.ownKeys(inject).filter(function (key) {
                    /* istanbul ignore next */
                    return Object.getOwnPropertyDescriptor(inject, key).enumerable
                })
                : Object.keys(inject);

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var provideKey = inject[key].from;
                var source = vm;
                while (source) {
                    if (source._provided && provideKey in source._provided) {
                        result[key] = source._provided[provideKey];
                        break
                    }
                    source = source.$parent;
                }
                if (!source) {
                    if ('default' in inject[key]) {
                        var provideDefault = inject[key].default;
                        result[key] = typeof provideDefault === 'function'
                            ? provideDefault.call(vm)
                            : provideDefault;
                    } else {
                        warn(("Injection \"" + key + "\" not found"), vm);
                    }
                }
            }
            return result
        }
    }

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
    function renderList (
        val,
        render
    ) {
        var ret, i, l, keys, key;
        if (Array.isArray(val) || typeof val === 'string') {
            ret = new Array(val.length);
            for (i = 0, l = val.length; i < l; i++) {
                ret[i] = render(val[i], i);
            }
        } else if (typeof val === 'number') {
            ret = new Array(val);
            for (i = 0; i < val; i++) {
                ret[i] = render(i + 1, i);
            }
        } else if (isObject(val)) {
            keys = Object.keys(val);
            ret = new Array(keys.length);
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                ret[i] = render(val[key], key, i);
            }
        }
        if (isDef(ret)) {
            (ret)._isVList = true;
        }
        return ret
    }

/*  */

/**
 * Runtime helper for rendering <slot>
 */
    function renderSlot (
        name,
        fallback,
        props,
        bindObject
    ) {
        var scopedSlotFn = this.$scopedSlots[name];
        if (scopedSlotFn) { // scoped slot
            props = props || {};
            if (bindObject) {
                if ("development" !== 'production' && !isObject(bindObject)) {
                    warn(
                        'slot v-bind without argument expects an Object',
                        this
                    );
                }
                props = extend(extend({}, bindObject), props);
            }
            return scopedSlotFn(props) || fallback
        } else {
            var slotNodes = this.$slots[name];
            // warn duplicate slot usage
            if (slotNodes && "development" !== 'production') {
                slotNodes._rendered && warn(
                    "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
                    "- this will likely cause render errors.",
                    this
                );
                slotNodes._rendered = true;
            }
            return slotNodes || fallback
        }
    }

/*  */

/**
 * Runtime helper for resolving filters
 */
    function resolveFilter (id) {
        return resolveAsset(this.$options, 'filters', id, true) || identity
    }

/*  */

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
    function checkKeyCodes (
        eventKeyCode,
        key,
        builtInAlias,
        eventKeyName
    ) {
        var keyCodes = config.keyCodes[key] || builtInAlias;
        if (keyCodes) {
            if (Array.isArray(keyCodes)) {
                return keyCodes.indexOf(eventKeyCode) === -1
            } else {
                return keyCodes !== eventKeyCode
            }
        } else if (eventKeyName) {
            return hyphenate(eventKeyName) !== key
        }
    }

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
    function bindObjectProps (
        data,
        tag,
        value,
        asProp,
        isSync
    ) {
        if (value) {
            if (!isObject(value)) {
                "development" !== 'production' && warn(
                    'v-bind without argument expects an Object or Array value',
                    this
                );
            } else {
                if (Array.isArray(value)) {
                    value = toObject(value);
                }
                var hash;
                var loop = function ( key ) {
                    if (
                        key === 'class' ||
                            key === 'style' ||
                            isReservedAttribute(key)
                    ) {
                        hash = data;
                    } else {
                        var type = data.attrs && data.attrs.type;
                        hash = asProp || config.mustUseProp(tag, type, key)
                            ? data.domProps || (data.domProps = {})
                            : data.attrs || (data.attrs = {});
                    }
                    if (!(key in hash)) {
                        hash[key] = value[key];

                        if (isSync) {
                            var on = data.on || (data.on = {});
                            on[("update:" + key)] = function ($event) {
                                value[key] = $event;
                            };
                        }
                    }
                };

                for (var key in value) loop( key );
            }
        }
        return data
    }

/*  */

/**
 * Runtime helper for rendering static trees.
 */
    function renderStatic (
        index,
        isInFor
    ) {
        // static trees can be rendered once and cached on the contructor options
        // so every instance shares the same cached trees
        var renderFns = this.$options.staticRenderFns;
        var cached = renderFns.cached || (renderFns.cached = []);
        var tree = cached[index];
        // if has already-rendered static tree and not inside v-for,
        // we can reuse the same tree by doing a shallow clone.
        if (tree && !isInFor) {
            return Array.isArray(tree)
                ? cloneVNodes(tree)
                : cloneVNode(tree)
        }
        // otherwise, render a fresh tree.
        tree = cached[index] = renderFns[index].call(this._renderProxy, null, this);
        markStatic(tree, ("__static__" + index), false);
        return tree
    }

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
    function markOnce (
        tree,
        index,
        key
    ) {
        markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
        return tree
    }

    function markStatic (
        tree,
        key,
        isOnce
    ) {
        if (Array.isArray(tree)) {
            for (var i = 0; i < tree.length; i++) {
                if (tree[i] && typeof tree[i] !== 'string') {
                    markStaticNode(tree[i], (key + "_" + i), isOnce);
                }
            }
        } else {
            markStaticNode(tree, key, isOnce);
        }
    }

    function markStaticNode (node, key, isOnce) {
        node.isStatic = true;
        node.key = key;
        node.isOnce = isOnce;
    }

/*  */

    function bindObjectListeners (data, value) {
        if (value) {
            if (!isPlainObject(value)) {
                "development" !== 'production' && warn(
                    'v-on without argument expects an Object value',
                    this
                );
            } else {
                var on = data.on = data.on ? extend({}, data.on) : {};
                for (var key in value) {
                    var existing = on[key];
                    var ours = value[key];
                    on[key] = existing ? [].concat(existing, ours) : ours;
                }
            }
        }
        return data
    }

/*  */

    function installRenderHelpers (target) {
        target._o = markOnce;
        target._n = toNumber;
        target._s = toString;
        target._l = renderList;
        target._t = renderSlot;
        target._q = looseEqual;
        target._i = looseIndexOf;
        target._m = renderStatic;
        target._f = resolveFilter;
        target._k = checkKeyCodes;
        target._b = bindObjectProps;
        target._v = createTextVNode;
        target._e = createEmptyVNode;
        target._u = resolveScopedSlots;
        target._g = bindObjectListeners;
    }

/*  */

    function FunctionalRenderContext (
        data,
        props,
        children,
        parent,
        Ctor
    ) {
        var options = Ctor.options;
        this.data = data;
        this.props = props;
        this.children = children;
        this.parent = parent;
        this.listeners = data.on || emptyObject;
        this.injections = resolveInject(options.inject, parent);
        this.slots = function () { return resolveSlots(children, parent); };

        // ensure the createElement function in functional components
        // gets a unique context - this is necessary for correct named slot check
        var contextVm = Object.create(parent);
        var isCompiled = isTrue(options._compiled);
        var needNormalization = !isCompiled;

        // support for compiled functional template
        if (isCompiled) {
            // exposing $options for renderStatic()
            this.$options = options;
            // pre-resolve slots for renderSlot()
            this.$slots = this.slots();
            this.$scopedSlots = data.scopedSlots || emptyObject;
        }

        if (options._scopeId) {
            this._c = function (a, b, c, d) {
                var vnode = createElement(contextVm, a, b, c, d, needNormalization);
                if (vnode) {
                    vnode.functionalScopeId = options._scopeId;
                    vnode.functionalContext = parent;
                }
                return vnode
            };
        } else {
            this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
        }
    }

    installRenderHelpers(FunctionalRenderContext.prototype);

    function createFunctionalComponent (
        Ctor,
        propsData,
        data,
        contextVm,
        children
    ) {
        var options = Ctor.options;
        var props = {};
        var propOptions = options.props;
        if (isDef(propOptions)) {
            for (var key in propOptions) {
                props[key] = validateProp(key, propOptions, propsData || emptyObject);
            }
        } else {
            if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
            if (isDef(data.props)) { mergeProps(props, data.props); }
        }

        var renderContext = new FunctionalRenderContext(
            data,
            props,
            children,
            contextVm,
            Ctor
        );

        var vnode = options.render.call(null, renderContext._c, renderContext);

        if (vnode instanceof VNode) {
            vnode.functionalContext = contextVm;
            vnode.functionalOptions = options;
            if (data.slot) {
                (vnode.data || (vnode.data = {})).slot = data.slot;
            }
        }

        return vnode
    }

    function mergeProps (to, from) {
        for (var key in from) {
            to[camelize(key)] = from[key];
        }
    }

/*  */

// hooks to be invoked on component VNodes during patch
    var componentVNodeHooks = {
        init: function init (
            vnode,
            hydrating,
            parentElm,
            refElm
        ) {
            if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
                var child = vnode.componentInstance = createComponentInstanceForVnode(
                    vnode,
                    activeInstance,
                    parentElm,
                    refElm
                );
                child.$mount(hydrating ? vnode.elm : undefined, hydrating);
            } else if (vnode.data.keepAlive) {
                // kept-alive components, treat as a patch
                var mountedNode = vnode; // work around flow
                componentVNodeHooks.prepatch(mountedNode, mountedNode);
            }
        },

        prepatch: function prepatch (oldVnode, vnode) {
            var options = vnode.componentOptions;
            var child = vnode.componentInstance = oldVnode.componentInstance;
            updateChildComponent(
                child,
                options.propsData, // updated props
                options.listeners, // updated listeners
                vnode, // new parent vnode
                options.children // new children
            );
        },

        insert: function insert (vnode) {
            var context = vnode.context;
            var componentInstance = vnode.componentInstance;
            if (!componentInstance._isMounted) {
                componentInstance._isMounted = true;
                callHook(componentInstance, 'mounted');
            }
            if (vnode.data.keepAlive) {
                if (context._isMounted) {
                    // vue-router#1212
                    // During updates, a kept-alive component's child components may
                    // change, so directly walking the tree here may call activated hooks
                    // on incorrect children. Instead we push them into a queue which will
                    // be processed after the whole patch process ended.
                    queueActivatedComponent(componentInstance);
                } else {
                    activateChildComponent(componentInstance, true /* direct */);
                }
            }
        },

        destroy: function destroy (vnode) {
            var componentInstance = vnode.componentInstance;
            if (!componentInstance._isDestroyed) {
                if (!vnode.data.keepAlive) {
                    componentInstance.$destroy();
                } else {
                    deactivateChildComponent(componentInstance, true /* direct */);
                }
            }
        }
    };

    var hooksToMerge = Object.keys(componentVNodeHooks);

    function createComponent (
        Ctor,
        data,
        context,
        children,
        tag
    ) {
        if (isUndef(Ctor)) {
            return
        }

        var baseCtor = context.$options._base;

        // plain options object: turn it into a constructor
        if (isObject(Ctor)) {
            Ctor = baseCtor.extend(Ctor);
        }

        // if at this stage it's not a constructor or an async component factory,
        // reject.
        if (typeof Ctor !== 'function') {
            {
                warn(("Invalid Component definition: " + (String(Ctor))), context);
            }
            return
        }

        // async component
        var asyncFactory;
        if (isUndef(Ctor.cid)) {
            asyncFactory = Ctor;
            Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
            if (Ctor === undefined) {
                // return a placeholder node for async component, which is rendered
                // as a comment node but preserves all the raw information for the node.
                // the information will be used for async server-rendering and hydration.
                return createAsyncPlaceholder(
                    asyncFactory,
                    data,
                    context,
                    children,
                    tag
                )
            }
        }

        data = data || {};

        // resolve constructor options in case global mixins are applied after
        // component constructor creation
        resolveConstructorOptions(Ctor);

        // transform component v-model data into props & events
        if (isDef(data.model)) {
            transformModel(Ctor.options, data);
        }

        // extract props
        var propsData = extractPropsFromVNodeData(data, Ctor, tag);

        // functional component
        if (isTrue(Ctor.options.functional)) {
            return createFunctionalComponent(Ctor, propsData, data, context, children)
        }

        // extract listeners, since these needs to be treated as
        // child component listeners instead of DOM listeners
        var listeners = data.on;
        // replace with listeners with .native modifier
        // so it gets processed during parent component patch.
        data.on = data.nativeOn;

        if (isTrue(Ctor.options.abstract)) {
            // abstract components do not keep anything
            // other than props & listeners & slot

            // work around flow
            var slot = data.slot;
            data = {};
            if (slot) {
                data.slot = slot;
            }
        }

        // merge component management hooks onto the placeholder node
        mergeHooks(data);

        // return a placeholder vnode
        var name = Ctor.options.name || tag;
        var vnode = new VNode(
            ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
            data, undefined, undefined, undefined, context,
            { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
            asyncFactory
        );
        return vnode
    }

    function createComponentInstanceForVnode (
        vnode, // we know it's MountedComponentVNode but flow doesn't
        parent, // activeInstance in lifecycle state
        parentElm,
        refElm
    ) {
        var vnodeComponentOptions = vnode.componentOptions;
        var options = {
            _isComponent: true,
            parent: parent,
            propsData: vnodeComponentOptions.propsData,
            _componentTag: vnodeComponentOptions.tag,
            _parentVnode: vnode,
            _parentListeners: vnodeComponentOptions.listeners,
            _renderChildren: vnodeComponentOptions.children,
            _parentElm: parentElm || null,
            _refElm: refElm || null
        };
        // check inline-template render functions
        var inlineTemplate = vnode.data.inlineTemplate;
        if (isDef(inlineTemplate)) {
            options.render = inlineTemplate.render;
            options.staticRenderFns = inlineTemplate.staticRenderFns;
        }
        return new vnodeComponentOptions.Ctor(options)
    }

    function mergeHooks (data) {
        if (!data.hook) {
            data.hook = {};
        }
        for (var i = 0; i < hooksToMerge.length; i++) {
            var key = hooksToMerge[i];
            var fromParent = data.hook[key];
            var ours = componentVNodeHooks[key];
            data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
        }
    }

    function mergeHook$1 (one, two) {
        return function (a, b, c, d) {
            one(a, b, c, d);
            two(a, b, c, d);
        }
    }

// transform component v-model info (value and callback) into
// prop and event handler respectively.
    function transformModel (options, data) {
        var prop = (options.model && options.model.prop) || 'value';
        var event = (options.model && options.model.event) || 'input';(data.props || (data.props = {}))[prop] = data.model.value;
        var on = data.on || (data.on = {});
        if (isDef(on[event])) {
            on[event] = [data.model.callback].concat(on[event]);
        } else {
            on[event] = data.model.callback;
        }
    }

/*  */

    var SIMPLE_NORMALIZE = 1;
    var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
    function createElement (
        context,
        tag,
        data,
        children,
        normalizationType,
        alwaysNormalize
    ) {
        if (Array.isArray(data) || isPrimitive(data)) {
            normalizationType = children;
            children = data;
            data = undefined;
        }
        if (isTrue(alwaysNormalize)) {
            normalizationType = ALWAYS_NORMALIZE;
        }
        return _createElement(context, tag, data, children, normalizationType)
    }

    function _createElement (
        context,
        tag,
        data,
        children,
        normalizationType
    ) {
        if (isDef(data) && isDef((data).__ob__)) {
            "development" !== 'production' && warn(
                "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
                'Always create fresh vnode data objects in each render!',
                context
            );
            return createEmptyVNode()
        }
        // object syntax in v-bind
        if (isDef(data) && isDef(data.is)) {
            tag = data.is;
        }
        if (!tag) {
            // in case of component :is set to falsy value
            return createEmptyVNode()
        }
        // warn against non-primitive key
        if ("development" !== 'production' &&
            isDef(data) && isDef(data.key) && !isPrimitive(data.key)
        ) {
            warn(
                'Avoid using non-primitive value as key, ' +
                'use string/number value instead.',
                context
            );
        }
        // support single function children as default scoped slot
        if (Array.isArray(children) &&
            typeof children[0] === 'function'
        ) {
            data = data || {};
            data.scopedSlots = { default: children[0] };
            children.length = 0;
        }
        if (normalizationType === ALWAYS_NORMALIZE) {
            children = normalizeChildren(children);
        } else if (normalizationType === SIMPLE_NORMALIZE) {
            children = simpleNormalizeChildren(children);
        }
        var vnode, ns;
        if (typeof tag === 'string') {
            var Ctor;
            ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
            if (config.isReservedTag(tag)) {
                // platform built-in elements
                vnode = new VNode(
                    config.parsePlatformTagName(tag), data, children,
                    undefined, undefined, context
                );
            } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
                // component
                vnode = createComponent(Ctor, data, context, children, tag);
            } else {
                // unknown or unlisted namespaced elements
                // check at runtime because it may get assigned a namespace when its
                // parent normalizes children
                vnode = new VNode(
                    tag, data, children,
                    undefined, undefined, context
                );
            }
        } else {
            // direct component options / constructor
            vnode = createComponent(tag, data, context, children);
        }
        if (isDef(vnode)) {
            if (ns) { applyNS(vnode, ns); }
            return vnode
        } else {
            return createEmptyVNode()
        }
    }

    function applyNS (vnode, ns, force) {
        vnode.ns = ns;
        if (vnode.tag === 'foreignObject') {
            // use default namespace inside foreignObject
            ns = undefined;
            force = true;
        }
        if (isDef(vnode.children)) {
            for (var i = 0, l = vnode.children.length; i < l; i++) {
                var child = vnode.children[i];
                if (isDef(child.tag) && (isUndef(child.ns) || isTrue(force))) {
                    applyNS(child, ns, force);
                }
            }
        }
    }

/*  */

    function initRender (vm) {
        vm._vnode = null; // the root of the child tree
        var options = vm.$options;
        var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
        var renderContext = parentVnode && parentVnode.context;
        vm.$slots = resolveSlots(options._renderChildren, renderContext);
        vm.$scopedSlots = emptyObject;
        // bind the createElement fn to this instance
        // so that we get proper render context inside it.
        // args order: tag, data, children, normalizationType, alwaysNormalize
        // internal version is used by render functions compiled from templates
        vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
        // normalization is always applied for the public version, used in
        // user-written render functions.
        vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

        // $attrs & $listeners are exposed for easier HOC creation.
        // they need to be reactive so that HOCs using them are always updated
        var parentData = parentVnode && parentVnode.data;

        /* istanbul ignore else */
        {
            defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
                !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
            }, true);
            defineReactive(vm, '$listeners', options._parentListeners || emptyObject, function () {
                !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
            }, true);
        }
    }

    function renderMixin (Vue) {
        // install runtime convenience helpers
        installRenderHelpers(Vue.prototype);

        Vue.prototype.$nextTick = function (fn) {
            return nextTick(fn, this)
        };

        Vue.prototype._render = function () {
            var vm = this;
            var ref = vm.$options;
            var render = ref.render;
            var _parentVnode = ref._parentVnode;

            if (vm._isMounted) {
                // if the parent didn't update, the slot nodes will be the ones from
                // last render. They need to be cloned to ensure "freshness" for this render.
                for (var key in vm.$slots) {
                    var slot = vm.$slots[key];
                    if (slot._rendered) {
                        vm.$slots[key] = cloneVNodes(slot, true /* deep */);
                    }
                }
            }

            vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject;

            // set parent vnode. this allows render functions to have access
            // to the data on the placeholder node.
            vm.$vnode = _parentVnode;
            // render self
            var vnode;
            try {
                vnode = render.call(vm._renderProxy, vm.$createElement);
            } catch (e) {
                handleError(e, vm, "render");
                // return error render result,
                // or previous vnode to prevent render error causing blank component
                /* istanbul ignore else */
                {
                    if (vm.$options.renderError) {
                        try {
                            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
                        } catch (e) {
                            handleError(e, vm, "renderError");
                            vnode = vm._vnode;
                        }
                    } else {
                        vnode = vm._vnode;
                    }
                }
            }
            // return empty vnode in case the render function errored out
            if (!(vnode instanceof VNode)) {
                if ("development" !== 'production' && Array.isArray(vnode)) {
                    warn(
                        'Multiple root nodes returned from render function. Render function ' +
                        'should return a single root node.',
                        vm
                    );
                }
                vnode = createEmptyVNode();
            }
            // set parent
            vnode.parent = _parentVnode;
            return vnode
        };
    }

/*  */

    var uid$1 = 0;

    function initMixin (Vue) {
        Vue.prototype._init = function (options) {
            var vm = this;
            // a uid
            vm._uid = uid$1++;

            var startTag, endTag;
            /* istanbul ignore if */
            if ("development" !== 'production' && config.performance && mark) {
                startTag = "vue-perf-start:" + (vm._uid);
                endTag = "vue-perf-end:" + (vm._uid);
                mark(startTag);
            }

            // a flag to avoid this being observed
            vm._isVue = true;
            // merge options
            if (options && options._isComponent) {
                // optimize internal component instantiation
                // since dynamic options merging is pretty slow, and none of the
                // internal component options needs special treatment.
                initInternalComponent(vm, options);
            } else {
                vm.$options = mergeOptions(
                    resolveConstructorOptions(vm.constructor),
                    options || {},
                    vm
                );
            }
            /* istanbul ignore else */
            {
                initProxy(vm);
            }
            // expose real self
            vm._self = vm;
            initLifecycle(vm);
            initEvents(vm);
            initRender(vm);
            callHook(vm, 'beforeCreate');
            initInjections(vm); // resolve injections before data/props
            initState(vm);
            initProvide(vm); // resolve provide after data/props
            callHook(vm, 'created');

            /* istanbul ignore if */
            if ("development" !== 'production' && config.performance && mark) {
                vm._name = formatComponentName(vm, false);
                mark(endTag);
                measure(("vue " + (vm._name) + " init"), startTag, endTag);
            }

            if (vm.$options.el) {
                vm.$mount(vm.$options.el);
            }
        };
    }

    function initInternalComponent (vm, options) {
        var opts = vm.$options = Object.create(vm.constructor.options);
        // doing this because it's faster than dynamic enumeration.
        opts.parent = options.parent;
        opts.propsData = options.propsData;
        opts._parentVnode = options._parentVnode;
        opts._parentListeners = options._parentListeners;
        opts._renderChildren = options._renderChildren;
        opts._componentTag = options._componentTag;
        opts._parentElm = options._parentElm;
        opts._refElm = options._refElm;
        if (options.render) {
            opts.render = options.render;
            opts.staticRenderFns = options.staticRenderFns;
        }
    }

    function resolveConstructorOptions (Ctor) {
        var options = Ctor.options;
        if (Ctor.super) {
            var superOptions = resolveConstructorOptions(Ctor.super);
            var cachedSuperOptions = Ctor.superOptions;
            if (superOptions !== cachedSuperOptions) {
                // super option changed,
                // need to resolve new options.
                Ctor.superOptions = superOptions;
                // check if there are any late-modified/attached options (#4976)
                var modifiedOptions = resolveModifiedOptions(Ctor);
                // update base extend options
                if (modifiedOptions) {
                    extend(Ctor.extendOptions, modifiedOptions);
                }
                options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
                if (options.name) {
                    options.components[options.name] = Ctor;
                }
            }
        }
        return options
    }

    function resolveModifiedOptions (Ctor) {
        var modified;
        var latest = Ctor.options;
        var extended = Ctor.extendOptions;
        var sealed = Ctor.sealedOptions;
        for (var key in latest) {
            if (latest[key] !== sealed[key]) {
                if (!modified) { modified = {}; }
                modified[key] = dedupe(latest[key], extended[key], sealed[key]);
            }
        }
        return modified
    }

    function dedupe (latest, extended, sealed) {
        // compare latest and sealed to ensure lifecycle hooks won't be duplicated
        // between merges
        if (Array.isArray(latest)) {
            var res = [];
            sealed = Array.isArray(sealed) ? sealed : [sealed];
            extended = Array.isArray(extended) ? extended : [extended];
            for (var i = 0; i < latest.length; i++) {
                // push original options and not sealed options to exclude duplicated options
                if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
                    res.push(latest[i]);
                }
            }
            return res
        } else {
            return latest
        }
    }

    function Vue$3 (options) {
        if ("development" !== 'production' &&
            !(this instanceof Vue$3)
        ) {
            warn('Vue is a constructor and should be called with the `new` keyword');
        }
        this._init(options);
    }

    initMixin(Vue$3);
    stateMixin(Vue$3);
    eventsMixin(Vue$3);
    lifecycleMixin(Vue$3);
    renderMixin(Vue$3);

/*  */

    function initUse (Vue) {
        Vue.use = function (plugin) {
            var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
            if (installedPlugins.indexOf(plugin) > -1) {
                return this
            }

            // additional parameters
            var args = toArray(arguments, 1);
            args.unshift(this);
            if (typeof plugin.install === 'function') {
                plugin.install.apply(plugin, args);
            } else if (typeof plugin === 'function') {
                plugin.apply(null, args);
            }
            installedPlugins.push(plugin);
            return this
        };
    }

/*  */

    function initMixin$1 (Vue) {
        Vue.mixin = function (mixin) {
            this.options = mergeOptions(this.options, mixin);
            return this
        };
    }

/*  */

    function initExtend (Vue) {
        /**
         * Each instance constructor, including Vue, has a unique
         * cid. This enables us to create wrapped "child
         * constructors" for prototypal inheritance and cache them.
         */
        Vue.cid = 0;
        var cid = 1;

        /**
         * Class inheritance
         */
        Vue.extend = function (extendOptions) {
            extendOptions = extendOptions || {};
            var Super = this;
            var SuperId = Super.cid;
            var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
            if (cachedCtors[SuperId]) {
                return cachedCtors[SuperId]
            }

            var name = extendOptions.name || Super.options.name;
            {
                if (!/^[a-zA-Z][\w-]*$/.test(name)) {
                    warn(
                        'Invalid component name: "' + name + '". Component names ' +
                        'can only contain alphanumeric characters and the hyphen, ' +
                        'and must start with a letter.'
                    );
                }
            }

            var Sub = function VueComponent (options) {
                this._init(options);
            };
            Sub.prototype = Object.create(Super.prototype);
            Sub.prototype.constructor = Sub;
            Sub.cid = cid++;
            Sub.options = mergeOptions(
                Super.options,
                extendOptions
            );
            Sub['super'] = Super;

            // For props and computed properties, we define the proxy getters on
            // the Vue instances at extension time, on the extended prototype. This
            // avoids Object.defineProperty calls for each instance created.
            if (Sub.options.props) {
                initProps$1(Sub);
            }
            if (Sub.options.computed) {
                initComputed$1(Sub);
            }

            // allow further extension/mixin/plugin usage
            Sub.extend = Super.extend;
            Sub.mixin = Super.mixin;
            Sub.use = Super.use;

            // create asset registers, so extended classes
            // can have their private assets too.
            ASSET_TYPES.forEach(function (type) {
                Sub[type] = Super[type];
            });
            // enable recursive self-lookup
            if (name) {
                Sub.options.components[name] = Sub;
            }

            // keep a reference to the super options at extension time.
            // later at instantiation we can check if Super's options have
            // been updated.
            Sub.superOptions = Super.options;
            Sub.extendOptions = extendOptions;
            Sub.sealedOptions = extend({}, Sub.options);

            // cache constructor
            cachedCtors[SuperId] = Sub;
            return Sub
        };
    }

    function initProps$1 (Comp) {
        var props = Comp.options.props;
        for (var key in props) {
            proxy(Comp.prototype, "_props", key);
        }
    }

    function initComputed$1 (Comp) {
        var computed = Comp.options.computed;
        for (var key in computed) {
            defineComputed(Comp.prototype, key, computed[key]);
        }
    }

/*  */

    function initAssetRegisters (Vue) {
        /**
         * Create asset registration methods.
         */
        ASSET_TYPES.forEach(function (type) {
            Vue[type] = function (
                id,
                definition
            ) {
                if (!definition) {
                    return this.options[type + 's'][id]
                } else {
                    /* istanbul ignore if */
                    {
                        if (type === 'component' && config.isReservedTag(id)) {
                            warn(
                                'Do not use built-in or reserved HTML elements as component ' +
                                'id: ' + id
                            );
                        }
                    }
                    if (type === 'component' && isPlainObject(definition)) {
                        definition.name = definition.name || id;
                        definition = this.options._base.extend(definition);
                    }
                    if (type === 'directive' && typeof definition === 'function') {
                        definition = { bind: definition, update: definition };
                    }
                    this.options[type + 's'][id] = definition;
                    return definition
                }
            };
        });
    }

/*  */

    function getComponentName (opts) {
        return opts && (opts.Ctor.options.name || opts.tag)
    }

    function matches (pattern, name) {
        if (Array.isArray(pattern)) {
            return pattern.indexOf(name) > -1
        } else if (typeof pattern === 'string') {
            return pattern.split(',').indexOf(name) > -1
        } else if (isRegExp(pattern)) {
            return pattern.test(name)
        }
        /* istanbul ignore next */
        return false
    }

    function pruneCache (keepAliveInstance, filter) {
        var cache = keepAliveInstance.cache;
        var keys = keepAliveInstance.keys;
        var _vnode = keepAliveInstance._vnode;
        for (var key in cache) {
            var cachedNode = cache[key];
            if (cachedNode) {
                var name = getComponentName(cachedNode.componentOptions);
                if (name && !filter(name)) {
                    pruneCacheEntry(cache, key, keys, _vnode);
                }
            }
        }
    }

    function pruneCacheEntry (
        cache,
        key,
        keys,
        current
    ) {
        var cached$$1 = cache[key];
        if (cached$$1 && cached$$1 !== current) {
            cached$$1.componentInstance.$destroy();
        }
        cache[key] = null;
        remove(keys, key);
    }

    var patternTypes = [String, RegExp, Array];

    var KeepAlive = {
        name: 'keep-alive',
        abstract: true,

        props: {
            include: patternTypes,
            exclude: patternTypes,
            max: [String, Number]
        },

        created: function created () {
            this.cache = Object.create(null);
            this.keys = [];
        },

        destroyed: function destroyed () {
            var this$1 = this;

            for (var key in this$1.cache) {
                pruneCacheEntry(this$1.cache, key, this$1.keys);
            }
        },

        watch: {
            include: function include (val) {
                pruneCache(this, function (name) { return matches(val, name); });
            },
            exclude: function exclude (val) {
                pruneCache(this, function (name) { return !matches(val, name); });
            }
        },

        render: function render () {
            var vnode = getFirstComponentChild(this.$slots.default);
            var componentOptions = vnode && vnode.componentOptions;
            if (componentOptions) {
                // check pattern
                var name = getComponentName(componentOptions);
                if (name && (
                    (this.include && !matches(this.include, name)) ||
                        (this.exclude && matches(this.exclude, name))
                )) {
                    return vnode
                }

                var ref = this;
                var cache = ref.cache;
                var keys = ref.keys;
                var key = vnode.key == null
                    // same constructor may get registered as different local components
                    // so cid alone is not enough (#3269)
                    ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
                    : vnode.key;
                if (cache[key]) {
                    vnode.componentInstance = cache[key].componentInstance;
                    // make current key freshest
                    remove(keys, key);
                    keys.push(key);
                } else {
                    cache[key] = vnode;
                    keys.push(key);
                    // prune oldest entry
                    if (this.max && keys.length > parseInt(this.max)) {
                        pruneCacheEntry(cache, keys[0], keys, this._vnode);
                    }
                }

                vnode.data.keepAlive = true;
            }
            return vnode
        }
    };

    var builtInComponents = {
        KeepAlive: KeepAlive
    };

/*  */

    function initGlobalAPI (Vue) {
        // config
        var configDef = {};
        configDef.get = function () { return config; };
        {
            configDef.set = function () {
                warn(
                    'Do not replace the Vue.config object, set individual fields instead.'
                );
            };
        }
        Object.defineProperty(Vue, 'config', configDef);

        // exposed util methods.
        // NOTE: these are not considered part of the public API - avoid relying on
        // them unless you are aware of the risk.
        Vue.util = {
            warn: warn,
            extend: extend,
            mergeOptions: mergeOptions,
            defineReactive: defineReactive
        };

        Vue.set = set;
        Vue.delete = del;
        Vue.nextTick = nextTick;

        Vue.options = Object.create(null);
        ASSET_TYPES.forEach(function (type) {
            Vue.options[type + 's'] = Object.create(null);
        });

        // this is used to identify the "base" constructor to extend all plain-object
        // components with in Weex's multi-instance scenarios.
        Vue.options._base = Vue;

        extend(Vue.options.components, builtInComponents);

        initUse(Vue);
        initMixin$1(Vue);
        initExtend(Vue);
        initAssetRegisters(Vue);
    }

    initGlobalAPI(Vue$3);

    Object.defineProperty(Vue$3.prototype, '$isServer', {
        get: isServerRendering
    });

    Object.defineProperty(Vue$3.prototype, '$ssrContext', {
        get: function get () {
            /* istanbul ignore next */
            return this.$vnode && this.$vnode.ssrContext
        }
    });

    Vue$3.version = '2.5.2';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
    var isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
    var acceptValue = makeMap('input,textarea,option,select,progress');
    var mustUseProp = function (tag, type, attr) {
        return (
            (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
                (attr === 'selected' && tag === 'option') ||
                (attr === 'checked' && tag === 'input') ||
                (attr === 'muted' && tag === 'video')
        )
    };

    var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

    var isBooleanAttr = makeMap(
        'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
        'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
        'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
        'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
        'required,reversed,scoped,seamless,selected,sortable,translate,' +
        'truespeed,typemustmatch,visible'
    );

    var xlinkNS = 'http://www.w3.org/1999/xlink';

    var isXlink = function (name) {
        return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
    };

    var getXlinkProp = function (name) {
        return isXlink(name) ? name.slice(6, name.length) : ''
    };

    var isFalsyAttrValue = function (val) {
        return val == null || val === false
    };

/*  */

    function genClassForVnode (vnode) {
        var data = vnode.data;
        var parentNode = vnode;
        var childNode = vnode;
        while (isDef(childNode.componentInstance)) {
            childNode = childNode.componentInstance._vnode;
            if (childNode.data) {
                data = mergeClassData(childNode.data, data);
            }
        }
        while (isDef(parentNode = parentNode.parent)) {
            if (parentNode.data) {
                data = mergeClassData(data, parentNode.data);
            }
        }
        return renderClass(data.staticClass, data.class)
    }

    function mergeClassData (child, parent) {
        return {
            staticClass: concat(child.staticClass, parent.staticClass),
            class: isDef(child.class)
                ? [child.class, parent.class]
                : parent.class
        }
    }

    function renderClass (
        staticClass,
        dynamicClass
    ) {
        if (isDef(staticClass) || isDef(dynamicClass)) {
            return concat(staticClass, stringifyClass(dynamicClass))
        }
        /* istanbul ignore next */
        return ''
    }

    function concat (a, b) {
        return a ? b ? (a + ' ' + b) : a : (b || '')
    }

    function stringifyClass (value) {
        if (Array.isArray(value)) {
            return stringifyArray(value)
        }
        if (isObject(value)) {
            return stringifyObject(value)
        }
        if (typeof value === 'string') {
            return value
        }
        /* istanbul ignore next */
        return ''
    }

    function stringifyArray (value) {
        var res = '';
        var stringified;
        for (var i = 0, l = value.length; i < l; i++) {
            if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
                if (res) { res += ' '; }
                res += stringified;
            }
        }
        return res
    }

    function stringifyObject (value) {
        var res = '';
        for (var key in value) {
            if (value[key]) {
                if (res) { res += ' '; }
                res += key;
            }
        }
        return res
    }

/*  */

    var namespaceMap = {
        svg: 'http://www.w3.org/2000/svg',
        math: 'http://www.w3.org/1998/Math/MathML'
    };

    var isHTMLTag = makeMap(
        'html,body,base,head,link,meta,style,title,' +
        'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
        'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
        'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
        's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
        'embed,object,param,source,canvas,script,noscript,del,ins,' +
        'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
        'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
        'output,progress,select,textarea,' +
        'details,dialog,menu,menuitem,summary,' +
        'content,element,shadow,template,blockquote,iframe,tfoot'
    );

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
    var isSVG = makeMap(
        'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
        'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
        'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
        true
    );

    var isPreTag = function (tag) { return tag === 'pre'; };

    var isReservedTag = function (tag) {
        return isHTMLTag(tag) || isSVG(tag)
    };

    function getTagNamespace (tag) {
        if (isSVG(tag)) {
            return 'svg'
        }
        // basic support for MathML
        // note it doesn't support other MathML elements being component roots
        if (tag === 'math') {
            return 'math'
        }
    }

    var unknownElementCache = Object.create(null);
    function isUnknownElement (tag) {
        /* istanbul ignore if */
        if (!inBrowser) {
            return true
        }
        if (isReservedTag(tag)) {
            return false
        }
        tag = tag.toLowerCase();
        /* istanbul ignore if */
        if (unknownElementCache[tag] != null) {
            return unknownElementCache[tag]
        }
        var el = document.createElement(tag);
        if (tag.indexOf('-') > -1) {
            // http://stackoverflow.com/a/28210364/1070244
            return (unknownElementCache[tag] = (
                el.constructor === window.HTMLUnknownElement ||
                    el.constructor === window.HTMLElement
            ))
        } else {
            return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
        }
    }

    var isTextInputType = makeMap('text,number,password,search,email,tel,url');

/*  */

/**
 * Query an element selector if it's not an element already.
 */
    function query (el) {
        if (typeof el === 'string') {
            var selected = document.querySelector(el);
            if (!selected) {
                "development" !== 'production' && warn(
                    'Cannot find element: ' + el
                );
                return document.createElement('div')
            }
            return selected
        } else {
            return el
        }
    }

/*  */

    function createElement$1 (tagName, vnode) {
        var elm = document.createElement(tagName);
        if (tagName !== 'select') {
            return elm
        }
        // false or null will remove the attribute but undefined will not
        if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
            elm.setAttribute('multiple', 'multiple');
        }
        return elm
    }

    function createElementNS (namespace, tagName) {
        return document.createElementNS(namespaceMap[namespace], tagName)
    }

    function createTextNode (text) {
        return document.createTextNode(text)
    }

    function createComment (text) {
        return document.createComment(text)
    }

    function insertBefore (parentNode, newNode, referenceNode) {
        parentNode.insertBefore(newNode, referenceNode);
    }

    function removeChild (node, child) {
        node.removeChild(child);
    }

    function appendChild (node, child) {
        node.appendChild(child);
    }

    function parentNode (node) {
        return node.parentNode
    }

    function nextSibling (node) {
        return node.nextSibling
    }

    function tagName (node) {
        return node.tagName
    }

    function setTextContent (node, text) {
        node.textContent = text;
    }

    function setAttribute (node, key, val) {
        node.setAttribute(key, val);
    }


    var nodeOps = Object.freeze({
        createElement: createElement$1,
        createElementNS: createElementNS,
        createTextNode: createTextNode,
        createComment: createComment,
        insertBefore: insertBefore,
        removeChild: removeChild,
        appendChild: appendChild,
        parentNode: parentNode,
        nextSibling: nextSibling,
        tagName: tagName,
        setTextContent: setTextContent,
        setAttribute: setAttribute
    });

/*  */

    var ref = {
        create: function create (_, vnode) {
            registerRef(vnode);
        },
        update: function update (oldVnode, vnode) {
            if (oldVnode.data.ref !== vnode.data.ref) {
                registerRef(oldVnode, true);
                registerRef(vnode);
            }
        },
        destroy: function destroy (vnode) {
            registerRef(vnode, true);
        }
    };

    function registerRef (vnode, isRemoval) {
        var key = vnode.data.ref;
        if (!key) { return }

        var vm = vnode.context;
        var ref = vnode.componentInstance || vnode.elm;
        var refs = vm.$refs;
        if (isRemoval) {
            if (Array.isArray(refs[key])) {
                remove(refs[key], ref);
            } else if (refs[key] === ref) {
                refs[key] = undefined;
            }
        } else {
            if (vnode.data.refInFor) {
                if (!Array.isArray(refs[key])) {
                    refs[key] = [ref];
                } else if (refs[key].indexOf(ref) < 0) {
                    // $flow-disable-line
                    refs[key].push(ref);
                }
            } else {
                refs[key] = ref;
            }
        }
    }

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

    var emptyNode = new VNode('', {}, []);

    var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

    function sameVnode (a, b) {
        return (
            a.key === b.key && (
                (
                    a.tag === b.tag &&
                        a.isComment === b.isComment &&
                        isDef(a.data) === isDef(b.data) &&
                        sameInputType(a, b)
                ) || (
                    isTrue(a.isAsyncPlaceholder) &&
                        a.asyncFactory === b.asyncFactory &&
                        isUndef(b.asyncFactory.error)
                )
            )
        )
    }

    function sameInputType (a, b) {
        if (a.tag !== 'input') { return true }
        var i;
        var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
        var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
        return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
    }

    function createKeyToOldIdx (children, beginIdx, endIdx) {
        var i, key;
        var map = {};
        for (i = beginIdx; i <= endIdx; ++i) {
            key = children[i].key;
            if (isDef(key)) { map[key] = i; }
        }
        return map
    }

    function createPatchFunction (backend) {
        var i, j;
        var cbs = {};

        var modules = backend.modules;
        var nodeOps = backend.nodeOps;

        for (i = 0; i < hooks.length; ++i) {
            cbs[hooks[i]] = [];
            for (j = 0; j < modules.length; ++j) {
                if (isDef(modules[j][hooks[i]])) {
                    cbs[hooks[i]].push(modules[j][hooks[i]]);
                }
            }
        }

        function emptyNodeAt (elm) {
            return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
        }

        function createRmCb (childElm, listeners) {
            function remove () {
                if (--remove.listeners === 0) {
                    removeNode(childElm);
                }
            }
            remove.listeners = listeners;
            return remove
        }

        function removeNode (el) {
            var parent = nodeOps.parentNode(el);
            // element may have already been removed due to v-html / v-text
            if (isDef(parent)) {
                nodeOps.removeChild(parent, el);
            }
        }

        var inPre = 0;
        function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
            vnode.isRootInsert = !nested; // for transition enter check
            if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
                return
            }

            var data = vnode.data;
            var children = vnode.children;
            var tag = vnode.tag;
            if (isDef(tag)) {
                {
                    if (data && data.pre) {
                        inPre++;
                    }
                    if (
                        !inPre &&
                            !vnode.ns &&
                            !(
                                config.ignoredElements.length &&
                                    config.ignoredElements.some(function (ignore) {
                                        return isRegExp(ignore)
                                            ? ignore.test(tag)
                                            : ignore === tag
                                    })
                            ) &&
                            config.isUnknownElement(tag)
                    ) {
                        warn(
                            'Unknown custom element: <' + tag + '> - did you ' +
                            'register the component correctly? For recursive components, ' +
                            'make sure to provide the "name" option.',
                            vnode.context
                        );
                    }
                }
                vnode.elm = vnode.ns
                    ? nodeOps.createElementNS(vnode.ns, tag)
                    : nodeOps.createElement(tag, vnode);
                setScope(vnode);

                /* istanbul ignore if */
                {
                    createChildren(vnode, children, insertedVnodeQueue);
                    if (isDef(data)) {
                        invokeCreateHooks(vnode, insertedVnodeQueue);
                    }
                    insert(parentElm, vnode.elm, refElm);
                }

                if ("development" !== 'production' && data && data.pre) {
                    inPre--;
                }
            } else if (isTrue(vnode.isComment)) {
                vnode.elm = nodeOps.createComment(vnode.text);
                insert(parentElm, vnode.elm, refElm);
            } else {
                vnode.elm = nodeOps.createTextNode(vnode.text);
                insert(parentElm, vnode.elm, refElm);
            }
        }

        function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
            var i = vnode.data;
            if (isDef(i)) {
                var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
                if (isDef(i = i.hook) && isDef(i = i.init)) {
                    i(vnode, false /* hydrating */, parentElm, refElm);
                }
                // after calling the init hook, if the vnode is a child component
                // it should've created a child instance and mounted it. the child
                // component also has set the placeholder vnode's elm.
                // in that case we can just return the element and be done.
                if (isDef(vnode.componentInstance)) {
                    initComponent(vnode, insertedVnodeQueue);
                    if (isTrue(isReactivated)) {
                        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
                    }
                    return true
                }
            }
        }

        function initComponent (vnode, insertedVnodeQueue) {
            if (isDef(vnode.data.pendingInsert)) {
                insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
                vnode.data.pendingInsert = null;
            }
            vnode.elm = vnode.componentInstance.$el;
            if (isPatchable(vnode)) {
                invokeCreateHooks(vnode, insertedVnodeQueue);
                setScope(vnode);
            } else {
                // empty component root.
                // skip all element-related modules except for ref (#3455)
                registerRef(vnode);
                // make sure to invoke the insert hook
                insertedVnodeQueue.push(vnode);
            }
        }

        function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
            var i;
            // hack for #4339: a reactivated component with inner transition
            // does not trigger because the inner node's created hooks are not called
            // again. It's not ideal to involve module-specific logic in here but
            // there doesn't seem to be a better way to do it.
            var innerNode = vnode;
            while (innerNode.componentInstance) {
                innerNode = innerNode.componentInstance._vnode;
                if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
                    for (i = 0; i < cbs.activate.length; ++i) {
                        cbs.activate[i](emptyNode, innerNode);
                    }
                    insertedVnodeQueue.push(innerNode);
                    break
                }
            }
            // unlike a newly created component,
            // a reactivated keep-alive component doesn't insert itself
            insert(parentElm, vnode.elm, refElm);
        }

        function insert (parent, elm, ref$$1) {
            if (isDef(parent)) {
                if (isDef(ref$$1)) {
                    if (ref$$1.parentNode === parent) {
                        nodeOps.insertBefore(parent, elm, ref$$1);
                    }
                } else {
                    nodeOps.appendChild(parent, elm);
                }
            }
        }

        function createChildren (vnode, children, insertedVnodeQueue) {
            if (Array.isArray(children)) {
                for (var i = 0; i < children.length; ++i) {
                    createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
                }
            } else if (isPrimitive(vnode.text)) {
                nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
            }
        }

        function isPatchable (vnode) {
            while (vnode.componentInstance) {
                vnode = vnode.componentInstance._vnode;
            }
            return isDef(vnode.tag)
        }

        function invokeCreateHooks (vnode, insertedVnodeQueue) {
            for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, vnode);
            }
            i = vnode.data.hook; // Reuse variable
            if (isDef(i)) {
                if (isDef(i.create)) { i.create(emptyNode, vnode); }
                if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
            }
        }

        // set scope id attribute for scoped CSS.
        // this is implemented as a special case to avoid the overhead
        // of going through the normal attribute patching process.
        function setScope (vnode) {
            var i;
            if (isDef(i = vnode.functionalScopeId)) {
                nodeOps.setAttribute(vnode.elm, i, '');
            } else {
                var ancestor = vnode;
                while (ancestor) {
                    if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
                        nodeOps.setAttribute(vnode.elm, i, '');
                    }
                    ancestor = ancestor.parent;
                }
            }
            // for slot content they should also get the scopeId from the host instance.
            if (isDef(i = activeInstance) &&
                i !== vnode.context &&
                i !== vnode.functionalContext &&
                isDef(i = i.$options._scopeId)
            ) {
                nodeOps.setAttribute(vnode.elm, i, '');
            }
        }

        function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
            for (; startIdx <= endIdx; ++startIdx) {
                createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
            }
        }

        function invokeDestroyHook (vnode) {
            var i, j;
            var data = vnode.data;
            if (isDef(data)) {
                if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
                for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
            }
            if (isDef(i = vnode.children)) {
                for (j = 0; j < vnode.children.length; ++j) {
                    invokeDestroyHook(vnode.children[j]);
                }
            }
        }

        function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
            for (; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx];
                if (isDef(ch)) {
                    if (isDef(ch.tag)) {
                        removeAndInvokeRemoveHook(ch);
                        invokeDestroyHook(ch);
                    } else { // Text node
                        removeNode(ch.elm);
                    }
                }
            }
        }

        function removeAndInvokeRemoveHook (vnode, rm) {
            if (isDef(rm) || isDef(vnode.data)) {
                var i;
                var listeners = cbs.remove.length + 1;
                if (isDef(rm)) {
                    // we have a recursively passed down rm callback
                    // increase the listeners count
                    rm.listeners += listeners;
                } else {
                    // directly removing
                    rm = createRmCb(vnode.elm, listeners);
                }
                // recursively invoke hooks on child component root node
                if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
                    removeAndInvokeRemoveHook(i, rm);
                }
                for (i = 0; i < cbs.remove.length; ++i) {
                    cbs.remove[i](vnode, rm);
                }
                if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
                    i(vnode, rm);
                } else {
                    rm();
                }
            } else {
                removeNode(vnode.elm);
            }
        }

        function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
            var oldStartIdx = 0;
            var newStartIdx = 0;
            var oldEndIdx = oldCh.length - 1;
            var oldStartVnode = oldCh[0];
            var oldEndVnode = oldCh[oldEndIdx];
            var newEndIdx = newCh.length - 1;
            var newStartVnode = newCh[0];
            var newEndVnode = newCh[newEndIdx];
            var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

            // removeOnly is a special flag used only by <transition-group>
            // to ensure removed elements stay in correct relative positions
            // during leaving transitions
            var canMove = !removeOnly;

            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                if (isUndef(oldStartVnode)) {
                    oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
                } else if (isUndef(oldEndVnode)) {
                    oldEndVnode = oldCh[--oldEndIdx];
                } else if (sameVnode(oldStartVnode, newStartVnode)) {
                    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                } else if (sameVnode(oldEndVnode, newEndVnode)) {
                    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
                    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                    canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
                    oldStartVnode = oldCh[++oldStartIdx];
                    newEndVnode = newCh[--newEndIdx];
                } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
                    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                    canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
                    idxInOld = isDef(newStartVnode.key)
                        ? oldKeyToIdx[newStartVnode.key]
                        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
                    if (isUndef(idxInOld)) { // New element
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
                    } else {
                        vnodeToMove = oldCh[idxInOld];
                        /* istanbul ignore if */
                        if ("development" !== 'production' && !vnodeToMove) {
                            warn(
                                'It seems there are duplicate keys that is causing an update error. ' +
                                'Make sure each v-for item has a unique key.'
                            );
                        }
                        if (sameVnode(vnodeToMove, newStartVnode)) {
                            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue);
                            oldCh[idxInOld] = undefined;
                            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
                        } else {
                            // same key but different element. treat as new element
                            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
                        }
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
            if (oldStartIdx > oldEndIdx) {
                refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            } else if (newStartIdx > newEndIdx) {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }

        function findIdxInOld (node, oldCh, start, end) {
            for (var i = start; i < end; i++) {
                var c = oldCh[i];
                if (isDef(c) && sameVnode(node, c)) { return i }
            }
        }

        function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
            if (oldVnode === vnode) {
                return
            }

            var elm = vnode.elm = oldVnode.elm;

            if (isTrue(oldVnode.isAsyncPlaceholder)) {
                if (isDef(vnode.asyncFactory.resolved)) {
                    hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
                } else {
                    vnode.isAsyncPlaceholder = true;
                }
                return
            }

            // reuse element for static trees.
            // note we only do this if the vnode is cloned -
            // if the new node is not cloned it means the render functions have been
            // reset by the hot-reload-api and we need to do a proper re-render.
            if (isTrue(vnode.isStatic) &&
                isTrue(oldVnode.isStatic) &&
                vnode.key === oldVnode.key &&
                (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
            ) {
                vnode.componentInstance = oldVnode.componentInstance;
                return
            }

            var i;
            var data = vnode.data;
            if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
                i(oldVnode, vnode);
            }

            var oldCh = oldVnode.children;
            var ch = vnode.children;
            if (isDef(data) && isPatchable(vnode)) {
                for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
                if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
            }
            if (isUndef(vnode.text)) {
                if (isDef(oldCh) && isDef(ch)) {
                    if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
                } else if (isDef(ch)) {
                    if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
                } else if (isDef(oldCh)) {
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                } else if (isDef(oldVnode.text)) {
                    nodeOps.setTextContent(elm, '');
                }
            } else if (oldVnode.text !== vnode.text) {
                nodeOps.setTextContent(elm, vnode.text);
            }
            if (isDef(data)) {
                if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
            }
        }

        function invokeInsertHook (vnode, queue, initial) {
            // delay insert hooks for component root nodes, invoke them after the
            // element is really inserted
            if (isTrue(initial) && isDef(vnode.parent)) {
                vnode.parent.data.pendingInsert = queue;
            } else {
                for (var i = 0; i < queue.length; ++i) {
                    queue[i].data.hook.insert(queue[i]);
                }
            }
        }

        var bailed = false;
        // list of modules that can skip create hook during hydration because they
        // are already rendered on the client or has no need for initialization
        var isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

        // Note: this is a browser-only function so we can assume elms are DOM nodes.
        function hydrate (elm, vnode, insertedVnodeQueue) {
            if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
                vnode.elm = elm;
                vnode.isAsyncPlaceholder = true;
                return true
            }
            {
                if (!assertNodeMatch(elm, vnode)) {
                    return false
                }
            }
            vnode.elm = elm;
            var tag = vnode.tag;
            var data = vnode.data;
            var children = vnode.children;
            if (isDef(data)) {
                if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
                if (isDef(i = vnode.componentInstance)) {
                    // child component. it should have hydrated its own tree.
                    initComponent(vnode, insertedVnodeQueue);
                    return true
                }
            }
            if (isDef(tag)) {
                if (isDef(children)) {
                    // empty element, allow client to pick up and populate children
                    if (!elm.hasChildNodes()) {
                        createChildren(vnode, children, insertedVnodeQueue);
                    } else {
                        // v-html and domProps: innerHTML
                        if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
                            if (i !== elm.innerHTML) {
                                /* istanbul ignore if */
                                if ("development" !== 'production' &&
                                    typeof console !== 'undefined' &&
                                    !bailed
                                ) {
                                    bailed = true;
                                    console.warn('Parent: ', elm);
                                    console.warn('server innerHTML: ', i);
                                    console.warn('client innerHTML: ', elm.innerHTML);
                                }
                                return false
                            }
                        } else {
                            // iterate and compare children lists
                            var childrenMatch = true;
                            var childNode = elm.firstChild;
                            for (var i$1 = 0; i$1 < children.length; i$1++) {
                                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
                                    childrenMatch = false;
                                    break
                                }
                                childNode = childNode.nextSibling;
                            }
                            // if childNode is not null, it means the actual childNodes list is
                            // longer than the virtual children list.
                            if (!childrenMatch || childNode) {
                                /* istanbul ignore if */
                                if ("development" !== 'production' &&
                                    typeof console !== 'undefined' &&
                                    !bailed
                                ) {
                                    bailed = true;
                                    console.warn('Parent: ', elm);
                                    console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                                }
                                return false
                            }
                        }
                    }
                }
                if (isDef(data)) {
                    for (var key in data) {
                        if (!isRenderedModule(key)) {
                            invokeCreateHooks(vnode, insertedVnodeQueue);
                            break
                        }
                    }
                }
            } else if (elm.data !== vnode.text) {
                elm.data = vnode.text;
            }
            return true
        }

        function assertNodeMatch (node, vnode) {
            if (isDef(vnode.tag)) {
                return (
                    vnode.tag.indexOf('vue-component') === 0 ||
                        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
                )
            } else {
                return node.nodeType === (vnode.isComment ? 8 : 3)
            }
        }

        return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
            if (isUndef(vnode)) {
                if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
                return
            }

            var isInitialPatch = false;
            var insertedVnodeQueue = [];

            if (isUndef(oldVnode)) {
                // empty mount (likely as component), create new root element
                isInitialPatch = true;
                createElm(vnode, insertedVnodeQueue, parentElm, refElm);
            } else {
                var isRealElement = isDef(oldVnode.nodeType);
                if (!isRealElement && sameVnode(oldVnode, vnode)) {
                    // patch existing root node
                    patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
                } else {
                    if (isRealElement) {
                        // mounting to a real element
                        // check if this is server-rendered content and if we can perform
                        // a successful hydration.
                        if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                            oldVnode.removeAttribute(SSR_ATTR);
                            hydrating = true;
                        }
                        if (isTrue(hydrating)) {
                            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                                invokeInsertHook(vnode, insertedVnodeQueue, true);
                                return oldVnode
                            } else {
                                warn(
                                    'The client-side rendered virtual DOM tree is not matching ' +
                                    'server-rendered content. This is likely caused by incorrect ' +
                                    'HTML markup, for example nesting block-level elements inside ' +
                                    '<p>, or missing <tbody>. Bailing hydration and performing ' +
                                    'full client-side render.'
                                );
                            }
                        }
                        // either not server-rendered, or hydration failed.
                        // create an empty node and replace it
                        oldVnode = emptyNodeAt(oldVnode);
                    }
                    // replacing existing element
                    var oldElm = oldVnode.elm;
                    var parentElm$1 = nodeOps.parentNode(oldElm);
                    createElm(
                        vnode,
                        insertedVnodeQueue,
                        // extremely rare edge case: do not insert if old element is in a
                        // leaving transition. Only happens when combining transition +
                        // keep-alive + HOCs. (#4590)
                        oldElm._leaveCb ? null : parentElm$1,
                        nodeOps.nextSibling(oldElm)
                    );

                    if (isDef(vnode.parent)) {
                        // component root element replaced.
                        // update parent placeholder node element, recursively
                        var ancestor = vnode.parent;
                        var patchable = isPatchable(vnode);
                        while (ancestor) {
                            for (var i = 0; i < cbs.destroy.length; ++i) {
                                cbs.destroy[i](ancestor);
                            }
                            ancestor.elm = vnode.elm;
                            if (patchable) {
                                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                                    cbs.create[i$1](emptyNode, ancestor);
                                }
                                // #6513
                                // invoke insert hooks that may have been merged by create hooks.
                                // e.g. for directives that uses the "inserted" hook.
                                var insert = ancestor.data.hook.insert;
                                if (insert.merged) {
                                    // start at index 1 to avoid re-invoking component mounted hook
                                    for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                                        insert.fns[i$2]();
                                    }
                                }
                            } else {
                                registerRef(ancestor);
                            }
                            ancestor = ancestor.parent;
                        }
                    }

                    if (isDef(parentElm$1)) {
                        removeVnodes(parentElm$1, [oldVnode], 0, 0);
                    } else if (isDef(oldVnode.tag)) {
                        invokeDestroyHook(oldVnode);
                    }
                }
            }

            invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
            return vnode.elm
        }
    }

/*  */

    var directives = {
        create: updateDirectives,
        update: updateDirectives,
        destroy: function unbindDirectives (vnode) {
            updateDirectives(vnode, emptyNode);
        }
    };

    function updateDirectives (oldVnode, vnode) {
        if (oldVnode.data.directives || vnode.data.directives) {
            _update(oldVnode, vnode);
        }
    }

    function _update (oldVnode, vnode) {
        var isCreate = oldVnode === emptyNode;
        var isDestroy = vnode === emptyNode;
        var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
        var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

        var dirsWithInsert = [];
        var dirsWithPostpatch = [];

        var key, oldDir, dir;
        for (key in newDirs) {
            oldDir = oldDirs[key];
            dir = newDirs[key];
            if (!oldDir) {
                // new directive, bind
                callHook$1(dir, 'bind', vnode, oldVnode);
                if (dir.def && dir.def.inserted) {
                    dirsWithInsert.push(dir);
                }
            } else {
                // existing directive, update
                dir.oldValue = oldDir.value;
                callHook$1(dir, 'update', vnode, oldVnode);
                if (dir.def && dir.def.componentUpdated) {
                    dirsWithPostpatch.push(dir);
                }
            }
        }

        if (dirsWithInsert.length) {
            var callInsert = function () {
                for (var i = 0; i < dirsWithInsert.length; i++) {
                    callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
                }
            };
            if (isCreate) {
                mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert);
            } else {
                callInsert();
            }
        }

        if (dirsWithPostpatch.length) {
            mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function () {
                for (var i = 0; i < dirsWithPostpatch.length; i++) {
                    callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
                }
            });
        }

        if (!isCreate) {
            for (key in oldDirs) {
                if (!newDirs[key]) {
                    // no longer present, unbind
                    callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
                }
            }
        }
    }

    var emptyModifiers = Object.create(null);

    function normalizeDirectives$1 (
        dirs,
        vm
    ) {
        var res = Object.create(null);
        if (!dirs) {
            return res
        }
        var i, dir;
        for (i = 0; i < dirs.length; i++) {
            dir = dirs[i];
            if (!dir.modifiers) {
                dir.modifiers = emptyModifiers;
            }
            res[getRawDirName(dir)] = dir;
            dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
        }
        return res
    }

    function getRawDirName (dir) {
        return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
    }

    function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
        var fn = dir.def && dir.def[hook];
        if (fn) {
            try {
                fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
            } catch (e) {
                handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
            }
        }
    }

    var baseModules = [
        ref,
        directives
    ];

/*  */

    function updateAttrs (oldVnode, vnode) {
        var opts = vnode.componentOptions;
        if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
            return
        }
        if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
            return
        }
        var key, cur, old;
        var elm = vnode.elm;
        var oldAttrs = oldVnode.data.attrs || {};
        var attrs = vnode.data.attrs || {};
        // clone observed objects, as the user probably wants to mutate it
        if (isDef(attrs.__ob__)) {
            attrs = vnode.data.attrs = extend({}, attrs);
        }

        for (key in attrs) {
            cur = attrs[key];
            old = oldAttrs[key];
            if (old !== cur) {
                setAttr(elm, key, cur);
            }
        }
        // #4391: in IE9, setting type can reset value for input[type=radio]
        // #6666: IE/Edge forces progress value down to 1 before setting a max
        /* istanbul ignore if */
        if ((isIE9 || isEdge) && attrs.value !== oldAttrs.value) {
            setAttr(elm, 'value', attrs.value);
        }
        for (key in oldAttrs) {
            if (isUndef(attrs[key])) {
                if (isXlink(key)) {
                    elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
                } else if (!isEnumeratedAttr(key)) {
                    elm.removeAttribute(key);
                }
            }
        }
    }

    function setAttr (el, key, value) {
        if (isBooleanAttr(key)) {
            // set attribute for blank value
            // e.g. <option disabled>Select one</option>
            if (isFalsyAttrValue(value)) {
                el.removeAttribute(key);
            } else {
                // technically allowfullscreen is a boolean attribute for <iframe>,
                // but Flash expects a value of "true" when used on <embed> tag
                value = key === 'allowfullscreen' && el.tagName === 'EMBED'
                    ? 'true'
                    : key;
                el.setAttribute(key, value);
            }
        } else if (isEnumeratedAttr(key)) {
            el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
        } else if (isXlink(key)) {
            if (isFalsyAttrValue(value)) {
                el.removeAttributeNS(xlinkNS, getXlinkProp(key));
            } else {
                el.setAttributeNS(xlinkNS, key, value);
            }
        } else {
            if (isFalsyAttrValue(value)) {
                el.removeAttribute(key);
            } else {
                el.setAttribute(key, value);
            }
        }
    }

    var attrs = {
        create: updateAttrs,
        update: updateAttrs
    };

/*  */

    function updateClass (oldVnode, vnode) {
        var el = vnode.elm;
        var data = vnode.data;
        var oldData = oldVnode.data;
        if (
            isUndef(data.staticClass) &&
                isUndef(data.class) && (
                    isUndef(oldData) || (
                        isUndef(oldData.staticClass) &&
                            isUndef(oldData.class)
                    )
                )
        ) {
            return
        }

        var cls = genClassForVnode(vnode);

        // handle transition classes
        var transitionClass = el._transitionClasses;
        if (isDef(transitionClass)) {
            cls = concat(cls, stringifyClass(transitionClass));
        }

        // set the class
        if (cls !== el._prevClass) {
            el.setAttribute('class', cls);
            el._prevClass = cls;
        }
    }

    var klass = {
        create: updateClass,
        update: updateClass
    };

/*  */

    var validDivisionCharRE = /[\w).+\-_$\]]/;

    function parseFilters (exp) {
        var inSingle = false;
        var inDouble = false;
        var inTemplateString = false;
        var inRegex = false;
        var curly = 0;
        var square = 0;
        var paren = 0;
        var lastFilterIndex = 0;
        var c, prev, i, expression, filters;

        for (i = 0; i < exp.length; i++) {
            prev = c;
            c = exp.charCodeAt(i);
            if (inSingle) {
                if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
            } else if (inDouble) {
                if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
            } else if (inTemplateString) {
                if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
            } else if (inRegex) {
                if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
            } else if (
                c === 0x7C && // pipe
                    exp.charCodeAt(i + 1) !== 0x7C &&
                    exp.charCodeAt(i - 1) !== 0x7C &&
                    !curly && !square && !paren
            ) {
                if (expression === undefined) {
                    // first filter, end of expression
                    lastFilterIndex = i + 1;
                    expression = exp.slice(0, i).trim();
                } else {
                    pushFilter();
                }
            } else {
                switch (c) {
                case 0x22: inDouble = true; break         // "
                case 0x27: inSingle = true; break         // '
                case 0x60: inTemplateString = true; break // `
                case 0x28: paren++; break                 // (
                case 0x29: paren--; break                 // )
                case 0x5B: square++; break                // [
                case 0x5D: square--; break                // ]
                case 0x7B: curly++; break                 // {
                case 0x7D: curly--; break                 // }
                }
                if (c === 0x2f) { // /
                    var j = i - 1;
                    var p = (void 0);
                    // find first non-whitespace prev char
                    for (; j >= 0; j--) {
                        p = exp.charAt(j);
                        if (p !== ' ') { break }
                    }
                    if (!p || !validDivisionCharRE.test(p)) {
                        inRegex = true;
                    }
                }
            }
        }

        if (expression === undefined) {
            expression = exp.slice(0, i).trim();
        } else if (lastFilterIndex !== 0) {
            pushFilter();
        }

        function pushFilter () {
            (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
            lastFilterIndex = i + 1;
        }

        if (filters) {
            for (i = 0; i < filters.length; i++) {
                expression = wrapFilter(expression, filters[i]);
            }
        }

        return expression
    }

    function wrapFilter (exp, filter) {
        var i = filter.indexOf('(');
        if (i < 0) {
            // _f: resolveFilter
            return ("_f(\"" + filter + "\")(" + exp + ")")
        } else {
            var name = filter.slice(0, i);
            var args = filter.slice(i + 1);
            return ("_f(\"" + name + "\")(" + exp + "," + args)
        }
    }

/*  */

    function baseWarn (msg) {
        console.error(("[Vue compiler]: " + msg));
    }

    function pluckModuleFunction (
        modules,
        key
    ) {
        return modules
            ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
            : []
    }

    function addProp (el, name, value) {
        (el.props || (el.props = [])).push({ name: name, value: value });
    }

    function addAttr (el, name, value) {
        (el.attrs || (el.attrs = [])).push({ name: name, value: value });
    }

    function addDirective (
        el,
        name,
        rawName,
        value,
        arg,
        modifiers
    ) {
        (el.directives || (el.directives = [])).push({ name: name, rawName: rawName, value: value, arg: arg, modifiers: modifiers });
    }

    function addHandler (
        el,
        name,
        value,
        modifiers,
        important,
        warn
    ) {
        // warn prevent and passive modifier
        /* istanbul ignore if */
        if (
            "development" !== 'production' && warn &&
                modifiers && modifiers.prevent && modifiers.passive
        ) {
            warn(
                'passive and prevent can\'t be used together. ' +
                'Passive handler can\'t prevent default event.'
            );
        }
        // check capture modifier
        if (modifiers && modifiers.capture) {
            delete modifiers.capture;
            name = '!' + name; // mark the event as captured
        }
        if (modifiers && modifiers.once) {
            delete modifiers.once;
            name = '~' + name; // mark the event as once
        }
        /* istanbul ignore if */
        if (modifiers && modifiers.passive) {
            delete modifiers.passive;
            name = '&' + name; // mark the event as passive
        }
        var events;
        if (modifiers && modifiers.native) {
            delete modifiers.native;
            events = el.nativeEvents || (el.nativeEvents = {});
        } else {
            events = el.events || (el.events = {});
        }
        var newHandler = { value: value, modifiers: modifiers };
        var handlers = events[name];
        /* istanbul ignore if */
        if (Array.isArray(handlers)) {
            important ? handlers.unshift(newHandler) : handlers.push(newHandler);
        } else if (handlers) {
            events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
        } else {
            events[name] = newHandler;
        }
    }

    function getBindingAttr (
        el,
        name,
        getStatic
    ) {
        var dynamicValue =
            getAndRemoveAttr(el, ':' + name) ||
                getAndRemoveAttr(el, 'v-bind:' + name);
        if (dynamicValue != null) {
            return parseFilters(dynamicValue)
        } else if (getStatic !== false) {
            var staticValue = getAndRemoveAttr(el, name);
            if (staticValue != null) {
                return JSON.stringify(staticValue)
            }
        }
    }

// note: this only removes the attr from the Array (attrsList) so that it
// doesn't get processed by processAttrs.
// By default it does NOT remove it from the map (attrsMap) because the map is
// needed during codegen.
    function getAndRemoveAttr (
        el,
        name,
        removeFromMap
    ) {
        var val;
        if ((val = el.attrsMap[name]) != null) {
            var list = el.attrsList;
            for (var i = 0, l = list.length; i < l; i++) {
                if (list[i].name === name) {
                    list.splice(i, 1);
                    break
                }
            }
        }
        if (removeFromMap) {
            delete el.attrsMap[name];
        }
        return val
    }

/*  */

/**
 * Cross-platform code generation for component v-model
 */
    function genComponentModel (
        el,
        value,
        modifiers
    ) {
        var ref = modifiers || {};
        var number = ref.number;
        var trim = ref.trim;

        var baseValueExpression = '$$v';
        var valueExpression = baseValueExpression;
        if (trim) {
            valueExpression =
                "(typeof " + baseValueExpression + " === 'string'" +
                "? " + baseValueExpression + ".trim()" +
                ": " + baseValueExpression + ")";
        }
        if (number) {
            valueExpression = "_n(" + valueExpression + ")";
        }
        var assignment = genAssignmentCode(value, valueExpression);

        el.model = {
            value: ("(" + value + ")"),
            expression: ("\"" + value + "\""),
            callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
        };
    }

/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
    function genAssignmentCode (
        value,
        assignment
    ) {
        var res = parseModel(value);
        if (res.key === null) {
            return (value + "=" + assignment)
        } else {
            return ("$set(" + (res.exp) + ", " + (res.key) + ", " + assignment + ")")
        }
    }

/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */

    var len;
    var str;
    var chr;
    var index$1;
    var expressionPos;
    var expressionEndPos;



    function parseModel (val) {
        len = val.length;

        if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
            index$1 = val.lastIndexOf('.');
            if (index$1 > -1) {
                return {
                    exp: val.slice(0, index$1),
                    key: '"' + val.slice(index$1 + 1) + '"'
                }
            } else {
                return {
                    exp: val,
                    key: null
                }
            }
        }

        str = val;
        index$1 = expressionPos = expressionEndPos = 0;

        while (!eof()) {
            chr = next();
            /* istanbul ignore if */
            if (isStringStart(chr)) {
                parseString(chr);
            } else if (chr === 0x5B) {
                parseBracket(chr);
            }
        }

        return {
            exp: val.slice(0, expressionPos),
            key: val.slice(expressionPos + 1, expressionEndPos)
        }
    }

    function next () {
        return str.charCodeAt(++index$1)
    }

    function eof () {
        return index$1 >= len
    }

    function isStringStart (chr) {
        return chr === 0x22 || chr === 0x27
    }

    function parseBracket (chr) {
        var inBracket = 1;
        expressionPos = index$1;
        while (!eof()) {
            chr = next();
            if (isStringStart(chr)) {
                parseString(chr);
                continue
            }
            if (chr === 0x5B) { inBracket++; }
            if (chr === 0x5D) { inBracket--; }
            if (inBracket === 0) {
                expressionEndPos = index$1;
                break
            }
        }
    }

    function parseString (chr) {
        var stringQuote = chr;
        while (!eof()) {
            chr = next();
            if (chr === stringQuote) {
                break
            }
        }
    }

/*  */

    var warn$1;

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
    var RANGE_TOKEN = '__r';
    var CHECKBOX_RADIO_TOKEN = '__c';

    function model (
        el,
        dir,
        _warn
    ) {
        warn$1 = _warn;
        var value = dir.value;
        var modifiers = dir.modifiers;
        var tag = el.tag;
        var type = el.attrsMap.type;

        {
            // inputs with type="file" are read only and setting the input's
            // value will throw an error.
            if (tag === 'input' && type === 'file') {
                warn$1(
                    "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
                    "File inputs are read only. Use a v-on:change listener instead."
                );
            }
        }

        if (el.component) {
            genComponentModel(el, value, modifiers);
            // component v-model doesn't need extra runtime
            return false
        } else if (tag === 'select') {
            genSelect(el, value, modifiers);
        } else if (tag === 'input' && type === 'checkbox') {
            genCheckboxModel(el, value, modifiers);
        } else if (tag === 'input' && type === 'radio') {
            genRadioModel(el, value, modifiers);
        } else if (tag === 'input' || tag === 'textarea') {
            genDefaultModel(el, value, modifiers);
        } else if (!config.isReservedTag(tag)) {
            genComponentModel(el, value, modifiers);
            // component v-model doesn't need extra runtime
            return false
        } else {
            warn$1(
                "<" + (el.tag) + " v-model=\"" + value + "\">: " +
                "v-model is not supported on this element type. " +
                'If you are working with contenteditable, it\'s recommended to ' +
                'wrap a library dedicated for that purpose inside a custom component.'
            );
        }

        // ensure runtime directive metadata
        return true
    }

    function genCheckboxModel (
        el,
        value,
        modifiers
    ) {
        var number = modifiers && modifiers.number;
        var valueBinding = getBindingAttr(el, 'value') || 'null';
        var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
        var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
        addProp(el, 'checked',
            "Array.isArray(" + value + ")" +
            "?_i(" + value + "," + valueBinding + ")>-1" + (
                trueValueBinding === 'true'
                    ? (":(" + value + ")")
                    : (":_q(" + value + "," + trueValueBinding + ")")
            )
        );
        addHandler(el, 'change',
            "var $$a=" + value + "," +
            '$$el=$event.target,' +
            "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
            'if(Array.isArray($$a)){' +
            "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
            '$$i=_i($$a,$$v);' +
            "if($$el.checked){$$i<0&&(" + value + "=$$a.concat([$$v]))}" +
            "else{$$i>-1&&(" + value + "=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}" +
            "}else{" + (genAssignmentCode(value, '$$c')) + "}",
            null, true
        );
    }

    function genRadioModel (
        el,
        value,
        modifiers
    ) {
        var number = modifiers && modifiers.number;
        var valueBinding = getBindingAttr(el, 'value') || 'null';
        valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
        addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
        addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
    }

    function genSelect (
        el,
        value,
        modifiers
    ) {
        var number = modifiers && modifiers.number;
        var selectedVal = "Array.prototype.filter" +
            ".call($event.target.options,function(o){return o.selected})" +
            ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
            "return " + (number ? '_n(val)' : 'val') + "})";

        var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
        var code = "var $$selectedVal = " + selectedVal + ";";
        code = code + " " + (genAssignmentCode(value, assignment));
        addHandler(el, 'change', code, null, true);
    }

    function genDefaultModel (
        el,
        value,
        modifiers
    ) {
        var type = el.attrsMap.type;
        var ref = modifiers || {};
        var lazy = ref.lazy;
        var number = ref.number;
        var trim = ref.trim;
        var needCompositionGuard = !lazy && type !== 'range';
        var event = lazy
            ? 'change'
            : type === 'range'
            ? RANGE_TOKEN
            : 'input';

        var valueExpression = '$event.target.value';
        if (trim) {
            valueExpression = "$event.target.value.trim()";
        }
        if (number) {
            valueExpression = "_n(" + valueExpression + ")";
        }

        var code = genAssignmentCode(value, valueExpression);
        if (needCompositionGuard) {
            code = "if($event.target.composing)return;" + code;
        }

        addProp(el, 'value', ("(" + value + ")"));
        addHandler(el, event, code, null, true);
        if (trim || number) {
            addHandler(el, 'blur', '$forceUpdate()');
        }
    }

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
    function normalizeEvents (on) {
        /* istanbul ignore if */
        if (isDef(on[RANGE_TOKEN])) {
            // IE input[type=range] only supports `change` event
            var event = isIE ? 'change' : 'input';
            on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
            delete on[RANGE_TOKEN];
        }
        // This was originally intended to fix #4521 but no longer necessary
        // after 2.5. Keeping it for backwards compat with generated code from < 2.4
        /* istanbul ignore if */
        if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
            on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
            delete on[CHECKBOX_RADIO_TOKEN];
        }
    }

    var target$1;

    function createOnceHandler (handler, event, capture) {
        var _target = target$1; // save current target element in closure
        return function onceHandler () {
            var res = handler.apply(null, arguments);
            if (res !== null) {
                remove$2(event, onceHandler, capture, _target);
            }
        }
    }

    function add$1 (
        event,
        handler,
        once$$1,
        capture,
        passive
    ) {
        handler = withMacroTask(handler);
        if (once$$1) { handler = createOnceHandler(handler, event, capture); }
        target$1.addEventListener(
            event,
            handler,
            supportsPassive
            ? { capture: capture, passive: passive }
            : capture
        );
    }

    function remove$2 (
        event,
        handler,
        capture,
        _target
    ) {
        (_target || target$1).removeEventListener(
            event,
            handler._withTask || handler,
            capture
        );
    }

    function updateDOMListeners (oldVnode, vnode) {
        if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
            return
        }
        var on = vnode.data.on || {};
        var oldOn = oldVnode.data.on || {};
        target$1 = vnode.elm;
        normalizeEvents(on);
        updateListeners(on, oldOn, add$1, remove$2, vnode.context);
    }

    var events = {
        create: updateDOMListeners,
        update: updateDOMListeners
    };

/*  */

    function updateDOMProps (oldVnode, vnode) {
        if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
            return
        }
        var key, cur;
        var elm = vnode.elm;
        var oldProps = oldVnode.data.domProps || {};
        var props = vnode.data.domProps || {};
        // clone observed objects, as the user probably wants to mutate it
        if (isDef(props.__ob__)) {
            props = vnode.data.domProps = extend({}, props);
        }

        for (key in oldProps) {
            if (isUndef(props[key])) {
                elm[key] = '';
            }
        }
        for (key in props) {
            cur = props[key];
            // ignore children if the node has textContent or innerHTML,
            // as these will throw away existing DOM nodes and cause removal errors
            // on subsequent patches (#3360)
            if (key === 'textContent' || key === 'innerHTML') {
                if (vnode.children) { vnode.children.length = 0; }
                if (cur === oldProps[key]) { continue }
                // #6601 work around Chrome version <= 55 bug where single textNode
                // replaced by innerHTML/textContent retains its parentNode property
                if (elm.childNodes.length === 1) {
                    elm.removeChild(elm.childNodes[0]);
                }
            }

            if (key === 'value') {
                // store value as _value as well since
                // non-string values will be stringified
                elm._value = cur;
                // avoid resetting cursor position when value is the same
                var strCur = isUndef(cur) ? '' : String(cur);
                if (shouldUpdateValue(elm, strCur)) {
                    elm.value = strCur;
                }
            } else {
                elm[key] = cur;
            }
        }
    }

// check platforms/web/util/attrs.js acceptValue


    function shouldUpdateValue (elm, checkVal) {
        return (!elm.composing && (
            elm.tagName === 'OPTION' ||
                isDirty(elm, checkVal) ||
                isInputChanged(elm, checkVal)
        ))
    }

    function isDirty (elm, checkVal) {
        // return true when textbox (.number and .trim) loses focus and its value is
        // not equal to the updated value
        var notInFocus = true;
        // #6157
        // work around IE bug when accessing document.activeElement in an iframe
        try { notInFocus = document.activeElement !== elm; } catch (e) {}
        return notInFocus && elm.value !== checkVal
    }

    function isInputChanged (elm, newVal) {
        var value = elm.value;
        var modifiers = elm._vModifiers; // injected by v-model runtime
        if (isDef(modifiers) && modifiers.number) {
            return toNumber(value) !== toNumber(newVal)
        }
        if (isDef(modifiers) && modifiers.trim) {
            return value.trim() !== newVal.trim()
        }
        return value !== newVal
    }

    var domProps = {
        create: updateDOMProps,
        update: updateDOMProps
    };

/*  */

    var parseStyleText = cached(function (cssText) {
        var res = {};
        var listDelimiter = /;(?![^(]*\))/g;
        var propertyDelimiter = /:(.+)/;
        cssText.split(listDelimiter).forEach(function (item) {
            if (item) {
                var tmp = item.split(propertyDelimiter);
                tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
            }
        });
        return res
    });

// merge static and dynamic style data on the same vnode
    function normalizeStyleData (data) {
        var style = normalizeStyleBinding(data.style);
        // static style is pre-processed into an object during compilation
        // and is always a fresh object, so it's safe to merge into it
        return data.staticStyle
            ? extend(data.staticStyle, style)
            : style
    }

// normalize possible array / string values into Object
    function normalizeStyleBinding (bindingStyle) {
        if (Array.isArray(bindingStyle)) {
            return toObject(bindingStyle)
        }
        if (typeof bindingStyle === 'string') {
            return parseStyleText(bindingStyle)
        }
        return bindingStyle
    }

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
    function getStyle (vnode, checkChild) {
        var res = {};
        var styleData;

        if (checkChild) {
            var childNode = vnode;
            while (childNode.componentInstance) {
                childNode = childNode.componentInstance._vnode;
                if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
                    extend(res, styleData);
                }
            }
        }

        if ((styleData = normalizeStyleData(vnode.data))) {
            extend(res, styleData);
        }

        var parentNode = vnode;
        while ((parentNode = parentNode.parent)) {
            if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
                extend(res, styleData);
            }
        }
        return res
    }

/*  */

    var cssVarRE = /^--/;
    var importantRE = /\s*!important$/;
    var setProp = function (el, name, val) {
        /* istanbul ignore if */
        if (cssVarRE.test(name)) {
            el.style.setProperty(name, val);
        } else if (importantRE.test(val)) {
            el.style.setProperty(name, val.replace(importantRE, ''), 'important');
        } else {
            var normalizedName = normalize(name);
            if (Array.isArray(val)) {
                // Support values array created by autoprefixer, e.g.
                // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
                // Set them one by one, and the browser will only set those it can recognize
                for (var i = 0, len = val.length; i < len; i++) {
                    el.style[normalizedName] = val[i];
                }
            } else {
                el.style[normalizedName] = val;
            }
        }
    };

    var vendorNames = ['Webkit', 'Moz', 'ms'];

    var emptyStyle;
    var normalize = cached(function (prop) {
        emptyStyle = emptyStyle || document.createElement('div').style;
        prop = camelize(prop);
        if (prop !== 'filter' && (prop in emptyStyle)) {
            return prop
        }
        var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
        for (var i = 0; i < vendorNames.length; i++) {
            var name = vendorNames[i] + capName;
            if (name in emptyStyle) {
                return name
            }
        }
    });

    function updateStyle (oldVnode, vnode) {
        var data = vnode.data;
        var oldData = oldVnode.data;

        if (isUndef(data.staticStyle) && isUndef(data.style) &&
            isUndef(oldData.staticStyle) && isUndef(oldData.style)
        ) {
            return
        }

        var cur, name;
        var el = vnode.elm;
        var oldStaticStyle = oldData.staticStyle;
        var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

        // if static style exists, stylebinding already merged into it when doing normalizeStyleData
        var oldStyle = oldStaticStyle || oldStyleBinding;

        var style = normalizeStyleBinding(vnode.data.style) || {};

        // store normalized style under a different key for next diff
        // make sure to clone it if it's reactive, since the user likely wants
        // to mutate it.
        vnode.data.normalizedStyle = isDef(style.__ob__)
            ? extend({}, style)
            : style;

        var newStyle = getStyle(vnode, true);

        for (name in oldStyle) {
            if (isUndef(newStyle[name])) {
                setProp(el, name, '');
            }
        }
        for (name in newStyle) {
            cur = newStyle[name];
            if (cur !== oldStyle[name]) {
                // ie9 setting to null has no effect, must use empty string
                setProp(el, name, cur == null ? '' : cur);
            }
        }
    }

    var style = {
        create: updateStyle,
        update: updateStyle
    };

/*  */

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
    function addClass (el, cls) {
        /* istanbul ignore if */
        if (!cls || !(cls = cls.trim())) {
            return
        }

        /* istanbul ignore else */
        if (el.classList) {
            if (cls.indexOf(' ') > -1) {
                cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
            } else {
                el.classList.add(cls);
            }
        } else {
            var cur = " " + (el.getAttribute('class') || '') + " ";
            if (cur.indexOf(' ' + cls + ' ') < 0) {
                el.setAttribute('class', (cur + cls).trim());
            }
        }
    }

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
    function removeClass (el, cls) {
        /* istanbul ignore if */
        if (!cls || !(cls = cls.trim())) {
            return
        }

        /* istanbul ignore else */
        if (el.classList) {
            if (cls.indexOf(' ') > -1) {
                cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
            } else {
                el.classList.remove(cls);
            }
            if (!el.classList.length) {
                el.removeAttribute('class');
            }
        } else {
            var cur = " " + (el.getAttribute('class') || '') + " ";
            var tar = ' ' + cls + ' ';
            while (cur.indexOf(tar) >= 0) {
                cur = cur.replace(tar, ' ');
            }
            cur = cur.trim();
            if (cur) {
                el.setAttribute('class', cur);
            } else {
                el.removeAttribute('class');
            }
        }
    }

/*  */

    function resolveTransition (def) {
        if (!def) {
            return
        }
        /* istanbul ignore else */
        if (typeof def === 'object') {
            var res = {};
            if (def.css !== false) {
                extend(res, autoCssTransition(def.name || 'v'));
            }
            extend(res, def);
            return res
        } else if (typeof def === 'string') {
            return autoCssTransition(def)
        }
    }

    var autoCssTransition = cached(function (name) {
        return {
            enterClass: (name + "-enter"),
            enterToClass: (name + "-enter-to"),
            enterActiveClass: (name + "-enter-active"),
            leaveClass: (name + "-leave"),
            leaveToClass: (name + "-leave-to"),
            leaveActiveClass: (name + "-leave-active")
        }
    });

    var hasTransition = inBrowser && !isIE9;
    var TRANSITION = 'transition';
    var ANIMATION = 'animation';

// Transition property/event sniffing
    var transitionProp = 'transition';
    var transitionEndEvent = 'transitionend';
    var animationProp = 'animation';
    var animationEndEvent = 'animationend';
    if (hasTransition) {
        /* istanbul ignore if */
        if (window.ontransitionend === undefined &&
            window.onwebkittransitionend !== undefined
        ) {
            transitionProp = 'WebkitTransition';
            transitionEndEvent = 'webkitTransitionEnd';
        }
        if (window.onanimationend === undefined &&
            window.onwebkitanimationend !== undefined
        ) {
            animationProp = 'WebkitAnimation';
            animationEndEvent = 'webkitAnimationEnd';
        }
    }

// binding to window is necessary to make hot reload work in IE in strict mode
    var raf = inBrowser
        ? window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : setTimeout
        : /* istanbul ignore next */ function (fn) { return fn(); };

    function nextFrame (fn) {
        raf(function () {
            raf(fn);
        });
    }

    function addTransitionClass (el, cls) {
        var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
        if (transitionClasses.indexOf(cls) < 0) {
            transitionClasses.push(cls);
            addClass(el, cls);
        }
    }

    function removeTransitionClass (el, cls) {
        if (el._transitionClasses) {
            remove(el._transitionClasses, cls);
        }
        removeClass(el, cls);
    }

    function whenTransitionEnds (
        el,
        expectedType,
        cb
    ) {
        var ref = getTransitionInfo(el, expectedType);
        var type = ref.type;
        var timeout = ref.timeout;
        var propCount = ref.propCount;
        if (!type) { return cb() }
        var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
        var ended = 0;
        var end = function () {
            el.removeEventListener(event, onEnd);
            cb();
        };
        var onEnd = function (e) {
            if (e.target === el) {
                if (++ended >= propCount) {
                    end();
                }
            }
        };
        setTimeout(function () {
            if (ended < propCount) {
                end();
            }
        }, timeout + 1);
        el.addEventListener(event, onEnd);
    }

    var transformRE = /\b(transform|all)(,|$)/;

    function getTransitionInfo (el, expectedType) {
        var styles = window.getComputedStyle(el);
        var transitionDelays = styles[transitionProp + 'Delay'].split(', ');
        var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
        var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
        var animationDelays = styles[animationProp + 'Delay'].split(', ');
        var animationDurations = styles[animationProp + 'Duration'].split(', ');
        var animationTimeout = getTimeout(animationDelays, animationDurations);

        var type;
        var timeout = 0;
        var propCount = 0;
        /* istanbul ignore if */
        if (expectedType === TRANSITION) {
            if (transitionTimeout > 0) {
                type = TRANSITION;
                timeout = transitionTimeout;
                propCount = transitionDurations.length;
            }
        } else if (expectedType === ANIMATION) {
            if (animationTimeout > 0) {
                type = ANIMATION;
                timeout = animationTimeout;
                propCount = animationDurations.length;
            }
        } else {
            timeout = Math.max(transitionTimeout, animationTimeout);
            type = timeout > 0
                ? transitionTimeout > animationTimeout
                ? TRANSITION
                : ANIMATION
                : null;
            propCount = type
                ? type === TRANSITION
                ? transitionDurations.length
                : animationDurations.length
                : 0;
        }
        var hasTransform =
            type === TRANSITION &&
                transformRE.test(styles[transitionProp + 'Property']);
        return {
            type: type,
            timeout: timeout,
            propCount: propCount,
            hasTransform: hasTransform
        }
    }

    function getTimeout (delays, durations) {
        /* istanbul ignore next */
        while (delays.length < durations.length) {
            delays = delays.concat(delays);
        }

        return Math.max.apply(null, durations.map(function (d, i) {
            return toMs(d) + toMs(delays[i])
        }))
    }

    function toMs (s) {
        return Number(s.slice(0, -1)) * 1000
    }

/*  */

    function enter (vnode, toggleDisplay) {
        var el = vnode.elm;

        // call leave callback now
        if (isDef(el._leaveCb)) {
            el._leaveCb.cancelled = true;
            el._leaveCb();
        }

        var data = resolveTransition(vnode.data.transition);
        if (isUndef(data)) {
            return
        }

        /* istanbul ignore if */
        if (isDef(el._enterCb) || el.nodeType !== 1) {
            return
        }

        var css = data.css;
        var type = data.type;
        var enterClass = data.enterClass;
        var enterToClass = data.enterToClass;
        var enterActiveClass = data.enterActiveClass;
        var appearClass = data.appearClass;
        var appearToClass = data.appearToClass;
        var appearActiveClass = data.appearActiveClass;
        var beforeEnter = data.beforeEnter;
        var enter = data.enter;
        var afterEnter = data.afterEnter;
        var enterCancelled = data.enterCancelled;
        var beforeAppear = data.beforeAppear;
        var appear = data.appear;
        var afterAppear = data.afterAppear;
        var appearCancelled = data.appearCancelled;
        var duration = data.duration;

        // activeInstance will always be the <transition> component managing this
        // transition. One edge case to check is when the <transition> is placed
        // as the root node of a child component. In that case we need to check
        // <transition>'s parent for appear check.
        var context = activeInstance;
        var transitionNode = activeInstance.$vnode;
        while (transitionNode && transitionNode.parent) {
            transitionNode = transitionNode.parent;
            context = transitionNode.context;
        }

        var isAppear = !context._isMounted || !vnode.isRootInsert;

        if (isAppear && !appear && appear !== '') {
            return
        }

        var startClass = isAppear && appearClass
            ? appearClass
            : enterClass;
        var activeClass = isAppear && appearActiveClass
            ? appearActiveClass
            : enterActiveClass;
        var toClass = isAppear && appearToClass
            ? appearToClass
            : enterToClass;

        var beforeEnterHook = isAppear
            ? (beforeAppear || beforeEnter)
            : beforeEnter;
        var enterHook = isAppear
            ? (typeof appear === 'function' ? appear : enter)
            : enter;
        var afterEnterHook = isAppear
            ? (afterAppear || afterEnter)
            : afterEnter;
        var enterCancelledHook = isAppear
            ? (appearCancelled || enterCancelled)
            : enterCancelled;

        var explicitEnterDuration = toNumber(
            isObject(duration)
            ? duration.enter
            : duration
        );

        if ("development" !== 'production' && explicitEnterDuration != null) {
            checkDuration(explicitEnterDuration, 'enter', vnode);
        }

        var expectsCSS = css !== false && !isIE9;
        var userWantsControl = getHookArgumentsLength(enterHook);

        var cb = el._enterCb = once(function () {
            if (expectsCSS) {
                removeTransitionClass(el, toClass);
                removeTransitionClass(el, activeClass);
            }
            if (cb.cancelled) {
                if (expectsCSS) {
                    removeTransitionClass(el, startClass);
                }
                enterCancelledHook && enterCancelledHook(el);
            } else {
                afterEnterHook && afterEnterHook(el);
            }
            el._enterCb = null;
        });

        if (!vnode.data.show) {
            // remove pending leave element on enter by injecting an insert hook
            mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
                var parent = el.parentNode;
                var pendingNode = parent && parent._pending && parent._pending[vnode.key];
                if (pendingNode &&
                    pendingNode.tag === vnode.tag &&
                    pendingNode.elm._leaveCb
                ) {
                    pendingNode.elm._leaveCb();
                }
                enterHook && enterHook(el, cb);
            });
        }

        // start enter transition
        beforeEnterHook && beforeEnterHook(el);
        if (expectsCSS) {
            addTransitionClass(el, startClass);
            addTransitionClass(el, activeClass);
            nextFrame(function () {
                addTransitionClass(el, toClass);
                removeTransitionClass(el, startClass);
                if (!cb.cancelled && !userWantsControl) {
                    if (isValidDuration(explicitEnterDuration)) {
                        setTimeout(cb, explicitEnterDuration);
                    } else {
                        whenTransitionEnds(el, type, cb);
                    }
                }
            });
        }

        if (vnode.data.show) {
            toggleDisplay && toggleDisplay();
            enterHook && enterHook(el, cb);
        }

        if (!expectsCSS && !userWantsControl) {
            cb();
        }
    }

    function leave (vnode, rm) {
        var el = vnode.elm;

        // call enter callback now
        if (isDef(el._enterCb)) {
            el._enterCb.cancelled = true;
            el._enterCb();
        }

        var data = resolveTransition(vnode.data.transition);
        if (isUndef(data)) {
            return rm()
        }

        /* istanbul ignore if */
        if (isDef(el._leaveCb) || el.nodeType !== 1) {
            return
        }

        var css = data.css;
        var type = data.type;
        var leaveClass = data.leaveClass;
        var leaveToClass = data.leaveToClass;
        var leaveActiveClass = data.leaveActiveClass;
        var beforeLeave = data.beforeLeave;
        var leave = data.leave;
        var afterLeave = data.afterLeave;
        var leaveCancelled = data.leaveCancelled;
        var delayLeave = data.delayLeave;
        var duration = data.duration;

        var expectsCSS = css !== false && !isIE9;
        var userWantsControl = getHookArgumentsLength(leave);

        var explicitLeaveDuration = toNumber(
            isObject(duration)
            ? duration.leave
            : duration
        );

        if ("development" !== 'production' && isDef(explicitLeaveDuration)) {
            checkDuration(explicitLeaveDuration, 'leave', vnode);
        }

        var cb = el._leaveCb = once(function () {
            if (el.parentNode && el.parentNode._pending) {
                el.parentNode._pending[vnode.key] = null;
            }
            if (expectsCSS) {
                removeTransitionClass(el, leaveToClass);
                removeTransitionClass(el, leaveActiveClass);
            }
            if (cb.cancelled) {
                if (expectsCSS) {
                    removeTransitionClass(el, leaveClass);
                }
                leaveCancelled && leaveCancelled(el);
            } else {
                rm();
                afterLeave && afterLeave(el);
            }
            el._leaveCb = null;
        });

        if (delayLeave) {
            delayLeave(performLeave);
        } else {
            performLeave();
        }

        function performLeave () {
            // the delayed leave may have already been cancelled
            if (cb.cancelled) {
                return
            }
            // record leaving element
            if (!vnode.data.show) {
                (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
            }
            beforeLeave && beforeLeave(el);
            if (expectsCSS) {
                addTransitionClass(el, leaveClass);
                addTransitionClass(el, leaveActiveClass);
                nextFrame(function () {
                    addTransitionClass(el, leaveToClass);
                    removeTransitionClass(el, leaveClass);
                    if (!cb.cancelled && !userWantsControl) {
                        if (isValidDuration(explicitLeaveDuration)) {
                            setTimeout(cb, explicitLeaveDuration);
                        } else {
                            whenTransitionEnds(el, type, cb);
                        }
                    }
                });
            }
            leave && leave(el, cb);
            if (!expectsCSS && !userWantsControl) {
                cb();
            }
        }
    }

// only used in dev mode
    function checkDuration (val, name, vnode) {
        if (typeof val !== 'number') {
            warn(
                "<transition> explicit " + name + " duration is not a valid number - " +
                "got " + (JSON.stringify(val)) + ".",
                vnode.context
            );
        } else if (isNaN(val)) {
            warn(
                "<transition> explicit " + name + " duration is NaN - " +
                'the duration expression might be incorrect.',
                vnode.context
            );
        }
    }

    function isValidDuration (val) {
        return typeof val === 'number' && !isNaN(val)
    }

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
    function getHookArgumentsLength (fn) {
        if (isUndef(fn)) {
            return false
        }
        var invokerFns = fn.fns;
        if (isDef(invokerFns)) {
            // invoker
            return getHookArgumentsLength(
                Array.isArray(invokerFns)
                ? invokerFns[0]
                : invokerFns
            )
        } else {
            return (fn._length || fn.length) > 1
        }
    }

    function _enter (_, vnode) {
        if (vnode.data.show !== true) {
            enter(vnode);
        }
    }

    var transition = inBrowser ? {
        create: _enter,
        activate: _enter,
        remove: function remove$$1 (vnode, rm) {
            /* istanbul ignore else */
            if (vnode.data.show !== true) {
                leave(vnode, rm);
            } else {
                rm();
            }
        }
    } : {};

    var platformModules = [
        attrs,
        klass,
        events,
        domProps,
        style,
        transition
    ];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
    var modules = platformModules.concat(baseModules);

    var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */
    if (isIE9) {
        // http://www.matts411.com/post/internet-explorer-9-oninput/
        document.addEventListener('selectionchange', function () {
            var el = document.activeElement;
            if (el && el.vmodel) {
                trigger(el, 'input');
            }
        });
    }

    var model$1 = {
        inserted: function inserted (el, binding, vnode) {
            if (vnode.tag === 'select') {
                setSelected(el, binding, vnode.context);
                el._vOptions = [].map.call(el.options, getValue);
            } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
                el._vModifiers = binding.modifiers;
                if (!binding.modifiers.lazy) {
                    // Safari < 10.2 & UIWebView doesn't fire compositionend when
                    // switching focus before confirming composition choice
                    // this also fixes the issue where some browsers e.g. iOS Chrome
                    // fires "change" instead of "input" on autocomplete.
                    el.addEventListener('change', onCompositionEnd);
                    if (!isAndroid) {
                        el.addEventListener('compositionstart', onCompositionStart);
                        el.addEventListener('compositionend', onCompositionEnd);
                    }
                    /* istanbul ignore if */
                    if (isIE9) {
                        el.vmodel = true;
                    }
                }
            }
        },
        componentUpdated: function componentUpdated (el, binding, vnode) {
            if (vnode.tag === 'select') {
                setSelected(el, binding, vnode.context);
                // in case the options rendered by v-for have changed,
                // it's possible that the value is out-of-sync with the rendered options.
                // detect such cases and filter out values that no longer has a matching
                // option in the DOM.
                var prevOptions = el._vOptions;
                var curOptions = el._vOptions = [].map.call(el.options, getValue);
                if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
                    // trigger change event if
                    // no matching option found for at least one value
                    var needReset = el.multiple
                        ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
                        : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
                    if (needReset) {
                        trigger(el, 'change');
                    }
                }
            }
        }
    };

    function setSelected (el, binding, vm) {
        actuallySetSelected(el, binding, vm);
        /* istanbul ignore if */
        if (isIE || isEdge) {
            setTimeout(function () {
                actuallySetSelected(el, binding, vm);
            }, 0);
        }
    }

    function actuallySetSelected (el, binding, vm) {
        var value = binding.value;
        var isMultiple = el.multiple;
        if (isMultiple && !Array.isArray(value)) {
            "development" !== 'production' && warn(
                "<select multiple v-model=\"" + (binding.expression) + "\"> " +
                "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
                vm
            );
            return
        }
        var selected, option;
        for (var i = 0, l = el.options.length; i < l; i++) {
            option = el.options[i];
            if (isMultiple) {
                selected = looseIndexOf(value, getValue(option)) > -1;
                if (option.selected !== selected) {
                    option.selected = selected;
                }
            } else {
                if (looseEqual(getValue(option), value)) {
                    if (el.selectedIndex !== i) {
                        el.selectedIndex = i;
                    }
                    return
                }
            }
        }
        if (!isMultiple) {
            el.selectedIndex = -1;
        }
    }

    function hasNoMatchingOption (value, options) {
        return options.every(function (o) { return !looseEqual(o, value); })
    }

    function getValue (option) {
        return '_value' in option
            ? option._value
            : option.value
    }

    function onCompositionStart (e) {
        e.target.composing = true;
    }

    function onCompositionEnd (e) {
        // prevent triggering an input event for no reason
        if (!e.target.composing) { return }
        e.target.composing = false;
        trigger(e.target, 'input');
    }

    function trigger (el, type) {
        var e = document.createEvent('HTMLEvents');
        e.initEvent(type, true, true);
        el.dispatchEvent(e);
    }

/*  */

// recursively search for possible transition defined inside the component root
    function locateNode (vnode) {
        return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
            ? locateNode(vnode.componentInstance._vnode)
            : vnode
    }

    var show = {
        bind: function bind (el, ref, vnode) {
            var value = ref.value;

            vnode = locateNode(vnode);
            var transition$$1 = vnode.data && vnode.data.transition;
            var originalDisplay = el.__vOriginalDisplay =
                el.style.display === 'none' ? '' : el.style.display;
            if (value && transition$$1) {
                vnode.data.show = true;
                enter(vnode, function () {
                    el.style.display = originalDisplay;
                });
            } else {
                el.style.display = value ? originalDisplay : 'none';
            }
        },

        update: function update (el, ref, vnode) {
            var value = ref.value;
            var oldValue = ref.oldValue;

            /* istanbul ignore if */
            if (value === oldValue) { return }
            vnode = locateNode(vnode);
            var transition$$1 = vnode.data && vnode.data.transition;
            if (transition$$1) {
                vnode.data.show = true;
                if (value) {
                    enter(vnode, function () {
                        el.style.display = el.__vOriginalDisplay;
                    });
                } else {
                    leave(vnode, function () {
                        el.style.display = 'none';
                    });
                }
            } else {
                el.style.display = value ? el.__vOriginalDisplay : 'none';
            }
        },

        unbind: function unbind (
            el,
            binding,
            vnode,
            oldVnode,
            isDestroy
        ) {
            if (!isDestroy) {
                el.style.display = el.__vOriginalDisplay;
            }
        }
    };

    var platformDirectives = {
        model: model$1,
        show: show
    };

/*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

    var transitionProps = {
        name: String,
        appear: Boolean,
        css: Boolean,
        mode: String,
        type: String,
        enterClass: String,
        leaveClass: String,
        enterToClass: String,
        leaveToClass: String,
        enterActiveClass: String,
        leaveActiveClass: String,
        appearClass: String,
        appearActiveClass: String,
        appearToClass: String,
        duration: [Number, String, Object]
    };

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
    function getRealChild (vnode) {
        var compOptions = vnode && vnode.componentOptions;
        if (compOptions && compOptions.Ctor.options.abstract) {
            return getRealChild(getFirstComponentChild(compOptions.children))
        } else {
            return vnode
        }
    }

    function extractTransitionData (comp) {
        var data = {};
        var options = comp.$options;
        // props
        for (var key in options.propsData) {
            data[key] = comp[key];
        }
        // events.
        // extract listeners and pass them directly to the transition methods
        var listeners = options._parentListeners;
        for (var key$1 in listeners) {
            data[camelize(key$1)] = listeners[key$1];
        }
        return data
    }

    function placeholder (h, rawChild) {
        if (/\d-keep-alive$/.test(rawChild.tag)) {
            return h('keep-alive', {
                props: rawChild.componentOptions.propsData
            })
        }
    }

    function hasParentTransition (vnode) {
        while ((vnode = vnode.parent)) {
            if (vnode.data.transition) {
                return true
            }
        }
    }

    function isSameChild (child, oldChild) {
        return oldChild.key === child.key && oldChild.tag === child.tag
    }

    var Transition = {
        name: 'transition',
        props: transitionProps,
        abstract: true,

        render: function render (h) {
            var this$1 = this;

            var children = this.$options._renderChildren;
            if (!children) {
                return
            }

            // filter out text nodes (possible whitespaces)
            children = children.filter(function (c) { return c.tag || isAsyncPlaceholder(c); });
            /* istanbul ignore if */
            if (!children.length) {
                return
            }

            // warn multiple elements
            if ("development" !== 'production' && children.length > 1) {
                warn(
                    '<transition> can only be used on a single element. Use ' +
                    '<transition-group> for lists.',
                    this.$parent
                );
            }

            var mode = this.mode;

            // warn invalid mode
            if ("development" !== 'production' &&
                mode && mode !== 'in-out' && mode !== 'out-in'
            ) {
                warn(
                    'invalid <transition> mode: ' + mode,
                    this.$parent
                );
            }

            var rawChild = children[0];

            // if this is a component root node and the component's
            // parent container node also has transition, skip.
            if (hasParentTransition(this.$vnode)) {
                return rawChild
            }

            // apply transition data to child
            // use getRealChild() to ignore abstract components e.g. keep-alive
            var child = getRealChild(rawChild);
            /* istanbul ignore if */
            if (!child) {
                return rawChild
            }

            if (this._leaving) {
                return placeholder(h, rawChild)
            }

            // ensure a key that is unique to the vnode type and to this transition
            // component instance. This key will be used to remove pending leaving nodes
            // during entering.
            var id = "__transition-" + (this._uid) + "-";
            child.key = child.key == null
                ? child.isComment
                ? id + 'comment'
                : id + child.tag
                : isPrimitive(child.key)
                ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
                : child.key;

            var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
            var oldRawChild = this._vnode;
            var oldChild = getRealChild(oldRawChild);

            // mark v-show
            // so that the transition module can hand over the control to the directive
            if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
                child.data.show = true;
            }

            if (
                oldChild &&
                    oldChild.data &&
                    !isSameChild(child, oldChild) &&
                    !isAsyncPlaceholder(oldChild)
            ) {
                // replace old child transition data with fresh one
                // important for dynamic transitions!
                var oldData = oldChild.data.transition = extend({}, data);
                // handle transition mode
                if (mode === 'out-in') {
                    // return placeholder node and queue update when leave finishes
                    this._leaving = true;
                    mergeVNodeHook(oldData, 'afterLeave', function () {
                        this$1._leaving = false;
                        this$1.$forceUpdate();
                    });
                    return placeholder(h, rawChild)
                } else if (mode === 'in-out') {
                    if (isAsyncPlaceholder(child)) {
                        return oldRawChild
                    }
                    var delayedLeave;
                    var performLeave = function () { delayedLeave(); };
                    mergeVNodeHook(data, 'afterEnter', performLeave);
                    mergeVNodeHook(data, 'enterCancelled', performLeave);
                    mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
                }
            }

            return rawChild
        }
    };

/*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final desired state. This way in the second pass removed
// nodes will remain where they should be.

    var props = extend({
        tag: String,
        moveClass: String
    }, transitionProps);

    delete props.mode;

    var TransitionGroup = {
        props: props,

        render: function render (h) {
            var tag = this.tag || this.$vnode.data.tag || 'span';
            var map = Object.create(null);
            var prevChildren = this.prevChildren = this.children;
            var rawChildren = this.$slots.default || [];
            var children = this.children = [];
            var transitionData = extractTransitionData(this);

            for (var i = 0; i < rawChildren.length; i++) {
                var c = rawChildren[i];
                if (c.tag) {
                    if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
                        children.push(c);
                        map[c.key] = c
                            ;(c.data || (c.data = {})).transition = transitionData;
                    } else {
                        var opts = c.componentOptions;
                        var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
                        warn(("<transition-group> children must be keyed: <" + name + ">"));
                    }
                }
            }

            if (prevChildren) {
                var kept = [];
                var removed = [];
                for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
                    var c$1 = prevChildren[i$1];
                    c$1.data.transition = transitionData;
                    c$1.data.pos = c$1.elm.getBoundingClientRect();
                    if (map[c$1.key]) {
                        kept.push(c$1);
                    } else {
                        removed.push(c$1);
                    }
                }
                this.kept = h(tag, null, kept);
                this.removed = removed;
            }

            return h(tag, null, children)
        },

        beforeUpdate: function beforeUpdate () {
            // force removing pass
            this.__patch__(
                this._vnode,
                this.kept,
                false, // hydrating
                true // removeOnly (!important, avoids unnecessary moves)
            );
            this._vnode = this.kept;
        },

        updated: function updated () {
            var children = this.prevChildren;
            var moveClass = this.moveClass || ((this.name || 'v') + '-move');
            if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
                return
            }

            // we divide the work into three loops to avoid mixing DOM reads and writes
            // in each iteration - which helps prevent layout thrashing.
            children.forEach(callPendingCbs);
            children.forEach(recordPosition);
            children.forEach(applyTranslation);

            // force reflow to put everything in position
            // assign to this to avoid being removed in tree-shaking
            // $flow-disable-line
            this._reflow = document.body.offsetHeight;

            children.forEach(function (c) {
                if (c.data.moved) {
                    var el = c.elm;
                    var s = el.style;
                    addTransitionClass(el, moveClass);
                    s.transform = s.WebkitTransform = s.transitionDuration = '';
                    el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
                        if (!e || /transform$/.test(e.propertyName)) {
                            el.removeEventListener(transitionEndEvent, cb);
                            el._moveCb = null;
                            removeTransitionClass(el, moveClass);
                        }
                    });
                }
            });
        },

        methods: {
            hasMove: function hasMove (el, moveClass) {
                /* istanbul ignore if */
                if (!hasTransition) {
                    return false
                }
                /* istanbul ignore if */
                if (this._hasMove) {
                    return this._hasMove
                }
                // Detect whether an element with the move class applied has
                // CSS transitions. Since the element may be inside an entering
                // transition at this very moment, we make a clone of it and remove
                // all other transition classes applied to ensure only the move class
                // is applied.
                var clone = el.cloneNode();
                if (el._transitionClasses) {
                    el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
                }
                addClass(clone, moveClass);
                clone.style.display = 'none';
                this.$el.appendChild(clone);
                var info = getTransitionInfo(clone);
                this.$el.removeChild(clone);
                return (this._hasMove = info.hasTransform)
            }
        }
    };

    function callPendingCbs (c) {
        /* istanbul ignore if */
        if (c.elm._moveCb) {
            c.elm._moveCb();
        }
        /* istanbul ignore if */
        if (c.elm._enterCb) {
            c.elm._enterCb();
        }
    }

    function recordPosition (c) {
        c.data.newPos = c.elm.getBoundingClientRect();
    }

    function applyTranslation (c) {
        var oldPos = c.data.pos;
        var newPos = c.data.newPos;
        var dx = oldPos.left - newPos.left;
        var dy = oldPos.top - newPos.top;
        if (dx || dy) {
            c.data.moved = true;
            var s = c.elm.style;
            s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
            s.transitionDuration = '0s';
        }
    }

    var platformComponents = {
        Transition: Transition,
        TransitionGroup: TransitionGroup
    };

/*  */

// install platform specific utils
    Vue$3.config.mustUseProp = mustUseProp;
    Vue$3.config.isReservedTag = isReservedTag;
    Vue$3.config.isReservedAttr = isReservedAttr;
    Vue$3.config.getTagNamespace = getTagNamespace;
    Vue$3.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
    extend(Vue$3.options.directives, platformDirectives);
    extend(Vue$3.options.components, platformComponents);

// install platform patch function
    Vue$3.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
    Vue$3.prototype.$mount = function (
        el,
        hydrating
    ) {
        el = el && inBrowser ? query(el) : undefined;
        return mountComponent(this, el, hydrating)
    };

// devtools global hook
/* istanbul ignore next */
    Vue$3.nextTick(function () {
        if (config.devtools) {
            if (devtools) {
                devtools.emit('init', Vue$3);
            } else if ("development" !== 'production' && isChrome) {
                console[console.info ? 'info' : 'log'](
                    'Download the Vue Devtools extension for a better development experience:\n' +
                    'https://github.com/vuejs/vue-devtools'
                );
            }
        }
        if ("development" !== 'production' &&
            config.productionTip !== false &&
            inBrowser && typeof console !== 'undefined'
        ) {
            console[console.info ? 'info' : 'log'](
                "You are running Vue in development mode.\n" +
                "Make sure to turn on production mode when deploying for production.\n" +
                "See more tips at https://vuejs.org/guide/deployment.html"
            );
        }
    }, 0);

/*  */

// check whether current browser encodes a char inside attribute values
    function shouldDecode (content, encoded) {
        var div = document.createElement('div');
        div.innerHTML = "<div a=\"" + content + "\"/>";
        return div.innerHTML.indexOf(encoded) > 0
    }

// #3663
// IE encodes newlines inside attribute values while other browsers don't
    var shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false;

/*  */

    var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
    var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

    var buildRegex = cached(function (delimiters) {
        var open = delimiters[0].replace(regexEscapeRE, '\\$&');
        var close = delimiters[1].replace(regexEscapeRE, '\\$&');
        return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
    });

    function parseText (
        text,
        delimiters
    ) {
        var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
        if (!tagRE.test(text)) {
            return
        }
        var tokens = [];
        var lastIndex = tagRE.lastIndex = 0;
        var match, index;
        while ((match = tagRE.exec(text))) {
            index = match.index;
            // push text token
            if (index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            // tag token
            var exp = parseFilters(match[1].trim());
            tokens.push(("_s(" + exp + ")"));
            lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return tokens.join('+')
    }

/*  */

    function transformNode (el, options) {
        var warn = options.warn || baseWarn;
        var staticClass = getAndRemoveAttr(el, 'class');
        if ("development" !== 'production' && staticClass) {
            var expression = parseText(staticClass, options.delimiters);
            if (expression) {
                warn(
                    "class=\"" + staticClass + "\": " +
                    'Interpolation inside attributes has been removed. ' +
                    'Use v-bind or the colon shorthand instead. For example, ' +
                    'instead of <div class="{{ val }}">, use <div :class="val">.'
                );
            }
        }
        if (staticClass) {
            el.staticClass = JSON.stringify(staticClass);
        }
        var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
        if (classBinding) {
            el.classBinding = classBinding;
        }
    }

    function genData (el) {
        var data = '';
        if (el.staticClass) {
            data += "staticClass:" + (el.staticClass) + ",";
        }
        if (el.classBinding) {
            data += "class:" + (el.classBinding) + ",";
        }
        return data
    }

    var klass$1 = {
        staticKeys: ['staticClass'],
        transformNode: transformNode,
        genData: genData
    };

/*  */

    function transformNode$1 (el, options) {
        var warn = options.warn || baseWarn;
        var staticStyle = getAndRemoveAttr(el, 'style');
        if (staticStyle) {
            /* istanbul ignore if */
            {
                var expression = parseText(staticStyle, options.delimiters);
                if (expression) {
                    warn(
                        "style=\"" + staticStyle + "\": " +
                        'Interpolation inside attributes has been removed. ' +
                        'Use v-bind or the colon shorthand instead. For example, ' +
                        'instead of <div style="{{ val }}">, use <div :style="val">.'
                    );
                }
            }
            el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
        }

        var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
        if (styleBinding) {
            el.styleBinding = styleBinding;
        }
    }

    function genData$1 (el) {
        var data = '';
        if (el.staticStyle) {
            data += "staticStyle:" + (el.staticStyle) + ",";
        }
        if (el.styleBinding) {
            data += "style:(" + (el.styleBinding) + "),";
        }
        return data
    }

    var style$1 = {
        staticKeys: ['staticStyle'],
        transformNode: transformNode$1,
        genData: genData$1
    };

/*  */

    var decoder;

    var he = {
        decode: function decode (html) {
            decoder = decoder || document.createElement('div');
            decoder.innerHTML = html;
            return decoder.textContent
        }
    };

/*  */

    var isUnaryTag = makeMap(
        'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
        'link,meta,param,source,track,wbr'
    );

// Elements that you can, intentionally, leave open
// (and which close themselves)
    var canBeLeftOpenTag = makeMap(
        'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
    );

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
    var isNonPhrasingTag = makeMap(
        'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
        'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
        'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
        'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
        'title,tr,track'
    );

/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

// Regular Expressions for parsing tags and attributes
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
    var ncname = '[a-zA-Z_][\\w\\-\\.]*';
    var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
    var startTagOpen = new RegExp(("^<" + qnameCapture));
    var startTagClose = /^\s*(\/?)>/;
    var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
    var doctype = /^<!DOCTYPE [^>]+>/i;
    var comment = /^<!--/;
    var conditionalComment = /^<!\[/;

    var IS_REGEX_CAPTURING_BROKEN = false;
    'x'.replace(/x(.)?/g, function (m, g) {
        IS_REGEX_CAPTURING_BROKEN = g === '';
    });

// Special Elements (can contain anything)
    var isPlainTextElement = makeMap('script,style,textarea', true);
    var reCache = {};

    var decodingMap = {
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&amp;': '&',
        '&#10;': '\n'
    };
    var encodedAttr = /&(?:lt|gt|quot|amp);/g;
    var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10);/g;

// #5992
    var isIgnoreNewlineTag = makeMap('pre,textarea', true);
    var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };

    function decodeAttr (value, shouldDecodeNewlines) {
        var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
        return value.replace(re, function (match) { return decodingMap[match]; })
    }

    function parseHTML (html, options) {
        var stack = [];
        var expectHTML = options.expectHTML;
        var isUnaryTag$$1 = options.isUnaryTag || no;
        var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
        var index = 0;
        var last, lastTag;
        while (html) {
            last = html;
            // Make sure we're not in a plaintext content element like script/style
            if (!lastTag || !isPlainTextElement(lastTag)) {
                var textEnd = html.indexOf('<');
                if (textEnd === 0) {
                    // Comment:
                    if (comment.test(html)) {
                        var commentEnd = html.indexOf('-->');

                        if (commentEnd >= 0) {
                            if (options.shouldKeepComment) {
                                options.comment(html.substring(4, commentEnd));
                            }
                            advance(commentEnd + 3);
                            continue
                        }
                    }

                    // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                    if (conditionalComment.test(html)) {
                        var conditionalEnd = html.indexOf(']>');

                        if (conditionalEnd >= 0) {
                            advance(conditionalEnd + 2);
                            continue
                        }
                    }

                    // Doctype:
                    var doctypeMatch = html.match(doctype);
                    if (doctypeMatch) {
                        advance(doctypeMatch[0].length);
                        continue
                    }

                    // End tag:
                    var endTagMatch = html.match(endTag);
                    if (endTagMatch) {
                        var curIndex = index;
                        advance(endTagMatch[0].length);
                        parseEndTag(endTagMatch[1], curIndex, index);
                        continue
                    }

                    // Start tag:
                    var startTagMatch = parseStartTag();
                    if (startTagMatch) {
                        handleStartTag(startTagMatch);
                        if (shouldIgnoreFirstNewline(lastTag, html)) {
                            advance(1);
                        }
                        continue
                    }
                }

                var text = (void 0), rest = (void 0), next = (void 0);
                if (textEnd >= 0) {
                    rest = html.slice(textEnd);
                    while (
                        !endTag.test(rest) &&
                            !startTagOpen.test(rest) &&
                            !comment.test(rest) &&
                            !conditionalComment.test(rest)
                    ) {
                        // < in plain text, be forgiving and treat it as text
                        next = rest.indexOf('<', 1);
                        if (next < 0) { break }
                        textEnd += next;
                        rest = html.slice(textEnd);
                    }
                    text = html.substring(0, textEnd);
                    advance(textEnd);
                }

                if (textEnd < 0) {
                    text = html;
                    html = '';
                }

                if (options.chars && text) {
                    options.chars(text);
                }
            } else {
                var endTagLength = 0;
                var stackedTag = lastTag.toLowerCase();
                var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
                var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
                    endTagLength = endTag.length;
                    if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
                        text = text
                            .replace(/<!--([\s\S]*?)-->/g, '$1')
                            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
                    }
                    if (shouldIgnoreFirstNewline(stackedTag, text)) {
                        text = text.slice(1);
                    }
                    if (options.chars) {
                        options.chars(text);
                    }
                    return ''
                });
                index += html.length - rest$1.length;
                html = rest$1;
                parseEndTag(stackedTag, index - endTagLength, index);
            }

            if (html === last) {
                options.chars && options.chars(html);
                if ("development" !== 'production' && !stack.length && options.warn) {
                    options.warn(("Mal-formatted tag at end of template: \"" + html + "\""));
                }
                break
            }
        }

        // Clean up any remaining tags
        parseEndTag();

        function advance (n) {
            index += n;
            html = html.substring(n);
        }

        function parseStartTag () {
            var start = html.match(startTagOpen);
            if (start) {
                var match = {
                    tagName: start[1],
                    attrs: [],
                    start: index
                };
                advance(start[0].length);
                var end, attr;
                while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                    advance(attr[0].length);
                    match.attrs.push(attr);
                }
                if (end) {
                    match.unarySlash = end[1];
                    advance(end[0].length);
                    match.end = index;
                    return match
                }
            }
        }

        function handleStartTag (match) {
            var tagName = match.tagName;
            var unarySlash = match.unarySlash;

            if (expectHTML) {
                if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                    parseEndTag(lastTag);
                }
                if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
                    parseEndTag(tagName);
                }
            }

            var unary = isUnaryTag$$1(tagName) || !!unarySlash;

            var l = match.attrs.length;
            var attrs = new Array(l);
            for (var i = 0; i < l; i++) {
                var args = match.attrs[i];
                // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
                if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
                    if (args[3] === '') { delete args[3]; }
                    if (args[4] === '') { delete args[4]; }
                    if (args[5] === '') { delete args[5]; }
                }
                var value = args[3] || args[4] || args[5] || '';
                attrs[i] = {
                    name: args[1],
                    value: decodeAttr(
                        value,
                        options.shouldDecodeNewlines
                    )
                };
            }

            if (!unary) {
                stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });
                lastTag = tagName;
            }

            if (options.start) {
                options.start(tagName, attrs, unary, match.start, match.end);
            }
        }

        function parseEndTag (tagName, start, end) {
            var pos, lowerCasedTagName;
            if (start == null) { start = index; }
            if (end == null) { end = index; }

            if (tagName) {
                lowerCasedTagName = tagName.toLowerCase();
            }

            // Find the closest opened tag of the same type
            if (tagName) {
                for (pos = stack.length - 1; pos >= 0; pos--) {
                    if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                        break
                    }
                }
            } else {
                // If no tag name is provided, clean shop
                pos = 0;
            }

            if (pos >= 0) {
                // Close all the open elements, up the stack
                for (var i = stack.length - 1; i >= pos; i--) {
                    if ("development" !== 'production' &&
                        (i > pos || !tagName) &&
                        options.warn
                    ) {
                        options.warn(
                            ("tag <" + (stack[i].tag) + "> has no matching end tag.")
                        );
                    }
                    if (options.end) {
                        options.end(stack[i].tag, start, end);
                    }
                }

                // Remove the open elements from the stack
                stack.length = pos;
                lastTag = pos && stack[pos - 1].tag;
            } else if (lowerCasedTagName === 'br') {
                if (options.start) {
                    options.start(tagName, [], true, start, end);
                }
            } else if (lowerCasedTagName === 'p') {
                if (options.start) {
                    options.start(tagName, [], false, start, end);
                }
                if (options.end) {
                    options.end(tagName, start, end);
                }
            }
        }
    }

/*  */

    var onRE = /^@|^v-on:/;
    var dirRE = /^v-|^@|^:/;
    var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
    var forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;

    var argRE = /:(.*)$/;
    var bindRE = /^:|^v-bind:/;
    var modifierRE = /\.[^.]+/g;

    var decodeHTMLCached = cached(he.decode);

// configurable state
    var warn$2;
    var delimiters;
    var transforms;
    var preTransforms;
    var postTransforms;
    var platformIsPreTag;
    var platformMustUseProp;
    var platformGetTagNamespace;



    function createASTElement (
        tag,
        attrs,
        parent
    ) {
        return {
            type: 1,
            tag: tag,
            attrsList: attrs,
            attrsMap: makeAttrsMap(attrs),
            parent: parent,
            children: []
        }
    }

/**
 * Convert HTML string to AST.
 */
    function parse (
        template,
        options
    ) {
        warn$2 = options.warn || baseWarn;

        platformIsPreTag = options.isPreTag || no;
        platformMustUseProp = options.mustUseProp || no;
        platformGetTagNamespace = options.getTagNamespace || no;

        transforms = pluckModuleFunction(options.modules, 'transformNode');
        preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
        postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

        delimiters = options.delimiters;

        var stack = [];
        var preserveWhitespace = options.preserveWhitespace !== false;
        var root;
        var currentParent;
        var inVPre = false;
        var inPre = false;
        var warned = false;

        function warnOnce (msg) {
            if (!warned) {
                warned = true;
                warn$2(msg);
            }
        }

        function endPre (element) {
            // check pre state
            if (element.pre) {
                inVPre = false;
            }
            if (platformIsPreTag(element.tag)) {
                inPre = false;
            }
        }

        parseHTML(template, {
            warn: warn$2,
            expectHTML: options.expectHTML,
            isUnaryTag: options.isUnaryTag,
            canBeLeftOpenTag: options.canBeLeftOpenTag,
            shouldDecodeNewlines: options.shouldDecodeNewlines,
            shouldKeepComment: options.comments,
            start: function start (tag, attrs, unary) {
                // check namespace.
                // inherit parent ns if there is one
                var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

                // handle IE svg bug
                /* istanbul ignore if */
                if (isIE && ns === 'svg') {
                    attrs = guardIESVGBug(attrs);
                }

                var element = createASTElement(tag, attrs, currentParent);
                if (ns) {
                    element.ns = ns;
                }

                if (isForbiddenTag(element) && !isServerRendering()) {
                    element.forbidden = true;
                    "development" !== 'production' && warn$2(
                        'Templates should only be responsible for mapping the state to the ' +
                        'UI. Avoid placing tags with side-effects in your templates, such as ' +
                        "<" + tag + ">" + ', as they will not be parsed.'
                    );
                }

                // apply pre-transforms
                for (var i = 0; i < preTransforms.length; i++) {
                    element = preTransforms[i](element, options) || element;
                }

                if (!inVPre) {
                    processPre(element);
                    if (element.pre) {
                        inVPre = true;
                    }
                }
                if (platformIsPreTag(element.tag)) {
                    inPre = true;
                }
                if (inVPre) {
                    processRawAttrs(element);
                } else if (!element.processed) {
                    // structural directives
                    processFor(element);
                    processIf(element);
                    processOnce(element);
                    // element-scope stuff
                    processElement(element, options);
                }

                function checkRootConstraints (el) {
                    {
                        if (el.tag === 'slot' || el.tag === 'template') {
                            warnOnce(
                                "Cannot use <" + (el.tag) + "> as component root element because it may " +
                                'contain multiple nodes.'
                            );
                        }
                        if (el.attrsMap.hasOwnProperty('v-for')) {
                            warnOnce(
                                'Cannot use v-for on stateful component root element because ' +
                                'it renders multiple elements.'
                            );
                        }
                    }
                }

                // tree management
                if (!root) {
                    root = element;
                    checkRootConstraints(root);
                } else if (!stack.length) {
                    // allow root elements with v-if, v-else-if and v-else
                    if (root.if && (element.elseif || element.else)) {
                        checkRootConstraints(element);
                        addIfCondition(root, {
                            exp: element.elseif,
                            block: element
                        });
                    } else {
                        warnOnce(
                            "Component template should contain exactly one root element. " +
                            "If you are using v-if on multiple elements, " +
                            "use v-else-if to chain them instead."
                        );
                    }
                }
                if (currentParent && !element.forbidden) {
                    if (element.elseif || element.else) {
                        processIfConditions(element, currentParent);
                    } else if (element.slotScope) { // scoped slot
                        currentParent.plain = false;
                        var name = element.slotTarget || '"default"';(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
                    } else {
                        currentParent.children.push(element);
                        element.parent = currentParent;
                    }
                }
                if (!unary) {
                    currentParent = element;
                    stack.push(element);
                } else {
                    endPre(element);
                }
                // apply post-transforms
                for (var i$1 = 0; i$1 < postTransforms.length; i$1++) {
                    postTransforms[i$1](element, options);
                }
            },

            end: function end () {
                // remove trailing whitespace
                var element = stack[stack.length - 1];
                var lastNode = element.children[element.children.length - 1];
                if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
                    element.children.pop();
                }
                // pop stack
                stack.length -= 1;
                currentParent = stack[stack.length - 1];
                endPre(element);
            },

            chars: function chars (text) {
                if (!currentParent) {
                    {
                        if (text === template) {
                            warnOnce(
                                'Component template requires a root element, rather than just text.'
                            );
                        } else if ((text = text.trim())) {
                            warnOnce(
                                ("text \"" + text + "\" outside root element will be ignored.")
                            );
                        }
                    }
                    return
                }
                // IE textarea placeholder bug
                /* istanbul ignore if */
                if (isIE &&
                    currentParent.tag === 'textarea' &&
                    currentParent.attrsMap.placeholder === text
                ) {
                    return
                }
                var children = currentParent.children;
                text = inPre || text.trim()
                    ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
                    // only preserve whitespace if its not right after a starting tag
                    : preserveWhitespace && children.length ? ' ' : '';
                if (text) {
                    var expression;
                    if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
                        children.push({
                            type: 2,
                            expression: expression,
                            text: text
                        });
                    } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
                        children.push({
                            type: 3,
                            text: text
                        });
                    }
                }
            },
            comment: function comment (text) {
                currentParent.children.push({
                    type: 3,
                    text: text,
                    isComment: true
                });
            }
        });
        return root
    }

    function processPre (el) {
        if (getAndRemoveAttr(el, 'v-pre') != null) {
            el.pre = true;
        }
    }

    function processRawAttrs (el) {
        var l = el.attrsList.length;
        if (l) {
            var attrs = el.attrs = new Array(l);
            for (var i = 0; i < l; i++) {
                attrs[i] = {
                    name: el.attrsList[i].name,
                    value: JSON.stringify(el.attrsList[i].value)
                };
            }
        } else if (!el.pre) {
            // non root node in pre blocks with no attributes
            el.plain = true;
        }
    }

    function processElement (element, options) {
        processKey(element);

        // determine whether this is a plain element after
        // removing structural attributes
        element.plain = !element.key && !element.attrsList.length;

        processRef(element);
        processSlot(element);
        processComponent(element);
        for (var i = 0; i < transforms.length; i++) {
            element = transforms[i](element, options) || element;
        }
        processAttrs(element);
    }

    function processKey (el) {
        var exp = getBindingAttr(el, 'key');
        if (exp) {
            if ("development" !== 'production' && el.tag === 'template') {
                warn$2("<template> cannot be keyed. Place the key on real elements instead.");
            }
            el.key = exp;
        }
    }

    function processRef (el) {
        var ref = getBindingAttr(el, 'ref');
        if (ref) {
            el.ref = ref;
            el.refInFor = checkInFor(el);
        }
    }

    function processFor (el) {
        var exp;
        if ((exp = getAndRemoveAttr(el, 'v-for'))) {
            var inMatch = exp.match(forAliasRE);
            if (!inMatch) {
                "development" !== 'production' && warn$2(
                    ("Invalid v-for expression: " + exp)
                );
                return
            }
            el.for = inMatch[2].trim();
            var alias = inMatch[1].trim();
            var iteratorMatch = alias.match(forIteratorRE);
            if (iteratorMatch) {
                el.alias = iteratorMatch[1].trim();
                el.iterator1 = iteratorMatch[2].trim();
                if (iteratorMatch[3]) {
                    el.iterator2 = iteratorMatch[3].trim();
                }
            } else {
                el.alias = alias;
            }
        }
    }

    function processIf (el) {
        var exp = getAndRemoveAttr(el, 'v-if');
        if (exp) {
            el.if = exp;
            addIfCondition(el, {
                exp: exp,
                block: el
            });
        } else {
            if (getAndRemoveAttr(el, 'v-else') != null) {
                el.else = true;
            }
            var elseif = getAndRemoveAttr(el, 'v-else-if');
            if (elseif) {
                el.elseif = elseif;
            }
        }
    }

    function processIfConditions (el, parent) {
        var prev = findPrevElement(parent.children);
        if (prev && prev.if) {
            addIfCondition(prev, {
                exp: el.elseif,
                block: el
            });
        } else {
            warn$2(
                "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
                "used on element <" + (el.tag) + "> without corresponding v-if."
            );
        }
    }

    function findPrevElement (children) {
        var i = children.length;
        while (i--) {
            if (children[i].type === 1) {
                return children[i]
            } else {
                if ("development" !== 'production' && children[i].text !== ' ') {
                    warn$2(
                        "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
                        "will be ignored."
                    );
                }
                children.pop();
            }
        }
    }

    function addIfCondition (el, condition) {
        if (!el.ifConditions) {
            el.ifConditions = [];
        }
        el.ifConditions.push(condition);
    }

    function processOnce (el) {
        var once$$1 = getAndRemoveAttr(el, 'v-once');
        if (once$$1 != null) {
            el.once = true;
        }
    }

    function processSlot (el) {
        if (el.tag === 'slot') {
            el.slotName = getBindingAttr(el, 'name');
            if ("development" !== 'production' && el.key) {
                warn$2(
                    "`key` does not work on <slot> because slots are abstract outlets " +
                    "and can possibly expand into multiple elements. " +
                    "Use the key on a wrapping element instead."
                );
            }
        } else {
            var slotScope;
            if (el.tag === 'template') {
                slotScope = getAndRemoveAttr(el, 'scope');
                /* istanbul ignore if */
                if ("development" !== 'production' && slotScope) {
                    warn$2(
                        "the \"scope\" attribute for scoped slots have been deprecated and " +
                        "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " +
                        "can also be used on plain elements in addition to <template> to " +
                        "denote scoped slots.",
                        true
                    );
                }
                el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
            } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
                el.slotScope = slotScope;
            }
            var slotTarget = getBindingAttr(el, 'slot');
            if (slotTarget) {
                el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
                // preserve slot as an attribute for native shadow DOM compat
                // only for non-scoped slots.
                if (!el.slotScope) {
                    addAttr(el, 'slot', slotTarget);
                }
            }
        }
    }

    function processComponent (el) {
        var binding;
        if ((binding = getBindingAttr(el, 'is'))) {
            el.component = binding;
        }
        if (getAndRemoveAttr(el, 'inline-template') != null) {
            el.inlineTemplate = true;
        }
    }

    function processAttrs (el) {
        var list = el.attrsList;
        var i, l, name, rawName, value, modifiers, isProp;
        for (i = 0, l = list.length; i < l; i++) {
            name = rawName = list[i].name;
            value = list[i].value;
            if (dirRE.test(name)) {
                // mark element as dynamic
                el.hasBindings = true;
                // modifiers
                modifiers = parseModifiers(name);
                if (modifiers) {
                    name = name.replace(modifierRE, '');
                }
                if (bindRE.test(name)) { // v-bind
                    name = name.replace(bindRE, '');
                    value = parseFilters(value);
                    isProp = false;
                    if (modifiers) {
                        if (modifiers.prop) {
                            isProp = true;
                            name = camelize(name);
                            if (name === 'innerHtml') { name = 'innerHTML'; }
                        }
                        if (modifiers.camel) {
                            name = camelize(name);
                        }
                        if (modifiers.sync) {
                            addHandler(
                                el,
                                ("update:" + (camelize(name))),
                                genAssignmentCode(value, "$event")
                            );
                        }
                    }
                    if (isProp || (
                        !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
                    )) {
                        addProp(el, name, value);
                    } else {
                        addAttr(el, name, value);
                    }
                } else if (onRE.test(name)) { // v-on
                    name = name.replace(onRE, '');
                    addHandler(el, name, value, modifiers, false, warn$2);
                } else { // normal directives
                    name = name.replace(dirRE, '');
                    // parse arg
                    var argMatch = name.match(argRE);
                    var arg = argMatch && argMatch[1];
                    if (arg) {
                        name = name.slice(0, -(arg.length + 1));
                    }
                    addDirective(el, name, rawName, value, arg, modifiers);
                    if ("development" !== 'production' && name === 'model') {
                        checkForAliasModel(el, value);
                    }
                }
            } else {
                // literal attribute
                {
                    var expression = parseText(value, delimiters);
                    if (expression) {
                        warn$2(
                            name + "=\"" + value + "\": " +
                            'Interpolation inside attributes has been removed. ' +
                            'Use v-bind or the colon shorthand instead. For example, ' +
                            'instead of <div id="{{ val }}">, use <div :id="val">.'
                        );
                    }
                }
                addAttr(el, name, JSON.stringify(value));
            }
        }
    }

    function checkInFor (el) {
        var parent = el;
        while (parent) {
            if (parent.for !== undefined) {
                return true
            }
            parent = parent.parent;
        }
        return false
    }

    function parseModifiers (name) {
        var match = name.match(modifierRE);
        if (match) {
            var ret = {};
            match.forEach(function (m) { ret[m.slice(1)] = true; });
            return ret
        }
    }

    function makeAttrsMap (attrs) {
        var map = {};
        for (var i = 0, l = attrs.length; i < l; i++) {
            if (
                "development" !== 'production' &&
                    map[attrs[i].name] && !isIE && !isEdge
            ) {
                warn$2('duplicate attribute: ' + attrs[i].name);
            }
            map[attrs[i].name] = attrs[i].value;
        }
        return map
    }

// for script (e.g. type="x/template") or style, do not decode content
    function isTextTag (el) {
        return el.tag === 'script' || el.tag === 'style'
    }

    function isForbiddenTag (el) {
        return (
            el.tag === 'style' ||
            (el.tag === 'script' && (
                !el.attrsMap.type ||
                    el.attrsMap.type === 'text/javascript'
            ))
        )
    }

    var ieNSBug = /^xmlns:NS\d+/;
    var ieNSPrefix = /^NS\d+:/;

/* istanbul ignore next */
    function guardIESVGBug (attrs) {
        var res = [];
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            if (!ieNSBug.test(attr.name)) {
                attr.name = attr.name.replace(ieNSPrefix, '');
                res.push(attr);
            }
        }
        return res
    }

    function checkForAliasModel (el, value) {
        var _el = el;
        while (_el) {
            if (_el.for && _el.alias === value) {
                warn$2(
                    "<" + (el.tag) + " v-model=\"" + value + "\">: " +
                    "You are binding v-model directly to a v-for iteration alias. " +
                    "This will not be able to modify the v-for source array because " +
                    "writing to the alias is like modifying a function local variable. " +
                    "Consider using an array of objects and use v-model on an object property instead."
                );
            }
            _el = _el.parent;
        }
    }

/*  */

/**
 * Expand input[v-model] with dyanmic type bindings into v-if-else chains
 * Turn this:
 *   <input v-model="data[type]" :type="type">
 * into this:
 *   <input v-if="type === 'checkbox'" type="checkbox" v-model="data[type]">
 *   <input v-else-if="type === 'radio'" type="radio" v-model="data[type]">
 *   <input v-else :type="type" v-model="data[type]">
 */

    function preTransformNode (el, options) {
        if (el.tag === 'input') {
            var map = el.attrsMap;
            if (map['v-model'] && (map['v-bind:type'] || map[':type'])) {
                var typeBinding = getBindingAttr(el, 'type');
                var ifCondition = getAndRemoveAttr(el, 'v-if', true);
                var ifConditionExtra = ifCondition ? ("&&(" + ifCondition + ")") : "";
                // 1. checkbox
                var branch0 = cloneASTElement(el);
                // process for on the main node
                processFor(branch0);
                addRawAttr(branch0, 'type', 'checkbox');
                processElement(branch0, options);
                branch0.processed = true; // prevent it from double-processed
                branch0.if = "(" + typeBinding + ")==='checkbox'" + ifConditionExtra;
                addIfCondition(branch0, {
                    exp: branch0.if,
                    block: branch0
                });
                // 2. add radio else-if condition
                var branch1 = cloneASTElement(el);
                getAndRemoveAttr(branch1, 'v-for', true);
                addRawAttr(branch1, 'type', 'radio');
                processElement(branch1, options);
                addIfCondition(branch0, {
                    exp: "(" + typeBinding + ")==='radio'" + ifConditionExtra,
                    block: branch1
                });
                // 3. other
                var branch2 = cloneASTElement(el);
                getAndRemoveAttr(branch2, 'v-for', true);
                addRawAttr(branch2, ':type', typeBinding);
                processElement(branch2, options);
                addIfCondition(branch0, {
                    exp: ifCondition,
                    block: branch2
                });
                return branch0
            }
        }
    }

    function cloneASTElement (el) {
        return createASTElement(el.tag, el.attrsList.slice(), el.parent)
    }

    function addRawAttr (el, name, value) {
        el.attrsMap[name] = value;
        el.attrsList.push({ name: name, value: value });
    }

    var model$2 = {
        preTransformNode: preTransformNode
    };

    var modules$1 = [
        klass$1,
        style$1,
        model$2
    ];

/*  */

    function text (el, dir) {
        if (dir.value) {
            addProp(el, 'textContent', ("_s(" + (dir.value) + ")"));
        }
    }

/*  */

    function html (el, dir) {
        if (dir.value) {
            addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"));
        }
    }

    var directives$1 = {
        model: model,
        text: text,
        html: html
    };

/*  */

    var baseOptions = {
        expectHTML: true,
        modules: modules$1,
        directives: directives$1,
        isPreTag: isPreTag,
        isUnaryTag: isUnaryTag,
        mustUseProp: mustUseProp,
        canBeLeftOpenTag: canBeLeftOpenTag,
        isReservedTag: isReservedTag,
        getTagNamespace: getTagNamespace,
        staticKeys: genStaticKeys(modules$1)
    };

/*  */

    var isStaticKey;
    var isPlatformReservedTag;

    var genStaticKeysCached = cached(genStaticKeys$1);

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
    function optimize (root, options) {
        if (!root) { return }
        isStaticKey = genStaticKeysCached(options.staticKeys || '');
        isPlatformReservedTag = options.isReservedTag || no;
        // first pass: mark all non-static nodes.
        markStatic$1(root);
        // second pass: mark static roots.
        markStaticRoots(root, false);
    }

    function genStaticKeys$1 (keys) {
        return makeMap(
            'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
            (keys ? ',' + keys : '')
        )
    }

    function markStatic$1 (node) {
        node.static = isStatic(node);
        if (node.type === 1) {
            // do not make component slot content static. this avoids
            // 1. components not able to mutate slot nodes
            // 2. static slot content fails for hot-reloading
            if (
                !isPlatformReservedTag(node.tag) &&
                    node.tag !== 'slot' &&
                    node.attrsMap['inline-template'] == null
            ) {
                return
            }
            for (var i = 0, l = node.children.length; i < l; i++) {
                var child = node.children[i];
                markStatic$1(child);
                if (!child.static) {
                    node.static = false;
                }
            }
            if (node.ifConditions) {
                for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
                    var block = node.ifConditions[i$1].block;
                    markStatic$1(block);
                    if (!block.static) {
                        node.static = false;
                    }
                }
            }
        }
    }

    function markStaticRoots (node, isInFor) {
        if (node.type === 1) {
            if (node.static || node.once) {
                node.staticInFor = isInFor;
            }
            // For a node to qualify as a static root, it should have children that
            // are not just static text. Otherwise the cost of hoisting out will
            // outweigh the benefits and it's better off to just always render it fresh.
            if (node.static && node.children.length && !(
                node.children.length === 1 &&
                    node.children[0].type === 3
            )) {
                node.staticRoot = true;
                return
            } else {
                node.staticRoot = false;
            }
            if (node.children) {
                for (var i = 0, l = node.children.length; i < l; i++) {
                    markStaticRoots(node.children[i], isInFor || !!node.for);
                }
            }
            if (node.ifConditions) {
                for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
                    markStaticRoots(node.ifConditions[i$1].block, isInFor);
                }
            }
        }
    }

    function isStatic (node) {
        if (node.type === 2) { // expression
            return false
        }
        if (node.type === 3) { // text
            return true
        }
        return !!(node.pre || (
            !node.hasBindings && // no dynamic bindings
                !node.if && !node.for && // not v-if or v-for or v-else
                !isBuiltInTag(node.tag) && // not a built-in
                isPlatformReservedTag(node.tag) && // not a component
                !isDirectChildOfTemplateFor(node) &&
                Object.keys(node).every(isStaticKey)
        ))
    }

    function isDirectChildOfTemplateFor (node) {
        while (node.parent) {
            node = node.parent;
            if (node.tag !== 'template') {
                return false
            }
            if (node.for) {
                return true
            }
        }
        return false
    }

/*  */

    var fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
    var simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/;

// keyCode aliases
    var keyCodes = {
        esc: 27,
        tab: 9,
        enter: 13,
        space: 32,
        up: 38,
        left: 37,
        right: 39,
        down: 40,
        'delete': [8, 46]
    };

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
    var genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

    var modifierCode = {
        stop: '$event.stopPropagation();',
        prevent: '$event.preventDefault();',
        self: genGuard("$event.target !== $event.currentTarget"),
        ctrl: genGuard("!$event.ctrlKey"),
        shift: genGuard("!$event.shiftKey"),
        alt: genGuard("!$event.altKey"),
        meta: genGuard("!$event.metaKey"),
        left: genGuard("'button' in $event && $event.button !== 0"),
        middle: genGuard("'button' in $event && $event.button !== 1"),
        right: genGuard("'button' in $event && $event.button !== 2")
    };

    function genHandlers (
        events,
        isNative,
        warn
    ) {
        var res = isNative ? 'nativeOn:{' : 'on:{';
        for (var name in events) {
            var handler = events[name];
            // #5330: warn click.right, since right clicks do not actually fire click events.
            if ("development" !== 'production' &&
                name === 'click' &&
                handler && handler.modifiers && handler.modifiers.right
            ) {
                warn(
                    "Use \"contextmenu\" instead of \"click.right\" since right clicks " +
                    "do not actually fire \"click\" events."
                );
            }
            res += "\"" + name + "\":" + (genHandler(name, handler)) + ",";
        }
        return res.slice(0, -1) + '}'
    }

    function genHandler (
        name,
        handler
    ) {
        if (!handler) {
            return 'function(){}'
        }

        if (Array.isArray(handler)) {
            return ("[" + (handler.map(function (handler) { return genHandler(name, handler); }).join(',')) + "]")
        }

        var isMethodPath = simplePathRE.test(handler.value);
        var isFunctionExpression = fnExpRE.test(handler.value);

        if (!handler.modifiers) {
            return isMethodPath || isFunctionExpression
                ? handler.value
                : ("function($event){" + (handler.value) + "}") // inline statement
        } else {
            var code = '';
            var genModifierCode = '';
            var keys = [];
            for (var key in handler.modifiers) {
                if (modifierCode[key]) {
                    genModifierCode += modifierCode[key];
                    // left/right
                    if (keyCodes[key]) {
                        keys.push(key);
                    }
                } else if (key === 'exact') {
                    var modifiers = (handler.modifiers);
                    genModifierCode += genGuard(
                        ['ctrl', 'shift', 'alt', 'meta']
                        .filter(function (keyModifier) { return !modifiers[keyModifier]; })
                        .map(function (keyModifier) { return ("$event." + keyModifier + "Key"); })
                        .join('||')
                    );
                } else {
                    keys.push(key);
                }
            }
            if (keys.length) {
                code += genKeyFilter(keys);
            }
            // Make sure modifiers like prevent and stop get executed after key filtering
            if (genModifierCode) {
                code += genModifierCode;
            }
            var handlerCode = isMethodPath
                ? handler.value + '($event)'
                : isFunctionExpression
                ? ("(" + (handler.value) + ")($event)")
                : handler.value;
            return ("function($event){" + code + handlerCode + "}")
        }
    }

    function genKeyFilter (keys) {
        return ("if(!('button' in $event)&&" + (keys.map(genFilterCode).join('&&')) + ")return null;")
    }

    function genFilterCode (key) {
        var keyVal = parseInt(key, 10);
        if (keyVal) {
            return ("$event.keyCode!==" + keyVal)
        }
        var code = keyCodes[key];
        return (
            "_k($event.keyCode," +
                (JSON.stringify(key)) + "," +
                (JSON.stringify(code)) + "," +
                "$event.key)"
        )
    }

/*  */

    function on (el, dir) {
        if ("development" !== 'production' && dir.modifiers) {
            warn("v-on without argument does not support modifiers.");
        }
        el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); };
    }

/*  */

    function bind$1 (el, dir) {
        el.wrapData = function (code) {
            return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
        };
    }

/*  */

    var baseDirectives = {
        on: on,
        bind: bind$1,
        cloak: noop
    };

/*  */

    var CodegenState = function CodegenState (options) {
        this.options = options;
        this.warn = options.warn || baseWarn;
        this.transforms = pluckModuleFunction(options.modules, 'transformCode');
        this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
        this.directives = extend(extend({}, baseDirectives), options.directives);
        var isReservedTag = options.isReservedTag || no;
        this.maybeComponent = function (el) { return !isReservedTag(el.tag); };
        this.onceId = 0;
        this.staticRenderFns = [];
    };



    function generate (
        ast,
        options
    ) {
        var state = new CodegenState(options);
        var code = ast ? genElement(ast, state) : '_c("div")';
        return {
            render: ("with(this){return " + code + "}"),
            staticRenderFns: state.staticRenderFns
        }
    }

    function genElement (el, state) {
        if (el.staticRoot && !el.staticProcessed) {
            return genStatic(el, state)
        } else if (el.once && !el.onceProcessed) {
            return genOnce(el, state)
        } else if (el.for && !el.forProcessed) {
            return genFor(el, state)
        } else if (el.if && !el.ifProcessed) {
            return genIf(el, state)
        } else if (el.tag === 'template' && !el.slotTarget) {
            return genChildren(el, state) || 'void 0'
        } else if (el.tag === 'slot') {
            return genSlot(el, state)
        } else {
            // component or element
            var code;
            if (el.component) {
                code = genComponent(el.component, el, state);
            } else {
                var data = el.plain ? undefined : genData$2(el, state);

                var children = el.inlineTemplate ? null : genChildren(el, state, true);
                code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
            }
            // module transforms
            for (var i = 0; i < state.transforms.length; i++) {
                code = state.transforms[i](el, code);
            }
            return code
        }
    }

// hoist static sub-trees out
    function genStatic (el, state) {
        el.staticProcessed = true;
        state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
        return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
    }

// v-once
    function genOnce (el, state) {
        el.onceProcessed = true;
        if (el.if && !el.ifProcessed) {
            return genIf(el, state)
        } else if (el.staticInFor) {
            var key = '';
            var parent = el.parent;
            while (parent) {
                if (parent.for) {
                    key = parent.key;
                    break
                }
                parent = parent.parent;
            }
            if (!key) {
                "development" !== 'production' && state.warn(
                    "v-once can only be used inside v-for that is keyed. "
                );
                return genElement(el, state)
            }
            return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + "," + key + ")")
        } else {
            return genStatic(el, state)
        }
    }

    function genIf (
        el,
        state,
        altGen,
        altEmpty
    ) {
        el.ifProcessed = true; // avoid recursion
        return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
    }

    function genIfConditions (
        conditions,
        state,
        altGen,
        altEmpty
    ) {
        if (!conditions.length) {
            return altEmpty || '_e()'
        }

        var condition = conditions.shift();
        if (condition.exp) {
            return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
        } else {
            return ("" + (genTernaryExp(condition.block)))
        }

        // v-if with v-once should generate code like (a)?_m(0):_m(1)
        function genTernaryExp (el) {
            return altGen
                ? altGen(el, state)
                : el.once
                ? genOnce(el, state)
                : genElement(el, state)
        }
    }

    function genFor (
        el,
        state,
        altGen,
        altHelper
    ) {
        var exp = el.for;
        var alias = el.alias;
        var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
        var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

        if ("development" !== 'production' &&
            state.maybeComponent(el) &&
            el.tag !== 'slot' &&
            el.tag !== 'template' &&
            !el.key
        ) {
            state.warn(
                "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
                "v-for should have explicit keys. " +
                "See https://vuejs.org/guide/list.html#key for more info.",
                true /* tip */
            );
        }

        el.forProcessed = true; // avoid recursion
        return (altHelper || '_l') + "((" + exp + ")," +
            "function(" + alias + iterator1 + iterator2 + "){" +
            "return " + ((altGen || genElement)(el, state)) +
            '})'
    }

    function genData$2 (el, state) {
        var data = '{';

        // directives first.
        // directives may mutate the el's other properties before they are generated.
        var dirs = genDirectives(el, state);
        if (dirs) { data += dirs + ','; }

        // key
        if (el.key) {
            data += "key:" + (el.key) + ",";
        }
        // ref
        if (el.ref) {
            data += "ref:" + (el.ref) + ",";
        }
        if (el.refInFor) {
            data += "refInFor:true,";
        }
        // pre
        if (el.pre) {
            data += "pre:true,";
        }
        // record original tag name for components using "is" attribute
        if (el.component) {
            data += "tag:\"" + (el.tag) + "\",";
        }
        // module data generation functions
        for (var i = 0; i < state.dataGenFns.length; i++) {
            data += state.dataGenFns[i](el);
        }
        // attributes
        if (el.attrs) {
            data += "attrs:{" + (genProps(el.attrs)) + "},";
        }
        // DOM props
        if (el.props) {
            data += "domProps:{" + (genProps(el.props)) + "},";
        }
        // event handlers
        if (el.events) {
            data += (genHandlers(el.events, false, state.warn)) + ",";
        }
        if (el.nativeEvents) {
            data += (genHandlers(el.nativeEvents, true, state.warn)) + ",";
        }
        // slot target
        // only for non-scoped slots
        if (el.slotTarget && !el.slotScope) {
            data += "slot:" + (el.slotTarget) + ",";
        }
        // scoped slots
        if (el.scopedSlots) {
            data += (genScopedSlots(el.scopedSlots, state)) + ",";
        }
        // component v-model
        if (el.model) {
            data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
        }
        // inline-template
        if (el.inlineTemplate) {
            var inlineTemplate = genInlineTemplate(el, state);
            if (inlineTemplate) {
                data += inlineTemplate + ",";
            }
        }
        data = data.replace(/,$/, '') + '}';
        // v-bind data wrap
        if (el.wrapData) {
            data = el.wrapData(data);
        }
        // v-on data wrap
        if (el.wrapListeners) {
            data = el.wrapListeners(data);
        }
        return data
    }

    function genDirectives (el, state) {
        var dirs = el.directives;
        if (!dirs) { return }
        var res = 'directives:[';
        var hasRuntime = false;
        var i, l, dir, needRuntime;
        for (i = 0, l = dirs.length; i < l; i++) {
            dir = dirs[i];
            needRuntime = true;
            var gen = state.directives[dir.name];
            if (gen) {
                // compile-time directive that manipulates AST.
                // returns true if it also needs a runtime counterpart.
                needRuntime = !!gen(el, dir, state.warn);
            }
            if (needRuntime) {
                hasRuntime = true;
                res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:\"" + (dir.arg) + "\"") : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
            }
        }
        if (hasRuntime) {
            return res.slice(0, -1) + ']'
        }
    }

    function genInlineTemplate (el, state) {
        var ast = el.children[0];
        if ("development" !== 'production' && (
            el.children.length !== 1 || ast.type !== 1
        )) {
            state.warn('Inline-template components must have exactly one child element.');
        }
        if (ast.type === 1) {
            var inlineRenderFns = generate(ast, state.options);
            return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
        }
    }

    function genScopedSlots (
        slots,
        state
    ) {
        return ("scopedSlots:_u([" + (Object.keys(slots).map(function (key) {
            return genScopedSlot(key, slots[key], state)
        }).join(',')) + "])")
    }

    function genScopedSlot (
        key,
        el,
        state
    ) {
        if (el.for && !el.forProcessed) {
            return genForScopedSlot(key, el, state)
        }
        var fn = "function(" + (String(el.slotScope)) + "){" +
            "return " + (el.tag === 'template'
                ? el.if
                ? ((el.if) + "?" + (genChildren(el, state) || 'undefined') + ":undefined")
                : genChildren(el, state) || 'undefined'
                : genElement(el, state)) + "}";
        return ("{key:" + key + ",fn:" + fn + "}")
    }

    function genForScopedSlot (
        key,
        el,
        state
    ) {
        var exp = el.for;
        var alias = el.alias;
        var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
        var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';
        el.forProcessed = true; // avoid recursion
        return "_l((" + exp + ")," +
            "function(" + alias + iterator1 + iterator2 + "){" +
            "return " + (genScopedSlot(key, el, state)) +
            '})'
    }

    function genChildren (
        el,
        state,
        checkSkip,
        altGenElement,
        altGenNode
    ) {
        var children = el.children;
        if (children.length) {
            var el$1 = children[0];
            // optimize single v-for
            if (children.length === 1 &&
                el$1.for &&
                el$1.tag !== 'template' &&
                el$1.tag !== 'slot'
            ) {
                return (altGenElement || genElement)(el$1, state)
            }
            var normalizationType = checkSkip
                ? getNormalizationType(children, state.maybeComponent)
                : 0;
            var gen = altGenNode || genNode;
            return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType ? ("," + normalizationType) : ''))
        }
    }

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
    function getNormalizationType (
        children,
        maybeComponent
    ) {
        var res = 0;
        for (var i = 0; i < children.length; i++) {
            var el = children[i];
            if (el.type !== 1) {
                continue
            }
            if (needsNormalization(el) ||
                (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
                res = 2;
                break
            }
            if (maybeComponent(el) ||
                (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
                res = 1;
            }
        }
        return res
    }

    function needsNormalization (el) {
        return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
    }

    function genNode (node, state) {
        if (node.type === 1) {
            return genElement(node, state)
        } if (node.type === 3 && node.isComment) {
            return genComment(node)
        } else {
            return genText(node)
        }
    }

    function genText (text) {
        return ("_v(" + (text.type === 2
            ? text.expression // no need for () because already wrapped in _s()
            : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
    }

    function genComment (comment) {
        return ("_e(" + (JSON.stringify(comment.text)) + ")")
    }

    function genSlot (el, state) {
        var slotName = el.slotName || '"default"';
        var children = genChildren(el, state);
        var res = "_t(" + slotName + (children ? ("," + children) : '');
        var attrs = el.attrs && ("{" + (el.attrs.map(function (a) { return ((camelize(a.name)) + ":" + (a.value)); }).join(',')) + "}");
        var bind$$1 = el.attrsMap['v-bind'];
        if ((attrs || bind$$1) && !children) {
            res += ",null";
        }
        if (attrs) {
            res += "," + attrs;
        }
        if (bind$$1) {
            res += (attrs ? '' : ',null') + "," + bind$$1;
        }
        return res + ')'
    }

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
    function genComponent (
        componentName,
        el,
        state
    ) {
        var children = el.inlineTemplate ? null : genChildren(el, state, true);
        return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
    }

    function genProps (props) {
        var res = '';
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            res += "\"" + (prop.name) + "\":" + (transformSpecialNewlines(prop.value)) + ",";
        }
        return res.slice(0, -1)
    }

// #3895, #4268
    function transformSpecialNewlines (text) {
        return text
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')
    }

/*  */

// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
    var prohibitedKeywordRE = new RegExp('\\b' + (
        'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
            'super,throw,while,yield,delete,export,import,return,switch,default,' +
            'extends,finally,continue,debugger,function,arguments'
    ).split(',').join('\\b|\\b') + '\\b');

// these unary operators should not be used as property/method names
    var unaryOperatorsRE = new RegExp('\\b' + (
        'delete,typeof,void'
    ).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

// check valid identifier for v-for
    var identRE = /[A-Za-z_$][\w$]*/;

// strip strings in expressions
    var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// detect problematic expressions in a template
    function detectErrors (ast) {
        var errors = [];
        if (ast) {
            checkNode(ast, errors);
        }
        return errors
    }

    function checkNode (node, errors) {
        if (node.type === 1) {
            for (var name in node.attrsMap) {
                if (dirRE.test(name)) {
                    var value = node.attrsMap[name];
                    if (value) {
                        if (name === 'v-for') {
                            checkFor(node, ("v-for=\"" + value + "\""), errors);
                        } else if (onRE.test(name)) {
                            checkEvent(value, (name + "=\"" + value + "\""), errors);
                        } else {
                            checkExpression(value, (name + "=\"" + value + "\""), errors);
                        }
                    }
                }
            }
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    checkNode(node.children[i], errors);
                }
            }
        } else if (node.type === 2) {
            checkExpression(node.expression, node.text, errors);
        }
    }

    function checkEvent (exp, text, errors) {
        var stipped = exp.replace(stripStringRE, '');
        var keywordMatch = stipped.match(unaryOperatorsRE);
        if (keywordMatch && stipped.charAt(keywordMatch.index - 1) !== '$') {
            errors.push(
                "avoid using JavaScript unary operator as property name: " +
                "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
            );
        }
        checkExpression(exp, text, errors);
    }

    function checkFor (node, text, errors) {
        checkExpression(node.for || '', text, errors);
        checkIdentifier(node.alias, 'v-for alias', text, errors);
        checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
        checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
    }

    function checkIdentifier (ident, type, text, errors) {
        if (typeof ident === 'string' && !identRE.test(ident)) {
            errors.push(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())));
        }
    }

    function checkExpression (exp, text, errors) {
        try {
            new Function(("return " + exp));
        } catch (e) {
            var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
            if (keywordMatch) {
                errors.push(
                    "avoid using JavaScript keyword as property name: " +
                    "\"" + (keywordMatch[0]) + "\"\n  Raw expression: " + (text.trim())
                );
            } else {
                errors.push(
                    "invalid expression: " + (e.message) + " in\n\n" +
                    "    " + exp + "\n\n" +
                    "  Raw expression: " + (text.trim()) + "\n"
                );
            }
        }
    }

/*  */

    function createFunction (code, errors) {
        try {
            return new Function(code)
        } catch (err) {
            errors.push({ err: err, code: code });
            return noop
        }
    }

    function createCompileToFunctionFn (compile) {
        var cache = Object.create(null);

        return function compileToFunctions (
            template,
            options,
            vm
        ) {
            options = extend({}, options);
            var warn$$1 = options.warn || warn;
            delete options.warn;

            /* istanbul ignore if */
            {
                // detect possible CSP restriction
                try {
                    new Function('return 1');
                } catch (e) {
                    if (e.toString().match(/unsafe-eval|CSP/)) {
                        warn$$1(
                            'It seems you are using the standalone build of Vue.js in an ' +
                            'environment with Content Security Policy that prohibits unsafe-eval. ' +
                            'The template compiler cannot work in this environment. Consider ' +
                            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
                            'templates into render functions.'
                        );
                    }
                }
            }

            // check cache
            var key = options.delimiters
                ? String(options.delimiters) + template
                : template;
            if (cache[key]) {
                return cache[key]
            }

            // compile
            var compiled = compile(template, options);

            // check compilation errors/tips
            {
                if (compiled.errors && compiled.errors.length) {
                    warn$$1(
                        "Error compiling template:\n\n" + template + "\n\n" +
                        compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
                        vm
                    );
                }
                if (compiled.tips && compiled.tips.length) {
                    compiled.tips.forEach(function (msg) { return tip(msg, vm); });
                }
            }

            // turn code into functions
            var res = {};
            var fnGenErrors = [];
            res.render = createFunction(compiled.render, fnGenErrors);
            res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
                return createFunction(code, fnGenErrors)
            });

            // check function generation errors.
            // this should only happen if there is a bug in the compiler itself.
            // mostly for codegen development use
            /* istanbul ignore if */
            {
                if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
                    warn$$1(
                        "Failed to generate render function:\n\n" +
                        fnGenErrors.map(function (ref) {
                            var err = ref.err;
                            var code = ref.code;

                            return ((err.toString()) + " in\n\n" + code + "\n");
                        }).join('\n'),
                        vm
                    );
                }
            }

            return (cache[key] = res)
        }
    }

/*  */

    function createCompilerCreator (baseCompile) {
        return function createCompiler (baseOptions) {
            function compile (
                template,
                options
            ) {
                var finalOptions = Object.create(baseOptions);
                var errors = [];
                var tips = [];
                finalOptions.warn = function (msg, tip) {
                    (tip ? tips : errors).push(msg);
                };

                if (options) {
                    // merge custom modules
                    if (options.modules) {
                        finalOptions.modules =
                            (baseOptions.modules || []).concat(options.modules);
                    }
                    // merge custom directives
                    if (options.directives) {
                        finalOptions.directives = extend(
                            Object.create(baseOptions.directives),
                            options.directives
                        );
                    }
                    // copy other options
                    for (var key in options) {
                        if (key !== 'modules' && key !== 'directives') {
                            finalOptions[key] = options[key];
                        }
                    }
                }

                var compiled = baseCompile(template, finalOptions);
                {
                    errors.push.apply(errors, detectErrors(compiled.ast));
                }
                compiled.errors = errors;
                compiled.tips = tips;
                return compiled
            }

            return {
                compile: compile,
                compileToFunctions: createCompileToFunctionFn(compile)
            }
        }
    }

/*  */

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
    var createCompiler = createCompilerCreator(function baseCompile (
        template,
        options
    ) {
        var ast = parse(template.trim(), options);
        optimize(ast, options);
        var code = generate(ast, options);
        return {
            ast: ast,
            render: code.render,
            staticRenderFns: code.staticRenderFns
        }
    });

/*  */

    var ref$1 = createCompiler(baseOptions);
    var compileToFunctions = ref$1.compileToFunctions;

/*  */

    var idToTemplate = cached(function (id) {
        var el = query(id);
        return el && el.innerHTML
    });

    var mount = Vue$3.prototype.$mount;
    Vue$3.prototype.$mount = function (
        el,
        hydrating
    ) {
        el = el && query(el);

        /* istanbul ignore if */
        if (el === document.body || el === document.documentElement) {
            "development" !== 'production' && warn(
                "Do not mount Vue to <html> or <body> - mount to normal elements instead."
            );
            return this
        }

        var options = this.$options;
        // resolve template/el and convert to render function
        if (!options.render) {
            var template = options.template;
            if (template) {
                if (typeof template === 'string') {
                    if (template.charAt(0) === '#') {
                        template = idToTemplate(template);
                        /* istanbul ignore if */
                        if ("development" !== 'production' && !template) {
                            warn(
                                ("Template element not found or is empty: " + (options.template)),
                                this
                            );
                        }
                    }
                } else if (template.nodeType) {
                    template = template.innerHTML;
                } else {
                    {
                        warn('invalid template option:' + template, this);
                    }
                    return this
                }
            } else if (el) {
                template = getOuterHTML(el);
            }
            if (template) {
                /* istanbul ignore if */
                if ("development" !== 'production' && config.performance && mark) {
                    mark('compile');
                }

                var ref = compileToFunctions(template, {
                    shouldDecodeNewlines: shouldDecodeNewlines,
                    delimiters: options.delimiters,
                    comments: options.comments
                }, this);
                var render = ref.render;
                var staticRenderFns = ref.staticRenderFns;
                options.render = render;
                options.staticRenderFns = staticRenderFns;

                /* istanbul ignore if */
                if ("development" !== 'production' && config.performance && mark) {
                    mark('compile end');
                    measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
                }
            }
        }
        return mount.call(this, el, hydrating)
    };

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
    function getOuterHTML (el) {
        if (el.outerHTML) {
            return el.outerHTML
        } else {
            var container = document.createElement('div');
            container.appendChild(el.cloneNode(true));
            return container.innerHTML
        }
    }

    Vue$3.compile = compileToFunctions;

    return Vue$3;

})));
/**
  * vee-validate v2.1.3
  * (c) 2018 Abdelrahman Awad
  * @license MIT
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.VeeValidate = factory());
}(this, (function () {
    'use strict';

    var MILLISECONDS_IN_HOUR = 3600000;
    var MILLISECONDS_IN_MINUTE = 60000;
    var DEFAULT_ADDITIONAL_DIGITS = 2;

    var patterns = {
        dateTimeDelimeter: /[T ]/,
        plainTime: /:/,

        // year tokens
        YY: /^(\d{2})$/,
        YYY: [
            /^([+-]\d{2})$/, // 0 additional digits
            /^([+-]\d{3})$/, // 1 additional digit
            /^([+-]\d{4})$/ // 2 additional digits
        ],
        YYYY: /^(\d{4})/,
        YYYYY: [
            /^([+-]\d{4})/, // 0 additional digits
            /^([+-]\d{5})/, // 1 additional digit
            /^([+-]\d{6})/ // 2 additional digits
        ],

        // date tokens
        MM: /^-(\d{2})$/,
        DDD: /^-?(\d{3})$/,
        MMDD: /^-?(\d{2})-?(\d{2})$/,
        Www: /^-?W(\d{2})$/,
        WwwD: /^-?W(\d{2})-?(\d{1})$/,

        HH: /^(\d{2}([.,]\d*)?)$/,
        HHMM: /^(\d{2}):?(\d{2}([.,]\d*)?)$/,
        HHMMSS: /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/,

        // timezone tokens
        timezone: /([Z+-].*)$/,
        timezoneZ: /^(Z)$/,
        timezoneHH: /^([+-])(\d{2})$/,
        timezoneHHMM: /^([+-])(\d{2}):?(\d{2})$/
    };

    /**
     * @name toDate
     * @category Common Helpers
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given argument to an instance of Date.
     *
     * If the argument is an instance of Date, the function returns its clone.
     *
     * If the argument is a number, it is treated as a timestamp.
     *
     * If an argument is a string, the function tries to parse it.
     * Function accepts complete ISO 8601 formats as well as partial implementations.
     * ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
     *
     * If the argument is null, it is treated as an invalid date.
     *
     * If all above fails, the function passes the given argument to Date constructor.
     *
     * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
     * All *date-fns* functions will throw `RangeError` if `options.additionalDigits` is not 0, 1, 2 or undefined.
     *
     * @param {*} argument - the value to convert
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - the additional number of digits in the extended year format
     * @returns {Date} the parsed date in the local time zone
     * @throws {TypeError} 1 argument required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     *
     * @example
     * // Convert string '2014-02-11T11:30:30' to date:
     * var result = toDate('2014-02-11T11:30:30')
     * //=> Tue Feb 11 2014 11:30:30
     *
     * @example
     * // Convert string '+02014101' to date,
     * // if the additional number of digits in the extended year format is 1:
     * var result = toDate('+02014101', {additionalDigits: 1})
     * //=> Fri Apr 11 2014 00:00:00
     */
    function toDate(argument, dirtyOptions) {
        if (arguments.length < 1) {
            throw new TypeError('1 argument required, but only ' + arguments.length + ' present')
        }

        if (argument === null) {
            return new Date(NaN)
        }

        var options = dirtyOptions || {};

        var additionalDigits = options.additionalDigits === undefined ? DEFAULT_ADDITIONAL_DIGITS : Number(options.additionalDigits);
        if (additionalDigits !== 2 && additionalDigits !== 1 && additionalDigits !== 0) {
            throw new RangeError('additionalDigits must be 0, 1 or 2')
        }

        // Clone the date
        if (argument instanceof Date) {
            // Prevent the date to lose the milliseconds when passed to new Date() in IE10
            return new Date(argument.getTime())
        } else if (typeof argument !== 'string') {
            return new Date(argument)
        }

        var dateStrings = splitDateString(argument);

        var parseYearResult = parseYear(dateStrings.date, additionalDigits);
        var year = parseYearResult.year;
        var restDateString = parseYearResult.restDateString;

        var date = parseDate(restDateString, year);

        if (date) {
            var timestamp = date.getTime();
            var time = 0;
            var offset;

            if (dateStrings.time) {
                time = parseTime(dateStrings.time);
            }

            if (dateStrings.timezone) {
                offset = parseTimezone(dateStrings.timezone);
            } else {
                // get offset accurate to hour in timezones that change offset
                offset = new Date(timestamp + time).getTimezoneOffset();
                offset = new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE).getTimezoneOffset();
            }

            return new Date(timestamp + time + offset * MILLISECONDS_IN_MINUTE)
        } else {
            return new Date(argument)
        }
    }

    function splitDateString(dateString) {
        var dateStrings = {};
        var array = dateString.split(patterns.dateTimeDelimeter);
        var timeString;

        if (patterns.plainTime.test(array[0])) {
            dateStrings.date = null;
            timeString = array[0];
        } else {
            dateStrings.date = array[0];
            timeString = array[1];
        }

        if (timeString) {
            var token = patterns.timezone.exec(timeString);
            if (token) {
                dateStrings.time = timeString.replace(token[1], '');
                dateStrings.timezone = token[1];
            } else {
                dateStrings.time = timeString;
            }
        }

        return dateStrings
    }

    function parseYear(dateString, additionalDigits) {
        var patternYYY = patterns.YYY[additionalDigits];
        var patternYYYYY = patterns.YYYYY[additionalDigits];

        var token;

        // YYYY or ±YYYYY
        token = patterns.YYYY.exec(dateString) || patternYYYYY.exec(dateString);
        if (token) {
            var yearString = token[1];
            return {
                year: parseInt(yearString, 10),
                restDateString: dateString.slice(yearString.length)
            }
        }

        // YY or ±YYY
        token = patterns.YY.exec(dateString) || patternYYY.exec(dateString);
        if (token) {
            var centuryString = token[1];
            return {
                year: parseInt(centuryString, 10) * 100,
                restDateString: dateString.slice(centuryString.length)
            }
        }

        // Invalid ISO-formatted year
        return {
            year: null
        }
    }

    function parseDate(dateString, year) {
        // Invalid ISO-formatted year
        if (year === null) {
            return null
        }

        var token;
        var date;
        var month;
        var week;

        // YYYY
        if (dateString.length === 0) {
            date = new Date(0);
            date.setUTCFullYear(year);
            return date
        }

        // YYYY-MM
        token = patterns.MM.exec(dateString);
        if (token) {
            date = new Date(0);
            month = parseInt(token[1], 10) - 1;
            date.setUTCFullYear(year, month);
            return date
        }

        // YYYY-DDD or YYYYDDD
        token = patterns.DDD.exec(dateString);
        if (token) {
            date = new Date(0);
            var dayOfYear = parseInt(token[1], 10);
            date.setUTCFullYear(year, 0, dayOfYear);
            return date
        }

        // YYYY-MM-DD or YYYYMMDD
        token = patterns.MMDD.exec(dateString);
        if (token) {
            date = new Date(0);
            month = parseInt(token[1], 10) - 1;
            var day = parseInt(token[2], 10);
            date.setUTCFullYear(year, month, day);
            return date
        }

        // YYYY-Www or YYYYWww
        token = patterns.Www.exec(dateString);
        if (token) {
            week = parseInt(token[1], 10) - 1;
            return dayOfISOYear(year, week)
        }

        // YYYY-Www-D or YYYYWwwD
        token = patterns.WwwD.exec(dateString);
        if (token) {
            week = parseInt(token[1], 10) - 1;
            var dayOfWeek = parseInt(token[2], 10) - 1;
            return dayOfISOYear(year, week, dayOfWeek)
        }

        // Invalid ISO-formatted date
        return null
    }

    function parseTime(timeString) {
        var token;
        var hours;
        var minutes;

        // hh
        token = patterns.HH.exec(timeString);
        if (token) {
            hours = parseFloat(token[1].replace(',', '.'));
            return (hours % 24) * MILLISECONDS_IN_HOUR
        }

        // hh:mm or hhmm
        token = patterns.HHMM.exec(timeString);
        if (token) {
            hours = parseInt(token[1], 10);
            minutes = parseFloat(token[2].replace(',', '.'));
            return (hours % 24) * MILLISECONDS_IN_HOUR +
                minutes * MILLISECONDS_IN_MINUTE
        }

        // hh:mm:ss or hhmmss
        token = patterns.HHMMSS.exec(timeString);
        if (token) {
            hours = parseInt(token[1], 10);
            minutes = parseInt(token[2], 10);
            var seconds = parseFloat(token[3].replace(',', '.'));
            return (hours % 24) * MILLISECONDS_IN_HOUR +
                minutes * MILLISECONDS_IN_MINUTE +
                seconds * 1000
        }

        // Invalid ISO-formatted time
        return null
    }

    function parseTimezone(timezoneString) {
        var token;
        var absoluteOffset;

        // Z
        token = patterns.timezoneZ.exec(timezoneString);
        if (token) {
            return 0
        }

        // ±hh
        token = patterns.timezoneHH.exec(timezoneString);
        if (token) {
            absoluteOffset = parseInt(token[2], 10) * 60;
            return (token[1] === '+') ? -absoluteOffset : absoluteOffset
        }

        // ±hh:mm or ±hhmm
        token = patterns.timezoneHHMM.exec(timezoneString);
        if (token) {
            absoluteOffset = parseInt(token[2], 10) * 60 + parseInt(token[3], 10);
            return (token[1] === '+') ? -absoluteOffset : absoluteOffset
        }

        return 0
    }

    function dayOfISOYear(isoYear, week, day) {
        week = week || 0;
        day = day || 0;
        var date = new Date(0);
        date.setUTCFullYear(isoYear, 0, 4);
        var fourthOfJanuaryDay = date.getUTCDay() || 7;
        var diff = week * 7 + day + 1 - fourthOfJanuaryDay;
        date.setUTCDate(date.getUTCDate() + diff);
        return date
    }

    /**
     * @name addMilliseconds
     * @category Millisecond Helpers
     * @summary Add the specified number of milliseconds to the given date.
     *
     * @description
     * Add the specified number of milliseconds to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be added
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {Date} the new date with the milliseconds added
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     *
     * @example
     * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
     * var result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:30.750
     */
    function addMilliseconds(dirtyDate, dirtyAmount, dirtyOptions) {
        if (arguments.length < 2) {
            throw new TypeError('2 arguments required, but only ' + arguments.length + ' present')
        }

        var timestamp = toDate(dirtyDate, dirtyOptions).getTime();
        var amount = Number(dirtyAmount);
        return new Date(timestamp + amount)
    }

    function cloneObject(dirtyObject) {
        dirtyObject = dirtyObject || {};
        var object = {};

        for (var property in dirtyObject) {
            if (dirtyObject.hasOwnProperty(property)) {
                object[property] = dirtyObject[property];
            }
        }

        return object
    }

    var MILLISECONDS_IN_MINUTE$2 = 60000;

    /**
     * @name addMinutes
     * @category Minute Helpers
     * @summary Add the specified number of minutes to the given date.
     *
     * @description
     * Add the specified number of minutes to the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of minutes to be added
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {Date} the new date with the minutes added
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     *
     * @example
     * // Add 30 minutes to 10 July 2014 12:00:00:
     * var result = addMinutes(new Date(2014, 6, 10, 12, 0), 30)
     * //=> Thu Jul 10 2014 12:30:00
     */
    function addMinutes(dirtyDate, dirtyAmount, dirtyOptions) {
        if (arguments.length < 2) {
            throw new TypeError('2 arguments required, but only ' + arguments.length + ' present')
        }

        var amount = Number(dirtyAmount);
        return addMilliseconds(dirtyDate, amount * MILLISECONDS_IN_MINUTE$2, dirtyOptions)
    }

    /**
     * @name isValid
     * @category Common Helpers
     * @summary Is the given date valid?
     *
     * @description
     * Returns false if argument is Invalid Date and true otherwise.
     * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * Invalid Date is a Date, whose time value is NaN.
     *
     * Time value of Date: http://es5.github.io/#x15.9.1.1
     *
     * @param {*} date - the date to check
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {Boolean} the date is valid
     * @throws {TypeError} 1 argument required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     *
     * @example
     * // For the valid date:
     * var result = isValid(new Date(2014, 1, 31))
     * //=> true
     *
     * @example
     * // For the value, convertable into a date:
     * var result = isValid('2014-02-31')
     * //=> true
     *
     * @example
     * // For the invalid date:
     * var result = isValid(new Date(''))
     * //=> false
     */
    function isValid(dirtyDate, dirtyOptions) {
        if (arguments.length < 1) {
            throw new TypeError('1 argument required, but only ' + arguments.length + ' present')
        }

        var date = toDate(dirtyDate, dirtyOptions);
        return !isNaN(date)
    }

    var formatDistanceLocale = {
        lessThanXSeconds: {
            one: 'less than a second',
            other: 'less than {{count}} seconds'
        },

        xSeconds: {
            one: '1 second',
            other: '{{count}} seconds'
        },

        halfAMinute: 'half a minute',

        lessThanXMinutes: {
            one: 'less than a minute',
            other: 'less than {{count}} minutes'
        },

        xMinutes: {
            one: '1 minute',
            other: '{{count}} minutes'
        },

        aboutXHours: {
            one: 'about 1 hour',
            other: 'about {{count}} hours'
        },

        xHours: {
            one: '1 hour',
            other: '{{count}} hours'
        },

        xDays: {
            one: '1 day',
            other: '{{count}} days'
        },

        aboutXMonths: {
            one: 'about 1 month',
            other: 'about {{count}} months'
        },

        xMonths: {
            one: '1 month',
            other: '{{count}} months'
        },

        aboutXYears: {
            one: 'about 1 year',
            other: 'about {{count}} years'
        },

        xYears: {
            one: '1 year',
            other: '{{count}} years'
        },

        overXYears: {
            one: 'over 1 year',
            other: 'over {{count}} years'
        },

        almostXYears: {
            one: 'almost 1 year',
            other: 'almost {{count}} years'
        }
    };

    function formatDistance(token, count, options) {
        options = options || {};

        var result;
        if (typeof formatDistanceLocale[token] === 'string') {
            result = formatDistanceLocale[token];
        } else if (count === 1) {
            result = formatDistanceLocale[token].one;
        } else {
            result = formatDistanceLocale[token].other.replace('{{count}}', count);
        }

        if (options.addSuffix) {
            if (options.comparison > 0) {
                return 'in ' + result
            } else {
                return result + ' ago'
            }
        }

        return result
    }

    var tokensToBeShortedPattern = /MMMM|MM|DD|dddd/g;

    function buildShortLongFormat(format) {
        return format.replace(tokensToBeShortedPattern, function (token) {
            return token.slice(1)
        })
    }

    /**
     * @name buildFormatLongFn
     * @category Locale Helpers
     * @summary Build `formatLong` property for locale used by `format`, `formatRelative` and `parse` functions.
     *
     * @description
     * Build `formatLong` property for locale used by `format`, `formatRelative` and `parse` functions.
     * Returns a function which takes one of the following tokens as the argument:
     * `'LTS'`, `'LT'`, `'L'`, `'LL'`, `'LLL'`, `'l'`, `'ll'`, `'lll'`, `'llll'`
     * and returns a long format string written as `format` token strings.
     * See [format]{@link https://date-fns.org/docs/format}
     *
     * `'l'`, `'ll'`, `'lll'` and `'llll'` formats are built automatically
     * by shortening some of the tokens from corresponding unshortened formats
     * (e.g., if `LL` is `'MMMM DD YYYY'` then `ll` will be `MMM D YYYY`)
     *
     * @param {Object} obj - the object with long formats written as `format` token strings
     * @param {String} obj.LT - time format: hours and minutes
     * @param {String} obj.LTS - time format: hours, minutes and seconds
     * @param {String} obj.L - short date format: numeric day, month and year
     * @param {String} [obj.l] - short date format: numeric day, month and year (shortened)
     * @param {String} obj.LL - long date format: day, month in words, and year
     * @param {String} [obj.ll] - long date format: day, month in words, and year (shortened)
     * @param {String} obj.LLL - long date and time format
     * @param {String} [obj.lll] - long date and time format (shortened)
     * @param {String} obj.LLLL - long date, time and weekday format
     * @param {String} [obj.llll] - long date, time and weekday format (shortened)
     * @returns {Function} `formatLong` property of the locale
     *
     * @example
     * // For `en-US` locale:
     * locale.formatLong = buildFormatLongFn({
     *   LT: 'h:mm aa',
     *   LTS: 'h:mm:ss aa',
     *   L: 'MM/DD/YYYY',
     *   LL: 'MMMM D YYYY',
     *   LLL: 'MMMM D YYYY h:mm aa',
     *   LLLL: 'dddd, MMMM D YYYY h:mm aa'
     * })
     */
    function buildFormatLongFn(obj) {
        var formatLongLocale = {
            LTS: obj.LTS,
            LT: obj.LT,
            L: obj.L,
            LL: obj.LL,
            LLL: obj.LLL,
            LLLL: obj.LLLL,
            l: obj.l || buildShortLongFormat(obj.L),
            ll: obj.ll || buildShortLongFormat(obj.LL),
            lll: obj.lll || buildShortLongFormat(obj.LLL),
            llll: obj.llll || buildShortLongFormat(obj.LLLL)
        };

        return function (token) {
            return formatLongLocale[token]
        }
    }

    var formatLong = buildFormatLongFn({
        LT: 'h:mm aa',
        LTS: 'h:mm:ss aa',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D YYYY',
        LLL: 'MMMM D YYYY h:mm aa',
        LLLL: 'dddd, MMMM D YYYY h:mm aa'
    });

    var formatRelativeLocale = {
        lastWeek: '[last] dddd [at] LT',
        yesterday: '[yesterday at] LT',
        today: '[today at] LT',
        tomorrow: '[tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        other: 'L'
    };

    function formatRelative(token, date, baseDate, options) {
        return formatRelativeLocale[token]
    }

    /**
     * @name buildLocalizeFn
     * @category Locale Helpers
     * @summary Build `localize.weekday`, `localize.month` and `localize.timeOfDay` properties for the locale.
     *
     * @description
     * Build `localize.weekday`, `localize.month` and `localize.timeOfDay` properties for the locale
     * used by `format` function.
     * If no `type` is supplied to the options of the resulting function, `defaultType` will be used (see example).
     *
     * `localize.weekday` function takes the weekday index as argument (0 - Sunday).
     * `localize.month` takes the month index (0 - January).
     * `localize.timeOfDay` takes the hours. Use `indexCallback` to convert them to an array index (see example).
     *
     * @param {Object} values - the object with arrays of values
     * @param {String} defaultType - the default type for the localize function
     * @param {Function} [indexCallback] - the callback which takes the resulting function argument
     *   and converts it into value array index
     * @returns {Function} the resulting function
     *
     * @example
     * var timeOfDayValues = {
     *   uppercase: ['AM', 'PM'],
     *   lowercase: ['am', 'pm'],
     *   long: ['a.m.', 'p.m.']
     * }
     * locale.localize.timeOfDay = buildLocalizeFn(timeOfDayValues, 'long', function (hours) {
     *   // 0 is a.m. array index, 1 is p.m. array index
     *   return (hours / 12) >= 1 ? 1 : 0
     * })
     * locale.localize.timeOfDay(16, {type: 'uppercase'}) //=> 'PM'
     * locale.localize.timeOfDay(5) //=> 'a.m.'
     */
    function buildLocalizeFn(values, defaultType, indexCallback) {
        return function (dirtyIndex, dirtyOptions) {
            var options = dirtyOptions || {};
            var type = options.type ? String(options.type) : defaultType;
            var valuesArray = values[type] || values[defaultType];
            var index = indexCallback ? indexCallback(Number(dirtyIndex)) : Number(dirtyIndex);
            return valuesArray[index]
        }
    }

    /**
     * @name buildLocalizeArrayFn
     * @category Locale Helpers
     * @summary Build `localize.weekdays`, `localize.months` and `localize.timesOfDay` properties for the locale.
     *
     * @description
     * Build `localize.weekdays`, `localize.months` and `localize.timesOfDay` properties for the locale.
     * If no `type` is supplied to the options of the resulting function, `defaultType` will be used (see example).
     *
     * @param {Object} values - the object with arrays of values
     * @param {String} defaultType - the default type for the localize function
     * @returns {Function} the resulting function
     *
     * @example
     * var weekdayValues = {
     *   narrow: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
     *   short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
     *   long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
     * }
     * locale.localize.weekdays = buildLocalizeArrayFn(weekdayValues, 'long')
     * locale.localize.weekdays({type: 'narrow'}) //=> ['Su', 'Mo', ...]
     * locale.localize.weekdays() //=> ['Sunday', 'Monday', ...]
     */
    function buildLocalizeArrayFn(values, defaultType) {
        return function (dirtyOptions) {
            var options = dirtyOptions || {};
            var type = options.type ? String(options.type) : defaultType;
            return values[type] || values[defaultType]
        }
    }

    // Note: in English, the names of days of the week and months are capitalized.
    // If you are making a new locale based on this one, check if the same is true for the language you're working on.
    // Generally, formatted dates should look like they are in the middle of a sentence,
    // e.g. in Spanish language the weekdays and months should be in the lowercase.
    var weekdayValues = {
        narrow: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };

    var monthValues = {
        short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };

    // `timeOfDay` is used to designate which part of the day it is, when used with 12-hour clock.
    // Use the system which is used the most commonly in the locale.
    // For example, if the country doesn't use a.m./p.m., you can use `night`/`morning`/`afternoon`/`evening`:
    //
    //   var timeOfDayValues = {
    //     any: ['in the night', 'in the morning', 'in the afternoon', 'in the evening']
    //   }
    //
    // And later:
    //
    //   var localize = {
    //     // The callback takes the hours as the argument and returns the array index
    //     timeOfDay: buildLocalizeFn(timeOfDayValues, 'any', function (hours) {
    //       if (hours >= 17) {
    //         return 3
    //       } else if (hours >= 12) {
    //         return 2
    //       } else if (hours >= 4) {
    //         return 1
    //       } else {
    //         return 0
    //       }
    //     }),
    //     timesOfDay: buildLocalizeArrayFn(timeOfDayValues, 'any')
    //   }
    var timeOfDayValues = {
        uppercase: ['AM', 'PM'],
        lowercase: ['am', 'pm'],
        long: ['a.m.', 'p.m.']
    };

    function ordinalNumber(dirtyNumber, dirtyOptions) {
        var number = Number(dirtyNumber);

        // If ordinal numbers depend on context, for example,
        // if they are different for different grammatical genders,
        // use `options.unit`:
        //
        //   var options = dirtyOptions || {}
        //   var unit = String(options.unit)
        //
        // where `unit` can be 'month', 'quarter', 'week', 'isoWeek', 'dayOfYear',
        // 'dayOfMonth' or 'dayOfWeek'

        var rem100 = number % 100;
        if (rem100 > 20 || rem100 < 10) {
            switch (rem100 % 10) {
                case 1:
                    return number + 'st'
                case 2:
                    return number + 'nd'
                case 3:
                    return number + 'rd'
            }
        }
        return number + 'th'
    }

    var localize = {
        ordinalNumber: ordinalNumber,
        weekday: buildLocalizeFn(weekdayValues, 'long'),
        weekdays: buildLocalizeArrayFn(weekdayValues, 'long'),
        month: buildLocalizeFn(monthValues, 'long'),
        months: buildLocalizeArrayFn(monthValues, 'long'),
        timeOfDay: buildLocalizeFn(timeOfDayValues, 'long', function (hours) {
            return (hours / 12) >= 1 ? 1 : 0
        }),
        timesOfDay: buildLocalizeArrayFn(timeOfDayValues, 'long')
    };

    /**
     * @name buildMatchFn
     * @category Locale Helpers
     * @summary Build `match.weekdays`, `match.months` and `match.timesOfDay` properties for the locale.
     *
     * @description
     * Build `match.weekdays`, `match.months` and `match.timesOfDay` properties for the locale used by `parse` function.
     * If no `type` is supplied to the options of the resulting function, `defaultType` will be used (see example).
     * The result of the match function will be passed into corresponding parser function
     * (`match.weekday`, `match.month` or `match.timeOfDay` respectively. See `buildParseFn`).
     *
     * @param {Object} values - the object with RegExps
     * @param {String} defaultType - the default type for the match function
     * @returns {Function} the resulting function
     *
     * @example
     * var matchWeekdaysPatterns = {
     *   narrow: /^(su|mo|tu|we|th|fr|sa)/i,
     *   short: /^(sun|mon|tue|wed|thu|fri|sat)/i,
     *   long: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
     * }
     * locale.match.weekdays = buildMatchFn(matchWeekdaysPatterns, 'long')
     * locale.match.weekdays('Sunday', {type: 'narrow'}) //=> ['Su', 'Su', ...]
     * locale.match.weekdays('Sunday') //=> ['Sunday', 'Sunday', ...]
     */
    function buildMatchFn(patterns, defaultType) {
        return function (dirtyString, dirtyOptions) {
            var options = dirtyOptions || {};
            var type = options.type ? String(options.type) : defaultType;
            var pattern = patterns[type] || patterns[defaultType];
            var string = String(dirtyString);
            return string.match(pattern)
        }
    }

    /**
     * @name buildParseFn
     * @category Locale Helpers
     * @summary Build `match.weekday`, `match.month` and `match.timeOfDay` properties for the locale.
     *
     * @description
     * Build `match.weekday`, `match.month` and `match.timeOfDay` properties for the locale used by `parse` function.
     * The argument of the resulting function is the result of the corresponding match function
     * (`match.weekdays`, `match.months` or `match.timesOfDay` respectively. See `buildMatchFn`).
     *
     * @param {Object} values - the object with arrays of RegExps
     * @param {String} defaultType - the default type for the parser function
     * @returns {Function} the resulting function
     *
     * @example
     * var parseWeekdayPatterns = {
     *   any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
     * }
     * locale.match.weekday = buildParseFn(matchWeekdaysPatterns, 'long')
     * var matchResult = locale.match.weekdays('Friday')
     * locale.match.weekday(matchResult) //=> 5
     */
    function buildParseFn(patterns, defaultType) {
        return function (matchResult, dirtyOptions) {
            var options = dirtyOptions || {};
            var type = options.type ? String(options.type) : defaultType;
            var patternsArray = patterns[type] || patterns[defaultType];
            var string = matchResult[1];

            return patternsArray.findIndex(function (pattern) {
                return pattern.test(string)
            })
        }
    }

    /**
     * @name buildMatchPatternFn
     * @category Locale Helpers
     * @summary Build match function from a single RegExp.
     *
     * @description
     * Build match function from a single RegExp.
     * Usually used for building `match.ordinalNumbers` property of the locale.
     *
     * @param {Object} pattern - the RegExp
     * @returns {Function} the resulting function
     *
     * @example
     * locale.match.ordinalNumbers = buildMatchPatternFn(/^(\d+)(th|st|nd|rd)?/i)
     * locale.match.ordinalNumbers('3rd') //=> ['3rd', '3', 'rd', ...]
     */
    function buildMatchPatternFn(pattern) {
        return function (dirtyString) {
            var string = String(dirtyString);
            return string.match(pattern)
        }
    }

    /**
     * @name parseDecimal
     * @category Locale Helpers
     * @summary Parses the match result into decimal number.
     *
     * @description
     * Parses the match result into decimal number.
     * Uses the string matched with the first set of parentheses of match RegExp.
     *
     * @param {Array} matchResult - the object returned by matching function
     * @returns {Number} the parsed value
     *
     * @example
     * locale.match = {
     *   ordinalNumbers: (dirtyString) {
     *     return String(dirtyString).match(/^(\d+)(th|st|nd|rd)?/i)
     *   },
     *   ordinalNumber: parseDecimal
     * }
     */
    function parseDecimal(matchResult) {
        return parseInt(matchResult[1], 10)
    }

    var matchOrdinalNumbersPattern = /^(\d+)(th|st|nd|rd)?/i;

    var matchWeekdaysPatterns = {
        narrow: /^(su|mo|tu|we|th|fr|sa)/i,
        short: /^(sun|mon|tue|wed|thu|fri|sat)/i,
        long: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
    };

    var parseWeekdayPatterns = {
        any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
    };

    var matchMonthsPatterns = {
        short: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
        long: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
    };

    var parseMonthPatterns = {
        any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
    };

    // `timeOfDay` is used to designate which part of the day it is, when used with 12-hour clock.
    // Use the system which is used the most commonly in the locale.
    // For example, if the country doesn't use a.m./p.m., you can use `night`/`morning`/`afternoon`/`evening`:
    //
    //   var matchTimesOfDayPatterns = {
    //     long: /^((in the)? (night|morning|afternoon|evening?))/i
    //   }
    //
    //   var parseTimeOfDayPatterns = {
    //     any: [/(night|morning)/i, /(afternoon|evening)/i]
    //   }
    var matchTimesOfDayPatterns = {
        short: /^(am|pm)/i,
        long: /^([ap]\.?\s?m\.?)/i
    };

    var parseTimeOfDayPatterns = {
        any: [/^a/i, /^p/i]
    };

    var match = {
        ordinalNumbers: buildMatchPatternFn(matchOrdinalNumbersPattern),
        ordinalNumber: parseDecimal,
        weekdays: buildMatchFn(matchWeekdaysPatterns, 'long'),
        weekday: buildParseFn(parseWeekdayPatterns, 'any'),
        months: buildMatchFn(matchMonthsPatterns, 'long'),
        month: buildParseFn(parseMonthPatterns, 'any'),
        timesOfDay: buildMatchFn(matchTimesOfDayPatterns, 'long'),
        timeOfDay: buildParseFn(parseTimeOfDayPatterns, 'any')
    };

    /**
     * @type {Locale}
     * @category Locales
     * @summary English locale (United States).
     * @language English
     * @iso-639-2 eng
     */
    var locale = {
        formatDistance: formatDistance,
        formatLong: formatLong,
        formatRelative: formatRelative,
        localize: localize,
        match: match,
        options: {
            weekStartsOn: 0 /* Sunday */,
            firstWeekContainsDate: 1
        }
    };

    var MILLISECONDS_IN_DAY$1 = 86400000;

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function getUTCDayOfYear(dirtyDate, dirtyOptions) {
        var date = toDate(dirtyDate, dirtyOptions);
        var timestamp = date.getTime();
        date.setUTCMonth(0, 1);
        date.setUTCHours(0, 0, 0, 0);
        var startOfYearTimestamp = date.getTime();
        var difference = timestamp - startOfYearTimestamp;
        return Math.floor(difference / MILLISECONDS_IN_DAY$1) + 1
    }

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function startOfUTCISOWeek(dirtyDate, dirtyOptions) {
        var weekStartsOn = 1;

        var date = toDate(dirtyDate, dirtyOptions);
        var day = date.getUTCDay();
        var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

        date.setUTCDate(date.getUTCDate() - diff);
        date.setUTCHours(0, 0, 0, 0);
        return date
    }

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function getUTCISOWeekYear(dirtyDate, dirtyOptions) {
        var date = toDate(dirtyDate, dirtyOptions);
        var year = date.getUTCFullYear();

        var fourthOfJanuaryOfNextYear = new Date(0);
        fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
        fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
        var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear, dirtyOptions);

        var fourthOfJanuaryOfThisYear = new Date(0);
        fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
        fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
        var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear, dirtyOptions);

        if (date.getTime() >= startOfNextYear.getTime()) {
            return year + 1
        } else if (date.getTime() >= startOfThisYear.getTime()) {
            return year
        } else {
            return year - 1
        }
    }

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function startOfUTCISOWeekYear(dirtyDate, dirtyOptions) {
        var year = getUTCISOWeekYear(dirtyDate, dirtyOptions);
        var fourthOfJanuary = new Date(0);
        fourthOfJanuary.setUTCFullYear(year, 0, 4);
        fourthOfJanuary.setUTCHours(0, 0, 0, 0);
        var date = startOfUTCISOWeek(fourthOfJanuary, dirtyOptions);
        return date
    }

    var MILLISECONDS_IN_WEEK$2 = 604800000;

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function getUTCISOWeek(dirtyDate, dirtyOptions) {
        var date = toDate(dirtyDate, dirtyOptions);
        var diff = startOfUTCISOWeek(date, dirtyOptions).getTime() - startOfUTCISOWeekYear(date, dirtyOptions).getTime();

        // Round the number of days to the nearest integer
        // because the number of milliseconds in a week is not constant
        // (e.g. it's different in the week of the daylight saving time clock shift)
        return Math.round(diff / MILLISECONDS_IN_WEEK$2) + 1
    }

    var formatters = {
        // Month: 1, 2, ..., 12
        'M': function (date) {
            return date.getUTCMonth() + 1
        },

        // Month: 1st, 2nd, ..., 12th
        'Mo': function (date, options) {
            var month = date.getUTCMonth() + 1;
            return options.locale.localize.ordinalNumber(month, { unit: 'month' })
        },

        // Month: 01, 02, ..., 12
        'MM': function (date) {
            return addLeadingZeros(date.getUTCMonth() + 1, 2)
        },

        // Month: Jan, Feb, ..., Dec
        'MMM': function (date, options) {
            return options.locale.localize.month(date.getUTCMonth(), { type: 'short' })
        },

        // Month: January, February, ..., December
        'MMMM': function (date, options) {
            return options.locale.localize.month(date.getUTCMonth(), { type: 'long' })
        },

        // Quarter: 1, 2, 3, 4
        'Q': function (date) {
            return Math.ceil((date.getUTCMonth() + 1) / 3)
        },

        // Quarter: 1st, 2nd, 3rd, 4th
        'Qo': function (date, options) {
            var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
            return options.locale.localize.ordinalNumber(quarter, { unit: 'quarter' })
        },

        // Day of month: 1, 2, ..., 31
        'D': function (date) {
            return date.getUTCDate()
        },

        // Day of month: 1st, 2nd, ..., 31st
        'Do': function (date, options) {
            return options.locale.localize.ordinalNumber(date.getUTCDate(), { unit: 'dayOfMonth' })
        },

        // Day of month: 01, 02, ..., 31
        'DD': function (date) {
            return addLeadingZeros(date.getUTCDate(), 2)
        },

        // Day of year: 1, 2, ..., 366
        'DDD': function (date) {
            return getUTCDayOfYear(date)
        },

        // Day of year: 1st, 2nd, ..., 366th
        'DDDo': function (date, options) {
            return options.locale.localize.ordinalNumber(getUTCDayOfYear(date), { unit: 'dayOfYear' })
        },

        // Day of year: 001, 002, ..., 366
        'DDDD': function (date) {
            return addLeadingZeros(getUTCDayOfYear(date), 3)
        },

        // Day of week: Su, Mo, ..., Sa
        'dd': function (date, options) {
            return options.locale.localize.weekday(date.getUTCDay(), { type: 'narrow' })
        },

        // Day of week: Sun, Mon, ..., Sat
        'ddd': function (date, options) {
            return options.locale.localize.weekday(date.getUTCDay(), { type: 'short' })
        },

        // Day of week: Sunday, Monday, ..., Saturday
        'dddd': function (date, options) {
            return options.locale.localize.weekday(date.getUTCDay(), { type: 'long' })
        },

        // Day of week: 0, 1, ..., 6
        'd': function (date) {
            return date.getUTCDay()
        },

        // Day of week: 0th, 1st, 2nd, ..., 6th
        'do': function (date, options) {
            return options.locale.localize.ordinalNumber(date.getUTCDay(), { unit: 'dayOfWeek' })
        },

        // Day of ISO week: 1, 2, ..., 7
        'E': function (date) {
            return date.getUTCDay() || 7
        },

        // ISO week: 1, 2, ..., 53
        'W': function (date) {
            return getUTCISOWeek(date)
        },

        // ISO week: 1st, 2nd, ..., 53th
        'Wo': function (date, options) {
            return options.locale.localize.ordinalNumber(getUTCISOWeek(date), { unit: 'isoWeek' })
        },

        // ISO week: 01, 02, ..., 53
        'WW': function (date) {
            return addLeadingZeros(getUTCISOWeek(date), 2)
        },

        // Year: 00, 01, ..., 99
        'YY': function (date) {
            return addLeadingZeros(date.getUTCFullYear(), 4).substr(2)
        },

        // Year: 1900, 1901, ..., 2099
        'YYYY': function (date) {
            return addLeadingZeros(date.getUTCFullYear(), 4)
        },

        // ISO week-numbering year: 00, 01, ..., 99
        'GG': function (date) {
            return String(getUTCISOWeekYear(date)).substr(2)
        },

        // ISO week-numbering year: 1900, 1901, ..., 2099
        'GGGG': function (date) {
            return getUTCISOWeekYear(date)
        },

        // Hour: 0, 1, ... 23
        'H': function (date) {
            return date.getUTCHours()
        },

        // Hour: 00, 01, ..., 23
        'HH': function (date) {
            return addLeadingZeros(date.getUTCHours(), 2)
        },

        // Hour: 1, 2, ..., 12
        'h': function (date) {
            var hours = date.getUTCHours();
            if (hours === 0) {
                return 12
            } else if (hours > 12) {
                return hours % 12
            } else {
                return hours
            }
        },

        // Hour: 01, 02, ..., 12
        'hh': function (date) {
            return addLeadingZeros(formatters['h'](date), 2)
        },

        // Minute: 0, 1, ..., 59
        'm': function (date) {
            return date.getUTCMinutes()
        },

        // Minute: 00, 01, ..., 59
        'mm': function (date) {
            return addLeadingZeros(date.getUTCMinutes(), 2)
        },

        // Second: 0, 1, ..., 59
        's': function (date) {
            return date.getUTCSeconds()
        },

        // Second: 00, 01, ..., 59
        'ss': function (date) {
            return addLeadingZeros(date.getUTCSeconds(), 2)
        },

        // 1/10 of second: 0, 1, ..., 9
        'S': function (date) {
            return Math.floor(date.getUTCMilliseconds() / 100)
        },

        // 1/100 of second: 00, 01, ..., 99
        'SS': function (date) {
            return addLeadingZeros(Math.floor(date.getUTCMilliseconds() / 10), 2)
        },

        // Millisecond: 000, 001, ..., 999
        'SSS': function (date) {
            return addLeadingZeros(date.getUTCMilliseconds(), 3)
        },

        // Timezone: -01:00, +00:00, ... +12:00
        'Z': function (date, options) {
            var originalDate = options._originalDate || date;
            return formatTimezone(originalDate.getTimezoneOffset(), ':')
        },

        // Timezone: -0100, +0000, ... +1200
        'ZZ': function (date, options) {
            var originalDate = options._originalDate || date;
            return formatTimezone(originalDate.getTimezoneOffset())
        },

        // Seconds timestamp: 512969520
        'X': function (date, options) {
            var originalDate = options._originalDate || date;
            return Math.floor(originalDate.getTime() / 1000)
        },

        // Milliseconds timestamp: 512969520900
        'x': function (date, options) {
            var originalDate = options._originalDate || date;
            return originalDate.getTime()
        },

        // AM, PM
        'A': function (date, options) {
            return options.locale.localize.timeOfDay(date.getUTCHours(), { type: 'uppercase' })
        },

        // am, pm
        'a': function (date, options) {
            return options.locale.localize.timeOfDay(date.getUTCHours(), { type: 'lowercase' })
        },

        // a.m., p.m.
        'aa': function (date, options) {
            return options.locale.localize.timeOfDay(date.getUTCHours(), { type: 'long' })
        }
    };

    function formatTimezone(offset, delimeter) {
        delimeter = delimeter || '';
        var sign = offset > 0 ? '-' : '+';
        var absOffset = Math.abs(offset);
        var hours = Math.floor(absOffset / 60);
        var minutes = absOffset % 60;
        return sign + addLeadingZeros(hours, 2) + delimeter + addLeadingZeros(minutes, 2)
    }

    function addLeadingZeros(number, targetLength) {
        var output = Math.abs(number).toString();
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output
    }

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function addUTCMinutes(dirtyDate, dirtyAmount, dirtyOptions) {
        var date = toDate(dirtyDate, dirtyOptions);
        var amount = Number(dirtyAmount);
        date.setUTCMinutes(date.getUTCMinutes() + amount);
        return date
    }

    var longFormattingTokensRegExp = /(\[[^[]*])|(\\)?(LTS|LT|LLLL|LLL|LL|L|llll|lll|ll|l)/g;
    var defaultFormattingTokensRegExp = /(\[[^[]*])|(\\)?(x|ss|s|mm|m|hh|h|do|dddd|ddd|dd|d|aa|a|ZZ|Z|YYYY|YY|X|Wo|WW|W|SSS|SS|S|Qo|Q|Mo|MMMM|MMM|MM|M|HH|H|GGGG|GG|E|Do|DDDo|DDDD|DDD|DD|D|A|.)/g;

    /**
     * @name format
     * @category Common Helpers
     * @summary Format the date.
     *
     * @description
     * Return the formatted date string in the given format.
     *
     * Accepted tokens:
     * | Unit                    | Token | Result examples                  |
     * |-------------------------|-------|----------------------------------|
     * | Month                   | M     | 1, 2, ..., 12                    |
     * |                         | Mo    | 1st, 2nd, ..., 12th              |
     * |                         | MM    | 01, 02, ..., 12                  |
     * |                         | MMM   | Jan, Feb, ..., Dec               |
     * |                         | MMMM  | January, February, ..., December |
     * | Quarter                 | Q     | 1, 2, 3, 4                       |
     * |                         | Qo    | 1st, 2nd, 3rd, 4th               |
     * | Day of month            | D     | 1, 2, ..., 31                    |
     * |                         | Do    | 1st, 2nd, ..., 31st              |
     * |                         | DD    | 01, 02, ..., 31                  |
     * | Day of year             | DDD   | 1, 2, ..., 366                   |
     * |                         | DDDo  | 1st, 2nd, ..., 366th             |
     * |                         | DDDD  | 001, 002, ..., 366               |
     * | Day of week             | d     | 0, 1, ..., 6                     |
     * |                         | do    | 0th, 1st, ..., 6th               |
     * |                         | dd    | Su, Mo, ..., Sa                  |
     * |                         | ddd   | Sun, Mon, ..., Sat               |
     * |                         | dddd  | Sunday, Monday, ..., Saturday    |
     * | Day of ISO week         | E     | 1, 2, ..., 7                     |
     * | ISO week                | W     | 1, 2, ..., 53                    |
     * |                         | Wo    | 1st, 2nd, ..., 53rd              |
     * |                         | WW    | 01, 02, ..., 53                  |
     * | Year                    | YY    | 00, 01, ..., 99                  |
     * |                         | YYYY  | 1900, 1901, ..., 2099            |
     * | ISO week-numbering year | GG    | 00, 01, ..., 99                  |
     * |                         | GGGG  | 1900, 1901, ..., 2099            |
     * | AM/PM                   | A     | AM, PM                           |
     * |                         | a     | am, pm                           |
     * |                         | aa    | a.m., p.m.                       |
     * | Hour                    | H     | 0, 1, ... 23                     |
     * |                         | HH    | 00, 01, ... 23                   |
     * |                         | h     | 1, 2, ..., 12                    |
     * |                         | hh    | 01, 02, ..., 12                  |
     * | Minute                  | m     | 0, 1, ..., 59                    |
     * |                         | mm    | 00, 01, ..., 59                  |
     * | Second                  | s     | 0, 1, ..., 59                    |
     * |                         | ss    | 00, 01, ..., 59                  |
     * | 1/10 of second          | S     | 0, 1, ..., 9                     |
     * | 1/100 of second         | SS    | 00, 01, ..., 99                  |
     * | Millisecond             | SSS   | 000, 001, ..., 999               |
     * | Timezone                | Z     | -01:00, +00:00, ... +12:00       |
     * |                         | ZZ    | -0100, +0000, ..., +1200         |
     * | Seconds timestamp       | X     | 512969520                        |
     * | Milliseconds timestamp  | x     | 512969520900                     |
     * | Long format             | LT    | 05:30 a.m.                       |
     * |                         | LTS   | 05:30:15 a.m.                    |
     * |                         | L     | 07/02/1995                       |
     * |                         | l     | 7/2/1995                         |
     * |                         | LL    | July 2 1995                      |
     * |                         | ll    | Jul 2 1995                       |
     * |                         | LLL   | July 2 1995 05:30 a.m.           |
     * |                         | lll   | Jul 2 1995 05:30 a.m.            |
     * |                         | LLLL  | Sunday, July 2 1995 05:30 a.m.   |
     * |                         | llll  | Sun, Jul 2 1995 05:30 a.m.       |
     *
     * The characters wrapped in square brackets are escaped.
     *
     * The result may vary by locale.
     *
     * @param {Date|String|Number} date - the original date
     * @param {String} format - the string of tokens
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @returns {String} the formatted date string
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     * @throws {RangeError} `options.locale` must contain `localize` property
     * @throws {RangeError} `options.locale` must contain `formatLong` property
     *
     * @example
     * // Represent 11 February 2014 in middle-endian format:
     * var result = format(
     *   new Date(2014, 1, 11),
     *   'MM/DD/YYYY'
     * )
     * //=> '02/11/2014'
     *
     * @example
     * // Represent 2 July 2014 in Esperanto:
     * import { eoLocale } from 'date-fns/locale/eo'
     * var result = format(
     *   new Date(2014, 6, 2),
     *   'Do [de] MMMM YYYY',
     *   {locale: eoLocale}
     * )
     * //=> '2-a de julio 2014'
     */
    function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
        if (arguments.length < 2) {
            throw new TypeError('2 arguments required, but only ' + arguments.length + ' present')
        }

        var formatStr = String(dirtyFormatStr);
        var options = dirtyOptions || {};

        var locale$$1 = options.locale || locale;

        if (!locale$$1.localize) {
            throw new RangeError('locale must contain localize property')
        }

        if (!locale$$1.formatLong) {
            throw new RangeError('locale must contain formatLong property')
        }

        var localeFormatters = locale$$1.formatters || {};
        var formattingTokensRegExp = locale$$1.formattingTokensRegExp || defaultFormattingTokensRegExp;
        var formatLong = locale$$1.formatLong;

        var originalDate = toDate(dirtyDate, options);

        if (!isValid(originalDate, options)) {
            return 'Invalid Date'
        }

        // Convert the date in system timezone to the same date in UTC+00:00 timezone.
        // This ensures that when UTC functions will be implemented, locales will be compatible with them.
        // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376
        var timezoneOffset = originalDate.getTimezoneOffset();
        var utcDate = addUTCMinutes(originalDate, -timezoneOffset, options);

        var formatterOptions = cloneObject(options);
        formatterOptions.locale = locale$$1;
        formatterOptions.formatters = formatters;

        // When UTC functions will be implemented, options._originalDate will likely be a part of public API.
        // Right now, please don't use it in locales. If you have to use an original date,
        // please restore it from `date`, adding a timezone offset to it.
        formatterOptions._originalDate = originalDate;

        var result = formatStr
            .replace(longFormattingTokensRegExp, function (substring) {
                if (substring[0] === '[') {
                    return substring
                }

                if (substring[0] === '\\') {
                    return cleanEscapedString(substring)
                }

                return formatLong(substring)
            })
            .replace(formattingTokensRegExp, function (substring) {
                var formatter = localeFormatters[substring] || formatters[substring];

                if (formatter) {
                    return formatter(utcDate, formatterOptions)
                } else {
                    return cleanEscapedString(substring)
                }
            });

        return result
    }

    function cleanEscapedString(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|]$/g, '')
        }
        return input.replace(/\\/g, '')
    }

    /**
     * @name subMinutes
     * @category Minute Helpers
     * @summary Subtract the specified number of minutes from the given date.
     *
     * @description
     * Subtract the specified number of minutes from the given date.
     *
     * @param {Date|String|Number} date - the date to be changed
     * @param {Number} amount - the amount of minutes to be subtracted
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {Date} the new date with the mintues subtracted
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     *
     * @example
     * // Subtract 30 minutes from 10 July 2014 12:00:00:
     * var result = subMinutes(new Date(2014, 6, 10, 12, 0), 30)
     * //=> Thu Jul 10 2014 11:30:00
     */
    function subMinutes(dirtyDate, dirtyAmount, dirtyOptions) {
        if (arguments.length < 2) {
            throw new TypeError('2 arguments required, but only ' + arguments.length + ' present')
        }

        var amount = Number(dirtyAmount);
        return addMinutes(dirtyDate, -amount, dirtyOptions)
    }

    /**
     * @name isAfter
     * @category Common Helpers
     * @summary Is the first date after the second one?
     *
     * @description
     * Is the first date after the second one?
     *
     * @param {Date|String|Number} date - the date that should be after the other one to return true
     * @param {Date|String|Number} dateToCompare - the date to compare with
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {Boolean} the first date is after the second date
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     *
     * @example
     * // Is 10 July 1989 after 11 February 1987?
     * var result = isAfter(new Date(1989, 6, 10), new Date(1987, 1, 11))
     * //=> true
     */
    function isAfter(dirtyDate, dirtyDateToCompare, dirtyOptions) {
        if (arguments.length < 2) {
            throw new TypeError('2 arguments required, but only ' + arguments.length + ' present')
        }

        var date = toDate(dirtyDate, dirtyOptions);
        var dateToCompare = toDate(dirtyDateToCompare, dirtyOptions);
        return date.getTime() > dateToCompare.getTime()
    }

    /**
     * @name isBefore
     * @category Common Helpers
     * @summary Is the first date before the second one?
     *
     * @description
     * Is the first date before the second one?
     *
     * @param {Date|String|Number} date - the date that should be before the other one to return true
     * @param {Date|String|Number} dateToCompare - the date to compare with
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {Boolean} the first date is before the second date
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     *
     * @example
     * // Is 10 July 1989 before 11 February 1987?
     * var result = isBefore(new Date(1989, 6, 10), new Date(1987, 1, 11))
     * //=> false
     */
    function isBefore(dirtyDate, dirtyDateToCompare, dirtyOptions) {
        if (arguments.length < 2) {
            throw new TypeError('2 arguments required, but only ' + arguments.length + ' present')
        }

        var date = toDate(dirtyDate, dirtyOptions);
        var dateToCompare = toDate(dirtyDateToCompare, dirtyOptions);
        return date.getTime() < dateToCompare.getTime()
    }

    /**
     * @name isEqual
     * @category Common Helpers
     * @summary Are the given dates equal?
     *
     * @description
     * Are the given dates equal?
     *
     * @param {Date|String|Number} dateLeft - the first date to compare
     * @param {Date|String|Number} dateRight - the second date to compare
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {Boolean} the dates are equal
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     *
     * @example
     * // Are 2 July 2014 06:30:45.000 and 2 July 2014 06:30:45.500 equal?
     * var result = isEqual(
     *   new Date(2014, 6, 2, 6, 30, 45, 0)
     *   new Date(2014, 6, 2, 6, 30, 45, 500)
     * )
     * //=> false
     */
    function isEqual(dirtyLeftDate, dirtyRightDate, dirtyOptions) {
        if (arguments.length < 2) {
            throw new TypeError('2 arguments required, but only ' + arguments.length + ' present')
        }

        var dateLeft = toDate(dirtyLeftDate, dirtyOptions);
        var dateRight = toDate(dirtyRightDate, dirtyOptions);
        return dateLeft.getTime() === dateRight.getTime()
    }

    var patterns$1 = {
        'M': /^(1[0-2]|0?\d)/, // 0 to 12
        'D': /^(3[0-1]|[0-2]?\d)/, // 0 to 31
        'DDD': /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/, // 0 to 366
        'W': /^(5[0-3]|[0-4]?\d)/, // 0 to 53
        'YYYY': /^(\d{1,4})/, // 0 to 9999
        'H': /^(2[0-3]|[0-1]?\d)/, // 0 to 23
        'm': /^([0-5]?\d)/, // 0 to 59
        'Z': /^([+-])(\d{2}):(\d{2})/,
        'ZZ': /^([+-])(\d{2})(\d{2})/,
        singleDigit: /^(\d)/,
        twoDigits: /^(\d{2})/,
        threeDigits: /^(\d{3})/,
        fourDigits: /^(\d{4})/,
        anyDigits: /^(\d+)/
    };

    function parseDecimal$1(matchResult) {
        return parseInt(matchResult[1], 10)
    }

    var parsers = {
        // Year: 00, 01, ..., 99
        'YY': {
            unit: 'twoDigitYear',
            match: patterns$1.twoDigits,
            parse: function (matchResult) {
                return parseDecimal$1(matchResult)
            }
        },

        // Year: 1900, 1901, ..., 2099
        'YYYY': {
            unit: 'year',
            match: patterns$1.YYYY,
            parse: parseDecimal$1
        },

        // ISO week-numbering year: 00, 01, ..., 99
        'GG': {
            unit: 'isoYear',
            match: patterns$1.twoDigits,
            parse: function (matchResult) {
                return parseDecimal$1(matchResult) + 1900
            }
        },

        // ISO week-numbering year: 1900, 1901, ..., 2099
        'GGGG': {
            unit: 'isoYear',
            match: patterns$1.YYYY,
            parse: parseDecimal$1
        },

        // Quarter: 1, 2, 3, 4
        'Q': {
            unit: 'quarter',
            match: patterns$1.singleDigit,
            parse: parseDecimal$1
        },

        // Ordinal quarter
        'Qo': {
            unit: 'quarter',
            match: function (string, options) {
                return options.locale.match.ordinalNumbers(string, { unit: 'quarter' })
            },
            parse: function (matchResult, options) {
                return options.locale.match.ordinalNumber(matchResult, { unit: 'quarter' })
            }
        },

        // Month: 1, 2, ..., 12
        'M': {
            unit: 'month',
            match: patterns$1.M,
            parse: function (matchResult) {
                return parseDecimal$1(matchResult) - 1
            }
        },

        // Ordinal month
        'Mo': {
            unit: 'month',
            match: function (string, options) {
                return options.locale.match.ordinalNumbers(string, { unit: 'month' })
            },
            parse: function (matchResult, options) {
                return options.locale.match.ordinalNumber(matchResult, { unit: 'month' }) - 1
            }
        },

        // Month: 01, 02, ..., 12
        'MM': {
            unit: 'month',
            match: patterns$1.twoDigits,
            parse: function (matchResult) {
                return parseDecimal$1(matchResult) - 1
            }
        },

        // Month: Jan, Feb, ..., Dec
        'MMM': {
            unit: 'month',
            match: function (string, options) {
                return options.locale.match.months(string, { type: 'short' })
            },
            parse: function (matchResult, options) {
                return options.locale.match.month(matchResult, { type: 'short' })
            }
        },

        // Month: January, February, ..., December
        'MMMM': {
            unit: 'month',
            match: function (string, options) {
                return options.locale.match.months(string, { type: 'long' }) ||
                    options.locale.match.months(string, { type: 'short' })
            },
            parse: function (matchResult, options) {
                var parseResult = options.locale.match.month(matchResult, { type: 'long' });

                if (parseResult == null) {
                    parseResult = options.locale.match.month(matchResult, { type: 'short' });
                }

                return parseResult
            }
        },

        // ISO week: 1, 2, ..., 53
        'W': {
            unit: 'isoWeek',
            match: patterns$1.W,
            parse: parseDecimal$1
        },

        // Ordinal ISO week
        'Wo': {
            unit: 'isoWeek',
            match: function (string, options) {
                return options.locale.match.ordinalNumbers(string, { unit: 'isoWeek' })
            },
            parse: function (matchResult, options) {
                return options.locale.match.ordinalNumber(matchResult, { unit: 'isoWeek' })
            }
        },

        // ISO week: 01, 02, ..., 53
        'WW': {
            unit: 'isoWeek',
            match: patterns$1.twoDigits,
            parse: parseDecimal$1
        },

        // Day of week: 0, 1, ..., 6
        'd': {
            unit: 'dayOfWeek',
            match: patterns$1.singleDigit,
            parse: parseDecimal$1
        },

        // Ordinal day of week
        'do': {
            unit: 'dayOfWeek',
            match: function (string, options) {
                return options.locale.match.ordinalNumbers(string, { unit: 'dayOfWeek' })
            },
            parse: function (matchResult, options) {
                return options.locale.match.ordinalNumber(matchResult, { unit: 'dayOfWeek' })
            }
        },

        // Day of week: Su, Mo, ..., Sa
        'dd': {
            unit: 'dayOfWeek',
            match: function (string, options) {
                return options.locale.match.weekdays(string, { type: 'narrow' })
            },
            parse: function (matchResult, options) {
                return options.locale.match.weekday(matchResult, { type: 'narrow' })
            }
        },

        // Day of week: Sun, Mon, ..., Sat
        'ddd': {
            unit: 'dayOfWeek',
            match: function (string, options) {
                return options.locale.match.weekdays(string, { type: 'short' }) ||
                    options.locale.match.weekdays(string, { type: 'narrow' })
            },
            parse: function (matchResult, options) {
                var parseResult = options.locale.match.weekday(matchResult, { type: 'short' });

                if (parseResult == null) {
                    parseResult = options.locale.match.weekday(matchResult, { type: 'narrow' });
                }

                return parseResult
            }
        },

        // Day of week: Sunday, Monday, ..., Saturday
        'dddd': {
            unit: 'dayOfWeek',
            match: function (string, options) {
                return options.locale.match.weekdays(string, { type: 'long' }) ||
                    options.locale.match.weekdays(string, { type: 'short' }) ||
                    options.locale.match.weekdays(string, { type: 'narrow' })
            },
            parse: function (matchResult, options) {
                var parseResult = options.locale.match.weekday(matchResult, { type: 'long' });

                if (parseResult == null) {
                    parseResult = options.locale.match.weekday(matchResult, { type: 'short' });

                    if (parseResult == null) {
                        parseResult = options.locale.match.weekday(matchResult, { type: 'narrow' });
                    }
                }

                return parseResult
            }
        },

        // Day of ISO week: 1, 2, ..., 7
        'E': {
            unit: 'dayOfISOWeek',
            match: patterns$1.singleDigit,
            parse: function (matchResult) {
                return parseDecimal$1(matchResult)
            }
        },

        // Day of month: 1, 2, ..., 31
        'D': {
            unit: 'dayOfMonth',
            match: patterns$1.D,
            parse: parseDecimal$1
        },

        // Ordinal day of month
        'Do': {
            unit: 'dayOfMonth',
            match: function (string, options) {
                return options.locale.match.ordinalNumbers(string, { unit: 'dayOfMonth' })
            },
            parse: function (matchResult, options) {
                return options.locale.match.ordinalNumber(matchResult, { unit: 'dayOfMonth' })
            }
        },

        // Day of month: 01, 02, ..., 31
        'DD': {
            unit: 'dayOfMonth',
            match: patterns$1.twoDigits,
            parse: parseDecimal$1
        },

        // Day of year: 1, 2, ..., 366
        'DDD': {
            unit: 'dayOfYear',
            match: patterns$1.DDD,
            parse: parseDecimal$1
        },

        // Ordinal day of year
        'DDDo': {
            unit: 'dayOfYear',
            match: function (string, options) {
                return options.locale.match.ordinalNumbers(string, { unit: 'dayOfYear' })
            },
            parse: function (matchResult, options) {
                return options.locale.match.ordinalNumber(matchResult, { unit: 'dayOfYear' })
            }
        },

        // Day of year: 001, 002, ..., 366
        'DDDD': {
            unit: 'dayOfYear',
            match: patterns$1.threeDigits,
            parse: parseDecimal$1
        },

        // AM, PM
        'A': {
            unit: 'timeOfDay',
            match: function (string, options) {
                return options.locale.match.timesOfDay(string, { type: 'short' })
            },
            parse: function (matchResult, options) {
                return options.locale.match.timeOfDay(matchResult, { type: 'short' })
            }
        },

        // a.m., p.m.
        'aa': {
            unit: 'timeOfDay',
            match: function (string, options) {
                return options.locale.match.timesOfDay(string, { type: 'long' }) ||
                    options.locale.match.timesOfDay(string, { type: 'short' })
            },
            parse: function (matchResult, options) {
                var parseResult = options.locale.match.timeOfDay(matchResult, { type: 'long' });

                if (parseResult == null) {
                    parseResult = options.locale.match.timeOfDay(matchResult, { type: 'short' });
                }

                return parseResult
            }
        },

        // Hour: 0, 1, ... 23
        'H': {
            unit: 'hours',
            match: patterns$1.H,
            parse: parseDecimal$1
        },

        // Hour: 00, 01, ..., 23
        'HH': {
            unit: 'hours',
            match: patterns$1.twoDigits,
            parse: parseDecimal$1
        },

        // Hour: 1, 2, ..., 12
        'h': {
            unit: 'timeOfDayHours',
            match: patterns$1.M,
            parse: parseDecimal$1
        },

        // Hour: 01, 02, ..., 12
        'hh': {
            unit: 'timeOfDayHours',
            match: patterns$1.twoDigits,
            parse: parseDecimal$1
        },

        // Minute: 0, 1, ..., 59
        'm': {
            unit: 'minutes',
            match: patterns$1.m,
            parse: parseDecimal$1
        },

        // Minute: 00, 01, ..., 59
        'mm': {
            unit: 'minutes',
            match: patterns$1.twoDigits,
            parse: parseDecimal$1
        },

        // Second: 0, 1, ..., 59
        's': {
            unit: 'seconds',
            match: patterns$1.m,
            parse: parseDecimal$1
        },

        // Second: 00, 01, ..., 59
        'ss': {
            unit: 'seconds',
            match: patterns$1.twoDigits,
            parse: parseDecimal$1
        },

        // 1/10 of second: 0, 1, ..., 9
        'S': {
            unit: 'milliseconds',
            match: patterns$1.singleDigit,
            parse: function (matchResult) {
                return parseDecimal$1(matchResult) * 100
            }
        },

        // 1/100 of second: 00, 01, ..., 99
        'SS': {
            unit: 'milliseconds',
            match: patterns$1.twoDigits,
            parse: function (matchResult) {
                return parseDecimal$1(matchResult) * 10
            }
        },

        // Millisecond: 000, 001, ..., 999
        'SSS': {
            unit: 'milliseconds',
            match: patterns$1.threeDigits,
            parse: parseDecimal$1
        },

        // Timezone: -01:00, +00:00, ... +12:00
        'Z': {
            unit: 'timezone',
            match: patterns$1.Z,
            parse: function (matchResult) {
                var sign = matchResult[1];
                var hours = parseInt(matchResult[2], 10);
                var minutes = parseInt(matchResult[3], 10);
                var absoluteOffset = hours * 60 + minutes;
                return (sign === '+') ? absoluteOffset : -absoluteOffset
            }
        },

        // Timezone: -0100, +0000, ... +1200
        'ZZ': {
            unit: 'timezone',
            match: patterns$1.ZZ,
            parse: function (matchResult) {
                var sign = matchResult[1];
                var hours = parseInt(matchResult[2], 10);
                var minutes = parseInt(matchResult[3], 10);
                var absoluteOffset = hours * 60 + minutes;
                return (sign === '+') ? absoluteOffset : -absoluteOffset
            }
        },

        // Seconds timestamp: 512969520
        'X': {
            unit: 'timestamp',
            match: patterns$1.anyDigits,
            parse: function (matchResult) {
                return parseDecimal$1(matchResult) * 1000
            }
        },

        // Milliseconds timestamp: 512969520900
        'x': {
            unit: 'timestamp',
            match: patterns$1.anyDigits,
            parse: parseDecimal$1
        }
    };

    parsers['a'] = parsers['A'];

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function setUTCDay(dirtyDate, dirtyDay, dirtyOptions) {
        var options = dirtyOptions || {};
        var locale = options.locale;
        var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
        var defaultWeekStartsOn = localeWeekStartsOn === undefined ? 0 : Number(localeWeekStartsOn);
        var weekStartsOn = options.weekStartsOn === undefined ? defaultWeekStartsOn : Number(options.weekStartsOn);

        // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
        if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
            throw new RangeError('weekStartsOn must be between 0 and 6 inclusively')
        }

        var date = toDate(dirtyDate, dirtyOptions);
        var day = Number(dirtyDay);

        var currentDay = date.getUTCDay();

        var remainder = day % 7;
        var dayIndex = (remainder + 7) % 7;

        var diff = (dayIndex < weekStartsOn ? 7 : 0) + day - currentDay;

        date.setUTCDate(date.getUTCDate() + diff);
        return date
    }

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function setUTCISODay(dirtyDate, dirtyDay, dirtyOptions) {
        var day = Number(dirtyDay);

        if (day % 7 === 0) {
            day = day - 7;
        }

        var weekStartsOn = 1;
        var date = toDate(dirtyDate, dirtyOptions);
        var currentDay = date.getUTCDay();

        var remainder = day % 7;
        var dayIndex = (remainder + 7) % 7;

        var diff = (dayIndex < weekStartsOn ? 7 : 0) + day - currentDay;

        date.setUTCDate(date.getUTCDate() + diff);
        return date
    }

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function setUTCISOWeek(dirtyDate, dirtyISOWeek, dirtyOptions) {
        var date = toDate(dirtyDate, dirtyOptions);
        var isoWeek = Number(dirtyISOWeek);
        var diff = getUTCISOWeek(date, dirtyOptions) - isoWeek;
        date.setUTCDate(date.getUTCDate() - diff * 7);
        return date
    }

    var MILLISECONDS_IN_DAY$3 = 86400000;

    // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376
    function setUTCISOWeekYear(dirtyDate, dirtyISOYear, dirtyOptions) {
        var date = toDate(dirtyDate, dirtyOptions);
        var isoYear = Number(dirtyISOYear);
        var dateStartOfYear = startOfUTCISOWeekYear(date, dirtyOptions);
        var diff = Math.floor((date.getTime() - dateStartOfYear.getTime()) / MILLISECONDS_IN_DAY$3);
        var fourthOfJanuary = new Date(0);
        fourthOfJanuary.setUTCFullYear(isoYear, 0, 4);
        fourthOfJanuary.setUTCHours(0, 0, 0, 0);
        date = startOfUTCISOWeekYear(fourthOfJanuary, dirtyOptions);
        date.setUTCDate(date.getUTCDate() + diff);
        return date
    }

    var MILLISECONDS_IN_MINUTE$6 = 60000;

    function setTimeOfDay(hours, timeOfDay) {
        var isAM = timeOfDay === 0;

        if (isAM) {
            if (hours === 12) {
                return 0
            }
        } else {
            if (hours !== 12) {
                return 12 + hours
            }
        }

        return hours
    }

    var units = {
        twoDigitYear: {
            priority: 10,
            set: function (dateValues, value) {
                var century = Math.floor(dateValues.date.getUTCFullYear() / 100);
                var year = century * 100 + value;
                dateValues.date.setUTCFullYear(year, 0, 1);
                dateValues.date.setUTCHours(0, 0, 0, 0);
                return dateValues
            }
        },

        year: {
            priority: 10,
            set: function (dateValues, value) {
                dateValues.date.setUTCFullYear(value, 0, 1);
                dateValues.date.setUTCHours(0, 0, 0, 0);
                return dateValues
            }
        },

        isoYear: {
            priority: 10,
            set: function (dateValues, value, options) {
                dateValues.date = startOfUTCISOWeekYear(setUTCISOWeekYear(dateValues.date, value, options), options);
                return dateValues
            }
        },

        quarter: {
            priority: 20,
            set: function (dateValues, value) {
                dateValues.date.setUTCMonth((value - 1) * 3, 1);
                dateValues.date.setUTCHours(0, 0, 0, 0);
                return dateValues
            }
        },

        month: {
            priority: 30,
            set: function (dateValues, value) {
                dateValues.date.setUTCMonth(value, 1);
                dateValues.date.setUTCHours(0, 0, 0, 0);
                return dateValues
            }
        },

        isoWeek: {
            priority: 40,
            set: function (dateValues, value, options) {
                dateValues.date = startOfUTCISOWeek(setUTCISOWeek(dateValues.date, value, options), options);
                return dateValues
            }
        },

        dayOfWeek: {
            priority: 50,
            set: function (dateValues, value, options) {
                dateValues.date = setUTCDay(dateValues.date, value, options);
                dateValues.date.setUTCHours(0, 0, 0, 0);
                return dateValues
            }
        },

        dayOfISOWeek: {
            priority: 50,
            set: function (dateValues, value, options) {
                dateValues.date = setUTCISODay(dateValues.date, value, options);
                dateValues.date.setUTCHours(0, 0, 0, 0);
                return dateValues
            }
        },

        dayOfMonth: {
            priority: 50,
            set: function (dateValues, value) {
                dateValues.date.setUTCDate(value);
                dateValues.date.setUTCHours(0, 0, 0, 0);
                return dateValues
            }
        },

        dayOfYear: {
            priority: 50,
            set: function (dateValues, value) {
                dateValues.date.setUTCMonth(0, value);
                dateValues.date.setUTCHours(0, 0, 0, 0);
                return dateValues
            }
        },

        timeOfDay: {
            priority: 60,
            set: function (dateValues, value, options) {
                dateValues.timeOfDay = value;
                return dateValues
            }
        },

        hours: {
            priority: 70,
            set: function (dateValues, value, options) {
                dateValues.date.setUTCHours(value, 0, 0, 0);
                return dateValues
            }
        },

        timeOfDayHours: {
            priority: 70,
            set: function (dateValues, value, options) {
                var timeOfDay = dateValues.timeOfDay;
                if (timeOfDay != null) {
                    value = setTimeOfDay(value, timeOfDay);
                }
                dateValues.date.setUTCHours(value, 0, 0, 0);
                return dateValues
            }
        },

        minutes: {
            priority: 80,
            set: function (dateValues, value) {
                dateValues.date.setUTCMinutes(value, 0, 0);
                return dateValues
            }
        },

        seconds: {
            priority: 90,
            set: function (dateValues, value) {
                dateValues.date.setUTCSeconds(value, 0);
                return dateValues
            }
        },

        milliseconds: {
            priority: 100,
            set: function (dateValues, value) {
                dateValues.date.setUTCMilliseconds(value);
                return dateValues
            }
        },

        timezone: {
            priority: 110,
            set: function (dateValues, value) {
                dateValues.date = new Date(dateValues.date.getTime() - value * MILLISECONDS_IN_MINUTE$6);
                return dateValues
            }
        },

        timestamp: {
            priority: 120,
            set: function (dateValues, value) {
                dateValues.date = new Date(value);
                return dateValues
            }
        }
    };

    var TIMEZONE_UNIT_PRIORITY = 110;
    var MILLISECONDS_IN_MINUTE$7 = 60000;

    var longFormattingTokensRegExp$1 = /(\[[^[]*])|(\\)?(LTS|LT|LLLL|LLL|LL|L|llll|lll|ll|l)/g;
    var defaultParsingTokensRegExp = /(\[[^[]*])|(\\)?(x|ss|s|mm|m|hh|h|do|dddd|ddd|dd|d|aa|a|ZZ|Z|YYYY|YY|X|Wo|WW|W|SSS|SS|S|Qo|Q|Mo|MMMM|MMM|MM|M|HH|H|GGGG|GG|E|Do|DDDo|DDDD|DDD|DD|D|A|.)/g;

    /**
     * @name parse
     * @category Common Helpers
     * @summary Parse the date.
     *
     * @description
     * Return the date parsed from string using the given format.
     *
     * Accepted format tokens:
     * | Unit                    | Priority | Token | Input examples                   |
     * |-------------------------|----------|-------|----------------------------------|
     * | Year                    | 10       | YY    | 00, 01, ..., 99                  |
     * |                         |          | YYYY  | 1900, 1901, ..., 2099            |
     * | ISO week-numbering year | 10       | GG    | 00, 01, ..., 99                  |
     * |                         |          | GGGG  | 1900, 1901, ..., 2099            |
     * | Quarter                 | 20       | Q     | 1, 2, 3, 4                       |
     * |                         |          | Qo    | 1st, 2nd, 3rd, 4th               |
     * | Month                   | 30       | M     | 1, 2, ..., 12                    |
     * |                         |          | Mo    | 1st, 2nd, ..., 12th              |
     * |                         |          | MM    | 01, 02, ..., 12                  |
     * |                         |          | MMM   | Jan, Feb, ..., Dec               |
     * |                         |          | MMMM  | January, February, ..., December |
     * | ISO week                | 40       | W     | 1, 2, ..., 53                    |
     * |                         |          | Wo    | 1st, 2nd, ..., 53rd              |
     * |                         |          | WW    | 01, 02, ..., 53                  |
     * | Day of week             | 50       | d     | 0, 1, ..., 6                     |
     * |                         |          | do    | 0th, 1st, ..., 6th               |
     * |                         |          | dd    | Su, Mo, ..., Sa                  |
     * |                         |          | ddd   | Sun, Mon, ..., Sat               |
     * |                         |          | dddd  | Sunday, Monday, ..., Saturday    |
     * | Day of ISO week         | 50       | E     | 1, 2, ..., 7                     |
     * | Day of month            | 50       | D     | 1, 2, ..., 31                    |
     * |                         |          | Do    | 1st, 2nd, ..., 31st              |
     * |                         |          | DD    | 01, 02, ..., 31                  |
     * | Day of year             | 50       | DDD   | 1, 2, ..., 366                   |
     * |                         |          | DDDo  | 1st, 2nd, ..., 366th             |
     * |                         |          | DDDD  | 001, 002, ..., 366               |
     * | Time of day             | 60       | A     | AM, PM                           |
     * |                         |          | a     | am, pm                           |
     * |                         |          | aa    | a.m., p.m.                       |
     * | Hour                    | 70       | H     | 0, 1, ... 23                     |
     * |                         |          | HH    | 00, 01, ... 23                   |
     * | Time of day hour        | 70       | h     | 1, 2, ..., 12                    |
     * |                         |          | hh    | 01, 02, ..., 12                  |
     * | Minute                  | 80       | m     | 0, 1, ..., 59                    |
     * |                         |          | mm    | 00, 01, ..., 59                  |
     * | Second                  | 90       | s     | 0, 1, ..., 59                    |
     * |                         |          | ss    | 00, 01, ..., 59                  |
     * | 1/10 of second          | 100      | S     | 0, 1, ..., 9                     |
     * | 1/100 of second         | 100      | SS    | 00, 01, ..., 99                  |
     * | Millisecond             | 100      | SSS   | 000, 001, ..., 999               |
     * | Timezone                | 110      | Z     | -01:00, +00:00, ... +12:00       |
     * |                         |          | ZZ    | -0100, +0000, ..., +1200         |
     * | Seconds timestamp       | 120      | X     | 512969520                        |
     * | Milliseconds timestamp  | 120      | x     | 512969520900                     |
     *
     * Values will be assigned to the date in the ascending order of its unit's priority.
     * Units of an equal priority overwrite each other in the order of appearance.
     *
     * If no values of higher priority are parsed (e.g. when parsing string 'January 1st' without a year),
     * the values will be taken from 3rd argument `baseDate` which works as a context of parsing.
     *
     * `baseDate` must be passed for correct work of the function.
     * If you're not sure which `baseDate` to supply, create a new instance of Date:
     * `parse('02/11/2014', 'MM/DD/YYYY', new Date())`
     * In this case parsing will be done in the context of the current date.
     * If `baseDate` is `Invalid Date` or a value not convertible to valid `Date`,
     * then `Invalid Date` will be returned.
     *
     * Also, `parse` unfolds long formats like those in [format]{@link https://date-fns.org/docs/format}:
     * | Token | Input examples                 |
     * |-------|--------------------------------|
     * | LT    | 05:30 a.m.                     |
     * | LTS   | 05:30:15 a.m.                  |
     * | L     | 07/02/1995                     |
     * | l     | 7/2/1995                       |
     * | LL    | July 2 1995                    |
     * | ll    | Jul 2 1995                     |
     * | LLL   | July 2 1995 05:30 a.m.         |
     * | lll   | Jul 2 1995 05:30 a.m.          |
     * | LLLL  | Sunday, July 2 1995 05:30 a.m. |
     * | llll  | Sun, Jul 2 1995 05:30 a.m.     |
     *
     * The characters wrapped in square brackets in the format string are escaped.
     *
     * The result may vary by locale.
     *
     * If `formatString` matches with `dateString` but does not provides tokens, `baseDate` will be returned.
     *
     * If parsing failed, `Invalid Date` will be returned.
     * Invalid Date is a Date, whose time value is NaN.
     * Time value of Date: http://es5.github.io/#x15.9.1.1
     *
     * @param {String} dateString - the string to parse
     * @param {String} formatString - the string of tokens
     * @param {Date|String|Number} baseDate - the date to took the missing higher priority values from
     * @param {Options} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @returns {Date} the parsed date
     * @throws {TypeError} 3 arguments required
     * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
     * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
     * @throws {RangeError} `options.locale` must contain `match` property
     * @throws {RangeError} `options.locale` must contain `formatLong` property
     *
     * @example
     * // Parse 11 February 2014 from middle-endian format:
     * var result = parse(
     *   '02/11/2014',
     *   'MM/DD/YYYY',
     *   new Date()
     * )
     * //=> Tue Feb 11 2014 00:00:00
     *
     * @example
     * // Parse 28th of February in English locale in the context of 2010 year:
     * import eoLocale from 'date-fns/locale/eo'
     * var result = parse(
     *   '28-a de februaro',
     *   'Do [de] MMMM',
     *   new Date(2010, 0, 1)
     *   {locale: eoLocale}
     * )
     * //=> Sun Feb 28 2010 00:00:00
     */
    function parse(dirtyDateString, dirtyFormatString, dirtyBaseDate, dirtyOptions) {
        if (arguments.length < 3) {
            throw new TypeError('3 arguments required, but only ' + arguments.length + ' present')
        }

        var dateString = String(dirtyDateString);
        var options = dirtyOptions || {};

        var weekStartsOn = options.weekStartsOn === undefined ? 0 : Number(options.weekStartsOn);

        // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
        if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
            throw new RangeError('weekStartsOn must be between 0 and 6 inclusively')
        }

        var locale$$1 = options.locale || locale;
        var localeParsers = locale$$1.parsers || {};
        var localeUnits = locale$$1.units || {};

        if (!locale$$1.match) {
            throw new RangeError('locale must contain match property')
        }

        if (!locale$$1.formatLong) {
            throw new RangeError('locale must contain formatLong property')
        }

        var formatString = String(dirtyFormatString)
            .replace(longFormattingTokensRegExp$1, function (substring) {
                if (substring[0] === '[') {
                    return substring
                }

                if (substring[0] === '\\') {
                    return cleanEscapedString$1(substring)
                }

                return locale$$1.formatLong(substring)
            });

        if (formatString === '') {
            if (dateString === '') {
                return toDate(dirtyBaseDate, options)
            } else {
                return new Date(NaN)
            }
        }

        var subFnOptions = cloneObject(options);
        subFnOptions.locale = locale$$1;

        var tokens = formatString.match(locale$$1.parsingTokensRegExp || defaultParsingTokensRegExp);
        var tokensLength = tokens.length;

        // If timezone isn't specified, it will be set to the system timezone
        var setters = [{
            priority: TIMEZONE_UNIT_PRIORITY,
            set: dateToSystemTimezone,
            index: 0
        }];

        var i;
        for (i = 0; i < tokensLength; i++) {
            var token = tokens[i];
            var parser = localeParsers[token] || parsers[token];
            if (parser) {
                var matchResult;

                if (parser.match instanceof RegExp) {
                    matchResult = parser.match.exec(dateString);
                } else {
                    matchResult = parser.match(dateString, subFnOptions);
                }

                if (!matchResult) {
                    return new Date(NaN)
                }

                var unitName = parser.unit;
                var unit = localeUnits[unitName] || units[unitName];

                setters.push({
                    priority: unit.priority,
                    set: unit.set,
                    value: parser.parse(matchResult, subFnOptions),
                    index: setters.length
                });

                var substring = matchResult[0];
                dateString = dateString.slice(substring.length);
            } else {
                var head = tokens[i].match(/^\[.*]$/) ? tokens[i].replace(/^\[|]$/g, '') : tokens[i];
                if (dateString.indexOf(head) === 0) {
                    dateString = dateString.slice(head.length);
                } else {
                    return new Date(NaN)
                }
            }
        }

        var uniquePrioritySetters = setters
            .map(function (setter) {
                return setter.priority
            })
            .sort(function (a, b) {
                return a - b
            })
            .filter(function (priority, index, array) {
                return array.indexOf(priority) === index
            })
            .map(function (priority) {
                return setters
                    .filter(function (setter) {
                        return setter.priority === priority
                    })
                    .reverse()
            })
            .map(function (setterArray) {
                return setterArray[0]
            });

        var date = toDate(dirtyBaseDate, options);

        if (isNaN(date)) {
            return new Date(NaN)
        }

        // Convert the date in system timezone to the same date in UTC+00:00 timezone.
        // This ensures that when UTC functions will be implemented, locales will be compatible with them.
        // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/37
        var utcDate = subMinutes(date, date.getTimezoneOffset());

        var dateValues = { date: utcDate };

        var settersLength = uniquePrioritySetters.length;
        for (i = 0; i < settersLength; i++) {
            var setter = uniquePrioritySetters[i];
            dateValues = setter.set(dateValues, setter.value, subFnOptions);
        }

        return dateValues.date
    }

    function dateToSystemTimezone(dateValues) {
        var date = dateValues.date;
        var time = date.getTime();

        // Get the system timezone offset at (moment of time - offset)
        var offset = date.getTimezoneOffset();

        // Get the system timezone offset at the exact moment of time
        offset = new Date(time + offset * MILLISECONDS_IN_MINUTE$7).getTimezoneOffset();

        // Convert date in timezone "UTC+00:00" to the system timezone
        dateValues.date = new Date(time + offset * MILLISECONDS_IN_MINUTE$7);

        return dateValues
    }

    function cleanEscapedString$1(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|]$/g, '')
        }
        return input.replace(/\\/g, '')
    }

    // This file is generated automatically by `scripts/build/indices.js`. Please, don't change it.

    // 

    /**
     * Custom parse behavior on top of date-fns parse function.
     */
    function parseDate$1(date, format$$1) {
        if (typeof date !== 'string') {
            return isValid(date) ? date : null;
        }

        var parsed = parse(date, format$$1, new Date());

        // if date is not valid or the formatted output after parsing does not match
        // the string value passed in (avoids overflows)
        if (!isValid(parsed) || format(parsed, format$$1) !== date) {
            return null;
        }

        return parsed;
    }

    var afterValidator = function (value, ref) {
        if (ref === void 0) ref = {};
        var targetValue = ref.targetValue;
        var inclusion = ref.inclusion; if (inclusion === void 0) inclusion = false;
        var format$$1 = ref.format;

        if (typeof format$$1 === 'undefined') {
            format$$1 = inclusion;
            inclusion = false;
        }

        value = parseDate$1(value, format$$1);
        targetValue = parseDate$1(targetValue, format$$1);

        // if either is not valid.
        if (!value || !targetValue) {
            return false;
        }

        return isAfter(value, targetValue) || (inclusion && isEqual(value, targetValue));
    };

    var options = {
        hasTarget: true,
        isDate: true
    };

    // required to convert from a list of array values to an object.
    var paramNames = ['targetValue', 'inclusion', 'format'];

    var after = {
        validate: afterValidator,
        options: options,
        paramNames: paramNames
    };

    /**
     * Some Alpha Regex helpers.
     * https://github.com/chriso/validator.js/blob/master/src/lib/alpha.js
     */

    var alpha = {
        en: /^[A-Z]*$/i,
        cs: /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]*$/i,
        da: /^[A-ZÆØÅ]*$/i,
        de: /^[A-ZÄÖÜß]*$/i,
        es: /^[A-ZÁÉÍÑÓÚÜ]*$/i,
        fr: /^[A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]*$/i,
        lt: /^[A-ZĄČĘĖĮŠŲŪŽ]*$/i,
        nl: /^[A-ZÉËÏÓÖÜ]*$/i,
        hu: /^[A-ZÁÉÍÓÖŐÚÜŰ]*$/i,
        pl: /^[A-ZĄĆĘŚŁŃÓŻŹ]*$/i,
        pt: /^[A-ZÃÁÀÂÇÉÊÍÕÓÔÚÜ]*$/i,
        ru: /^[А-ЯЁ]*$/i,
        sk: /^[A-ZÁÄČĎÉÍĹĽŇÓŔŠŤÚÝŽ]*$/i,
        sr: /^[A-ZČĆŽŠĐ]*$/i,
        tr: /^[A-ZÇĞİıÖŞÜ]*$/i,
        uk: /^[А-ЩЬЮЯЄІЇҐ]*$/i,
        ar: /^[ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]*$/
    };

    var alphaSpaces = {
        en: /^[A-Z\s]*$/i,
        cs: /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]*$/i,
        da: /^[A-ZÆØÅ\s]*$/i,
        de: /^[A-ZÄÖÜß\s]*$/i,
        es: /^[A-ZÁÉÍÑÓÚÜ\s]*$/i,
        fr: /^[A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ\s]*$/i,
        lt: /^[A-ZĄČĘĖĮŠŲŪŽ\s]*$/i,
        nl: /^[A-ZÉËÏÓÖÜ\s]*$/i,
        hu: /^[A-ZÁÉÍÓÖŐÚÜŰ\s]*$/i,
        pl: /^[A-ZĄĆĘŚŁŃÓŻŹ\s]*$/i,
        pt: /^[A-ZÃÁÀÂÇÉÊÍÕÓÔÚÜ\s]*$/i,
        ru: /^[А-ЯЁ\s]*$/i,
        sk: /^[A-ZÁÄČĎÉÍĹĽŇÓŔŠŤÚÝŽ\s]*$/i,
        sr: /^[A-ZČĆŽŠĐ\s]*$/i,
        tr: /^[A-ZÇĞİıÖŞÜ\s]*$/i,
        uk: /^[А-ЩЬЮЯЄІЇҐ\s]*$/i,
        ar: /^[ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ\s]*$/
    };

    var alphanumeric = {
        en: /^[0-9A-Z]*$/i,
        cs: /^[0-9A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]*$/i,
        da: /^[0-9A-ZÆØÅ]$/i,
        de: /^[0-9A-ZÄÖÜß]*$/i,
        es: /^[0-9A-ZÁÉÍÑÓÚÜ]*$/i,
        fr: /^[0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]*$/i,
        lt: /^[0-9A-ZĄČĘĖĮŠŲŪŽ]*$/i,
        hu: /^[0-9A-ZÁÉÍÓÖŐÚÜŰ]*$/i,
        nl: /^[0-9A-ZÉËÏÓÖÜ]*$/i,
        pl: /^[0-9A-ZĄĆĘŚŁŃÓŻŹ]*$/i,
        pt: /^[0-9A-ZÃÁÀÂÇÉÊÍÕÓÔÚÜ]*$/i,
        ru: /^[0-9А-ЯЁ]*$/i,
        sk: /^[0-9A-ZÁÄČĎÉÍĹĽŇÓŔŠŤÚÝŽ]*$/i,
        sr: /^[0-9A-ZČĆŽŠĐ]*$/i,
        tr: /^[0-9A-ZÇĞİıÖŞÜ]*$/i,
        uk: /^[0-9А-ЩЬЮЯЄІЇҐ]*$/i,
        ar: /^[٠١٢٣٤٥٦٧٨٩0-9ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]*$/
    };

    var alphaDash = {
        en: /^[0-9A-Z_-]*$/i,
        cs: /^[0-9A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ_-]*$/i,
        da: /^[0-9A-ZÆØÅ_-]*$/i,
        de: /^[0-9A-ZÄÖÜß_-]*$/i,
        es: /^[0-9A-ZÁÉÍÑÓÚÜ_-]*$/i,
        fr: /^[0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ_-]*$/i,
        lt: /^[0-9A-ZĄČĘĖĮŠŲŪŽ_-]*$/i,
        nl: /^[0-9A-ZÉËÏÓÖÜ_-]*$/i,
        hu: /^[0-9A-ZÁÉÍÓÖŐÚÜŰ_-]*$/i,
        pl: /^[0-9A-ZĄĆĘŚŁŃÓŻŹ_-]*$/i,
        pt: /^[0-9A-ZÃÁÀÂÇÉÊÍÕÓÔÚÜ_-]*$/i,
        ru: /^[0-9А-ЯЁ_-]*$/i,
        sk: /^[0-9A-ZÁÄČĎÉÍĹĽŇÓŔŠŤÚÝŽ_-]*$/i,
        sr: /^[0-9A-ZČĆŽŠĐ_-]*$/i,
        tr: /^[0-9A-ZÇĞİıÖŞÜ_-]*$/i,
        uk: /^[0-9А-ЩЬЮЯЄІЇҐ_-]*$/i,
        ar: /^[٠١٢٣٤٥٦٧٨٩0-9ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ_-]*$/
    };

    var validate = function (value, ref) {
        if (ref === void 0) ref = {};
        var locale = ref.locale;

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate(val, [locale]); });
        }

        // Match at least one locale.
        if (!locale) {
            return Object.keys(alpha).some(function (loc) { return alpha[loc].test(value); });
        }

        return (alpha[locale] || alpha.en).test(value);
    };

    var paramNames$1 = ['locale'];

    var alpha$1 = {
        validate: validate,
        paramNames: paramNames$1
    };

    var validate$1 = function (value, ref) {
        if (ref === void 0) ref = {};
        var locale = ref.locale;

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$1(val, [locale]); });
        }

        // Match at least one locale.
        if (!locale) {
            return Object.keys(alphaDash).some(function (loc) { return alphaDash[loc].test(value); });
        }

        return (alphaDash[locale] || alphaDash.en).test(value);
    };

    var paramNames$2 = ['locale'];

    var alpha_dash = {
        validate: validate$1,
        paramNames: paramNames$2
    };

    var validate$2 = function (value, ref) {
        if (ref === void 0) ref = {};
        var locale = ref.locale;

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$2(val, [locale]); });
        }

        // Match at least one locale.
        if (!locale) {
            return Object.keys(alphanumeric).some(function (loc) { return alphanumeric[loc].test(value); });
        }

        return (alphanumeric[locale] || alphanumeric.en).test(value);
    };

    var paramNames$3 = ['locale'];

    var alpha_num = {
        validate: validate$2,
        paramNames: paramNames$3
    };

    var validate$3 = function (value, ref) {
        if (ref === void 0) ref = {};
        var locale = ref.locale;

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$3(val, [locale]); });
        }

        // Match at least one locale.
        if (!locale) {
            return Object.keys(alphaSpaces).some(function (loc) { return alphaSpaces[loc].test(value); });
        }

        return (alphaSpaces[locale] || alphaSpaces.en).test(value);
    };

    var paramNames$4 = ['locale'];

    var alpha_spaces = {
        validate: validate$3,
        paramNames: paramNames$4
    };

    var validate$4 = function (value, ref) {
        if (ref === void 0) ref = {};
        var targetValue = ref.targetValue;
        var inclusion = ref.inclusion; if (inclusion === void 0) inclusion = false;
        var format$$1 = ref.format;

        if (typeof format$$1 === 'undefined') {
            format$$1 = inclusion;
            inclusion = false;
        }

        value = parseDate$1(value, format$$1);
        targetValue = parseDate$1(targetValue, format$$1);

        // if either is not valid.
        if (!value || !targetValue) {
            return false;
        }

        return isBefore(value, targetValue) || (inclusion && isEqual(value, targetValue));
    };

    var options$1 = {
        hasTarget: true,
        isDate: true
    };

    var paramNames$5 = ['targetValue', 'inclusion', 'format'];

    var before = {
        validate: validate$4,
        options: options$1,
        paramNames: paramNames$5
    };

    var validate$5 = function (value, ref) {
        if (ref === void 0) ref = {};
        var min = ref.min;
        var max = ref.max;

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$5(val, { min: min, max: max }); });
        }

        return Number(min) <= value && Number(max) >= value;
    };

    var paramNames$6 = ['min', 'max'];

    var between = {
        validate: validate$5,
        paramNames: paramNames$6
    };

    var validate$6 = function (value, ref) {
        var targetValue = ref.targetValue;

        return String(value) === String(targetValue);
    };
    var options$2 = {
        hasTarget: true
    };

    var paramNames$7 = ['targetValue'];

    var confirmed = {
        validate: validate$6,
        options: options$2,
        paramNames: paramNames$7
    };

    function unwrapExports(x) {
        return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
    }

    function createCommonjsModule(fn, module) {
        return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var assertString_1 = createCommonjsModule(function (module, exports) {

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

        exports.default = assertString;
        function assertString(input) {
            var isString = typeof input === 'string' || input instanceof String;

            if (!isString) {
                var invalidType = void 0;
                if (input === null) {
                    invalidType = 'null';
                } else {
                    invalidType = typeof input === 'undefined' ? 'undefined' : _typeof(input);
                    if (invalidType === 'object' && input.constructor && input.constructor.hasOwnProperty('name')) {
                        invalidType = input.constructor.name;
                    } else {
                        invalidType = 'a ' + invalidType;
                    }
                }
                throw new TypeError('Expected string but received ' + invalidType + '.');
            }
        }
        module.exports = exports['default'];
    });

    unwrapExports(assertString_1);

    var isCreditCard_1 = createCommonjsModule(function (module, exports) {

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = isCreditCard;



        var _assertString2 = _interopRequireDefault(assertString_1);

        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        /* eslint-disable max-len */
        var creditCard = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14})$/;
        /* eslint-enable max-len */

        function isCreditCard(str) {
            (0, _assertString2.default)(str);
            var sanitized = str.replace(/[- ]+/g, '');
            if (!creditCard.test(sanitized)) {
                return false;
            }
            var sum = 0;
            var digit = void 0;
            var tmpNum = void 0;
            var shouldDouble = void 0;
            for (var i = sanitized.length - 1; i >= 0; i--) {
                digit = sanitized.substring(i, i + 1);
                tmpNum = parseInt(digit, 10);
                if (shouldDouble) {
                    tmpNum *= 2;
                    if (tmpNum >= 10) {
                        sum += tmpNum % 10 + 1;
                    } else {
                        sum += tmpNum;
                    }
                } else {
                    sum += tmpNum;
                }
                shouldDouble = !shouldDouble;
            }
            return !!(sum % 10 === 0 ? sanitized : false);
        }
        module.exports = exports['default'];
    });

    var isCreditCard = unwrapExports(isCreditCard_1);

    var validate$7 = function (value) { return isCreditCard(String(value)); };

    var credit_card = {
        validate: validate$7
    };

    var validate$8 = function (value, ref) {
        if (ref === void 0) ref = {};
        var min$$1 = ref.min;
        var max$$1 = ref.max;
        var inclusivity = ref.inclusivity; if (inclusivity === void 0) inclusivity = '()';
        var format$$1 = ref.format;

        if (typeof format$$1 === 'undefined') {
            format$$1 = inclusivity;
            inclusivity = '()';
        }

        var minDate = parseDate$1(String(min$$1), format$$1);
        var maxDate = parseDate$1(String(max$$1), format$$1);
        var dateVal = parseDate$1(String(value), format$$1);

        if (!minDate || !maxDate || !dateVal) {
            return false;
        }

        if (inclusivity === '()') {
            return isAfter(dateVal, minDate) && isBefore(dateVal, maxDate);
        }

        if (inclusivity === '(]') {
            return isAfter(dateVal, minDate) && (isEqual(dateVal, maxDate) || isBefore(dateVal, maxDate));
        }

        if (inclusivity === '[)') {
            return isBefore(dateVal, maxDate) && (isEqual(dateVal, minDate) || isAfter(dateVal, minDate));
        }

        return isEqual(dateVal, maxDate) || isEqual(dateVal, minDate) ||
            (isBefore(dateVal, maxDate) && isAfter(dateVal, minDate));
    };

    var options$3 = {
        isDate: true
    };

    var paramNames$8 = ['min', 'max', 'inclusivity', 'format'];

    var date_between = {
        validate: validate$8,
        options: options$3,
        paramNames: paramNames$8
    };

    var validate$9 = function (value, ref) {
        var format = ref.format;

        return !!parseDate$1(value, format);
    };

    var options$4 = {
        isDate: true
    };

    var paramNames$9 = ['format'];

    var date_format = {
        validate: validate$9,
        options: options$4,
        paramNames: paramNames$9
    };

    var validate$a = function (value, ref) {
        if (ref === void 0) ref = {};
        var decimals = ref.decimals; if (decimals === void 0) decimals = '*';
        var separator = ref.separator; if (separator === void 0) separator = '.';

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$a(val, { decimals: decimals, separator: separator }); });
        }

        if (value === null || value === undefined || value === '') {
            return false;
        }

        // if is 0.
        if (Number(decimals) === 0) {
            return /^-?\d*$/.test(value);
        }

        var regexPart = decimals === '*' ? '+' : ("{1," + decimals + "}");
        var regex = new RegExp(("^[-+]?\\d*(\\" + separator + "\\d" + regexPart + ")?$"));

        if (!regex.test(value)) {
            return false;
        }

        var parsedValue = parseFloat(value);

        // eslint-disable-next-line
        return parsedValue === parsedValue;
    };

    var paramNames$a = ['decimals', 'separator'];

    var decimal = {
        validate: validate$a,
        paramNames: paramNames$a
    };

    var validate$b = function (value, ref) {
        var length = ref[0];

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$b(val, [length]); });
        }
        var strVal = String(value);

        return /^[0-9]*$/.test(strVal) && strVal.length === Number(length);
    };

    var digits = {
        validate: validate$b
    };

    var validateImage = function (file, width, height) {
        var URL = window.URL || window.webkitURL;
        return new Promise(function (resolve) {
            var image = new Image();
            image.onerror = function () { return resolve({ valid: false }); };
            image.onload = function () {
                return resolve({
                    valid: image.width === Number(width) && image.height === Number(height)
                });
            };

            image.src = URL.createObjectURL(file);
        });
    };

    var validate$c = function (files, ref) {
        var width = ref[0];
        var height = ref[1];

        var list = [];
        for (var i = 0; i < files.length; i++) {
            // if file is not an image, reject.
            if (! /\.(jpg|svg|jpeg|png|bmp|gif)$/i.test(files[i].name)) {
                return false;
            }

            list.push(files[i]);
        }

        return Promise.all(list.map(function (file) { return validateImage(file, width, height); }));
    };

    var dimensions = {
        validate: validate$c
    };

    var merge_1 = createCommonjsModule(function (module, exports) {

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = merge;
        function merge() {
            var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var defaults = arguments[1];

            for (var key in defaults) {
                if (typeof obj[key] === 'undefined') {
                    obj[key] = defaults[key];
                }
            }
            return obj;
        }
        module.exports = exports['default'];
    });

    unwrapExports(merge_1);

    var isByteLength_1 = createCommonjsModule(function (module, exports) {

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

        exports.default = isByteLength;



        var _assertString2 = _interopRequireDefault(assertString_1);

        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        /* eslint-disable prefer-rest-params */
        function isByteLength(str, options) {
            (0, _assertString2.default)(str);
            var min = void 0;
            var max = void 0;
            if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
                min = options.min || 0;
                max = options.max;
            } else {
                // backwards compatibility: isByteLength(str, min [, max])
                min = arguments[1];
                max = arguments[2];
            }
            var len = encodeURI(str).split(/%..|./).length - 1;
            return len >= min && (typeof max === 'undefined' || len <= max);
        }
        module.exports = exports['default'];
    });

    unwrapExports(isByteLength_1);

    var isFQDN_1 = createCommonjsModule(function (module, exports) {

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = isFQDN;



        var _assertString2 = _interopRequireDefault(assertString_1);



        var _merge2 = _interopRequireDefault(merge_1);

        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        var default_fqdn_options = {
            require_tld: true,
            allow_underscores: false,
            allow_trailing_dot: false
        };

        function isFQDN(str, options) {
            (0, _assertString2.default)(str);
            options = (0, _merge2.default)(options, default_fqdn_options);

            /* Remove the optional trailing dot before checking validity */
            if (options.allow_trailing_dot && str[str.length - 1] === '.') {
                str = str.substring(0, str.length - 1);
            }
            var parts = str.split('.');
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].length > 63) {
                    return false;
                }
            }
            if (options.require_tld) {
                var tld = parts.pop();
                if (!parts.length || !/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
                    return false;
                }
                // disallow spaces
                if (/[\s\u2002-\u200B\u202F\u205F\u3000\uFEFF\uDB40\uDC20]/.test(tld)) {
                    return false;
                }
            }
            for (var part, _i = 0; _i < parts.length; _i++) {
                part = parts[_i];
                if (options.allow_underscores) {
                    part = part.replace(/_/g, '');
                }
                if (!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part)) {
                    return false;
                }
                // disallow full-width chars
                if (/[\uff01-\uff5e]/.test(part)) {
                    return false;
                }
                if (part[0] === '-' || part[part.length - 1] === '-') {
                    return false;
                }
            }
            return true;
        }
        module.exports = exports['default'];
    });

    unwrapExports(isFQDN_1);

    var isIP_1 = createCommonjsModule(function (module, exports) {

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = isIP;



        var _assertString2 = _interopRequireDefault(assertString_1);

        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        var ipv4Maybe = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        var ipv6Block = /^[0-9A-F]{1,4}$/i;

        function isIP(str) {
            var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            (0, _assertString2.default)(str);
            version = String(version);
            if (!version) {
                return isIP(str, 4) || isIP(str, 6);
            } else if (version === '4') {
                if (!ipv4Maybe.test(str)) {
                    return false;
                }
                var parts = str.split('.').sort(function (a, b) {
                    return a - b;
                });
                return parts[3] <= 255;
            } else if (version === '6') {
                var blocks = str.split(':');
                var foundOmissionBlock = false; // marker to indicate ::

                // At least some OS accept the last 32 bits of an IPv6 address
                // (i.e. 2 of the blocks) in IPv4 notation, and RFC 3493 says
                // that '::ffff:a.b.c.d' is valid for IPv4-mapped IPv6 addresses,
                // and '::a.b.c.d' is deprecated, but also valid.
                var foundIPv4TransitionBlock = isIP(blocks[blocks.length - 1], 4);
                var expectedNumberOfBlocks = foundIPv4TransitionBlock ? 7 : 8;

                if (blocks.length > expectedNumberOfBlocks) {
                    return false;
                }
                // initial or final ::
                if (str === '::') {
                    return true;
                } else if (str.substr(0, 2) === '::') {
                    blocks.shift();
                    blocks.shift();
                    foundOmissionBlock = true;
                } else if (str.substr(str.length - 2) === '::') {
                    blocks.pop();
                    blocks.pop();
                    foundOmissionBlock = true;
                }

                for (var i = 0; i < blocks.length; ++i) {
                    // test for a :: which can not be at the string start/end
                    // since those cases have been handled above
                    if (blocks[i] === '' && i > 0 && i < blocks.length - 1) {
                        if (foundOmissionBlock) {
                            return false; // multiple :: in address
                        }
                        foundOmissionBlock = true;
                    } else if (foundIPv4TransitionBlock && i === blocks.length - 1); else if (!ipv6Block.test(blocks[i])) {
                        return false;
                    }
                }
                if (foundOmissionBlock) {
                    return blocks.length >= 1;
                }
                return blocks.length === expectedNumberOfBlocks;
            }
            return false;
        }
        module.exports = exports['default'];
    });

    var isIP = unwrapExports(isIP_1);

    var isEmail_1 = createCommonjsModule(function (module, exports) {

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = isEmail;



        var _assertString2 = _interopRequireDefault(assertString_1);



        var _merge2 = _interopRequireDefault(merge_1);



        var _isByteLength2 = _interopRequireDefault(isByteLength_1);



        var _isFQDN2 = _interopRequireDefault(isFQDN_1);



        var _isIP2 = _interopRequireDefault(isIP_1);

        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        var default_email_options = {
            allow_display_name: false,
            require_display_name: false,
            allow_utf8_local_part: true,
            require_tld: true
        };

        /* eslint-disable max-len */
        /* eslint-disable no-control-regex */
        var displayName = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\.\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\,\.\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\s]*<(.+)>$/i;
        var emailUserPart = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i;
        var gmailUserPart = /^[a-z\d]+$/;
        var quotedEmailUser = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i;
        var emailUserUtf8Part = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
        var quotedEmailUserUtf8 = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;
        /* eslint-enable max-len */
        /* eslint-enable no-control-regex */

        function isEmail(str, options) {
            (0, _assertString2.default)(str);
            options = (0, _merge2.default)(options, default_email_options);

            if (options.require_display_name || options.allow_display_name) {
                var display_email = str.match(displayName);
                if (display_email) {
                    str = display_email[1];
                } else if (options.require_display_name) {
                    return false;
                }
            }

            var parts = str.split('@');
            var domain = parts.pop();
            var user = parts.join('@');

            var lower_domain = domain.toLowerCase();

            if (options.domain_specific_validation && (lower_domain === 'gmail.com' || lower_domain === 'googlemail.com')) {
                /*
                  Previously we removed dots for gmail addresses before validating.
                  This was removed because it allows `multiple..dots@gmail.com`
                  to be reported as valid, but it is not.
                  Gmail only normalizes single dots, removing them from here is pointless,
                  should be done in normalizeEmail
                */
                user = user.toLowerCase();

                // Removing sub-address from username before gmail validation
                var username = user.split('+')[0];

                // Dots are not included in gmail length restriction
                if (!(0, _isByteLength2.default)(username.replace('.', ''), { min: 6, max: 30 })) {
                    return false;
                }

                var _user_parts = username.split('.');
                for (var i = 0; i < _user_parts.length; i++) {
                    if (!gmailUserPart.test(_user_parts[i])) {
                        return false;
                    }
                }
            }

            if (!(0, _isByteLength2.default)(user, { max: 64 }) || !(0, _isByteLength2.default)(domain, { max: 254 })) {
                return false;
            }

            if (!(0, _isFQDN2.default)(domain, { require_tld: options.require_tld })) {
                if (!options.allow_ip_domain) {
                    return false;
                }

                if (!(0, _isIP2.default)(domain)) {
                    if (!domain.startsWith('[') || !domain.endsWith(']')) {
                        return false;
                    }

                    var noBracketdomain = domain.substr(1, domain.length - 2);

                    if (noBracketdomain.length === 0 || !(0, _isIP2.default)(noBracketdomain)) {
                        return false;
                    }
                }
            }

            if (user[0] === '"') {
                user = user.slice(1, user.length - 1);
                return options.allow_utf8_local_part ? quotedEmailUserUtf8.test(user) : quotedEmailUser.test(user);
            }

            var pattern = options.allow_utf8_local_part ? emailUserUtf8Part : emailUserPart;

            var user_parts = user.split('.');
            for (var _i = 0; _i < user_parts.length; _i++) {
                if (!pattern.test(user_parts[_i])) {
                    return false;
                }
            }

            return true;
        }
        module.exports = exports['default'];
    });

    var isEmail = unwrapExports(isEmail_1);

    var validate$d = function (value, options) {
        if (options === void 0) options = {};

        if (options.multiple) {
            value = value.split(',').map(function (emailStr) { return emailStr.trim(); });
        }

        if (Array.isArray(value)) {
            return value.every(function (val) { return isEmail(String(val), options); });
        }

        return isEmail(String(value), options);
    };

    var email = {
        validate: validate$d
    };

    // 

    var isTextInput = function (el) {
        return includes(['text', 'password', 'search', 'email', 'tel', 'url', 'textarea', 'number'], el.type);
    };

    var isCheckboxOrRadioInput = function (el) {
        return includes(['radio', 'checkbox'], el.type);
    };

    var isDateInput = function (el) {
        return includes(['date', 'week', 'month', 'datetime-local', 'time'], el.type);
    };

    /**
     * Gets the data attribute. the name must be kebab-case.
     */
    var getDataAttribute = function (el, name) { return el.getAttribute(("data-vv-" + name)); };

    /**
     * Checks if the values are either null or undefined.
     */
    var isNullOrUndefined = function () {
        var values = [], len = arguments.length;
        while (len--) values[len] = arguments[len];

        return values.every(function (value) {
            return value === null || value === undefined;
        });
    };

    /**
     * Creates the default flags object.
     */
    var createFlags = function () {
        return ({
            untouched: true,
            touched: false,
            dirty: false,
            pristine: true,
            valid: null,
            invalid: null,
            validated: false,
            pending: false,
            required: false,
            changed: false
        });
    };

    /**
     * Shallow object comparison.
     */
    var isEqual$1 = function (lhs, rhs) {
        if (lhs instanceof RegExp && rhs instanceof RegExp) {
            return isEqual$1(lhs.source, rhs.source) && isEqual$1(lhs.flags, rhs.flags);
        }

        if (Array.isArray(lhs) && Array.isArray(rhs)) {
            if (lhs.length !== rhs.length) { return false; }

            for (var i = 0; i < lhs.length; i++) {
                if (!isEqual$1(lhs[i], rhs[i])) {
                    return false;
                }
            }

            return true;
        }

        // if both are objects, compare each key recursively.
        if (isObject(lhs) && isObject(rhs)) {
            return Object.keys(lhs).every(function (key) {
                return isEqual$1(lhs[key], rhs[key]);
            }) && Object.keys(rhs).every(function (key) {
                return isEqual$1(lhs[key], rhs[key]);
            });
        }

        return lhs === rhs;
    };

    /**
     * Determines the input field scope.
     */
    var getScope = function (el) {
        var scope = getDataAttribute(el, 'scope');
        if (isNullOrUndefined(scope)) {
            var form = getForm(el);

            if (form) {
                scope = getDataAttribute(form, 'scope');
            }
        }

        return !isNullOrUndefined(scope) ? scope : null;
    };

    /**
     * Get the closest form element.
     */
    var getForm = function (el) {
        if (isNullOrUndefined(el)) { return null; }

        if (el.tagName === 'FORM') { return el; }

        if (!isNullOrUndefined(el.form)) { return el.form; }

        return !isNullOrUndefined(el.parentNode) ? getForm(el.parentNode) : null;
    };

    /**
     * Gets the value in an object safely.
     */
    var getPath = function (path, target, def) {
        if (def === void 0) def = undefined;

        if (!path || !target) { return def; }

        var value = target;
        path.split('.').every(function (prop) {
            if (prop in value) {
                value = value[prop];

                return true;
            }

            value = def;

            return false;
        });

        return value;
    };

    /**
     * Checks if path exists within an object.
     */
    var hasPath = function (path, target) {
        var obj = target;
        return path.split('.').every(function (prop) {
            if (prop in obj) {
                obj = obj[prop];

                return true;
            }

            return false;
        });
    };

    /**
     * Parses a rule string expression.
     */
    var parseRule = function (rule) {
        var params = [];
        var name = rule.split(':')[0];

        if (includes(rule, ':')) {
            params = rule.split(':').slice(1).join(':').split(',');
        }

        return { name: name, params: params };
    };

    /**
     * Debounces a function.
     */
    var debounce = function (fn, wait, token) {
        if (wait === void 0) wait = 0;
        if (token === void 0) token = { cancelled: false };

        if (wait === 0) {
            return fn;
        }

        var timeout;

        return function () {
            var args = [], len = arguments.length;
            while (len--) args[len] = arguments[len];

            var later = function () {
                timeout = null;

                // check if the fn call was cancelled.
                if (!token.cancelled) { fn.apply(void 0, args); }
            };

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (!timeout) { fn.apply(void 0, args); }
        };
    };

    /**
     * Appends a rule definition to a list of rules.
     */
    var appendRule = function (rule, rules) {
        if (!rules) {
            return normalizeRules(rule);
        }

        if (!rule) {
            return normalizeRules(rules);
        }

        if (typeof rules === 'string') {
            rules = normalizeRules(rules);
        }

        return assign({}, rules, normalizeRules(rule));
    };

    /**
     * Normalizes the given rules expression.
     */
    var normalizeRules = function (rules) {
        // if falsy value return an empty object.
        if (!rules) {
            return {};
        }

        if (isObject(rules)) {
            // $FlowFixMe
            return Object.keys(rules).reduce(function (prev, curr) {
                var params = [];
                // $FlowFixMe
                if (rules[curr] === true) {
                    params = [];
                } else if (Array.isArray(rules[curr])) {
                    params = rules[curr];
                } else if (isObject(rules[curr])) {
                    params = rules[curr];
                } else {
                    params = [rules[curr]];
                }

                // $FlowFixMe
                if (rules[curr] !== false) {
                    prev[curr] = params;
                }

                return prev;
            }, {});
        }

        if (typeof rules !== 'string') {
            warn('rules must be either a string or an object.');
            return {};
        }

        return rules.split('|').reduce(function (prev, rule) {
            var parsedRule = parseRule(rule);
            if (!parsedRule.name) {
                return prev;
            }

            prev[parsedRule.name] = parsedRule.params;
            return prev;
        }, {});
    };

    /**
     * Emits a warning to the console.
     */
    var warn = function (message) {
        console.warn(("[vee-validate] " + message)); // eslint-disable-line
    };

    /**
     * Creates a branded error object.
     */
    var createError = function (message) { return new Error(("[vee-validate] " + message)); };

    /**
     * Checks if the value is an object.
     */
    var isObject = function (obj) { return obj !== null && obj && typeof obj === 'object' && !Array.isArray(obj); };

    /**
     * Checks if a function is callable.
     */
    var isCallable = function (func) { return typeof func === 'function'; };

    /**
     * Check if element has the css class on it.
     */
    var hasClass = function (el, className) {
        if (el.classList) {
            return el.classList.contains(className);
        }

        return !!el.className.match(new RegExp(("(\\s|^)" + className + "(\\s|$)")));
    };

    /**
     * Adds the provided css className to the element.
     */
    var addClass = function (el, className) {
        if (el.classList) {
            el.classList.add(className);
            return;
        }

        if (!hasClass(el, className)) {
            el.className += " " + className;
        }
    };

    /**
     * Remove the provided css className from the element.
     */
    var removeClass = function (el, className) {
        if (el.classList) {
            el.classList.remove(className);
            return;
        }

        if (hasClass(el, className)) {
            var reg = new RegExp(("(\\s|^)" + className + "(\\s|$)"));
            el.className = el.className.replace(reg, ' ');
        }
    };

    /**
     * Adds or removes a class name on the input depending on the status flag.
     */
    var toggleClass = function (el, className, status) {
        if (!el || !className) { return; }

        if (Array.isArray(className)) {
            className.forEach(function (item) { return toggleClass(el, item, status); });
            return;
        }

        if (status) {
            return addClass(el, className);
        }

        removeClass(el, className);
    };

    /**
     * Converts an array-like object to array, provides a simple polyfill for Array.from
     */
    var toArray = function (arrayLike) {
        if (isCallable(Array.from)) {
            return Array.from(arrayLike);
        }

        var array = [];
        var length = arrayLike.length;
        /* istanbul ignore next */
        for (var i = 0; i < length; i++) {
            array.push(arrayLike[i]);
        }

        /* istanbul ignore next */
        return array;
    };

    /**
     * Assign polyfill from the mdn.
     */
    var assign = function (target) {
        var others = [], len = arguments.length - 1;
        while (len-- > 0) others[len] = arguments[len + 1];

        /* istanbul ignore else */
        if (isCallable(Object.assign)) {
            return Object.assign.apply(Object, [target].concat(others));
        }

        /* istanbul ignore next */
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        /* istanbul ignore next */
        var to = Object(target);
        /* istanbul ignore next */
        others.forEach(function (arg) {
            // Skip over if undefined or null
            if (arg != null) {
                Object.keys(arg).forEach(function (key) {
                    to[key] = arg[key];
                });
            }
        });
        /* istanbul ignore next */
        return to;
    };

    var id = 0;
    var idTemplate = '{id}';

    /**
     * Generates a unique id.
     */
    var uniqId = function () {
        // handle too many uses of uniqId, although unlikely.
        if (id >= 9999) {
            id = 0;
            // shift the template.
            idTemplate = idTemplate.replace('{id}', '_{id}');
        }

        id++;
        var newId = idTemplate.replace('{id}', String(id));

        return newId;
    };

    /**
     * finds the first element that satisfies the predicate callback, polyfills array.find
     */
    var find = function (arrayLike, predicate) {
        var array = Array.isArray(arrayLike) ? arrayLike : toArray(arrayLike);
        for (var i = 0; i < array.length; i++) {
            if (predicate(array[i])) {
                return array[i];
            }
        }

        return undefined;
    };

    var isBuiltInComponent = function (vnode) {
        if (!vnode) {
            return false;
        }

        var tag = vnode.componentOptions.tag;

        return /^(keep-alive|transition|transition-group)$/.test(tag);
    };

    var makeDelayObject = function (events, delay, delayConfig) {
        if (typeof delay === 'number') {
            return events.reduce(function (prev, e) {
                prev[e] = delay;
                return prev;
            }, {});
        }

        return events.reduce(function (prev, e) {
            if (typeof delay === 'object' && e in delay) {
                prev[e] = delay[e];
                return prev;
            }

            if (typeof delayConfig === 'number') {
                prev[e] = delayConfig;
                return prev;
            }

            prev[e] = (delayConfig && delayConfig[e]) || 0;

            return prev;
        }, {});
    };

    var deepParseInt = function (input) {
        if (typeof input === 'number') { return input; }

        if (typeof input === 'string') { return parseInt(input); }

        var map = {};
        for (var element in input) {
            map[element] = parseInt(input[element]);
        }

        return map;
    };

    var merge$1 = function (target, source) {
        if (!(isObject(target) && isObject(source))) {
            return target;
        }

        Object.keys(source).forEach(function (key) {
            var obj, obj$1;

            if (isObject(source[key])) {
                if (!target[key]) {
                    assign(target, (obj = {}, obj[key] = {}, obj));
                }

                merge$1(target[key], source[key]);
                return;
            }

            assign(target, (obj$1 = {}, obj$1[key] = source[key], obj$1));
        });

        return target;
    };

    var fillRulesFromElement = function (el, rules) {
        if (el.required) {
            rules = appendRule('required', rules);
        }

        if (isTextInput(el)) {
            if (el.type === 'email') {
                rules = appendRule(("email" + (el.multiple ? ':multiple' : '')), rules);
            }

            if (el.pattern) {
                rules = appendRule({ regex: el.pattern }, rules);
            }

            // 524288 is the max on some browsers and test environments.
            if (el.maxLength >= 0 && el.maxLength < 524288) {
                rules = appendRule(("max:" + (el.maxLength)), rules);
            }

            if (el.minLength > 0) {
                rules = appendRule(("min:" + (el.minLength)), rules);
            }

            if (el.type === 'number') {
                rules = appendRule('decimal', rules);
                if (el.min !== '') {
                    rules = appendRule(("min_value:" + (el.min)), rules);
                }

                if (el.max !== '') {
                    rules = appendRule(("max_value:" + (el.max)), rules);
                }
            }

            return rules;
        }

        if (isDateInput(el)) {
            var timeFormat = el.step && Number(el.step) < 60 ? 'HH:mm:ss' : 'HH:mm';

            if (el.type === 'date') {
                return appendRule('date_format:YYYY-MM-DD', rules);
            }

            if (el.type === 'datetime-local') {
                return appendRule(("date_format:YYYY-MM-DDT" + timeFormat), rules);
            }

            if (el.type === 'month') {
                return appendRule('date_format:YYYY-MM', rules);
            }

            if (el.type === 'week') {
                return appendRule('date_format:YYYY-[W]WW', rules);
            }

            if (el.type === 'time') {
                return appendRule(("date_format:" + timeFormat), rules);
            }
        }

        return rules;
    };

    var values = function (obj) {
        if (isCallable(Object.values)) {
            return Object.values(obj);
        }

        // fallback to keys()
        /* istanbul ignore next */
        return Object.keys(obj).map(function (k) { return obj[k]; });
    };

    var parseSelector = function (selector) {
        var rule = null;
        if (includes(selector, ':')) {
            rule = selector.split(':').pop();
            selector = selector.replace((":" + rule), '');
        }

        if (selector[0] === '#') {
            return {
                id: selector.slice(1),
                rule: rule,
                name: null,
                scope: null
            };
        }

        var scope = null;
        var name = selector;
        if (includes(selector, '.')) {
            var parts = selector.split('.');
            scope = parts[0];
            name = parts.slice(1).join('.');
        }

        return {
            id: null,
            scope: scope,
            name: name,
            rule: rule
        };
    };

    var includes = function (collection, item) {
        return collection.indexOf(item) !== -1;
    };

    var isEmptyArray = function (arr) {
        return Array.isArray(arr) && arr.length === 0;
    };

    var validate$e = function (value, options) {
        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$e(val, options); });
        }

        return toArray(options).some(function (item) {
            // eslint-disable-next-line
            return item == value;
        });
    };

    var included = {
        validate: validate$e
    };

    var validate$f = function () {
        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];

        return !validate$e.apply(void 0, args);
    };

    var excluded = {
        validate: validate$f
    };

    var validate$g = function (files, extensions) {
        var regex = new RegExp((".(" + (extensions.join('|')) + ")$"), 'i');

        return files.every(function (file) { return regex.test(file.name); });
    };

    var ext = {
        validate: validate$g
    };

    var validate$h = function (files) { return files.every(function (file) { return /\.(jpg|svg|jpeg|png|bmp|gif)$/i.test(file.name); }); };

    var image = {
        validate: validate$h
    };

    var validate$i = function (value) {
        if (Array.isArray(value)) {
            return value.every(function (val) { return /^-?[0-9]+$/.test(String(val)); });
        }

        return /^-?[0-9]+$/.test(String(value));
    };

    var integer = {
        validate: validate$i
    };

    var validate$j = function (value, ref) {
        if (ref === void 0) ref = {};
        var version = ref.version; if (version === void 0) version = 4;

        if (isNullOrUndefined(value)) {
            value = '';
        }

        if (Array.isArray(value)) {
            return value.every(function (val) { return isIP(val, version); });
        }

        return isIP(value, version);
    };

    var paramNames$b = ['version'];

    var ip = {
        validate: validate$j,
        paramNames: paramNames$b
    };

    var validate$k = function (value, ref) {
        if (ref === void 0) ref = [];
        var other = ref[0];

        return value === other;
    };

    var is = {
        validate: validate$k
    };

    var validate$l = function (value, ref) {
        if (ref === void 0) ref = [];
        var other = ref[0];

        return value !== other;
    };

    var is_not = {
        validate: validate$l
    };

    /**
     * @param {Array|String} value
     * @param {Number} length
     * @param {Number} max
     */
    var compare = function (value, length, max) {
        if (max === undefined) {
            return value.length === length;
        }

        // cast to number.
        max = Number(max);

        return value.length >= length && value.length <= max;
    };

    var validate$m = function (value, ref) {
        var length = ref[0];
        var max = ref[1]; if (max === void 0) max = undefined;

        length = Number(length);
        if (value === undefined || value === null) {
            return false;
        }

        if (typeof value === 'number') {
            value = String(value);
        }

        if (!value.length) {
            value = toArray(value);
        }

        return compare(value, length, max);
    };

    var length = {
        validate: validate$m
    };

    var validate$n = function (value, ref) {
        var length = ref[0];

        if (value === undefined || value === null) {
            return length >= 0;
        }

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$n(val, [length]); });
        }

        return String(value).length <= length;
    };

    var max$1 = {
        validate: validate$n
    };

    var validate$o = function (value, ref) {
        var max = ref[0];

        if (value === null || value === undefined || value === '') {
            return false;
        }

        if (Array.isArray(value)) {
            return value.length > 0 && value.every(function (val) { return validate$o(val, [max]); });
        }

        return Number(value) <= max;
    };

    var max_value = {
        validate: validate$o
    };

    var validate$p = function (files, mimes) {
        var regex = new RegExp(((mimes.join('|').replace('*', '.+')) + "$"), 'i');

        return files.every(function (file) { return regex.test(file.type); });
    };

    var mimes = {
        validate: validate$p
    };

    var validate$q = function (value, ref) {
        var length = ref[0];

        if (value === undefined || value === null) {
            return false;
        }

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$q(val, [length]); });
        }

        return String(value).length >= length;
    };

    var min$1 = {
        validate: validate$q
    };

    var validate$r = function (value, ref) {
        var min = ref[0];

        if (value === null || value === undefined || value === '') {
            return false;
        }

        if (Array.isArray(value)) {
            return value.length > 0 && value.every(function (val) { return validate$r(val, [min]); });
        }

        return Number(value) >= min;
    };

    var min_value = {
        validate: validate$r
    };

    var validate$s = function (value) {
        if (Array.isArray(value)) {
            return value.every(function (val) { return /^[0-9]+$/.test(String(val)); });
        }

        return /^[0-9]+$/.test(String(value));
    };

    var numeric = {
        validate: validate$s
    };

    var validate$t = function (value, ref) {
        var expression = ref.expression;

        if (typeof expression === 'string') {
            expression = new RegExp(expression);
        }

        if (Array.isArray(value)) {
            return value.every(function (val) { return validate$t(val, { expression: expression }); });
        }

        return expression.test(String(value));
    };

    var paramNames$c = ['expression'];

    var regex = {
        validate: validate$t,
        paramNames: paramNames$c
    };

    var validate$u = function (value, ref) {
        if (ref === void 0) ref = [];
        var invalidateFalse = ref[0]; if (invalidateFalse === void 0) invalidateFalse = false;

        if (isEmptyArray(value)) {
            return false;
        }

        // incase a field considers `false` as an empty value like checkboxes.
        if (value === false && invalidateFalse) {
            return false;
        }

        if (value === undefined || value === null) {
            return false;
        }

        return !!String(value).trim().length;
    };

    var required = {
        validate: validate$u
    };

    var validate$v = function (files, ref) {
        var size = ref[0];

        if (isNaN(size)) {
            return false;
        }

        var nSize = Number(size) * 1024;
        for (var i = 0; i < files.length; i++) {
            if (files[i].size > nSize) {
                return false;
            }
        }

        return true;
    };

    var size = {
        validate: validate$v
    };

    var isURL_1 = createCommonjsModule(function (module, exports) {

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = isURL;



        var _assertString2 = _interopRequireDefault(assertString_1);



        var _isFQDN2 = _interopRequireDefault(isFQDN_1);



        var _isIP2 = _interopRequireDefault(isIP_1);



        var _merge2 = _interopRequireDefault(merge_1);

        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        var default_url_options = {
            protocols: ['http', 'https', 'ftp'],
            require_tld: true,
            require_protocol: false,
            require_host: true,
            require_valid_protocol: true,
            allow_underscores: false,
            allow_trailing_dot: false,
            allow_protocol_relative_urls: false
        };

        var wrapped_ipv6 = /^\[([^\]]+)\](?::([0-9]+))?$/;

        function isRegExp(obj) {
            return Object.prototype.toString.call(obj) === '[object RegExp]';
        }

        function checkHost(host, matches) {
            for (var i = 0; i < matches.length; i++) {
                var match = matches[i];
                if (host === match || isRegExp(match) && match.test(host)) {
                    return true;
                }
            }
            return false;
        }

        function isURL(url, options) {
            (0, _assertString2.default)(url);
            if (!url || url.length >= 2083 || /[\s<>]/.test(url)) {
                return false;
            }
            if (url.indexOf('mailto:') === 0) {
                return false;
            }
            options = (0, _merge2.default)(options, default_url_options);
            var protocol = void 0,
                auth = void 0,
                host = void 0,
                hostname = void 0,
                port = void 0,
                port_str = void 0,
                split = void 0,
                ipv6 = void 0;

            split = url.split('#');
            url = split.shift();

            split = url.split('?');
            url = split.shift();

            split = url.split('://');
            if (split.length > 1) {
                protocol = split.shift().toLowerCase();
                if (options.require_valid_protocol && options.protocols.indexOf(protocol) === -1) {
                    return false;
                }
            } else if (options.require_protocol) {
                return false;
            } else if (url.substr(0, 2) === '//') {
                if (!options.allow_protocol_relative_urls) {
                    return false;
                }
                split[0] = url.substr(2);
            }
            url = split.join('://');

            if (url === '') {
                return false;
            }

            split = url.split('/');
            url = split.shift();

            if (url === '' && !options.require_host) {
                return true;
            }

            split = url.split('@');
            if (split.length > 1) {
                auth = split.shift();
                if (auth.indexOf(':') >= 0 && auth.split(':').length > 2) {
                    return false;
                }
            }
            hostname = split.join('@');

            port_str = null;
            ipv6 = null;
            var ipv6_match = hostname.match(wrapped_ipv6);
            if (ipv6_match) {
                host = '';
                ipv6 = ipv6_match[1];
                port_str = ipv6_match[2] || null;
            } else {
                split = hostname.split(':');
                host = split.shift();
                if (split.length) {
                    port_str = split.join(':');
                }
            }

            if (port_str !== null) {
                port = parseInt(port_str, 10);
                if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
                    return false;
                }
            }

            if (!(0, _isIP2.default)(host) && !(0, _isFQDN2.default)(host, options) && (!ipv6 || !(0, _isIP2.default)(ipv6, 6))) {
                return false;
            }

            host = host || ipv6;

            if (options.host_whitelist && !checkHost(host, options.host_whitelist)) {
                return false;
            }
            if (options.host_blacklist && checkHost(host, options.host_blacklist)) {
                return false;
            }

            return true;
        }
        module.exports = exports['default'];
    });

    var isURL = unwrapExports(isURL_1);

    var validate$w = function (value, options) {
        if (options === void 0) options = {};

        if (isNullOrUndefined(value)) {
            value = '';
        }

        if (Array.isArray(value)) {
            return value.every(function (val) { return isURL(val, options); });
        }

        return isURL(value, options);
    };

    var url = {
        validate: validate$w
    };

    /* eslint-disable camelcase */

    var Rules = /*#__PURE__*/Object.freeze({
        after: after,
        alpha_dash: alpha_dash,
        alpha_num: alpha_num,
        alpha_spaces: alpha_spaces,
        alpha: alpha$1,
        before: before,
        between: between,
        confirmed: confirmed,
        credit_card: credit_card,
        date_between: date_between,
        date_format: date_format,
        decimal: decimal,
        digits: digits,
        dimensions: dimensions,
        email: email,
        ext: ext,
        image: image,
        included: included,
        integer: integer,
        length: length,
        ip: ip,
        is_not: is_not,
        is: is,
        max: max$1,
        max_value: max_value,
        mimes: mimes,
        min: min$1,
        min_value: min_value,
        excluded: excluded,
        numeric: numeric,
        regex: regex,
        required: required,
        size: size,
        url: url
    });

    // 

    var LOCALE = 'en';

    var Dictionary = function Dictionary(dictionary) {
        if (dictionary === void 0) dictionary = {};

        this.container = {};
        this.merge(dictionary);
    };

    var prototypeAccessors = { locale: { configurable: true } };

    prototypeAccessors.locale.get = function () {
        return LOCALE;
    };

    prototypeAccessors.locale.set = function (value) {
        LOCALE = value || 'en';
    };

    Dictionary.prototype.hasLocale = function hasLocale(locale) {
        return !!this.container[locale];
    };

    Dictionary.prototype.setDateFormat = function setDateFormat(locale, format) {
        if (!this.container[locale]) {
            this.container[locale] = {};
        }

        this.container[locale].dateFormat = format;
    };

    Dictionary.prototype.getDateFormat = function getDateFormat(locale) {
        if (!this.container[locale] || !this.container[locale].dateFormat) {
            return null;
        }

        return this.container[locale].dateFormat;
    };

    Dictionary.prototype.getMessage = function getMessage(locale, key, data) {
        var message = null;
        if (!this.hasMessage(locale, key)) {
            message = this._getDefaultMessage(locale);
        } else {
            message = this.container[locale].messages[key];
        }

        return isCallable(message) ? message.apply(void 0, data) : message;
    };

    /**
     * Gets a specific message for field. falls back to the rule message.
     */
    Dictionary.prototype.getFieldMessage = function getFieldMessage(locale, field, key, data) {
        if (!this.hasLocale(locale)) {
            return this.getMessage(locale, key, data);
        }

        var dict = this.container[locale].custom && this.container[locale].custom[field];
        if (!dict || !dict[key]) {
            return this.getMessage(locale, key, data);
        }

        var message = dict[key];
        return isCallable(message) ? message.apply(void 0, data) : message;
    };

    Dictionary.prototype._getDefaultMessage = function _getDefaultMessage(locale) {
        if (this.hasMessage(locale, '_default')) {
            return this.container[locale].messages._default;
        }

        return this.container.en.messages._default;
    };

    Dictionary.prototype.getAttribute = function getAttribute(locale, key, fallback) {
        if (fallback === void 0) fallback = '';

        if (!this.hasAttribute(locale, key)) {
            return fallback;
        }

        return this.container[locale].attributes[key];
    };

    Dictionary.prototype.hasMessage = function hasMessage(locale, key) {
        return !!(
            this.hasLocale(locale) &&
            this.container[locale].messages &&
            this.container[locale].messages[key]
        );
    };

    Dictionary.prototype.hasAttribute = function hasAttribute(locale, key) {
        return !!(
            this.hasLocale(locale) &&
            this.container[locale].attributes &&
            this.container[locale].attributes[key]
        );
    };

    Dictionary.prototype.merge = function merge$1$$1(dictionary) {
        merge$1(this.container, dictionary);
    };

    Dictionary.prototype.setMessage = function setMessage(locale, key, message) {
        if (!this.hasLocale(locale)) {
            this.container[locale] = {
                messages: {},
                attributes: {}
            };
        }

        this.container[locale].messages[key] = message;
    };

    Dictionary.prototype.setAttribute = function setAttribute(locale, key, attribute) {
        if (!this.hasLocale(locale)) {
            this.container[locale] = {
                messages: {},
                attributes: {}
            };
        }

        this.container[locale].attributes[key] = attribute;
    };

    Object.defineProperties(Dictionary.prototype, prototypeAccessors);

    var drivers = {
        default: new Dictionary({
            en: {
                messages: {},
                attributes: {},
                custom: {}
            }
        })
    };

    var currentDriver = 'default';

    var DictionaryResolver = function DictionaryResolver() { };

    DictionaryResolver._checkDriverName = function _checkDriverName(driver) {
        if (!driver) {
            throw createError('you must provide a name to the dictionary driver');
        }
    };

    DictionaryResolver.setDriver = function setDriver(driver, implementation) {
        if (implementation === void 0) implementation = null;

        this._checkDriverName(driver);
        if (implementation) {
            drivers[driver] = implementation;
        }

        currentDriver = driver;
    };

    DictionaryResolver.getDriver = function getDriver() {
        return drivers[currentDriver];
    };

    // 

    var ErrorBag = function ErrorBag(errorBag, id) {
        if (errorBag === void 0) errorBag = null;
        if (id === void 0) id = null;

        this.vmId = id || null;
        // make this bag a mirror of the provided one, sharing the same items reference.
        if (errorBag && errorBag instanceof ErrorBag) {
            this.items = errorBag.items;
        } else {
            this.items = [];
        }
    };

    ErrorBag.prototype[typeof Symbol === 'function' ? Symbol.iterator : '@@iterator'] = function () {
        var this$1 = this;

        var index = 0;
        return {
            next: function () {
                return { value: this$1.items[index++], done: index > this$1.items.length };
            }
        };
    };

    /**
     * Adds an error to the internal array.
     */
    ErrorBag.prototype.add = function add(error) {
        var ref;

        (ref = this.items).push.apply(
            ref, this._normalizeError(error)
        );
    };

    /**
     * Normalizes passed errors to an error array.
     */
    ErrorBag.prototype._normalizeError = function _normalizeError(error) {
        var this$1 = this;

        if (Array.isArray(error)) {
            return error.map(function (e) {
                e.scope = !isNullOrUndefined(e.scope) ? e.scope : null;
                e.vmId = !isNullOrUndefined(e.vmId) ? e.vmId : (this$1.vmId || null);

                return e;
            });
        }

        error.scope = !isNullOrUndefined(error.scope) ? error.scope : null;
        error.vmId = !isNullOrUndefined(error.vmId) ? error.vmId : (this.vmId || null);

        return [error];
    };

    /**
     * Regenrates error messages if they have a generator function.
     */
    ErrorBag.prototype.regenerate = function regenerate() {
        this.items.forEach(function (i) {
            i.msg = isCallable(i.regenerate) ? i.regenerate() : i.msg;
        });
    };

    /**
     * Updates a field error with the new field scope.
     */
    ErrorBag.prototype.update = function update(id, error) {
        var item = find(this.items, function (i) { return i.id === id; });
        if (!item) {
            return;
        }

        var idx = this.items.indexOf(item);
        this.items.splice(idx, 1);
        item.scope = error.scope;
        this.items.push(item);
    };

    /**
     * Gets all error messages from the internal array.
     */
    ErrorBag.prototype.all = function all(scope) {
        var this$1 = this;

        var filterFn = function (item) {
            var matchesScope = true;
            var matchesVM = true;
            if (!isNullOrUndefined(scope)) {
                matchesScope = item.scope === scope;
            }

            if (!isNullOrUndefined(this$1.vmId)) {
                matchesVM = item.vmId === this$1.vmId;
            }

            return matchesVM && matchesScope;
        };

        return this.items.filter(filterFn).map(function (e) { return e.msg; });
    };

    /**
     * Checks if there are any errors in the internal array.
     */
    ErrorBag.prototype.any = function any(scope) {
        var this$1 = this;

        var filterFn = function (item) {
            var matchesScope = true;
            var matchesVM = true;
            if (!isNullOrUndefined(scope)) {
                matchesScope = item.scope === scope;
            }

            if (!isNullOrUndefined(this$1.vmId)) {
                matchesVM = item.vmId === this$1.vmId;
            }

            return matchesVM && matchesScope;
        };

        return !!this.items.filter(filterFn).length;
    };

    /**
     * Removes all items from the internal array.
     */
    ErrorBag.prototype.clear = function clear(scope) {
        var this$1 = this;

        var matchesVM = isNullOrUndefined(this.vmId) ? function () { return true; } : function (i) { return i.vmId === this$1.vmId; };
        if (isNullOrUndefined(scope)) {
            scope = null;
        }

        for (var i = 0; i < this.items.length; ++i) {
            if (matchesVM(this.items[i]) && this.items[i].scope === scope) {
                this.items.splice(i, 1);
                --i;
            }
        }
    };

    /**
     * Collects errors into groups or for a specific field.
     */
    ErrorBag.prototype.collect = function collect(field, scope, map) {
        var this$1 = this;
        if (map === void 0) map = true;

        var isSingleField = !isNullOrUndefined(field) && !field.includes('*');
        var groupErrors = function (items) {
            var errors = items.reduce(function (collection, error) {
                if (!isNullOrUndefined(this$1.vmId) && error.vmId !== this$1.vmId) {
                    return collection;
                }

                if (!collection[error.field]) {
                    collection[error.field] = [];
                }

                collection[error.field].push(map ? error.msg : error);

                return collection;
            }, {});

            // reduce the collection to be a single array.
            if (isSingleField) {
                return values(errors)[0] || [];
            }

            return errors;
        };

        if (isNullOrUndefined(field)) {
            return groupErrors(this.items);
        }

        var selector = isNullOrUndefined(scope) ? String(field) : (scope + "." + field);
        var ref = this._makeCandidateFilters(selector);
        var isPrimary = ref.isPrimary;
        var isAlt = ref.isAlt;

        var collected = this.items.reduce(function (prev, curr) {
            if (isPrimary(curr)) {
                prev.primary.push(curr);
            }

            if (isAlt(curr)) {
                prev.alt.push(curr);
            }

            return prev;
        }, { primary: [], alt: [] });

        collected = collected.primary.length ? collected.primary : collected.alt;

        return groupErrors(collected);
    };

    /**
     * Gets the internal array length.
     */
    ErrorBag.prototype.count = function count() {
        var this$1 = this;

        if (this.vmId) {
            return this.items.filter(function (e) { return e.vmId === this$1.vmId; }).length;
        }

        return this.items.length;
    };

    /**
     * Finds and fetches the first error message for the specified field id.
     */
    ErrorBag.prototype.firstById = function firstById(id) {
        var error = find(this.items, function (i) { return i.id === id; });

        return error ? error.msg : undefined;
    };

    /**
     * Gets the first error message for a specific field.
     */
    ErrorBag.prototype.first = function first(field, scope) {
        if (scope === void 0) scope = null;

        var selector = isNullOrUndefined(scope) ? field : (scope + "." + field);
        var match = this._match(selector);

        return match && match.msg;
    };

    /**
     * Returns the first error rule for the specified field
     */
    ErrorBag.prototype.firstRule = function firstRule(field, scope) {
        var errors = this.collect(field, scope, false);

        return (errors.length && errors[0].rule) || undefined;
    };

    /**
     * Checks if the internal array has at least one error for the specified field.
     */
    ErrorBag.prototype.has = function has(field, scope) {
        if (scope === void 0) scope = null;

        return !!this.first(field, scope);
    };

    /**
     * Gets the first error message for a specific field and a rule.
     */
    ErrorBag.prototype.firstByRule = function firstByRule(name, rule, scope) {
        if (scope === void 0) scope = null;

        var error = this.collect(name, scope, false).filter(function (e) { return e.rule === rule; })[0];

        return (error && error.msg) || undefined;
    };

    /**
     * Gets the first error message for a specific field that not match the rule.
     */
    ErrorBag.prototype.firstNot = function firstNot(name, rule, scope) {
        if (rule === void 0) rule = 'required';
        if (scope === void 0) scope = null;

        var error = this.collect(name, scope, false).filter(function (e) { return e.rule !== rule; })[0];

        return (error && error.msg) || undefined;
    };

    /**
     * Removes errors by matching against the id or ids.
     */
    ErrorBag.prototype.removeById = function removeById(id) {
        var condition = function (item) { return item.id === id; };
        if (Array.isArray(id)) {
            condition = function (item) { return id.indexOf(item.id) !== -1; };
        }

        for (var i = 0; i < this.items.length; ++i) {
            if (condition(this.items[i])) {
                this.items.splice(i, 1);
                --i;
            }
        }
    };

    /**
     * Removes all error messages associated with a specific field.
     */
    ErrorBag.prototype.remove = function remove(field, scope, vmId) {
        if (isNullOrUndefined(field)) {
            return;
        }

        var selector = isNullOrUndefined(scope) ? String(field) : (scope + "." + field);
        var ref = this._makeCandidateFilters(selector);
        var isPrimary = ref.isPrimary;
        var shouldRemove = function (item) {
            if (isNullOrUndefined(vmId)) { return isPrimary(item); }

            return isPrimary(item) && item.vmId === vmId;
        };

        for (var i = 0; i < this.items.length; ++i) {
            if (shouldRemove(this.items[i])) {
                this.items.splice(i, 1);
                --i;
            }
        }
    };

    ErrorBag.prototype._makeCandidateFilters = function _makeCandidateFilters(selector) {
        var this$1 = this;

        var matchesRule = function () { return true; };
        var matchesScope = function () { return true; };
        var matchesName = function () { return true; };
        var matchesVM = function () { return true; };

        var ref = parseSelector(selector);
        var id = ref.id;
        var rule = ref.rule;
        var scope = ref.scope;
        var name = ref.name;

        if (rule) {
            matchesRule = function (item) { return item.rule === rule; };
        }

        // match by id, can be combined with rule selection.
        if (id) {
            return {
                isPrimary: function (item) { return matchesRule(item) && (function (item) { return id === item.id; }); },
                isAlt: function () { return false; }
            };
        }

        if (isNullOrUndefined(scope)) {
            // if no scope specified, make sure the found error has no scope.
            matchesScope = function (item) { return isNullOrUndefined(item.scope); };
        } else {
            matchesScope = function (item) { return item.scope === scope; };
        }

        if (!isNullOrUndefined(name) && name !== '*') {
            matchesName = function (item) { return item.field === name; };
        }

        if (!isNullOrUndefined(this.vmId)) {
            matchesVM = function (item) { return item.vmId === this$1.vmId; };
        }

        // matches the first candidate.
        var isPrimary = function (item) {
            return matchesVM(item) && matchesName(item) && matchesRule(item) && matchesScope(item);
        };

        // matches a second candidate, which is a field with a name containing the '.' character.
        var isAlt = function (item) {
            return matchesVM(item) && matchesRule(item) && item.field === (scope + "." + name);
        };

        return {
            isPrimary: isPrimary,
            isAlt: isAlt
        };
    };

    ErrorBag.prototype._match = function _match(selector) {
        if (isNullOrUndefined(selector)) {
            return undefined;
        }

        var ref = this._makeCandidateFilters(selector);
        var isPrimary = ref.isPrimary;
        var isAlt = ref.isAlt;

        return this.items.reduce(function (prev, item, idx, arr) {
            var isLast = idx === arr.length - 1;
            if (prev.primary) {
                return isLast ? prev.primary : prev;
            }

            if (isPrimary(item)) {
                prev.primary = item;
            }

            if (isAlt(item)) {
                prev.alt = item;
            }

            // keep going.
            if (!isLast) {
                return prev;
            }

            return prev.primary || prev.alt;
        }, {});
    };

    // VNode Utils

    // Gets the model object on the vnode.
    function findModel(vnode) {
        if (!vnode.data) {
            return null;
        }

        // Component Model
        if (vnode.data.model) {
            return vnode.data.model;
        }

        return !!(vnode.data.directives) && find(vnode.data.directives, function (d) { return d.name === 'model'; });
    }

    function extractVNodes(vnode) {
        if (findModel(vnode)) {
            return [vnode];
        }

        var children = Array.isArray(vnode) ? vnode : vnode.children;
        if (!Array.isArray(children)) {
            return [];
        }

        return children.reduce(function (nodes, node) {
            var candidates = extractVNodes(node);
            if (candidates.length) {
                nodes.push.apply(nodes, candidates);
            }

            return nodes;
        }, []);
    }

    // Resolves v-model config if exists.
    function findModelConfig(vnode) {
        if (!vnode.componentOptions) { return null; }

        return vnode.componentOptions.Ctor.options.model;
    }
    // Adds a listener to vnode listener object.
    function mergeVNodeListeners(obj, eventName, handler) {
        // Has a single listener.
        if (isCallable(obj[eventName])) {
            var prevHandler = obj[eventName];
            obj[eventName] = [prevHandler];
        }

        // has other listeners.
        if (Array.isArray(obj[eventName])) {
            obj[eventName].push(handler);
            return;
        }

        // no listener at all.
        if (isNullOrUndefined(obj[eventName])) {
            obj[eventName] = [handler];
        }
    }

    // Adds a listener to a native HTML vnode.
    function addNativeNodeListener(node, eventName, handler) {
        if (isNullOrUndefined(node.data.on)) {
            node.data.on = {};
        }

        mergeVNodeListeners(node.data.on, eventName, handler);
    }

    // Adds a listener to a Vue component vnode.
    function addComponentNodeListener(node, eventName, handler) {
        /* istanbul ignore next */
        if (!node.componentOptions.listeners) {
            node.componentOptions.listeners = {};
        }

        mergeVNodeListeners(node.componentOptions.listeners, eventName, handler);
    }
    function addVNodeListener(vnode, eventName, handler) {
        if (vnode.componentOptions) {
            addComponentNodeListener(vnode, eventName, handler);
        }

        addNativeNodeListener(vnode, eventName, handler);
    }
    // Determines if `change` should be used over `input` for listeners.
    function getInputEventName(vnode, model) {
        // Is a component.
        if (vnode.componentOptions) {
            var ref = findModelConfig(vnode) || { event: 'input' };
            var event = ref.event;

            return event;
        }

        // Lazy Models typically use change event
        if (model && model.modifiers && model.modifiers.lazy) {
            return 'change';
        }

        // is a textual-type input.
        if (vnode.data.attrs && isTextInput({ type: vnode.data.attrs.type || 'text' })) {
            return 'input';
        }

        return 'change';
    }

    function normalizeSlots(slots, ctx) {
        return Object.keys(slots).reduce(function (arr, key) {
            slots[key].forEach(function (vnode) {
                if (!vnode.context) {
                    slots[key].context = ctx;
                    if (!vnode.data) {
                        vnode.data = {};
                    }
                    vnode.data.slot = key;
                }
            });

            return arr.concat(slots[key]);
        }, []);
    }

    function createRenderless(h, vnode) {
        // a single-root slot yay!
        if (!Array.isArray(vnode)) {
            return vnode;
        }

        if (vnode.length === 1) {
            return vnode[0];
        }

        {
            warn('Your slot should have one root element. Rendering a span as the root.');
        }

        // Renders a multi-root node, should throw a Vue error.
        return vnode;
    }

    /**
     * Generates the options required to construct a field.
     */
    var Resolver = function Resolver() { };

    Resolver.generate = function generate(el, binding, vnode) {
        var model = Resolver.resolveModel(binding, vnode);
        var options = pluginInstance.resolveConfig(vnode.context);

        return {
            name: Resolver.resolveName(el, vnode),
            el: el,
            listen: !binding.modifiers.disable,
            bails: binding.modifiers.bails ? true : (binding.modifiers.continues === true ? false : undefined),
            scope: Resolver.resolveScope(el, binding, vnode),
            vm: Resolver.makeVM(vnode.context),
            expression: binding.value,
            component: vnode.componentInstance,
            classes: options.classes,
            classNames: options.classNames,
            getter: Resolver.resolveGetter(el, vnode, model),
            events: Resolver.resolveEvents(el, vnode) || options.events,
            model: model,
            delay: Resolver.resolveDelay(el, vnode, options),
            rules: Resolver.resolveRules(el, binding, vnode),
            immediate: !!binding.modifiers.initial || !!binding.modifiers.immediate,
            validity: options.validity,
            aria: options.aria,
            initialValue: Resolver.resolveInitialValue(vnode)
        };
    };

    Resolver.getCtorConfig = function getCtorConfig(vnode) {
        if (!vnode.componentInstance) { return null; }

        var config = getPath('componentInstance.$options.$_veeValidate', vnode);

        return config;
    };

    /**
     * Resolves the rules defined on an element.
     */
    Resolver.resolveRules = function resolveRules(el, binding, vnode) {
        var rules = '';
        if (!binding.value && (!binding || !binding.expression)) {
            rules = getDataAttribute(el, 'rules');
        }

        if (binding.value && includes(['string', 'object'], typeof binding.value.rules)) {
            rules = binding.value.rules;
        } else if (binding.value) {
            rules = binding.value;
        }

        if (vnode.componentInstance) {
            return rules;
        }

        return fillRulesFromElement(el, rules);
    };

    /**
     * @param {*} vnode
     */
    Resolver.resolveInitialValue = function resolveInitialValue(vnode) {
        var model = vnode.data.model || find(vnode.data.directives, function (d) { return d.name === 'model'; });

        return model && model.value;
    };

    /**
     * Creates a non-circular partial VM instance from a Vue instance.
     * @param {*} vm
     */
    Resolver.makeVM = function makeVM(vm) {
        return {
            get $el() {
                return vm.$el;
            },
            get $refs() {
                return vm.$refs;
            },
            $watch: vm.$watch ? vm.$watch.bind(vm) : function () { },
            $validator: vm.$validator ? {
                errors: vm.$validator.errors,
                validate: vm.$validator.validate.bind(vm.$validator),
                update: vm.$validator.update.bind(vm.$validator)
            } : null
        };
    };

    /**
     * Resolves the delay value.
     * @param {*} el
     * @param {*} vnode
     * @param {Object} options
     */
    Resolver.resolveDelay = function resolveDelay(el, vnode, options) {
        var delay = getDataAttribute(el, 'delay');
        var globalDelay = (options && 'delay' in options) ? options.delay : 0;

        if (!delay && vnode.componentInstance && vnode.componentInstance.$attrs) {
            delay = vnode.componentInstance.$attrs['data-vv-delay'];
        }

        if (!isObject(globalDelay)) {
            return deepParseInt(delay || globalDelay);
        }

        if (!isNullOrUndefined(delay)) {
            globalDelay.input = delay;
        }

        return deepParseInt(globalDelay);
    };

    /**
     * Resolves the events to validate in response to.
     * @param {*} el
     * @param {*} vnode
     */
    Resolver.resolveEvents = function resolveEvents(el, vnode) {
        // resolve it from the root element.
        var events = getDataAttribute(el, 'validate-on');

        // resolve from data-vv-validate-on if its a vue component.
        if (!events && vnode.componentInstance && vnode.componentInstance.$attrs) {
            events = vnode.componentInstance.$attrs['data-vv-validate-on'];
        }

        // resolve it from $_veeValidate options.
        if (!events && vnode.componentInstance) {
            var config = Resolver.getCtorConfig(vnode);
            events = config && config.events;
        }

        if (!events && pluginInstance.config.events) {
            events = pluginInstance.config.events;
        }

        // resolve the model event if its configured for custom components.
        if (events && vnode.componentInstance && includes(events, 'input')) {
            var ref = vnode.componentInstance.$options.model || { event: 'input' };
            var event = ref.event;
            // if the prop was configured but not the model.
            if (!event) {
                return events;
            }

            events = events.replace('input', event);
        }

        return events;
    };

    /**
     * Resolves the scope for the field.
     * @param {*} el
     * @param {*} binding
     */
    Resolver.resolveScope = function resolveScope(el, binding, vnode) {
        if (vnode === void 0) vnode = {};

        var scope = null;
        if (vnode.componentInstance && isNullOrUndefined(scope)) {
            scope = vnode.componentInstance.$attrs && vnode.componentInstance.$attrs['data-vv-scope'];
        }

        return !isNullOrUndefined(scope) ? scope : getScope(el);
    };

    /**
     * Checks if the node directives contains a v-model or a specified arg.
     * Args take priority over models.
     *
     * @return {Object}
     */
    Resolver.resolveModel = function resolveModel(binding, vnode) {
        if (binding.arg) {
            return { expression: binding.arg };
        }

        var model = findModel(vnode);
        if (!model) {
            return null;
        }

        // https://github.com/vuejs/vue/blob/dev/src/core/util/lang.js#L26
        var watchable = !/[^\w.$]/.test(model.expression) && hasPath(model.expression, vnode.context);
        var lazy = !!(model.modifiers && model.modifiers.lazy);

        if (!watchable) {
            return { expression: null, lazy: lazy };
        }

        return { expression: model.expression, lazy: lazy };
    };

    /**
     * Resolves the field name to trigger validations.
     * @return {String} The field name.
     */
    Resolver.resolveName = function resolveName(el, vnode) {
        var name = getDataAttribute(el, 'name');

        if (!name && !vnode.componentInstance) {
            return el.name;
        }

        if (!name && vnode.componentInstance && vnode.componentInstance.$attrs) {
            name = vnode.componentInstance.$attrs['data-vv-name'] || vnode.componentInstance.$attrs['name'];
        }

        if (!name && vnode.componentInstance) {
            var config = Resolver.getCtorConfig(vnode);
            if (config && isCallable(config.name)) {
                var boundGetter = config.name.bind(vnode.componentInstance);

                return boundGetter();
            }

            return vnode.componentInstance.name;
        }

        return name;
    };

    /**
     * Returns a value getter input type.
     */
    Resolver.resolveGetter = function resolveGetter(el, vnode, model) {
        if (model && model.expression) {
            return function () {
                return getPath(model.expression, vnode.context);
            };
        }

        if (vnode.componentInstance) {
            var path = getDataAttribute(el, 'value-path') || (vnode.componentInstance.$attrs && vnode.componentInstance.$attrs['data-vv-value-path']);
            if (path) {
                return function () {
                    return getPath(path, vnode.componentInstance);
                };
            }

            var config = Resolver.getCtorConfig(vnode);
            if (config && isCallable(config.value)) {
                var boundGetter = config.value.bind(vnode.componentInstance);

                return function () {
                    return boundGetter();
                };
            }

            var ref = vnode.componentInstance.$options.model || { prop: 'value' };
            var prop = ref.prop;

            return function () {
                return vnode.componentInstance[prop];
            };
        }

        switch (el.type) {
            case 'checkbox': return function () {
                var els = document.querySelectorAll(("input[name=\"" + (el.name) + "\"]"));

                els = toArray(els).filter(function (el) { return el.checked; });
                if (!els.length) { return undefined; }

                return els.map(function (checkbox) { return checkbox.value; });
            };
            case 'radio': return function () {
                var els = document.querySelectorAll(("input[name=\"" + (el.name) + "\"]"));
                var elm = find(els, function (el) { return el.checked; });

                return elm && elm.value;
            };
            case 'file': return function (context) {
                return toArray(el.files);
            };
            case 'select-multiple': return function () {
                return toArray(el.options).filter(function (opt) { return opt.selected; }).map(function (opt) { return opt.value; });
            };
            default: return function () {
                return el && el.value;
            };
        }
    };

    var RULES = {};

    var RuleContainer = function RuleContainer() { };

    var staticAccessors = { rules: { configurable: true } };

    RuleContainer.add = function add(name, ref) {
        var validate = ref.validate;
        var options = ref.options;
        var paramNames = ref.paramNames;

        RULES[name] = {
            validate: validate,
            options: options,
            paramNames: paramNames
        };
    };

    staticAccessors.rules.get = function () {
        return RULES;
    };

    RuleContainer.has = function has(name) {
        return !!RULES[name];
    };

    RuleContainer.isImmediate = function isImmediate(name) {
        return !!(RULES[name] && RULES[name].options.immediate);
    };

    RuleContainer.isTargetRule = function isTargetRule(name) {
        return !!(RULES[name] && RULES[name].options.hasTarget);
    };

    RuleContainer.remove = function remove(ruleName) {
        delete RULES[ruleName];
    };

    RuleContainer.getParamNames = function getParamNames(ruleName) {
        return RULES[ruleName] && RULES[ruleName].paramNames;
    };

    RuleContainer.getOptions = function getOptions(ruleName) {
        return RULES[ruleName] && RULES[ruleName].options;
    };

    RuleContainer.getValidatorMethod = function getValidatorMethod(ruleName) {
        return RULES[ruleName] ? RULES[ruleName].validate : null;
    };

    Object.defineProperties(RuleContainer, staticAccessors);

    // 

    var isEvent = function (evt) {
        return (typeof Event !== 'undefined' && isCallable(Event) && evt instanceof Event) || (evt && evt.srcElement);
    };

    var normalizeEvents = function (evts) {
        if (!evts) { return []; }

        return (typeof evts === 'string' ? evts.split('|') : evts);
    };

    var supportsPassive = true;

    var detectPassiveSupport = function () {
        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function get() {
                    supportsPassive = true;
                }
            });
            window.addEventListener('testPassive', null, opts);
            window.removeEventListener('testPassive', null, opts);
        } catch (e) {
            supportsPassive = false;
        }
        return supportsPassive;
    };

    var addEventListener = function (el, eventName, cb) {
        el.addEventListener(eventName, cb, supportsPassive ? { passive: true } : false);
    };

    // 

    var DEFAULT_OPTIONS = {
        targetOf: null,
        immediate: false,
        scope: null,
        listen: true,
        name: null,
        rules: {},
        vm: null,
        classes: false,
        validity: true,
        aria: true,
        events: 'input|blur',
        delay: 0,
        classNames: {
            touched: 'touched', // the control has been blurred
            untouched: 'untouched', // the control hasn't been blurred
            valid: 'valid', // model is valid
            invalid: 'invalid', // model is invalid
            pristine: 'pristine', // control has not been interacted with
            dirty: 'dirty' // control has been interacted with
        }
    };

    var Field = function Field(options) {
        if (options === void 0) options = {};

        this.id = uniqId();
        this.el = options.el;
        this.updated = false;
        this.dependencies = [];
        this.vmId = options.vmId;
        this.watchers = [];
        this.events = [];
        this.delay = 0;
        this.rules = {};
        this._cacheId(options);
        this.classNames = assign({}, DEFAULT_OPTIONS.classNames);
        options = assign({}, DEFAULT_OPTIONS, options);
        this._delay = !isNullOrUndefined(options.delay) ? options.delay : 0; // cache initial delay
        this.validity = options.validity;
        this.aria = options.aria;
        this.flags = createFlags();
        this.vm = options.vm;
        this.componentInstance = options.component;
        this.ctorConfig = this.componentInstance ? getPath('$options.$_veeValidate', this.componentInstance) : undefined;
        this.update(options);
        // set initial value.
        this.initialValue = this.value;
        this.updated = false;
    };

    var prototypeAccessors$1 = { validator: { configurable: true }, isRequired: { configurable: true }, isDisabled: { configurable: true }, alias: { configurable: true }, value: { configurable: true }, bails: { configurable: true }, rejectsFalse: { configurable: true } };

    prototypeAccessors$1.validator.get = function () {
        if (!this.vm || !this.vm.$validator) {
            return { validate: function () { } };
        }

        return this.vm.$validator;
    };

    prototypeAccessors$1.isRequired.get = function () {
        return !!this.rules.required;
    };

    prototypeAccessors$1.isDisabled.get = function () {
        return !!(this.componentInstance && this.componentInstance.disabled) || !!(this.el && this.el.disabled);
    };

    /**
     * Gets the display name (user-friendly name).
     */
    prototypeAccessors$1.alias.get = function () {
        if (this._alias) {
            return this._alias;
        }

        var alias = null;
        if (this.ctorConfig && this.ctorConfig.alias) {
            alias = isCallable(this.ctorConfig.alias) ? this.ctorConfig.alias.call(this.componentInstance) : this.ctorConfig.alias;
        }

        if (!alias && this.el) {
            alias = getDataAttribute(this.el, 'as');
        }

        if (!alias && this.componentInstance) {
            return this.componentInstance.$attrs && this.componentInstance.$attrs['data-vv-as'];
        }

        return alias;
    };

    /**
     * Gets the input value.
     */

    prototypeAccessors$1.value.get = function () {
        if (!isCallable(this.getter)) {
            return undefined;
        }

        return this.getter();
    };

    prototypeAccessors$1.bails.get = function () {
        return this._bails;
    };

    /**
     * If the field rejects false as a valid value for the required rule.
     */

    prototypeAccessors$1.rejectsFalse.get = function () {
        if (this.componentInstance && this.ctorConfig) {
            return !!this.ctorConfig.rejectsFalse;
        }

        if (!this.el) {
            return false;
        }

        return this.el.type === 'checkbox';
    };

    /**
     * Determines if the instance matches the options provided.
     */
    Field.prototype.matches = function matches(options) {
        var this$1 = this;

        if (!options) {
            return true;
        }

        if (options.id) {
            return this.id === options.id;
        }

        var matchesComponentId = isNullOrUndefined(options.vmId) ? function () { return true; } : function (id) { return id === this$1.vmId; };
        if (!matchesComponentId(options.vmId)) {
            return false;
        }

        if (options.name === undefined && options.scope === undefined) {
            return true;
        }

        if (options.scope === undefined) {
            return this.name === options.name;
        }

        if (options.name === undefined) {
            return this.scope === options.scope;
        }

        return options.name === this.name && options.scope === this.scope;
    };

    /**
     * Caches the field id.
     */
    Field.prototype._cacheId = function _cacheId(options) {
        if (this.el && !options.targetOf) {
            this.el._veeValidateId = this.id;
        }
    };

    /**
     * Keeps a reference of the most current validation run.
     */
    Field.prototype.waitFor = function waitFor(pendingPromise) {
        this._waitingFor = pendingPromise;
    };

    Field.prototype.isWaitingFor = function isWaitingFor(promise) {
        return this._waitingFor === promise;
    };

    /**
     * Updates the field with changed data.
     */
    Field.prototype.update = function update(options) {
        this.targetOf = options.targetOf || null;
        this.immediate = options.immediate || this.immediate || false;

        // update errors scope if the field scope was changed.
        if (!isNullOrUndefined(options.scope) && options.scope !== this.scope && isCallable(this.validator.update)) {
            this.validator.update(this.id, { scope: options.scope });
        }
        this.scope = !isNullOrUndefined(options.scope) ? options.scope
            : !isNullOrUndefined(this.scope) ? this.scope : null;
        this.name = (!isNullOrUndefined(options.name) ? String(options.name) : options.name) || this.name || null;
        this.rules = options.rules !== undefined ? normalizeRules(options.rules) : this.rules;
        this._bails = options.bails !== undefined ? options.bails : this._bails;
        this.model = options.model || this.model;
        this.listen = options.listen !== undefined ? options.listen : this.listen;
        this.classes = (options.classes || this.classes || false) && !this.componentInstance;
        this.classNames = isObject(options.classNames) ? merge$1(this.classNames, options.classNames) : this.classNames;
        this.getter = isCallable(options.getter) ? options.getter : this.getter;
        this._alias = options.alias || this._alias;
        this.events = (options.events) ? normalizeEvents(options.events) : this.events;
        this.delay = makeDelayObject(this.events, options.delay || this.delay, this._delay);
        this.updateDependencies();
        this.addActionListeners();

        if (!this.name && !this.targetOf) {
            warn('A field is missing a "name" or "data-vv-name" attribute');
        }

        // update required flag flags
        if (options.rules !== undefined) {
            this.flags.required = this.isRequired;
        }

        // validate if it was validated before and field was updated and there was a rules mutation.
        if (this.flags.validated && options.rules !== undefined && this.updated) {
            this.validator.validate(("#" + (this.id)));
        }

        this.updated = true;
        this.addValueListeners();

        // no need to continue.
        if (!this.el) {
            return;
        }
        this.updateClasses();
        this.updateAriaAttrs();
    };

    /**
     * Resets field flags and errors.
     */
    Field.prototype.reset = function reset() {
        var this$1 = this;

        if (this._cancellationToken) {
            this._cancellationToken.cancelled = true;
            delete this._cancellationToken;
        }

        var defaults = createFlags();
        Object.keys(this.flags).filter(function (flag) { return flag !== 'required'; }).forEach(function (flag) {
            this$1.flags[flag] = defaults[flag];
        });

        this.addValueListeners();
        this.addActionListeners();
        this.updateClasses();
        this.updateAriaAttrs();
        this.updateCustomValidity();
    };

    /**
     * Sets the flags and their negated counterparts, and updates the classes and re-adds action listeners.
     */
    Field.prototype.setFlags = function setFlags(flags) {
        var this$1 = this;

        var negated = {
            pristine: 'dirty',
            dirty: 'pristine',
            valid: 'invalid',
            invalid: 'valid',
            touched: 'untouched',
            untouched: 'touched'
        };

        Object.keys(flags).forEach(function (flag) {
            this$1.flags[flag] = flags[flag];
            // if it has a negation and was not specified, set it as well.
            if (negated[flag] && flags[negated[flag]] === undefined) {
                this$1.flags[negated[flag]] = !flags[flag];
            }
        });

        if (
            flags.untouched !== undefined ||
            flags.touched !== undefined ||
            flags.dirty !== undefined ||
            flags.pristine !== undefined
        ) {
            this.addActionListeners();
        }
        this.updateClasses();
        this.updateAriaAttrs();
        this.updateCustomValidity();
    };

    /**
     * Determines if the field requires references to target fields.
    */
    Field.prototype.updateDependencies = function updateDependencies() {
        var this$1 = this;

        // reset dependencies.
        this.dependencies.forEach(function (d) { return d.field.destroy(); });
        this.dependencies = [];

        // we get the selectors for each field.
        var fields = Object.keys(this.rules).reduce(function (prev, r) {
            if (RuleContainer.isTargetRule(r)) {
                prev.push({ selector: this$1.rules[r][0], name: r });
            }

            return prev;
        }, []);

        if (!fields.length || !this.vm || !this.vm.$el) { return; }

        // must be contained within the same component, so we use the vm root element constrain our dom search.
        fields.forEach(function (ref$1) {
            var selector = ref$1.selector;
            var name = ref$1.name;

            var ref = this$1.vm.$refs[selector];
            var el = Array.isArray(ref) ? ref[0] : ref;
            if (!el) {
                return;
            }

            var options = {
                vm: this$1.vm,
                classes: this$1.classes,
                classNames: this$1.classNames,
                delay: this$1.delay,
                scope: this$1.scope,
                events: this$1.events.join('|'),
                immediate: this$1.immediate,
                targetOf: this$1.id
            };

            // probably a component.
            if (isCallable(el.$watch)) {
                options.component = el;
                options.el = el.$el;
                options.getter = Resolver.resolveGetter(el.$el, el.$vnode);
            } else {
                options.el = el;
                options.getter = Resolver.resolveGetter(el, {});
            }

            this$1.dependencies.push({ name: name, field: new Field(options) });
        });
    };

    /**
     * Removes listeners.
     */
    Field.prototype.unwatch = function unwatch(tag) {
        if (tag === void 0) tag = null;

        if (!tag) {
            this.watchers.forEach(function (w) { return w.unwatch(); });
            this.watchers = [];
            return;
        }

        this.watchers.filter(function (w) { return tag.test(w.tag); }).forEach(function (w) { return w.unwatch(); });
        this.watchers = this.watchers.filter(function (w) { return !tag.test(w.tag); });
    };

    /**
     * Updates the element classes depending on each field flag status.
     */
    Field.prototype.updateClasses = function updateClasses() {
        var this$1 = this;

        if (!this.classes || this.isDisabled) { return; }
        var applyClasses = function (el) {
            toggleClass(el, this$1.classNames.dirty, this$1.flags.dirty);
            toggleClass(el, this$1.classNames.pristine, this$1.flags.pristine);
            toggleClass(el, this$1.classNames.touched, this$1.flags.touched);
            toggleClass(el, this$1.classNames.untouched, this$1.flags.untouched);
            // make sure we don't set any classes if the state is undetermined.
            if (!isNullOrUndefined(this$1.flags.valid) && this$1.flags.validated) {
                toggleClass(el, this$1.classNames.valid, this$1.flags.valid);
            }

            if (!isNullOrUndefined(this$1.flags.invalid) && this$1.flags.validated) {
                toggleClass(el, this$1.classNames.invalid, this$1.flags.invalid);
            }
        };

        if (!isCheckboxOrRadioInput(this.el)) {
            applyClasses(this.el);
            return;
        }

        var els = document.querySelectorAll(("input[name=\"" + (this.el.name) + "\"]"));
        toArray(els).forEach(applyClasses);
    };

    /**
     * Adds the listeners required for automatic classes and some flags.
     */
    Field.prototype.addActionListeners = function addActionListeners() {
        var this$1 = this;

        // remove previous listeners.
        this.unwatch(/class/);

        if (!this.el) { return; }

        var onBlur = function () {
            this$1.flags.touched = true;
            this$1.flags.untouched = false;
            if (this$1.classes) {
                toggleClass(this$1.el, this$1.classNames.touched, true);
                toggleClass(this$1.el, this$1.classNames.untouched, false);
            }

            // only needed once.
            this$1.unwatch(/^class_blur$/);
        };

        var inputEvent = isTextInput(this.el) ? 'input' : 'change';
        var onInput = function () {
            this$1.flags.dirty = true;
            this$1.flags.pristine = false;
            if (this$1.classes) {
                toggleClass(this$1.el, this$1.classNames.pristine, false);
                toggleClass(this$1.el, this$1.classNames.dirty, true);
            }

            // only needed once.
            this$1.unwatch(/^class_input$/);
        };

        if (this.componentInstance && isCallable(this.componentInstance.$once)) {
            this.componentInstance.$once('input', onInput);
            this.componentInstance.$once('blur', onBlur);
            this.watchers.push({
                tag: 'class_input',
                unwatch: function () {
                    this$1.componentInstance.$off('input', onInput);
                }
            });
            this.watchers.push({
                tag: 'class_blur',
                unwatch: function () {
                    this$1.componentInstance.$off('blur', onBlur);
                }
            });
            return;
        }

        if (!this.el) { return; }

        addEventListener(this.el, inputEvent, onInput);
        // Checkboxes and radio buttons on Mac don't emit blur naturally, so we listen on click instead.
        var blurEvent = isCheckboxOrRadioInput(this.el) ? 'change' : 'blur';
        addEventListener(this.el, blurEvent, onBlur);
        this.watchers.push({
            tag: 'class_input',
            unwatch: function () {
                this$1.el.removeEventListener(inputEvent, onInput);
            }
        });

        this.watchers.push({
            tag: 'class_blur',
            unwatch: function () {
                this$1.el.removeEventListener(blurEvent, onBlur);
            }
        });
    };

    Field.prototype.checkValueChanged = function checkValueChanged() {
        // handle some people initialize the value to null, since text inputs have empty string value.
        if (this.initialValue === null && this.value === '' && isTextInput(this.el)) {
            return false;
        }

        return this.value !== this.initialValue;
    };

    /**
     * Determines the suitable primary event to listen for.
     */
    Field.prototype._determineInputEvent = function _determineInputEvent() {
        // if its a custom component, use the customized model event or the input event.
        if (this.componentInstance) {
            return (this.componentInstance.$options.model && this.componentInstance.$options.model.event) || 'input';
        }

        if (this.model && this.model.lazy) {
            return 'change';
        }

        if (isTextInput(this.el)) {
            return 'input';
        }

        return 'change';
    };

    /**
     * Determines the list of events to listen to.
     */
    Field.prototype._determineEventList = function _determineEventList(defaultInputEvent) {
        var this$1 = this;

        // if no event is configured, or it is a component or a text input then respect the user choice.
        if (!this.events.length || this.componentInstance || isTextInput(this.el)) {
            return [].concat(this.events).map(function (evt) {
                if (evt === 'input' && this$1.model && this$1.model.lazy) {
                    return 'change';
                }

                return evt;
            });
        }

        // force suitable event for non-text type fields.
        return this.events.map(function (e) {
            if (e === 'input') {
                return defaultInputEvent;
            }

            return e;
        });
    };

    /**
     * Adds the listeners required for validation.
     */
    Field.prototype.addValueListeners = function addValueListeners() {
        var this$1 = this;

        this.unwatch(/^input_.+/);
        if (!this.listen || !this.el) { return; }

        var token = { cancelled: false };
        var fn = this.targetOf ? function () {
            this$1.flags.changed = this$1.checkValueChanged(); this$1.validator.validate(("#" + (this$1.targetOf)));
        } : function () {
            var args = [], len = arguments.length;
            while (len--) args[len] = arguments[len];

            // if its a DOM event, resolve the value, otherwise use the first parameter as the value.
            if (args.length === 0 || isEvent(args[0])) {
                args[0] = this$1.value;
            }

            this$1.flags.changed = this$1.checkValueChanged();
            this$1.validator.validate(("#" + (this$1.id)), args[0]);
        };

        var inputEvent = this._determineInputEvent();
        var events = this._determineEventList(inputEvent);

        // if there is a model and an on input validation is requested.
        if (this.model && includes(events, inputEvent)) {
            var ctx = null;
            var expression = this.model.expression;
            // if its watchable from the context vm.
            if (this.model.expression) {
                ctx = this.vm;
                expression = this.model.expression;
            }

            // watch it from the custom component vm instead.
            if (!expression && this.componentInstance && this.componentInstance.$options.model) {
                ctx = this.componentInstance;
                expression = this.componentInstance.$options.model.prop || 'value';
            }

            if (ctx && expression) {
                var debouncedFn = debounce(fn, this.delay[inputEvent], token);
                var unwatch = ctx.$watch(expression, function () {
                    var args = [], len = arguments.length;
                    while (len--) args[len] = arguments[len];

                    this$1.flags.pending = true;
                    this$1._cancellationToken = token;
                    debouncedFn.apply(void 0, args);
                });
                this.watchers.push({
                    tag: 'input_model',
                    unwatch: unwatch
                });

                // filter out input event as it is already handled by the watcher API.
                events = events.filter(function (e) { return e !== inputEvent; });
            }
        }

        // Add events.
        events.forEach(function (e) {
            var debouncedFn = debounce(fn, this$1.delay[e], false, token);
            var validate = function () {
                var args = [], len = arguments.length;
                while (len--) args[len] = arguments[len];

                this$1.flags.pending = true;
                this$1._cancellationToken = token;
                debouncedFn.apply(void 0, args);
            };

            this$1._addComponentEventListener(e, validate);
            this$1._addHTMLEventListener(e, validate);
        });
    };

    Field.prototype._addComponentEventListener = function _addComponentEventListener(evt, validate) {
        var this$1 = this;

        if (!this.componentInstance) { return; }

        this.componentInstance.$on(evt, validate);
        this.watchers.push({
            tag: 'input_vue',
            unwatch: function () {
                this$1.componentInstance.$off(evt, validate);
            }
        });
    };

    Field.prototype._addHTMLEventListener = function _addHTMLEventListener(evt, validate) {
        var this$1 = this;

        if (!this.el || this.componentInstance) { return; }

        // listen for the current element.
        var addListener = function (el) {
            addEventListener(el, evt, validate);
            this$1.watchers.push({
                tag: 'input_native',
                unwatch: function () {
                    el.removeEventListener(evt, validate);
                }
            });
        };

        addListener(this.el);
        if (!isCheckboxOrRadioInput(this.el)) {
            return;
        }

        var els = document.querySelectorAll(("input[name=\"" + (this.el.name) + "\"]"));
        toArray(els).forEach(function (el) {
            // skip if it is added by v-validate and is not the current element.
            if (el._veeValidateId && el !== this$1.el) {
                return;
            }

            addListener(el);
        });
    };

    /**
     * Updates aria attributes on the element.
     */
    Field.prototype.updateAriaAttrs = function updateAriaAttrs() {
        var this$1 = this;

        if (!this.aria || !this.el || !isCallable(this.el.setAttribute)) { return; }

        var applyAriaAttrs = function (el) {
            el.setAttribute('aria-required', this$1.isRequired ? 'true' : 'false');
            el.setAttribute('aria-invalid', this$1.flags.invalid ? 'true' : 'false');
        };

        if (!isCheckboxOrRadioInput(this.el)) {
            applyAriaAttrs(this.el);
            return;
        }

        var els = document.querySelectorAll(("input[name=\"" + (this.el.name) + "\"]"));
        toArray(els).forEach(applyAriaAttrs);
    };

    /**
     * Updates the custom validity for the field.
     */
    Field.prototype.updateCustomValidity = function updateCustomValidity() {
        if (!this.validity || !this.el || !isCallable(this.el.setCustomValidity) || !this.validator.errors) { return; }

        this.el.setCustomValidity(this.flags.valid ? '' : (this.validator.errors.firstById(this.id) || ''));
    };

    /**
     * Removes all listeners.
     */
    Field.prototype.destroy = function destroy() {
        // ignore the result of any ongoing validation.
        if (this._cancellationToken) {
            this._cancellationToken.cancelled = true;
        }

        this.unwatch();
        this.dependencies.forEach(function (d) { return d.field.destroy(); });
        this.dependencies = [];
    };

    Object.defineProperties(Field.prototype, prototypeAccessors$1);

    // 

    var FieldBag = function FieldBag(items) {
        if (items === void 0) items = [];

        this.items = items || [];
    };

    var prototypeAccessors$2 = { length: { configurable: true } };

    FieldBag.prototype[typeof Symbol === 'function' ? Symbol.iterator : '@@iterator'] = function () {
        var this$1 = this;

        var index = 0;
        return {
            next: function () {
                return { value: this$1.items[index++], done: index > this$1.items.length };
            }
        };
    };

    /**
     * Gets the current items length.
     */

    prototypeAccessors$2.length.get = function () {
        return this.items.length;
    };

    /**
     * Finds the first field that matches the provided matcher object.
     */
    FieldBag.prototype.find = function find$1(matcher) {
        return find(this.items, function (item) { return item.matches(matcher); });
    };

    /**
     * Filters the items down to the matched fields.
     */
    FieldBag.prototype.filter = function filter(matcher) {
        // multiple matchers to be tried.
        if (Array.isArray(matcher)) {
            return this.items.filter(function (item) { return matcher.some(function (m) { return item.matches(m); }); });
        }

        return this.items.filter(function (item) { return item.matches(matcher); });
    };

    /**
     * Maps the field items using the mapping function.
     */
    FieldBag.prototype.map = function map(mapper) {
        return this.items.map(mapper);
    };

    /**
     * Finds and removes the first field that matches the provided matcher object, returns the removed item.
     */
    FieldBag.prototype.remove = function remove(matcher) {
        var item = null;
        if (matcher instanceof Field) {
            item = matcher;
        } else {
            item = this.find(matcher);
        }

        if (!item) { return null; }

        var index = this.items.indexOf(item);
        this.items.splice(index, 1);

        return item;
    };

    /**
     * Adds a field item to the list.
     */
    FieldBag.prototype.push = function push(item) {
        if (!(item instanceof Field)) {
            throw createError('FieldBag only accepts instances of Field that has an id defined.');
        }

        if (!item.id) {
            throw createError('Field id must be defined.');
        }

        if (this.find({ id: item.id })) {
            throw createError(("Field with id " + (item.id) + " is already added."));
        }

        this.items.push(item);
    };

    Object.defineProperties(FieldBag.prototype, prototypeAccessors$2);

    var ScopedValidator = function ScopedValidator(base, vm) {
        this.id = vm._uid;
        this._base = base;
        this._paused = false;

        // create a mirror bag with limited component scope.
        this.errors = new ErrorBag(base.errors, this.id);
    };

    var prototypeAccessors$3 = { flags: { configurable: true }, rules: { configurable: true }, fields: { configurable: true }, dictionary: { configurable: true }, locale: { configurable: true } };

    prototypeAccessors$3.flags.get = function () {
        var this$1 = this;

        return this._base.fields.items.filter(function (f) { return f.vmId === this$1.id; }).reduce(function (acc, field) {
            if (field.scope) {
                if (!acc[("$" + (field.scope))]) {
                    acc[("$" + (field.scope))] = {};
                }

                acc[("$" + (field.scope))][field.name] = field.flags;
            }

            acc[field.name] = field.flags;

            return acc;
        }, {});
    };

    prototypeAccessors$3.rules.get = function () {
        return this._base.rules;
    };

    prototypeAccessors$3.fields.get = function () {
        return new FieldBag(this._base.fields.filter({ vmId: this.id }));
    };

    prototypeAccessors$3.dictionary.get = function () {
        return this._base.dictionary;
    };

    prototypeAccessors$3.locale.get = function () {
        return this._base.locale;
    };

    prototypeAccessors$3.locale.set = function (val) {
        this._base.locale = val;
    };

    ScopedValidator.prototype.localize = function localize() {
        var ref;

        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];
        return (ref = this._base).localize.apply(ref, args);
    };

    ScopedValidator.prototype.update = function update() {
        var ref;

        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];
        return (ref = this._base).update.apply(ref, args);
    };

    ScopedValidator.prototype.attach = function attach(opts) {
        var attachOpts = assign({}, opts, { vmId: this.id });

        return this._base.attach(attachOpts);
    };

    ScopedValidator.prototype.pause = function pause() {
        this._paused = true;
    };

    ScopedValidator.prototype.resume = function resume() {
        this._paused = false;
    };

    ScopedValidator.prototype.remove = function remove(ruleName) {
        return this._base.remove(ruleName);
    };

    ScopedValidator.prototype.detach = function detach() {
        var ref;

        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];
        return (ref = this._base).detach.apply(ref, args.concat([this.id]));
    };

    ScopedValidator.prototype.extend = function extend() {
        var ref;

        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];
        return (ref = this._base).extend.apply(ref, args);
    };

    ScopedValidator.prototype.validate = function validate(descriptor, value, opts) {
        if (opts === void 0) opts = {};

        if (this._paused) { return Promise.resolve(true); }

        return this._base.validate(descriptor, value, assign({}, { vmId: this.id }, opts || {}));
    };

    ScopedValidator.prototype.validateAll = function validateAll(values$$1, opts) {
        if (opts === void 0) opts = {};

        if (this._paused) { return Promise.resolve(true); }

        return this._base.validateAll(values$$1, assign({}, { vmId: this.id }, opts || {}));
    };

    ScopedValidator.prototype.validateScopes = function validateScopes(opts) {
        if (opts === void 0) opts = {};

        if (this._paused) { return Promise.resolve(true); }

        return this._base.validateScopes(assign({}, { vmId: this.id }, opts || {}));
    };

    ScopedValidator.prototype.destroy = function destroy() {
        delete this.id;
        delete this._base;
    };

    ScopedValidator.prototype.reset = function reset(matcher) {
        return this._base.reset(Object.assign({}, matcher || {}, { vmId: this.id }));
    };

    ScopedValidator.prototype.flag = function flag() {
        var ref;

        var args = [], len = arguments.length;
        while (len--) args[len] = arguments[len];
        return (ref = this._base).flag.apply(ref, args.concat([this.id]));
    };

    Object.defineProperties(ScopedValidator.prototype, prototypeAccessors$3);

    // 

    /**
     * Checks if a parent validator instance was requested.
     */
    var requestsValidator = function (injections) {
        if (isObject(injections) && injections.$validator) {
            return true;
        }

        return false;
    };

    var mixin = {
        provide: function provide() {
            if (this.$validator && !isBuiltInComponent(this.$vnode)) {
                return {
                    $validator: this.$validator
                };
            }

            return {};
        },
        beforeCreate: function beforeCreate() {
            // if built in do nothing.
            if (isBuiltInComponent(this.$vnode) || this.$options.$__veeInject === false) {
                return;
            }

            // if its a root instance set the config if it exists.
            if (!this.$parent) {
                pluginInstance.configure(this.$options.$_veeValidate || {});
            }

            var options = pluginInstance.resolveConfig(this);

            // if its a root instance, inject anyways, or if it requested a new instance.
            if (!this.$parent || (this.$options.$_veeValidate && /new/.test(this.$options.$_veeValidate.validator))) {
                this.$validator = new ScopedValidator(pluginInstance._validator, this);
            }

            var requested = requestsValidator(this.$options.inject);

            // if automatic injection is enabled and no instance was requested.
            if (!this.$validator && options.inject && !requested) {
                this.$validator = new ScopedValidator(pluginInstance._validator, this);
            }

            // don't inject errors or fieldBag as no validator was resolved.
            if (!requested && !this.$validator) {
                return;
            }

            // There is a validator but it isn't injected, mark as reactive.
            if (!requested && this.$validator) {
                var Vue = this.$options._base; // the vue constructor.
                Vue.util.defineReactive(this.$validator, 'errors', this.$validator.errors);
            }

            if (!this.$options.computed) {
                this.$options.computed = {};
            }

            this.$options.computed[options.errorBagName || 'errors'] = function errorBagGetter() {
                return this.$validator.errors;
            };
            this.$options.computed[options.fieldsBagName || 'fields'] = function fieldBagGetter() {
                return this.$validator.fields.items.reduce(function (acc, field) {
                    if (field.scope) {
                        if (!acc[("$" + (field.scope))]) {
                            acc[("$" + (field.scope))] = {};
                        }

                        acc[("$" + (field.scope))][field.name] = field.flags;

                        return acc;
                    }

                    acc[field.name] = field.flags;

                    return acc;
                }, {});
            };
        },
        beforeDestroy: function beforeDestroy() {
            if (this.$validator && this._uid === this.$validator.id) {
                this.$validator.errors.clear(); // remove errors generated by this component.
            }
        }
    };

    // 

    /**
     * Finds the requested field by id from the context object.
     */
    function findField(el, context) {
        if (!context || !context.$validator) {
            return null;
        }

        return context.$validator.fields.find({ id: el._veeValidateId });
    }
    var directive = {
        bind: function bind(el, binding, vnode) {
            var validator = vnode.context.$validator;
            if (!validator) {
                {
                    warn("No validator instance is present on vm, did you forget to inject '$validator'?");
                }

                return;
            }

            var fieldOptions = Resolver.generate(el, binding, vnode);
            validator.attach(fieldOptions);
        },
        inserted: function inserted(el, binding, vnode) {
            var field = findField(el, vnode.context);
            var scope = Resolver.resolveScope(el, binding, vnode);

            // skip if scope hasn't changed.
            if (!field || scope === field.scope) { return; }

            // only update scope.
            field.update({ scope: scope });

            // allows the field to re-evaluated once more in the update hook.
            field.updated = false;
        },
        update: function update(el, binding, vnode) {
            var field = findField(el, vnode.context);

            // make sure we don't do unneccasary work if no important change was done.
            if (!field || (field.updated && isEqual$1(binding.value, binding.oldValue))) { return; }
            var scope = Resolver.resolveScope(el, binding, vnode);
            var rules = Resolver.resolveRules(el, binding, vnode);

            field.update({
                scope: scope,
                rules: rules
            });
        },
        unbind: function unbind(el, binding, ref) {
            var context = ref.context;

            var field = findField(el, context);
            if (!field) { return; }

            context.$validator.detach(field);
        }
    };

    // 

    var Validator = function Validator(validations, options) {
        if (options === void 0) options = { fastExit: true };

        this.errors = new ErrorBag();
        this.fields = new FieldBag();
        this._createFields(validations);
        this.paused = false;
        this.fastExit = !isNullOrUndefined(options && options.fastExit) ? options.fastExit : true;
    };

    var prototypeAccessors$4 = { rules: { configurable: true }, dictionary: { configurable: true }, flags: { configurable: true }, locale: { configurable: true } };
    var staticAccessors$1 = { rules: { configurable: true }, dictionary: { configurable: true }, locale: { configurable: true } };

    staticAccessors$1.rules.get = function () {
        return RuleContainer.rules;
    };

    prototypeAccessors$4.rules.get = function () {
        return RuleContainer.rules;
    };

    prototypeAccessors$4.dictionary.get = function () {
        return VeeValidate$1.i18nDriver;
    };

    staticAccessors$1.dictionary.get = function () {
        return VeeValidate$1.i18nDriver;
    };

    prototypeAccessors$4.flags.get = function () {
        return this.fields.items.reduce(function (acc, field) {
            var obj;

            if (field.scope) {
                acc[("$" + (field.scope))] = (obj = {}, obj[field.name] = field.flags, obj);

                return acc;
            }

            acc[field.name] = field.flags;

            return acc;
        }, {});
    };

    /**
     * Getter for the current locale.
     */
    prototypeAccessors$4.locale.get = function () {
        return Validator.locale;
    };

    /**
     * Setter for the validator locale.
     */
    prototypeAccessors$4.locale.set = function (value) {
        Validator.locale = value;
    };

    staticAccessors$1.locale.get = function () {
        return VeeValidate$1.i18nDriver.locale;
    };

    /**
     * Setter for the validator locale.
     */
    staticAccessors$1.locale.set = function (value) {
        var hasChanged = value !== VeeValidate$1.i18nDriver.locale;
        VeeValidate$1.i18nDriver.locale = value;
        if (hasChanged && VeeValidate$1.instance && VeeValidate$1.instance._vm) {
            VeeValidate$1.instance._vm.$emit('localeChanged');
        }
    };

    /**
     * Static constructor.
     */
    Validator.create = function create(validations, options) {
        return new Validator(validations, options);
    };

    /**
     * Adds a custom validator to the list of validation rules.
     */
    Validator.extend = function extend(name, validator, options) {
        if (options === void 0) options = {};

        Validator._guardExtend(name, validator);
        Validator._merge(name, {
            validator: validator,
            paramNames: options && options.paramNames,
            options: assign({}, { hasTarget: false, immediate: true }, options || {})
        });
    };

    /**
     * Removes a rule from the list of validators.
     */
    Validator.remove = function remove(name) {
        RuleContainer.remove(name);
    };

    /**
     * Checks if the given rule name is a rule that targets other fields.
     */
    Validator.isTargetRule = function isTargetRule(name) {
        return RuleContainer.isTargetRule(name);
    };

    /**
     * Adds and sets the current locale for the validator.
     */
    Validator.prototype.localize = function localize(lang, dictionary) {
        Validator.localize(lang, dictionary);
    };

    /**
     * Adds and sets the current locale for the validator.
     */
    Validator.localize = function localize(lang, dictionary) {
        var obj;

        if (isObject(lang)) {
            VeeValidate$1.i18nDriver.merge(lang);
            return;
        }

        // merge the dictionary.
        if (dictionary) {
            var locale = lang || dictionary.name;
            dictionary = assign({}, dictionary);
            VeeValidate$1.i18nDriver.merge((obj = {}, obj[locale] = dictionary, obj));
        }

        if (lang) {
            // set the locale.
            Validator.locale = lang;
        }
    };

    /**
     * Registers a field to be validated.
     */
    Validator.prototype.attach = function attach(fieldOpts) {
        var this$1 = this;

        // fixes initial value detection with v-model and select elements.
        var value = fieldOpts.initialValue;
        var field = new Field(fieldOpts);
        this.fields.push(field);

        // validate the field initially
        if (field.immediate) {
            VeeValidate$1.instance._vm.$nextTick(function () { return this$1.validate(("#" + (field.id)), value || field.value, { vmId: fieldOpts.vmId }); });
        } else {
            this._validate(field, value || field.value, { initial: true }).then(function (result) {
                field.flags.valid = result.valid;
                field.flags.invalid = !result.valid;
            });
        }

        return field;
    };

    /**
     * Sets the flags on a field.
     */
    Validator.prototype.flag = function flag(name, flags, uid) {
        if (uid === void 0) uid = null;

        var field = this._resolveField(name, undefined, uid);
        if (!field || !flags) {
            return;
        }

        field.setFlags(flags);
    };

    /**
     * Removes a field from the validator.
     */
    Validator.prototype.detach = function detach(name, scope, uid) {
        var field = isCallable(name.destroy) ? name : this._resolveField(name, scope, uid);
        if (!field) { return; }

        field.destroy();
        this.errors.remove(field.name, field.scope, field.vmId);
        this.fields.remove(field);
    };

    /**
     * Adds a custom validator to the list of validation rules.
     */
    Validator.prototype.extend = function extend(name, validator, options) {
        if (options === void 0) options = {};

        Validator.extend(name, validator, options);
    };

    Validator.prototype.reset = function reset(matcher) {
        var this$1 = this;

        // two ticks
        return VeeValidate$1.instance._vm.$nextTick().then(function () {
            return VeeValidate$1.instance._vm.$nextTick();
        }).then(function () {
            this$1.fields.filter(matcher).forEach(function (field) {
                field.waitFor(null);
                field.reset(); // reset field flags.
                this$1.errors.remove(field.name, field.scope);
            });
        });
    };

    /**
     * Updates a field, updating both errors and flags.
     */
    Validator.prototype.update = function update(id, ref) {
        var scope = ref.scope;

        var field = this._resolveField(("#" + id));
        if (!field) { return; }

        // remove old scope.
        this.errors.update(id, { scope: scope });
    };

    /**
     * Removes a rule from the list of validators.
     */
    Validator.prototype.remove = function remove(name) {
        Validator.remove(name);
    };

    /**
     * Validates a value against a registered field validations.
     */
    Validator.prototype.validate = function validate(fieldDescriptor, value, ref) {
        var this$1 = this;
        if (ref === void 0) ref = {};
        var silent = ref.silent;
        var vmId = ref.vmId;

        if (this.paused) { return Promise.resolve(true); }

        // overload to validate all.
        if (isNullOrUndefined(fieldDescriptor)) {
            return this.validateScopes({ silent: silent, vmId: vmId });
        }

        // overload to validate scope-less fields.
        if (fieldDescriptor === '*') {
            return this.validateAll(undefined, { silent: silent, vmId: vmId });
        }

        // if scope validation was requested.
        if (/^(.+)\.\*$/.test(fieldDescriptor)) {
            var matched = fieldDescriptor.match(/^(.+)\.\*$/)[1];
            return this.validateAll(matched);
        }

        var field = this._resolveField(fieldDescriptor);
        if (!field) {
            return this._handleFieldNotFound(name);
        }

        if (!silent) { field.flags.pending = true; }
        if (value === undefined) {
            value = field.value;
        }

        var validationPromise = this._validate(field, value);
        field.waitFor(validationPromise);

        return validationPromise.then(function (result) {
            if (!silent && field.isWaitingFor(validationPromise)) {
                // allow next validation to mutate the state.
                field.waitFor(null);
                this$1._handleValidationResults([result], vmId);
            }

            return result.valid;
        });
    };

    /**
     * Pauses the validator.
     */
    Validator.prototype.pause = function pause() {
        this.paused = true;

        return this;
    };

    /**
     * Resumes the validator.
     */
    Validator.prototype.resume = function resume() {
        this.paused = false;

        return this;
    };

    /**
     * Validates each value against the corresponding field validations.
     */
    Validator.prototype.validateAll = function validateAll(values$$1, ref) {
        var this$1 = this;
        if (ref === void 0) ref = {};
        var silent = ref.silent;
        var vmId = ref.vmId;

        if (this.paused) { return Promise.resolve(true); }

        var matcher = null;
        var providedValues = false;

        if (typeof values$$1 === 'string') {
            matcher = { scope: values$$1, vmId: vmId };
        } else if (isObject(values$$1)) {
            matcher = Object.keys(values$$1).map(function (key) {
                return { name: key, vmId: vmId, scope: null };
            });
            providedValues = true;
        } else if (Array.isArray(values$$1)) {
            matcher = values$$1.map(function (key) {
                return { name: key, vmId: vmId };
            });
        } else {
            matcher = { scope: null, vmId: vmId };
        }

        return Promise.all(
            this.fields.filter(matcher).map(function (field) { return this$1._validate(field, providedValues ? values$$1[field.name] : field.value); })
        ).then(function (results) {
            if (!silent) {
                this$1._handleValidationResults(results, vmId);
            }

            return results.every(function (t) { return t.valid; });
        });
    };

    /**
     * Validates all scopes.
     */
    Validator.prototype.validateScopes = function validateScopes(ref) {
        var this$1 = this;
        if (ref === void 0) ref = {};
        var silent = ref.silent;
        var vmId = ref.vmId;

        if (this.paused) { return Promise.resolve(true); }

        return Promise.all(
            this.fields.filter({ vmId: vmId }).map(function (field) { return this$1._validate(field, field.value); })
        ).then(function (results) {
            if (!silent) {
                this$1._handleValidationResults(results, vmId);
            }

            return results.every(function (t) { return t.valid; });
        });
    };

    /**
     * Validates a value against the rules.
     */
    Validator.prototype.verify = function verify(value, rules, options) {
        if (options === void 0) options = {};

        var field = {
            name: (options && options.name) || '{field}',
            rules: normalizeRules(rules),
            bails: getPath('bails', options, true)
        };

        field.isRequired = field.rules.required;
        var targetRules = Object.keys(field.rules).filter(Validator.isTargetRule);
        if (targetRules.length && options && isObject(options.values)) {
            // patch the field params with the targets' values.
            targetRules.forEach(function (rule) {
                var ref = field.rules[rule];
                var first = ref[0];
                var rest = ref.slice(1);
                field.rules[rule] = [options.values[first]].concat(rest);
            });
        }

        return this._validate(field, value).then(function (result) {
            return { valid: result.valid, errors: result.errors.map(function (e) { return e.msg; }) };
        });
    };

    /**
     * Perform cleanup.
     */
    Validator.prototype.destroy = function destroy() {
        VeeValidate$1.instance._vm.$off('localeChanged');
    };

    /**
     * Creates the fields to be validated.
     */
    Validator.prototype._createFields = function _createFields(validations) {
        var this$1 = this;

        if (!validations) { return; }

        Object.keys(validations).forEach(function (field) {
            var options = assign({}, { name: field, rules: validations[field] });
            this$1.attach(options);
        });
    };

    /**
     * Date rules need the existence of a format, so date_format must be supplied.
     */
    Validator.prototype._getDateFormat = function _getDateFormat(validations) {
        var format = null;
        if (validations.date_format && Array.isArray(validations.date_format)) {
            format = validations.date_format[0];
        }

        return format || VeeValidate$1.i18nDriver.getDateFormat(this.locale);
    };

    /**
     * Formats an error message for field and a rule.
     */
    Validator.prototype._formatErrorMessage = function _formatErrorMessage(field, rule, data, targetName) {
        if (data === void 0) data = {};
        if (targetName === void 0) targetName = null;

        var name = this._getFieldDisplayName(field);
        var params = this._getLocalizedParams(rule, targetName);

        return VeeValidate$1.i18nDriver.getFieldMessage(this.locale, field.name, rule.name, [name, params, data]);
    };

    /**
     * We need to convert any object param to an array format since the locales do not handle params as objects yet.
     */
    Validator.prototype._convertParamObjectToArray = function _convertParamObjectToArray(obj, ruleName) {
        if (Array.isArray(obj)) {
            return obj;
        }

        var paramNames = RuleContainer.getParamNames(ruleName);
        if (!paramNames || !isObject(obj)) {
            return obj;
        }

        return paramNames.reduce(function (prev, paramName) {
            if (paramName in obj) {
                prev.push(obj[paramName]);
            }

            return prev;
        }, []);
    };

    /**
     * Translates the parameters passed to the rule (mainly for target fields).
     */
    Validator.prototype._getLocalizedParams = function _getLocalizedParams(rule, targetName) {
        if (targetName === void 0) targetName = null;

        var params = this._convertParamObjectToArray(rule.params, rule.name);
        if (rule.options.hasTarget && params && params[0]) {
            var localizedName = targetName || VeeValidate$1.i18nDriver.getAttribute(this.locale, params[0], params[0]);
            return [localizedName].concat(params.slice(1));
        }

        return params;
    };

    /**
     * Resolves an appropriate display name, first checking 'data-as' or the registered 'prettyName'
     */
    Validator.prototype._getFieldDisplayName = function _getFieldDisplayName(field) {
        return field.alias || VeeValidate$1.i18nDriver.getAttribute(this.locale, field.name, field.name);
    };

    /**
     * Converts an array of params to an object with named properties.
     * Only works if the rule is configured with a paramNames array.
     * Returns the same params if it cannot convert it.
     */
    Validator.prototype._convertParamArrayToObj = function _convertParamArrayToObj(params, ruleName) {
        var paramNames = RuleContainer.getParamNames(ruleName);
        if (!paramNames) {
            return params;
        }

        if (isObject(params)) {
            // check if the object is either a config object or a single parameter that is an object.
            var hasKeys = paramNames.some(function (name) { return Object.keys(params).indexOf(name) !== -1; });
            // if it has some of the keys, return it as is.
            if (hasKeys) {
                return params;
            }
            // otherwise wrap the object in an array.
            params = [params];
        }

        // Reduce the paramsNames to a param object.
        return params.reduce(function (prev, value, idx) {
            prev[paramNames[idx]] = value;

            return prev;
        }, {});
    };

    /**
     * Tests a single input value against a rule.
     */
    Validator.prototype._test = function _test(field, value, rule) {
        var this$1 = this;

        var validator = RuleContainer.getValidatorMethod(rule.name);
        var params = Array.isArray(rule.params) ? toArray(rule.params) : rule.params;
        if (!params) {
            params = [];
        }

        var targetName = null;
        if (!validator || typeof validator !== 'function') {
            return Promise.reject(createError(("No such validator '" + (rule.name) + "' exists.")));
        }

        // has field dependencies.
        if (rule.options.hasTarget && field.dependencies) {
            var target = find(field.dependencies, function (d) { return d.name === rule.name; });
            if (target) {
                targetName = target.field.alias;
                params = [target.field.value].concat(params.slice(1));
            }
        } else if (rule.name === 'required' && field.rejectsFalse) {
            // invalidate false if no args were specified and the field rejects false by default.
            params = params.length ? params : [true];
        }

        if (rule.options.isDate) {
            var dateFormat = this._getDateFormat(field.rules);
            if (rule.name !== 'date_format') {
                params.push(dateFormat);
            }
        }

        var result = validator(value, this._convertParamArrayToObj(params, rule.name));

        // If it is a promise.
        if (isCallable(result.then)) {
            return result.then(function (values$$1) {
                var allValid = true;
                var data = {};
                if (Array.isArray(values$$1)) {
                    allValid = values$$1.every(function (t) { return (isObject(t) ? t.valid : t); });
                } else { // Is a single object/boolean.
                    allValid = isObject(values$$1) ? values$$1.valid : values$$1;
                    data = values$$1.data;
                }

                return {
                    valid: allValid,
                    errors: allValid ? [] : [this$1._createFieldError(field, rule, data, targetName)]
                };
            });
        }

        if (!isObject(result)) {
            result = { valid: result, data: {} };
        }

        return {
            valid: result.valid,
            errors: result.valid ? [] : [this._createFieldError(field, rule, result.data, targetName)]
        };
    };

    /**
     * Merges a validator object into the RULES and Messages.
     */
    Validator._merge = function _merge(name, ref) {
        var validator = ref.validator;
        var options = ref.options;
        var paramNames = ref.paramNames;

        var validate = isCallable(validator) ? validator : validator.validate;
        if (validator.getMessage) {
            VeeValidate$1.i18nDriver.setMessage(Validator.locale, name, validator.getMessage);
        }

        RuleContainer.add(name, {
            validate: validate,
            options: options,
            paramNames: paramNames
        });
    };

    /**
     * Guards from extension violations.
     */
    Validator._guardExtend = function _guardExtend(name, validator) {
        if (isCallable(validator)) {
            return;
        }

        if (!isCallable(validator.validate)) {
            throw createError(
                ("Extension Error: The validator '" + name + "' must be a function or have a 'validate' method.")
            );
        }
    };

    /**
     * Creates a Field Error Object.
     */
    Validator.prototype._createFieldError = function _createFieldError(field, rule, data, targetName) {
        var this$1 = this;

        return {
            id: field.id,
            vmId: field.vmId,
            field: field.name,
            msg: this._formatErrorMessage(field, rule, data, targetName),
            rule: rule.name,
            scope: field.scope,
            regenerate: function () {
                return this$1._formatErrorMessage(field, rule, data, targetName);
            }
        };
    };

    /**
     * Tries different strategies to find a field.
     */
    Validator.prototype._resolveField = function _resolveField(name, scope, uid) {
        if (name[0] === '#') {
            return this.fields.find({ id: name.slice(1) });
        }

        if (!isNullOrUndefined(scope)) {
            return this.fields.find({ name: name, scope: scope, vmId: uid });
        }

        if (includes(name, '.')) {
            var ref = name.split('.');
            var fieldScope = ref[0];
            var fieldName = ref.slice(1);
            var field = this.fields.find({ name: fieldName.join('.'), scope: fieldScope, vmId: uid });
            if (field) {
                return field;
            }
        }

        return this.fields.find({ name: name, scope: null, vmId: uid });
    };

    /**
     * Handles when a field is not found.
     */
    Validator.prototype._handleFieldNotFound = function _handleFieldNotFound(name, scope) {
        var fullName = isNullOrUndefined(scope) ? name : ("" + (!isNullOrUndefined(scope) ? scope + '.' : '') + name);

        return Promise.reject(createError(
            ("Validating a non-existent field: \"" + fullName + "\". Use \"attach()\" first.")
        ));
    };

    /**
     * Handles validation results.
     */
    Validator.prototype._handleValidationResults = function _handleValidationResults(results, vmId) {
        var this$1 = this;

        var matchers = results.map(function (result) { return ({ id: result.id }); });
        this.errors.removeById(matchers.map(function (m) { return m.id; }));
        // remove by name and scope to remove any custom errors added.
        results.forEach(function (result) {
            this$1.errors.remove(result.field, result.scope, vmId);
        });
        var allErrors = results.reduce(function (prev, curr) {
            prev.push.apply(prev, curr.errors);

            return prev;
        }, []);

        this.errors.add(allErrors);

        // handle flags.
        this.fields.filter(matchers).forEach(function (field) {
            var result = find(results, function (r) { return r.id === field.id; });
            field.setFlags({
                pending: false,
                valid: result.valid,
                validated: true
            });
        });
    };

    Validator.prototype._shouldSkip = function _shouldSkip(field, value) {
        // field is configured to run through the pipeline regardless
        if (field.bails === false) {
            return false;
        }

        // disabled fields are skipped
        if (field.isDisabled) {
            return true;
        }

        // skip if the field is not required and has an empty value.
        return !field.isRequired && (isNullOrUndefined(value) || value === '' || isEmptyArray(value));
    };

    Validator.prototype._shouldBail = function _shouldBail(field) {
        // if the field was configured explicitly.
        if (field.bails !== undefined) {
            return field.bails;
        }

        return this.fastExit;
    };

    /**
     * Starts the validation process.
     */
    Validator.prototype._validate = function _validate(field, value, ref) {
        var this$1 = this;
        if (ref === void 0) ref = {};
        var initial = ref.initial;

        if (this._shouldSkip(field, value)) {
            return Promise.resolve({ valid: true, id: field.id, field: field.name, scope: field.scope, errors: [] });
        }

        var promises = [];
        var errors = [];
        var isExitEarly = false;
        // use of '.some()' is to break iteration in middle by returning true
        Object.keys(field.rules).filter(function (rule) {
            if (!initial || !RuleContainer.has(rule)) { return true; }

            return RuleContainer.isImmediate(rule);
        }).some(function (rule) {
            var ruleOptions = RuleContainer.getOptions(rule);
            var result = this$1._test(field, value, { name: rule, params: field.rules[rule], options: ruleOptions });
            if (isCallable(result.then)) {
                promises.push(result);
            } else if (!result.valid && this$1._shouldBail(field)) {
                errors.push.apply(errors, result.errors);
                isExitEarly = true;
            } else {
                // promisify the result.
                promises.push(new Promise(function (resolve) { return resolve(result); }));
            }

            return isExitEarly;
        });

        if (isExitEarly) {
            return Promise.resolve({ valid: false, errors: errors, id: field.id, field: field.name, scope: field.scope });
        }

        return Promise.all(promises).then(function (results) {
            return results.reduce(function (prev, v) {
                var ref;

                if (!v.valid) {
                    (ref = prev.errors).push.apply(ref, v.errors);
                }

                prev.valid = prev.valid && v.valid;

                return prev;
            }, { valid: true, errors: errors, id: field.id, field: field.name, scope: field.scope });
        });
    };

    Object.defineProperties(Validator.prototype, prototypeAccessors$4);
    Object.defineProperties(Validator, staticAccessors$1);

    // 

    var normalize = function (fields) {
        if (Array.isArray(fields)) {
            return fields.reduce(function (prev, curr) {
                if (includes(curr, '.')) {
                    prev[curr.split('.')[1]] = curr;
                } else {
                    prev[curr] = curr;
                }

                return prev;
            }, {});
        }

        return fields;
    };

    // Combines two flags using either AND or OR depending on the flag type.
    var combine = function (lhs, rhs) {
        var mapper = {
            pristine: function (lhs, rhs) { return lhs && rhs; },
            dirty: function (lhs, rhs) { return lhs || rhs; },
            touched: function (lhs, rhs) { return lhs || rhs; },
            untouched: function (lhs, rhs) { return lhs && rhs; },
            valid: function (lhs, rhs) { return lhs && rhs; },
            invalid: function (lhs, rhs) { return lhs || rhs; },
            pending: function (lhs, rhs) { return lhs || rhs; },
            required: function (lhs, rhs) { return lhs || rhs; },
            validated: function (lhs, rhs) { return lhs && rhs; }
        };

        return Object.keys(mapper).reduce(function (flags, flag) {
            flags[flag] = mapper[flag](lhs[flag], rhs[flag]);

            return flags;
        }, {});
    };

    var mapScope = function (scope, deep) {
        if (deep === void 0) deep = true;

        return Object.keys(scope).reduce(function (flags, field) {
            if (!flags) {
                flags = assign({}, scope[field]);
                return flags;
            }

            // scope.
            var isScope = field.indexOf('$') === 0;
            if (deep && isScope) {
                return combine(mapScope(scope[field]), flags);
            } else if (!deep && isScope) {
                return flags;
            }

            flags = combine(flags, scope[field]);

            return flags;
        }, null);
    };

    /**
     * Maps fields to computed functions.
     */
    var mapFields = function (fields) {
        if (!fields) {
            return function () {
                return mapScope(this.$validator.flags);
            };
        }

        var normalized = normalize(fields);
        return Object.keys(normalized).reduce(function (prev, curr) {
            var field = normalized[curr];
            prev[curr] = function mappedField() {
                // if field exists
                if (this.$validator.flags[field]) {
                    return this.$validator.flags[field];
                }

                // scopeless fields were selected.
                if (normalized[curr] === '*') {
                    return mapScope(this.$validator.flags, false);
                }

                // if it has a scope defined
                var index = field.indexOf('.');
                if (index <= 0) {
                    return {};
                }

                var ref = field.split('.');
                var scope = ref[0];
                var name = ref.slice(1);

                scope = this.$validator.flags[("$" + scope)];
                name = name.join('.');

                // an entire scope was selected: scope.*
                if (name === '*' && scope) {
                    return mapScope(scope);
                }

                if (scope && scope[name]) {
                    return scope[name];
                }

                return {};
            };

            return prev;
        }, {});
    };

    var $validator = null;

    function createValidationCtx(ctx) {
        return {
            errors: ctx.messages,
            flags: ctx.flags,
            classes: ctx.classes,
            valid: ctx.isValid,
            aria: {
                'aria-invalid': ctx.flags.invalid ? 'true' : 'false',
                'aria-required': ctx.isRequired ? 'true' : 'false'
            }
        };
    }

    function onRenderUpdate(model) {
        var this$1 = this;

        var validateNow = this.value !== model.value || this._needsValidation;
        var shouldRevalidate = this.flags.validated;
        if (!this.initialized) {
            this.initialValue = model.value;
        }

        if (validateNow) {
            var silentHandler = function (ref) {
                var valid = ref.valid;

                // initially assign the valid/invalid flags.
                this$1.setFlags({
                    valid: valid,
                    invalid: !valid
                });
            };

            this.value = model.value;
            this.validate().then(this.immediate || shouldRevalidate ? this.applyResult : silentHandler);
        }

        this._needsValidation = false;
    }

    // Creates the common handlers for a validatable context.
    function createCommonHandlers(ctx) {
        var onInput = function (e) {
            ctx.syncValue(e); // track and keep the value updated.
            ctx.setFlags({ dirty: true, pristine: false });
        };

        // Blur event listener.
        var onBlur = function () {
            ctx.setFlags({ touched: true, untouched: false });
        };

        var onValidate = debounce(
            function () {
                var pendingPromise = ctx.validate();
                // avoids race conditions between successive validations.
                ctx._waiting = pendingPromise;
                pendingPromise.then(function (result) {
                    if (pendingPromise === ctx._waiting) {
                        ctx.applyResult(result);
                        ctx._waiting = null;
                    }
                });
            },
            ctx.debounce
        );

        return { onInput: onInput, onBlur: onBlur, onValidate: onValidate };
    }

    // Adds all plugin listeners to the vnode.
    function addListeners(node) {
        var model = findModel(node);
        // cache the input eventName.
        this._inputEventName = this._inputEventName || getInputEventName(node, model);

        onRenderUpdate.call(this, model);

        var ref = createCommonHandlers(this);
        var onInput = ref.onInput;
        var onBlur = ref.onBlur;
        var onValidate = ref.onValidate;
        addVNodeListener(node, this._inputEventName, onInput);
        addVNodeListener(node, 'blur', onBlur);

        // add the validation listeners.
        this.normalizedEvents.forEach(function (evt) {
            addVNodeListener(node, evt, onValidate);
        });

        this.initialized = true;
    }

    function createValuesLookup(ctx) {
        var providers = ctx.$_veeObserver.refs;

        return ctx.fieldDeps.reduce(function (acc, depName) {
            if (!providers[depName]) {
                return acc;
            }

            acc[depName] = providers[depName].value;
            var watcherName = "$__" + depName;
            if (!isCallable(ctx[watcherName])) {
                ctx[watcherName] = providers[depName].$watch('value', function () {
                    ctx.validate(ctx.value).then(ctx.applyResult);
                    ctx[watcherName]();
                });
            }

            return acc;
        }, {});
    }

    function updateRenderingContextRefs(ctx) {
        var id = ctx.id;
        var vid = ctx.vid;

        // Nothing has changed.
        if (id === vid && ctx.$_veeObserver.refs[id]) {
            return;
        }

        // vid was changed.
        if (id !== vid && ctx.$_veeObserver.refs[id] === ctx) {
            ctx.$_veeObserver.$unsubscribe(ctx);
        }

        ctx.$_veeObserver.$subscribe(ctx);
        ctx.id = vid;
    }

    function createObserver() {
        return {
            refs: {},
            $subscribe: function $subscribe(ctx) {
                this.refs[ctx.vid] = ctx;
            },
            $unsubscribe: function $unsubscribe(ctx) {
                delete this.refs[ctx.vid];
            }
        };
    }

    var id$1 = 0;

    var ValidationProvider = {
        $__veeInject: false,
        inject: {
            $_veeObserver: {
                from: '$_veeObserver',
                default: function default$1() {
                    if (!this.$vnode.context.$_veeObserver) {
                        this.$vnode.context.$_veeObserver = createObserver();
                    }

                    return this.$vnode.context.$_veeObserver;
                }
            }
        },
        props: {
            vid: {
                type: [String, Number],
                default: function () {
                    id$1++;
                    return id$1;
                }
            },
            name: {
                type: String,
                default: null
            },
            events: {
                type: [Array, String],
                default: function () { return ['input']; }
            },
            rules: {
                type: [Object, String],
                default: null
            },
            immediate: {
                type: Boolean,
                default: false
            },
            bails: {
                type: Boolean,
                default: function () { return VeeValidate$1.config.fastExit; }
            },
            debounce: {
                type: Number,
                default: function () { return VeeValidate$1.config.delay || 0; }
            }
        },
        watch: {
            rules: {
                deep: true,
                handler: function handler() {
                    this._needsValidation = true;
                }
            }
        },
        data: function () {
            return ({
                messages: [],
                value: undefined,
                initialized: false,
                initialValue: undefined,
                flags: createFlags(),
                id: null
            });
        },
        methods: {
            setFlags: function setFlags(flags) {
                var this$1 = this;

                Object.keys(flags).forEach(function (flag) {
                    this$1.flags[flag] = flags[flag];
                });
            },
            syncValue: function syncValue(e) {
                var value = isEvent(e) ? e.target.value : e;

                this.value = value;
            },
            reset: function reset() {
                this.messages = [];
                this._waiting = null;
                this.initialValue = this.value;
                var flags = createFlags();
                flags.changed = false;
                this.setFlags(flags);
            },
            validate: function validate() {
                var this$1 = this;

                this.setFlags({ pending: true });

                return $validator.verify(this.value, this.rules, {
                    name: this.name,
                    values: createValuesLookup(this),
                    bails: this.bails
                }).then(function (result) {
                    this$1.setFlags({ pending: false });

                    return result;
                });
            },
            applyResult: function applyResult(ref) {
                var errors = ref.errors;

                this.messages = errors;
                this.setFlags({
                    valid: !errors.length,
                    changed: this.value !== this.initialValue,
                    invalid: !!errors.length,
                    validated: true
                });
            },
            registerField: function registerField() {
                if (!$validator) {
                    /* istanbul ignore next */
                    {
                        if (!VeeValidate$1.instance) {
                            warn('You must install vee-validate first before using this component.');
                        }
                    }

                    $validator = VeeValidate$1.instance._validator;
                }

                updateRenderingContextRefs(this);
            }
        },
        computed: {
            isValid: function isValid() {
                return this.flags.valid;
            },
            fieldDeps: function fieldDeps() {
                var rules = normalizeRules(this.rules);

                return Object.keys(rules).filter(RuleContainer.isTargetRule).map(function (rule) {
                    return rules[rule][0];
                });
            },
            normalizedEvents: function normalizedEvents() {
                var this$1 = this;

                return normalizeEvents(this.events).map(function (e) {
                    if (e === 'input') {
                        return this$1._inputEventName;
                    }

                    return e;
                });
            },
            isRequired: function isRequired() {
                var rules = normalizeRules(this.rules);

                return !!rules.required;
            },
            classes: function classes() {
                var this$1 = this;

                var names = VeeValidate$1.config.classNames;
                return Object.keys(this.flags).reduce(function (classes, flag) {
                    var className = (names && names[flag]) || flag;
                    if (className) {
                        classes[className] = this$1.flags[flag];
                    }

                    return classes;
                }, {});
            }
        },
        render: function render(h) {
            var this$1 = this;

            this.registerField();
            var ctx = createValidationCtx(this);

            // Gracefully handle non-existent scoped slots.
            var slot = this.$scopedSlots.default;
            if (!isCallable(slot)) {
                {
                    warn('ValidationProvider expects a scoped slot. Did you forget to add "slot-scope" to your slot?');
                }

                return createRenderless(h, this.$slots.default);
            }

            var nodes = slot(ctx);
            // Handle single-root slot.
            extractVNodes(nodes).forEach(function (input) {
                addListeners.call(this$1, input);
            });

            return createRenderless(h, nodes);
        },
        beforeDestroy: function beforeDestroy() {
            // cleanup reference.
            this.$_veeObserver.$unsubscribe(this);
        }
    };

    var flagMergingStrategy = {
        pristine: 'every',
        dirty: 'some',
        touched: 'some',
        untouched: 'every',
        valid: 'every',
        invalid: 'some',
        pending: 'some',
        validated: 'every'
    };

    function mergeFlags(lhs, rhs, strategy) {
        var stratName = flagMergingStrategy[strategy];

        return [lhs, rhs][stratName](function (f) { return f; });
    }

    var ValidationObserver = {
        name: 'ValidationObserver',
        provide: function provide() {
            return {
                $_veeObserver: this
            };
        },
        data: function () {
            return ({
                refs: {}
            });
        },
        methods: {
            $subscribe: function $subscribe(provider) {
                var obj;

                this.refs = Object.assign({}, this.refs, (obj = {}, obj[provider.vid] = provider, obj));
            },
            $unsubscribe: function $unsubscribe(ref) {
                var vid = ref.vid;

                delete this.refs[vid];
                this.refs = Object.assign({}, this.refs);
            },
            validate: function validate() {
                return Promise.all(values(this.refs).map(function (ref) {
                    return ref.validate().then(function (result) {
                        ref.applyResult(result);

                        return result;
                    });
                })).then(function (results) { return results.every(function (r) { return r.valid; }); });
            },
            reset: function reset() {
                return values(this.refs).forEach(function (ref) {
                    ref.reset();
                });
            }
        },
        computed: {
            ctx: function ctx() {
                return values(this.refs).reduce(function (acc, provider) {
                    Object.keys(flagMergingStrategy).forEach(function (flag) {
                        if (!(flag in acc)) {
                            acc[flag] = provider.flags[flag];
                            return;
                        }

                        acc[flag] = mergeFlags(acc[flag], provider.flags[flag], flag);
                    });

                    acc.errors[provider.vid] = provider.messages;

                    return acc;
                }, { errors: {} });
            }
        },
        render: function render(h) {
            var slots = this.$scopedSlots.default;
            if (!isCallable(slots)) {
                {
                    warn('ValidationObserver expects a scoped slot. Did you forget to add "slot-scope" to your slot?');
                }

                return createRenderless(h, this.$slots.default);
            }

            return createRenderless(h, slots(this.ctx));
        }
    };

    function withValidation(component, ctxToProps) {
        if (ctxToProps === void 0) ctxToProps = null;

        var options = isCallable(component) ? component.options : component;
        options.$__veeInject = false;
        var hoc = {
            name: ((options.name || 'AnonymousHoc') + "WithValidation"),
            props: assign({}, ValidationProvider.props),
            data: ValidationProvider.data,
            computed: assign({}, ValidationProvider.computed),
            methods: assign({}, ValidationProvider.methods),
            $__veeInject: false,
            beforeDestroy: ValidationProvider.beforeDestroy,
            inject: ValidationProvider.inject
        };

        // Default ctx converts ctx props to component props.
        if (!ctxToProps) {
            ctxToProps = function (ctx) { return ctx; };
        }

        var eventName = (options.model && options.model.event) || 'input';

        hoc.render = function (h) {
            var obj;

            this.registerField();
            var vctx = createValidationCtx(this);
            var listeners = assign({}, this.$listeners);

            var model = findModel(this.$vnode);
            this._inputEventName = this._inputEventName || getInputEventName(this.$vnode, model);
            onRenderUpdate.call(this, model);

            var ref = createCommonHandlers(this);
            var onInput = ref.onInput;
            var onBlur = ref.onBlur;
            var onValidate = ref.onValidate;

            mergeVNodeListeners(listeners, eventName, onInput);
            mergeVNodeListeners(listeners, 'blur', onBlur);
            this.normalizedEvents.forEach(function (evt, idx) {
                mergeVNodeListeners(listeners, evt, onValidate);
            });

            // Props are any attrs not associated with ValidationProvider Plus the model prop.
            // WARNING: Accidental prop overwrite will probably happen.
            var ref$1 = findModelConfig(this.$vnode) || { prop: 'value' };
            var prop = ref$1.prop;
            var props = assign({}, this.$attrs, (obj = {}, obj[prop] = model.value, obj), ctxToProps(vctx));

            return h(options, {
                attrs: this.$attrs,
                props: props,
                on: listeners
            }, normalizeSlots(this.$slots, this.$vnode.context));
        };

        return hoc;
    }

    // 

    var normalizeValue = function (value) {
        if (isObject(value)) {
            return Object.keys(value).reduce(function (prev, key) {
                prev[key] = normalizeValue(value[key]);

                return prev;
            }, {});
        }

        if (isCallable(value)) {
            return value('{0}', ['{1}', '{2}', '{3}']);
        }

        return value;
    };

    var normalizeFormat = function (locale) {
        // normalize messages
        var dictionary = {};
        if (locale.messages) {
            dictionary.messages = normalizeValue(locale.messages);
        }

        if (locale.custom) {
            dictionary.custom = normalizeValue(locale.custom);
        }

        if (locale.attributes) {
            dictionary.attributes = locale.attributes;
        }

        if (!isNullOrUndefined(locale.dateFormat)) {
            dictionary.dateFormat = locale.dateFormat;
        }

        return dictionary;
    };

    var I18nDictionary = function I18nDictionary(i18n, rootKey) {
        this.i18n = i18n;
        this.rootKey = rootKey;
    };

    var prototypeAccessors$5 = { locale: { configurable: true } };

    prototypeAccessors$5.locale.get = function () {
        return this.i18n.locale;
    };

    prototypeAccessors$5.locale.set = function (value) {
        warn('Cannot set locale from the validator when using vue-i18n, use i18n.locale setter instead');
    };

    I18nDictionary.prototype.getDateFormat = function getDateFormat(locale) {
        return this.i18n.getDateTimeFormat(locale || this.locale);
    };

    I18nDictionary.prototype.setDateFormat = function setDateFormat(locale, value) {
        this.i18n.setDateTimeFormat(locale || this.locale, value);
    };

    I18nDictionary.prototype.getMessage = function getMessage(_, key, data) {
        var path = (this.rootKey) + ".messages." + key;
        var result = this.i18n.t(path, data);
        if (result !== path) {
            return result;
        }

        return this.i18n.t(((this.rootKey) + ".messages._default"), data);
    };

    I18nDictionary.prototype.getAttribute = function getAttribute(_, key, fallback) {
        if (fallback === void 0) fallback = '';

        var path = (this.rootKey) + ".attributes." + key;
        var result = this.i18n.t(path);
        if (result !== path) {
            return result;
        }

        return fallback;
    };

    I18nDictionary.prototype.getFieldMessage = function getFieldMessage(_, field, key, data) {
        var path = (this.rootKey) + ".custom." + field + "." + key;
        var result = this.i18n.t(path, data);
        if (result !== path) {
            return result;
        }

        return this.getMessage(_, key, data);
    };

    I18nDictionary.prototype.merge = function merge$1$$1(dictionary) {
        var this$1 = this;

        Object.keys(dictionary).forEach(function (localeKey) {
            var obj;

            // i18n doesn't deep merge
            // first clone the existing locale (avoid mutations to locale)
            var clone = merge$1({}, getPath((localeKey + "." + (this$1.rootKey)), this$1.i18n.messages, {}));
            // Merge cloned locale with new one
            var locale = merge$1(clone, normalizeFormat(dictionary[localeKey]));
            this$1.i18n.mergeLocaleMessage(localeKey, (obj = {}, obj[this$1.rootKey] = locale, obj));
            if (locale.dateFormat) {
                this$1.i18n.setDateTimeFormat(localeKey, locale.dateFormat);
            }
        });
    };

    I18nDictionary.prototype.setMessage = function setMessage(locale, key, value) {
        var obj, obj$1;

        this.merge((obj$1 = {}, obj$1[locale] = {
            messages: (obj = {}, obj[key] = value, obj)
        }, obj$1));
    };

    I18nDictionary.prototype.setAttribute = function setAttribute(locale, key, value) {
        var obj, obj$1;

        this.merge((obj$1 = {}, obj$1[locale] = {
            attributes: (obj = {}, obj[key] = value, obj)
        }, obj$1));
    };

    Object.defineProperties(I18nDictionary.prototype, prototypeAccessors$5);

    // 

    var defaultConfig = {
        locale: 'en',
        delay: 0,
        errorBagName: 'errors',
        dictionary: null,
        fieldsBagName: 'fields',
        classes: false,
        classNames: null,
        events: 'input',
        inject: true,
        fastExit: true,
        aria: true,
        validity: false,
        i18n: null,
        i18nRootKey: 'validation'
    };

    var Vue;
    var pendingPlugins;
    var currentConfig = assign({}, defaultConfig);
    var pluginInstance;

    var VeeValidate$1 = function VeeValidate(config, _Vue) {
        this.configure(config);
        pluginInstance = this;
        if (_Vue) {
            Vue = _Vue;
        }
        this._validator = new Validator(null, { fastExit: config && config.fastExit });
        this._initVM(this.config);
        this._initI18n(this.config);
    };

    var prototypeAccessors$6 = { i18nDriver: { configurable: true }, config: { configurable: true } };
    var staticAccessors$2 = { instance: { configurable: true }, i18nDriver: { configurable: true }, config: { configurable: true } };

    VeeValidate$1.setI18nDriver = function setI18nDriver(driver, instance) {
        DictionaryResolver.setDriver(driver, instance);
    };

    VeeValidate$1.configure = function configure(cfg) {
        currentConfig = assign({}, currentConfig, cfg);
    };

    VeeValidate$1.use = function use(plugin, options) {
        if (options === void 0) options = {};

        if (!isCallable(plugin)) {
            return warn('The plugin must be a callable function');
        }

        // Don't install plugins until vee-validate is installed.
        if (!pluginInstance) {
            if (!pendingPlugins) {
                pendingPlugins = [];
            }
            pendingPlugins.push({ plugin: plugin, options: options });
            return;
        }

        plugin({ Validator: Validator, ErrorBag: ErrorBag, Rules: Validator.rules }, options);
    };
    VeeValidate$1.install = function install(_Vue, opts) {
        if (Vue && _Vue === Vue) {
            {
                warn('already installed, Vue.use(VeeValidate) should only be called once.');
            }
            return;
        }

        Vue = _Vue;
        pluginInstance = new VeeValidate$1(opts);

        detectPassiveSupport();

        Vue.mixin(mixin);
        Vue.directive('validate', directive);
        if (pendingPlugins) {
            pendingPlugins.forEach(function (ref) {
                var plugin = ref.plugin;
                var options = ref.options;

                VeeValidate$1.use(plugin, options);
            });
            pendingPlugins = null;
        }
    };

    staticAccessors$2.instance.get = function () {
        return pluginInstance;
    };

    prototypeAccessors$6.i18nDriver.get = function () {
        return DictionaryResolver.getDriver();
    };

    staticAccessors$2.i18nDriver.get = function () {
        return DictionaryResolver.getDriver();
    };

    prototypeAccessors$6.config.get = function () {
        return currentConfig;
    };

    staticAccessors$2.config.get = function () {
        return currentConfig;
    };

    VeeValidate$1.prototype._initVM = function _initVM(config) {
        var this$1 = this;

        this._vm = new Vue({
            data: function () {
                return ({
                    errors: this$1._validator.errors,
                    fields: this$1._validator.fields
                });
            }
        });
    };

    VeeValidate$1.prototype._initI18n = function _initI18n(config) {
        var this$1 = this;

        var dictionary = config.dictionary;
        var i18n = config.i18n;
        var i18nRootKey = config.i18nRootKey;
        var locale = config.locale;
        var onLocaleChanged = function () {
            this$1._validator.errors.regenerate();
        };

        // i18 is being used for localization.
        if (i18n) {
            VeeValidate$1.setI18nDriver('i18n', new I18nDictionary(i18n, i18nRootKey));
            i18n._vm.$watch('locale', onLocaleChanged);
        } else if (typeof window !== 'undefined') {
            this._vm.$on('localeChanged', onLocaleChanged);
        }

        if (dictionary) {
            this.i18nDriver.merge(dictionary);
        }

        if (locale && !i18n) {
            this._validator.localize(locale);
        }
    };

    VeeValidate$1.prototype.configure = function configure(cfg) {
        VeeValidate$1.configure(cfg);
    };

    VeeValidate$1.prototype.resolveConfig = function resolveConfig(ctx) {
        var selfConfig = getPath('$options.$_veeValidate', ctx, {});

        return assign({}, this.config, selfConfig);
    };

    Object.defineProperties(VeeValidate$1.prototype, prototypeAccessors$6);
    Object.defineProperties(VeeValidate$1, staticAccessors$2);

    VeeValidate$1.version = '2.1.3';
    VeeValidate$1.mixin = mixin;
    VeeValidate$1.directive = directive;
    VeeValidate$1.Validator = Validator;
    VeeValidate$1.ErrorBag = ErrorBag;
    VeeValidate$1.mapFields = mapFields;
    VeeValidate$1.ValidationProvider = ValidationProvider;
    VeeValidate$1.ValidationObserver = ValidationObserver;
    VeeValidate$1.withValidation = withValidation;

    /**
     * Formates file size.
     *
     * @param {Number|String} size
     */
    var formatFileSize = function (size) {
        var units = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var threshold = 1024;
        size = Number(size) * threshold;
        var i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(threshold));
        return (((size / Math.pow(threshold, i)).toFixed(2) * 1) + " " + (units[i]));
    };

    /**
     * Checks if vee-validate is defined globally.
     */
    var isDefinedGlobally = function () {
        return typeof VeeValidate !== 'undefined';
    };

    var obj;

    var messages = {
        _default: function (field) { return ("The " + field + " value is not valid."); },
        after: function (field, ref) {
            var target = ref[0];
            var inclusion = ref[1];

            return ("The " + field + " must be after " + (inclusion ? 'or equal to ' : '') + target + ".");
        },
        alpha: function (field) { return ("The " + field + " field may only contain alphabetic characters."); },
        alpha_dash: function (field) { return ("The " + field + " field may contain alpha-numeric characters as well as dashes and underscores."); },
        alpha_num: function (field) { return ("The " + field + " field may only contain alpha-numeric characters."); },
        alpha_spaces: function (field) { return ("The " + field + " field may only contain alphabetic characters as well as spaces."); },
        before: function (field, ref) {
            var target = ref[0];
            var inclusion = ref[1];

            return ("The " + field + " must be before " + (inclusion ? 'or equal to ' : '') + target + ".");
        },
        between: function (field, ref) {
            var min = ref[0];
            var max = ref[1];

            return ("The " + field + " field must be between " + min + " and " + max + ".");
        },
        confirmed: function (field) { return ("The " + field + " confirmation does not match."); },
        credit_card: function (field) { return ("The " + field + " field is invalid."); },
        date_between: function (field, ref) {
            var min = ref[0];
            var max = ref[1];

            return ("The " + field + " must be between " + min + " and " + max + ".");
        },
        date_format: function (field, ref) {
            var format = ref[0];

            return ("The " + field + " must be in the format " + format + ".");
        },
        decimal: function (field, ref) {
            if (ref === void 0) ref = [];
            var decimals = ref[0]; if (decimals === void 0) decimals = '*';

            return ("The " + field + " field must be numeric and may contain " + (!decimals || decimals === '*' ? '' : decimals) + " decimal points.");
        },
        digits: function (field, ref) {
            var length = ref[0];

            return ("The " + field + " field must be numeric and exactly contain " + length + " digits.");
        },
        dimensions: function (field, ref) {
            var width = ref[0];
            var height = ref[1];

            return ("The " + field + " field must be " + width + " pixels by " + height + " pixels.");
        },
        email: function (field) { return ("The " + field + " field must be a valid email."); },
        excluded: function (field) { return ("The " + field + " field must be a valid value."); },
        ext: function (field) { return ("The " + field + " field must be a valid file."); },
        image: function (field) { return ("The " + field + " field must be an image."); },
        included: function (field) { return ("The " + field + " field must be a valid value."); },
        integer: function (field) { return ("The " + field + " field must be an integer."); },
        ip: function (field) { return ("The " + field + " field must be a valid ip address."); },
        length: function (field, ref) {
            var length = ref[0];
            var max = ref[1];

            if (max) {
                return ("The " + field + " length must be between " + length + " and " + max + ".");
            }

            return ("The " + field + " length must be " + length + ".");
        },
        max: function (field, ref) {
            var length = ref[0];

            return ("The " + field + " field may not be greater than " + length + " characters.");
        },
        max_value: function (field, ref) {
            var max = ref[0];

            return ("The " + field + " field must be " + max + " or less.");
        },
        mimes: function (field) { return ("The " + field + " field must have a valid file type."); },
        min: function (field, ref) {
            var length = ref[0];

            return ("The " + field + " field must be at least " + length + " characters.");
        },
        min_value: function (field, ref) {
            var min = ref[0];

            return ("The " + field + " field must be " + min + " or more.");
        },
        numeric: function (field) { return ("The " + field + " field may only contain numeric characters."); },
        regex: function (field) { return ("The " + field + " field format is invalid."); },
        required: function (field) { return ("The " + field + " field is required."); },
        size: function (field, ref) {
            var size = ref[0];

            return ("The " + field + " size must be less than " + (formatFileSize(size)) + ".");
        },
        url: function (field) { return ("The " + field + " field is not a valid URL."); }
    };

    var locale$1 = {
        name: 'en',
        messages: messages,
        attributes: {}
    };

    if (isDefinedGlobally()) {
        // eslint-disable-next-line
        VeeValidate.Validator.localize((obj = {}, obj[locale$1.name] = locale$1, obj));
    }

    // rules plugin definition.

    Object.keys(Rules).forEach(function (rule) {
        VeeValidate$1.Validator.extend(rule, Rules[rule].validate, assign({}, Rules[rule].options, { paramNames: Rules[rule].paramNames }));
    });

    // Merge the english messages.
    VeeValidate$1.Validator.localize({
        en: locale$1
    });

    VeeValidate$1.Rules = Rules;

    return VeeValidate$1;

})));
/* axios v0.16.2 | (c) 2017 by Matt Zabriskie */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.axios=t():e.axios=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){e.exports=n(1)},function(e,t,n){"use strict";function r(e){var t=new s(e),n=i(s.prototype.request,t);return o.extend(n,s.prototype,t),o.extend(n,t),n}var o=n(2),i=n(3),s=n(5),u=n(6),a=r(u);a.Axios=s,a.create=function(e){return r(o.merge(u,e))},a.Cancel=n(23),a.CancelToken=n(24),a.isCancel=n(20),a.all=function(e){return Promise.all(e)},a.spread=n(25),e.exports=a,e.exports.default=a},function(e,t,n){"use strict";function r(e){return"[object Array]"===R.call(e)}function o(e){return"[object ArrayBuffer]"===R.call(e)}function i(e){return"undefined"!=typeof FormData&&e instanceof FormData}function s(e){var t;return t="undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&e.buffer instanceof ArrayBuffer}function u(e){return"string"==typeof e}function a(e){return"number"==typeof e}function c(e){return"undefined"==typeof e}function f(e){return null!==e&&"object"==typeof e}function p(e){return"[object Date]"===R.call(e)}function d(e){return"[object File]"===R.call(e)}function l(e){return"[object Blob]"===R.call(e)}function h(e){return"[object Function]"===R.call(e)}function m(e){return f(e)&&h(e.pipe)}function y(e){return"undefined"!=typeof URLSearchParams&&e instanceof URLSearchParams}function w(e){return e.replace(/^\s*/,"").replace(/\s*$/,"")}function v(){return("undefined"==typeof navigator||"ReactNative"!==navigator.product)&&("undefined"!=typeof window&&"undefined"!=typeof document)}function g(e,t){if(null!==e&&"undefined"!=typeof e)if("object"==typeof e||r(e)||(e=[e]),r(e))for(var n=0,o=e.length;n<o;n++)t.call(null,e[n],n,e);else for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.call(null,e[i],i,e)}function x(){function e(e,n){"object"==typeof t[n]&&"object"==typeof e?t[n]=x(t[n],e):t[n]=e}for(var t={},n=0,r=arguments.length;n<r;n++)g(arguments[n],e);return t}function b(e,t,n){return g(t,function(t,r){n&&"function"==typeof t?e[r]=E(t,n):e[r]=t}),e}var E=n(3),C=n(4),R=Object.prototype.toString;e.exports={isArray:r,isArrayBuffer:o,isBuffer:C,isFormData:i,isArrayBufferView:s,isString:u,isNumber:a,isObject:f,isUndefined:c,isDate:p,isFile:d,isBlob:l,isFunction:h,isStream:m,isURLSearchParams:y,isStandardBrowserEnv:v,forEach:g,merge:x,extend:b,trim:w}},function(e,t){"use strict";e.exports=function(e,t){return function(){for(var n=new Array(arguments.length),r=0;r<n.length;r++)n[r]=arguments[r];return e.apply(t,n)}}},function(e,t){function n(e){return!!e.constructor&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)}function r(e){return"function"==typeof e.readFloatLE&&"function"==typeof e.slice&&n(e.slice(0,0))}/*!
	 * Determine if an object is a Buffer
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
e.exports=function(e){return null!=e&&(n(e)||r(e)||!!e._isBuffer)}},function(e,t,n){"use strict";function r(e){this.defaults=e,this.interceptors={request:new s,response:new s}}var o=n(6),i=n(2),s=n(17),u=n(18),a=n(21),c=n(22);r.prototype.request=function(e){"string"==typeof e&&(e=i.merge({url:arguments[0]},arguments[1])),e=i.merge(o,this.defaults,{method:"get"},e),e.method=e.method.toLowerCase(),e.baseURL&&!a(e.url)&&(e.url=c(e.baseURL,e.url));var t=[u,void 0],n=Promise.resolve(e);for(this.interceptors.request.forEach(function(e){t.unshift(e.fulfilled,e.rejected)}),this.interceptors.response.forEach(function(e){t.push(e.fulfilled,e.rejected)});t.length;)n=n.then(t.shift(),t.shift());return n},i.forEach(["delete","get","head","options"],function(e){r.prototype[e]=function(t,n){return this.request(i.merge(n||{},{method:e,url:t}))}}),i.forEach(["post","put","patch"],function(e){r.prototype[e]=function(t,n,r){return this.request(i.merge(r||{},{method:e,url:t,data:n}))}}),e.exports=r},function(e,t,n){"use strict";function r(e,t){!i.isUndefined(e)&&i.isUndefined(e["Content-Type"])&&(e["Content-Type"]=t)}function o(){var e;return"undefined"!=typeof XMLHttpRequest?e=n(8):"undefined"!=typeof process&&(e=n(8)),e}var i=n(2),s=n(7),u={"Content-Type":"application/x-www-form-urlencoded"},a={adapter:o(),transformRequest:[function(e,t){return s(t,"Content-Type"),i.isFormData(e)||i.isArrayBuffer(e)||i.isBuffer(e)||i.isStream(e)||i.isFile(e)||i.isBlob(e)?e:i.isArrayBufferView(e)?e.buffer:i.isURLSearchParams(e)?(r(t,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):i.isObject(e)?(r(t,"application/json;charset=utf-8"),JSON.stringify(e)):e}],transformResponse:[function(e){if("string"==typeof e)try{e=JSON.parse(e)}catch(e){}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,validateStatus:function(e){return e>=200&&e<300}};a.headers={common:{Accept:"application/json, text/plain, */*"}},i.forEach(["delete","get","head"],function(e){a.headers[e]={}}),i.forEach(["post","put","patch"],function(e){a.headers[e]=i.merge(u)}),e.exports=a},function(e,t,n){"use strict";var r=n(2);e.exports=function(e,t){r.forEach(e,function(n,r){r!==t&&r.toUpperCase()===t.toUpperCase()&&(e[t]=n,delete e[r])})}},function(e,t,n){"use strict";var r=n(2),o=n(9),i=n(12),s=n(13),u=n(14),a=n(10),c="undefined"!=typeof window&&window.btoa&&window.btoa.bind(window)||n(15);e.exports=function(e){return new Promise(function(t,f){var p=e.data,d=e.headers;r.isFormData(p)&&delete d["Content-Type"];var l=new XMLHttpRequest,h="onreadystatechange",m=!1;if("undefined"==typeof window||!window.XDomainRequest||"withCredentials"in l||u(e.url)||(l=new window.XDomainRequest,h="onload",m=!0,l.onprogress=function(){},l.ontimeout=function(){}),e.auth){var y=e.auth.username||"",w=e.auth.password||"";d.Authorization="Basic "+c(y+":"+w)}if(l.open(e.method.toUpperCase(),i(e.url,e.params,e.paramsSerializer),!0),l.timeout=e.timeout,l[h]=function(){if(l&&(4===l.readyState||m)&&(0!==l.status||l.responseURL&&0===l.responseURL.indexOf("file:"))){var n="getAllResponseHeaders"in l?s(l.getAllResponseHeaders()):null,r=e.responseType&&"text"!==e.responseType?l.response:l.responseText,i={data:r,status:1223===l.status?204:l.status,statusText:1223===l.status?"No Content":l.statusText,headers:n,config:e,request:l};o(t,f,i),l=null}},l.onerror=function(){f(a("Network Error",e,null,l)),l=null},l.ontimeout=function(){f(a("timeout of "+e.timeout+"ms exceeded",e,"ECONNABORTED",l)),l=null},r.isStandardBrowserEnv()){var v=n(16),g=(e.withCredentials||u(e.url))&&e.xsrfCookieName?v.read(e.xsrfCookieName):void 0;g&&(d[e.xsrfHeaderName]=g)}if("setRequestHeader"in l&&r.forEach(d,function(e,t){"undefined"==typeof p&&"content-type"===t.toLowerCase()?delete d[t]:l.setRequestHeader(t,e)}),e.withCredentials&&(l.withCredentials=!0),e.responseType)try{l.responseType=e.responseType}catch(t){if("json"!==e.responseType)throw t}"function"==typeof e.onDownloadProgress&&l.addEventListener("progress",e.onDownloadProgress),"function"==typeof e.onUploadProgress&&l.upload&&l.upload.addEventListener("progress",e.onUploadProgress),e.cancelToken&&e.cancelToken.promise.then(function(e){l&&(l.abort(),f(e),l=null)}),void 0===p&&(p=null),l.send(p)})}},function(e,t,n){"use strict";var r=n(10);e.exports=function(e,t,n){var o=n.config.validateStatus;n.status&&o&&!o(n.status)?t(r("Request failed with status code "+n.status,n.config,null,n.request,n)):e(n)}},function(e,t,n){"use strict";var r=n(11);e.exports=function(e,t,n,o,i){var s=new Error(e);return r(s,t,n,o,i)}},function(e,t){"use strict";e.exports=function(e,t,n,r,o){return e.config=t,n&&(e.code=n),e.request=r,e.response=o,e}},function(e,t,n){"use strict";function r(e){return encodeURIComponent(e).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}var o=n(2);e.exports=function(e,t,n){if(!t)return e;var i;if(n)i=n(t);else if(o.isURLSearchParams(t))i=t.toString();else{var s=[];o.forEach(t,function(e,t){null!==e&&"undefined"!=typeof e&&(o.isArray(e)&&(t+="[]"),o.isArray(e)||(e=[e]),o.forEach(e,function(e){o.isDate(e)?e=e.toISOString():o.isObject(e)&&(e=JSON.stringify(e)),s.push(r(t)+"="+r(e))}))}),i=s.join("&")}return i&&(e+=(e.indexOf("?")===-1?"?":"&")+i),e}},function(e,t,n){"use strict";var r=n(2);e.exports=function(e){var t,n,o,i={};return e?(r.forEach(e.split("\n"),function(e){o=e.indexOf(":"),t=r.trim(e.substr(0,o)).toLowerCase(),n=r.trim(e.substr(o+1)),t&&(i[t]=i[t]?i[t]+", "+n:n)}),i):i}},function(e,t,n){"use strict";var r=n(2);e.exports=r.isStandardBrowserEnv()?function(){function e(e){var t=e;return n&&(o.setAttribute("href",t),t=o.href),o.setAttribute("href",t),{href:o.href,protocol:o.protocol?o.protocol.replace(/:$/,""):"",host:o.host,search:o.search?o.search.replace(/^\?/,""):"",hash:o.hash?o.hash.replace(/^#/,""):"",hostname:o.hostname,port:o.port,pathname:"/"===o.pathname.charAt(0)?o.pathname:"/"+o.pathname}}var t,n=/(msie|trident)/i.test(navigator.userAgent),o=document.createElement("a");return t=e(window.location.href),function(n){var o=r.isString(n)?e(n):n;return o.protocol===t.protocol&&o.host===t.host}}():function(){return function(){return!0}}()},function(e,t){"use strict";function n(){this.message="String contains an invalid character"}function r(e){for(var t,r,i=String(e),s="",u=0,a=o;i.charAt(0|u)||(a="=",u%1);s+=a.charAt(63&t>>8-u%1*8)){if(r=i.charCodeAt(u+=.75),r>255)throw new n;t=t<<8|r}return s}var o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";n.prototype=new Error,n.prototype.code=5,n.prototype.name="InvalidCharacterError",e.exports=r},function(e,t,n){"use strict";var r=n(2);e.exports=r.isStandardBrowserEnv()?function(){return{write:function(e,t,n,o,i,s){var u=[];u.push(e+"="+encodeURIComponent(t)),r.isNumber(n)&&u.push("expires="+new Date(n).toGMTString()),r.isString(o)&&u.push("path="+o),r.isString(i)&&u.push("domain="+i),s===!0&&u.push("secure"),document.cookie=u.join("; ")},read:function(e){var t=document.cookie.match(new RegExp("(^|;\\s*)("+e+")=([^;]*)"));return t?decodeURIComponent(t[3]):null},remove:function(e){this.write(e,"",Date.now()-864e5)}}}():function(){return{write:function(){},read:function(){return null},remove:function(){}}}()},function(e,t,n){"use strict";function r(){this.handlers=[]}var o=n(2);r.prototype.use=function(e,t){return this.handlers.push({fulfilled:e,rejected:t}),this.handlers.length-1},r.prototype.eject=function(e){this.handlers[e]&&(this.handlers[e]=null)},r.prototype.forEach=function(e){o.forEach(this.handlers,function(t){null!==t&&e(t)})},e.exports=r},function(e,t,n){"use strict";function r(e){e.cancelToken&&e.cancelToken.throwIfRequested()}var o=n(2),i=n(19),s=n(20),u=n(6);e.exports=function(e){r(e),e.headers=e.headers||{},e.data=i(e.data,e.headers,e.transformRequest),e.headers=o.merge(e.headers.common||{},e.headers[e.method]||{},e.headers||{}),o.forEach(["delete","get","head","post","put","patch","common"],function(t){delete e.headers[t]});var t=e.adapter||u.adapter;return t(e).then(function(t){return r(e),t.data=i(t.data,t.headers,e.transformResponse),t},function(t){return s(t)||(r(e),t&&t.response&&(t.response.data=i(t.response.data,t.response.headers,e.transformResponse))),Promise.reject(t)})}},function(e,t,n){"use strict";var r=n(2);e.exports=function(e,t,n){return r.forEach(n,function(n){e=n(e,t)}),e}},function(e,t){"use strict";e.exports=function(e){return!(!e||!e.__CANCEL__)}},function(e,t){"use strict";e.exports=function(e){return/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e)}},function(e,t){"use strict";e.exports=function(e,t){return t?e.replace(/\/+$/,"")+"/"+t.replace(/^\/+/,""):e}},function(e,t){"use strict";function n(e){this.message=e}n.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")},n.prototype.__CANCEL__=!0,e.exports=n},function(e,t,n){"use strict";function r(e){if("function"!=typeof e)throw new TypeError("executor must be a function.");var t;this.promise=new Promise(function(e){t=e});var n=this;e(function(e){n.reason||(n.reason=new o(e),t(n.reason))})}var o=n(23);r.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},r.source=function(){var e,t=new r(function(t){e=t});return{token:t,cancel:e}},e.exports=r},function(e,t){"use strict";e.exports=function(e){return function(t){return e.apply(null,t)}}}])});
//# sourceMappingURL=axios.min.map
(function webpackUniversalModuleDefinition(root, factory) {
    if(typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if(typeof define === 'function' && define.amd)
        define([], factory);
    else {
        var a = factory();
        for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
    }
})(this, function() {
    return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
            var
                ArrayProto = Array.prototype,
                ObjProto = Object.prototype;

            var
                slice = ArrayProto.slice,
                toString = ObjProto.toString;

            var util = {};

            util.isArray = function(obj) {
                return Array.isArray(obj);
            };

            var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
            util.isArrayLike = function(obj) {
                if(typeof obj !== 'object' || !obj){
                    return false;
                }
                var length = obj.length;
                return typeof length === 'number'
                    && length % 1 === 0 && length >= 0 && length <= MAX_ARRAY_INDEX;
            };

            util.isObject = function(obj) {
                var type = typeof obj;
                return type === 'function' || type === 'object' && !!obj;
            };


            util.each = function(obj, callback) {
                var i,
                    len;
                if (util.isArray(obj)) {
                    for (i = 0, len = obj.length; i < len; i++) {
                        if (callback(obj[i], i, obj) === false) {
                            break;
                        }
                    }
                } else {
                    for (i in obj) {
                        if (callback(obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
                return obj;
            };

            util.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
                util['is' + name] = function(obj) {
                    return toString.call(obj) === '[object ' + name + ']';
                };
            });

            util.toArray = function(list, start) {
                start = start || 0
                var i = list.length - start
                var ret = new Array(i)
                while (i--) {
                    ret[i] = list[i + start]
                }
                return ret
            }

            util.toNumber = function(value) {
                if (typeof value !== 'string') {
                    return value
                } else {
                    var parsed = Number(value)
                    return isNaN(parsed)
                        ? value
                        : parsed
                }
            };

            util.convertArray = function (value) {
                if (util.isArray(value)) {
                    return value
                } else if (util.isPlainObject(value)) {
                    // convert plain object to array.
                    var keys = Object.keys(value)
                    var i = keys.length
                    var res = new Array(i)
                    var key
                    while (i--) {
                        key = keys[i]
                        res[i] = {
                            $key: key,
                            $value: value[key]
                        }
                    }
                    return res
                } else {
                    return value || []
                }
            }

            function multiIndex(obj,is) {  // obj,['1','2','3'] -> ((obj['1'])['2'])['3']
                return is.length ? multiIndex(obj[is[0]],is.slice(1)) : obj
            }

            util.getPath = function(obj,is) {   // obj,'1.2.3' -> multiIndex(obj,['1','2','3'])
                return multiIndex(obj,is.split('.'))
            }

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

            var toString = Object.prototype.toString
            var OBJECT_STRING = '[object Object]'
            util.isPlainObject = function (obj) {
                return toString.call(obj) === OBJECT_STRING
            }

/* harmony default export */ __webpack_exports__["a"] = (util);

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_index__ = __webpack_require__(0);


/**
 * Filter filter for arrays
 *
 * @param {Array} arr
 * @param {String} prop
 * @param {String|Number} search
 */

            function filterBy (arr, search) {
                var arr = __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].convertArray(arr)
                if (search == null) {
                    return arr
                }
                if (typeof search === 'function') {
                    return arr.filter(search)
                }
                // cast to lowercase string
                search = ('' + search).toLowerCase()
                var n = 2
                // extract and flatten keys
                var keys = Array.prototype.concat.apply([], __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].toArray(arguments, n))
                var res = []
                var item, key, val, j
                for (var i = 0, l = arr.length; i < l; i++) {
                    item = arr[i]
                    val = (item && item.$value) || item
                    j = keys.length
                    if (j) {
                        while (j--) {
                            key = keys[j]
                            if ((key === '$key' && contains(item.$key, search)) ||
                                contains(__WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].getPath(val, key), search)) {
                                res.push(item)
                                break
                            }
                        }
                    } else if (contains(item, search)) {
                        res.push(item)
                    }
                }
                return res
            }

            function contains (val, search) {
                var i
                if (__WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].isPlainObject(val)) {
                    var keys = Object.keys(val)
                    i = keys.length
                    while (i--) {
                        if (contains(val[keys[i]], search)) {
                            return true
                        }
                    }
                } else if (__WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].isArray(val)) {
                    i = val.length
                    while (i--) {
                        if (contains(val[i], search)) {
                            return true
                        }
                    }
                } else if (val != null) {
                    return val.toString().toLowerCase().indexOf(search) > -1
                }
            }

/* harmony default export */ __webpack_exports__["a"] = (filterBy);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
            Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_index__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__string_index__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__array_index__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__other_index__ = __webpack_require__(13);





            var Vue2Filters = {
                install: function(Vue) {
                    __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].each(__WEBPACK_IMPORTED_MODULE_1__string_index__, function(value, key) {
                        Vue.filter(key, value)
                    })

                    __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].each(__WEBPACK_IMPORTED_MODULE_3__other_index__, function(value, key) {
                        Vue.filter(key, value)
                    })

                    Vue.mixin({
                        methods: {
                            limitBy: __WEBPACK_IMPORTED_MODULE_2__array_index__["c" /* limitBy */],
                            filterBy: __WEBPACK_IMPORTED_MODULE_2__array_index__["a" /* filterBy */],
                            orderBy: __WEBPACK_IMPORTED_MODULE_2__array_index__["d" /* orderBy */],
                            find: __WEBPACK_IMPORTED_MODULE_2__array_index__["b" /* find */]
                        }
                    })
                }
            }

/* harmony default export */ __webpack_exports__["default"] = (Vue2Filters);

            if (typeof window !== 'undefined' && window.Vue) {
                window.Vue.use(Vue2Filters);
            }


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
            Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__capitalize__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__uppercase__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lowercase__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__placeholder__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__truncate__ = __webpack_require__(8);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "capitalize", function() { return __WEBPACK_IMPORTED_MODULE_0__capitalize__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "uppercase", function() { return __WEBPACK_IMPORTED_MODULE_1__uppercase__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "lowercase", function() { return __WEBPACK_IMPORTED_MODULE_2__lowercase__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "placeholder", function() { return __WEBPACK_IMPORTED_MODULE_3__placeholder__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "truncate", function() { return __WEBPACK_IMPORTED_MODULE_4__truncate__["a"]; });








/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/**
 *  Converts a string into Capitalize
 * 
 * 'abc' => 'Abc'
 */

            function capitalize (value) {
                if (!value && value !== 0) return ''
                value = value.toString()
                return value.charAt(0).toUpperCase() + value.slice(1)
            }

/* harmony default export */ __webpack_exports__["a"] = (capitalize);


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/**
 * Converts a string to UPPERCASE
 * 
 * 'abc' => 'ABC'
 */

            function uppercase (value) {
                return (value || value === 0)
                    ? value.toString().toUpperCase()
                    : ''
            }

/* harmony default export */ __webpack_exports__["a"] = (uppercase);

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/**
 * Converts a string to lowercase
 * 
 * 'AbC' => 'abc'
 */

            function lowercase (value) {
                return (value || value === 0)
                    ? value.toString().toLowerCase()
                    : ''
            }

/* harmony default export */ __webpack_exports__["a"] = (lowercase);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/**
 *  If the value is missing outputs the placeholder text
 * 
 * '' => {placeholder}
 * 'foo' => 'foo'
 */

            function placeholder (input, property) {
                return ( input === undefined || input === '' || input === null ) ? property : input;
            }

/* harmony default export */ __webpack_exports__["a"] = (placeholder);


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/**
 *  Truncate at the given || default length
 *
 * 'lorem ipsum dolor' => 'lorem ipsum dol...'
 */

            function truncate (value, length) {
                length = length || 15
                if( !value || typeof value !== 'string' ) return ''
                if( value.length <= length) return value
                return value.substring(0, length) + '...'
            }

/* harmony default export */ __webpack_exports__["a"] = (truncate);


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__limitBy__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__filterBy__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__orderBy__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__find__ = __webpack_require__(12);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_0__limitBy__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_1__filterBy__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_2__orderBy__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_3__find__["a"]; });








/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_index__ = __webpack_require__(0);


/**
 * Limit filter for arrays
 *
 * @param {Number} n
 * @param {Number} offset (Decimal expected)
 */

            function limitBy (arr, n, offset) {
                offset = offset ? parseInt(offset, 10) : 0
                n = __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].toNumber(n)
                return typeof n === 'number'
                    ? arr.slice(offset, offset + n)
                    : arr
            }

/* harmony default export */ __webpack_exports__["a"] = (limitBy);

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_index__ = __webpack_require__(0);


/**
 * Filter filter for arrays
 *
 * @param {String|Array<String>|Function} ...sortKeys
 * @param {Number} [order]
 */

            function orderBy (arr) {
                var comparator = null
                var sortKeys
                arr = __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].convertArray(arr)

                // determine order (last argument)
                var args = __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].toArray(arguments, 1)
                var order = args[args.length - 1]
                if (typeof order === 'number') {
                    order = order < 0 ? -1 : 1
                    args = args.length > 1 ? args.slice(0, -1) : args
                } else {
                    order = 1
                }

                // determine sortKeys & comparator
                var firstArg = args[0]
                if (!firstArg) {
                    return arr
                } else if (typeof firstArg === 'function') {
                    // custom comparator
                    comparator = function (a, b) {
                        return firstArg(a, b) * order
                    }
                } else {
                    // string keys. flatten first
                    sortKeys = Array.prototype.concat.apply([], args)
                    comparator = function (a, b, i) {
                        i = i || 0
                        return i >= sortKeys.length - 1
                            ? baseCompare(a, b, i)
                            : baseCompare(a, b, i) || comparator(a, b, i + 1)
                    }
                }

                function baseCompare (a, b, sortKeyIndex) {
                    var sortKey = sortKeys[sortKeyIndex]
                    if (sortKey) {
                        if (sortKey !== '$key') {
                            if (__WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].isObject(a) && '$value' in a) a = a.$value
                            if (__WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].isObject(b) && '$value' in b) b = b.$value
                        }
                        a = __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].isObject(a) ? __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].getPath(a, sortKey) : a
                        b = __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].isObject(b) ? __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].getPath(b, sortKey) : b
                    }
                    return a === b ? 0 : a > b ? order : -order
                }

                // sort on a copy to avoid mutating original array
                return arr.slice().sort(comparator)
            }

/* harmony default export */ __webpack_exports__["a"] = (orderBy);

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__filterBy__ = __webpack_require__(1);


/**
 * Get first matching element from a filtered array
 *
 * @param {Array} arr
 * @param {String|Number} search
 * @returns {mixed}
 */
            function find(arr, search) 
            {
                var array = __WEBPACK_IMPORTED_MODULE_0__filterBy__["a" /* default */].apply(this, arguments);
                array.splice(1);
                return array;
            }

/* harmony default export */ __webpack_exports__["a"] = (find);


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
            Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__currency__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__pluralize__ = __webpack_require__(15);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "currency", function() { return __WEBPACK_IMPORTED_MODULE_0__currency__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "pluralize", function() { return __WEBPACK_IMPORTED_MODULE_1__pluralize__["a"]; });






/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/**
 * 
 * 12345 => $12,345.00
 *
 * @param {String} sign
 * @param {Number} decimals Decimal places
 */

            function currency (value, currency, decimals) {
                var digitsRE = /(\d{3})(?=\d)/g
                value = parseFloat(value)
                if (!isFinite(value) || (!value && value !== 0)) return ''
                currency = currency != null ? currency : '$'
                decimals = decimals != null ? decimals : 2
                var stringified = Math.abs(value).toFixed(decimals)
                var _int = decimals
                    ? stringified.slice(0, -1 - decimals)
                    : stringified
                var i = _int.length % 3
                var head = i > 0
                    ? (_int.slice(0, i) + (_int.length > 3 ? ',' : ''))
                    : ''
                var _float = decimals
                    ? stringified.slice(-1 - decimals)
                    : ''
                var sign = value < 0 ? '-' : ''
                return sign + currency + head +
                    _int.slice(i).replace(digitsRE, '$1,') +
                    _float
            }

/* harmony default export */ __webpack_exports__["a"] = (currency);

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

            "use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util_index__ = __webpack_require__(0);


/**
 * 'item' => 'items'
 *
 * @params
 *  an array of strings corresponding to
 *  the single, double, triple ... forms of the word to
 *  be pluralized. When the number to be pluralized
 *  exceeds the length of the args, it will use the last
 *  entry in the array.
 *
 *  e.g. ['single', 'double', 'triple', 'multiple']
 */

            function pluralize (value) {
                var args = __WEBPACK_IMPORTED_MODULE_0__util_index__["a" /* default */].toArray(arguments, 1)
                return args.length > 1
                    ? (args[value % 10 - 1] || args[args.length - 1])
                    : (args[0] + (value === 1 ? '' : 's'))
            }

/* harmony default export */ __webpack_exports__["a"] = (pluralize);

/***/ })
/******/ ]);
});