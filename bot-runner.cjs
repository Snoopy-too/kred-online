var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@babel/runtime/helpers/typeof.js
var require_typeof = __commonJS({
  "node_modules/@babel/runtime/helpers/typeof.js"(exports2, module2) {
    function _typeof(o2) {
      "@babel/helpers - typeof";
      return module2.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o3) {
        return typeof o3;
      } : function(o3) {
        return o3 && "function" == typeof Symbol && o3.constructor === Symbol && o3 !== Symbol.prototype ? "symbol" : typeof o3;
      }, module2.exports.__esModule = true, module2.exports["default"] = module2.exports, _typeof(o2);
    }
    module2.exports = _typeof, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  }
});

// node_modules/@babel/runtime/helpers/toPrimitive.js
var require_toPrimitive = __commonJS({
  "node_modules/@babel/runtime/helpers/toPrimitive.js"(exports2, module2) {
    var _typeof = require_typeof()["default"];
    function toPrimitive(t2, r2) {
      if ("object" != _typeof(t2) || !t2) return t2;
      var e = t2[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i2 = e.call(t2, r2 || "default");
        if ("object" != _typeof(i2)) return i2;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r2 ? String : Number)(t2);
    }
    module2.exports = toPrimitive, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  }
});

// node_modules/@babel/runtime/helpers/toPropertyKey.js
var require_toPropertyKey = __commonJS({
  "node_modules/@babel/runtime/helpers/toPropertyKey.js"(exports2, module2) {
    var _typeof = require_typeof()["default"];
    var toPrimitive = require_toPrimitive();
    function toPropertyKey(t2) {
      var i2 = toPrimitive(t2, "string");
      return "symbol" == _typeof(i2) ? i2 : i2 + "";
    }
    module2.exports = toPropertyKey, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  }
});

// node_modules/@babel/runtime/helpers/defineProperty.js
var require_defineProperty = __commonJS({
  "node_modules/@babel/runtime/helpers/defineProperty.js"(exports2, module2) {
    var toPropertyKey = require_toPropertyKey();
    function _defineProperty(e, r2, t2) {
      return (r2 = toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, {
        value: t2,
        enumerable: true,
        configurable: true,
        writable: true
      }) : e[r2] = t2, e;
    }
    module2.exports = _defineProperty, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  }
});

// node_modules/@babel/runtime/helpers/objectSpread2.js
var require_objectSpread2 = __commonJS({
  "node_modules/@babel/runtime/helpers/objectSpread2.js"(exports2, module2) {
    var defineProperty = require_defineProperty();
    function ownKeys(e, r2) {
      var t2 = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o2 = Object.getOwnPropertySymbols(e);
        r2 && (o2 = o2.filter(function(r3) {
          return Object.getOwnPropertyDescriptor(e, r3).enumerable;
        })), t2.push.apply(t2, o2);
      }
      return t2;
    }
    function _objectSpread2(e) {
      for (var r2 = 1; r2 < arguments.length; r2++) {
        var t2 = null != arguments[r2] ? arguments[r2] : {};
        r2 % 2 ? ownKeys(Object(t2), true).forEach(function(r3) {
          defineProperty(e, r3, t2[r3]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys(Object(t2)).forEach(function(r3) {
          Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t2, r3));
        });
      }
      return e;
    }
    module2.exports = _objectSpread2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  }
});

// node_modules/redux/lib/redux.js
var require_redux = __commonJS({
  "node_modules/redux/lib/redux.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var _objectSpread = require_objectSpread2();
    function _interopDefaultLegacy(e) {
      return e && typeof e === "object" && "default" in e ? e : { "default": e };
    }
    var _objectSpread__default = /* @__PURE__ */ _interopDefaultLegacy(_objectSpread);
    function formatProdErrorMessage(code) {
      return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or use the non-minified dev environment for full errors. ";
    }
    var $$observable = function() {
      return typeof Symbol === "function" && Symbol.observable || "@@observable";
    }();
    var randomString2 = function randomString3() {
      return Math.random().toString(36).substring(7).split("").join(".");
    };
    var ActionTypes = {
      INIT: "@@redux/INIT" + randomString2(),
      REPLACE: "@@redux/REPLACE" + randomString2(),
      PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
        return "@@redux/PROBE_UNKNOWN_ACTION" + randomString2();
      }
    };
    function isPlainObject2(obj) {
      if (typeof obj !== "object" || obj === null) return false;
      var proto = obj;
      while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
      }
      return Object.getPrototypeOf(obj) === proto;
    }
    function miniKindOf(val) {
      if (val === void 0) return "undefined";
      if (val === null) return "null";
      var type = typeof val;
      switch (type) {
        case "boolean":
        case "string":
        case "number":
        case "symbol":
        case "function": {
          return type;
        }
      }
      if (Array.isArray(val)) return "array";
      if (isDate(val)) return "date";
      if (isError(val)) return "error";
      var constructorName = ctorName(val);
      switch (constructorName) {
        case "Symbol":
        case "Promise":
        case "WeakMap":
        case "WeakSet":
        case "Map":
        case "Set":
          return constructorName;
      }
      return type.slice(8, -1).toLowerCase().replace(/\s/g, "");
    }
    function ctorName(val) {
      return typeof val.constructor === "function" ? val.constructor.name : null;
    }
    function isError(val) {
      return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
    }
    function isDate(val) {
      if (val instanceof Date) return true;
      return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
    }
    function kindOf(val) {
      var typeOfVal = typeof val;
      if (process.env.NODE_ENV !== "production") {
        typeOfVal = miniKindOf(val);
      }
      return typeOfVal;
    }
    function createStore3(reducer, preloadedState, enhancer) {
      var _ref2;
      if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
        throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(0) : "It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.");
      }
      if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
        enhancer = preloadedState;
        preloadedState = void 0;
      }
      if (typeof enhancer !== "undefined") {
        if (typeof enhancer !== "function") {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(1) : "Expected the enhancer to be a function. Instead, received: '" + kindOf(enhancer) + "'");
        }
        return enhancer(createStore3)(reducer, preloadedState);
      }
      if (typeof reducer !== "function") {
        throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(2) : "Expected the root reducer to be a function. Instead, received: '" + kindOf(reducer) + "'");
      }
      var currentReducer = reducer;
      var currentState = preloadedState;
      var currentListeners = [];
      var nextListeners = currentListeners;
      var isDispatching = false;
      function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
          nextListeners = currentListeners.slice();
        }
      }
      function getState() {
        if (isDispatching) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(3) : "You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.");
        }
        return currentState;
      }
      function subscribe2(listener) {
        if (typeof listener !== "function") {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(4) : "Expected the listener to be a function. Instead, received: '" + kindOf(listener) + "'");
        }
        if (isDispatching) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(5) : "You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.");
        }
        var isSubscribed = true;
        ensureCanMutateNextListeners();
        nextListeners.push(listener);
        return function unsubscribe() {
          if (!isSubscribed) {
            return;
          }
          if (isDispatching) {
            throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(6) : "You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.");
          }
          isSubscribed = false;
          ensureCanMutateNextListeners();
          var index = nextListeners.indexOf(listener);
          nextListeners.splice(index, 1);
          currentListeners = null;
        };
      }
      function dispatch2(action) {
        if (!isPlainObject2(action)) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(7) : "Actions must be plain objects. Instead, the actual type was: '" + kindOf(action) + "'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.");
        }
        if (typeof action.type === "undefined") {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(8) : 'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
        }
        if (isDispatching) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(9) : "Reducers may not dispatch actions.");
        }
        try {
          isDispatching = true;
          currentState = currentReducer(currentState, action);
        } finally {
          isDispatching = false;
        }
        var listeners = currentListeners = nextListeners;
        for (var i2 = 0; i2 < listeners.length; i2++) {
          var listener = listeners[i2];
          listener();
        }
        return action;
      }
      function replaceReducer(nextReducer) {
        if (typeof nextReducer !== "function") {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(10) : "Expected the nextReducer to be a function. Instead, received: '" + kindOf(nextReducer));
        }
        currentReducer = nextReducer;
        dispatch2({
          type: ActionTypes.REPLACE
        });
      }
      function observable() {
        var _ref;
        var outerSubscribe = subscribe2;
        return _ref = {
          /**
           * The minimal observable subscription method.
           * @param {Object} observer Any object that can be used as an observer.
           * The observer object should have a `next` method.
           * @returns {subscription} An object with an `unsubscribe` method that can
           * be used to unsubscribe the observable from the store, and prevent further
           * emission of values from the observable.
           */
          subscribe: function subscribe3(observer) {
            if (typeof observer !== "object" || observer === null) {
              throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(11) : "Expected the observer to be an object. Instead, received: '" + kindOf(observer) + "'");
            }
            function observeState() {
              if (observer.next) {
                observer.next(getState());
              }
            }
            observeState();
            var unsubscribe = outerSubscribe(observeState);
            return {
              unsubscribe
            };
          }
        }, _ref[$$observable] = function() {
          return this;
        }, _ref;
      }
      dispatch2({
        type: ActionTypes.INIT
      });
      return _ref2 = {
        dispatch: dispatch2,
        subscribe: subscribe2,
        getState,
        replaceReducer
      }, _ref2[$$observable] = observable, _ref2;
    }
    var legacy_createStore = createStore3;
    function warning(message) {
      if (typeof console !== "undefined" && typeof console.error === "function") {
        console.error(message);
      }
      try {
        throw new Error(message);
      } catch (e) {
      }
    }
    function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
      var reducerKeys = Object.keys(reducers);
      var argumentName = action && action.type === ActionTypes.INIT ? "preloadedState argument passed to createStore" : "previous state received by the reducer";
      if (reducerKeys.length === 0) {
        return "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";
      }
      if (!isPlainObject2(inputState)) {
        return "The " + argumentName + ' has unexpected type of "' + kindOf(inputState) + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
      }
      var unexpectedKeys = Object.keys(inputState).filter(function(key) {
        return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
      });
      unexpectedKeys.forEach(function(key) {
        unexpectedKeyCache[key] = true;
      });
      if (action && action.type === ActionTypes.REPLACE) return;
      if (unexpectedKeys.length > 0) {
        return "Unexpected " + (unexpectedKeys.length > 1 ? "keys" : "key") + " " + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + ". ") + "Expected to find one of the known reducer keys instead: " + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
      }
    }
    function assertReducerShape(reducers) {
      Object.keys(reducers).forEach(function(key) {
        var reducer = reducers[key];
        var initialState = reducer(void 0, {
          type: ActionTypes.INIT
        });
        if (typeof initialState === "undefined") {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(12) : 'The slice reducer for key "' + key + `" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.`);
        }
        if (typeof reducer(void 0, {
          type: ActionTypes.PROBE_UNKNOWN_ACTION()
        }) === "undefined") {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(13) : 'The slice reducer for key "' + key + '" returned undefined when probed with a random type. ' + ("Don't try to handle '" + ActionTypes.INIT + `' or other actions in "redux/*" `) + "namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.");
        }
      });
    }
    function combineReducers(reducers) {
      var reducerKeys = Object.keys(reducers);
      var finalReducers = {};
      for (var i2 = 0; i2 < reducerKeys.length; i2++) {
        var key = reducerKeys[i2];
        if (process.env.NODE_ENV !== "production") {
          if (typeof reducers[key] === "undefined") {
            warning('No reducer provided for key "' + key + '"');
          }
        }
        if (typeof reducers[key] === "function") {
          finalReducers[key] = reducers[key];
        }
      }
      var finalReducerKeys = Object.keys(finalReducers);
      var unexpectedKeyCache;
      if (process.env.NODE_ENV !== "production") {
        unexpectedKeyCache = {};
      }
      var shapeAssertionError;
      try {
        assertReducerShape(finalReducers);
      } catch (e) {
        shapeAssertionError = e;
      }
      return function combination(state, action) {
        if (state === void 0) {
          state = {};
        }
        if (shapeAssertionError) {
          throw shapeAssertionError;
        }
        if (process.env.NODE_ENV !== "production") {
          var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
          if (warningMessage) {
            warning(warningMessage);
          }
        }
        var hasChanged = false;
        var nextState = {};
        for (var _i = 0; _i < finalReducerKeys.length; _i++) {
          var _key = finalReducerKeys[_i];
          var reducer = finalReducers[_key];
          var previousStateForKey = state[_key];
          var nextStateForKey = reducer(previousStateForKey, action);
          if (typeof nextStateForKey === "undefined") {
            var actionType = action && action.type;
            throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(14) : "When called with an action of type " + (actionType ? '"' + String(actionType) + '"' : "(unknown type)") + ', the slice reducer for key "' + _key + '" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.');
          }
          nextState[_key] = nextStateForKey;
          hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
        hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
        return hasChanged ? nextState : state;
      };
    }
    function bindActionCreator(actionCreator, dispatch2) {
      return function() {
        return dispatch2(actionCreator.apply(this, arguments));
      };
    }
    function bindActionCreators(actionCreators, dispatch2) {
      if (typeof actionCreators === "function") {
        return bindActionCreator(actionCreators, dispatch2);
      }
      if (typeof actionCreators !== "object" || actionCreators === null) {
        throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(16) : "bindActionCreators expected an object or a function, but instead received: '" + kindOf(actionCreators) + `'. Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`);
      }
      var boundActionCreators = {};
      for (var key in actionCreators) {
        var actionCreator = actionCreators[key];
        if (typeof actionCreator === "function") {
          boundActionCreators[key] = bindActionCreator(actionCreator, dispatch2);
        }
      }
      return boundActionCreators;
    }
    function compose2() {
      for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
        funcs[_key] = arguments[_key];
      }
      if (funcs.length === 0) {
        return function(arg) {
          return arg;
        };
      }
      if (funcs.length === 1) {
        return funcs[0];
      }
      return funcs.reduce(function(a2, b2) {
        return function() {
          return a2(b2.apply(void 0, arguments));
        };
      });
    }
    function applyMiddleware3() {
      for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
        middlewares[_key] = arguments[_key];
      }
      return function(createStore4) {
        return function() {
          var store = createStore4.apply(void 0, arguments);
          var _dispatch = function dispatch2() {
            throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(15) : "Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.");
          };
          var middlewareAPI = {
            getState: store.getState,
            dispatch: function dispatch2() {
              return _dispatch.apply(void 0, arguments);
            }
          };
          var chain = middlewares.map(function(middleware) {
            return middleware(middlewareAPI);
          });
          _dispatch = compose2.apply(void 0, chain)(store.dispatch);
          return _objectSpread__default["default"](_objectSpread__default["default"]({}, store), {}, {
            dispatch: _dispatch
          });
        };
      };
    }
    exports2.__DO_NOT_USE__ActionTypes = ActionTypes;
    exports2.applyMiddleware = applyMiddleware3;
    exports2.bindActionCreators = bindActionCreators;
    exports2.combineReducers = combineReducers;
    exports2.compose = compose2;
    exports2.createStore = createStore3;
    exports2.legacy_createStore = legacy_createStore;
  }
});

// node_modules/lodash.isplainobject/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.isplainobject/index.js"(exports2, module2) {
    var objectTag = "[object Object]";
    function isHostObject(value2) {
      var result = false;
      if (value2 != null && typeof value2.toString != "function") {
        try {
          result = !!(value2 + "");
        } catch (e) {
        }
      }
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectCtorString = funcToString.call(Object);
    var objectToString = objectProto.toString;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    function isObjectLike(value2) {
      return !!value2 && typeof value2 == "object";
    }
    function isPlainObject2(value2) {
      if (!isObjectLike(value2) || objectToString.call(value2) != objectTag || isHostObject(value2)) {
        return false;
      }
      var proto = getPrototype(value2);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    module2.exports = isPlainObject2;
  }
});

// node_modules/rfc6902/pointer.js
var require_pointer = __commonJS({
  "node_modules/rfc6902/pointer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Pointer = void 0;
    exports2.unescapeToken = unescapeToken;
    exports2.escapeToken = escapeToken;
    function unescapeToken(token) {
      return token.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    function escapeToken(token) {
      return token.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    var Pointer = (
      /** @class */
      function() {
        function Pointer2(tokens) {
          if (tokens === void 0) {
            tokens = [""];
          }
          this.tokens = tokens;
        }
        Pointer2.fromJSON = function(path) {
          var tokens = path.split("/").map(unescapeToken);
          if (tokens[0] !== "")
            throw new Error("Invalid JSON Pointer: ".concat(path));
          return new Pointer2(tokens);
        };
        Pointer2.prototype.toString = function() {
          return this.tokens.map(escapeToken).join("/");
        };
        Pointer2.prototype.evaluate = function(object2) {
          var parent = null;
          var key = "";
          var value2 = object2;
          for (var i2 = 1, l2 = this.tokens.length; i2 < l2; i2++) {
            parent = value2;
            key = this.tokens[i2];
            if (key == "__proto__" || key == "constructor" || key == "prototype") {
              continue;
            }
            value2 = (parent || {})[key];
          }
          return { parent, key, value: value2 };
        };
        Pointer2.prototype.get = function(object2) {
          return this.evaluate(object2).value;
        };
        Pointer2.prototype.set = function(object2, value2) {
          var endpoint = this.evaluate(object2);
          if (endpoint.parent) {
            endpoint.parent[endpoint.key] = value2;
          }
        };
        Pointer2.prototype.push = function(token) {
          this.tokens.push(token);
        };
        Pointer2.prototype.add = function(token) {
          var tokens = this.tokens.concat(String(token));
          return new Pointer2(tokens);
        };
        Pointer2.prototype.parent = function() {
          var tokens = this.tokens.length > 1 ? this.tokens.slice(0, -1) : [""];
          return new Pointer2(tokens);
        };
        return Pointer2;
      }()
    );
    exports2.Pointer = Pointer;
  }
});

// node_modules/rfc6902/util.js
var require_util = __commonJS({
  "node_modules/rfc6902/util.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.hasOwnProperty = void 0;
    exports2.objectType = objectType2;
    exports2.clone = clone;
    exports2.hasOwnProperty = Object.prototype.hasOwnProperty;
    function objectType2(object2) {
      if (object2 === void 0) {
        return "undefined";
      }
      if (object2 === null) {
        return "null";
      }
      if (Array.isArray(object2)) {
        return "array";
      }
      return typeof object2;
    }
    function isNonPrimitive(value2) {
      return value2 != null && typeof value2 == "object";
    }
    function clone(source) {
      if (!isNonPrimitive(source)) {
        return source;
      }
      if (source.constructor == Array) {
        var length = source.length;
        var arrayTarget = new Array(length);
        for (var i2 = 0; i2 < length; i2++) {
          arrayTarget[i2] = clone(source[i2]);
        }
        return arrayTarget;
      }
      if (source.constructor == Date) {
        var dateTarget = /* @__PURE__ */ new Date(+source);
        return dateTarget;
      }
      var objectTarget = {};
      for (var key in source) {
        if (exports2.hasOwnProperty.call(source, key)) {
          objectTarget[key] = clone(source[key]);
        }
      }
      return objectTarget;
    }
  }
});

// node_modules/rfc6902/diff.js
var require_diff = __commonJS({
  "node_modules/rfc6902/diff.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isDestructive = isDestructive;
    exports2.subtract = subtract;
    exports2.intersection = intersection;
    exports2.diffArrays = diffArrays;
    exports2.diffObjects = diffObjects;
    exports2.diffAny = diffAny;
    var util_1 = require_util();
    function isDestructive(_a) {
      var op = _a.op;
      return op === "remove" || op === "replace" || op === "copy" || op === "move";
    }
    function subtract(minuend, subtrahend) {
      var keys2 = [];
      for (var key in minuend) {
        if (util_1.hasOwnProperty.call(minuend, key) && minuend[key] !== void 0 && !(util_1.hasOwnProperty.call(subtrahend, key) && subtrahend[key] !== void 0)) {
          keys2.push(key);
        }
      }
      return keys2;
    }
    function intersection(objects) {
      var length = objects.length;
      var counter = {};
      for (var i2 = 0; i2 < length; i2++) {
        var object2 = objects[i2];
        for (var key in object2) {
          if (util_1.hasOwnProperty.call(object2, key) && object2[key] !== void 0) {
            counter[key] = (counter[key] || 0) + 1;
          }
        }
      }
      for (var key in counter) {
        if (counter[key] < length) {
          delete counter[key];
        }
      }
      return Object.keys(counter);
    }
    function intersection2(a2, b2) {
      var keys2 = [];
      for (var key in a2) {
        if (util_1.hasOwnProperty.call(a2, key) && a2[key] !== void 0 && util_1.hasOwnProperty.call(b2, key) && b2[key] !== void 0) {
          keys2.push(key);
        }
      }
      return keys2;
    }
    function isArrayAdd(array_operation) {
      return array_operation.op === "add";
    }
    function isArrayRemove(array_operation) {
      return array_operation.op === "remove";
    }
    function appendArrayOperation(base, operation) {
      return {
        // the new operation must be pushed on the end
        operations: base.operations.concat(operation),
        cost: base.cost + 1
      };
    }
    function diffArrays(input, output, ptr, diff) {
      if (diff === void 0) {
        diff = diffAny;
      }
      var max_length = Math.max(input.length, output.length);
      var memo = /* @__PURE__ */ new Map([[0, { operations: [], cost: 0 }]]);
      function dist(i2, j2) {
        var memo_key = i2 * (max_length + 1) + j2;
        var memoized = memo.get(memo_key);
        if (memoized === void 0) {
          if (i2 > 0 && j2 > 0 && !diff(input[i2 - 1], output[j2 - 1], ptr.add(String(i2 - 1))).length) {
            memoized = dist(i2 - 1, j2 - 1);
          } else {
            var alternatives = [];
            if (i2 > 0) {
              var remove_base = dist(i2 - 1, j2);
              var remove_operation = {
                op: "remove",
                index: i2 - 1
              };
              alternatives.push(appendArrayOperation(remove_base, remove_operation));
            }
            if (j2 > 0) {
              var add_base = dist(i2, j2 - 1);
              var add_operation = {
                op: "add",
                index: i2 - 1,
                value: output[j2 - 1]
              };
              alternatives.push(appendArrayOperation(add_base, add_operation));
            }
            if (i2 > 0 && j2 > 0) {
              var replace_base = dist(i2 - 1, j2 - 1);
              var replace_operation = {
                op: "replace",
                index: i2 - 1,
                original: input[i2 - 1],
                value: output[j2 - 1]
              };
              alternatives.push(appendArrayOperation(replace_base, replace_operation));
            }
            var best = alternatives.sort(function(a2, b2) {
              return a2.cost - b2.cost;
            })[0];
            memoized = best;
          }
          memo.set(memo_key, memoized);
        }
        return memoized;
      }
      var input_length = isNaN(input.length) || input.length <= 0 ? 0 : input.length;
      var output_length = isNaN(output.length) || output.length <= 0 ? 0 : output.length;
      var array_operations = dist(input_length, output_length).operations;
      var padded_operations = array_operations.reduce(function(_a, array_operation) {
        var operations = _a[0], padding = _a[1];
        if (isArrayAdd(array_operation)) {
          var padded_index = array_operation.index + 1 + padding;
          var index_token = padded_index < input_length + padding ? String(padded_index) : "-";
          var operation = {
            op: array_operation.op,
            path: ptr.add(index_token).toString(),
            value: array_operation.value
          };
          return [operations.concat(operation), padding + 1];
        } else if (isArrayRemove(array_operation)) {
          var operation = {
            op: array_operation.op,
            path: ptr.add(String(array_operation.index + padding)).toString()
          };
          return [operations.concat(operation), padding - 1];
        } else {
          var replace_ptr = ptr.add(String(array_operation.index + padding));
          var replace_operations = diff(array_operation.original, array_operation.value, replace_ptr);
          return [operations.concat.apply(operations, replace_operations), padding];
        }
      }, [[], 0])[0];
      return padded_operations;
    }
    function diffObjects(input, output, ptr, diff) {
      if (diff === void 0) {
        diff = diffAny;
      }
      var operations = [];
      subtract(input, output).forEach(function(key) {
        operations.push({ op: "remove", path: ptr.add(key).toString() });
      });
      subtract(output, input).forEach(function(key) {
        operations.push({ op: "add", path: ptr.add(key).toString(), value: output[key] });
      });
      intersection2(input, output).forEach(function(key) {
        operations.push.apply(operations, diff(input[key], output[key], ptr.add(key)));
      });
      return operations;
    }
    function diffAny(input, output, ptr, diff) {
      if (diff === void 0) {
        diff = diffAny;
      }
      if (input === output) {
        return [];
      }
      var input_type = (0, util_1.objectType)(input);
      var output_type = (0, util_1.objectType)(output);
      if (input_type == "array" && output_type == "array") {
        return diffArrays(input, output, ptr, diff);
      }
      if (input_type == "object" && output_type == "object") {
        return diffObjects(input, output, ptr, diff);
      }
      return [{ op: "replace", path: ptr.toString(), value: output }];
    }
  }
});

// node_modules/rfc6902/patch.js
var require_patch = __commonJS({
  "node_modules/rfc6902/patch.js"(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d2, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d3, b3) {
          d3.__proto__ = b3;
        } || function(d3, b3) {
          for (var p2 in b3) if (Object.prototype.hasOwnProperty.call(b3, p2)) d3[p2] = b3[p2];
        };
        return extendStatics(d2, b2);
      };
      return function(d2, b2) {
        if (typeof b2 !== "function" && b2 !== null)
          throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
        extendStatics(d2, b2);
        function __() {
          this.constructor = d2;
        }
        d2.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InvalidOperationError = exports2.TestError = exports2.MissingError = void 0;
    exports2.add = add;
    exports2.remove = remove;
    exports2.replace = replace;
    exports2.move = move;
    exports2.copy = copy2;
    exports2.test = test;
    exports2.apply = apply;
    var pointer_1 = require_pointer();
    var util_1 = require_util();
    var diff_1 = require_diff();
    var MissingError = (
      /** @class */
      function(_super) {
        __extends(MissingError2, _super);
        function MissingError2(path) {
          var _this = _super.call(this, "Value required at path: ".concat(path)) || this;
          _this.path = path;
          _this.name = "MissingError";
          return _this;
        }
        return MissingError2;
      }(Error)
    );
    exports2.MissingError = MissingError;
    var TestError = (
      /** @class */
      function(_super) {
        __extends(TestError2, _super);
        function TestError2(actual, expected) {
          var _this = _super.call(this, "Test failed: ".concat(actual, " != ").concat(expected)) || this;
          _this.actual = actual;
          _this.expected = expected;
          _this.name = "TestError";
          return _this;
        }
        return TestError2;
      }(Error)
    );
    exports2.TestError = TestError;
    function _add(object2, key, value2) {
      if (Array.isArray(object2)) {
        if (key == "-") {
          object2.push(value2);
        } else {
          var index = parseInt(key, 10);
          object2.splice(index, 0, value2);
        }
      } else {
        object2[key] = value2;
      }
    }
    function _remove(object2, key) {
      if (Array.isArray(object2)) {
        var index = parseInt(key, 10);
        object2.splice(index, 1);
      } else {
        delete object2[key];
      }
    }
    function add(object2, operation, options) {
      var pointer = pointer_1.Pointer.fromJSON(operation.path);
      if ((options === null || options === void 0 ? void 0 : options.implicitArrayCreation) && pointer.tokens[pointer.tokens.length - 1] === "-") {
        var parentEndpoint = pointer.parent().evaluate(object2);
        if (parentEndpoint.value === void 0 && (0, util_1.objectType)(parentEndpoint.parent) === "object") {
          parentEndpoint.parent[parentEndpoint.key] = [];
        }
      }
      var endpoint = pointer.evaluate(object2);
      if (endpoint.parent === void 0 || endpoint.parent === null) {
        return new MissingError(operation.path);
      }
      if ((options === null || options === void 0 ? void 0 : options.implicitArrayCreation) && endpoint.key === "-" && !Array.isArray(endpoint.parent)) {
        return new MissingError(operation.path);
      }
      _add(endpoint.parent, endpoint.key, (0, util_1.clone)(operation.value));
      return null;
    }
    function remove(object2, operation, options) {
      var endpoint = pointer_1.Pointer.fromJSON(operation.path).evaluate(object2);
      if (endpoint.parent === null) {
        return new MissingError(operation.path);
      }
      if (endpoint.value === void 0) {
        return new MissingError(operation.path);
      }
      _remove(endpoint.parent, endpoint.key);
      return null;
    }
    function replace(object2, operation, options) {
      var endpoint = pointer_1.Pointer.fromJSON(operation.path).evaluate(object2);
      if (endpoint.parent === null) {
        return new MissingError(operation.path);
      }
      if (Array.isArray(endpoint.parent)) {
        if (parseInt(endpoint.key, 10) >= endpoint.parent.length) {
          return new MissingError(operation.path);
        }
      } else if (endpoint.value === void 0) {
        return new MissingError(operation.path);
      }
      endpoint.parent[endpoint.key] = (0, util_1.clone)(operation.value);
      return null;
    }
    function move(object2, operation, options) {
      var from_pointer = pointer_1.Pointer.fromJSON(operation.from);
      var from_endpoint = from_pointer.evaluate(object2);
      if (from_endpoint.value === void 0) {
        return new MissingError(operation.from);
      }
      var pointer = pointer_1.Pointer.fromJSON(operation.path);
      if (from_pointer.tokens.length < pointer.tokens.length && from_pointer.tokens.every(function(token, index) {
        return token === pointer.tokens[index];
      })) {
        return new MissingError(operation.path);
      }
      var endpoint = pointer.evaluate(object2);
      if (endpoint.parent === void 0 || endpoint.parent === null) {
        return new MissingError(operation.path);
      }
      _remove(from_endpoint.parent, from_endpoint.key);
      _add(endpoint.parent, endpoint.key, from_endpoint.value);
      return null;
    }
    function copy2(object2, operation, options) {
      var from_endpoint = pointer_1.Pointer.fromJSON(operation.from).evaluate(object2);
      if (from_endpoint.value === void 0) {
        return new MissingError(operation.from);
      }
      var endpoint = pointer_1.Pointer.fromJSON(operation.path).evaluate(object2);
      if (endpoint.parent === void 0 || endpoint.parent === null) {
        return new MissingError(operation.path);
      }
      _add(endpoint.parent, endpoint.key, (0, util_1.clone)(from_endpoint.value));
      return null;
    }
    function test(object2, operation, options) {
      var endpoint = pointer_1.Pointer.fromJSON(operation.path).evaluate(object2);
      if ((0, diff_1.diffAny)(endpoint.value, operation.value, new pointer_1.Pointer()).length) {
        return new TestError(endpoint.value, operation.value);
      }
      return null;
    }
    var InvalidOperationError = (
      /** @class */
      function(_super) {
        __extends(InvalidOperationError2, _super);
        function InvalidOperationError2(operation) {
          var _this = _super.call(this, "Invalid operation: ".concat(operation.op)) || this;
          _this.operation = operation;
          _this.name = "InvalidOperationError";
          return _this;
        }
        return InvalidOperationError2;
      }(Error)
    );
    exports2.InvalidOperationError = InvalidOperationError;
    function apply(object2, operation, options) {
      switch (operation.op) {
        case "add":
          return add(object2, operation, options);
        case "remove":
          return remove(object2, operation, options);
        case "replace":
          return replace(object2, operation, options);
        case "move":
          return move(object2, operation, options);
        case "copy":
          return copy2(object2, operation, options);
        case "test":
          return test(object2, operation, options);
      }
      return new InvalidOperationError(operation);
    }
  }
});

// node_modules/rfc6902/index.js
var require_rfc6902 = __commonJS({
  "node_modules/rfc6902/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Pointer = void 0;
    exports2.applyPatch = applyPatch2;
    exports2.createPatch = createPatch2;
    exports2.createTests = createTests;
    var pointer_1 = require_pointer();
    Object.defineProperty(exports2, "Pointer", { enumerable: true, get: function() {
      return pointer_1.Pointer;
    } });
    var patch_1 = require_patch();
    var diff_1 = require_diff();
    function applyPatch2(object2, patch2, options) {
      return patch2.map(function(operation) {
        return (0, patch_1.apply)(object2, operation, options);
      });
    }
    function wrapVoidableDiff(diff) {
      function wrappedDiff(input, output, ptr) {
        var custom_patch = diff(input, output, ptr);
        return Array.isArray(custom_patch) ? custom_patch : (0, diff_1.diffAny)(input, output, ptr, wrappedDiff);
      }
      return wrappedDiff;
    }
    function createPatch2(input, output, diff) {
      var ptr = new pointer_1.Pointer();
      return (diff ? wrapVoidableDiff(diff) : diff_1.diffAny)(input, output, ptr);
    }
    function createTest(input, path) {
      var endpoint = pointer_1.Pointer.fromJSON(path).evaluate(input);
      if (endpoint !== void 0) {
        return { op: "test", path, value: endpoint.value };
      }
    }
    function createTests(input, patch2) {
      var tests = new Array();
      patch2.filter(diff_1.isDestructive).forEach(function(operation) {
        var pathTest = createTest(input, operation.path);
        if (pathTest)
          tests.push(pathTest);
        if ("from" in operation) {
          var fromTest = createTest(input, operation.from);
          if (fromTest)
            tests.push(fromTest);
        }
      });
      return tests;
    }
  }
});

// node_modules/xmlhttprequest-ssl/lib/XMLHttpRequest.js
var require_XMLHttpRequest = __commonJS({
  "node_modules/xmlhttprequest-ssl/lib/XMLHttpRequest.js"(exports2, module2) {
    var fs = require("fs");
    var Url = require("url");
    var spawn = require("child_process").spawn;
    module2.exports = XMLHttpRequest3;
    XMLHttpRequest3.XMLHttpRequest = XMLHttpRequest3;
    function XMLHttpRequest3(opts) {
      "use strict";
      opts = opts || {};
      var self2 = this;
      var http = require("http");
      var https = require("https");
      var request;
      var response;
      var settings = {};
      var disableHeaderCheck = false;
      var defaultHeaders = {
        "User-Agent": "node-XMLHttpRequest",
        "Accept": "*/*"
      };
      var headers = Object.assign({}, defaultHeaders);
      var forbiddenRequestHeaders = [
        "accept-charset",
        "accept-encoding",
        "access-control-request-headers",
        "access-control-request-method",
        "connection",
        "content-length",
        "content-transfer-encoding",
        "cookie",
        "cookie2",
        "date",
        "expect",
        "host",
        "keep-alive",
        "origin",
        "referer",
        "te",
        "trailer",
        "transfer-encoding",
        "upgrade",
        "via"
      ];
      var forbiddenRequestMethods = [
        "TRACE",
        "TRACK",
        "CONNECT"
      ];
      var sendFlag = false;
      var errorFlag = false;
      var abortedFlag = false;
      var listeners = {};
      this.UNSENT = 0;
      this.OPENED = 1;
      this.HEADERS_RECEIVED = 2;
      this.LOADING = 3;
      this.DONE = 4;
      this.readyState = this.UNSENT;
      this.onreadystatechange = null;
      this.responseText = "";
      this.responseXML = "";
      this.response = Buffer.alloc(0);
      this.status = null;
      this.statusText = null;
      var isAllowedHttpHeader = function(header) {
        return disableHeaderCheck || header && forbiddenRequestHeaders.indexOf(header.toLowerCase()) === -1;
      };
      var isAllowedHttpMethod = function(method) {
        return method && forbiddenRequestMethods.indexOf(method) === -1;
      };
      this.open = function(method, url2, async, user, password) {
        this.abort();
        errorFlag = false;
        abortedFlag = false;
        if (!isAllowedHttpMethod(method)) {
          throw new Error("SecurityError: Request method not allowed");
        }
        settings = {
          "method": method,
          "url": url2.toString(),
          "async": typeof async !== "boolean" ? true : async,
          "user": user || null,
          "password": password || null
        };
        setState(this.OPENED);
      };
      this.setDisableHeaderCheck = function(state) {
        disableHeaderCheck = state;
      };
      this.setRequestHeader = function(header, value2) {
        if (this.readyState != this.OPENED) {
          throw new Error("INVALID_STATE_ERR: setRequestHeader can only be called when state is OPEN");
        }
        if (!isAllowedHttpHeader(header)) {
          console.warn('Refused to set unsafe header "' + header + '"');
          return false;
        }
        if (sendFlag) {
          throw new Error("INVALID_STATE_ERR: send flag is true");
        }
        headers[header] = value2;
        return true;
      };
      this.getResponseHeader = function(header) {
        if (typeof header === "string" && this.readyState > this.OPENED && response.headers[header.toLowerCase()] && !errorFlag) {
          return response.headers[header.toLowerCase()];
        }
        return null;
      };
      this.getAllResponseHeaders = function() {
        if (this.readyState < this.HEADERS_RECEIVED || errorFlag) {
          return "";
        }
        var result = "";
        for (var i2 in response.headers) {
          if (i2 !== "set-cookie" && i2 !== "set-cookie2") {
            result += i2 + ": " + response.headers[i2] + "\r\n";
          }
        }
        return result.substr(0, result.length - 2);
      };
      this.getRequestHeader = function(name) {
        if (typeof name === "string" && headers[name]) {
          return headers[name];
        }
        return "";
      };
      this.send = function(data) {
        if (this.readyState != this.OPENED) {
          throw new Error("INVALID_STATE_ERR: connection must be opened before send() is called");
        }
        if (sendFlag) {
          throw new Error("INVALID_STATE_ERR: send has already been called");
        }
        var ssl = false, local = false;
        var url2 = Url.parse(settings.url);
        var host;
        switch (url2.protocol) {
          case "https:":
            ssl = true;
          case "http:":
            host = url2.hostname;
            break;
          case "file:":
            local = true;
            break;
          case void 0:
          case "":
            host = "localhost";
            break;
          default:
            throw new Error("Protocol not supported.");
        }
        if (local) {
          if (settings.method !== "GET") {
            throw new Error("XMLHttpRequest: Only GET method is supported");
          }
          if (settings.async) {
            fs.readFile(unescape(url2.pathname), function(error2, data2) {
              if (error2) {
                self2.handleError(error2, error2.errno || -1);
              } else {
                self2.status = 200;
                self2.responseText = data2.toString("utf8");
                self2.response = data2;
                setState(self2.DONE);
              }
            });
          } else {
            try {
              this.response = fs.readFileSync(unescape(url2.pathname));
              this.responseText = this.response.toString("utf8");
              this.status = 200;
              setState(self2.DONE);
            } catch (e) {
              this.handleError(e, e.errno || -1);
            }
          }
          return;
        }
        var port = url2.port || (ssl ? 443 : 80);
        var uri = url2.pathname + (url2.search ? url2.search : "");
        headers["Host"] = host;
        if (!(ssl && port === 443 || port === 80)) {
          headers["Host"] += ":" + url2.port;
        }
        if (settings.user) {
          if (typeof settings.password == "undefined") {
            settings.password = "";
          }
          var authBuf = new Buffer(settings.user + ":" + settings.password);
          headers["Authorization"] = "Basic " + authBuf.toString("base64");
        }
        if (settings.method === "GET" || settings.method === "HEAD") {
          data = null;
        } else if (data) {
          headers["Content-Length"] = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);
          var headersKeys = Object.keys(headers);
          if (!headersKeys.some(function(h2) {
            return h2.toLowerCase() === "content-type";
          })) {
            headers["Content-Type"] = "text/plain;charset=UTF-8";
          }
        } else if (settings.method === "POST") {
          headers["Content-Length"] = 0;
        }
        var agent = opts.agent || false;
        var options = {
          host,
          port,
          path: uri,
          method: settings.method,
          headers,
          agent
        };
        if (ssl) {
          options.pfx = opts.pfx;
          options.key = opts.key;
          options.passphrase = opts.passphrase;
          options.cert = opts.cert;
          options.ca = opts.ca;
          options.ciphers = opts.ciphers;
          options.rejectUnauthorized = opts.rejectUnauthorized === false ? false : true;
        }
        errorFlag = false;
        if (settings.async) {
          var doRequest = ssl ? https.request : http.request;
          sendFlag = true;
          self2.dispatchEvent("readystatechange");
          var responseHandler = function(resp2) {
            response = resp2;
            if (response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307) {
              settings.url = response.headers.location;
              var url3 = Url.parse(settings.url);
              host = url3.hostname;
              var newOptions = {
                hostname: url3.hostname,
                port: url3.port,
                path: url3.path,
                method: response.statusCode === 303 ? "GET" : settings.method,
                headers
              };
              if (ssl) {
                newOptions.pfx = opts.pfx;
                newOptions.key = opts.key;
                newOptions.passphrase = opts.passphrase;
                newOptions.cert = opts.cert;
                newOptions.ca = opts.ca;
                newOptions.ciphers = opts.ciphers;
                newOptions.rejectUnauthorized = opts.rejectUnauthorized === false ? false : true;
              }
              request = doRequest(newOptions, responseHandler).on("error", errorHandler);
              request.end();
              return;
            }
            setState(self2.HEADERS_RECEIVED);
            self2.status = response.statusCode;
            response.on("data", function(chunk) {
              if (chunk) {
                var data2 = Buffer.from(chunk);
                self2.response = Buffer.concat([self2.response, data2]);
              }
              if (sendFlag) {
                setState(self2.LOADING);
              }
            });
            response.on("end", function() {
              if (sendFlag) {
                sendFlag = false;
                setState(self2.DONE);
                self2.responseText = self2.response.toString("utf8");
              }
            });
            response.on("error", function(error2) {
              self2.handleError(error2);
            });
          };
          var errorHandler = function(error2) {
            if (request.reusedSocket && error2.code === "ECONNRESET")
              return doRequest(options, responseHandler).on("error", errorHandler);
            self2.handleError(error2);
          };
          request = doRequest(options, responseHandler).on("error", errorHandler);
          if (opts.autoUnref) {
            request.on("socket", (socket) => {
              socket.unref();
            });
          }
          if (data) {
            request.write(data);
          }
          request.end();
          self2.dispatchEvent("loadstart");
        } else {
          var contentFile = ".node-xmlhttprequest-content-" + process.pid;
          var syncFile = ".node-xmlhttprequest-sync-" + process.pid;
          fs.writeFileSync(syncFile, "", "utf8");
          var execString = "var http = require('http'), https = require('https'), fs = require('fs');var doRequest = http" + (ssl ? "s" : "") + ".request;var options = " + JSON.stringify(options) + ";var responseText = '';var responseData = Buffer.alloc(0);var req = doRequest(options, function(response) {response.on('data', function(chunk) {  var data = Buffer.from(chunk);  responseText += data.toString('utf8');  responseData = Buffer.concat([responseData, data]);});response.on('end', function() {fs.writeFileSync('" + contentFile + "', JSON.stringify({err: null, data: {statusCode: response.statusCode, headers: response.headers, text: responseText, data: responseData.toString('base64')}}), 'utf8');fs.unlinkSync('" + syncFile + "');});response.on('error', function(error) {fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');fs.unlinkSync('" + syncFile + "');});}).on('error', function(error) {fs.writeFileSync('" + contentFile + "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');fs.unlinkSync('" + syncFile + "');});" + (data ? "req.write('" + JSON.stringify(data).slice(1, -1).replace(/'/g, "\\'") + "');" : "") + "req.end();";
          var syncProc = spawn(process.argv[0], ["-e", execString]);
          var statusText;
          while (fs.existsSync(syncFile)) {
          }
          self2.responseText = fs.readFileSync(contentFile, "utf8");
          syncProc.stdin.end();
          fs.unlinkSync(contentFile);
          if (self2.responseText.match(/^NODE-XMLHTTPREQUEST-ERROR:/)) {
            var errorObj = JSON.parse(self2.responseText.replace(/^NODE-XMLHTTPREQUEST-ERROR:/, ""));
            self2.handleError(errorObj, 503);
          } else {
            self2.status = self2.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:([0-9]*),.*/, "$1");
            var resp = JSON.parse(self2.responseText.replace(/^NODE-XMLHTTPREQUEST-STATUS:[0-9]*,(.*)/, "$1"));
            response = {
              statusCode: self2.status,
              headers: resp.data.headers
            };
            self2.responseText = resp.data.text;
            self2.response = Buffer.from(resp.data.data, "base64");
            setState(self2.DONE, true);
          }
        }
      };
      this.handleError = function(error2, status) {
        this.status = status || 0;
        this.statusText = error2;
        this.responseText = error2.stack;
        errorFlag = true;
        setState(this.DONE);
      };
      this.abort = function() {
        if (request) {
          request.abort();
          request = null;
        }
        headers = Object.assign({}, defaultHeaders);
        this.responseText = "";
        this.responseXML = "";
        this.response = Buffer.alloc(0);
        errorFlag = abortedFlag = true;
        if (this.readyState !== this.UNSENT && (this.readyState !== this.OPENED || sendFlag) && this.readyState !== this.DONE) {
          sendFlag = false;
          setState(this.DONE);
        }
        this.readyState = this.UNSENT;
      };
      this.addEventListener = function(event, callback) {
        if (!(event in listeners)) {
          listeners[event] = [];
        }
        listeners[event].push(callback);
      };
      this.removeEventListener = function(event, callback) {
        if (event in listeners) {
          listeners[event] = listeners[event].filter(function(ev) {
            return ev !== callback;
          });
        }
      };
      this.dispatchEvent = function(event) {
        if (typeof self2["on" + event] === "function") {
          if (this.readyState === this.DONE && settings.async)
            setTimeout(function() {
              self2["on" + event]();
            }, 0);
          else
            self2["on" + event]();
        }
        if (event in listeners) {
          for (let i2 = 0, len = listeners[event].length; i2 < len; i2++) {
            if (this.readyState === this.DONE)
              setTimeout(function() {
                listeners[event][i2].call(self2);
              }, 0);
            else
              listeners[event][i2].call(self2);
          }
        }
      };
      var setState = function(state) {
        if (self2.readyState === state || self2.readyState === self2.UNSENT && abortedFlag)
          return;
        self2.readyState = state;
        if (settings.async || self2.readyState < self2.OPENED || self2.readyState === self2.DONE) {
          self2.dispatchEvent("readystatechange");
        }
        if (self2.readyState === self2.DONE) {
          let fire;
          if (abortedFlag)
            fire = "abort";
          else if (errorFlag)
            fire = "error";
          else
            fire = "load";
          self2.dispatchEvent(fire);
          self2.dispatchEvent("loadend");
        }
      };
    }
  }
});

// node_modules/@socket.io/component-emitter/lib/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/@socket.io/component-emitter/lib/cjs/index.js"(exports2) {
    exports2.Emitter = Emitter7;
    function Emitter7(obj) {
      if (obj) return mixin(obj);
    }
    function mixin(obj) {
      for (var key in Emitter7.prototype) {
        obj[key] = Emitter7.prototype[key];
      }
      return obj;
    }
    Emitter7.prototype.on = Emitter7.prototype.addEventListener = function(event, fn2) {
      this._callbacks = this._callbacks || {};
      (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn2);
      return this;
    };
    Emitter7.prototype.once = function(event, fn2) {
      function on3() {
        this.off(event, on3);
        fn2.apply(this, arguments);
      }
      on3.fn = fn2;
      this.on(event, on3);
      return this;
    };
    Emitter7.prototype.off = Emitter7.prototype.removeListener = Emitter7.prototype.removeAllListeners = Emitter7.prototype.removeEventListener = function(event, fn2) {
      this._callbacks = this._callbacks || {};
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }
      var callbacks = this._callbacks["$" + event];
      if (!callbacks) return this;
      if (1 == arguments.length) {
        delete this._callbacks["$" + event];
        return this;
      }
      var cb;
      for (var i2 = 0; i2 < callbacks.length; i2++) {
        cb = callbacks[i2];
        if (cb === fn2 || cb.fn === fn2) {
          callbacks.splice(i2, 1);
          break;
        }
      }
      if (callbacks.length === 0) {
        delete this._callbacks["$" + event];
      }
      return this;
    };
    Emitter7.prototype.emit = function(event) {
      this._callbacks = this._callbacks || {};
      var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
      for (var i2 = 1; i2 < arguments.length; i2++) {
        args[i2 - 1] = arguments[i2];
      }
      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i2 = 0, len = callbacks.length; i2 < len; ++i2) {
          callbacks[i2].apply(this, args);
        }
      }
      return this;
    };
    Emitter7.prototype.emitReserved = Emitter7.prototype.emit;
    Emitter7.prototype.listeners = function(event) {
      this._callbacks = this._callbacks || {};
      return this._callbacks["$" + event] || [];
    };
    Emitter7.prototype.hasListeners = function(event) {
      return !!this.listeners(event).length;
    };
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports2, module2) {
    var s2 = 1e3;
    var m = s2 * 60;
    var h2 = m * 60;
    var d2 = h2 * 24;
    var w2 = d2 * 7;
    var y2 = d2 * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse4(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse4(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n2 = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n2 * y2;
        case "weeks":
        case "week":
        case "w":
          return n2 * w2;
        case "days":
        case "day":
        case "d":
          return n2 * d2;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n2 * h2;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n2 * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n2 * s2;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n2;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d2) {
        return Math.round(ms / d2) + "d";
      }
      if (msAbs >= h2) {
        return Math.round(ms / h2) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s2) {
        return Math.round(ms / s2) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d2) {
        return plural(ms, msAbs, d2, "day");
      }
      if (msAbs >= h2) {
        return plural(ms, msAbs, h2, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s2) {
        return plural(ms, msAbs, s2, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n2, name) {
      var isPlural = msAbs >= n2 * 1.5;
      return Math.round(ms / n2) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports2, module2) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce2;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash2 = 0;
        for (let i2 = 0; i2 < namespace.length; i2++) {
          hash2 = (hash2 << 5) - hash2 + namespace.charCodeAt(i2);
          hash2 |= 0;
        }
        return createDebug.colors[Math.abs(hash2) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug12(...args) {
          if (!debug12.enabled) {
            return;
          }
          const self2 = debug12;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self2.diff = ms;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self2, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self2, args);
          const logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug12.namespace = namespace;
        debug12.useColors = createDebug.useColors();
        debug12.color = createDebug.selectColor(namespace);
        debug12.extend = extend;
        debug12.destroy = createDebug.destroy;
        Object.defineProperty(debug12, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v2) => {
            enableOverride = v2;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug12);
        }
        return debug12;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce2(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports2, module2) {
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = localstorage();
    exports2.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports2.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c2 = "color: " + this.color;
      args.splice(1, 0, c2, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c2);
    }
    exports2.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports2.storage.setItem("debug", namespaces);
        } else {
          exports2.storage.removeItem("debug");
        }
      } catch (error2) {
      }
    }
    function load() {
      let r2;
      try {
        r2 = exports2.storage.getItem("debug") || exports2.storage.getItem("DEBUG");
      } catch (error2) {
      }
      if (!r2 && typeof process !== "undefined" && "env" in process) {
        r2 = process.env.DEBUG;
      }
      return r2;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error2) {
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.j = function(v2) {
      try {
        return JSON.stringify(v2);
      } catch (error2) {
        return "[UnexpectedJSONParseError]: " + error2.message;
      }
    };
  }
});

// ../../node_modules/has-flag/index.js
var require_has_flag = __commonJS({
  "../../node_modules/has-flag/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (flag, argv) => {
      argv = argv || process.argv;
      const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
      const pos = argv.indexOf(prefix + flag);
      const terminatorPos = argv.indexOf("--");
      return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
    };
  }
});

// ../../node_modules/supports-color/index.js
var require_supports_color = __commonJS({
  "../../node_modules/supports-color/index.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var hasFlag = require_has_flag();
    var env = process.env;
    var forceColor;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false")) {
      forceColor = false;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = true;
    }
    if ("FORCE_COLOR" in env) {
      forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(stream) {
      if (forceColor === false) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (stream && !stream.isTTY && forceColor !== true) {
        return 0;
      }
      const min = forceColor ? 1 : 0;
      if (process.platform === "win32") {
        const osRelease = os.release().split(".");
        if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }
      if (env.COLORTERM === "truecolor") {
        return 3;
      }
      if ("TERM_PROGRAM" in env) {
        const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env.TERM_PROGRAM) {
          case "iTerm.app":
            return version >= 3 ? 3 : 2;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env) {
        return 1;
      }
      if (env.TERM === "dumb") {
        return min;
      }
      return min;
    }
    function getSupportLevel(stream) {
      const level = supportsColor(stream);
      return translateLevel(level);
    }
    module2.exports = {
      supportsColor: getSupportLevel,
      stdout: getSupportLevel(process.stdout),
      stderr: getSupportLevel(process.stderr)
    };
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports2, module2) {
    var tty = require("tty");
    var util2 = require("util");
    exports2.init = init2;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.destroy = util2.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports2.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = require_supports_color();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports2.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error2) {
    }
    exports2.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_2, k2) => {
        return k2.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c2 = this.color;
        const colorCode = "\x1B[3" + (c2 < 8 ? c2 : "8;5;" + c2);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports2.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util2.formatWithOptions(exports2.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init2(debug12) {
      debug12.inspectOpts = {};
      const keys2 = Object.keys(exports2.inspectOpts);
      for (let i2 = 0; i2 < keys2.length; i2++) {
        debug12.inspectOpts[keys2[i2]] = exports2.inspectOpts[keys2[i2]];
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.o = function(v2) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v2, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v2) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v2, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports2, module2) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength2) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength2);
      let offset = 0;
      for (let i2 = 0; i2 < list.length; i2++) {
        const buf = list[i2];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength2) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i2 = 0; i2 < length; i2++) {
        output[offset + i2] = source[i2] ^ mask[i2 & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i2 = 0; i2 < buffer.length; i2++) {
        buffer[i2] ^= mask[i2 & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer2(data) {
      toBuffer2.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer2.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer: toBuffer2,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value2 = params[key];
            if (value2.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value2 = value2[0];
            if (key === "client_max_window_bits") {
              if (value2 !== true) {
                const num = +value2;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value2}`
                  );
                }
                value2 = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value2}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value2;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value2}`
                );
              }
              value2 = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value2 !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value2}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value2;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i2 = 0;
      while (i2 < len) {
        if ((buf[i2] & 128) === 0) {
          i2++;
        } else if ((buf[i2] & 224) === 192) {
          if (i2 + 1 === len || (buf[i2 + 1] & 192) !== 128 || (buf[i2] & 254) === 192) {
            return false;
          }
          i2 += 2;
        } else if ((buf[i2] & 240) === 224) {
          if (i2 + 2 >= len || (buf[i2 + 1] & 192) !== 128 || (buf[i2 + 2] & 192) !== 128 || buf[i2] === 224 && (buf[i2 + 1] & 224) === 128 || // Overlong
          buf[i2] === 237 && (buf[i2 + 1] & 224) === 160) {
            return false;
          }
          i2 += 3;
        } else if ((buf[i2] & 248) === 240) {
          if (i2 + 3 >= len || (buf[i2 + 1] & 192) !== 128 || (buf[i2 + 2] & 192) !== 128 || (buf[i2 + 3] & 192) !== 128 || buf[i2] === 240 && (buf[i2 + 1] & 240) === 128 || // Overlong
          buf[i2] === 244 && buf[i2 + 1] > 143 || buf[i2] > 244) {
            return false;
          }
          i2 += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value2) {
      return hasBlob && typeof value2 === "object" && typeof value2.arrayBuffer === "function" && typeof value2.type === "string" && typeof value2.stream === "function" && (value2[Symbol.toStringTag] === "Blob" || value2[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n2) {
        this._bufferedBytes -= n2;
        if (n2 === this._buffers[0].length) return this._buffers.shift();
        if (n2 < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n2,
            buf.length - n2
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n2);
        }
        const dst = Buffer.allocUnsafe(n2);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n2;
          if (n2 >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n2), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n2,
              buf.length - n2
            );
          }
          n2 -= buf.length;
        } while (n2 > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error2 = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error2);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error2 = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error2);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error2 = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error2);
            return;
          }
          if (!this._fragmented) {
            const error2 = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error2);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error2 = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error2);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error2 = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error2);
            return;
          }
          if (compressed) {
            const error2 = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error2);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error2 = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error2);
            return;
          }
        } else {
          const error2 = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error2);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error2 = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error2);
            return;
          }
        } else if (this._masked) {
          const error2 = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error2);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error2 = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error2);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error2 = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error2);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error2 = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error2);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error2 = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error2);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error2 = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error2);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error2 = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error2);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error2 = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error2);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer: toBuffer2 } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength2;
        let readOnly;
        if (typeof data === "string") {
          byteLength2 = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength2 = data.size;
          readOnly = false;
        } else {
          data = toBuffer2(data);
          byteLength2 = data.length;
          readOnly = toBuffer2.readOnly;
        }
        if (byteLength2 > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength2,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength2;
        let readOnly;
        if (typeof data === "string") {
          byteLength2 = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength2 = data.size;
          readOnly = false;
        } else {
          data = toBuffer2(data);
          byteLength2 = data.length;
          readOnly = toBuffer2.readOnly;
        }
        if (byteLength2 > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength2,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength2;
        let readOnly;
        if (typeof data === "string") {
          byteLength2 = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength2 = data.size;
          readOnly = false;
        } else {
          data = toBuffer2(data);
          byteLength2 = data.length;
          readOnly = toBuffer2.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength2 >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength2,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer2(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_2, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i2 = 0; i2 < sender._queue.length; i2++) {
        const params = sender._queue[i2];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary2) {
            const event = new MessageEvent("message", {
              data: isBinary2 ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error2) {
            const event = new ErrorEvent("error", {
              error: error2,
              message: error2.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse4(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i2 = 0;
      for (; i2 < header.length; i2++) {
        code = header.charCodeAt(i2);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i2;
          } else if (i2 !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i2;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i2}`);
            }
            if (end === -1) end = i2;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i2}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i2;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i2;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i2}`);
            }
            if (end === -1) end = i2;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i2);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i2}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i2}`);
            }
            if (start === -1) start = i2;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i2;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i2;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i2}`);
            }
          } else if (code === 34 && header.charCodeAt(i2 - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i2;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i2;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i2}`);
            }
            if (end === -1) end = i2;
            let value2 = header.slice(start, end);
            if (mustUnescape) {
              value2 = value2.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value2);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i2}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i2;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k2) => {
              let values = params[k2];
              if (!Array.isArray(values)) values = [values];
              return values.map((v2) => v2 === true ? k2 : `${k2}=${v2}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse: parse4 };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL: URL2 } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener: addEventListener2, removeEventListener: removeEventListener2 }
    } = require_event_target();
    var { format, parse: parse4 } = require_extension();
    var { toBuffer: toBuffer2 } = require_buffer_util();
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener2;
    WebSocket2.prototype.removeEventListener = removeEventListener2;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol4 of protocols) {
          if (typeof protocol4 !== "string" || !subprotocolRegex.test(protocol4) || protocolSet.has(protocol4)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol4);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts2 = opts.path.split(":");
        opts.socketPath = parts2[0];
        opts.path = parts2[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value2] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value2;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location2 = res.headers.location;
        const statusCode = res.statusCode;
        if (location2 && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location2, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location2}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse4(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer2(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary2) {
      this[kWebSocket].emit("message", data, isBinary2);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary2) {
        const data = !isBinary2 && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error2(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error2(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse4(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i2 = 0;
      for (i2; i2 < header.length; i2++) {
        const code = header.charCodeAt(i2);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i2;
        } else if (i2 !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i2;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i2}`);
          }
          if (end === -1) end = i2;
          const protocol5 = header.slice(start, end);
          if (protocols.has(protocol5)) {
            throw new SyntaxError(`The "${protocol5}" subprotocol is duplicated`);
          }
          protocols.add(protocol5);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i2}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol4 = header.slice(start, i2);
      if (protocols.has(protocol4)) {
        throw new SyntaxError(`The "${protocol4}" subprotocol is duplicated`);
      }
      protocols.add(protocol4);
      return protocols;
    }
    module2.exports = { parse: parse4 };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http = require("http");
    var { Duplex } = require("stream");
    var { createHash } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info2 = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info2, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info2)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol4 = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol4) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol4}`);
            ws._protocol = protocol4;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value2 = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value2}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h2) => `${h2}: ${headers[h2]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// node_modules/setimmediate/setImmediate.js
var require_setImmediate = __commonJS({
  "node_modules/setimmediate/setImmediate.js"(exports2) {
    (function(global2, undefined2) {
      "use strict";
      if (global2.setImmediate) {
        return;
      }
      var nextHandle = 1;
      var tasksByHandle = {};
      var currentlyRunningATask = false;
      var doc = global2.document;
      var registerImmediate;
      function setImmediate2(callback) {
        if (typeof callback !== "function") {
          callback = new Function("" + callback);
        }
        var args = new Array(arguments.length - 1);
        for (var i2 = 0; i2 < args.length; i2++) {
          args[i2] = arguments[i2 + 1];
        }
        var task = { callback, args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
      }
      function clearImmediate(handle) {
        delete tasksByHandle[handle];
      }
      function run2(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
          case 0:
            callback();
            break;
          case 1:
            callback(args[0]);
            break;
          case 2:
            callback(args[0], args[1]);
            break;
          case 3:
            callback(args[0], args[1], args[2]);
            break;
          default:
            callback.apply(undefined2, args);
            break;
        }
      }
      function runIfPresent(handle) {
        if (currentlyRunningATask) {
          setTimeout(runIfPresent, 0, handle);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunningATask = true;
            try {
              run2(task);
            } finally {
              clearImmediate(handle);
              currentlyRunningATask = false;
            }
          }
        }
      }
      function installNextTickImplementation() {
        registerImmediate = function(handle) {
          process.nextTick(function() {
            runIfPresent(handle);
          });
        };
      }
      function canUsePostMessage() {
        if (global2.postMessage && !global2.importScripts) {
          var postMessageIsAsynchronous = true;
          var oldOnMessage = global2.onmessage;
          global2.onmessage = function() {
            postMessageIsAsynchronous = false;
          };
          global2.postMessage("", "*");
          global2.onmessage = oldOnMessage;
          return postMessageIsAsynchronous;
        }
      }
      function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
          if (event.source === global2 && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
            runIfPresent(+event.data.slice(messagePrefix.length));
          }
        };
        if (global2.addEventListener) {
          global2.addEventListener("message", onGlobalMessage, false);
        } else {
          global2.attachEvent("onmessage", onGlobalMessage);
        }
        registerImmediate = function(handle) {
          global2.postMessage(messagePrefix + handle, "*");
        };
      }
      function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
          var handle = event.data;
          runIfPresent(handle);
        };
        registerImmediate = function(handle) {
          channel.port2.postMessage(handle);
        };
      }
      function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
          var script = doc.createElement("script");
          script.onreadystatechange = function() {
            runIfPresent(handle);
            script.onreadystatechange = null;
            html.removeChild(script);
            script = null;
          };
          html.appendChild(script);
        };
      }
      function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
          setTimeout(runIfPresent, 0, handle);
        };
      }
      var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global2);
      attachTo = attachTo && attachTo.setTimeout ? attachTo : global2;
      if ({}.toString.call(global2.process) === "[object process]") {
        installNextTickImplementation();
      } else if (canUsePostMessage()) {
        installPostMessageImplementation();
      } else if (global2.MessageChannel) {
        installMessageChannelImplementation();
      } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        installReadyStateChangeImplementation();
      } else {
        installSetTimeoutImplementation();
      }
      attachTo.setImmediate = setImmediate2;
      attachTo.clearImmediate = clearImmediate;
    })(typeof self === "undefined" ? typeof global === "undefined" ? exports2 : global : self);
  }
});

// src/ai/serverBotRunner.js
var serverBotRunner_exports = {};
__export(serverBotRunner_exports, {
  createKredBotManager: () => createKredBotManager
});
module.exports = __toCommonJS(serverBotRunner_exports);

// node_modules/immer/dist/immer.esm.mjs
function n(n2) {
  for (var r2 = arguments.length, t2 = Array(r2 > 1 ? r2 - 1 : 0), e = 1; e < r2; e++) t2[e - 1] = arguments[e];
  if ("production" !== process.env.NODE_ENV) {
    var i2 = Y[n2], o2 = i2 ? "function" == typeof i2 ? i2.apply(null, t2) : i2 : "unknown error nr: " + n2;
    throw Error("[Immer] " + o2);
  }
  throw Error("[Immer] minified error nr: " + n2 + (t2.length ? " " + t2.map(function(n3) {
    return "'" + n3 + "'";
  }).join(",") : "") + ". Find the full error at: https://bit.ly/3cXEKWf");
}
function r(n2) {
  return !!n2 && !!n2[Q];
}
function t(n2) {
  var r2;
  return !!n2 && (function(n3) {
    if (!n3 || "object" != typeof n3) return false;
    var r3 = Object.getPrototypeOf(n3);
    if (null === r3) return true;
    var t2 = Object.hasOwnProperty.call(r3, "constructor") && r3.constructor;
    return t2 === Object || "function" == typeof t2 && Function.toString.call(t2) === Z;
  }(n2) || Array.isArray(n2) || !!n2[L] || !!(null === (r2 = n2.constructor) || void 0 === r2 ? void 0 : r2[L]) || s(n2) || v(n2));
}
function i(n2, r2, t2) {
  void 0 === t2 && (t2 = false), 0 === o(n2) ? (t2 ? Object.keys : nn)(n2).forEach(function(e) {
    t2 && "symbol" == typeof e || r2(e, n2[e], n2);
  }) : n2.forEach(function(t3, e) {
    return r2(e, t3, n2);
  });
}
function o(n2) {
  var r2 = n2[Q];
  return r2 ? r2.i > 3 ? r2.i - 4 : r2.i : Array.isArray(n2) ? 1 : s(n2) ? 2 : v(n2) ? 3 : 0;
}
function u(n2, r2) {
  return 2 === o(n2) ? n2.has(r2) : Object.prototype.hasOwnProperty.call(n2, r2);
}
function a(n2, r2) {
  return 2 === o(n2) ? n2.get(r2) : n2[r2];
}
function f(n2, r2, t2) {
  var e = o(n2);
  2 === e ? n2.set(r2, t2) : 3 === e ? n2.add(t2) : n2[r2] = t2;
}
function c(n2, r2) {
  return n2 === r2 ? 0 !== n2 || 1 / n2 == 1 / r2 : n2 != n2 && r2 != r2;
}
function s(n2) {
  return X && n2 instanceof Map;
}
function v(n2) {
  return q && n2 instanceof Set;
}
function p(n2) {
  return n2.o || n2.t;
}
function l(n2) {
  if (Array.isArray(n2)) return Array.prototype.slice.call(n2);
  var r2 = rn(n2);
  delete r2[Q];
  for (var t2 = nn(r2), e = 0; e < t2.length; e++) {
    var i2 = t2[e], o2 = r2[i2];
    false === o2.writable && (o2.writable = true, o2.configurable = true), (o2.get || o2.set) && (r2[i2] = { configurable: true, writable: true, enumerable: o2.enumerable, value: n2[i2] });
  }
  return Object.create(Object.getPrototypeOf(n2), r2);
}
function d(n2, e) {
  return void 0 === e && (e = false), y(n2) || r(n2) || !t(n2) || (o(n2) > 1 && (n2.set = n2.add = n2.clear = n2.delete = h), Object.freeze(n2), e && i(n2, function(n3, r2) {
    return d(r2, true);
  }, true)), n2;
}
function h() {
  n(2);
}
function y(n2) {
  return null == n2 || "object" != typeof n2 || Object.isFrozen(n2);
}
function b(r2) {
  var t2 = tn[r2];
  return t2 || n(18, r2), t2;
}
function _() {
  return "production" === process.env.NODE_ENV || U || n(0), U;
}
function j(n2, r2) {
  r2 && (b("Patches"), n2.u = [], n2.s = [], n2.v = r2);
}
function g(n2) {
  O(n2), n2.p.forEach(S), n2.p = null;
}
function O(n2) {
  n2 === U && (U = n2.l);
}
function w(n2) {
  return U = { p: [], l: U, h: n2, m: true, _: 0 };
}
function S(n2) {
  var r2 = n2[Q];
  0 === r2.i || 1 === r2.i ? r2.j() : r2.g = true;
}
function P(r2, e) {
  e._ = e.p.length;
  var i2 = e.p[0], o2 = void 0 !== r2 && r2 !== i2;
  return e.h.O || b("ES5").S(e, r2, o2), o2 ? (i2[Q].P && (g(e), n(4)), t(r2) && (r2 = M(e, r2), e.l || x(e, r2)), e.u && b("Patches").M(i2[Q].t, r2, e.u, e.s)) : r2 = M(e, i2, []), g(e), e.u && e.v(e.u, e.s), r2 !== H ? r2 : void 0;
}
function M(n2, r2, t2) {
  if (y(r2)) return r2;
  var e = r2[Q];
  if (!e) return i(r2, function(i2, o3) {
    return A(n2, e, r2, i2, o3, t2);
  }, true), r2;
  if (e.A !== n2) return r2;
  if (!e.P) return x(n2, e.t, true), e.t;
  if (!e.I) {
    e.I = true, e.A._--;
    var o2 = 4 === e.i || 5 === e.i ? e.o = l(e.k) : e.o, u2 = o2, a2 = false;
    3 === e.i && (u2 = new Set(o2), o2.clear(), a2 = true), i(u2, function(r3, i2) {
      return A(n2, e, o2, r3, i2, t2, a2);
    }), x(n2, o2, false), t2 && n2.u && b("Patches").N(e, t2, n2.u, n2.s);
  }
  return e.o;
}
function A(e, i2, o2, a2, c2, s2, v2) {
  if ("production" !== process.env.NODE_ENV && c2 === o2 && n(5), r(c2)) {
    var p2 = M(e, c2, s2 && i2 && 3 !== i2.i && !u(i2.R, a2) ? s2.concat(a2) : void 0);
    if (f(o2, a2, p2), !r(p2)) return;
    e.m = false;
  } else v2 && o2.add(c2);
  if (t(c2) && !y(c2)) {
    if (!e.h.D && e._ < 1) return;
    M(e, c2), i2 && i2.A.l || x(e, c2);
  }
}
function x(n2, r2, t2) {
  void 0 === t2 && (t2 = false), !n2.l && n2.h.D && n2.m && d(r2, t2);
}
function z(n2, r2) {
  var t2 = n2[Q];
  return (t2 ? p(t2) : n2)[r2];
}
function I(n2, r2) {
  if (r2 in n2) for (var t2 = Object.getPrototypeOf(n2); t2; ) {
    var e = Object.getOwnPropertyDescriptor(t2, r2);
    if (e) return e;
    t2 = Object.getPrototypeOf(t2);
  }
}
function k(n2) {
  n2.P || (n2.P = true, n2.l && k(n2.l));
}
function E(n2) {
  n2.o || (n2.o = l(n2.t));
}
function N(n2, r2, t2) {
  var e = s(r2) ? b("MapSet").F(r2, t2) : v(r2) ? b("MapSet").T(r2, t2) : n2.O ? function(n3, r3) {
    var t3 = Array.isArray(n3), e2 = { i: t3 ? 1 : 0, A: r3 ? r3.A : _(), P: false, I: false, R: {}, l: r3, t: n3, k: null, o: null, j: null, C: false }, i2 = e2, o2 = en;
    t3 && (i2 = [e2], o2 = on);
    var u2 = Proxy.revocable(i2, o2), a2 = u2.revoke, f2 = u2.proxy;
    return e2.k = f2, e2.j = a2, f2;
  }(r2, t2) : b("ES5").J(r2, t2);
  return (t2 ? t2.A : _()).p.push(e), e;
}
function R(e) {
  return r(e) || n(22, e), function n2(r2) {
    if (!t(r2)) return r2;
    var e2, u2 = r2[Q], c2 = o(r2);
    if (u2) {
      if (!u2.P && (u2.i < 4 || !b("ES5").K(u2))) return u2.t;
      u2.I = true, e2 = D(r2, c2), u2.I = false;
    } else e2 = D(r2, c2);
    return i(e2, function(r3, t2) {
      u2 && a(u2.t, r3) === t2 || f(e2, r3, n2(t2));
    }), 3 === c2 ? new Set(e2) : e2;
  }(e);
}
function D(n2, r2) {
  switch (r2) {
    case 2:
      return new Map(n2);
    case 3:
      return Array.from(n2);
  }
  return l(n2);
}
var G;
var U;
var W = "undefined" != typeof Symbol && "symbol" == typeof Symbol("x");
var X = "undefined" != typeof Map;
var q = "undefined" != typeof Set;
var B = "undefined" != typeof Proxy && void 0 !== Proxy.revocable && "undefined" != typeof Reflect;
var H = W ? Symbol.for("immer-nothing") : ((G = {})["immer-nothing"] = true, G);
var L = W ? Symbol.for("immer-draftable") : "__$immer_draftable";
var Q = W ? Symbol.for("immer-state") : "__$immer_state";
var Y = { 0: "Illegal state", 1: "Immer drafts cannot have computed properties", 2: "This object has been frozen and should not be mutated", 3: function(n2) {
  return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + n2;
}, 4: "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.", 5: "Immer forbids circular references", 6: "The first or second argument to `produce` must be a function", 7: "The third argument to `produce` must be a function or undefined", 8: "First argument to `createDraft` must be a plain object, an array, or an immerable object", 9: "First argument to `finishDraft` must be a draft returned by `createDraft`", 10: "The given draft is already finalized", 11: "Object.defineProperty() cannot be used on an Immer draft", 12: "Object.setPrototypeOf() cannot be used on an Immer draft", 13: "Immer only supports deleting array indices", 14: "Immer only supports setting array indices and the 'length' property", 15: function(n2) {
  return "Cannot apply patch, path doesn't resolve: " + n2;
}, 16: 'Sets cannot have "replace" patches.', 17: function(n2) {
  return "Unsupported patch operation: " + n2;
}, 18: function(n2) {
  return "The plugin for '" + n2 + "' has not been loaded into Immer. To enable the plugin, import and call `enable" + n2 + "()` when initializing your application.";
}, 20: "Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available", 21: function(n2) {
  return "produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '" + n2 + "'";
}, 22: function(n2) {
  return "'current' expects a draft, got: " + n2;
}, 23: function(n2) {
  return "'original' expects a draft, got: " + n2;
}, 24: "Patching reserved attributes like __proto__, prototype and constructor is not allowed" };
var Z = "" + Object.prototype.constructor;
var nn = "undefined" != typeof Reflect && Reflect.ownKeys ? Reflect.ownKeys : void 0 !== Object.getOwnPropertySymbols ? function(n2) {
  return Object.getOwnPropertyNames(n2).concat(Object.getOwnPropertySymbols(n2));
} : Object.getOwnPropertyNames;
var rn = Object.getOwnPropertyDescriptors || function(n2) {
  var r2 = {};
  return nn(n2).forEach(function(t2) {
    r2[t2] = Object.getOwnPropertyDescriptor(n2, t2);
  }), r2;
};
var tn = {};
var en = { get: function(n2, r2) {
  if (r2 === Q) return n2;
  var e = p(n2);
  if (!u(e, r2)) return function(n3, r3, t2) {
    var e2, i3 = I(r3, t2);
    return i3 ? "value" in i3 ? i3.value : null === (e2 = i3.get) || void 0 === e2 ? void 0 : e2.call(n3.k) : void 0;
  }(n2, e, r2);
  var i2 = e[r2];
  return n2.I || !t(i2) ? i2 : i2 === z(n2.t, r2) ? (E(n2), n2.o[r2] = N(n2.A.h, i2, n2)) : i2;
}, has: function(n2, r2) {
  return r2 in p(n2);
}, ownKeys: function(n2) {
  return Reflect.ownKeys(p(n2));
}, set: function(n2, r2, t2) {
  var e = I(p(n2), r2);
  if (null == e ? void 0 : e.set) return e.set.call(n2.k, t2), true;
  if (!n2.P) {
    var i2 = z(p(n2), r2), o2 = null == i2 ? void 0 : i2[Q];
    if (o2 && o2.t === t2) return n2.o[r2] = t2, n2.R[r2] = false, true;
    if (c(t2, i2) && (void 0 !== t2 || u(n2.t, r2))) return true;
    E(n2), k(n2);
  }
  return n2.o[r2] === t2 && (void 0 !== t2 || r2 in n2.o) || Number.isNaN(t2) && Number.isNaN(n2.o[r2]) || (n2.o[r2] = t2, n2.R[r2] = true), true;
}, deleteProperty: function(n2, r2) {
  return void 0 !== z(n2.t, r2) || r2 in n2.t ? (n2.R[r2] = false, E(n2), k(n2)) : delete n2.R[r2], n2.o && delete n2.o[r2], true;
}, getOwnPropertyDescriptor: function(n2, r2) {
  var t2 = p(n2), e = Reflect.getOwnPropertyDescriptor(t2, r2);
  return e ? { writable: true, configurable: 1 !== n2.i || "length" !== r2, enumerable: e.enumerable, value: t2[r2] } : e;
}, defineProperty: function() {
  n(11);
}, getPrototypeOf: function(n2) {
  return Object.getPrototypeOf(n2.t);
}, setPrototypeOf: function() {
  n(12);
} };
var on = {};
i(en, function(n2, r2) {
  on[n2] = function() {
    return arguments[0] = arguments[0][0], r2.apply(this, arguments);
  };
}), on.deleteProperty = function(r2, t2) {
  return "production" !== process.env.NODE_ENV && isNaN(parseInt(t2)) && n(13), on.set.call(this, r2, t2, void 0);
}, on.set = function(r2, t2, e) {
  return "production" !== process.env.NODE_ENV && "length" !== t2 && isNaN(parseInt(t2)) && n(14), en.set.call(this, r2[0], t2, e, r2[0]);
};
var un = function() {
  function e(r2) {
    var e2 = this;
    this.O = B, this.D = true, this.produce = function(r3, i3, o2) {
      if ("function" == typeof r3 && "function" != typeof i3) {
        var u2 = i3;
        i3 = r3;
        var a2 = e2;
        return function(n2) {
          var r4 = this;
          void 0 === n2 && (n2 = u2);
          for (var t2 = arguments.length, e3 = Array(t2 > 1 ? t2 - 1 : 0), o3 = 1; o3 < t2; o3++) e3[o3 - 1] = arguments[o3];
          return a2.produce(n2, function(n3) {
            var t3;
            return (t3 = i3).call.apply(t3, [r4, n3].concat(e3));
          });
        };
      }
      var f2;
      if ("function" != typeof i3 && n(6), void 0 !== o2 && "function" != typeof o2 && n(7), t(r3)) {
        var c2 = w(e2), s2 = N(e2, r3, void 0), v2 = true;
        try {
          f2 = i3(s2), v2 = false;
        } finally {
          v2 ? g(c2) : O(c2);
        }
        return "undefined" != typeof Promise && f2 instanceof Promise ? f2.then(function(n2) {
          return j(c2, o2), P(n2, c2);
        }, function(n2) {
          throw g(c2), n2;
        }) : (j(c2, o2), P(f2, c2));
      }
      if (!r3 || "object" != typeof r3) {
        if (void 0 === (f2 = i3(r3)) && (f2 = r3), f2 === H && (f2 = void 0), e2.D && d(f2, true), o2) {
          var p2 = [], l2 = [];
          b("Patches").M(r3, f2, p2, l2), o2(p2, l2);
        }
        return f2;
      }
      n(21, r3);
    }, this.produceWithPatches = function(n2, r3) {
      if ("function" == typeof n2) return function(r4) {
        for (var t3 = arguments.length, i4 = Array(t3 > 1 ? t3 - 1 : 0), o3 = 1; o3 < t3; o3++) i4[o3 - 1] = arguments[o3];
        return e2.produceWithPatches(r4, function(r5) {
          return n2.apply(void 0, [r5].concat(i4));
        });
      };
      var t2, i3, o2 = e2.produce(n2, r3, function(n3, r4) {
        t2 = n3, i3 = r4;
      });
      return "undefined" != typeof Promise && o2 instanceof Promise ? o2.then(function(n3) {
        return [n3, t2, i3];
      }) : [o2, t2, i3];
    }, "boolean" == typeof (null == r2 ? void 0 : r2.useProxies) && this.setUseProxies(r2.useProxies), "boolean" == typeof (null == r2 ? void 0 : r2.autoFreeze) && this.setAutoFreeze(r2.autoFreeze);
  }
  var i2 = e.prototype;
  return i2.createDraft = function(e2) {
    t(e2) || n(8), r(e2) && (e2 = R(e2));
    var i3 = w(this), o2 = N(this, e2, void 0);
    return o2[Q].C = true, O(i3), o2;
  }, i2.finishDraft = function(r2, t2) {
    var e2 = r2 && r2[Q];
    "production" !== process.env.NODE_ENV && (e2 && e2.C || n(9), e2.I && n(10));
    var i3 = e2.A;
    return j(i3, t2), P(void 0, i3);
  }, i2.setAutoFreeze = function(n2) {
    this.D = n2;
  }, i2.setUseProxies = function(r2) {
    r2 && !B && n(20), this.O = r2;
  }, i2.applyPatches = function(n2, t2) {
    var e2;
    for (e2 = t2.length - 1; e2 >= 0; e2--) {
      var i3 = t2[e2];
      if (0 === i3.path.length && "replace" === i3.op) {
        n2 = i3.value;
        break;
      }
    }
    e2 > -1 && (t2 = t2.slice(e2 + 1));
    var o2 = b("Patches").$;
    return r(n2) ? o2(n2, t2) : this.produce(n2, function(n3) {
      return o2(n3, t2);
    });
  }, e;
}();
var an = new un();
var fn = an.produce;
var cn = an.produceWithPatches.bind(an);
var sn = an.setAutoFreeze.bind(an);
var vn = an.setUseProxies.bind(an);
var pn = an.applyPatches.bind(an);
var ln = an.createDraft.bind(an);
var dn = an.finishDraft.bind(an);
var immer_esm_default = fn;

// node_modules/boardgame.io/dist/esm/plugin-random-087f861e.js
var Alea = class {
  constructor(seed) {
    const mash = Mash();
    this.c = 1;
    this.s0 = mash(" ");
    this.s1 = mash(" ");
    this.s2 = mash(" ");
    this.s0 -= mash(seed);
    if (this.s0 < 0) {
      this.s0 += 1;
    }
    this.s1 -= mash(seed);
    if (this.s1 < 0) {
      this.s1 += 1;
    }
    this.s2 -= mash(seed);
    if (this.s2 < 0) {
      this.s2 += 1;
    }
  }
  next() {
    const t2 = 2091639 * this.s0 + this.c * 23283064365386963e-26;
    this.s0 = this.s1;
    this.s1 = this.s2;
    return this.s2 = t2 - (this.c = Math.trunc(t2));
  }
};
function Mash() {
  let n2 = 4022871197;
  const mash = function(data) {
    const str = data.toString();
    for (let i2 = 0; i2 < str.length; i2++) {
      n2 += str.charCodeAt(i2);
      let h2 = 0.02519603282416938 * n2;
      n2 = h2 >>> 0;
      h2 -= n2;
      h2 *= n2;
      n2 = h2 >>> 0;
      h2 -= n2;
      n2 += h2 * 4294967296;
    }
    return (n2 >>> 0) * 23283064365386963e-26;
  };
  return mash;
}
function copy(f2, t2) {
  t2.c = f2.c;
  t2.s0 = f2.s0;
  t2.s1 = f2.s1;
  t2.s2 = f2.s2;
  return t2;
}
function alea(seed, state) {
  const xg = new Alea(seed);
  const prng = xg.next.bind(xg);
  if (state)
    copy(state, xg);
  prng.state = () => copy(xg, {});
  return prng;
}
var Random = class {
  /**
   * constructor
   * @param {object} ctx - The ctx object to initialize from.
   */
  constructor(state) {
    this.state = state || { seed: "0" };
    this.used = false;
  }
  /**
   * Generates a new seed from the current date / time.
   */
  static seed() {
    return Date.now().toString(36).slice(-10);
  }
  isUsed() {
    return this.used;
  }
  getState() {
    return this.state;
  }
  /**
   * Generate a random number.
   */
  _random() {
    this.used = true;
    const R2 = this.state;
    const seed = R2.prngstate ? "" : R2.seed;
    const rand = alea(seed, R2.prngstate);
    const number = rand();
    this.state = {
      ...R2,
      prngstate: rand.state()
    };
    return number;
  }
  api() {
    const random = this._random.bind(this);
    const SpotValue = {
      D4: 4,
      D6: 6,
      D8: 8,
      D10: 10,
      D12: 12,
      D20: 20
    };
    const predefined = {};
    for (const key in SpotValue) {
      const spotvalue = SpotValue[key];
      predefined[key] = (diceCount) => {
        return diceCount === void 0 ? Math.floor(random() * spotvalue) + 1 : Array.from({ length: diceCount }).map(() => Math.floor(random() * spotvalue) + 1);
      };
    }
    function Die(spotvalue = 6, diceCount) {
      return diceCount === void 0 ? Math.floor(random() * spotvalue) + 1 : Array.from({ length: diceCount }).map(() => Math.floor(random() * spotvalue) + 1);
    }
    return {
      /**
       * Similar to Die below, but with fixed spot values.
       * Supports passing a diceCount
       *    if not defined, defaults to 1 and returns the value directly.
       *    if defined, returns an array containing the random dice values.
       *
       * D4: (diceCount) => value
       * D6: (diceCount) => value
       * D8: (diceCount) => value
       * D10: (diceCount) => value
       * D12: (diceCount) => value
       * D20: (diceCount) => value
       */
      ...predefined,
      /**
       * Roll a die of specified spot value.
       *
       * @param {number} spotvalue - The die dimension (default: 6).
       * @param {number} diceCount - number of dice to throw.
       *                             if not defined, defaults to 1 and returns the value directly.
       *                             if defined, returns an array containing the random dice values.
       */
      Die,
      /**
       * Generate a random number between 0 and 1.
       */
      Number: () => {
        return random();
      },
      /**
       * Shuffle an array.
       *
       * @param {Array} deck - The array to shuffle. Does not mutate
       *                       the input, but returns the shuffled array.
       */
      Shuffle: (deck) => {
        const clone = [...deck];
        let sourceIndex = deck.length;
        let destinationIndex = 0;
        const shuffled = Array.from({ length: sourceIndex });
        while (sourceIndex) {
          const randomIndex = Math.trunc(sourceIndex * random());
          shuffled[destinationIndex++] = clone[randomIndex];
          clone[randomIndex] = clone[--sourceIndex];
        }
        return shuffled;
      },
      _private: this
    };
  }
};
var RandomPlugin = {
  name: "random",
  noClient: ({ api }) => {
    return api._private.isUsed();
  },
  flush: ({ api }) => {
    return api._private.getState();
  },
  api: ({ data }) => {
    const random = new Random(data);
    return random.api();
  },
  setup: ({ game }) => {
    let { seed } = game;
    if (seed === void 0) {
      seed = Random.seed();
    }
    return { seed };
  },
  playerView: () => void 0
};

// node_modules/boardgame.io/dist/esm/turn-order-8cc4909b.js
var import_lodash = __toESM(require_lodash());
var MAKE_MOVE = "MAKE_MOVE";
var GAME_EVENT = "GAME_EVENT";
var REDO = "REDO";
var RESET = "RESET";
var SYNC = "SYNC";
var UNDO = "UNDO";
var UPDATE = "UPDATE";
var PATCH = "PATCH";
var PLUGIN = "PLUGIN";
var STRIP_TRANSIENTS = "STRIP_TRANSIENTS";
var makeMove = (type, args, playerID, credentials) => ({
  type: MAKE_MOVE,
  payload: { type, args, playerID, credentials }
});
var gameEvent = (type, args, playerID, credentials) => ({
  type: GAME_EVENT,
  payload: { type, args, playerID, credentials }
});
var automaticGameEvent = (type, args, playerID, credentials) => ({
  type: GAME_EVENT,
  payload: { type, args, playerID, credentials },
  automatic: true
});
var sync = (info2) => ({
  type: SYNC,
  state: info2.state,
  log: info2.log,
  initialState: info2.initialState,
  clientOnly: true
});
var patch = (prevStateID, stateID, patch2, deltalog) => ({
  type: PATCH,
  prevStateID,
  stateID,
  patch: patch2,
  deltalog,
  clientOnly: true
});
var update = (state, deltalog) => ({
  type: UPDATE,
  state,
  deltalog,
  clientOnly: true
});
var reset = (state) => ({
  type: RESET,
  state,
  clientOnly: true
});
var undo = (playerID, credentials) => ({
  type: UNDO,
  payload: { type: null, args: null, playerID, credentials }
});
var redo = (playerID, credentials) => ({
  type: REDO,
  payload: { type: null, args: null, playerID, credentials }
});
var plugin = (type, args, playerID, credentials) => ({
  type: PLUGIN,
  payload: { type, args, playerID, credentials }
});
var stripTransients = () => ({
  type: STRIP_TRANSIENTS
});
var ActionCreators = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  makeMove,
  gameEvent,
  automaticGameEvent,
  sync,
  patch,
  update,
  reset,
  undo,
  redo,
  plugin,
  stripTransients
});
var INVALID_MOVE = "INVALID_MOVE";
var ImmerPlugin = {
  name: "plugin-immer",
  fnWrap: (move) => (context, ...args) => {
    let isInvalid = false;
    const newG = immer_esm_default(context.G, (G2) => {
      const result = move({ ...context, G: G2 }, ...args);
      if (result === INVALID_MOVE) {
        isInvalid = true;
        return;
      }
      return result;
    });
    if (isInvalid)
      return INVALID_MOVE;
    return newG;
  }
};
var GameMethod;
(function(GameMethod2) {
  GameMethod2["MOVE"] = "MOVE";
  GameMethod2["GAME_ON_END"] = "GAME_ON_END";
  GameMethod2["PHASE_ON_BEGIN"] = "PHASE_ON_BEGIN";
  GameMethod2["PHASE_ON_END"] = "PHASE_ON_END";
  GameMethod2["TURN_ON_BEGIN"] = "TURN_ON_BEGIN";
  GameMethod2["TURN_ON_MOVE"] = "TURN_ON_MOVE";
  GameMethod2["TURN_ON_END"] = "TURN_ON_END";
})(GameMethod || (GameMethod = {}));
var Errors;
(function(Errors2) {
  Errors2["CalledOutsideHook"] = "Events must be called from moves or the `onBegin`, `onEnd`, and `onMove` hooks.\nThis error probably means you called an event from other game code, like an `endIf` trigger or one of the `turn.order` methods.";
  Errors2["EndTurnInOnEnd"] = "`endTurn` is disallowed in `onEnd` hooks \u2014 the turn is already ending.";
  Errors2["MaxTurnEndings"] = "Maximum number of turn endings exceeded for this update.\nThis likely means game code is triggering an infinite loop.";
  Errors2["PhaseEventInOnEnd"] = "`setPhase` & `endPhase` are disallowed in a phase\u2019s `onEnd` hook \u2014 the phase is already ending.\nIf you\u2019re trying to dynamically choose the next phase when a phase ends, use the phase\u2019s `next` trigger.";
  Errors2["StageEventInOnEnd"] = "`setStage`, `endStage` & `setActivePlayers` are disallowed in `onEnd` hooks.";
  Errors2["StageEventInPhaseBegin"] = "`setStage`, `endStage` & `setActivePlayers` are disallowed in a phase\u2019s `onBegin` hook.\nUse `setActivePlayers` in a `turn.onBegin` hook or declare stages with `turn.activePlayers` instead.";
  Errors2["StageEventInTurnBegin"] = "`setStage` & `endStage` are disallowed in `turn.onBegin`.\nUse `setActivePlayers` or declare stages with `turn.activePlayers` instead.";
})(Errors || (Errors = {}));
var Events = class {
  constructor(flow, ctx, playerID) {
    this.flow = flow;
    this.playerID = playerID;
    this.dispatch = [];
    this.initialTurn = ctx.turn;
    this.updateTurnContext(ctx, void 0);
    this.maxEndedTurnsPerAction = ctx.numPlayers * 100;
  }
  api() {
    const events = {
      _private: this
    };
    for (const type of this.flow.eventNames) {
      events[type] = (...args) => {
        this.dispatch.push({
          type,
          args,
          phase: this.currentPhase,
          turn: this.currentTurn,
          calledFrom: this.currentMethod,
          // Used to capture a stack trace in case it is needed later.
          error: new Error("Events Plugin Error")
        });
      };
    }
    return events;
  }
  isUsed() {
    return this.dispatch.length > 0;
  }
  updateTurnContext(ctx, methodType) {
    this.currentPhase = ctx.phase;
    this.currentTurn = ctx.turn;
    this.currentMethod = methodType;
  }
  unsetCurrentMethod() {
    this.currentMethod = void 0;
  }
  /**
   * Updates ctx with the triggered events.
   * @param {object} state - The state object { G, ctx }.
   */
  update(state) {
    const initialState = state;
    const stateWithError = ({ stack }, message) => ({
      ...initialState,
      plugins: {
        ...initialState.plugins,
        events: {
          ...initialState.plugins.events,
          data: { error: message + "\n" + stack }
        }
      }
    });
    EventQueue: for (let i2 = 0; i2 < this.dispatch.length; i2++) {
      const event = this.dispatch[i2];
      const turnHasEnded = event.turn !== state.ctx.turn;
      const endedTurns = this.currentTurn - this.initialTurn;
      if (endedTurns >= this.maxEndedTurnsPerAction) {
        return stateWithError(event.error, Errors.MaxTurnEndings);
      }
      if (event.calledFrom === void 0) {
        return stateWithError(event.error, Errors.CalledOutsideHook);
      }
      if (state.ctx.gameover)
        break EventQueue;
      switch (event.type) {
        case "endStage":
        case "setStage":
        case "setActivePlayers": {
          switch (event.calledFrom) {
            case GameMethod.TURN_ON_END:
            case GameMethod.PHASE_ON_END:
              return stateWithError(event.error, Errors.StageEventInOnEnd);
            case GameMethod.PHASE_ON_BEGIN:
              return stateWithError(event.error, Errors.StageEventInPhaseBegin);
            case GameMethod.TURN_ON_BEGIN:
              if (event.type === "setActivePlayers")
                break;
              return stateWithError(event.error, Errors.StageEventInTurnBegin);
          }
          if (turnHasEnded)
            continue EventQueue;
          break;
        }
        case "endTurn": {
          if (event.calledFrom === GameMethod.TURN_ON_END || event.calledFrom === GameMethod.PHASE_ON_END) {
            return stateWithError(event.error, Errors.EndTurnInOnEnd);
          }
          if (turnHasEnded)
            continue EventQueue;
          break;
        }
        case "endPhase":
        case "setPhase": {
          if (event.calledFrom === GameMethod.PHASE_ON_END) {
            return stateWithError(event.error, Errors.PhaseEventInOnEnd);
          }
          if (event.phase !== state.ctx.phase)
            continue EventQueue;
          break;
        }
      }
      const action = automaticGameEvent(event.type, event.args, this.playerID);
      state = this.flow.processEvent(state, action);
    }
    return state;
  }
};
var EventsPlugin = {
  name: "events",
  noClient: ({ api }) => api._private.isUsed(),
  isInvalid: ({ data }) => data.error || false,
  // Update the events plugin’s internal turn context each time a move
  // or hook is called. This allows events called after turn or phase
  // endings to dispatch the current turn and phase correctly.
  fnWrap: (method, methodType) => (context, ...args) => {
    const api = context.events;
    if (api)
      api._private.updateTurnContext(context.ctx, methodType);
    const G2 = method(context, ...args);
    if (api)
      api._private.unsetCurrentMethod();
    return G2;
  },
  dangerouslyFlushRawState: ({ state, api }) => api._private.update(state),
  api: ({ game, ctx, playerID }) => new Events(game.flow, ctx, playerID).api()
};
var LogPlugin = {
  name: "log",
  flush: () => ({}),
  api: ({ data }) => {
    return {
      setMetadata: (metadata) => {
        data.metadata = metadata;
      }
    };
  },
  setup: () => ({})
};
function isSerializable(value2) {
  if (value2 === void 0 || value2 === null || typeof value2 === "boolean" || typeof value2 === "number" || typeof value2 === "string") {
    return true;
  }
  if (!(0, import_lodash.default)(value2) && !Array.isArray(value2)) {
    return false;
  }
  for (const key in value2) {
    if (!isSerializable(value2[key]))
      return false;
  }
  return true;
}
var SerializablePlugin = {
  name: "plugin-serializable",
  fnWrap: (move) => (context, ...args) => {
    const result = move(context, ...args);
    if (process.env.NODE_ENV !== "production" && !isSerializable(result)) {
      throw new Error("Move state is not JSON-serialiazable.\nSee https://boardgame.io/documentation/#/?id=state for more information.");
    }
    return result;
  }
};
var production = process.env.NODE_ENV === "production";
var logfn = production ? () => {
} : (...msg) => console.log(...msg);
var errorfn = (...msg) => console.error(...msg);
function info(msg) {
  logfn(`INFO: ${msg}`);
}
function error(error2) {
  errorfn("ERROR:", error2);
}
var CORE_PLUGINS = [ImmerPlugin, RandomPlugin, LogPlugin, SerializablePlugin];
var DEFAULT_PLUGINS = [...CORE_PLUGINS, EventsPlugin];
var ProcessAction = (state, action, opts) => {
  opts.game.plugins.filter((plugin2) => plugin2.action !== void 0).filter((plugin2) => plugin2.name === action.payload.type).forEach((plugin2) => {
    const name = plugin2.name;
    const pluginState = state.plugins[name] || { data: {} };
    const data = plugin2.action(pluginState.data, action.payload);
    state = {
      ...state,
      plugins: {
        ...state.plugins,
        [name]: { ...pluginState, data }
      }
    };
  });
  return state;
};
var GetAPIs = ({ plugins }) => Object.entries(plugins || {}).reduce((apis, [name, { api }]) => {
  apis[name] = api;
  return apis;
}, {});
var FnWrap = (methodToWrap, methodType, plugins) => {
  return [...CORE_PLUGINS, ...plugins, EventsPlugin].filter((plugin2) => plugin2.fnWrap !== void 0).reduce((method, { fnWrap }) => fnWrap(method, methodType), methodToWrap);
};
var Setup = (state, opts) => {
  [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.setup !== void 0).forEach((plugin2) => {
    const name = plugin2.name;
    const data = plugin2.setup({
      G: state.G,
      ctx: state.ctx,
      game: opts.game
    });
    state = {
      ...state,
      plugins: {
        ...state.plugins,
        [name]: { data }
      }
    };
  });
  return state;
};
var Enhance = (state, opts) => {
  [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.api !== void 0).forEach((plugin2) => {
    const name = plugin2.name;
    const pluginState = state.plugins[name] || { data: {} };
    const api = plugin2.api({
      G: state.G,
      ctx: state.ctx,
      data: pluginState.data,
      game: opts.game,
      playerID: opts.playerID
    });
    state = {
      ...state,
      plugins: {
        ...state.plugins,
        [name]: { ...pluginState, api }
      }
    };
  });
  return state;
};
var Flush = (state, opts) => {
  [...CORE_PLUGINS, ...opts.game.plugins, EventsPlugin].reverse().forEach((plugin2) => {
    const name = plugin2.name;
    const pluginState = state.plugins[name] || { data: {} };
    if (plugin2.flush) {
      const newData = plugin2.flush({
        G: state.G,
        ctx: state.ctx,
        game: opts.game,
        api: pluginState.api,
        data: pluginState.data
      });
      state = {
        ...state,
        plugins: {
          ...state.plugins,
          [plugin2.name]: { data: newData }
        }
      };
    } else if (plugin2.dangerouslyFlushRawState) {
      state = plugin2.dangerouslyFlushRawState({
        state,
        game: opts.game,
        api: pluginState.api,
        data: pluginState.data
      });
      const data = state.plugins[name].data;
      state = {
        ...state,
        plugins: {
          ...state.plugins,
          [plugin2.name]: { data }
        }
      };
    }
  });
  return state;
};
var NoClient = (state, opts) => {
  return [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.noClient !== void 0).map((plugin2) => {
    const name = plugin2.name;
    const pluginState = state.plugins[name];
    if (pluginState) {
      return plugin2.noClient({
        G: state.G,
        ctx: state.ctx,
        game: opts.game,
        api: pluginState.api,
        data: pluginState.data
      });
    }
    return false;
  }).includes(true);
};
var IsInvalid = (state, opts) => {
  const firstInvalidReturn = [...DEFAULT_PLUGINS, ...opts.game.plugins].filter((plugin2) => plugin2.isInvalid !== void 0).map((plugin2) => {
    const { name } = plugin2;
    const pluginState = state.plugins[name];
    const message = plugin2.isInvalid({
      G: state.G,
      ctx: state.ctx,
      game: opts.game,
      data: pluginState && pluginState.data
    });
    return message ? { plugin: name, message } : false;
  }).find((value2) => value2);
  return firstInvalidReturn || false;
};
var FlushAndValidate = (state, opts) => {
  const updatedState = Flush(state, opts);
  const isInvalid = IsInvalid(updatedState, opts);
  if (!isInvalid)
    return [updatedState];
  const { plugin: plugin2, message } = isInvalid;
  error(`${plugin2} plugin declared action invalid:
${message}`);
  return [state, isInvalid];
};
var PlayerView = ({ G: G2, ctx, plugins = {} }, { game, playerID }) => {
  [...DEFAULT_PLUGINS, ...game.plugins].forEach(({ name, playerView }) => {
    if (!playerView)
      return;
    const { data } = plugins[name] || { data: {} };
    const newData = playerView({ G: G2, ctx, game, data, playerID });
    plugins = {
      ...plugins,
      [name]: { data: newData }
    };
  });
  return plugins;
};
function supportDeprecatedMoveLimit(options, enforceMinMoves = false) {
  if (options.moveLimit) {
    if (enforceMinMoves) {
      options.minMoves = options.moveLimit;
    }
    options.maxMoves = options.moveLimit;
    delete options.moveLimit;
  }
}
function SetActivePlayers(ctx, arg) {
  let activePlayers = {};
  let _prevActivePlayers = [];
  let _nextActivePlayers = null;
  let _activePlayersMinMoves = {};
  let _activePlayersMaxMoves = {};
  if (Array.isArray(arg)) {
    const value2 = {};
    arg.forEach((v2) => value2[v2] = Stage.NULL);
    activePlayers = value2;
  } else {
    supportDeprecatedMoveLimit(arg);
    if (arg.next) {
      _nextActivePlayers = arg.next;
    }
    if (arg.revert) {
      _prevActivePlayers = [
        ...ctx._prevActivePlayers,
        {
          activePlayers: ctx.activePlayers,
          _activePlayersMinMoves: ctx._activePlayersMinMoves,
          _activePlayersMaxMoves: ctx._activePlayersMaxMoves,
          _activePlayersNumMoves: ctx._activePlayersNumMoves
        }
      ];
    }
    if (arg.currentPlayer !== void 0) {
      ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, ctx.currentPlayer, arg.currentPlayer);
    }
    if (arg.others !== void 0) {
      for (let i2 = 0; i2 < ctx.playOrder.length; i2++) {
        const id = ctx.playOrder[i2];
        if (id !== ctx.currentPlayer) {
          ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, id, arg.others);
        }
      }
    }
    if (arg.all !== void 0) {
      for (let i2 = 0; i2 < ctx.playOrder.length; i2++) {
        const id = ctx.playOrder[i2];
        ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, id, arg.all);
      }
    }
    if (arg.value) {
      for (const id in arg.value) {
        ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, id, arg.value[id]);
      }
    }
    if (arg.minMoves) {
      for (const id in activePlayers) {
        if (_activePlayersMinMoves[id] === void 0) {
          _activePlayersMinMoves[id] = arg.minMoves;
        }
      }
    }
    if (arg.maxMoves) {
      for (const id in activePlayers) {
        if (_activePlayersMaxMoves[id] === void 0) {
          _activePlayersMaxMoves[id] = arg.maxMoves;
        }
      }
    }
  }
  if (Object.keys(activePlayers).length === 0) {
    activePlayers = null;
  }
  if (Object.keys(_activePlayersMinMoves).length === 0) {
    _activePlayersMinMoves = null;
  }
  if (Object.keys(_activePlayersMaxMoves).length === 0) {
    _activePlayersMaxMoves = null;
  }
  const _activePlayersNumMoves = {};
  for (const id in activePlayers) {
    _activePlayersNumMoves[id] = 0;
  }
  return {
    ...ctx,
    activePlayers,
    _activePlayersMinMoves,
    _activePlayersMaxMoves,
    _activePlayersNumMoves,
    _prevActivePlayers,
    _nextActivePlayers
  };
}
function UpdateActivePlayersOnceEmpty(ctx) {
  let { activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, _activePlayersNumMoves, _prevActivePlayers, _nextActivePlayers } = ctx;
  if (activePlayers && Object.keys(activePlayers).length === 0) {
    if (_nextActivePlayers) {
      ctx = SetActivePlayers(ctx, _nextActivePlayers);
      ({
        activePlayers,
        _activePlayersMinMoves,
        _activePlayersMaxMoves,
        _activePlayersNumMoves,
        _prevActivePlayers
      } = ctx);
    } else if (_prevActivePlayers.length > 0) {
      const lastIndex = _prevActivePlayers.length - 1;
      ({
        activePlayers,
        _activePlayersMinMoves,
        _activePlayersMaxMoves,
        _activePlayersNumMoves
      } = _prevActivePlayers[lastIndex]);
      _prevActivePlayers = _prevActivePlayers.slice(0, lastIndex);
    } else {
      activePlayers = null;
      _activePlayersMinMoves = null;
      _activePlayersMaxMoves = null;
    }
  }
  return {
    ...ctx,
    activePlayers,
    _activePlayersMinMoves,
    _activePlayersMaxMoves,
    _activePlayersNumMoves,
    _prevActivePlayers
  };
}
function ApplyActivePlayerArgument(activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, playerID, arg) {
  if (typeof arg !== "object" || arg === Stage.NULL) {
    arg = { stage: arg };
  }
  if (arg.stage !== void 0) {
    supportDeprecatedMoveLimit(arg);
    activePlayers[playerID] = arg.stage;
    if (arg.minMoves)
      _activePlayersMinMoves[playerID] = arg.minMoves;
    if (arg.maxMoves)
      _activePlayersMaxMoves[playerID] = arg.maxMoves;
  }
}
function getCurrentPlayer(playOrder, playOrderPos) {
  return playOrder[playOrderPos] + "";
}
function InitTurnOrderState(state, turn) {
  let { G: G2, ctx } = state;
  const { numPlayers } = ctx;
  const pluginAPIs = GetAPIs(state);
  const context = { ...pluginAPIs, G: G2, ctx };
  const order = turn.order;
  let playOrder = [...Array.from({ length: numPlayers })].map((_2, i2) => i2 + "");
  if (order.playOrder !== void 0) {
    playOrder = order.playOrder(context);
  }
  const playOrderPos = order.first(context);
  const posType = typeof playOrderPos;
  if (posType !== "number") {
    error(`invalid value returned by turn.order.first \u2014 expected number got ${posType} \u201C${playOrderPos}\u201D.`);
  }
  const currentPlayer = getCurrentPlayer(playOrder, playOrderPos);
  ctx = { ...ctx, currentPlayer, playOrderPos, playOrder };
  ctx = SetActivePlayers(ctx, turn.activePlayers || {});
  return ctx;
}
function UpdateTurnOrderState(state, currentPlayer, turn, endTurnArg) {
  const order = turn.order;
  let { G: G2, ctx } = state;
  let playOrderPos = ctx.playOrderPos;
  let endPhase = false;
  if (endTurnArg && endTurnArg !== true) {
    if (typeof endTurnArg !== "object") {
      error(`invalid argument to endTurn: ${endTurnArg}`);
    }
    Object.keys(endTurnArg).forEach((arg) => {
      switch (arg) {
        case "remove":
          currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
          break;
        case "next":
          playOrderPos = ctx.playOrder.indexOf(endTurnArg.next);
          currentPlayer = endTurnArg.next;
          break;
        default:
          error(`invalid argument to endTurn: ${arg}`);
      }
    });
  } else {
    const pluginAPIs = GetAPIs(state);
    const context = { ...pluginAPIs, G: G2, ctx };
    const t2 = order.next(context);
    const type = typeof t2;
    if (t2 !== void 0 && type !== "number") {
      error(`invalid value returned by turn.order.next \u2014 expected number or undefined got ${type} \u201C${t2}\u201D.`);
    }
    if (t2 === void 0) {
      endPhase = true;
    } else {
      playOrderPos = t2;
      currentPlayer = getCurrentPlayer(ctx.playOrder, playOrderPos);
    }
  }
  ctx = {
    ...ctx,
    playOrderPos,
    currentPlayer
  };
  return { endPhase, ctx };
}
var TurnOrder = {
  /**
   * DEFAULT
   *
   * The default round-robin turn order.
   */
  DEFAULT: {
    first: ({ ctx }) => ctx.turn === 0 ? ctx.playOrderPos : (ctx.playOrderPos + 1) % ctx.playOrder.length,
    next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  },
  /**
   * RESET
   *
   * Similar to DEFAULT, but starts from 0 each time.
   */
  RESET: {
    first: () => 0,
    next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  },
  /**
   * CONTINUE
   *
   * Similar to DEFAULT, but starts with the player who ended the last phase.
   */
  CONTINUE: {
    first: ({ ctx }) => ctx.playOrderPos,
    next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  },
  /**
   * ONCE
   *
   * Another round-robin turn order, but goes around just once.
   * The phase ends after all players have played.
   */
  ONCE: {
    first: () => 0,
    next: ({ ctx }) => {
      if (ctx.playOrderPos < ctx.playOrder.length - 1) {
        return ctx.playOrderPos + 1;
      }
    }
  },
  /**
   * CUSTOM
   *
   * Identical to DEFAULT, but also sets playOrder at the
   * beginning of the phase.
   *
   * @param {Array} playOrder - The play order.
   */
  CUSTOM: (playOrder) => ({
    playOrder: () => playOrder,
    first: () => 0,
    next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  }),
  /**
   * CUSTOM_FROM
   *
   * Identical to DEFAULT, but also sets playOrder at the
   * beginning of the phase to a value specified by a field
   * in G.
   *
   * @param {string} playOrderField - Field in G.
   */
  CUSTOM_FROM: (playOrderField) => ({
    playOrder: ({ G: G2 }) => G2[playOrderField],
    first: () => 0,
    next: ({ ctx }) => (ctx.playOrderPos + 1) % ctx.playOrder.length
  })
};
var Stage = {
  NULL: null
};
var ActivePlayers = {
  /**
   * ALL
   *
   * The turn stays with one player, but any player can play (in any order)
   * until the phase ends.
   */
  ALL: { all: Stage.NULL },
  /**
   * ALL_ONCE
   *
   * The turn stays with one player, but any player can play (once, and in any order).
   * This is typically used in a phase where you want to elicit a response
   * from every player in the game.
   */
  ALL_ONCE: { all: Stage.NULL, minMoves: 1, maxMoves: 1 },
  /**
   * OTHERS
   *
   * The turn stays with one player, and every *other* player can play (in any order)
   * until the phase ends.
   */
  OTHERS: { others: Stage.NULL },
  /**
   * OTHERS_ONCE
   *
   * The turn stays with one player, and every *other* player can play (once, and in any order).
   * This is typically used in a phase where you want to elicit a response
   * from every *other* player in the game.
   */
  OTHERS_ONCE: { others: Stage.NULL, minMoves: 1, maxMoves: 1 }
};

// node_modules/boardgame.io/dist/esm/multiplayer.js
var import_lodash2 = __toESM(require_lodash());

// node_modules/boardgame.io/dist/esm/reducer-24ea3e4c.js
var import_rfc6902 = __toESM(require_rfc6902());
function Flow({ moves, phases, endIf, onEnd, turn, events, plugins }) {
  if (moves === void 0) {
    moves = {};
  }
  if (events === void 0) {
    events = {};
  }
  if (plugins === void 0) {
    plugins = [];
  }
  if (phases === void 0) {
    phases = {};
  }
  if (!endIf)
    endIf = () => void 0;
  if (!onEnd)
    onEnd = ({ G: G2 }) => G2;
  if (!turn)
    turn = {};
  const phaseMap = { ...phases };
  if ("" in phaseMap) {
    error("cannot specify phase with empty name");
  }
  phaseMap[""] = {};
  const moveMap = {};
  const moveNames = /* @__PURE__ */ new Set();
  let startingPhase = null;
  Object.keys(moves).forEach((name) => moveNames.add(name));
  const HookWrapper = (hook, hookType) => {
    const withPlugins = FnWrap(hook, hookType, plugins);
    return (state) => {
      const pluginAPIs = GetAPIs(state);
      return withPlugins({
        ...pluginAPIs,
        G: state.G,
        ctx: state.ctx,
        playerID: state.playerID
      });
    };
  };
  const TriggerWrapper = (trigger) => {
    return (state) => {
      const pluginAPIs = GetAPIs(state);
      return trigger({
        ...pluginAPIs,
        G: state.G,
        ctx: state.ctx
      });
    };
  };
  const wrapped = {
    onEnd: HookWrapper(onEnd, GameMethod.GAME_ON_END),
    endIf: TriggerWrapper(endIf)
  };
  for (const phase in phaseMap) {
    const phaseConfig = phaseMap[phase];
    if (phaseConfig.start === true) {
      startingPhase = phase;
    }
    if (phaseConfig.moves !== void 0) {
      for (const move of Object.keys(phaseConfig.moves)) {
        moveMap[phase + "." + move] = phaseConfig.moves[move];
        moveNames.add(move);
      }
    }
    if (phaseConfig.endIf === void 0) {
      phaseConfig.endIf = () => void 0;
    }
    if (phaseConfig.onBegin === void 0) {
      phaseConfig.onBegin = ({ G: G2 }) => G2;
    }
    if (phaseConfig.onEnd === void 0) {
      phaseConfig.onEnd = ({ G: G2 }) => G2;
    }
    if (phaseConfig.turn === void 0) {
      phaseConfig.turn = turn;
    }
    if (phaseConfig.turn.order === void 0) {
      phaseConfig.turn.order = TurnOrder.DEFAULT;
    }
    if (phaseConfig.turn.onBegin === void 0) {
      phaseConfig.turn.onBegin = ({ G: G2 }) => G2;
    }
    if (phaseConfig.turn.onEnd === void 0) {
      phaseConfig.turn.onEnd = ({ G: G2 }) => G2;
    }
    if (phaseConfig.turn.endIf === void 0) {
      phaseConfig.turn.endIf = () => false;
    }
    if (phaseConfig.turn.onMove === void 0) {
      phaseConfig.turn.onMove = ({ G: G2 }) => G2;
    }
    if (phaseConfig.turn.stages === void 0) {
      phaseConfig.turn.stages = {};
    }
    supportDeprecatedMoveLimit(phaseConfig.turn, true);
    for (const stage in phaseConfig.turn.stages) {
      const stageConfig = phaseConfig.turn.stages[stage];
      const moves2 = stageConfig.moves || {};
      for (const move of Object.keys(moves2)) {
        const key = phase + "." + stage + "." + move;
        moveMap[key] = moves2[move];
        moveNames.add(move);
      }
    }
    phaseConfig.wrapped = {
      onBegin: HookWrapper(phaseConfig.onBegin, GameMethod.PHASE_ON_BEGIN),
      onEnd: HookWrapper(phaseConfig.onEnd, GameMethod.PHASE_ON_END),
      endIf: TriggerWrapper(phaseConfig.endIf)
    };
    phaseConfig.turn.wrapped = {
      onMove: HookWrapper(phaseConfig.turn.onMove, GameMethod.TURN_ON_MOVE),
      onBegin: HookWrapper(phaseConfig.turn.onBegin, GameMethod.TURN_ON_BEGIN),
      onEnd: HookWrapper(phaseConfig.turn.onEnd, GameMethod.TURN_ON_END),
      endIf: TriggerWrapper(phaseConfig.turn.endIf)
    };
    if (typeof phaseConfig.next !== "function") {
      const { next } = phaseConfig;
      phaseConfig.next = () => next || null;
    }
    phaseConfig.wrapped.next = TriggerWrapper(phaseConfig.next);
  }
  function GetPhase(ctx) {
    return ctx.phase ? phaseMap[ctx.phase] : phaseMap[""];
  }
  function OnMove(state) {
    return state;
  }
  function Process(state, events2) {
    const phasesEnded = /* @__PURE__ */ new Set();
    const turnsEnded = /* @__PURE__ */ new Set();
    for (let i2 = 0; i2 < events2.length; i2++) {
      const { fn: fn2, arg, ...rest } = events2[i2];
      if (fn2 === EndPhase) {
        turnsEnded.clear();
        const phase = state.ctx.phase;
        if (phasesEnded.has(phase)) {
          const ctx = { ...state.ctx, phase: null };
          return { ...state, ctx };
        }
        phasesEnded.add(phase);
      }
      const next = [];
      state = fn2(state, {
        ...rest,
        arg,
        next
      });
      if (fn2 === EndGame) {
        break;
      }
      const shouldEndGame = ShouldEndGame(state);
      if (shouldEndGame) {
        events2.push({
          fn: EndGame,
          arg: shouldEndGame,
          turn: state.ctx.turn,
          phase: state.ctx.phase,
          automatic: true
        });
        continue;
      }
      const shouldEndPhase = ShouldEndPhase(state);
      if (shouldEndPhase) {
        events2.push({
          fn: EndPhase,
          arg: shouldEndPhase,
          turn: state.ctx.turn,
          phase: state.ctx.phase,
          automatic: true
        });
        continue;
      }
      if ([OnMove, UpdateStage, UpdateActivePlayers].includes(fn2)) {
        const shouldEndTurn = ShouldEndTurn(state);
        if (shouldEndTurn) {
          events2.push({
            fn: EndTurn,
            arg: shouldEndTurn,
            turn: state.ctx.turn,
            phase: state.ctx.phase,
            automatic: true
          });
          continue;
        }
      }
      events2.push(...next);
    }
    return state;
  }
  function StartGame(state, { next }) {
    next.push({ fn: StartPhase });
    return state;
  }
  function StartPhase(state, { next }) {
    let { G: G2, ctx } = state;
    const phaseConfig = GetPhase(ctx);
    G2 = phaseConfig.wrapped.onBegin(state);
    next.push({ fn: StartTurn });
    return { ...state, G: G2, ctx };
  }
  function StartTurn(state, { currentPlayer }) {
    let { ctx } = state;
    const phaseConfig = GetPhase(ctx);
    if (currentPlayer) {
      ctx = { ...ctx, currentPlayer };
      if (phaseConfig.turn.activePlayers) {
        ctx = SetActivePlayers(ctx, phaseConfig.turn.activePlayers);
      }
    } else {
      ctx = InitTurnOrderState(state, phaseConfig.turn);
    }
    const turn2 = ctx.turn + 1;
    ctx = { ...ctx, turn: turn2, numMoves: 0, _prevActivePlayers: [] };
    const G2 = phaseConfig.turn.wrapped.onBegin({ ...state, ctx });
    return { ...state, G: G2, ctx, _undo: [], _redo: [] };
  }
  function UpdatePhase(state, { arg, next, phase }) {
    const phaseConfig = GetPhase({ phase });
    let { ctx } = state;
    if (arg && arg.next) {
      if (arg.next in phaseMap) {
        ctx = { ...ctx, phase: arg.next };
      } else {
        error("invalid phase: " + arg.next);
        return state;
      }
    } else {
      ctx = { ...ctx, phase: phaseConfig.wrapped.next(state) || null };
    }
    state = { ...state, ctx };
    next.push({ fn: StartPhase });
    return state;
  }
  function UpdateTurn(state, { arg, currentPlayer, next }) {
    let { G: G2, ctx } = state;
    const phaseConfig = GetPhase(ctx);
    const { endPhase, ctx: newCtx } = UpdateTurnOrderState(state, currentPlayer, phaseConfig.turn, arg);
    ctx = newCtx;
    state = { ...state, G: G2, ctx };
    if (endPhase) {
      next.push({ fn: EndPhase, turn: ctx.turn, phase: ctx.phase });
    } else {
      next.push({ fn: StartTurn, currentPlayer: ctx.currentPlayer });
    }
    return state;
  }
  function UpdateStage(state, { arg, playerID }) {
    if (typeof arg === "string" || arg === Stage.NULL) {
      arg = { stage: arg };
    }
    if (typeof arg !== "object")
      return state;
    supportDeprecatedMoveLimit(arg);
    let { ctx } = state;
    let { activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, _activePlayersNumMoves } = ctx;
    if (arg.stage !== void 0) {
      if (activePlayers === null) {
        activePlayers = {};
      }
      activePlayers[playerID] = arg.stage;
      _activePlayersNumMoves[playerID] = 0;
      if (arg.minMoves) {
        if (_activePlayersMinMoves === null) {
          _activePlayersMinMoves = {};
        }
        _activePlayersMinMoves[playerID] = arg.minMoves;
      }
      if (arg.maxMoves) {
        if (_activePlayersMaxMoves === null) {
          _activePlayersMaxMoves = {};
        }
        _activePlayersMaxMoves[playerID] = arg.maxMoves;
      }
    }
    ctx = {
      ...ctx,
      activePlayers,
      _activePlayersMinMoves,
      _activePlayersMaxMoves,
      _activePlayersNumMoves
    };
    return { ...state, ctx };
  }
  function UpdateActivePlayers(state, { arg }) {
    return { ...state, ctx: SetActivePlayers(state.ctx, arg) };
  }
  function ShouldEndGame(state) {
    return wrapped.endIf(state);
  }
  function ShouldEndPhase(state) {
    const phaseConfig = GetPhase(state.ctx);
    return phaseConfig.wrapped.endIf(state);
  }
  function ShouldEndTurn(state) {
    const phaseConfig = GetPhase(state.ctx);
    const currentPlayerMoves = state.ctx.numMoves || 0;
    if (phaseConfig.turn.maxMoves && currentPlayerMoves >= phaseConfig.turn.maxMoves) {
      return true;
    }
    return phaseConfig.turn.wrapped.endIf(state);
  }
  function EndGame(state, { arg, phase }) {
    state = EndPhase(state, { phase });
    if (arg === void 0) {
      arg = true;
    }
    state = { ...state, ctx: { ...state.ctx, gameover: arg } };
    const G2 = wrapped.onEnd(state);
    return { ...state, G: G2 };
  }
  function EndPhase(state, { arg, next, turn: initialTurn, automatic }) {
    state = EndTurn(state, { turn: initialTurn, force: true, automatic: true });
    const { phase, turn: turn2 } = state.ctx;
    if (next) {
      next.push({ fn: UpdatePhase, arg, phase });
    }
    if (phase === null) {
      return state;
    }
    const phaseConfig = GetPhase(state.ctx);
    const G2 = phaseConfig.wrapped.onEnd(state);
    const ctx = { ...state.ctx, phase: null };
    const action = gameEvent("endPhase", arg);
    const { _stateID } = state;
    const logEntry = { action, _stateID, turn: turn2, phase };
    if (automatic)
      logEntry.automatic = true;
    const deltalog = [...state.deltalog || [], logEntry];
    return { ...state, G: G2, ctx, deltalog };
  }
  function EndTurn(state, { arg, next, turn: initialTurn, force, automatic, playerID }) {
    if (initialTurn !== state.ctx.turn) {
      return state;
    }
    const { currentPlayer, numMoves, phase, turn: turn2 } = state.ctx;
    const phaseConfig = GetPhase(state.ctx);
    const currentPlayerMoves = numMoves || 0;
    if (!force && phaseConfig.turn.minMoves && currentPlayerMoves < phaseConfig.turn.minMoves) {
      info(`cannot end turn before making ${phaseConfig.turn.minMoves} moves`);
      return state;
    }
    const G2 = phaseConfig.turn.wrapped.onEnd(state);
    if (next) {
      next.push({ fn: UpdateTurn, arg, currentPlayer });
    }
    let ctx = { ...state.ctx, activePlayers: null };
    if (arg && arg.remove) {
      playerID = playerID || currentPlayer;
      const playOrder = ctx.playOrder.filter((i2) => i2 != playerID);
      const playOrderPos = ctx.playOrderPos > playOrder.length - 1 ? 0 : ctx.playOrderPos;
      ctx = { ...ctx, playOrder, playOrderPos };
      if (playOrder.length === 0) {
        next.push({ fn: EndPhase, turn: turn2, phase });
        return state;
      }
    }
    const action = gameEvent("endTurn", arg);
    const { _stateID } = state;
    const logEntry = { action, _stateID, turn: turn2, phase };
    if (automatic)
      logEntry.automatic = true;
    const deltalog = [...state.deltalog || [], logEntry];
    return { ...state, G: G2, ctx, deltalog, _undo: [], _redo: [] };
  }
  function EndStage(state, { arg, next, automatic, playerID }) {
    playerID = playerID || state.ctx.currentPlayer;
    let { ctx, _stateID } = state;
    let { activePlayers, _activePlayersNumMoves, _activePlayersMinMoves, _activePlayersMaxMoves, phase, turn: turn2 } = ctx;
    const playerInStage = activePlayers !== null && playerID in activePlayers;
    const phaseConfig = GetPhase(ctx);
    if (!arg && playerInStage) {
      const stage = phaseConfig.turn.stages[activePlayers[playerID]];
      if (stage && stage.next) {
        arg = stage.next;
      }
    }
    if (next) {
      next.push({ fn: UpdateStage, arg, playerID });
    }
    if (!playerInStage)
      return state;
    const currentPlayerMoves = _activePlayersNumMoves[playerID] || 0;
    if (_activePlayersMinMoves && _activePlayersMinMoves[playerID] && currentPlayerMoves < _activePlayersMinMoves[playerID]) {
      info(`cannot end stage before making ${_activePlayersMinMoves[playerID]} moves`);
      return state;
    }
    activePlayers = { ...activePlayers };
    delete activePlayers[playerID];
    if (_activePlayersMinMoves) {
      _activePlayersMinMoves = { ..._activePlayersMinMoves };
      delete _activePlayersMinMoves[playerID];
    }
    if (_activePlayersMaxMoves) {
      _activePlayersMaxMoves = { ..._activePlayersMaxMoves };
      delete _activePlayersMaxMoves[playerID];
    }
    ctx = UpdateActivePlayersOnceEmpty({
      ...ctx,
      activePlayers,
      _activePlayersMinMoves,
      _activePlayersMaxMoves
    });
    const action = gameEvent("endStage", arg);
    const logEntry = { action, _stateID, turn: turn2, phase };
    if (automatic)
      logEntry.automatic = true;
    const deltalog = [...state.deltalog || [], logEntry];
    return { ...state, ctx, deltalog };
  }
  function GetMove(ctx, name, playerID) {
    const phaseConfig = GetPhase(ctx);
    const stages = phaseConfig.turn.stages;
    const { activePlayers } = ctx;
    if (activePlayers && activePlayers[playerID] !== void 0 && activePlayers[playerID] !== Stage.NULL && stages[activePlayers[playerID]] !== void 0 && stages[activePlayers[playerID]].moves !== void 0) {
      const stage = stages[activePlayers[playerID]];
      const moves2 = stage.moves;
      if (name in moves2) {
        return moves2[name];
      }
    } else if (phaseConfig.moves) {
      if (name in phaseConfig.moves) {
        return phaseConfig.moves[name];
      }
    } else if (name in moves) {
      return moves[name];
    }
    return null;
  }
  function ProcessMove(state, action) {
    const { playerID, type } = action;
    const { currentPlayer, activePlayers, _activePlayersMaxMoves } = state.ctx;
    const move = GetMove(state.ctx, type, playerID);
    const shouldCount = !move || typeof move === "function" || move.noLimit !== true;
    let { numMoves, _activePlayersNumMoves } = state.ctx;
    if (shouldCount) {
      if (playerID === currentPlayer)
        numMoves++;
      if (activePlayers)
        _activePlayersNumMoves[playerID]++;
    }
    state = {
      ...state,
      ctx: {
        ...state.ctx,
        numMoves,
        _activePlayersNumMoves
      }
    };
    if (_activePlayersMaxMoves && _activePlayersNumMoves[playerID] >= _activePlayersMaxMoves[playerID]) {
      state = EndStage(state, { playerID, automatic: true });
    }
    const phaseConfig = GetPhase(state.ctx);
    const G2 = phaseConfig.turn.wrapped.onMove({ ...state, playerID });
    state = { ...state, G: G2 };
    const events2 = [{ fn: OnMove }];
    return Process(state, events2);
  }
  function SetStageEvent(state, playerID, arg) {
    return Process(state, [{ fn: EndStage, arg, playerID }]);
  }
  function EndStageEvent(state, playerID) {
    return Process(state, [{ fn: EndStage, playerID }]);
  }
  function SetActivePlayersEvent(state, _playerID, arg) {
    return Process(state, [{ fn: UpdateActivePlayers, arg }]);
  }
  function SetPhaseEvent(state, _playerID, newPhase) {
    return Process(state, [
      {
        fn: EndPhase,
        phase: state.ctx.phase,
        turn: state.ctx.turn,
        arg: { next: newPhase }
      }
    ]);
  }
  function EndPhaseEvent(state) {
    return Process(state, [
      { fn: EndPhase, phase: state.ctx.phase, turn: state.ctx.turn }
    ]);
  }
  function EndTurnEvent(state, _playerID, arg) {
    return Process(state, [
      { fn: EndTurn, turn: state.ctx.turn, phase: state.ctx.phase, arg }
    ]);
  }
  function PassEvent(state, _playerID, arg) {
    return Process(state, [
      {
        fn: EndTurn,
        turn: state.ctx.turn,
        phase: state.ctx.phase,
        force: true,
        arg
      }
    ]);
  }
  function EndGameEvent(state, _playerID, arg) {
    return Process(state, [
      { fn: EndGame, turn: state.ctx.turn, phase: state.ctx.phase, arg }
    ]);
  }
  const eventHandlers = {
    endStage: EndStageEvent,
    setStage: SetStageEvent,
    endTurn: EndTurnEvent,
    pass: PassEvent,
    endPhase: EndPhaseEvent,
    setPhase: SetPhaseEvent,
    endGame: EndGameEvent,
    setActivePlayers: SetActivePlayersEvent
  };
  const enabledEventNames = [];
  if (events.endTurn !== false) {
    enabledEventNames.push("endTurn");
  }
  if (events.pass !== false) {
    enabledEventNames.push("pass");
  }
  if (events.endPhase !== false) {
    enabledEventNames.push("endPhase");
  }
  if (events.setPhase !== false) {
    enabledEventNames.push("setPhase");
  }
  if (events.endGame !== false) {
    enabledEventNames.push("endGame");
  }
  if (events.setActivePlayers !== false) {
    enabledEventNames.push("setActivePlayers");
  }
  if (events.endStage !== false) {
    enabledEventNames.push("endStage");
  }
  if (events.setStage !== false) {
    enabledEventNames.push("setStage");
  }
  function ProcessEvent(state, action) {
    const { type, playerID, args } = action.payload;
    if (typeof eventHandlers[type] !== "function")
      return state;
    return eventHandlers[type](state, playerID, ...Array.isArray(args) ? args : [args]);
  }
  function IsPlayerActive(_G, ctx, playerID) {
    if (ctx.activePlayers) {
      return playerID in ctx.activePlayers;
    }
    return ctx.currentPlayer === playerID;
  }
  return {
    ctx: (numPlayers) => ({
      numPlayers,
      turn: 0,
      currentPlayer: "0",
      playOrder: [...Array.from({ length: numPlayers })].map((_2, i2) => i2 + ""),
      playOrderPos: 0,
      phase: startingPhase,
      activePlayers: null
    }),
    init: (state) => {
      return Process(state, [{ fn: StartGame }]);
    },
    isPlayerActive: IsPlayerActive,
    eventHandlers,
    eventNames: Object.keys(eventHandlers),
    enabledEventNames,
    moveMap,
    moveNames: [...moveNames.values()],
    processMove: ProcessMove,
    processEvent: ProcessEvent,
    getMove: GetMove
  };
}
function IsProcessed(game) {
  return game.processMove !== void 0;
}
function ProcessGameConfig(game) {
  if (IsProcessed(game)) {
    return game;
  }
  if (game.name === void 0)
    game.name = "default";
  if (game.deltaState === void 0)
    game.deltaState = false;
  if (game.disableUndo === void 0)
    game.disableUndo = false;
  if (game.setup === void 0)
    game.setup = () => ({});
  if (game.moves === void 0)
    game.moves = {};
  if (game.playerView === void 0)
    game.playerView = ({ G: G2 }) => G2;
  if (game.plugins === void 0)
    game.plugins = [];
  game.plugins.forEach((plugin2) => {
    if (plugin2.name === void 0) {
      throw new Error("Plugin missing name attribute");
    }
    if (plugin2.name.includes(" ")) {
      throw new Error(plugin2.name + ": Plugin name must not include spaces");
    }
  });
  if (game.name.includes(" ")) {
    throw new Error(game.name + ": Game name must not include spaces");
  }
  const flow = Flow(game);
  return {
    ...game,
    flow,
    moveNames: flow.moveNames,
    pluginNames: game.plugins.map((p2) => p2.name),
    processMove: (state, action) => {
      let moveFn = flow.getMove(state.ctx, action.type, action.playerID);
      if (IsLongFormMove(moveFn)) {
        moveFn = moveFn.move;
      }
      if (moveFn instanceof Function) {
        const fn2 = FnWrap(moveFn, GameMethod.MOVE, game.plugins);
        let args = [];
        if (action.args !== void 0) {
          args = Array.isArray(action.args) ? action.args : [action.args];
        }
        const context = {
          ...GetAPIs(state),
          G: state.G,
          ctx: state.ctx,
          playerID: action.playerID
        };
        return fn2(context, ...args);
      }
      error(`invalid move object: ${action.type}`);
      return state.G;
    }
  };
}
function IsLongFormMove(move) {
  return move instanceof Object && move.move !== void 0;
}
var UpdateErrorType;
(function(UpdateErrorType2) {
  UpdateErrorType2["UnauthorizedAction"] = "update/unauthorized_action";
  UpdateErrorType2["MatchNotFound"] = "update/match_not_found";
  UpdateErrorType2["PatchFailed"] = "update/patch_failed";
})(UpdateErrorType || (UpdateErrorType = {}));
var ActionErrorType;
(function(ActionErrorType2) {
  ActionErrorType2["StaleStateId"] = "action/stale_state_id";
  ActionErrorType2["UnavailableMove"] = "action/unavailable_move";
  ActionErrorType2["InvalidMove"] = "action/invalid_move";
  ActionErrorType2["InactivePlayer"] = "action/inactive_player";
  ActionErrorType2["GameOver"] = "action/gameover";
  ActionErrorType2["ActionDisabled"] = "action/action_disabled";
  ActionErrorType2["ActionInvalid"] = "action/action_invalid";
  ActionErrorType2["PluginActionInvalid"] = "action/plugin_invalid";
})(ActionErrorType || (ActionErrorType = {}));
var actionHasPlayerID = (action) => action.payload.playerID !== null && action.payload.playerID !== void 0;
var CanUndoMove = (G2, ctx, move) => {
  function HasUndoable(move2) {
    return move2.undoable !== void 0;
  }
  function IsFunction(undoable) {
    return undoable instanceof Function;
  }
  if (!HasUndoable(move)) {
    return true;
  }
  if (IsFunction(move.undoable)) {
    return move.undoable({ G: G2, ctx });
  }
  return move.undoable;
};
function updateUndoRedoState(state, opts) {
  if (opts.game.disableUndo)
    return state;
  const undoEntry = {
    G: state.G,
    ctx: state.ctx,
    plugins: state.plugins,
    playerID: opts.action.payload.playerID || state.ctx.currentPlayer
  };
  if (opts.action.type === "MAKE_MOVE") {
    undoEntry.moveType = opts.action.payload.type;
  }
  return {
    ...state,
    _undo: [...state._undo, undoEntry],
    // Always reset redo stack when making a move or event
    _redo: []
  };
}
function initializeDeltalog(state, action, move) {
  const logEntry = {
    action,
    _stateID: state._stateID,
    turn: state.ctx.turn,
    phase: state.ctx.phase
  };
  const pluginLogMetadata = state.plugins.log.data.metadata;
  if (pluginLogMetadata !== void 0) {
    logEntry.metadata = pluginLogMetadata;
  }
  if (typeof move === "object" && move.redact === true) {
    logEntry.redact = true;
  } else if (typeof move === "object" && move.redact instanceof Function) {
    logEntry.redact = move.redact({ G: state.G, ctx: state.ctx });
  }
  return {
    ...state,
    deltalog: [logEntry]
  };
}
function flushAndValidatePlugins(state, oldState, pluginOpts) {
  const [newState, isInvalid] = FlushAndValidate(state, pluginOpts);
  if (!isInvalid)
    return [newState];
  return [
    newState,
    WithError(oldState, ActionErrorType.PluginActionInvalid, isInvalid)
  ];
}
function ExtractTransients(transientState) {
  if (!transientState) {
    return [null, void 0];
  }
  const { transients, ...state } = transientState;
  return [state, transients];
}
function WithError(state, errorType, payload) {
  const error2 = {
    type: errorType,
    payload
  };
  return {
    ...state,
    transients: {
      error: error2
    }
  };
}
var TransientHandlingMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case STRIP_TRANSIENTS: {
      return result;
    }
    default: {
      const [, transients] = ExtractTransients(store.getState());
      if (typeof transients !== "undefined") {
        store.dispatch(stripTransients());
        return {
          ...result,
          transients
        };
      }
      return result;
    }
  }
};
function CreateGameReducer({ game, isClient }) {
  game = ProcessGameConfig(game);
  return (stateWithTransients = null, action) => {
    let [
      state
      /*, transients */
    ] = ExtractTransients(stateWithTransients);
    switch (action.type) {
      case STRIP_TRANSIENTS: {
        return state;
      }
      case GAME_EVENT: {
        state = { ...state, deltalog: [] };
        if (isClient) {
          return state;
        }
        if (state.ctx.gameover !== void 0) {
          error(`cannot call event after game end`);
          return WithError(state, ActionErrorType.GameOver);
        }
        if (actionHasPlayerID(action) && !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)) {
          error(`disallowed event: ${action.payload.type}`);
          return WithError(state, ActionErrorType.InactivePlayer);
        }
        state = Enhance(state, {
          game,
          isClient: false,
          playerID: action.payload.playerID
        });
        let newState = game.flow.processEvent(state, action);
        let stateWithError;
        [newState, stateWithError] = flushAndValidatePlugins(newState, state, {
          game,
          isClient: false
        });
        if (stateWithError)
          return stateWithError;
        newState = updateUndoRedoState(newState, { game, action });
        return { ...newState, _stateID: state._stateID + 1 };
      }
      case MAKE_MOVE: {
        const oldState = state = { ...state, deltalog: [] };
        const move = game.flow.getMove(state.ctx, action.payload.type, action.payload.playerID || state.ctx.currentPlayer);
        if (move === null) {
          error(`disallowed move: ${action.payload.type}`);
          return WithError(state, ActionErrorType.UnavailableMove);
        }
        if (isClient && move.client === false) {
          return state;
        }
        if (state.ctx.gameover !== void 0) {
          error(`cannot make move after game end`);
          return WithError(state, ActionErrorType.GameOver);
        }
        if (actionHasPlayerID(action) && !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)) {
          error(`disallowed move: ${action.payload.type}`);
          return WithError(state, ActionErrorType.InactivePlayer);
        }
        state = Enhance(state, {
          game,
          isClient,
          playerID: action.payload.playerID
        });
        const G2 = game.processMove(state, action.payload);
        if (G2 === INVALID_MOVE) {
          error(`invalid move: ${action.payload.type} args: ${action.payload.args}`);
          return WithError(state, ActionErrorType.InvalidMove);
        }
        const newState = { ...state, G: G2 };
        if (isClient && NoClient(newState, { game })) {
          return state;
        }
        state = newState;
        if (isClient) {
          let stateWithError2;
          [state, stateWithError2] = flushAndValidatePlugins(state, oldState, {
            game,
            isClient: true
          });
          if (stateWithError2)
            return stateWithError2;
          return {
            ...state,
            _stateID: state._stateID + 1
          };
        }
        state = initializeDeltalog(state, action, move);
        state = game.flow.processMove(state, action.payload);
        let stateWithError;
        [state, stateWithError] = flushAndValidatePlugins(state, oldState, {
          game
        });
        if (stateWithError)
          return stateWithError;
        state = updateUndoRedoState(state, { game, action });
        return {
          ...state,
          _stateID: state._stateID + 1
        };
      }
      case RESET:
      case UPDATE:
      case SYNC: {
        return action.state;
      }
      case UNDO: {
        state = { ...state, deltalog: [] };
        if (game.disableUndo) {
          error("Undo is not enabled");
          return WithError(state, ActionErrorType.ActionDisabled);
        }
        const { G: G2, ctx, _undo, _redo, _stateID } = state;
        if (_undo.length < 2) {
          error(`No moves to undo`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        const last = _undo[_undo.length - 1];
        const restore = _undo[_undo.length - 2];
        if (actionHasPlayerID(action) && action.payload.playerID !== last.playerID) {
          error(`Cannot undo other players' moves`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        if (last.moveType) {
          const lastMove = game.flow.getMove(restore.ctx, last.moveType, last.playerID);
          if (!CanUndoMove(G2, ctx, lastMove)) {
            error(`Move cannot be undone`);
            return WithError(state, ActionErrorType.ActionInvalid);
          }
        }
        state = initializeDeltalog(state, action);
        return {
          ...state,
          G: restore.G,
          ctx: restore.ctx,
          plugins: restore.plugins,
          _stateID: _stateID + 1,
          _undo: _undo.slice(0, -1),
          _redo: [last, ..._redo]
        };
      }
      case REDO: {
        state = { ...state, deltalog: [] };
        if (game.disableUndo) {
          error("Redo is not enabled");
          return WithError(state, ActionErrorType.ActionDisabled);
        }
        const { _undo, _redo, _stateID } = state;
        if (_redo.length === 0) {
          error(`No moves to redo`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        const first = _redo[0];
        if (actionHasPlayerID(action) && action.payload.playerID !== first.playerID) {
          error(`Cannot redo other players' moves`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        state = initializeDeltalog(state, action);
        return {
          ...state,
          G: first.G,
          ctx: first.ctx,
          plugins: first.plugins,
          _stateID: _stateID + 1,
          _undo: [..._undo, first],
          _redo: _redo.slice(1)
        };
      }
      case PLUGIN: {
        return ProcessAction(state, action, { game });
      }
      case PATCH: {
        const oldState = state;
        const newState = JSON.parse(JSON.stringify(oldState));
        const patchError = (0, import_rfc6902.applyPatch)(newState, action.patch);
        const hasError = patchError.some((entry) => entry !== null);
        if (hasError) {
          error(`Patch ${JSON.stringify(action.patch)} apply failed`);
          return WithError(oldState, UpdateErrorType.PatchFailed, patchError);
        } else {
          return newState;
        }
      }
      default: {
        return state;
      }
    }
  };
}

// node_modules/boardgame.io/dist/esm/multiplayer.js
var import_rfc69023 = __toESM(require_rfc6902());

// node_modules/boardgame.io/dist/esm/initialize-7316768f.js
function InitializeGame({ game, numPlayers, setupData }) {
  game = ProcessGameConfig(game);
  if (!numPlayers) {
    numPlayers = 2;
  }
  const ctx = game.flow.ctx(numPlayers);
  let state = {
    // User managed state.
    G: {},
    // Framework managed state.
    ctx,
    // Plugin related state.
    plugins: {}
  };
  state = Setup(state, { game });
  state = Enhance(state, { game, playerID: void 0 });
  const pluginAPIs = GetAPIs(state);
  state.G = game.setup({ ...pluginAPIs, ctx: state.ctx }, setupData);
  let initial = {
    ...state,
    // List of {G, ctx} pairs that can be undone.
    _undo: [],
    // List of {G, ctx} pairs that can be redone.
    _redo: [],
    // A monotonically non-decreasing ID to ensure that
    // state updates are only allowed from clients that
    // are at the same version that the server.
    _stateID: 0
  };
  initial = game.flow.init(initial);
  [initial] = FlushAndValidate(initial, { game });
  if (!game.disableUndo) {
    initial._undo = [
      {
        G: initial.G,
        ctx: initial.ctx,
        plugins: initial.plugins
      }
    ];
  }
  return initial;
}

// node_modules/boardgame.io/dist/esm/transport-ce07b771.js
var Transport = class {
  constructor({ transportDataCallback, gameName, playerID, matchID, credentials, numPlayers }) {
    this.connectionStatusCallback = () => {
    };
    this.isConnected = false;
    this.transportDataCallback = transportDataCallback;
    this.gameName = gameName || "default";
    this.playerID = playerID || null;
    this.matchID = matchID || "default";
    this.credentials = credentials;
    this.numPlayers = numPlayers || 2;
  }
  /** Subscribe to connection state changes. */
  subscribeToConnectionStatus(fn2) {
    this.connectionStatusCallback = fn2;
  }
  /** Transport implementations should call this when they connect/disconnect. */
  setConnectionStatus(isConnected) {
    this.isConnected = isConnected;
    this.connectionStatusCallback();
  }
  /** Transport implementations should call this when they receive data from a master. */
  notifyClient(data) {
    this.transportDataCallback(data);
  }
};

// node_modules/boardgame.io/dist/esm/util-991e76bb.js
var Type;
(function(Type2) {
  Type2[Type2["SYNC"] = 0] = "SYNC";
  Type2[Type2["ASYNC"] = 1] = "ASYNC";
})(Type || (Type = {}));
function isSynchronous(storageAPI) {
  return storageAPI.type() === Type.SYNC;
}
var Sync = class {
  type() {
    return Type.SYNC;
  }
  /**
   * Connect.
   */
  connect() {
    return;
  }
  /**
   * Create a new match.
   *
   * This might just need to call setState and setMetadata in
   * most implementations.
   *
   * However, it exists as a separate call so that the
   * implementation can provision things differently when
   * a match is created.  For example, it might stow away the
   * initial match state in a separate field for easier retrieval.
   */
  /* istanbul ignore next */
  createMatch(matchID, opts) {
    if (this.createGame) {
      console.warn("The database connector does not implement a createMatch method.", "\nUsing the deprecated createGame method instead.");
      return this.createGame(matchID, opts);
    } else {
      console.error("The database connector does not implement a createMatch method.");
    }
  }
  /**
   * Return all matches.
   */
  /* istanbul ignore next */
  listMatches(opts) {
    if (this.listGames) {
      console.warn("The database connector does not implement a listMatches method.", "\nUsing the deprecated listGames method instead.");
      return this.listGames(opts);
    } else {
      console.error("The database connector does not implement a listMatches method.");
    }
  }
};
var createMetadata = ({ game, unlisted, setupData, numPlayers }) => {
  const metadata = {
    gameName: game.name,
    unlisted: !!unlisted,
    players: {},
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  if (setupData !== void 0)
    metadata.setupData = setupData;
  for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
    metadata.players[playerIndex] = { id: playerIndex };
  }
  return metadata;
};
var createMatch = ({ game, numPlayers, setupData, unlisted }) => {
  if (!numPlayers || typeof numPlayers !== "number")
    numPlayers = 2;
  const setupDataError = game.validateSetupData && game.validateSetupData(setupData, numPlayers);
  if (setupDataError !== void 0)
    return { setupDataError };
  const metadata = createMetadata({ game, numPlayers, setupData, unlisted });
  const initialState = InitializeGame({ game, numPlayers, setupData });
  return { metadata, initialState };
};

// node_modules/boardgame.io/dist/esm/master-17425f07.js
var import_redux = __toESM(require_redux());
var filterMatchData = (matchData) => Object.values(matchData.players).map((player) => {
  const { credentials, ...filteredData } = player;
  return filteredData;
});
var stripCredentialsFromAction = (action) => {
  const { credentials, ...payload } = action.payload;
  return { ...action, payload };
};
var Master = class {
  constructor(game, storageAPI, transportAPI, auth) {
    this.game = ProcessGameConfig(game);
    this.storageAPI = storageAPI;
    this.transportAPI = transportAPI;
    this.subscribeCallback = () => {
    };
    this.auth = auth;
  }
  subscribe(fn2) {
    this.subscribeCallback = fn2;
  }
  /**
   * Called on each move / event made by the client.
   * Computes the new value of the game state and returns it
   * along with a deltalog.
   */
  async onUpdate(credAction, stateID, matchID, playerID) {
    if (!credAction || !credAction.payload) {
      return { error: "missing action or action payload" };
    }
    let metadata;
    if (isSynchronous(this.storageAPI)) {
      ({ metadata } = this.storageAPI.fetch(matchID, { metadata: true }));
    } else {
      ({ metadata } = await this.storageAPI.fetch(matchID, { metadata: true }));
    }
    if (this.auth) {
      const isAuthentic = await this.auth.authenticateCredentials({
        playerID,
        credentials: credAction.payload.credentials,
        metadata
      });
      if (!isAuthentic) {
        return { error: "unauthorized action" };
      }
    }
    const action = stripCredentialsFromAction(credAction);
    const key = matchID;
    let state;
    if (isSynchronous(this.storageAPI)) {
      ({ state } = this.storageAPI.fetch(key, { state: true }));
    } else {
      ({ state } = await this.storageAPI.fetch(key, { state: true }));
    }
    if (state === void 0) {
      error(`game not found, matchID=[${key}]`);
      return { error: "game not found" };
    }
    if (state.ctx.gameover !== void 0) {
      error(`game over - matchID=[${key}] - playerID=[${playerID}] - action[${action.payload.type}]`);
      return;
    }
    const reducer = CreateGameReducer({
      game: this.game
    });
    const middleware = (0, import_redux.applyMiddleware)(TransientHandlingMiddleware);
    const store = (0, import_redux.createStore)(reducer, state, middleware);
    if (action.type == UNDO || action.type == REDO) {
      const hasActivePlayers = state.ctx.activePlayers !== null;
      const isCurrentPlayer = state.ctx.currentPlayer === playerID;
      if (
        // If activePlayers is empty, non-current players can’t undo.
        !hasActivePlayers && !isCurrentPlayer || // If player is not active or multiple players are active, can’t undo.
        hasActivePlayers && (state.ctx.activePlayers[playerID] === void 0 || Object.keys(state.ctx.activePlayers).length > 1)
      ) {
        error(`playerID=[${playerID}] cannot undo / redo right now`);
        return;
      }
    }
    if (!this.game.flow.isPlayerActive(state.G, state.ctx, playerID)) {
      error(`player not active - playerID=[${playerID}] - action[${action.payload.type}]`);
      return;
    }
    const move = action.type == MAKE_MOVE ? this.game.flow.getMove(state.ctx, action.payload.type, playerID) : null;
    if (action.type == MAKE_MOVE && !move) {
      error(`move not processed - canPlayerMakeMove=false - playerID=[${playerID}] - action[${action.payload.type}]`);
      return;
    }
    if (state._stateID !== stateID && !(move && IsLongFormMove(move) && move.ignoreStaleStateID)) {
      error(`invalid stateID, was=[${stateID}], expected=[${state._stateID}] - playerID=[${playerID}] - action[${action.payload.type}]`);
      return;
    }
    const prevState = store.getState();
    store.dispatch(action);
    state = store.getState();
    this.subscribeCallback({
      state,
      action,
      matchID
    });
    if (this.game.deltaState) {
      this.transportAPI.sendAll({
        type: "patch",
        args: [matchID, stateID, prevState, state]
      });
    } else {
      this.transportAPI.sendAll({
        type: "update",
        args: [matchID, state]
      });
    }
    const { deltalog, ...stateWithoutDeltalog } = state;
    let newMetadata;
    if (metadata && (metadata.gameover === void 0 || metadata.gameover === null)) {
      newMetadata = {
        ...metadata,
        updatedAt: Date.now()
      };
      if (state.ctx.gameover !== void 0) {
        newMetadata.gameover = state.ctx.gameover;
      }
    }
    if (isSynchronous(this.storageAPI)) {
      this.storageAPI.setState(key, stateWithoutDeltalog, deltalog);
      if (newMetadata)
        this.storageAPI.setMetadata(key, newMetadata);
    } else {
      const writes = [
        this.storageAPI.setState(key, stateWithoutDeltalog, deltalog)
      ];
      if (newMetadata) {
        writes.push(this.storageAPI.setMetadata(key, newMetadata));
      }
      await Promise.all(writes);
    }
  }
  /**
   * Called when the client connects / reconnects.
   * Returns the latest game state and the entire log.
   */
  async onSync(matchID, playerID, credentials, numPlayers = 2) {
    const key = matchID;
    const fetchOpts = {
      state: true,
      metadata: true,
      log: true,
      initialState: true
    };
    const fetchResult = isSynchronous(this.storageAPI) ? this.storageAPI.fetch(key, fetchOpts) : await this.storageAPI.fetch(key, fetchOpts);
    let { state, initialState, log, metadata } = fetchResult;
    if (this.auth && playerID !== void 0 && playerID !== null) {
      const isAuthentic = await this.auth.authenticateCredentials({
        playerID,
        credentials,
        metadata
      });
      if (!isAuthentic) {
        return { error: "unauthorized" };
      }
    }
    if (state === void 0) {
      const match = createMatch({
        game: this.game,
        unlisted: true,
        numPlayers,
        setupData: void 0
      });
      if ("setupDataError" in match) {
        return { error: "game requires setupData" };
      }
      initialState = state = match.initialState;
      metadata = match.metadata;
      this.subscribeCallback({ state, matchID });
      if (isSynchronous(this.storageAPI)) {
        this.storageAPI.createMatch(key, { initialState, metadata });
      } else {
        await this.storageAPI.createMatch(key, { initialState, metadata });
      }
    }
    const filteredMetadata = metadata ? filterMatchData(metadata) : void 0;
    const syncInfo = {
      state,
      log,
      filteredMetadata,
      initialState
    };
    this.transportAPI.send({
      playerID,
      type: "sync",
      args: [matchID, syncInfo]
    });
    return;
  }
  /**
   * Called when a client connects or disconnects.
   * Updates and sends out metadata to reflect the player’s connection status.
   */
  async onConnectionChange(matchID, playerID, credentials, connected) {
    const key = matchID;
    if (playerID === void 0 || playerID === null) {
      return;
    }
    let metadata;
    if (isSynchronous(this.storageAPI)) {
      ({ metadata } = this.storageAPI.fetch(key, { metadata: true }));
    } else {
      ({ metadata } = await this.storageAPI.fetch(key, { metadata: true }));
    }
    if (metadata === void 0) {
      error(`metadata not found for matchID=[${key}]`);
      return { error: "metadata not found" };
    }
    if (metadata.players[playerID] === void 0) {
      error(`Player not in the match, matchID=[${key}] playerID=[${playerID}]`);
      return { error: "player not in the match" };
    }
    if (this.auth) {
      const isAuthentic = await this.auth.authenticateCredentials({
        playerID,
        credentials,
        metadata
      });
      if (!isAuthentic) {
        return { error: "unauthorized" };
      }
    }
    metadata.players[playerID].isConnected = connected;
    const filteredMetadata = filterMatchData(metadata);
    this.transportAPI.sendAll({
      type: "matchData",
      args: [matchID, filteredMetadata]
    });
    if (isSynchronous(this.storageAPI)) {
      this.storageAPI.setMetadata(key, metadata);
    } else {
      await this.storageAPI.setMetadata(key, metadata);
    }
  }
  async onChatMessage(matchID, chatMessage, credentials) {
    const key = matchID;
    if (this.auth) {
      const { metadata } = await this.storageAPI.fetch(key, {
        metadata: true
      });
      if (!(chatMessage && typeof chatMessage.sender === "string")) {
        return { error: "unauthorized" };
      }
      const isAuthentic = await this.auth.authenticateCredentials({
        playerID: chatMessage.sender,
        credentials,
        metadata
      });
      if (!isAuthentic) {
        return { error: "unauthorized" };
      }
    }
    this.transportAPI.sendAll({
      type: "chat",
      args: [matchID, chatMessage]
    });
  }
};

// node_modules/boardgame.io/dist/esm/filter-player-view-43ed49b0.js
var import_rfc69022 = __toESM(require_rfc6902());
var applyPlayerView = (game, playerID, state) => ({
  ...state,
  G: game.playerView({ G: state.G, ctx: state.ctx, playerID }),
  plugins: PlayerView(state, { playerID, game }),
  deltalog: void 0,
  _undo: [],
  _redo: []
});
var getFilterPlayerView = (game) => (playerID, payload) => {
  switch (payload.type) {
    case "patch": {
      const [matchID, stateID, prevState, state] = payload.args;
      const log = redactLog(state.deltalog, playerID);
      const filteredState = applyPlayerView(game, playerID, state);
      const newStateID = state._stateID;
      const prevFilteredState = applyPlayerView(game, playerID, prevState);
      const patch2 = (0, import_rfc69022.createPatch)(prevFilteredState, filteredState);
      return {
        type: "patch",
        args: [matchID, stateID, newStateID, patch2, log]
      };
    }
    case "update": {
      const [matchID, state] = payload.args;
      const log = redactLog(state.deltalog, playerID);
      const filteredState = applyPlayerView(game, playerID, state);
      return {
        type: "update",
        args: [matchID, filteredState, log]
      };
    }
    case "sync": {
      const [matchID, syncInfo] = payload.args;
      const filteredState = applyPlayerView(game, playerID, syncInfo.state);
      const log = redactLog(syncInfo.log, playerID);
      const newSyncInfo = {
        ...syncInfo,
        state: filteredState,
        log
      };
      return {
        type: "sync",
        args: [matchID, newSyncInfo]
      };
    }
    default: {
      return payload;
    }
  }
};
function redactLog(log, playerID) {
  if (log === void 0) {
    return log;
  }
  return log.map((logEvent) => {
    if (playerID !== null && +playerID === +logEvent.action.payload.playerID) {
      return logEvent;
    }
    if (logEvent.redact !== true) {
      return logEvent;
    }
    const payload = {
      ...logEvent.action.payload,
      args: null
    };
    const filteredEvent = {
      ...logEvent,
      action: { ...logEvent.action, payload }
    };
    const { redact, ...remaining } = filteredEvent;
    return remaining;
  });
}

// node_modules/engine.io-client/build/esm-debug/transports/polling-xhr.node.js
var XMLHttpRequestModule = __toESM(require_XMLHttpRequest(), 1);

// node_modules/engine.io-parser/build/esm/commons.js
var PACKET_TYPES = /* @__PURE__ */ Object.create(null);
PACKET_TYPES["open"] = "0";
PACKET_TYPES["close"] = "1";
PACKET_TYPES["ping"] = "2";
PACKET_TYPES["pong"] = "3";
PACKET_TYPES["message"] = "4";
PACKET_TYPES["upgrade"] = "5";
PACKET_TYPES["noop"] = "6";
var PACKET_TYPES_REVERSE = /* @__PURE__ */ Object.create(null);
Object.keys(PACKET_TYPES).forEach((key) => {
  PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
});
var ERROR_PACKET = { type: "error", data: "parser error" };

// node_modules/engine.io-parser/build/esm/encodePacket.js
var encodePacket = ({ type, data }, supportsBinary, callback) => {
  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return callback(supportsBinary ? data : "b" + toBuffer(data, true).toString("base64"));
  }
  return callback(PACKET_TYPES[type] + (data || ""));
};
var toBuffer = (data, forceBufferConversion) => {
  if (Buffer.isBuffer(data) || data instanceof Uint8Array && !forceBufferConversion) {
    return data;
  } else if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  } else {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }
};
var TEXT_ENCODER;
function encodePacketToBinary(packet, callback) {
  if (packet.data instanceof ArrayBuffer || ArrayBuffer.isView(packet.data)) {
    return callback(toBuffer(packet.data, false));
  }
  encodePacket(packet, true, (encoded) => {
    if (!TEXT_ENCODER) {
      TEXT_ENCODER = new TextEncoder();
    }
    callback(TEXT_ENCODER.encode(encoded));
  });
}

// node_modules/engine.io-parser/build/esm/decodePacket.js
var decodePacket = (encodedPacket, binaryType) => {
  if (typeof encodedPacket !== "string") {
    return {
      type: "message",
      data: mapBinary(encodedPacket, binaryType)
    };
  }
  const type = encodedPacket.charAt(0);
  if (type === "b") {
    const buffer = Buffer.from(encodedPacket.substring(1), "base64");
    return {
      type: "message",
      data: mapBinary(buffer, binaryType)
    };
  }
  if (!PACKET_TYPES_REVERSE[type]) {
    return ERROR_PACKET;
  }
  return encodedPacket.length > 1 ? {
    type: PACKET_TYPES_REVERSE[type],
    data: encodedPacket.substring(1)
  } : {
    type: PACKET_TYPES_REVERSE[type]
  };
};
var mapBinary = (data, binaryType) => {
  switch (binaryType) {
    case "arraybuffer":
      if (data instanceof ArrayBuffer) {
        return data;
      } else if (Buffer.isBuffer(data)) {
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      } else {
        return data.buffer;
      }
    case "nodebuffer":
    default:
      if (Buffer.isBuffer(data)) {
        return data;
      } else {
        return Buffer.from(data);
      }
  }
};

// node_modules/engine.io-parser/build/esm/index.js
var SEPARATOR = String.fromCharCode(30);
var encodePayload = (packets, callback) => {
  const length = packets.length;
  const encodedPackets = new Array(length);
  let count = 0;
  packets.forEach((packet, i2) => {
    encodePacket(packet, false, (encodedPacket) => {
      encodedPackets[i2] = encodedPacket;
      if (++count === length) {
        callback(encodedPackets.join(SEPARATOR));
      }
    });
  });
};
var decodePayload = (encodedPayload, binaryType) => {
  const encodedPackets = encodedPayload.split(SEPARATOR);
  const packets = [];
  for (let i2 = 0; i2 < encodedPackets.length; i2++) {
    const decodedPacket = decodePacket(encodedPackets[i2], binaryType);
    packets.push(decodedPacket);
    if (decodedPacket.type === "error") {
      break;
    }
  }
  return packets;
};
function createPacketEncoderStream() {
  return new TransformStream({
    transform(packet, controller) {
      encodePacketToBinary(packet, (encodedPacket) => {
        const payloadLength = encodedPacket.length;
        let header;
        if (payloadLength < 126) {
          header = new Uint8Array(1);
          new DataView(header.buffer).setUint8(0, payloadLength);
        } else if (payloadLength < 65536) {
          header = new Uint8Array(3);
          const view = new DataView(header.buffer);
          view.setUint8(0, 126);
          view.setUint16(1, payloadLength);
        } else {
          header = new Uint8Array(9);
          const view = new DataView(header.buffer);
          view.setUint8(0, 127);
          view.setBigUint64(1, BigInt(payloadLength));
        }
        if (packet.data && typeof packet.data !== "string") {
          header[0] |= 128;
        }
        controller.enqueue(header);
        controller.enqueue(encodedPacket);
      });
    }
  });
}
var TEXT_DECODER;
function totalLength(chunks) {
  return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
}
function concatChunks(chunks, size) {
  if (chunks[0].length === size) {
    return chunks.shift();
  }
  const buffer = new Uint8Array(size);
  let j2 = 0;
  for (let i2 = 0; i2 < size; i2++) {
    buffer[i2] = chunks[0][j2++];
    if (j2 === chunks[0].length) {
      chunks.shift();
      j2 = 0;
    }
  }
  if (chunks.length && j2 < chunks[0].length) {
    chunks[0] = chunks[0].slice(j2);
  }
  return buffer;
}
function createPacketDecoderStream(maxPayload, binaryType) {
  if (!TEXT_DECODER) {
    TEXT_DECODER = new TextDecoder();
  }
  const chunks = [];
  let state = 0;
  let expectedLength = -1;
  let isBinary2 = false;
  return new TransformStream({
    transform(chunk, controller) {
      chunks.push(chunk);
      while (true) {
        if (state === 0) {
          if (totalLength(chunks) < 1) {
            break;
          }
          const header = concatChunks(chunks, 1);
          isBinary2 = (header[0] & 128) === 128;
          expectedLength = header[0] & 127;
          if (expectedLength < 126) {
            state = 3;
          } else if (expectedLength === 126) {
            state = 1;
          } else {
            state = 2;
          }
        } else if (state === 1) {
          if (totalLength(chunks) < 2) {
            break;
          }
          const headerArray = concatChunks(chunks, 2);
          expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
          state = 3;
        } else if (state === 2) {
          if (totalLength(chunks) < 8) {
            break;
          }
          const headerArray = concatChunks(chunks, 8);
          const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
          const n2 = view.getUint32(0);
          if (n2 > Math.pow(2, 53 - 32) - 1) {
            controller.enqueue(ERROR_PACKET);
            break;
          }
          expectedLength = n2 * Math.pow(2, 32) + view.getUint32(4);
          state = 3;
        } else {
          if (totalLength(chunks) < expectedLength) {
            break;
          }
          const data = concatChunks(chunks, expectedLength);
          controller.enqueue(decodePacket(isBinary2 ? data : TEXT_DECODER.decode(data), binaryType));
          state = 0;
        }
        if (expectedLength === 0 || expectedLength > maxPayload) {
          controller.enqueue(ERROR_PACKET);
          break;
        }
      }
    }
  });
}
var protocol = 4;

// node_modules/engine.io-client/build/esm-debug/transport.js
var import_component_emitter = __toESM(require_cjs(), 1);

// node_modules/engine.io-client/build/esm-debug/globals.node.js
var nextTick = process.nextTick;
var globalThisShim = global;
var defaultBinaryType = "nodebuffer";
function createCookieJar() {
  return new CookieJar();
}
function parse(setCookieString) {
  const parts2 = setCookieString.split("; ");
  const i2 = parts2[0].indexOf("=");
  if (i2 === -1) {
    return;
  }
  const name = parts2[0].substring(0, i2).trim();
  if (!name.length) {
    return;
  }
  let value2 = parts2[0].substring(i2 + 1).trim();
  if (value2.charCodeAt(0) === 34) {
    value2 = value2.slice(1, -1);
  }
  const cookie = {
    name,
    value: value2
  };
  for (let j2 = 1; j2 < parts2.length; j2++) {
    const subParts = parts2[j2].split("=");
    if (subParts.length !== 2) {
      continue;
    }
    const key = subParts[0].trim();
    const value3 = subParts[1].trim();
    switch (key) {
      case "Expires":
        cookie.expires = new Date(value3);
        break;
      case "Max-Age":
        const expiration = /* @__PURE__ */ new Date();
        expiration.setUTCSeconds(expiration.getUTCSeconds() + parseInt(value3, 10));
        cookie.expires = expiration;
        break;
      default:
    }
  }
  return cookie;
}
var CookieJar = class {
  constructor() {
    this._cookies = /* @__PURE__ */ new Map();
  }
  parseCookies(values) {
    if (!values) {
      return;
    }
    values.forEach((value2) => {
      const parsed = parse(value2);
      if (parsed) {
        this._cookies.set(parsed.name, parsed);
      }
    });
  }
  get cookies() {
    const now2 = Date.now();
    this._cookies.forEach((cookie, name) => {
      var _a;
      if (((_a = cookie.expires) === null || _a === void 0 ? void 0 : _a.getTime()) < now2) {
        this._cookies.delete(name);
      }
    });
    return this._cookies.entries();
  }
  addCookies(xhr) {
    const cookies = [];
    for (const [name, cookie] of this.cookies) {
      cookies.push(`${name}=${cookie.value}`);
    }
    if (cookies.length) {
      xhr.setDisableHeaderCheck(true);
      xhr.setRequestHeader("cookie", cookies.join("; "));
    }
  }
  appendCookies(headers) {
    for (const [name, cookie] of this.cookies) {
      headers.append("cookie", `${name}=${cookie.value}`);
    }
  }
};

// node_modules/engine.io-client/build/esm-debug/util.js
function pick(obj, ...attr2) {
  return attr2.reduce((acc, k2) => {
    if (obj.hasOwnProperty(k2)) {
      acc[k2] = obj[k2];
    }
    return acc;
  }, {});
}
var NATIVE_SET_TIMEOUT = globalThisShim.setTimeout;
var NATIVE_CLEAR_TIMEOUT = globalThisShim.clearTimeout;
function installTimerFunctions(obj, opts) {
  if (opts.useNativeTimers) {
    obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
    obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
  } else {
    obj.setTimeoutFn = globalThisShim.setTimeout.bind(globalThisShim);
    obj.clearTimeoutFn = globalThisShim.clearTimeout.bind(globalThisShim);
  }
}
var BASE64_OVERHEAD = 1.33;
function byteLength(obj) {
  if (typeof obj === "string") {
    return utf8Length(obj);
  }
  return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
}
function utf8Length(str) {
  let c2 = 0, length = 0;
  for (let i2 = 0, l2 = str.length; i2 < l2; i2++) {
    c2 = str.charCodeAt(i2);
    if (c2 < 128) {
      length += 1;
    } else if (c2 < 2048) {
      length += 2;
    } else if (c2 < 55296 || c2 >= 57344) {
      length += 3;
    } else {
      i2++;
      length += 4;
    }
  }
  return length;
}
function randomString() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}

// node_modules/engine.io-client/build/esm-debug/contrib/parseqs.js
function encode(obj) {
  let str = "";
  for (let i2 in obj) {
    if (obj.hasOwnProperty(i2)) {
      if (str.length)
        str += "&";
      str += encodeURIComponent(i2) + "=" + encodeURIComponent(obj[i2]);
    }
  }
  return str;
}
function decode(qs) {
  let qry = {};
  let pairs = qs.split("&");
  for (let i2 = 0, l2 = pairs.length; i2 < l2; i2++) {
    let pair = pairs[i2].split("=");
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
}

// node_modules/engine.io-client/build/esm-debug/transport.js
var import_debug = __toESM(require_src(), 1);
var debug = (0, import_debug.default)("engine.io-client:transport");
var TransportError = class extends Error {
  constructor(reason, description, context) {
    super(reason);
    this.description = description;
    this.context = context;
    this.type = "TransportError";
  }
};
var Transport2 = class extends import_component_emitter.Emitter {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(opts) {
    super();
    this.writable = false;
    installTimerFunctions(this, opts);
    this.opts = opts;
    this.query = opts.query;
    this.socket = opts.socket;
    this.supportsBinary = !opts.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(reason, description, context) {
    super.emitReserved("error", new TransportError(reason, description, context));
    return this;
  }
  /**
   * Opens the transport.
   */
  open() {
    this.readyState = "opening";
    this.doOpen();
    return this;
  }
  /**
   * Closes the transport.
   */
  close() {
    if (this.readyState === "opening" || this.readyState === "open") {
      this.doClose();
      this.onClose();
    }
    return this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(packets) {
    if (this.readyState === "open") {
      this.write(packets);
    } else {
      debug("transport is not open, discarding packets");
    }
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open";
    this.writable = true;
    super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(data) {
    const packet = decodePacket(data, this.socket.binaryType);
    this.onPacket(packet);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(packet) {
    super.emitReserved("packet", packet);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(details) {
    this.readyState = "closed";
    super.emitReserved("close", details);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(onPause) {
  }
  createUri(schema, query = {}) {
    return schema + "://" + this._hostname() + this._port() + this.opts.path + this._query(query);
  }
  _hostname() {
    const hostname = this.opts.hostname;
    return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
  }
  _port() {
    if (this.opts.port && (this.opts.secure && Number(this.opts.port) !== 443 || !this.opts.secure && Number(this.opts.port) !== 80)) {
      return ":" + this.opts.port;
    } else {
      return "";
    }
  }
  _query(query) {
    const encodedQuery = encode(query);
    return encodedQuery.length ? "?" + encodedQuery : "";
  }
};

// node_modules/engine.io-client/build/esm-debug/transports/polling.js
var import_debug2 = __toESM(require_src(), 1);
var debug2 = (0, import_debug2.default)("engine.io-client:polling");
var Polling = class extends Transport2 {
  constructor() {
    super(...arguments);
    this._polling = false;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(onPause) {
    this.readyState = "pausing";
    const pause = () => {
      debug2("paused");
      this.readyState = "paused";
      onPause();
    };
    if (this._polling || !this.writable) {
      let total = 0;
      if (this._polling) {
        debug2("we are currently polling - waiting to pause");
        total++;
        this.once("pollComplete", function() {
          debug2("pre-pause polling complete");
          --total || pause();
        });
      }
      if (!this.writable) {
        debug2("we are currently writing - waiting to pause");
        total++;
        this.once("drain", function() {
          debug2("pre-pause writing complete");
          --total || pause();
        });
      }
    } else {
      pause();
    }
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    debug2("polling");
    this._polling = true;
    this.doPoll();
    this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(data) {
    debug2("polling got data %s", data);
    const callback = (packet) => {
      if ("opening" === this.readyState && packet.type === "open") {
        this.onOpen();
      }
      if ("close" === packet.type) {
        this.onClose({ description: "transport closed by the server" });
        return false;
      }
      this.onPacket(packet);
    };
    decodePayload(data, this.socket.binaryType).forEach(callback);
    if ("closed" !== this.readyState) {
      this._polling = false;
      this.emitReserved("pollComplete");
      if ("open" === this.readyState) {
        this._poll();
      } else {
        debug2('ignoring poll - transport state "%s"', this.readyState);
      }
    }
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const close = () => {
      debug2("writing close packet");
      this.write([{ type: "close" }]);
    };
    if ("open" === this.readyState) {
      debug2("transport open - closing");
      close();
    } else {
      debug2("transport not open - deferring close");
      this.once("open", close);
    }
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(packets) {
    this.writable = false;
    encodePayload(packets, (data) => {
      this.doWrite(data, () => {
        this.writable = true;
        this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "https" : "http";
    const query = this.query || {};
    if (false !== this.opts.timestampRequests) {
      query[this.opts.timestampParam] = randomString();
    }
    if (!this.supportsBinary && !query.sid) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
};

// node_modules/engine.io-client/build/esm-debug/transports/polling-xhr.js
var import_component_emitter2 = __toESM(require_cjs(), 1);

// node_modules/engine.io-client/build/esm-debug/contrib/has-cors.js
var value = false;
try {
  value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
} catch (err) {
}
var hasCORS = value;

// node_modules/engine.io-client/build/esm-debug/transports/polling-xhr.js
var import_debug3 = __toESM(require_src(), 1);
var debug3 = (0, import_debug3.default)("engine.io-client:polling");
function empty() {
}
var BaseXHR = class extends Polling {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(opts) {
    super(opts);
    if (typeof location !== "undefined") {
      const isSSL = "https:" === location.protocol;
      let port = location.port;
      if (!port) {
        port = isSSL ? "443" : "80";
      }
      this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data - data to send.
   * @param {Function} fn - called upon flush.
   * @private
   */
  doWrite(data, fn2) {
    const req = this.request({
      method: "POST",
      data
    });
    req.on("success", fn2);
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr post error", xhrStatus, context);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    debug3("xhr poll");
    const req = this.request();
    req.on("data", this.onData.bind(this));
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr poll error", xhrStatus, context);
    });
    this.pollXhr = req;
  }
};
var Request = class _Request extends import_component_emitter2.Emitter {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(createRequest, uri, opts) {
    super();
    this.createRequest = createRequest;
    installTimerFunctions(this, opts);
    this._opts = opts;
    this._method = opts.method || "GET";
    this._uri = uri;
    this._data = void 0 !== opts.data ? opts.data : null;
    this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var _a;
    const opts = pick(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    opts.xdomain = !!this._opts.xd;
    const xhr = this._xhr = this.createRequest(opts);
    try {
      debug3("xhr open %s: %s", this._method, this._uri);
      xhr.open(this._method, this._uri, true);
      try {
        if (this._opts.extraHeaders) {
          xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
          for (let i2 in this._opts.extraHeaders) {
            if (this._opts.extraHeaders.hasOwnProperty(i2)) {
              xhr.setRequestHeader(i2, this._opts.extraHeaders[i2]);
            }
          }
        }
      } catch (e) {
      }
      if ("POST" === this._method) {
        try {
          xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch (e) {
        }
      }
      try {
        xhr.setRequestHeader("Accept", "*/*");
      } catch (e) {
      }
      (_a = this._opts.cookieJar) === null || _a === void 0 ? void 0 : _a.addCookies(xhr);
      if ("withCredentials" in xhr) {
        xhr.withCredentials = this._opts.withCredentials;
      }
      if (this._opts.requestTimeout) {
        xhr.timeout = this._opts.requestTimeout;
      }
      xhr.onreadystatechange = () => {
        var _a2;
        if (xhr.readyState === 3) {
          (_a2 = this._opts.cookieJar) === null || _a2 === void 0 ? void 0 : _a2.parseCookies(
            // @ts-ignore
            xhr.getResponseHeader("set-cookie")
          );
        }
        if (4 !== xhr.readyState)
          return;
        if (200 === xhr.status || 1223 === xhr.status) {
          this._onLoad();
        } else {
          this.setTimeoutFn(() => {
            this._onError(typeof xhr.status === "number" ? xhr.status : 0);
          }, 0);
        }
      };
      debug3("xhr data %s", this._data);
      xhr.send(this._data);
    } catch (e) {
      this.setTimeoutFn(() => {
        this._onError(e);
      }, 0);
      return;
    }
    if (typeof document !== "undefined") {
      this._index = _Request.requestsCount++;
      _Request.requests[this._index] = this;
    }
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(err) {
    this.emitReserved("error", err, this._xhr);
    this._cleanup(true);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(fromError) {
    if ("undefined" === typeof this._xhr || null === this._xhr) {
      return;
    }
    this._xhr.onreadystatechange = empty;
    if (fromError) {
      try {
        this._xhr.abort();
      } catch (e) {
      }
    }
    if (typeof document !== "undefined") {
      delete _Request.requests[this._index];
    }
    this._xhr = null;
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const data = this._xhr.responseText;
    if (data !== null) {
      this.emitReserved("data", data);
      this.emitReserved("success");
      this._cleanup();
    }
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
};
Request.requestsCount = 0;
Request.requests = {};
if (typeof document !== "undefined") {
  if (typeof attachEvent === "function") {
    attachEvent("onunload", unloadHandler);
  } else if (typeof addEventListener === "function") {
    const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
    addEventListener(terminationEvent, unloadHandler, false);
  }
}
function unloadHandler() {
  for (let i2 in Request.requests) {
    if (Request.requests.hasOwnProperty(i2)) {
      Request.requests[i2].abort();
    }
  }
}
var hasXHR2 = function() {
  const xhr = newRequest({
    xdomain: false
  });
  return xhr && xhr.responseType !== null;
}();
function newRequest(opts) {
  const xdomain = opts.xdomain;
  try {
    if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) {
  }
  if (!xdomain) {
    try {
      return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch (e) {
    }
  }
}

// node_modules/engine.io-client/build/esm-debug/transports/polling-xhr.node.js
var XMLHttpRequest2 = XMLHttpRequestModule.default || XMLHttpRequestModule;
var XHR = class extends BaseXHR {
  request(opts = {}) {
    var _a;
    Object.assign(opts, { xd: this.xd, cookieJar: (_a = this.socket) === null || _a === void 0 ? void 0 : _a._cookieJar }, this.opts);
    return new Request((opts2) => new XMLHttpRequest2(opts2), this.uri(), opts);
  }
};

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// node_modules/engine.io-client/build/esm-debug/transports/websocket.js
var import_debug4 = __toESM(require_src(), 1);
var debug4 = (0, import_debug4.default)("engine.io-client:websocket");
var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
var BaseWS = class extends Transport2 {
  get name() {
    return "websocket";
  }
  doOpen() {
    const uri = this.uri();
    const protocols = this.opts.protocols;
    const opts = isReactNative ? {} : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    if (this.opts.extraHeaders) {
      opts.headers = this.opts.extraHeaders;
    }
    try {
      this.ws = this.createSocket(uri, protocols, opts);
    } catch (err) {
      return this.emitReserved("error", err);
    }
    this.ws.binaryType = this.socket.binaryType;
    this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      if (this.opts.autoUnref) {
        this.ws._socket.unref();
      }
      this.onOpen();
    };
    this.ws.onclose = (closeEvent) => this.onClose({
      description: "websocket connection closed",
      context: closeEvent
    });
    this.ws.onmessage = (ev) => this.onData(ev.data);
    this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(packets) {
    this.writable = false;
    for (let i2 = 0; i2 < packets.length; i2++) {
      const packet = packets[i2];
      const lastPacket = i2 === packets.length - 1;
      encodePacket(packet, this.supportsBinary, (data) => {
        try {
          this.doWrite(packet, data);
        } catch (e) {
          debug4("websocket closed before onclose event");
        }
        if (lastPacket) {
          nextTick(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    if (typeof this.ws !== "undefined") {
      this.ws.onerror = () => {
      };
      this.ws.close();
      this.ws = null;
    }
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "wss" : "ws";
    const query = this.query || {};
    if (this.opts.timestampRequests) {
      query[this.opts.timestampParam] = randomString();
    }
    if (!this.supportsBinary) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
};
var WebSocketCtor = globalThisShim.WebSocket || globalThisShim.MozWebSocket;

// node_modules/engine.io-client/build/esm-debug/transports/websocket.node.js
var WS = class extends BaseWS {
  createSocket(uri, protocols, opts) {
    var _a;
    if ((_a = this.socket) === null || _a === void 0 ? void 0 : _a._cookieJar) {
      opts.headers = opts.headers || {};
      opts.headers.cookie = typeof opts.headers.cookie === "string" ? [opts.headers.cookie] : opts.headers.cookie || [];
      for (const [name, cookie] of this.socket._cookieJar.cookies) {
        opts.headers.cookie.push(`${name}=${cookie.value}`);
      }
    }
    return new import_websocket.default(uri, protocols, opts);
  }
  doWrite(packet, data) {
    const opts = {};
    if (packet.options) {
      opts.compress = packet.options.compress;
    }
    if (this.opts.perMessageDeflate) {
      const len = (
        // @ts-ignore
        "string" === typeof data ? Buffer.byteLength(data) : data.length
      );
      if (len < this.opts.perMessageDeflate.threshold) {
        opts.compress = false;
      }
    }
    this.ws.send(data, opts);
  }
};

// node_modules/engine.io-client/build/esm-debug/transports/webtransport.js
var import_debug5 = __toESM(require_src(), 1);
var debug5 = (0, import_debug5.default)("engine.io-client:webtransport");
var WT = class extends Transport2 {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (err) {
      return this.emitReserved("error", err);
    }
    this._transport.closed.then(() => {
      debug5("transport closed gracefully");
      this.onClose();
    }).catch((err) => {
      debug5("transport closed due to %s", err);
      this.onError("webtransport error", err);
    });
    this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((stream) => {
        const decoderStream = createPacketDecoderStream(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
        const reader = stream.readable.pipeThrough(decoderStream).getReader();
        const encoderStream = createPacketEncoderStream();
        encoderStream.readable.pipeTo(stream.writable);
        this._writer = encoderStream.writable.getWriter();
        const read = () => {
          reader.read().then(({ done, value: value2 }) => {
            if (done) {
              debug5("session is closed");
              return;
            }
            debug5("received chunk: %o", value2);
            this.onPacket(value2);
            read();
          }).catch((err) => {
            debug5("an error occurred while reading: %s", err);
          });
        };
        read();
        const packet = { type: "open" };
        if (this.query.sid) {
          packet.data = `{"sid":"${this.query.sid}"}`;
        }
        this._writer.write(packet).then(() => this.onOpen());
      });
    });
  }
  write(packets) {
    this.writable = false;
    for (let i2 = 0; i2 < packets.length; i2++) {
      const packet = packets[i2];
      const lastPacket = i2 === packets.length - 1;
      this._writer.write(packet).then(() => {
        if (lastPacket) {
          nextTick(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    var _a;
    (_a = this._transport) === null || _a === void 0 ? void 0 : _a.close();
  }
};

// node_modules/engine.io-client/build/esm-debug/transports/index.js
var transports = {
  websocket: WS,
  webtransport: WT,
  polling: XHR
};

// node_modules/engine.io-client/build/esm-debug/contrib/parseuri.js
var re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
var parts = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function parse2(str) {
  if (str.length > 8e3) {
    throw "URI too long";
  }
  const src = str, b2 = str.indexOf("["), e = str.indexOf("]");
  if (b2 != -1 && e != -1) {
    str = str.substring(0, b2) + str.substring(b2, e).replace(/:/g, ";") + str.substring(e, str.length);
  }
  let m = re.exec(str || ""), uri = {}, i2 = 14;
  while (i2--) {
    uri[parts[i2]] = m[i2] || "";
  }
  if (b2 != -1 && e != -1) {
    uri.source = src;
    uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
    uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
    uri.ipv6uri = true;
  }
  uri.pathNames = pathNames(uri, uri["path"]);
  uri.queryKey = queryKey(uri, uri["query"]);
  return uri;
}
function pathNames(obj, path) {
  const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
  if (path.slice(0, 1) == "/" || path.length === 0) {
    names.splice(0, 1);
  }
  if (path.slice(-1) == "/") {
    names.splice(names.length - 1, 1);
  }
  return names;
}
function queryKey(uri, query) {
  const data = {};
  query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
    if ($1) {
      data[$1] = $2;
    }
  });
  return data;
}

// node_modules/engine.io-client/build/esm-debug/socket.js
var import_component_emitter3 = __toESM(require_cjs(), 1);
var import_debug6 = __toESM(require_src(), 1);
var debug6 = (0, import_debug6.default)("engine.io-client:socket");
var withEventListeners = typeof addEventListener === "function" && typeof removeEventListener === "function";
var OFFLINE_EVENT_LISTENERS = [];
if (withEventListeners) {
  addEventListener("offline", () => {
    debug6("closing %d connection(s) because the network was lost", OFFLINE_EVENT_LISTENERS.length);
    OFFLINE_EVENT_LISTENERS.forEach((listener) => listener());
  }, false);
}
var SocketWithoutUpgrade = class _SocketWithoutUpgrade extends import_component_emitter3.Emitter {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(uri, opts) {
    super();
    this.binaryType = defaultBinaryType;
    this.writeBuffer = [];
    this._prevBufferLen = 0;
    this._pingInterval = -1;
    this._pingTimeout = -1;
    this._maxPayload = -1;
    this._pingTimeoutTime = Infinity;
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = null;
    }
    if (uri) {
      const parsedUri = parse2(uri);
      opts.hostname = parsedUri.host;
      opts.secure = parsedUri.protocol === "https" || parsedUri.protocol === "wss";
      opts.port = parsedUri.port;
      if (parsedUri.query)
        opts.query = parsedUri.query;
    } else if (opts.host) {
      opts.hostname = parse2(opts.host).host;
    }
    installTimerFunctions(this, opts);
    this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
    if (opts.hostname && !opts.port) {
      opts.port = this.secure ? "443" : "80";
    }
    this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
    this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
    this.transports = [];
    this._transportsByName = {};
    opts.transports.forEach((t2) => {
      const transportName = t2.prototype.name;
      this.transports.push(transportName);
      this._transportsByName[transportName] = t2;
    });
    this.opts = Object.assign({
      path: "/engine.io",
      agent: false,
      withCredentials: false,
      upgrade: true,
      timestampParam: "t",
      rememberUpgrade: false,
      addTrailingSlash: true,
      rejectUnauthorized: true,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: false
    }, opts);
    this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
    if (typeof this.opts.query === "string") {
      this.opts.query = decode(this.opts.query);
    }
    if (withEventListeners) {
      if (this.opts.closeOnBeforeunload) {
        this._beforeunloadEventListener = () => {
          if (this.transport) {
            this.transport.removeAllListeners();
            this.transport.close();
          }
        };
        addEventListener("beforeunload", this._beforeunloadEventListener, false);
      }
      if (this.hostname !== "localhost") {
        debug6("adding listener for the 'offline' event");
        this._offlineEventListener = () => {
          this._onClose("transport close", {
            description: "network connection lost"
          });
        };
        OFFLINE_EVENT_LISTENERS.push(this._offlineEventListener);
      }
    }
    if (this.opts.withCredentials) {
      this._cookieJar = createCookieJar();
    }
    this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(name) {
    debug6('creating transport "%s"', name);
    const query = Object.assign({}, this.opts.query);
    query.EIO = protocol;
    query.transport = name;
    if (this.id)
      query.sid = this.id;
    const opts = Object.assign({}, this.opts, {
      query,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[name]);
    debug6("options: %j", opts);
    return new this._transportsByName[name](opts);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const transportName = this.opts.rememberUpgrade && _SocketWithoutUpgrade.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const transport = this.createTransport(transportName);
    transport.open();
    this.setTransport(transport);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(transport) {
    debug6("setting transport %s", transport.name);
    if (this.transport) {
      debug6("clearing existing transport %s", this.transport.name);
      this.transport.removeAllListeners();
    }
    this.transport = transport;
    transport.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (reason) => this._onClose("transport close", reason));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    debug6("socket open");
    this.readyState = "open";
    _SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === this.transport.name;
    this.emitReserved("open");
    this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(packet) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      debug6('socket receive: type "%s", data "%s"', packet.type, packet.data);
      this.emitReserved("packet", packet);
      this.emitReserved("heartbeat");
      switch (packet.type) {
        case "open":
          this.onHandshake(JSON.parse(packet.data));
          break;
        case "ping":
          this._sendPacket("pong");
          this.emitReserved("ping");
          this.emitReserved("pong");
          this._resetPingTimeout();
          break;
        case "error":
          const err = new Error("server error");
          err.code = packet.data;
          this._onError(err);
          break;
        case "message":
          this.emitReserved("data", packet.data);
          this.emitReserved("message", packet.data);
          break;
      }
    } else {
      debug6('packet received with socket readyState "%s"', this.readyState);
    }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(data) {
    this.emitReserved("handshake", data);
    this.id = data.sid;
    this.transport.query.sid = data.sid;
    this._pingInterval = data.pingInterval;
    this._pingTimeout = data.pingTimeout;
    this._maxPayload = data.maxPayload;
    this.onOpen();
    if ("closed" === this.readyState)
      return;
    this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const delay = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + delay;
    this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, delay);
    if (this.opts.autoUnref) {
      this._pingTimeoutTimer.unref();
    }
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen);
    this._prevBufferLen = 0;
    if (0 === this.writeBuffer.length) {
      this.emitReserved("drain");
    } else {
      this.flush();
    }
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const packets = this._getWritablePackets();
      debug6("flushing %d packets in socket", packets.length);
      this.transport.send(packets);
      this._prevBufferLen = packets.length;
      this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    const shouldCheckPayloadSize = this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1;
    if (!shouldCheckPayloadSize) {
      return this.writeBuffer;
    }
    let payloadSize = 1;
    for (let i2 = 0; i2 < this.writeBuffer.length; i2++) {
      const data = this.writeBuffer[i2].data;
      if (data) {
        payloadSize += byteLength(data);
      }
      if (i2 > 0 && payloadSize > this._maxPayload) {
        debug6("only send %d out of %d packets", i2, this.writeBuffer.length);
        return this.writeBuffer.slice(0, i2);
      }
      payloadSize += 2;
    }
    debug6("payload size is %d (max: %d)", payloadSize, this._maxPayload);
    return this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return true;
    const hasExpired = Date.now() > this._pingTimeoutTime;
    if (hasExpired) {
      debug6("throttled timer detected, scheduling connection close");
      this._pingTimeoutTime = 0;
      nextTick(() => {
        this._onClose("ping timeout");
      }, this.setTimeoutFn);
    }
    return hasExpired;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(msg, options, fn2) {
    this._sendPacket("message", msg, options, fn2);
    return this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(msg, options, fn2) {
    this._sendPacket("message", msg, options, fn2);
    return this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type - packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(type, data, options, fn2) {
    if ("function" === typeof data) {
      fn2 = data;
      data = void 0;
    }
    if ("function" === typeof options) {
      fn2 = options;
      options = null;
    }
    if ("closing" === this.readyState || "closed" === this.readyState) {
      return;
    }
    options = options || {};
    options.compress = false !== options.compress;
    const packet = {
      type,
      data,
      options
    };
    this.emitReserved("packetCreate", packet);
    this.writeBuffer.push(packet);
    if (fn2)
      this.once("flush", fn2);
    this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const close = () => {
      this._onClose("forced close");
      debug6("socket closing - telling transport to close");
      this.transport.close();
    };
    const cleanupAndClose = () => {
      this.off("upgrade", cleanupAndClose);
      this.off("upgradeError", cleanupAndClose);
      close();
    };
    const waitForUpgrade = () => {
      this.once("upgrade", cleanupAndClose);
      this.once("upgradeError", cleanupAndClose);
    };
    if ("opening" === this.readyState || "open" === this.readyState) {
      this.readyState = "closing";
      if (this.writeBuffer.length) {
        this.once("drain", () => {
          if (this.upgrading) {
            waitForUpgrade();
          } else {
            close();
          }
        });
      } else if (this.upgrading) {
        waitForUpgrade();
      } else {
        close();
      }
    }
    return this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(err) {
    debug6("socket error %j", err);
    _SocketWithoutUpgrade.priorWebsocketSuccess = false;
    if (this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") {
      debug6("trying next transport");
      this.transports.shift();
      return this._open();
    }
    this.emitReserved("error", err);
    this._onClose("transport error", err);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(reason, description) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      debug6('socket close with reason: "%s"', reason);
      this.clearTimeoutFn(this._pingTimeoutTimer);
      this.transport.removeAllListeners("close");
      this.transport.close();
      this.transport.removeAllListeners();
      if (withEventListeners) {
        if (this._beforeunloadEventListener) {
          removeEventListener("beforeunload", this._beforeunloadEventListener, false);
        }
        if (this._offlineEventListener) {
          const i2 = OFFLINE_EVENT_LISTENERS.indexOf(this._offlineEventListener);
          if (i2 !== -1) {
            debug6("removing listener for the 'offline' event");
            OFFLINE_EVENT_LISTENERS.splice(i2, 1);
          }
        }
      }
      this.readyState = "closed";
      this.id = null;
      this.emitReserved("close", reason, description);
      this.writeBuffer = [];
      this._prevBufferLen = 0;
    }
  }
};
SocketWithoutUpgrade.protocol = protocol;
var SocketWithUpgrade = class extends SocketWithoutUpgrade {
  constructor() {
    super(...arguments);
    this._upgrades = [];
  }
  onOpen() {
    super.onOpen();
    if ("open" === this.readyState && this.opts.upgrade) {
      debug6("starting upgrade probes");
      for (let i2 = 0; i2 < this._upgrades.length; i2++) {
        this._probe(this._upgrades[i2]);
      }
    }
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(name) {
    debug6('probing transport "%s"', name);
    let transport = this.createTransport(name);
    let failed = false;
    SocketWithoutUpgrade.priorWebsocketSuccess = false;
    const onTransportOpen = () => {
      if (failed)
        return;
      debug6('probe transport "%s" opened', name);
      transport.send([{ type: "ping", data: "probe" }]);
      transport.once("packet", (msg) => {
        if (failed)
          return;
        if ("pong" === msg.type && "probe" === msg.data) {
          debug6('probe transport "%s" pong', name);
          this.upgrading = true;
          this.emitReserved("upgrading", transport);
          if (!transport)
            return;
          SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === transport.name;
          debug6('pausing current transport "%s"', this.transport.name);
          this.transport.pause(() => {
            if (failed)
              return;
            if ("closed" === this.readyState)
              return;
            debug6("changing transport and sending upgrade packet");
            cleanup();
            this.setTransport(transport);
            transport.send([{ type: "upgrade" }]);
            this.emitReserved("upgrade", transport);
            transport = null;
            this.upgrading = false;
            this.flush();
          });
        } else {
          debug6('probe transport "%s" failed', name);
          const err = new Error("probe error");
          err.transport = transport.name;
          this.emitReserved("upgradeError", err);
        }
      });
    };
    function freezeTransport() {
      if (failed)
        return;
      failed = true;
      cleanup();
      transport.close();
      transport = null;
    }
    const onerror = (err) => {
      const error2 = new Error("probe error: " + err);
      error2.transport = transport.name;
      freezeTransport();
      debug6('probe transport "%s" failed because of error: %s', name, err);
      this.emitReserved("upgradeError", error2);
    };
    function onTransportClose() {
      onerror("transport closed");
    }
    function onclose() {
      onerror("socket closed");
    }
    function onupgrade(to) {
      if (transport && to.name !== transport.name) {
        debug6('"%s" works - aborting "%s"', to.name, transport.name);
        freezeTransport();
      }
    }
    const cleanup = () => {
      transport.removeListener("open", onTransportOpen);
      transport.removeListener("error", onerror);
      transport.removeListener("close", onTransportClose);
      this.off("close", onclose);
      this.off("upgrading", onupgrade);
    };
    transport.once("open", onTransportOpen);
    transport.once("error", onerror);
    transport.once("close", onTransportClose);
    this.once("close", onclose);
    this.once("upgrading", onupgrade);
    if (this._upgrades.indexOf("webtransport") !== -1 && name !== "webtransport") {
      this.setTimeoutFn(() => {
        if (!failed) {
          transport.open();
        }
      }, 200);
    } else {
      transport.open();
    }
  }
  onHandshake(data) {
    this._upgrades = this._filterUpgrades(data.upgrades);
    super.onHandshake(data);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(upgrades) {
    const filteredUpgrades = [];
    for (let i2 = 0; i2 < upgrades.length; i2++) {
      if (~this.transports.indexOf(upgrades[i2]))
        filteredUpgrades.push(upgrades[i2]);
    }
    return filteredUpgrades;
  }
};
var Socket = class extends SocketWithUpgrade {
  constructor(uri, opts = {}) {
    const isOptionsOnly = typeof uri === "object";
    const o2 = isOptionsOnly ? { ...uri } : { ...opts };
    if (!o2.transports || o2.transports && typeof o2.transports[0] === "string") {
      o2.transports = (o2.transports || ["polling", "websocket", "webtransport"]).map((transportName) => transports[transportName]).filter((t2) => !!t2);
    }
    super(isOptionsOnly ? o2 : uri, o2);
  }
};

// node_modules/engine.io-client/build/esm-debug/index.js
var protocol2 = Socket.protocol;

// node_modules/socket.io-client/build/esm-debug/url.js
var import_debug7 = __toESM(require_src(), 1);
var debug7 = (0, import_debug7.default)("socket.io-client:url");
function url(uri, path = "", loc) {
  let obj = uri;
  loc = loc || typeof location !== "undefined" && location;
  if (null == uri)
    uri = loc.protocol + "//" + loc.host;
  if (typeof uri === "string") {
    if ("/" === uri.charAt(0)) {
      if ("/" === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }
    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug7("protocol-less url %s", uri);
      if ("undefined" !== typeof loc) {
        uri = loc.protocol + "//" + uri;
      } else {
        uri = "https://" + uri;
      }
    }
    debug7("parse %s", uri);
    obj = parse2(uri);
  }
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = "80";
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = "443";
    }
  }
  obj.path = obj.path || "/";
  const ipv6 = obj.host.indexOf(":") !== -1;
  const host = ipv6 ? "[" + obj.host + "]" : obj.host;
  obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
  obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
  return obj;
}

// node_modules/socket.io-parser/build/esm-debug/index.js
var esm_debug_exports = {};
__export(esm_debug_exports, {
  Decoder: () => Decoder,
  Encoder: () => Encoder,
  PacketType: () => PacketType,
  isPacketValid: () => isPacketValid,
  protocol: () => protocol3
});
var import_component_emitter4 = __toESM(require_cjs(), 1);

// node_modules/socket.io-parser/build/esm-debug/is-binary.js
var withNativeArrayBuffer = typeof ArrayBuffer === "function";
var isView = (obj) => {
  return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
};
var toString = Object.prototype.toString;
var withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && toString.call(Blob) === "[object BlobConstructor]";
var withNativeFile = typeof File === "function" || typeof File !== "undefined" && toString.call(File) === "[object FileConstructor]";
function isBinary(obj) {
  return withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj)) || withNativeBlob && obj instanceof Blob || withNativeFile && obj instanceof File;
}
function hasBinary(obj, toJSON) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  if (Array.isArray(obj)) {
    for (let i2 = 0, l2 = obj.length; i2 < l2; i2++) {
      if (hasBinary(obj[i2])) {
        return true;
      }
    }
    return false;
  }
  if (isBinary(obj)) {
    return true;
  }
  if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) {
    return hasBinary(obj.toJSON(), true);
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
      return true;
    }
  }
  return false;
}

// node_modules/socket.io-parser/build/esm-debug/binary.js
function deconstructPacket(packet) {
  const buffers = [];
  const packetData = packet.data;
  const pack = packet;
  pack.data = _deconstructPacket(packetData, buffers);
  pack.attachments = buffers.length;
  return { packet: pack, buffers };
}
function _deconstructPacket(data, buffers, toJSON) {
  if (!data)
    return data;
  if (isBinary(data)) {
    const placeholder = { _placeholder: true, num: buffers.length };
    buffers.push(data);
    return placeholder;
  } else if (Array.isArray(data)) {
    const newData = new Array(data.length);
    for (let i2 = 0; i2 < data.length; i2++) {
      newData[i2] = _deconstructPacket(data[i2], buffers);
    }
    return newData;
  } else if (typeof data === "object" && !(data instanceof Date)) {
    if (data.toJSON && typeof data.toJSON === "function" && !toJSON) {
      return _deconstructPacket(data.toJSON(), buffers, true);
    }
    const newData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = _deconstructPacket(data[key], buffers);
      }
    }
    return newData;
  }
  return data;
}
function reconstructPacket(packet, buffers) {
  packet.data = _reconstructPacket(packet.data, buffers);
  delete packet.attachments;
  return packet;
}
function _reconstructPacket(data, buffers) {
  if (!data)
    return data;
  if (data && data._placeholder === true) {
    const isIndexValid = typeof data.num === "number" && data.num >= 0 && data.num < buffers.length;
    if (isIndexValid) {
      return buffers[data.num];
    } else {
      throw new Error("illegal attachments");
    }
  } else if (Array.isArray(data)) {
    for (let i2 = 0; i2 < data.length; i2++) {
      data[i2] = _reconstructPacket(data[i2], buffers);
    }
  } else if (typeof data === "object") {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = _reconstructPacket(data[key], buffers);
      }
    }
  }
  return data;
}

// node_modules/socket.io-parser/build/esm-debug/index.js
var import_debug8 = __toESM(require_src(), 1);
var debug8 = (0, import_debug8.default)("socket.io-parser");
var RESERVED_EVENTS = [
  "connect",
  // used on the client side
  "connect_error",
  // used on the client side
  "disconnect",
  // used on both sides
  "disconnecting",
  // used on the server side
  "newListener",
  // used by the Node.js EventEmitter
  "removeListener"
  // used by the Node.js EventEmitter
];
var protocol3 = 5;
var PacketType;
(function(PacketType2) {
  PacketType2[PacketType2["CONNECT"] = 0] = "CONNECT";
  PacketType2[PacketType2["DISCONNECT"] = 1] = "DISCONNECT";
  PacketType2[PacketType2["EVENT"] = 2] = "EVENT";
  PacketType2[PacketType2["ACK"] = 3] = "ACK";
  PacketType2[PacketType2["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
  PacketType2[PacketType2["BINARY_EVENT"] = 5] = "BINARY_EVENT";
  PacketType2[PacketType2["BINARY_ACK"] = 6] = "BINARY_ACK";
})(PacketType || (PacketType = {}));
var Encoder = class {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(replacer) {
    this.replacer = replacer;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(obj) {
    debug8("encoding packet %j", obj);
    if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
      if (hasBinary(obj)) {
        return this.encodeAsBinary({
          type: obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK,
          nsp: obj.nsp,
          data: obj.data,
          id: obj.id
        });
      }
    }
    return [this.encodeAsString(obj)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(obj) {
    let str = "" + obj.type;
    if (obj.type === PacketType.BINARY_EVENT || obj.type === PacketType.BINARY_ACK) {
      str += obj.attachments + "-";
    }
    if (obj.nsp && "/" !== obj.nsp) {
      str += obj.nsp + ",";
    }
    if (null != obj.id) {
      str += obj.id;
    }
    if (null != obj.data) {
      str += JSON.stringify(obj.data, this.replacer);
    }
    debug8("encoded %j as %s", obj, str);
    return str;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(obj) {
    const deconstruction = deconstructPacket(obj);
    const pack = this.encodeAsString(deconstruction.packet);
    const buffers = deconstruction.buffers;
    buffers.unshift(pack);
    return buffers;
  }
};
var Decoder = class _Decoder extends import_component_emitter4.Emitter {
  /**
   * Decoder constructor
   */
  constructor(opts) {
    super();
    this.opts = Object.assign({
      reviver: void 0,
      maxAttachments: 10
    }, typeof opts === "function" ? { reviver: opts } : opts);
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(obj) {
    let packet;
    if (typeof obj === "string") {
      if (this.reconstructor) {
        throw new Error("got plaintext data when reconstructing a packet");
      }
      packet = this.decodeString(obj);
      const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
      if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
        packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
        this.reconstructor = new BinaryReconstructor(packet);
      } else {
        super.emitReserved("decoded", packet);
      }
    } else if (isBinary(obj) || obj.base64) {
      if (!this.reconstructor) {
        throw new Error("got binary data when not reconstructing a packet");
      } else {
        packet = this.reconstructor.takeBinaryData(obj);
        if (packet) {
          this.reconstructor = null;
          super.emitReserved("decoded", packet);
        }
      }
    } else {
      throw new Error("Unknown type: " + obj);
    }
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(str) {
    let i2 = 0;
    const p2 = {
      type: Number(str.charAt(0))
    };
    if (PacketType[p2.type] === void 0) {
      throw new Error("unknown packet type " + p2.type);
    }
    if (p2.type === PacketType.BINARY_EVENT || p2.type === PacketType.BINARY_ACK) {
      const start = i2 + 1;
      while (str.charAt(++i2) !== "-" && i2 != str.length) {
      }
      const buf = str.substring(start, i2);
      if (buf != Number(buf) || str.charAt(i2) !== "-") {
        throw new Error("Illegal attachments");
      }
      const n2 = Number(buf);
      if (!isInteger(n2) || n2 < 1) {
        throw new Error("Illegal attachments");
      } else if (n2 > this.opts.maxAttachments) {
        throw new Error("too many attachments");
      }
      p2.attachments = n2;
    }
    if ("/" === str.charAt(i2 + 1)) {
      const start = i2 + 1;
      while (++i2) {
        const c2 = str.charAt(i2);
        if ("," === c2)
          break;
        if (i2 === str.length)
          break;
      }
      p2.nsp = str.substring(start, i2);
    } else {
      p2.nsp = "/";
    }
    const next = str.charAt(i2 + 1);
    if ("" !== next && Number(next) == next) {
      const start = i2 + 1;
      while (++i2) {
        const c2 = str.charAt(i2);
        if (null == c2 || Number(c2) != c2) {
          --i2;
          break;
        }
        if (i2 === str.length)
          break;
      }
      p2.id = Number(str.substring(start, i2 + 1));
    }
    if (str.charAt(++i2)) {
      const payload = this.tryParse(str.substr(i2));
      if (_Decoder.isPayloadValid(p2.type, payload)) {
        p2.data = payload;
      } else {
        throw new Error("invalid payload");
      }
    }
    debug8("decoded %s as %j", str, p2);
    return p2;
  }
  tryParse(str) {
    try {
      return JSON.parse(str, this.opts.reviver);
    } catch (e) {
      return false;
    }
  }
  static isPayloadValid(type, payload) {
    switch (type) {
      case PacketType.CONNECT:
        return isObject(payload);
      case PacketType.DISCONNECT:
        return payload === void 0;
      case PacketType.CONNECT_ERROR:
        return typeof payload === "string" || isObject(payload);
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        return Array.isArray(payload);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    if (this.reconstructor) {
      this.reconstructor.finishedReconstruction();
      this.reconstructor = null;
    }
  }
};
var BinaryReconstructor = class {
  constructor(packet) {
    this.packet = packet;
    this.buffers = [];
    this.reconPack = packet;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(binData) {
    this.buffers.push(binData);
    if (this.buffers.length === this.reconPack.attachments) {
      const packet = reconstructPacket(this.reconPack, this.buffers);
      this.finishedReconstruction();
      return packet;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null;
    this.buffers = [];
  }
};
function isNamespaceValid(nsp) {
  return typeof nsp === "string";
}
var isInteger = Number.isInteger || function(value2) {
  return typeof value2 === "number" && isFinite(value2) && Math.floor(value2) === value2;
};
function isAckIdValid(id) {
  return id === void 0 || isInteger(id);
}
function isObject(value2) {
  return Object.prototype.toString.call(value2) === "[object Object]";
}
function isDataValid(type, payload) {
  switch (type) {
    case PacketType.CONNECT:
      return payload === void 0 || isObject(payload);
    case PacketType.DISCONNECT:
      return payload === void 0;
    case PacketType.EVENT:
      return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
    case PacketType.ACK:
      return Array.isArray(payload);
    case PacketType.CONNECT_ERROR:
      return typeof payload === "string" || isObject(payload);
    default:
      return false;
  }
}
function isPacketValid(packet) {
  return isNamespaceValid(packet.nsp) && isAckIdValid(packet.id) && isDataValid(packet.type, packet.data);
}

// node_modules/socket.io-client/build/esm-debug/on.js
function on2(obj, ev, fn2) {
  obj.on(ev, fn2);
  return function subDestroy() {
    obj.off(ev, fn2);
  };
}

// node_modules/socket.io-client/build/esm-debug/socket.js
var import_component_emitter5 = __toESM(require_cjs(), 1);
var import_debug9 = __toESM(require_src(), 1);
var debug9 = (0, import_debug9.default)("socket.io-client:socket");
var RESERVED_EVENTS2 = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
var Socket2 = class extends import_component_emitter5.Emitter {
  /**
   * `Socket` constructor.
   */
  constructor(io2, nsp, opts) {
    super();
    this.connected = false;
    this.recovered = false;
    this.receiveBuffer = [];
    this.sendBuffer = [];
    this._queue = [];
    this._queueSeq = 0;
    this.ids = 0;
    this.acks = {};
    this.flags = {};
    this.io = io2;
    this.nsp = nsp;
    if (opts && opts.auth) {
      this.auth = opts.auth;
    }
    this._opts = Object.assign({}, opts);
    if (this.io._autoConnect)
      this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const io2 = this.io;
    this.subs = [
      on2(io2, "open", this.onopen.bind(this)),
      on2(io2, "packet", this.onpacket.bind(this)),
      on2(io2, "error", this.onerror.bind(this)),
      on2(io2, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    if (this.connected)
      return this;
    this.subEvents();
    if (!this.io["_reconnecting"])
      this.io.open();
    if ("open" === this.io._readyState)
      this.onopen();
    return this;
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...args) {
    args.unshift("message");
    this.emit.apply(this, args);
    return this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(ev, ...args) {
    var _a, _b, _c;
    if (RESERVED_EVENTS2.hasOwnProperty(ev)) {
      throw new Error('"' + ev.toString() + '" is a reserved event name');
    }
    args.unshift(ev);
    if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
      this._addToQueue(args);
      return this;
    }
    const packet = {
      type: PacketType.EVENT,
      data: args
    };
    packet.options = {};
    packet.options.compress = this.flags.compress !== false;
    if ("function" === typeof args[args.length - 1]) {
      const id = this.ids++;
      debug9("emitting packet with ack id %d", id);
      const ack = args.pop();
      this._registerAckCallback(id, ack);
      packet.id = id;
    }
    const isTransportWritable = (_b = (_a = this.io.engine) === null || _a === void 0 ? void 0 : _a.transport) === null || _b === void 0 ? void 0 : _b.writable;
    const isConnected = this.connected && !((_c = this.io.engine) === null || _c === void 0 ? void 0 : _c._hasPingExpired());
    const discardPacket = this.flags.volatile && !isTransportWritable;
    if (discardPacket) {
      debug9("discard packet as the transport is not currently writable");
    } else if (isConnected) {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    } else {
      this.sendBuffer.push(packet);
    }
    this.flags = {};
    return this;
  }
  /**
   * @private
   */
  _registerAckCallback(id, ack) {
    var _a;
    const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
    if (timeout === void 0) {
      this.acks[id] = ack;
      return;
    }
    const timer = this.io.setTimeoutFn(() => {
      delete this.acks[id];
      for (let i2 = 0; i2 < this.sendBuffer.length; i2++) {
        if (this.sendBuffer[i2].id === id) {
          debug9("removing packet with ack id %d from the buffer", id);
          this.sendBuffer.splice(i2, 1);
        }
      }
      debug9("event with ack id %d has timed out after %d ms", id, timeout);
      ack.call(this, new Error("operation has timed out"));
    }, timeout);
    const fn2 = (...args) => {
      this.io.clearTimeoutFn(timer);
      ack.apply(this, args);
    };
    fn2.withError = true;
    this.acks[id] = fn2;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(ev, ...args) {
    return new Promise((resolve, reject) => {
      const fn2 = (arg1, arg2) => {
        return arg1 ? reject(arg1) : resolve(arg2);
      };
      fn2.withError = true;
      args.push(fn2);
      this.emit(ev, ...args);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(args) {
    let ack;
    if (typeof args[args.length - 1] === "function") {
      ack = args.pop();
    }
    const packet = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: false,
      args,
      flags: Object.assign({ fromQueue: true }, this.flags)
    };
    args.push((err, ...responseArgs) => {
      if (packet !== this._queue[0]) {
        return debug9("packet [%d] already acknowledged", packet.id);
      }
      const hasError = err !== null;
      if (hasError) {
        if (packet.tryCount > this._opts.retries) {
          debug9("packet [%d] is discarded after %d tries", packet.id, packet.tryCount);
          this._queue.shift();
          if (ack) {
            ack(err);
          }
        }
      } else {
        debug9("packet [%d] was successfully sent", packet.id);
        this._queue.shift();
        if (ack) {
          ack(null, ...responseArgs);
        }
      }
      packet.pending = false;
      return this._drainQueue();
    });
    this._queue.push(packet);
    this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(force = false) {
    debug9("draining queue");
    if (!this.connected || this._queue.length === 0) {
      return;
    }
    const packet = this._queue[0];
    if (packet.pending && !force) {
      debug9("packet [%d] has already been sent and is waiting for an ack", packet.id);
      return;
    }
    packet.pending = true;
    packet.tryCount++;
    debug9("sending packet [%d] (try n\xB0%d)", packet.id, packet.tryCount);
    this.flags = packet.flags;
    this.emit.apply(this, packet.args);
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(packet) {
    packet.nsp = this.nsp;
    this.io._packet(packet);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    debug9("transport is open - connecting");
    if (typeof this.auth == "function") {
      this.auth((data) => {
        this._sendConnectPacket(data);
      });
    } else {
      this._sendConnectPacket(this.auth);
    }
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(data) {
    this.packet({
      type: PacketType.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data) : data
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(err) {
    if (!this.connected) {
      this.emitReserved("connect_error", err);
    }
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(reason, description) {
    debug9("close (%s)", reason);
    this.connected = false;
    delete this.id;
    this.emitReserved("disconnect", reason, description);
    this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((id) => {
      const isBuffered = this.sendBuffer.some((packet) => String(packet.id) === id);
      if (!isBuffered) {
        const ack = this.acks[id];
        delete this.acks[id];
        if (ack.withError) {
          ack.call(this, new Error("socket has been disconnected"));
        }
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(packet) {
    const sameNamespace = packet.nsp === this.nsp;
    if (!sameNamespace)
      return;
    switch (packet.type) {
      case PacketType.CONNECT:
        if (packet.data && packet.data.sid) {
          this.onconnect(packet.data.sid, packet.data.pid);
        } else {
          this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
        }
        break;
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        this.onevent(packet);
        break;
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        this.onack(packet);
        break;
      case PacketType.DISCONNECT:
        this.ondisconnect();
        break;
      case PacketType.CONNECT_ERROR:
        this.destroy();
        const err = new Error(packet.data.message);
        err.data = packet.data.data;
        this.emitReserved("connect_error", err);
        break;
    }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(packet) {
    const args = packet.data || [];
    debug9("emitting event %j", args);
    if (null != packet.id) {
      debug9("attaching ack callback to event");
      args.push(this.ack(packet.id));
    }
    if (this.connected) {
      this.emitEvent(args);
    } else {
      this.receiveBuffer.push(Object.freeze(args));
    }
  }
  emitEvent(args) {
    if (this._anyListeners && this._anyListeners.length) {
      const listeners = this._anyListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, args);
      }
    }
    super.emit.apply(this, args);
    if (this._pid && args.length && typeof args[args.length - 1] === "string") {
      this._lastOffset = args[args.length - 1];
    }
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(id) {
    const self2 = this;
    let sent = false;
    return function(...args) {
      if (sent)
        return;
      sent = true;
      debug9("sending ack %j", args);
      self2.packet({
        type: PacketType.ACK,
        id,
        data: args
      });
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(packet) {
    const ack = this.acks[packet.id];
    if (typeof ack !== "function") {
      debug9("bad ack %s", packet.id);
      return;
    }
    delete this.acks[packet.id];
    debug9("calling ack %s with %j", packet.id, packet.data);
    if (ack.withError) {
      packet.data.unshift(null);
    }
    ack.apply(this, packet.data);
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(id, pid) {
    debug9("socket connected with id %s", id);
    this.id = id;
    this.recovered = pid && this._pid === pid;
    this._pid = pid;
    this.connected = true;
    this.emitBuffered();
    this._drainQueue(true);
    this.emitReserved("connect");
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((args) => this.emitEvent(args));
    this.receiveBuffer = [];
    this.sendBuffer.forEach((packet) => {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    });
    this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    debug9("server disconnect (%s)", this.nsp);
    this.destroy();
    this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    if (this.subs) {
      this.subs.forEach((subDestroy) => subDestroy());
      this.subs = void 0;
    }
    this.io["_destroy"](this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    if (this.connected) {
      debug9("performing disconnect (%s)", this.nsp);
      this.packet({ type: PacketType.DISCONNECT });
    }
    this.destroy();
    if (this.connected) {
      this.onclose("io client disconnect");
    }
    return this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(compress) {
    this.flags.compress = compress;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    this.flags.volatile = true;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(timeout) {
    this.flags.timeout = timeout;
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(listener) {
    if (!this._anyListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyListeners;
      for (let i2 = 0; i2 < listeners.length; i2++) {
        if (listener === listeners[i2]) {
          listeners.splice(i2, 1);
          return this;
        }
      }
    } else {
      this._anyListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(listener) {
    if (!this._anyOutgoingListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyOutgoingListeners;
      for (let i2 = 0; i2 < listeners.length; i2++) {
        if (listener === listeners[i2]) {
          listeners.splice(i2, 1);
          return this;
        }
      }
    } else {
      this._anyOutgoingListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(packet) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const listeners = this._anyOutgoingListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, packet.data);
      }
    }
  }
};

// node_modules/socket.io-client/build/esm-debug/contrib/backo2.js
function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 1e4;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}
Backoff.prototype.duration = function() {
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand = Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};
Backoff.prototype.reset = function() {
  this.attempts = 0;
};
Backoff.prototype.setMin = function(min) {
  this.ms = min;
};
Backoff.prototype.setMax = function(max) {
  this.max = max;
};
Backoff.prototype.setJitter = function(jitter) {
  this.jitter = jitter;
};

// node_modules/socket.io-client/build/esm-debug/manager.js
var import_component_emitter6 = __toESM(require_cjs(), 1);
var import_debug10 = __toESM(require_src(), 1);
var debug10 = (0, import_debug10.default)("socket.io-client:manager");
var Manager = class extends import_component_emitter6.Emitter {
  constructor(uri, opts) {
    var _a;
    super();
    this.nsps = {};
    this.subs = [];
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = void 0;
    }
    opts = opts || {};
    opts.path = opts.path || "/socket.io";
    this.opts = opts;
    installTimerFunctions(this, opts);
    this.reconnection(opts.reconnection !== false);
    this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
    this.reconnectionDelay(opts.reconnectionDelay || 1e3);
    this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
    this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
    this.backoff = new Backoff({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    });
    this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
    this._readyState = "closed";
    this.uri = uri;
    const _parser = opts.parser || esm_debug_exports;
    this.encoder = new _parser.Encoder();
    this.decoder = new _parser.Decoder();
    this._autoConnect = opts.autoConnect !== false;
    if (this._autoConnect)
      this.open();
  }
  reconnection(v2) {
    if (!arguments.length)
      return this._reconnection;
    this._reconnection = !!v2;
    if (!v2) {
      this.skipReconnect = true;
    }
    return this;
  }
  reconnectionAttempts(v2) {
    if (v2 === void 0)
      return this._reconnectionAttempts;
    this._reconnectionAttempts = v2;
    return this;
  }
  reconnectionDelay(v2) {
    var _a;
    if (v2 === void 0)
      return this._reconnectionDelay;
    this._reconnectionDelay = v2;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v2);
    return this;
  }
  randomizationFactor(v2) {
    var _a;
    if (v2 === void 0)
      return this._randomizationFactor;
    this._randomizationFactor = v2;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v2);
    return this;
  }
  reconnectionDelayMax(v2) {
    var _a;
    if (v2 === void 0)
      return this._reconnectionDelayMax;
    this._reconnectionDelayMax = v2;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v2);
    return this;
  }
  timeout(v2) {
    if (!arguments.length)
      return this._timeout;
    this._timeout = v2;
    return this;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    if (!this._reconnecting && this._reconnection && this.backoff.attempts === 0) {
      this.reconnect();
    }
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(fn2) {
    debug10("readyState %s", this._readyState);
    if (~this._readyState.indexOf("open"))
      return this;
    debug10("opening %s", this.uri);
    this.engine = new Socket(this.uri, this.opts);
    const socket = this.engine;
    const self2 = this;
    this._readyState = "opening";
    this.skipReconnect = false;
    const openSubDestroy = on2(socket, "open", function() {
      self2.onopen();
      fn2 && fn2();
    });
    const onError = (err) => {
      debug10("error");
      this.cleanup();
      this._readyState = "closed";
      this.emitReserved("error", err);
      if (fn2) {
        fn2(err);
      } else {
        this.maybeReconnectOnOpen();
      }
    };
    const errorSub = on2(socket, "error", onError);
    if (false !== this._timeout) {
      const timeout = this._timeout;
      debug10("connect attempt will timeout after %d", timeout);
      const timer = this.setTimeoutFn(() => {
        debug10("connect attempt timed out after %d", timeout);
        openSubDestroy();
        onError(new Error("timeout"));
        socket.close();
      }, timeout);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
    this.subs.push(openSubDestroy);
    this.subs.push(errorSub);
    return this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(fn2) {
    return this.open(fn2);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    debug10("open");
    this.cleanup();
    this._readyState = "open";
    this.emitReserved("open");
    const socket = this.engine;
    this.subs.push(
      on2(socket, "ping", this.onping.bind(this)),
      on2(socket, "data", this.ondata.bind(this)),
      on2(socket, "error", this.onerror.bind(this)),
      on2(socket, "close", this.onclose.bind(this)),
      // @ts-ignore
      on2(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(data) {
    try {
      this.decoder.add(data);
    } catch (e) {
      this.onclose("parse error", e);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(packet) {
    nextTick(() => {
      this.emitReserved("packet", packet);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(err) {
    debug10("error", err);
    this.emitReserved("error", err);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(nsp, opts) {
    let socket = this.nsps[nsp];
    if (!socket) {
      socket = new Socket2(this, nsp, opts);
      this.nsps[nsp] = socket;
    } else if (this._autoConnect && !socket.active) {
      socket.connect();
    }
    return socket;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(socket) {
    const nsps = Object.keys(this.nsps);
    for (const nsp of nsps) {
      const socket2 = this.nsps[nsp];
      if (socket2.active) {
        debug10("socket %s is still active, skipping close", nsp);
        return;
      }
    }
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(packet) {
    debug10("writing packet %j", packet);
    const encodedPackets = this.encoder.encode(packet);
    for (let i2 = 0; i2 < encodedPackets.length; i2++) {
      this.engine.write(encodedPackets[i2], packet.options);
    }
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    debug10("cleanup");
    this.subs.forEach((subDestroy) => subDestroy());
    this.subs.length = 0;
    this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    debug10("disconnect");
    this.skipReconnect = true;
    this._reconnecting = false;
    this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(reason, description) {
    var _a;
    debug10("closed due to %s", reason);
    this.cleanup();
    (_a = this.engine) === null || _a === void 0 ? void 0 : _a.close();
    this.backoff.reset();
    this._readyState = "closed";
    this.emitReserved("close", reason, description);
    if (this._reconnection && !this.skipReconnect) {
      this.reconnect();
    }
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const self2 = this;
    if (this.backoff.attempts >= this._reconnectionAttempts) {
      debug10("reconnect failed");
      this.backoff.reset();
      this.emitReserved("reconnect_failed");
      this._reconnecting = false;
    } else {
      const delay = this.backoff.duration();
      debug10("will wait %dms before reconnect attempt", delay);
      this._reconnecting = true;
      const timer = this.setTimeoutFn(() => {
        if (self2.skipReconnect)
          return;
        debug10("attempting reconnect");
        this.emitReserved("reconnect_attempt", self2.backoff.attempts);
        if (self2.skipReconnect)
          return;
        self2.open((err) => {
          if (err) {
            debug10("reconnect attempt error");
            self2._reconnecting = false;
            self2.reconnect();
            this.emitReserved("reconnect_error", err);
          } else {
            debug10("reconnect success");
            self2.onreconnect();
          }
        });
      }, delay);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const attempt = this.backoff.attempts;
    this._reconnecting = false;
    this.backoff.reset();
    this.emitReserved("reconnect", attempt);
  }
};

// node_modules/socket.io-client/build/esm-debug/index.js
var import_debug11 = __toESM(require_src(), 1);
var debug11 = (0, import_debug11.default)("socket.io-client");
var cache = {};
function lookup(uri, opts) {
  if (typeof uri === "object") {
    opts = uri;
    uri = void 0;
  }
  opts = opts || {};
  const parsed = url(uri, opts.path || "/socket.io");
  const source = parsed.source;
  const id = parsed.id;
  const path = parsed.path;
  const sameNamespace = cache[id] && path in cache[id]["nsps"];
  const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
  let io2;
  if (newConnection) {
    debug11("ignoring socket cache for %s", source);
    io2 = new Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug11("new io instance for %s", source);
      cache[id] = new Manager(source, opts);
    }
    io2 = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.queryKey;
  }
  return io2.socket(parsed.path, opts);
}
Object.assign(lookup, {
  Manager,
  Socket: Socket2,
  io: lookup,
  connect: lookup
});

// node_modules/boardgame.io/dist/esm/socketio-a82b84e4.js
var InMemory = class extends Sync {
  /**
   * Creates a new InMemory storage.
   */
  constructor() {
    super();
    this.state = /* @__PURE__ */ new Map();
    this.initial = /* @__PURE__ */ new Map();
    this.metadata = /* @__PURE__ */ new Map();
    this.log = /* @__PURE__ */ new Map();
  }
  /**
   * Create a new match.
   *
   * @override
   */
  createMatch(matchID, opts) {
    this.initial.set(matchID, opts.initialState);
    this.setState(matchID, opts.initialState);
    this.setMetadata(matchID, opts.metadata);
  }
  /**
   * Write the match metadata to the in-memory object.
   */
  setMetadata(matchID, metadata) {
    this.metadata.set(matchID, metadata);
  }
  /**
   * Write the match state to the in-memory object.
   */
  setState(matchID, state, deltalog) {
    if (deltalog && deltalog.length > 0) {
      const log = this.log.get(matchID) || [];
      this.log.set(matchID, [...log, ...deltalog]);
    }
    this.state.set(matchID, state);
  }
  /**
   * Fetches state for a particular matchID.
   */
  fetch(matchID, opts) {
    const result = {};
    if (opts.state) {
      result.state = this.state.get(matchID);
    }
    if (opts.metadata) {
      result.metadata = this.metadata.get(matchID);
    }
    if (opts.log) {
      result.log = this.log.get(matchID) || [];
    }
    if (opts.initialState) {
      result.initialState = this.initial.get(matchID);
    }
    return result;
  }
  /**
   * Remove the match state from the in-memory object.
   */
  wipe(matchID) {
    this.state.delete(matchID);
    this.metadata.delete(matchID);
  }
  /**
   * Return all keys.
   *
   * @override
   */
  listMatches(opts) {
    return [...this.metadata.entries()].filter(([, metadata]) => {
      if (!opts) {
        return true;
      }
      if (opts.gameName !== void 0 && metadata.gameName !== opts.gameName) {
        return false;
      }
      if (opts.where !== void 0) {
        if (opts.where.isGameover !== void 0) {
          const isGameover = metadata.gameover !== void 0;
          if (isGameover !== opts.where.isGameover) {
            return false;
          }
        }
        if (opts.where.updatedBefore !== void 0 && metadata.updatedAt >= opts.where.updatedBefore) {
          return false;
        }
        if (opts.where.updatedAfter !== void 0 && metadata.updatedAt <= opts.where.updatedAfter) {
          return false;
        }
      }
      return true;
    }).map(([key]) => key);
  }
};
var WithLocalStorageMap = class extends Map {
  constructor(key) {
    super();
    this.key = key;
    const cache2 = JSON.parse(localStorage.getItem(this.key)) || [];
    cache2.forEach((entry) => this.set(...entry));
  }
  sync() {
    const entries = [...this.entries()];
    localStorage.setItem(this.key, JSON.stringify(entries));
  }
  set(key, value2) {
    super.set(key, value2);
    this.sync();
    return this;
  }
  delete(key) {
    const result = super.delete(key);
    this.sync();
    return result;
  }
};
var LocalStorage = class extends InMemory {
  constructor(storagePrefix = "bgio") {
    super();
    const StorageMap = (stateKey) => new WithLocalStorageMap(`${storagePrefix}_${stateKey}`);
    this.state = StorageMap("state");
    this.initial = StorageMap("initial");
    this.metadata = StorageMap("metadata");
    this.log = StorageMap("log");
  }
};
function GetBotPlayer(state, bots) {
  if (state.ctx.gameover !== void 0) {
    return null;
  }
  if (state.ctx.activePlayers) {
    for (const key of Object.keys(bots)) {
      if (key in state.ctx.activePlayers) {
        return key;
      }
    }
  } else if (state.ctx.currentPlayer in bots) {
    return state.ctx.currentPlayer;
  }
  return null;
}
var LocalMaster = class extends Master {
  constructor({ game, bots, storageKey, persist }) {
    const clientCallbacks = {};
    const initializedBots = {};
    if (game && game.ai && bots) {
      for (const playerID in bots) {
        const bot = bots[playerID];
        initializedBots[playerID] = new bot({
          game,
          enumerate: game.ai.enumerate,
          seed: game.seed
        });
      }
    }
    const send = ({ playerID, ...data }) => {
      const callback = clientCallbacks[playerID];
      if (callback !== void 0) {
        callback(filterPlayerView(playerID, data));
      }
    };
    const filterPlayerView = getFilterPlayerView(game);
    const transportAPI = {
      send,
      sendAll: (payload) => {
        for (const playerID in clientCallbacks) {
          send({ playerID, ...payload });
        }
      }
    };
    const storage = persist ? new LocalStorage(storageKey) : new InMemory();
    super(game, storage, transportAPI);
    this.connect = (playerID, callback) => {
      clientCallbacks[playerID] = callback;
    };
    this.subscribe(({ state, matchID }) => {
      if (!bots) {
        return;
      }
      const botPlayer = GetBotPlayer(state, initializedBots);
      if (botPlayer !== null) {
        setTimeout(async () => {
          const botAction = await initializedBots[botPlayer].play(state, botPlayer);
          await this.onUpdate(botAction.action, state._stateID, matchID, botAction.action.payload.playerID);
        }, 100);
      }
    });
  }
};
var LocalTransport = class extends Transport {
  /**
   * Creates a new Mutiplayer instance.
   * @param {string} matchID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   */
  constructor({ master, ...opts }) {
    super(opts);
    this.master = master;
  }
  sendChatMessage(matchID, chatMessage) {
    const args = [
      matchID,
      chatMessage,
      this.credentials
    ];
    this.master.onChatMessage(...args);
  }
  sendAction(state, action) {
    this.master.onUpdate(action, state._stateID, this.matchID, this.playerID);
  }
  requestSync() {
    this.master.onSync(this.matchID, this.playerID, this.credentials, this.numPlayers);
  }
  connect() {
    this.setConnectionStatus(true);
    this.master.connect(this.playerID, (data) => this.notifyClient(data));
    this.requestSync();
  }
  disconnect() {
    this.setConnectionStatus(false);
  }
  updateMatchID(id) {
    this.matchID = id;
    this.connect();
  }
  updatePlayerID(id) {
    this.playerID = id;
    this.connect();
  }
  updateCredentials(credentials) {
    this.credentials = credentials;
    this.connect();
  }
};
var localMasters = /* @__PURE__ */ new Map();
function Local({ bots, persist, storageKey } = {}) {
  return (transportOpts) => {
    const { gameKey, game } = transportOpts;
    let master;
    const instance2 = localMasters.get(gameKey);
    if (instance2 && instance2.bots === bots && instance2.storageKey === storageKey && instance2.persist === persist) {
      master = instance2.master;
    }
    if (!master) {
      master = new LocalMaster({ game, bots, persist, storageKey });
      localMasters.set(gameKey, { master, bots, persist, storageKey });
    }
    return new LocalTransport({ master, ...transportOpts });
  };
}
var io = lookup;
var SocketIOTransport = class extends Transport {
  /**
   * Creates a new Multiplayer instance.
   * @param {object} socket - Override for unit tests.
   * @param {object} socketOpts - Options to pass to socket.io.
   * @param {object} store - Redux store
   * @param {string} matchID - The game ID to connect to.
   * @param {string} playerID - The player ID associated with this client.
   * @param {string} credentials - Authentication credentials
   * @param {string} gameName - The game type (the `name` field in `Game`).
   * @param {string} numPlayers - The number of players.
   * @param {string} server - The game server in the form of 'hostname:port'. Defaults to the server serving the client if not provided.
   */
  constructor({ socket, socketOpts, server, ...opts }) {
    super(opts);
    this.server = server;
    this.socket = socket;
    this.socketOpts = socketOpts;
  }
  sendAction(state, action) {
    const args = [
      action,
      state._stateID,
      this.matchID,
      this.playerID
    ];
    this.socket.emit("update", ...args);
  }
  sendChatMessage(matchID, chatMessage) {
    const args = [
      matchID,
      chatMessage,
      this.credentials
    ];
    this.socket.emit("chat", ...args);
  }
  connect() {
    if (!this.socket) {
      if (this.server) {
        let server = this.server;
        if (server.search(/^https?:\/\//) == -1) {
          server = "http://" + this.server;
        }
        if (server.slice(-1) != "/") {
          server = server + "/";
        }
        this.socket = io(server + this.gameName, this.socketOpts);
      } else {
        this.socket = io("/" + this.gameName, this.socketOpts);
      }
    }
    this.socket.on("patch", (matchID, prevStateID, stateID, patch2, deltalog) => {
      this.notifyClient({
        type: "patch",
        args: [matchID, prevStateID, stateID, patch2, deltalog]
      });
    });
    this.socket.on("update", (matchID, state, deltalog) => {
      this.notifyClient({
        type: "update",
        args: [matchID, state, deltalog]
      });
    });
    this.socket.on("sync", (matchID, syncInfo) => {
      this.notifyClient({ type: "sync", args: [matchID, syncInfo] });
    });
    this.socket.on("matchData", (matchID, matchData) => {
      this.notifyClient({ type: "matchData", args: [matchID, matchData] });
    });
    this.socket.on("chat", (matchID, chatMessage) => {
      this.notifyClient({ type: "chat", args: [matchID, chatMessage] });
    });
    this.socket.on("connect", () => {
      this.requestSync();
      this.setConnectionStatus(true);
    });
    this.socket.on("disconnect", () => {
      this.setConnectionStatus(false);
    });
  }
  disconnect() {
    this.socket.close();
    this.socket = null;
    this.setConnectionStatus(false);
  }
  requestSync() {
    if (this.socket) {
      const args = [
        this.matchID,
        this.playerID,
        this.credentials,
        this.numPlayers
      ];
      this.socket.emit("sync", ...args);
    }
  }
  updateMatchID(id) {
    this.matchID = id;
    this.requestSync();
  }
  updatePlayerID(id) {
    this.playerID = id;
    this.requestSync();
  }
  updateCredentials(credentials) {
    this.credentials = credentials;
    this.requestSync();
  }
};
function SocketIO({ server, socketOpts } = {}) {
  return (transportOpts) => new SocketIOTransport({
    server,
    socketOpts,
    ...transportOpts
  });
}

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_2) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k2) => typeof obj[obj[k2]] !== "number");
    const filtered = {};
    for (const k2 of validKeys) {
      filtered[k2] = obj[k2];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object2) => {
    const keys2 = [];
    for (const key in object2) {
      if (Object.prototype.hasOwnProperty.call(object2, key)) {
        keys2.push(key);
      }
    }
    return keys2;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_2, value2) => {
    if (typeof value2 === "bigint") {
      return value2.toString();
    }
    return value2;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error2) => {
      for (const issue of error2.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i2 = 0;
          while (i2 < issue.path.length) {
            const el = issue.path[i2];
            const terminal = i2 === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i2++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value2) {
    if (!(value2 instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value2}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error2 = new ZodError(issues);
  return error2;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x2) => !!x2)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s2 of results) {
      if (s2.status === "aborted")
        return INVALID;
      if (s2.status === "dirty")
        status.dirty();
      arrayValue.push(s2.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value2 = await pair.value;
      syncPairs.push({
        key,
        value: value2
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value: value2 } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value2.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value2.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value2.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value2.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value2) => ({ status: "dirty", value: value2 });
var OK = (value2) => ({ status: "valid", value: value2 });
var isAborted = (x2) => x2.status === "aborted";
var isDirty = (x2) => x2.status === "dirty";
var isValid = (x2) => x2.status === "valid";
var isAsync = (x2) => typeof Promise !== "undefined" && x2 instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value2, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value2;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error2 = new ZodError(ctx.common.issues);
        this._error = error2;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value2, options) {
    return this._addCheck({
      kind: "includes",
      value: value2,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value2, message) {
    return this._addCheck({
      kind: "startsWith",
      value: value2,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value2, message) {
    return this._addCheck({
      kind: "endsWith",
      value: value2,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value2, message) {
    return this.setLimit("min", value2, true, errorUtil.toString(message));
  }
  gt(value2, message) {
    return this.setLimit("min", value2, false, errorUtil.toString(message));
  }
  lte(value2, message) {
    return this.setLimit("max", value2, true, errorUtil.toString(message));
  }
  lt(value2, message) {
    return this.setLimit("max", value2, false, errorUtil.toString(message));
  }
  setLimit(kind, value2, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value: value2,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value2, message) {
    return this._addCheck({
      kind: "multipleOf",
      value: value2,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value2, message) {
    return this.setLimit("min", value2, true, errorUtil.toString(message));
  }
  gt(value2, message) {
    return this.setLimit("min", value2, false, errorUtil.toString(message));
  }
  lte(value2, message) {
    return this.setLimit("max", value2, true, errorUtil.toString(message));
  }
  lt(value2, message) {
    return this.setLimit("max", value2, false, errorUtil.toString(message));
  }
  setLimit(kind, value2, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value: value2,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value2, message) {
    return this._addCheck({
      kind: "multipleOf",
      value: value2,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i2) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i2));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i2) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i2));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys2 = util.objectKeys(shape);
    this._cached = { shape, keys: keys2 };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value2 = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value2, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value2 = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value2, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value2 = await pair.value;
          syncPairs.push({
            key,
            value: value2,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value2 of discriminatorValues) {
        if (optionsMap.has(value2)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value2)}`);
        }
        optionsMap.set(value2, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a2, b2) {
  const aType = getParsedType(a2);
  const bType = getParsedType(b2);
  if (a2 === b2) {
    return { valid: true, data: a2 };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b2);
    const sharedKeys = util.objectKeys(a2).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a2, ...b2 };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a2[key], b2[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a2.length !== b2.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a2.length; index++) {
      const itemA = a2[index];
      const itemB = b2[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a2 === +b2) {
    return { valid: true, data: a2 };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x2) => !!x2);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value2], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value2, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value2 = await pair.value;
          if (key.status === "aborted" || value2.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value2.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value2.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value2 = pair.value;
        if (key.status === "aborted" || value2.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value2.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value2.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element2 of elements2) {
        if (element2.status === "aborted")
          return INVALID;
        if (element2.status === "dirty")
          status.dirty();
        parsedSet.add(element2.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i2) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i2)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error2) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x2) => !!x2),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error2
        }
      });
    }
    function makeReturnsIssue(returns, error2) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x2) => !!x2),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error2
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn2 = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error2 = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error2.addIssue(makeArgsIssue(args, e));
          throw error2;
        });
        const result = await Reflect.apply(fn2, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error2.addIssue(makeReturnsIssue(result, e));
          throw error2;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn2, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value2, params) => {
  return new ZodLiteral({
    value: value2,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a2, b2) {
    return new _ZodPipeline({
      in: a2,
      out: b2,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p2 = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p22 = typeof p2 === "string" ? { message: p2 } : p2;
  return p22;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r2 = check(data);
      if (r2 instanceof Promise) {
        return r2.then((r3) => {
          if (!r3) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r2) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;

// src/domain/types.js
var PIECE_TYPES = {
  MARK: "Mark",
  HEEL: "Heel",
  PAWN: "Pawn"
};
var MOVE_TYPES = {
  ADVANCE: "Advance",
  WITHDRAW: "Withdraw",
  ORGANIZE: "Organize",
  REMOVE: "Remove",
  INFLUENCE: "Influence",
  ASSIST: "Assist"
};
var TILES = {
  "01": { id: "01", moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ADVANCE], funding: 1 },
  "02": { id: "02", moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ADVANCE], funding: 2 },
  "03": { id: "03", moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.ADVANCE], funding: 0 },
  "04": { id: "04", moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.ADVANCE], funding: 1 },
  "05": { id: "05", moves: [MOVE_TYPES.ADVANCE], funding: 2 },
  "06": { id: "06", moves: [MOVE_TYPES.ADVANCE], funding: 3 },
  "07": { id: "07", moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ADVANCE], funding: 4 },
  "08": { id: "08", moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ADVANCE], funding: 5 },
  "09": { id: "09", moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ORGANIZE], funding: 1 },
  "10": { id: "10", moves: [MOVE_TYPES.REMOVE, MOVE_TYPES.ORGANIZE], funding: 2 },
  "11": { id: "11", moves: [MOVE_TYPES.INFLUENCE], funding: 4 },
  "12": { id: "12", moves: [MOVE_TYPES.ORGANIZE], funding: 5 },
  "13": { id: "13", moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ORGANIZE], funding: 5 },
  "14": { id: "14", moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.ORGANIZE], funding: 6 },
  "15": { id: "15", moves: [MOVE_TYPES.REMOVE], funding: 3 },
  "16": { id: "16", moves: [MOVE_TYPES.REMOVE], funding: 4 },
  "17": { id: "17", moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.WITHDRAW], funding: 3 },
  "18": { id: "18", moves: [MOVE_TYPES.INFLUENCE, MOVE_TYPES.WITHDRAW], funding: 4 },
  "19": { id: "19", moves: [MOVE_TYPES.WITHDRAW], funding: 6 },
  "20": { id: "20", moves: [MOVE_TYPES.WITHDRAW], funding: 7 },
  "21": { id: "21", moves: [MOVE_TYPES.WITHDRAW], funding: 8 },
  "22": { id: "22", moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.WITHDRAW], funding: 7 },
  "23": { id: "23", moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.WITHDRAW], funding: 8 },
  "24": { id: "24", moves: [MOVE_TYPES.ASSIST, MOVE_TYPES.WITHDRAW], funding: 9 },
  "BLANK": { id: "BLANK", moves: [], funding: 0, isWild: true }
};
var INITIAL_PIECE_COUNTS = {
  3: { MARKS: 12, HEELS: 9, PAWNS: 3, TILES_PER_PLAYER: 8, HAS_BLANK: false },
  4: { MARKS: 15, HEELS: 13, PAWNS: 4, TILES_PER_PLAYER: 6, HAS_BLANK: false },
  5: { MARKS: 18, HEELS: 17, PAWNS: 5, TILES_PER_PLAYER: 5, HAS_BLANK: true }
};
var BUREAUCRACY_PRICES = {
  3: { PROMOTE_OFFICE: 18, EXTRA_ACTION: 15, PROMOTE_ROSTRUM: 12, BASIC_ACTION: 9, PROMOTE_SEAT: 6, RESTORE_CRED: 3 },
  4: { PROMOTE_OFFICE: 12, EXTRA_ACTION: 10, PROMOTE_ROSTRUM: 8, BASIC_ACTION: 6, PROMOTE_SEAT: 4, RESTORE_CRED: 2 },
  5: { PROMOTE_OFFICE: 6, EXTRA_ACTION: 5, PROMOTE_ROSTRUM: 4, BASIC_ACTION: 3, PROMOTE_SEAT: 2, RESTORE_CRED: 1 }
};
var MoveActionSchema = external_exports.object({
  type: external_exports.enum([
    MOVE_TYPES.ADVANCE,
    MOVE_TYPES.WITHDRAW,
    MOVE_TYPES.ORGANIZE,
    MOVE_TYPES.REMOVE,
    MOVE_TYPES.INFLUENCE,
    MOVE_TYPES.ASSIST
  ]),
  from: external_exports.string(),
  to: external_exports.string(),
  pieceId: external_exports.string().optional()
});
var TurnSubmissionSchema = external_exports.object({
  tileId: external_exports.string(),
  receiverId: external_exports.string(),
  moves: external_exports.array(MoveActionSchema).max(2)
});

// node_modules/boardgame.io/dist/esm/core.js
var import_lodash3 = __toESM(require_lodash());

// src/domain/board.js
function getValidReceivers(G2, moverId) {
  if (!G2 || !G2.players) return [];
  const mId = String(moverId);
  const allIds = Object.keys(G2.players);
  const np = G2.numPlayers || allIds.length || 3;
  const tilesPerPlayer = (INITIAL_PIECE_COUNTS[np] || INITIAL_PIECE_COUNTS[3]).TILES_PER_PLAYER;
  const bankLen = (p2) => {
    const pl = G2.players[p2];
    return typeof pl?.bankCount === "number" ? pl.bankCount : (pl?.bank || []).length;
  };
  const handLen = (p2) => {
    const pl = G2.players[p2];
    return typeof pl?.handCount === "number" ? pl.handCount : (pl?.hand || []).length;
  };
  const hasOpenSlot = (p2) => bankLen(p2) < tilesPerPlayer;
  const totalRemainingTiles = allIds.reduce((sum, p2) => sum + handLen(p2), 0);
  const isLastTileOfCampaign = totalRemainingTiles <= 1;
  if (!isLastTileOfCampaign) {
    const oppWithTiles = allIds.filter((p2) => p2 !== mId && hasOpenSlot(p2) && handLen(p2) > 0);
    if (oppWithTiles.length > 0) return oppWithTiles;
    if (hasOpenSlot(mId) && handLen(mId) > 1) return [mId];
  }
  const openOpps = allIds.filter((p2) => p2 !== mId && hasOpenSlot(p2));
  if (openOpps.length > 0) return openOpps;
  return hasOpenSlot(mId) ? [mId] : [];
}
function parseLocation(loc) {
  if (!loc) return null;
  if (loc === "community" || loc.startsWith("community_")) return { type: "community" };
  const match = loc.match(/^p(\d+)_(seat|rostrum|office)(\d+)?$/);
  if (!match) return null;
  const domainNum = parseInt(match[1], 10);
  const playerId = String(domainNum - 1);
  return {
    domainNum,
    playerId,
    type: match[2],
    index: match[3] ? parseInt(match[3], 10) : null
  };
}
function getClockwiseOrder(numPlayers) {
  const order = [];
  for (let i2 = 0; i2 < numPlayers; i2++) {
    order.push(String(i2));
  }
  return order;
}
function getNextPlayer(currentId, numPlayers) {
  const order = getClockwiseOrder(numPlayers);
  const idx = order.indexOf(String(currentId));
  return order[(idx + 1) % order.length];
}
function getPrevPlayer(currentId, numPlayers) {
  const order = getClockwiseOrder(numPlayers);
  const idx = order.indexOf(String(currentId));
  return order[(idx - 1 + order.length) % order.length];
}
function getOrderedChallengers(G2) {
  if (!G2 || !G2.pendingPlay) return [];
  const np = G2.numPlayers || 3;
  const recIdx = parseInt(G2.pendingPlay.receiverId, 10);
  const list = [];
  for (let i2 = 1; i2 < np; i2++) {
    const candidateIdx = (recIdx + i2) % np;
    const candidateId = String(candidateIdx);
    if (candidateId !== G2.pendingPlay.moverId && candidateId !== G2.pendingPlay.receiverId && (G2.players[candidateId]?.credibilityNotchesLost || 0) < 3) {
      list.push(candidateId);
    }
  }
  return list;
}
function getActiveChallenger(G2) {
  if (!G2 || !G2.pendingPlay || G2.pendingPlay.step !== "challenge") return null;
  const challengers = getOrderedChallengers(G2);
  const remaining = challengers.filter(
    (id) => !(G2.pendingPlay.challengesPassed || []).includes(id)
  );
  return remaining.length > 0 ? remaining[0] : null;
}
function getPendingPlayActivePlayer(G2) {
  if (!G2 || !G2.pendingPlay) return null;
  const { step, receiverId, moverId, successfulChallengerId } = G2.pendingPlay;
  if (step === "receipt") return receiverId;
  if (step === "challenge") return getActiveChallenger(G2);
  if (step === "reexecute" || step === "penaltyWithdraw") return moverId;
  if (step === "receiverReward" || step === "freeAdvance") return receiverId;
  if (step === "challengerReward") return successfulChallengerId;
  return null;
}
function areSeatsAdjacent(locA, locB, numPlayers) {
  const pA = parseLocation(locA);
  const pB = parseLocation(locB);
  if (!pA || !pB || pA.type !== "seat" || pB.type !== "seat") return false;
  if (pA.playerId === pB.playerId) {
    return Math.abs(pA.index - pB.index) === 1;
  }
  const nextP = getNextPlayer(pA.playerId, numPlayers);
  const prevP = getPrevPlayer(pA.playerId, numPlayers);
  if (pB.playerId === nextP && pA.index === 6 && pB.index === 1) return true;
  if (pB.playerId === prevP && pA.index === 1 && pB.index === 6) return true;
  return false;
}
function areRostrumsAdjacent(locA, locB, numPlayers) {
  const pA = parseLocation(locA);
  const pB = parseLocation(locB);
  if (!pA || !pB || pA.type !== "rostrum" || pB.type !== "rostrum") return false;
  if (pA.playerId === pB.playerId) return false;
  const nextP = getNextPlayer(pA.playerId, numPlayers);
  const prevP = getPrevPlayer(pA.playerId, numPlayers);
  if (pB.playerId === nextP && pA.index === 2 && pB.index === 1) return true;
  if (pB.playerId === prevP && pA.index === 1 && pB.index === 2) return true;
  return false;
}
function findUnsupportedPiece(boardState, numPlayers) {
  if (!boardState) return null;
  for (let p2 = 0; p2 < numPlayers; p2++) {
    const domainKey = `p${p2 + 1}`;
    const ownerId = String(p2);
    const officeLoc = `${domainKey}_office`;
    const r1Loc = `${domainKey}_rostrum1`;
    const r2Loc = `${domainKey}_rostrum2`;
    if (boardState[officeLoc] && !boardState[r1Loc] && !boardState[r2Loc]) {
      return { ownerId, from: officeLoc, validDestinations: [r1Loc, r2Loc] };
    }
    const r1Seats = [`${domainKey}_seat1`, `${domainKey}_seat2`, `${domainKey}_seat3`];
    if (boardState[r1Loc] && r1Seats.every((s2) => !boardState[s2])) {
      return { ownerId, from: r1Loc, validDestinations: r1Seats };
    }
    const r2Seats = [`${domainKey}_seat4`, `${domainKey}_seat5`, `${domainKey}_seat6`];
    if (boardState[r2Loc] && r2Seats.every((s2) => !boardState[s2])) {
      return { ownerId, from: r2Loc, validDestinations: r2Seats };
    }
  }
  return null;
}
function enforceSupportRule(boardState, numPlayers) {
  let changed = false;
  const newBoard = JSON.parse(JSON.stringify(boardState));
  for (let p2 = 0; p2 < numPlayers; p2++) {
    const domainKey = `p${p2 + 1}`;
    const officeLoc = `${domainKey}_office`;
    const r1Loc = `${domainKey}_rostrum1`;
    const r2Loc = `${domainKey}_rostrum2`;
    if (newBoard[officeLoc] && !newBoard[r1Loc] && !newBoard[r2Loc]) {
      newBoard[r1Loc] = newBoard[officeLoc];
      newBoard[officeLoc] = null;
      changed = true;
    }
    const f1Seats = [`${domainKey}_seat1`, `${domainKey}_seat2`, `${domainKey}_seat3`].map((s2) => newBoard[s2]);
    if (newBoard[r1Loc] && f1Seats.every((s2) => s2 === null)) {
      newBoard[`${domainKey}_seat1`] = newBoard[r1Loc];
      newBoard[r1Loc] = null;
      changed = true;
    }
    const f2Seats = [`${domainKey}_seat4`, `${domainKey}_seat5`, `${domainKey}_seat6`].map((s2) => newBoard[s2]);
    if (newBoard[r2Loc] && f2Seats.every((s2) => s2 === null)) {
      newBoard[`${domainKey}_seat4`] = newBoard[r2Loc];
      newBoard[r2Loc] = null;
      changed = true;
    }
  }
  if (changed) {
    return enforceSupportRule(newBoard, numPlayers);
  }
  return newBoard;
}
function checkVictory(boardState, pId) {
  const domainKey = `p${parseInt(pId, 10) + 1}`;
  const seatsOccupied = [1, 2, 3, 4, 5, 6].every((i2) => boardState[`${domainKey}_seat${i2}`] !== null);
  const rostrum1Heel = boardState[`${domainKey}_rostrum1`]?.type === "Heel";
  const rostrum2Heel = boardState[`${domainKey}_rostrum2`]?.type === "Heel";
  const officePawn = boardState[`${domainKey}_office`]?.type === "Pawn";
  return seatsOccupied && rostrum1Heel && rostrum2Heel && officePawn;
}

// src/domain/sharedMoves.js
function sanitizeLoadedState(targetG) {
  if (!targetG || !targetG.players) return;
  const hasBlank = targetG.numPlayers === 5;
  const ALL_TILE_IDS = Object.keys(TILES).filter((k2) => k2 !== "BLANK" || hasBlank);
  const usedTileIds = /* @__PURE__ */ new Set();
  Object.values(targetG.players).forEach((p2) => {
    (p2.hand || []).forEach((t2) => {
      if (t2 && t2 !== "HIDDEN") usedTileIds.add(t2);
    });
    (p2.bank || []).forEach((b2) => {
      if (b2 && b2.tileId && b2.tileId !== "HIDDEN") usedTileIds.add(b2.tileId);
    });
  });
  if (targetG.draftPacks) {
    Object.values(targetG.draftPacks).forEach((pack) => {
      (pack || []).forEach((t2) => {
        if (t2 && t2 !== "HIDDEN") usedTileIds.add(t2);
      });
    });
  }
  const unusedTiles = ALL_TILE_IDS.filter((id) => !usedTileIds.has(id));
  Object.values(targetG.players).forEach((p2) => {
    if (p2.hand) {
      p2.hand = p2.hand.map((t2) => t2 === "HIDDEN" || !t2 ? unusedTiles.pop() || "01" : t2);
    }
    if (p2.bank) {
      p2.bank = p2.bank.map((b2) => b2 && b2.tileId === "HIDDEN" ? { ...b2, tileId: unusedTiles.pop() || "01" } : b2);
    }
  });
  if (targetG.draftPacks) {
    Object.keys(targetG.draftPacks).forEach((pId) => {
      if (Array.isArray(targetG.draftPacks[pId])) {
        targetG.draftPacks[pId] = targetG.draftPacks[pId].map(
          (t2) => t2 === "HIDDEN" || !t2 ? unusedTiles.pop() || "01" : t2
        );
      }
    });
  }
}
function handleLoadSaveState({ G: G2, ctx, events }, savedSnapshot) {
  if (!savedSnapshot || typeof savedSnapshot !== "object") return INVALID_MOVE;
  const targetG = savedSnapshot.G || savedSnapshot;
  if (!targetG || typeof targetG !== "object") return INVALID_MOVE;
  sanitizeLoadedState(targetG);
  if (targetG.boardState) G2.boardState = JSON.parse(JSON.stringify(targetG.boardState));
  if (targetG.community) G2.community = JSON.parse(JSON.stringify(targetG.community));
  if (targetG.players) G2.players = JSON.parse(JSON.stringify(targetG.players));
  if (targetG.draftPacks) G2.draftPacks = JSON.parse(JSON.stringify(targetG.draftPacks));
  if (targetG.draftSelectionsThisRound) G2.draftSelectionsThisRound = JSON.parse(JSON.stringify(targetG.draftSelectionsThisRound));
  if (targetG.numPlayers) G2.numPlayers = targetG.numPlayers;
  G2.pendingPlay = targetG.pendingPlay ? JSON.parse(JSON.stringify(targetG.pendingPlay)) : null;
  G2.pendingSupport = targetG.pendingSupport ? JSON.parse(JSON.stringify(targetG.pendingSupport)) : null;
  G2.nextMoverId = targetG.nextMoverId !== void 0 ? targetG.nextMoverId : null;
  G2.winner = targetG.winner || null;
  if (targetG.history) G2.history = JSON.parse(JSON.stringify(targetG.history));
  const targetPhase = savedSnapshot.phase || targetG.phase;
  if (targetPhase && events && events.setPhase) {
    events.setPhase(targetPhase);
  }
  const targetPlayer = savedSnapshot.currentPlayer !== void 0 ? savedSnapshot.currentPlayer : targetG.currentPlayer;
  if (targetPlayer !== void 0 && events && events.endTurn) {
    events.endTurn({ next: String(targetPlayer) });
  }
}

// src/domain/phases/draftPhase.js
function createDraftPhase() {
  const autoPickForSkippedPlayers = (G2, random) => {
    const skipped = G2.draftSkippedPlayers || {};
    for (const pId of Object.keys(G2.players || {})) {
      if (!skipped[pId] || G2.draftSelectionsThisRound?.[pId]) continue;
      const pack = G2.draftPacks?.[pId] || [];
      if (pack.length === 0) continue;
      const randVal = random && typeof random.Number === "function" ? random.Number() : Math.random();
      const idx = Math.floor(randVal * pack.length);
      const tileId = pack[idx];
      G2.players[pId].hand.push(tileId);
      G2.draftPacks[pId] = pack.filter((t2) => t2 !== tileId);
      G2.draftSelectionsThisRound[pId] = true;
    }
  };
  const advanceDraftRounds = (G2, random, events) => {
    for (let guard = 0; guard < 12; guard++) {
      autoPickForSkippedPlayers(G2, random);
      const playerIds = Object.keys(G2.players || {});
      const allSelected = playerIds.length > 0 && playerIds.every((id) => G2.draftSelectionsThisRound?.[id]);
      if (!allSelected) break;
      const order = getClockwiseOrder(G2.numPlayers);
      const newPacks = {};
      for (let i2 = 0; i2 < order.length; i2++) {
        const currentP = order[i2];
        const nextP = order[(i2 + 1) % order.length];
        newPacks[nextP] = G2.draftPacks[currentP];
      }
      G2.draftPacks = newPacks;
      G2.draftSelectionsThisRound = {};
      const hasMoreTiles = Object.values(G2.draftPacks).some((p2) => p2 && p2.length > 0);
      if (!hasMoreTiles) {
        if (events && events.setPhase) {
          events.setPhase("campaign");
        }
        break;
      }
    }
  };
  const handleSkipDraft = ({ G: G2, playerID, random, events }) => {
    const pId = String(playerID);
    if (!G2.players?.[pId]) return INVALID_MOVE;
    if (!G2.draftSkippedPlayers) G2.draftSkippedPlayers = {};
    G2.draftSkippedPlayers[pId] = true;
    advanceDraftRounds(G2, random, events);
  };
  const handleSelectDraftTile = ({ G: G2, ctx, playerID, random, events }, tileId) => {
    const pId = String(playerID);
    if (G2.draftSelectionsThisRound && G2.draftSelectionsThisRound[pId]) {
      console.log("[selectDraftTile] INVALID: player", pId, "already selected this round");
      return INVALID_MOVE;
    }
    const pack = G2.draftPacks ? G2.draftPacks[pId] : null;
    if (!pack || !pack.includes(tileId)) {
      console.log("[selectDraftTile] INVALID: player", pId, "tileId", tileId, "pack", pack);
      return INVALID_MOVE;
    }
    G2.players[pId].hand.push(tileId);
    G2.draftPacks[pId] = pack.filter((t2) => t2 !== tileId);
    G2.draftSelectionsThisRound[pId] = true;
    console.log("[selectDraftTile] Player", pId, "picked", tileId);
    advanceDraftRounds(G2, random, events);
  };
  return {
    start: true,
    moves: {
      skipDraftPhase: { move: handleSkipDraft, client: false },
      loadSaveState: handleLoadSaveState,
      selectDraftTile: { move: handleSelectDraftTile, client: false }
    },
    turn: {
      activePlayers: { all: "drafting" },
      moves: {
        skipDraftPhase: { move: handleSkipDraft, client: false },
        loadSaveState: handleLoadSaveState,
        selectDraftTile: { move: handleSelectDraftTile, client: false }
      }
    },
    next: "campaign",
    endIf: ({ G: G2 }) => {
      if (!G2 || !G2.draftPacks) return false;
      return Object.values(G2.draftPacks).every((pack) => Array.isArray(pack) && pack.length === 0);
    }
  };
}

// src/domain/moves.js
function isCommunityPieceAvailable(pieceType, boardState, community, stagedMoves = []) {
  let hasMarks = false;
  let hasHeels = false;
  const movedPieceId = stagedMoves?.[0]?.pieceId || null;
  if (boardState) {
    for (const k2 of Object.keys(boardState)) {
      if (!k2.startsWith("community_") || !boardState[k2]) continue;
      const piece = boardState[k2];
      if (movedPieceId && piece.id === movedPieceId) continue;
      if (piece.type === PIECE_TYPES.MARK) hasMarks = true;
      if (piece.type === PIECE_TYPES.HEEL) hasHeels = true;
    }
  } else if (community) {
    hasMarks = community.marks > 0;
    hasHeels = community.heels > 0;
  }
  if (pieceType === PIECE_TYPES.HEEL && hasMarks) return false;
  if (pieceType === PIECE_TYPES.PAWN && (hasMarks || hasHeels)) return false;
  return true;
}
function validateSingleMove(move, moverId, boardState, community, numPlayers, stagedMoves = []) {
  const { type, from, to } = move;
  const pFrom = parseLocation(from);
  const pTo = parseLocation(to);
  if (!pFrom || !pTo) return { valid: false, reason: "Invalid location identifier" };
  switch (type) {
    case MOVE_TYPES.ADVANCE: {
      if (pTo.playerId !== String(moverId)) {
        return { valid: false, reason: "Advance must target your own domain" };
      }
      if (pFrom.type === "community" && pTo.type === "seat") {
        if (boardState[to] !== null) return { valid: false, reason: "Seat is occupied" };
        let pieceType = PIECE_TYPES.MARK;
        if (typeof from === "string" && from.startsWith("community_")) {
          const piece = boardState[from];
          if (!piece) return { valid: false, reason: "No piece at selected community spot" };
          pieceType = piece.type;
        } else {
          const commPieces = Object.keys(boardState).filter((k2) => k2.startsWith("community_")).map((k2) => boardState[k2]).filter(Boolean);
          const hasExplicitComm = Object.keys(boardState).some((k2) => k2.startsWith("community_"));
          if (hasExplicitComm) {
            if (commPieces.some((p2) => p2.type === PIECE_TYPES.MARK)) pieceType = PIECE_TYPES.MARK;
            else if (commPieces.some((p2) => p2.type === PIECE_TYPES.HEEL)) pieceType = PIECE_TYPES.HEEL;
            else if (commPieces.some((p2) => p2.type === PIECE_TYPES.PAWN)) pieceType = PIECE_TYPES.PAWN;
            else return { valid: false, reason: "No pieces available in Community" };
          } else {
            if (community && !community.marks && !community.heels && !community.pawns) {
              return { valid: false, reason: "No pieces available in Community" };
            }
            pieceType = community?.marks > 0 ? PIECE_TYPES.MARK : community?.heels > 0 ? PIECE_TYPES.HEEL : PIECE_TYPES.PAWN;
          }
        }
        if (!isCommunityPieceAvailable(pieceType, boardState, community, stagedMoves)) {
          return { valid: false, reason: `${pieceType}s cannot be taken from Community until lower tier pieces are depleted` };
        }
        if (pieceType === PIECE_TYPES.PAWN && Object.keys(boardState).some((k2) => k2.startsWith(`p${pTo.domainNum}_`) && boardState[k2]?.type === PIECE_TYPES.PAWN)) {
          return { valid: false, reason: "A player may only own 1 Pawn at a time" };
        }
        return { valid: true };
      }
      if (pFrom.type === "seat" && pTo.type === "rostrum") {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: "Must move piece from your own seat" };
        const piece = boardState[from];
        if (!piece) return { valid: false, reason: "No piece at source seat" };
        if (boardState[to] !== null) return { valid: false, reason: "Destination rostrum is occupied" };
        const isFaction1Seat = [1, 2, 3].includes(pFrom.index);
        const isFaction2Seat = [4, 5, 6].includes(pFrom.index);
        if (pTo.index === 1 && !isFaction1Seat) {
          return { valid: false, reason: "Seats 4, 5, and 6 cannot advance to Rostrum 1" };
        }
        if (pTo.index === 2 && !isFaction2Seat) {
          return { valid: false, reason: "Seats 1, 2, and 3 cannot advance to Rostrum 2" };
        }
        const factionSeats = isFaction1Seat ? [`p${pFrom.domainNum}_seat1`, `p${pFrom.domainNum}_seat2`, `p${pFrom.domainNum}_seat3`] : [`p${pFrom.domainNum}_seat4`, `p${pFrom.domainNum}_seat5`, `p${pFrom.domainNum}_seat6`];
        if (factionSeats.some((s2) => boardState[s2] === null)) {
          return { valid: false, reason: "All 3 seats of faction must be occupied to Advance to Rostrum" };
        }
        return { valid: true };
      }
      if (pFrom.type === "rostrum" && pTo.type === "office") {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: "Must move piece from your own rostrum" };
        const piece = boardState[from];
        if (!piece) return { valid: false, reason: "No piece at source rostrum" };
        if (boardState[to] !== null) return { valid: false, reason: "Office is occupied" };
        const r1 = `p${pFrom.domainNum}_rostrum1`;
        const r2 = `p${pFrom.domainNum}_rostrum2`;
        if (boardState[r1] === null || boardState[r2] === null) {
          return { valid: false, reason: "Both rostrums must be occupied to Advance to Office" };
        }
        return { valid: true };
      }
      return { valid: false, reason: "Invalid Advance pathway" };
    }
    case MOVE_TYPES.WITHDRAW: {
      if (pFrom.playerId !== String(moverId) && pFrom.type !== "community") {
        return { valid: false, reason: "Withdraw must originate from your own domain" };
      }
      if (pFrom.type === "office" && pTo.type === "rostrum") {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: "Withdraw must originate from your own domain" };
        if (pTo.domainNum !== pFrom.domainNum) return { valid: false, reason: "Withdraw must target your own domain" };
        if (!boardState[from]) return { valid: false, reason: "Office is empty" };
        if (boardState[to] !== null) return { valid: false, reason: "Target rostrum is occupied" };
        return { valid: true };
      }
      if (pFrom.type === "rostrum" && pTo.type === "seat") {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: "Withdraw must originate from your own domain" };
        if (pTo.domainNum !== pFrom.domainNum) return { valid: false, reason: "Withdraw must target a seat in your own domain" };
        if (!boardState[from]) return { valid: false, reason: "Rostrum is empty" };
        if (boardState[to] !== null) return { valid: false, reason: "Target seat is occupied" };
        const inFaction1 = pFrom.index === 1 && [1, 2, 3].includes(pTo.index);
        const inFaction2 = pFrom.index === 2 && [4, 5, 6].includes(pTo.index);
        if (!inFaction1 && !inFaction2) {
          return { valid: false, reason: "Seat must be within the same faction" };
        }
        return { valid: true };
      }
      if (pFrom.type === "seat" && pTo.type === "community") {
        if (pFrom.playerId !== String(moverId)) return { valid: false, reason: "Withdraw must originate from your own domain" };
        if (!boardState[from]) return { valid: false, reason: "Seat is empty" };
        return { valid: true };
      }
      return { valid: false, reason: "Invalid Withdraw pathway" };
    }
    case MOVE_TYPES.ORGANIZE: {
      if (pFrom.playerId !== String(moverId)) {
        return { valid: false, reason: "Organize must originate from your own piece" };
      }
      const piece = boardState[from];
      if (!piece) return { valid: false, reason: "No piece at source location" };
      if (pFrom.type === "seat" && pTo.type === "seat") {
        if (!areSeatsAdjacent(from, to, numPlayers)) {
          return { valid: false, reason: "Target seat is not adjacent" };
        }
        if (boardState[to] !== null) return { valid: false, reason: "Target seat is occupied" };
        return { valid: true };
      }
      if (pFrom.type === "rostrum" && pTo.type === "rostrum") {
        if (!areRostrumsAdjacent(from, to, numPlayers)) {
          return { valid: false, reason: "Target rostrum is not adjacent" };
        }
        if (boardState[to] !== null) return { valid: false, reason: "Target rostrum is occupied" };
        return { valid: true };
      }
      return { valid: false, reason: "Invalid Organize pathway" };
    }
    case MOVE_TYPES.REMOVE: {
      if (pFrom.playerId === String(moverId)) {
        return { valid: false, reason: "Cannot Remove pieces from your own domain" };
      }
      if (pFrom.type !== "seat" || pTo.type !== "community") {
        return { valid: false, reason: "Remove must target an opponent seat and send piece to Community" };
      }
      const piece = boardState[from];
      if (!piece) return { valid: false, reason: "Target seat is empty" };
      if (piece.type !== PIECE_TYPES.MARK) {
        return { valid: false, reason: "Can only Remove Marks (not Heels or Pawns)" };
      }
      return { valid: true };
    }
    case MOVE_TYPES.INFLUENCE: {
      if (pFrom.playerId === String(moverId)) {
        return { valid: false, reason: "Influence must target an opponent piece" };
      }
      const piece = boardState[from];
      if (!piece) return { valid: false, reason: "Target location is empty" };
      if (piece.type === PIECE_TYPES.PAWN) {
        return { valid: false, reason: "Pawns cannot be Influenced" };
      }
      if (pFrom.type === "seat" && pTo.type === "seat") {
        if (!areSeatsAdjacent(from, to, numPlayers)) {
          return { valid: false, reason: "Target seat is not adjacent" };
        }
        if (boardState[to] !== null) return { valid: false, reason: "Target seat is occupied" };
        return { valid: true };
      }
      if (pFrom.type === "rostrum" && pTo.type === "rostrum") {
        if (!areRostrumsAdjacent(from, to, numPlayers)) {
          return { valid: false, reason: "Target rostrum is not adjacent" };
        }
        if (boardState[to] !== null) return { valid: false, reason: "Target rostrum is occupied" };
        return { valid: true };
      }
      return { valid: false, reason: "Invalid Influence pathway" };
    }
    case MOVE_TYPES.ASSIST: {
      if (pFrom.type !== "community" || pTo.type !== "seat") {
        return { valid: false, reason: "Assist must place piece from Community into a seat" };
      }
      if (pTo.playerId === String(moverId)) {
        return { valid: false, reason: "Cannot Assist yourself -- must target opponent domain" };
      }
      if (boardState[to] !== null) return { valid: false, reason: "Target seat is occupied" };
      if (typeof from === "string" && from.startsWith("community_")) {
        const piece = boardState[from];
        if (!piece) return { valid: false, reason: "No piece at selected community spot" };
        if (piece.type !== PIECE_TYPES.MARK && piece.type !== PIECE_TYPES.HEEL) {
          return { valid: false, reason: "Only Marks and Heels can be placed in Seats" };
        }
        if (!isCommunityPieceAvailable(piece.type, boardState, community, stagedMoves)) {
          return { valid: false, reason: `${piece.type}s cannot be taken from Community until lower tier pieces are depleted` };
        }
      } else {
        if (community && community.marks === 0 && community.heels === 0) {
          return { valid: false, reason: "No Marks or Heels available in Community" };
        }
        const pType = community?.marks > 0 ? PIECE_TYPES.MARK : PIECE_TYPES.HEEL;
        if (!isCommunityPieceAvailable(pType, boardState, community, stagedMoves)) {
          return { valid: false, reason: `${pType}s cannot be taken from Community until lower tier pieces are depleted` };
        }
      }
      return { valid: true };
    }
    default:
      return { valid: false, reason: "Unknown move type" };
  }
}
function validateMoveCombination(moves, moverId, boardState, community, numPlayers) {
  if (!Array.isArray(moves)) return { valid: false, reason: "Moves must be an array" };
  if (moves.length > 2) return { valid: false, reason: "Cannot make more than 2 moves" };
  if (moves.length === 0) return { valid: true };
  const v1 = validateSingleMove(moves[0], moverId, boardState, community, numPlayers);
  if (!v1.valid) return v1;
  if (moves.length === 1) return { valid: true };
  const tempBoard = JSON.parse(JSON.stringify(boardState));
  const tempCommunity = { ...community };
  applyMoveToState(moves[0], tempBoard, tempCommunity);
  const v2 = validateSingleMove(moves[1], moverId, tempBoard, tempCommunity, numPlayers, [moves[0]]);
  if (!v2.valid) return v2;
  const piece1 = boardState[moves[0].from];
  const piece1Id = piece1 ? piece1.id : null;
  const piece2 = tempBoard[moves[1].from];
  const piece2Id = piece2 ? piece2.id : null;
  if (piece1Id && piece2Id && piece1Id === piece2Id) {
    return { valid: false, reason: "A piece may only move ONCE during a player's turn" };
  }
  const from1 = moves[0].from;
  const to1 = moves[0].to;
  const from2 = moves[1].from;
  const to2 = moves[1].to;
  const normTo1 = typeof to1 === "string" && to1.startsWith("community_") ? "community" : to1;
  const normFrom2 = typeof from2 === "string" && from2.startsWith("community_") ? "community" : from2;
  if (normTo1 !== "community" && normTo1 === normFrom2) {
    return { valid: false, reason: "Two moves in a turn must affect separate pieces" };
  }
  if (from1 === from2 && from1 !== "community") {
    return { valid: false, reason: "Two moves in a turn must affect separate pieces" };
  }
  const selfMoves = [MOVE_TYPES.WITHDRAW, MOVE_TYPES.ADVANCE, MOVE_TYPES.ORGANIZE];
  const move1Self = selfMoves.includes(moves[0].type);
  const move2Self = selfMoves.includes(moves[1].type);
  if (move1Self === move2Self) {
    return {
      valid: false,
      reason: "A 2-move turn must combine 1 Self Move (Withdraw/Advance/Organize) and 1 Opponent Move (Assist/Remove/Influence)"
    };
  }
  return { valid: true };
}
function adjustCommunityCount(community, pieceType, delta) {
  if (!community || !pieceType) return;
  const key = pieceType === PIECE_TYPES.MARK ? "marks" : pieceType === PIECE_TYPES.HEEL ? "heels" : pieceType === PIECE_TYPES.PAWN ? "pawns" : null;
  if (key && typeof community[key] === "number") community[key] = Math.max(0, community[key] + delta);
}
function applyMoveToState(move, boardState, community) {
  const { from, to } = move;
  let pieceToMove = null;
  const isFromComm = from === "community" || from.startsWith("community_");
  const isToComm = to === "community" || to.startsWith("community_");
  if (isFromComm) {
    if (from !== "community" && boardState[from]) {
      pieceToMove = boardState[from];
      boardState[from] = null;
      adjustCommunityCount(community, pieceToMove.type, -1);
    } else {
      const commKeys = Object.keys(boardState).filter((k2) => k2.startsWith("community_")).sort((a2, b2) => parseInt(a2.replace("community_", ""), 10) - parseInt(b2.replace("community_", ""), 10));
      const commKey = commKeys.find((k2) => boardState[k2]?.type === PIECE_TYPES.MARK) || commKeys.find((k2) => boardState[k2]?.type === PIECE_TYPES.HEEL) || commKeys.find((k2) => boardState[k2] !== null);
      if (commKey) {
        pieceToMove = boardState[commKey];
        boardState[commKey] = null;
        adjustCommunityCount(community, pieceToMove.type, -1);
      } else if (community?.marks > 0) {
        community.marks--;
        pieceToMove = { id: `m_${Date.now()}_${Math.random()}`, type: PIECE_TYPES.MARK };
      } else if (community?.heels > 0) {
        community.heels--;
        pieceToMove = { id: `h_${Date.now()}_${Math.random()}`, type: PIECE_TYPES.HEEL };
      } else if (community?.pawns > 0) {
        community.pawns--;
        pieceToMove = { id: `p_${Date.now()}_${Math.random()}`, type: PIECE_TYPES.PAWN };
      }
    }
  } else {
    pieceToMove = boardState[from];
    boardState[from] = null;
  }
  if (isToComm) {
    if (to !== "community" && to.startsWith("community_") && boardState[to] == null) {
      boardState[to] = pieceToMove;
    } else {
      const emptyCommKey = Object.keys(boardState).filter((k2) => k2.startsWith("community_")).sort((a2, b2) => parseInt(a2.replace("community_", ""), 10) - parseInt(b2.replace("community_", ""), 10)).find((k2) => boardState[k2] === null);
      if (emptyCommKey) boardState[emptyCommKey] = pieceToMove;
    }
    adjustCommunityCount(community, pieceToMove?.type, 1);
  } else {
    boardState[to] = pieceToMove;
  }
}
function isMoveTypePossible(moveType, moverId, boardState, community, numPlayers, priorMoves = [], preMoveBoard = null) {
  if (!boardState) return true;
  const hasPrior = priorMoves.length === 1 && preMoveBoard;
  let priorFrom = null;
  let priorNormTo = null;
  let priorPieceId = null;
  if (hasPrior) {
    const m1 = priorMoves[0];
    const selfMoves = [MOVE_TYPES.WITHDRAW, MOVE_TYPES.ADVANCE, MOVE_TYPES.ORGANIZE];
    if (selfMoves.includes(m1.type) === selfMoves.includes(moveType)) {
      return false;
    }
    priorFrom = m1.from;
    priorNormTo = typeof m1.to === "string" && m1.to.startsWith("community_") ? "community" : m1.to;
    priorPieceId = preMoveBoard[priorFrom]?.id || null;
  }
  const candidateKeys = Object.keys(boardState);
  const hasExplicitComm = candidateKeys.some((k2) => k2.startsWith("community_"));
  const fromCandidates = candidateKeys.filter((k2) => !k2.startsWith("community_") || boardState[k2] !== null);
  if (!hasExplicitComm && !fromCandidates.includes("community")) fromCandidates.push("community");
  const toCandidates = candidateKeys.filter((k2) => !k2.startsWith("community_"));
  if (!toCandidates.includes("community")) toCandidates.push("community");
  for (const fromLoc of fromCandidates) {
    if (hasPrior) {
      const normFrom2 = fromLoc.startsWith("community_") ? "community" : fromLoc;
      if (priorNormTo !== "community" && priorNormTo === normFrom2) continue;
      if (priorFrom === fromLoc && priorFrom !== "community") continue;
      const piece2Id = boardState[fromLoc]?.id || null;
      if (priorPieceId && piece2Id && priorPieceId === piece2Id) continue;
    }
    for (const toLoc of toCandidates) {
      if (fromLoc === toLoc) continue;
      const moveCandidate = { type: moveType, from: fromLoc, to: toLoc };
      const val = validateSingleMove(moveCandidate, moverId, boardState, community, numPlayers, priorMoves);
      if (val.valid) return true;
    }
  }
  return false;
}
function classifyPlay(movesMade, tileIdPlayed, moverId = "0", boardState = null, community = null, numPlayers = 3) {
  const moveTypesMade = (movesMade || []).map((m) => m.type).sort();
  const playedTile = TILES[tileIdPlayed];
  if (!playedTile) return "Dishonest";
  if (playedTile.isWild) return "Honest";
  const playedTileMoveTypes = [...playedTile.moves].sort();
  const isMatchWithPlayedTile = moveTypesMade.length === playedTileMoveTypes.length && moveTypesMade.every((val, idx) => val === playedTileMoveTypes[idx]);
  if (isMatchWithPlayedTile) return "Honest";
  if (boardState) {
    const unperformedMoves = [...playedTile.moves];
    let hasUnmatchedMove = false;
    for (const m of movesMade || []) {
      const idx = unperformedMoves.indexOf(m.type);
      if (idx !== -1) unperformedMoves.splice(idx, 1);
      else hasUnmatchedMove = true;
    }
    if (hasUnmatchedMove) return "Dishonest";
    const tempBoard = JSON.parse(JSON.stringify(boardState));
    const tempComm = community ? JSON.parse(JSON.stringify(community)) : null;
    for (const m of movesMade || []) {
      applyMoveToState(m, tempBoard, tempComm);
    }
    const allUnperformedImpossible = unperformedMoves.every((reqType) => {
      return !isMoveTypePossible(
        reqType,
        moverId,
        tempBoard,
        tempComm,
        numPlayers,
        movesMade || [],
        boardState
      );
    });
    if (allUnperformedImpossible) {
      return "Honest";
    }
  }
  return "Dishonest";
}

// src/domain/gameLog.js
function appendGameLog(G2, text2, tone = "info") {
  if (!G2 || !text2) return;
  if (!Array.isArray(G2.history)) G2.history = [];
  const nextId = G2.history.length > 0 ? (G2.history[G2.history.length - 1].id || G2.history.length) + 1 : 1;
  G2.history.push({ id: nextId, text: text2, tone });
  if (G2.history.length > 150) {
    G2.history.splice(0, G2.history.length - 150);
  }
}
function ownerFromLoc(loc) {
  if (typeof loc !== "string") return null;
  const m = loc.match(/^p(\d+)_/);
  return m ? String(parseInt(m[1], 10) - 1) : null;
}
function formatMovePastClause(move) {
  if (!move || !move.type) return "";
  switch (move.type) {
    case "Advance":
      return "Advanced";
    case "Withdraw":
      return "Withdrew";
    case "Organize":
      return "Organized";
    case "Assist": {
      const target = ownerFromLoc(move.to);
      return target !== null ? `Assisted Player ${target}` : "Assisted";
    }
    case "Remove": {
      const target = ownerFromLoc(move.from);
      return target !== null ? `Removed Player ${target}` : "Removed";
    }
    case "Influence": {
      const target = ownerFromLoc(move.from) ?? ownerFromLoc(move.to);
      return target !== null ? `Influenced Player ${target}` : "Influenced";
    }
    default:
      return move.type;
  }
}
function formatMoveInfinitive(move) {
  if (!move || !move.type) return "move a piece";
  switch (move.type) {
    case "Advance":
      return "Advance";
    case "Withdraw":
      return "Withdraw";
    case "Organize":
      return "Organize";
    case "Assist": {
      const target = ownerFromLoc(move.to);
      return target !== null ? `Assist Player ${target}` : "Assist";
    }
    case "Remove": {
      const target = ownerFromLoc(move.from);
      return target !== null ? `Remove Player ${target}` : "Remove";
    }
    case "Influence": {
      const target = ownerFromLoc(move.from) ?? ownerFromLoc(move.to);
      return target !== null ? `Influence Player ${target}` : "Influence";
    }
    default:
      return move.type;
  }
}
function formatTurnMovesLog(moverId, moveActions = []) {
  const clauses = (moveActions || []).map(formatMovePastClause).filter(Boolean);
  if (clauses.length === 0) return "";
  return `Player ${moverId} ${clauses.join(" and ")}.`;
}
function createEmptyPlayerStats() {
  return {
    whistlesBlown: 0,
    challengesMade: 0,
    tilesPlayedToSelf: 0,
    bureaucracyFunding: []
  };
}
function recordPlayerStat(G2, playerID, key, delta = 1) {
  if (!G2 || playerID === void 0 || playerID === null) return;
  if (!G2.matchStats) G2.matchStats = {};
  const id = String(playerID);
  if (!G2.matchStats[id]) G2.matchStats[id] = createEmptyPlayerStats();
  G2.matchStats[id][key] = (G2.matchStats[id][key] || 0) + delta;
}
function recordBureaucracyFunding(G2) {
  if (!G2 || !G2.players) return;
  if (!G2.matchStats) G2.matchStats = {};
  for (const pId of Object.keys(G2.players)) {
    if (!G2.matchStats[pId]) G2.matchStats[pId] = createEmptyPlayerStats();
    G2.matchStats[pId].bureaucracyFunding.push(G2.players[pId]?.funding || 0);
  }
}

// src/domain/phases/campaignResolution.js
function applyVictoryCheck(G2, tileId) {
  if (!G2 || !G2.players || tileId === "BLANK") return;
  const prevWinner = G2.winner;
  const winners = Object.keys(G2.players).filter((p2) => checkVictory(G2.boardState, p2));
  if (winners.length > 1) G2.winner = "draw";
  else if (winners.length === 1) G2.winner = winners[0];
  if (G2.winner && G2.winner !== prevWinner) {
    appendGameLog(G2, G2.winner === "draw" ? "Match ended in a draw." : `Player ${G2.winner} won the game!`, "win");
  }
}
function resolvePlayToBank(G2) {
  if (!G2 || !G2.pendingPlay) return;
  const { moverId, receiverId, tileIdPlayed } = G2.pendingPlay;
  G2.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
  G2.nextMoverId = receiverId;
  G2.pendingPlay = null;
  G2.lastOutcomeNotice = {
    title: "Quiet is Kept!",
    type: "quiet",
    moverId,
    receiverId,
    tileIdPlayed,
    text: `Player ${receiverId} banked Player ${moverId}'s tile.`
  };
  appendGameLog(G2, "Quiet is Kept!", "accept");
  if (!findUnsupportedPiece(G2.boardState, G2.numPlayers)) {
    applyVictoryCheck(G2, tileIdPlayed);
  }
}
function finishPendingPlayOrReward(G2) {
  const challengerId = G2.pendingPlay?.successfulChallengerId;
  const receiverId = G2.pendingPlay?.receiverId || G2.nextMoverId;
  const tileId = G2.pendingPlay?.reexecuteTileId || G2.pendingPlay?.tileIdPlayed;
  applyVictoryCheck(G2, tileId);
  if (challengerId && G2.players[challengerId]) {
    const hasFacedownTiles = (G2.players[challengerId].bank || []).some((t2) => t2.faceDown);
    if (hasFacedownTiles) {
      G2.pendingPlay.step = "challengerReward";
      return;
    } else {
      if (G2.players[challengerId].credibilityNotchesLost > 0) {
        G2.players[challengerId].credibilityNotchesLost--;
      }
    }
  }
  G2.pendingPlay = null;
  if (receiverId !== void 0 && receiverId !== null) {
    G2.nextMoverId = receiverId;
  }
}
function findNextPlayerWithTiles(G2, startId) {
  const np = G2 && G2.numPlayers || 3;
  let targetId = String(startId ?? "0");
  let searchCount = 0;
  while (G2 && G2.players && G2.players[targetId] && (G2.players[targetId].hand || []).length === 0 && searchCount < np) {
    targetId = getNextPlayer(targetId, np);
    searchCount++;
  }
  return parseInt(targetId, 10);
}

// src/domain/supportRule.js
function formatSupportSpot(loc) {
  const p2 = parseLocation(loc);
  if (!p2) return loc;
  if (p2.type === "office") return "Office";
  if (p2.type === "rostrum") return `Rostrum ${p2.index}`;
  if (p2.type === "seat") return `Seat ${p2.index}`;
  return loc;
}
function queuePendingSupport(G2, options = {}) {
  const unsupported = findUnsupportedPiece(G2.boardState, G2.numPlayers);
  if (!unsupported) return false;
  G2.pendingSupport = {
    ...unsupported,
    phase: options.phase || "campaign",
    afterResolve: options.afterResolve || null,
    returnToPlayerId: options.returnToPlayerId ?? null,
    tileId: options.tileId || null
  };
  return true;
}
function handleResolveSupportDrop({ G: G2, playerID, events }, toLoc) {
  const ps = G2?.pendingSupport;
  const pId = String(playerID);
  if (!ps || String(ps.ownerId) !== pId) return INVALID_MOVE;
  if (!ps.validDestinations.includes(toLoc)) return INVALID_MOVE;
  if (!G2.boardState[ps.from] || G2.boardState[toLoc] !== null) return INVALID_MOVE;
  G2.boardState[toLoc] = G2.boardState[ps.from];
  G2.boardState[ps.from] = null;
  appendGameLog(G2, `Player ${pId} moved unsupported piece to ${formatSupportSpot(toLoc)}.`, "info");
  const nextUnsupported = findUnsupportedPiece(G2.boardState, G2.numPlayers);
  if (nextUnsupported) {
    G2.pendingSupport = {
      ...nextUnsupported,
      phase: ps.phase,
      afterResolve: ps.afterResolve,
      returnToPlayerId: ps.returnToPlayerId,
      tileId: ps.tileId
    };
    if (String(nextUnsupported.ownerId) !== pId) {
      events.endTurn();
    }
    return;
  }
  G2.pendingSupport = null;
  if (ps.afterResolve === "resolvePlayToBank") {
    resolvePlayToBank(G2);
  } else if (ps.afterResolve === "finishPendingPlayOrReward") {
    finishPendingPlayOrReward(G2);
  } else if (ps.afterResolve === "finishChallengerReward") {
    const receiverId = G2.pendingPlay?.receiverId;
    G2.pendingPlay = null;
    if (receiverId !== void 0 && receiverId !== null) G2.nextMoverId = receiverId;
    applyVictoryCheck(G2, ps.tileId);
  } else if (ps.afterResolve === "victoryCheck") {
    applyVictoryCheck(G2, ps.tileId);
  }
  if (ps.phase === "bureaucracy") {
    if (ps.returnToPlayerId !== null && String(ps.returnToPlayerId) !== pId) {
      events.endTurn();
    }
  } else {
    events.endTurn();
  }
}

// src/domain/bureaucracy.js
function selectBestBankTilesToPay(facedownBankTiles, cost) {
  if (!facedownBankTiles || facedownBankTiles.length === 0 || cost <= 0) return [];
  let bestSubset = null;
  let bestFundingSum = Infinity;
  let bestTileCount = Infinity;
  const n2 = facedownBankTiles.length;
  const numSubsets = 1 << n2;
  for (let i2 = 1; i2 < numSubsets; i2++) {
    const subset = [];
    let sum = 0;
    for (let j2 = 0; j2 < n2; j2++) {
      if ((i2 & 1 << j2) !== 0) {
        subset.push(facedownBankTiles[j2]);
        sum += TILES[facedownBankTiles[j2].tileId]?.funding || 0;
      }
    }
    if (sum >= cost) {
      const isBetter = sum < bestFundingSum || sum === bestFundingSum && subset.length < bestTileCount;
      if (isBetter) {
        bestFundingSum = sum;
        bestTileCount = subset.length;
        bestSubset = subset;
      }
    }
  }
  return bestSubset || [];
}
function promoteSwapInState(G2, targetLoc, targetType, higherType) {
  const commKey = Object.keys(G2.boardState).find(
    (k2) => k2.startsWith("community_") && G2.boardState[k2]?.type === higherType
  );
  if (!commKey) return false;
  const targetPiece = G2.boardState[targetLoc];
  const commPiece = G2.boardState[commKey];
  G2.boardState[targetLoc] = commPiece;
  G2.boardState[commKey] = targetPiece;
  if (targetType === PIECE_TYPES.MARK && higherType === PIECE_TYPES.HEEL) {
    G2.community.marks = (G2.community.marks || 0) + 1;
    G2.community.heels = Math.max(0, (G2.community.heels || 0) - 1);
  } else if (targetType === PIECE_TYPES.HEEL && higherType === PIECE_TYPES.PAWN) {
    G2.community.heels = (G2.community.heels || 0) + 1;
    G2.community.pawns = Math.max(0, (G2.community.pawns || 0) - 1);
  }
  return true;
}
function initBureaucracy(G2) {
  if (!G2 || !G2.players) return;
  Object.keys(G2.players).forEach((pId) => {
    const funding = G2.players[pId].bank ? G2.players[pId].bank.reduce((sum, item) => {
      if (item.faceDown) {
        return sum + (TILES[item.tileId]?.funding || 0);
      }
      return sum;
    }, 0) : 0;
    G2.players[pId].funding = funding;
    G2.players[pId].bureaucracyInitialFunding = funding;
  });
  const order = Object.keys(G2.players).sort((a2, b2) => {
    if (G2.players[b2].funding !== G2.players[a2].funding) {
      return G2.players[b2].funding - G2.players[a2].funding;
    }
    const pawnA = Object.keys(G2.boardState).some((k2) => k2.startsWith(`p${parseInt(a2, 10) + 1}_`) && G2.boardState[k2]?.type === "Pawn");
    const pawnB = Object.keys(G2.boardState).some((k2) => k2.startsWith(`p${parseInt(b2, 10) + 1}_`) && G2.boardState[k2]?.type === "Pawn");
    if (pawnA !== pawnB) return pawnB ? 1 : -1;
    const countHeels = (id) => Object.keys(G2.boardState).filter((k2) => k2.startsWith(`p${parseInt(id, 10) + 1}_`) && G2.boardState[k2]?.type === "Heel").length;
    if (countHeels(b2) !== countHeels(a2)) return countHeels(b2) - countHeels(a2);
    const countMarks = (id) => Object.keys(G2.boardState).filter((k2) => k2.startsWith(`p${parseInt(id, 10) + 1}_`) && G2.boardState[k2]?.type === "Mark").length;
    if (countMarks(b2) !== countMarks(a2)) return countMarks(b2) - countMarks(a2);
    return G2.players[a2].credibilityNotchesLost - G2.players[b2].credibilityNotchesLost;
  });
  G2.bureaucracyTurnOrder = order;
  G2.bureaucracyTurnIndex = 0;
}
function cleanupBureaucracy(G2) {
  if (!G2 || !G2.players) return;
  delete G2.bureaucracyTurnOrder;
  delete G2.bureaucracyTurnIndex;
  G2.lastOutcomeNotice = null;
  Object.keys(G2.players).forEach((pId) => {
    delete G2.players[pId].bureaucracyInitialFunding;
    if (G2.players[pId].bank) {
      G2.players[pId].hand = G2.players[pId].bank.map((b2) => b2.tileId);
      G2.players[pId].bank = [];
    }
  });
  const winners = Object.keys(G2.players).filter((pId) => checkVictory(G2.boardState, pId));
  if (winners.length > 1) G2.winner = "draw";
  else if (winners.length === 1) G2.winner = winners[0];
}
function applyChallengerBureaucracyAction(G2, pId, { actionType, targetLoc, subAction }) {
  const player = G2.players[pId];
  const facedownTiles = (player?.bank || []).filter((t2) => t2.faceDown);
  const prices = BUREAUCRACY_PRICES[G2.numPlayers] || BUREAUCRACY_PRICES[3];
  let cost = 0;
  if (actionType === "RESTORE_CRED") cost = prices.RESTORE_CRED;
  else if (actionType === "PROMOTE_SEAT") cost = prices.PROMOTE_SEAT;
  else if (actionType === "PROMOTE_ROSTRUM") cost = prices.PROMOTE_ROSTRUM;
  else if (actionType === "PROMOTE_OFFICE") cost = prices.PROMOTE_OFFICE;
  else if (actionType === "BASIC_ACTION") cost = prices.BASIC_ACTION;
  else if (actionType === "EXTRA_ACTION") cost = prices.EXTRA_ACTION;
  const tilesToPay = selectBestBankTilesToPay(facedownTiles, cost);
  if (tilesToPay.length === 0) return false;
  const success = executeBureaucracyActionPayload(G2, pId, { actionType, targetLoc, subAction });
  if (!success) return false;
  tilesToPay.forEach((t2) => {
    t2.faceDown = false;
  });
  if (actionType === "RESTORE_CRED") {
    appendGameLog(G2, `Player ${pId} spent K${cost} to restore credibility.`, "info");
  } else if (actionType === "PROMOTE_SEAT" || actionType === "PROMOTE_ROSTRUM" || actionType === "PROMOTE_OFFICE") {
    const pieceType = G2.boardState[targetLoc]?.type || "piece";
    const spotWord = actionType === "PROMOTE_SEAT" ? "seat" : actionType === "PROMOTE_ROSTRUM" ? "rostrum" : "office";
    appendGameLog(G2, `Player ${pId} spent K${cost} to Promote to ${pieceType} in ${spotWord}.`, "info");
  } else if (subAction) {
    appendGameLog(G2, `Player ${pId} spent K${cost} to ${formatMoveInfinitive(subAction)}.`, "info");
  }
  return true;
}
function executeBureaucracyActionPayload(G2, pId, { actionType, targetLoc, subAction }) {
  const prices = BUREAUCRACY_PRICES[G2.numPlayers] || BUREAUCRACY_PRICES[3];
  const player = G2.players[pId];
  if (!player) return false;
  const playerHasPawn = Object.keys(G2.boardState).some((k2) => k2.startsWith(`p${parseInt(pId, 10) + 1}_`) && G2.boardState[k2]?.type === PIECE_TYPES.PAWN);
  if (actionType === "RESTORE_CRED") {
    if (player.credibilityNotchesLost === 0) return false;
    player.credibilityNotchesLost--;
    return true;
  }
  if (actionType === "PROMOTE_SEAT" || actionType === "PROMOTE_ROSTRUM" || actionType === "PROMOTE_OFFICE") {
    const piece = G2.boardState[targetLoc];
    if (!piece) return false;
    if (piece.type === PIECE_TYPES.MARK && G2.community.heels > 0) {
      return promoteSwapInState(G2, targetLoc, PIECE_TYPES.MARK, PIECE_TYPES.HEEL);
    } else if (piece.type === PIECE_TYPES.HEEL && G2.community.pawns > 0) {
      if (playerHasPawn) return false;
      return promoteSwapInState(G2, targetLoc, PIECE_TYPES.HEEL, PIECE_TYPES.PAWN);
    }
    return false;
  }
  if (actionType === "BASIC_ACTION" || actionType === "EXTRA_ACTION") {
    if (!subAction || !subAction.type || !subAction.from || !subAction.to) return false;
    const isBasic = actionType === "BASIC_ACTION";
    const allowedTypes = isBasic ? ["Advance", "Withdraw", "Organize"] : ["Assist", "Remove", "Influence"];
    if (!allowedTypes.includes(subAction.type)) return false;
    const val = validateSingleMove(subAction, pId, G2.boardState, G2.community, G2.numPlayers);
    if (!val.valid) return false;
    applyMoveToState(subAction, G2.boardState, G2.community);
    return true;
  }
  return false;
}
function createBureaucracyPhase() {
  return {
    onBegin: ({ G: G2 }) => {
      initBureaucracy(G2);
      recordBureaucracyFunding(G2);
      appendGameLog(G2, "BUREAUCRACY", "phase");
    },
    turn: {
      order: {
        first: ({ G: G2 }) => G2 && G2.bureaucracyTurnOrder && G2.bureaucracyTurnOrder.length > 0 ? parseInt(G2.bureaucracyTurnOrder[0], 10) : 0,
        next: ({ G: G2 }) => {
          if (G2 && G2.pendingSupport) return parseInt(G2.pendingSupport.ownerId, 10);
          if (!G2 || !G2.bureaucracyTurnOrder || G2.bureaucracyTurnIndex === void 0) return void 0;
          if (G2.bureaucracyTurnIndex < G2.bureaucracyTurnOrder.length) {
            return parseInt(G2.bureaucracyTurnOrder[G2.bureaucracyTurnIndex], 10);
          }
          return void 0;
        }
      }
    },
    moves: {
      loadSaveState: handleLoadSaveState,
      resolveSupportDrop: handleResolveSupportDrop,
      buyBureaucracyAction: ({ G: G2, ctx, playerID, events }, { actionType, targetLoc, subAction }) => {
        if (G2.pendingSupport) return INVALID_MOVE;
        const pId = String(playerID);
        const prices = BUREAUCRACY_PRICES[G2.numPlayers] || BUREAUCRACY_PRICES[3];
        const player = G2.players[pId];
        let cost = 0;
        if (actionType === "RESTORE_CRED") cost = prices.RESTORE_CRED;
        else if (actionType === "PROMOTE_SEAT") cost = prices.PROMOTE_SEAT;
        else if (actionType === "PROMOTE_ROSTRUM") cost = prices.PROMOTE_ROSTRUM;
        else if (actionType === "PROMOTE_OFFICE") cost = prices.PROMOTE_OFFICE;
        else if (actionType === "BASIC_ACTION") cost = prices.BASIC_ACTION;
        else if (actionType === "EXTRA_ACTION") cost = prices.EXTRA_ACTION;
        if (cost === 0 || player.funding < cost) return INVALID_MOVE;
        const success = executeBureaucracyActionPayload(G2, pId, { actionType, targetLoc, subAction });
        if (!success) return INVALID_MOVE;
        player.funding -= cost;
        if (actionType === "RESTORE_CRED") {
          appendGameLog(G2, `Player ${pId} spent K${cost} to restore credibility.`, "info");
        } else if (actionType === "PROMOTE_SEAT" || actionType === "PROMOTE_ROSTRUM" || actionType === "PROMOTE_OFFICE") {
          const pieceType = G2.boardState[targetLoc]?.type || "piece";
          const spotWord = actionType === "PROMOTE_SEAT" ? "seat" : actionType === "PROMOTE_ROSTRUM" ? "rostrum" : "office";
          appendGameLog(G2, `Player ${pId} spent K${cost} to Promote to ${pieceType} in ${spotWord}.`, "info");
        } else {
          appendGameLog(G2, `Player ${pId} spent K${cost} to ${formatMoveInfinitive(subAction)}.`, "info");
        }
        if (queuePendingSupport(G2, { phase: "bureaucracy", returnToPlayerId: pId })) {
          if (String(G2.pendingSupport.ownerId) !== pId) {
            events.endTurn();
          }
        }
      },
      endBureaucracyTurn: ({ G: G2, playerID, events }) => {
        if (G2?.pendingSupport) return INVALID_MOVE;
        if (G2) {
          if (playerID !== void 0 && playerID !== null) {
            appendGameLog(G2, `Player ${playerID} ended their Bureaucracy turn.`, "info");
          }
          G2.bureaucracyTurnIndex = (G2.bureaucracyTurnIndex || 0) + 1;
        }
        events.endTurn();
      }
    },
    endIf: ({ G: G2 }) => {
      if (!G2 || G2.pendingSupport || G2.bureaucracyTurnIndex === void 0 || !G2.bureaucracyTurnOrder) return false;
      return G2.bureaucracyTurnIndex >= G2.bureaucracyTurnOrder.length;
    },
    next: ({ G: G2 }) => {
      if (G2 && G2.winner) return void 0;
      return "campaign";
    },
    onEnd: ({ G: G2 }) => {
      cleanupBureaucracy(G2);
    }
  };
}

// src/domain/phases/campaignPhase.js
function createCampaignPhase() {
  return {
    onBegin: ({ G: G2 }) => {
      if (!G2 || !G2.players) return;
      G2.lastOutcomeNotice = null;
      appendGameLog(G2, "CAMPAIGN", "phase");
      if (G2.nextMoverId === void 0 || G2.nextMoverId === null) {
        let startP = "0";
        Object.keys(G2.players).forEach((pId) => {
          if (G2.players[pId].hand && G2.players[pId].hand.includes("03")) startP = pId;
        });
        G2.nextMoverId = startP;
      }
    },
    turn: {
      order: {
        first: ({ G: G2 }) => {
          if (!G2 || !G2.players) return 0;
          if (G2.nextMoverId !== void 0 && G2.nextMoverId !== null) {
            return findNextPlayerWithTiles(G2, G2.nextMoverId);
          }
          let startP = "0";
          Object.keys(G2.players).forEach((pId) => {
            if (G2.players[pId].hand && G2.players[pId].hand.includes("03")) startP = pId;
          });
          return findNextPlayerWithTiles(G2, startP);
        },
        next: ({ G: G2, ctx }) => {
          if (G2 && G2.pendingSupport) {
            return parseInt(G2.pendingSupport.ownerId, 10);
          }
          if (G2 && G2.pendingPlay) {
            if (G2.pendingPlay.step === "receipt") {
              return parseInt(G2.pendingPlay.receiverId, 10);
            }
            if (G2.pendingPlay.step === "challenge") {
              const eligibleChallengers = getOrderedChallengers(G2);
              const remaining = eligibleChallengers.filter(
                (id) => !G2.pendingPlay.challengesPassed.includes(id)
              );
              if (remaining.length > 0) {
                return parseInt(remaining[0], 10);
              }
              return parseInt(G2.pendingPlay.receiverId, 10);
            }
            if (G2.pendingPlay.step === "reexecute" || G2.pendingPlay.step === "penaltyWithdraw") {
              return parseInt(G2.pendingPlay.moverId, 10);
            }
            if (G2.pendingPlay.step === "receiverReward" || G2.pendingPlay.step === "freeAdvance") {
              return parseInt(G2.pendingPlay.receiverId, 10);
            }
            if (G2.pendingPlay.step === "challengerReward") {
              return parseInt(G2.pendingPlay.successfulChallengerId, 10);
            }
            if (G2.pendingPlay.nextMoverId !== void 0) {
              return parseInt(G2.pendingPlay.nextMoverId, 10);
            }
          }
          const targetId = G2 && G2.nextMoverId !== void 0 && G2.nextMoverId !== null ? String(G2.nextMoverId) : String(ctx.currentPlayer);
          return findNextPlayerWithTiles(G2, targetId);
        }
      }
    },
    moves: {
      loadSaveState: handleLoadSaveState,
      resolveSupportDrop: handleResolveSupportDrop,
      submitTurnMovesAndTile: ({ G: G2, ctx, playerID, events }, payload) => {
        if (G2.pendingSupport) return INVALID_MOVE;
        const parsed = TurnSubmissionSchema.safeParse(payload);
        if (!parsed.success) {
          console.warn("[submitTurnMovesAndTile] Invalid payload schema:", parsed.error);
          return INVALID_MOVE;
        }
        const moverId = String(playerID);
        const { tileId, receiverId, moves: moveActions } = parsed.data;
        if (!G2.players[moverId] || !G2.players[moverId].hand.includes(tileId)) {
          console.warn(`[submitTurnMovesAndTile] Tile ${tileId} not in player ${moverId} hand:`, G2.players[moverId]?.hand);
          return INVALID_MOVE;
        }
        const validReceivers = getValidReceivers(G2, moverId);
        if (!validReceivers.includes(receiverId)) {
          console.warn(`[submitTurnMovesAndTile] Receiver ${receiverId} is not a valid receiver:`, validReceivers);
          return INVALID_MOVE;
        }
        const val = validateMoveCombination(moveActions, moverId, G2.boardState, G2.community, G2.numPlayers);
        if (!val.valid) {
          console.warn("[submitTurnMovesAndTile] Move combination validation failed:", val.reason);
          return INVALID_MOVE;
        }
        const backupBoard = JSON.parse(JSON.stringify(G2.boardState));
        const backupCommunity = JSON.parse(JSON.stringify(G2.community));
        moveActions.forEach((m) => applyMoveToState(m, G2.boardState, G2.community));
        const playType = classifyPlay(moveActions, tileId, moverId, backupBoard, backupCommunity, G2.numPlayers);
        G2.players[moverId].hand = G2.players[moverId].hand.filter((t2) => t2 !== tileId);
        G2.nextMoverId = receiverId;
        G2.pendingPlay = {
          moverId,
          receiverId,
          tileIdPlayed: tileId,
          movesMade: moveActions,
          playType,
          backupBoard,
          backupCommunity,
          moverStartCredNotches: G2.players[moverId].credibilityNotchesLost,
          step: "receipt",
          challengesPassed: []
        };
        G2.lastOutcomeNotice = null;
        if (receiverId === moverId) {
          recordPlayerStat(G2, moverId, "tilesPlayedToSelf");
        }
        const movesLog = formatTurnMovesLog(moverId, moveActions);
        if (movesLog) appendGameLog(G2, movesLog, "info");
        appendGameLog(G2, `Player ${moverId} played a tile to Player ${receiverId}.`, "play");
        if (G2.players[receiverId].credibilityNotchesLost >= 3) {
          if (getOrderedChallengers(G2).length === 0) {
            resolvePlayToBank(G2);
            queuePendingSupport(G2, { phase: "campaign", afterResolve: "victoryCheck", tileId });
          } else {
            G2.pendingPlay.step = "challenge";
          }
        }
        events.endTurn();
      },
      acceptTile: ({ G: G2, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "receipt" || G2.pendingPlay.receiverId !== pId) {
          return INVALID_MOVE;
        }
        const eligibleChallengers = getOrderedChallengers(G2);
        const tileId = G2.pendingPlay.tileIdPlayed;
        appendGameLog(G2, `Player ${pId} accepted Player ${G2.pendingPlay.moverId}'s tile.`, "info");
        if (eligibleChallengers.length === 0) {
          resolvePlayToBank(G2);
          queuePendingSupport(G2, { phase: "campaign", afterResolve: "victoryCheck", tileId });
        } else {
          G2.pendingPlay.step = "challenge";
        }
        events.endTurn();
      },
      rejectTile: ({ G: G2, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "receipt" || G2.pendingPlay.receiverId !== pId) {
          return INVALID_MOVE;
        }
        if (G2.pendingPlay.playType === "Honest") {
          return INVALID_MOVE;
        }
        const { moverId, receiverId, tileIdPlayed, playType, backupBoard, backupCommunity } = G2.pendingPlay;
        G2.nextMoverId = receiverId;
        if (playType === "Dishonest" || playType === "Illegal") {
          G2.boardState = backupBoard;
          G2.community = backupCommunity;
          if (G2.players[moverId].credibilityNotchesLost < 3) {
            G2.players[moverId].credibilityNotchesLost++;
          } else {
            G2.players[moverId].pendingPenaltyWithdraw = true;
          }
          G2.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: false });
          G2.pendingPlay.whistleblownByReceiver = true;
          G2.pendingPlay.reexecuteTileId = tileIdPlayed;
          G2.pendingPlay.nextMoverId = receiverId;
          G2.pendingPlay.step = "reexecute";
          G2.lastOutcomeNotice = {
            title: "\u{1F6A8} Whistle Blown! (Play Rejected)",
            type: "reject",
            moverId,
            receiverId,
            tileIdPlayed,
            text: `Player ${receiverId} exposed Player ${moverId}'s dishonest play with Tile ${tileIdPlayed}! Board moves were reset.`
          };
          recordPlayerStat(G2, receiverId, "whistlesBlown");
          appendGameLog(G2, `Whistle Blown! Player ${receiverId} exposed Player ${moverId}.`, "alert");
        } else {
          G2.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
          G2.pendingPlay = null;
          G2.lastOutcomeNotice = {
            title: "\u2705 Play Accepted",
            type: "honest",
            moverId,
            receiverId,
            tileIdPlayed,
            text: `Receiver Player ${receiverId} inspected Player ${moverId}'s play and it was HONEST!`
          };
          applyVictoryCheck(G2, tileIdPlayed);
        }
        events.endTurn();
      },
      challengeTile: {
        client: false,
        move: ({ G: G2, ctx, playerID, events }) => {
          const pId = String(playerID);
          if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "challenge") return INVALID_MOVE;
          if (G2.players[pId].credibilityNotchesLost >= 3) return INVALID_MOVE;
          const eligibleChallengers = getOrderedChallengers(G2);
          const remaining = eligibleChallengers.filter(
            (id) => !G2.pendingPlay.challengesPassed.includes(id)
          );
          if (remaining.length === 0 || remaining[0] !== pId) return INVALID_MOVE;
          const challengerId = pId;
          recordPlayerStat(G2, challengerId, "challengesMade");
          const { moverId, receiverId, tileIdPlayed, playType, backupBoard, backupCommunity, moverStartCredNotches } = G2.pendingPlay;
          G2.nextMoverId = receiverId;
          if (playType === "Dishonest" || playType === "Illegal") {
            G2.boardState = backupBoard;
            G2.community = backupCommunity;
            const isSelfPlay = String(receiverId) === String(moverId);
            const receiverHadNoWhistle = !isSelfPlay && (G2.players[receiverId]?.credibilityNotchesLost || 0) >= 3;
            if (G2.players[moverId].credibilityNotchesLost < 3) {
              G2.players[moverId].credibilityNotchesLost++;
            } else {
              G2.players[moverId].pendingPenaltyWithdraw = true;
            }
            G2.pendingPlay.successfulChallengerId = challengerId;
            if (!isSelfPlay && G2.players[receiverId].credibilityNotchesLost < 3) {
              G2.players[receiverId].credibilityNotchesLost++;
            }
            G2.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: receiverHadNoWhistle });
            G2.pendingPlay.reexecuteTileId = tileIdPlayed;
            G2.pendingPlay.nextMoverId = receiverId;
            G2.pendingPlay.step = "reexecute";
            G2.lastOutcomeNotice = {
              title: "\u{1F525} Challenge Succeeded! (Smoking Gun)",
              type: "challengeSuccess",
              challengerId,
              moverId,
              receiverId,
              tileIdPlayed,
              text: `Challenger Player ${challengerId} exposed Player ${moverId}'s dishonest play! Player ${moverId} lost 1 credibility notch and board moves were reset.`
            };
            appendGameLog(G2, `Smoking Gun! Player ${challengerId} exposed Player ${moverId}.`, "alert");
          } else {
            if (moverStartCredNotches < 3 && G2.players[moverId].credibilityNotchesLost > 0) {
              G2.players[moverId].credibilityNotchesLost--;
            }
            if (G2.players[challengerId].credibilityNotchesLost < 3) {
              G2.players[challengerId].credibilityNotchesLost++;
            }
            G2.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
            G2.pendingPlay = null;
            G2.lastOutcomeNotice = {
              title: "\u274C Challenge Failed! (Witch Hunt)",
              type: "challengeFailed",
              challengerId,
              moverId,
              receiverId,
              tileIdPlayed,
              text: `Player ${challengerId} challenged Player ${moverId}, but the play with Tile ${tileIdPlayed} was HONEST! Player ${challengerId} lost 1 credibility notch.`
            };
            appendGameLog(G2, `Witch Hunt! Player ${challengerId} challenged an honest play.`, "warn");
            if (!queuePendingSupport(G2, { phase: "campaign", afterResolve: "victoryCheck", tileId: tileIdPlayed })) {
              applyVictoryCheck(G2, tileIdPlayed);
            }
          }
          events.endTurn();
        }
      },
      passChallenge: {
        client: false,
        move: ({ G: G2, ctx, playerID, events }) => {
          const pId = String(playerID);
          if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "challenge") return INVALID_MOVE;
          const eligibleChallengers = getOrderedChallengers(G2);
          const remaining = eligibleChallengers.filter(
            (id) => !G2.pendingPlay.challengesPassed.includes(id)
          );
          if (remaining.length === 0 || remaining[0] !== pId) return INVALID_MOVE;
          const tileId = G2.pendingPlay.tileIdPlayed;
          G2.pendingPlay.challengesPassed.push(pId);
          appendGameLog(G2, `Player ${pId} passed on challenging.`, "info");
          if (G2.pendingPlay.challengesPassed.length >= eligibleChallengers.length) {
            resolvePlayToBank(G2);
            queuePendingSupport(G2, { phase: "campaign", afterResolve: "victoryCheck", tileId });
          }
          events.endTurn();
        }
      },
      reexecuteHonestly: ({ G: G2, ctx, playerID, events }, payload) => {
        const moverId = String(playerID);
        if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "reexecute" || G2.pendingPlay.moverId !== moverId) return INVALID_MOVE;
        const moveActions = payload;
        const tileId = G2.pendingPlay.reexecuteTileId;
        const val = validateMoveCombination(moveActions, moverId, G2.boardState, G2.community, G2.numPlayers);
        if (!val.valid) return INVALID_MOVE;
        const playType = classifyPlay(moveActions, tileId, moverId, G2.boardState, G2.community, G2.numPlayers);
        if (playType !== "Honest") return INVALID_MOVE;
        moveActions.forEach((m) => applyMoveToState(m, G2.boardState, G2.community));
        const reexecLog = formatTurnMovesLog(moverId, moveActions);
        appendGameLog(G2, reexecLog || `Player ${moverId} re-executed honestly.`, "info");
        if (G2.players[moverId].pendingPenaltyWithdraw) {
          G2.pendingPlay.step = "penaltyWithdraw";
          queuePendingSupport(G2, { phase: "campaign" });
        } else if (G2.pendingPlay.whistleblownByReceiver) {
          G2.pendingPlay.step = "receiverReward";
          queuePendingSupport(G2, { phase: "campaign" });
        } else if (!queuePendingSupport(G2, { phase: "campaign", afterResolve: "finishPendingPlayOrReward" })) {
          finishPendingPlayOrReward(G2);
        }
        events.endTurn();
      },
      executePenaltyWithdraw: ({ G: G2, ctx, playerID, events }, moveAction) => {
        const moverId = String(playerID);
        if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "penaltyWithdraw" || G2.pendingPlay.moverId !== moverId) return INVALID_MOVE;
        if (moveAction) {
          if (moveAction.type !== MOVE_TYPES.WITHDRAW) return INVALID_MOVE;
          const val = validateSingleMove(moveAction, moverId, G2.boardState, G2.community, G2.numPlayers);
          if (!val.valid) return INVALID_MOVE;
          applyMoveToState(moveAction, G2.boardState, G2.community);
        } else if (isMoveTypePossible(MOVE_TYPES.WITHDRAW, moverId, G2.boardState, G2.community, G2.numPlayers)) {
          return INVALID_MOVE;
        }
        G2.players[moverId].pendingPenaltyWithdraw = false;
        if (G2.pendingPlay.whistleblownByReceiver) {
          G2.pendingPlay.step = "receiverReward";
          queuePendingSupport(G2, { phase: "campaign" });
        } else if (!queuePendingSupport(G2, { phase: "campaign", afterResolve: "finishPendingPlayOrReward" })) {
          finishPendingPlayOrReward(G2);
        }
        events.endTurn();
      },
      claimReceiverCredibilityReward: ({ G: G2, ctx, playerID, events }) => {
        const receiverId = String(playerID);
        if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "receiverReward" || G2.pendingPlay.receiverId !== receiverId) {
          return INVALID_MOVE;
        }
        if (G2.players[receiverId].credibilityNotchesLost > 0) {
          G2.players[receiverId].credibilityNotchesLost = Math.max(0, G2.players[receiverId].credibilityNotchesLost - 2);
        }
        finishPendingPlayOrReward(G2);
        events.endTurn();
      },
      chooseReceiverAdvanceReward: ({ G: G2, ctx, playerID, events }) => {
        const receiverId = String(playerID);
        if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "receiverReward" || G2.pendingPlay.receiverId !== receiverId) {
          return INVALID_MOVE;
        }
        G2.pendingPlay.step = "freeAdvance";
        events.endTurn();
      },
      executeFreeAdvance: ({ G: G2, ctx, playerID, events }, moveAction) => {
        const receiverId = String(playerID);
        if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "freeAdvance" || G2.pendingPlay.receiverId !== receiverId) return INVALID_MOVE;
        if (moveAction) {
          if (moveAction.type !== MOVE_TYPES.ADVANCE) return INVALID_MOVE;
          const val = validateSingleMove(moveAction, receiverId, G2.boardState, G2.community, G2.numPlayers);
          if (!val.valid) return INVALID_MOVE;
          applyMoveToState(moveAction, G2.boardState, G2.community);
        } else if (isMoveTypePossible(MOVE_TYPES.ADVANCE, receiverId, G2.boardState, G2.community, G2.numPlayers)) {
          return INVALID_MOVE;
        }
        if (!queuePendingSupport(G2, { phase: "campaign", afterResolve: "finishPendingPlayOrReward" })) {
          finishPendingPlayOrReward(G2);
        }
        events.endTurn();
      },
      claimChallengerCredibility: ({ G: G2, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "challengerReward" || String(G2.pendingPlay.successfulChallengerId) !== pId) {
          return INVALID_MOVE;
        }
        if (G2.players[pId].credibilityNotchesLost > 0) {
          G2.players[pId].credibilityNotchesLost--;
        }
        const receiverId = G2.pendingPlay.receiverId;
        G2.pendingPlay = null;
        if (receiverId !== void 0 && receiverId !== null) G2.nextMoverId = receiverId;
        events.endTurn();
      },
      buyChallengerBureaucracyAction: ({ G: G2, ctx, playerID, events }, payload) => {
        const pId = String(playerID);
        if (G2.pendingSupport || !G2.pendingPlay || G2.pendingPlay.step !== "challengerReward" || String(G2.pendingPlay.successfulChallengerId) !== pId) {
          return INVALID_MOVE;
        }
        const success = applyChallengerBureaucracyAction(G2, pId, payload);
        if (!success) return INVALID_MOVE;
        const tileId = G2.pendingPlay.reexecuteTileId || G2.pendingPlay.tileIdPlayed;
        if (!queuePendingSupport(G2, { phase: "campaign", afterResolve: "finishChallengerReward", tileId })) {
          const receiverId = G2.pendingPlay.receiverId;
          G2.pendingPlay = null;
          if (receiverId !== void 0 && receiverId !== null) G2.nextMoverId = receiverId;
          applyVictoryCheck(G2, tileId);
        }
        events.endTurn();
      }
    },
    next: "bureaucracy",
    endIf: ({ G: G2 }) => {
      if (!G2 || !G2.players) return false;
      return Object.values(G2.players).every((p2) => p2 && p2.hand && p2.hand.length === 0) && !G2.pendingPlay && !G2.pendingSupport;
    }
  };
}

// src/srcGame.js
function filterSoloPlayerView(G2, playerID) {
  if (!G2 || playerID === null || playerID === void 0) return G2;
  const pId = String(playerID);
  const nextG = JSON.parse(JSON.stringify(G2));
  if (nextG.players) {
    Object.keys(nextG.players).forEach((id) => {
      if (id !== pId) {
        const p2 = nextG.players[id];
        if (Array.isArray(p2.hand)) p2.hand = p2.hand.map(() => "HIDDEN");
        if (Array.isArray(p2.bank)) {
          p2.bank = p2.bank.map((item) => item.faceDown ? { ...item, tileId: "HIDDEN" } : item);
        }
      }
    });
  }
  if (nextG.draftPacks) {
    Object.keys(nextG.draftPacks).forEach((id) => {
      if (id !== pId && Array.isArray(nextG.draftPacks[id])) {
        nextG.draftPacks[id] = nextG.draftPacks[id].map(() => "HIDDEN");
      }
    });
  }
  if (nextG.pendingPlay && (nextG.pendingPlay.step === "receipt" || nextG.pendingPlay.step === "challenge")) {
    const pp = nextG.pendingPlay;
    const isMover = String(pp.moverId) === pId;
    const isInspectingReceiver = pp.step === "receipt" && String(pp.receiverId) === pId && (G2.players?.[pId]?.credibilityNotchesLost || 0) < 3;
    if (!isMover && !isInspectingReceiver) {
      pp.tileIdPlayed = "HIDDEN";
      pp.playType = "HIDDEN";
    }
  }
  return nextG;
}
function createKredGame(numPlayers, skipDraft = false, options = {}) {
  const { hideOpponentHands = false } = options;
  return {
    name: "kred",
    minPlayers: 3,
    maxPlayers: 5,
    setup: ({ ctx, random }, setupData) => {
      const np = numPlayers || ctx.numPlayers || 3;
      const effectiveSkipDraft = Boolean(skipDraft || setupData?.skipDraft || setupData?.mode === "quick");
      console.log("[KredGame Setup] numPlayers:", np, "skipDraft:", effectiveSkipDraft, "ctx.numPlayers:", ctx.numPlayers);
      const config = INITIAL_PIECE_COUNTS[np] || INITIAL_PIECE_COUNTS[3];
      const boardState = {};
      for (let p2 = 0; p2 < np; p2++) {
        const domainKey = `p${p2 + 1}`;
        boardState[`${domainKey}_office`] = null;
        boardState[`${domainKey}_rostrum1`] = null;
        boardState[`${domainKey}_rostrum2`] = null;
        for (let s2 = 1; s2 <= 6; s2++) {
          if (s2 % 2 !== 0) {
            boardState[`${domainKey}_seat${s2}`] = { id: `init_m_${domainKey}_s${s2}`, type: PIECE_TYPES.MARK };
          } else {
            boardState[`${domainKey}_seat${s2}`] = null;
          }
        }
      }
      const commMarksCount = config.MARKS - np * 3;
      const commHeelsCount = config.HEELS;
      const commPawnsCount = config.PAWNS;
      const totalCommSpots = commMarksCount + commHeelsCount + commPawnsCount + 5;
      let cIdx = 1;
      for (let i2 = 0; i2 < commMarksCount; i2++) {
        boardState[`community_${cIdx}`] = { id: `comm_mark_${cIdx}`, type: PIECE_TYPES.MARK };
        cIdx++;
      }
      for (let i2 = 0; i2 < commHeelsCount; i2++) {
        boardState[`community_${cIdx}`] = { id: `comm_heel_${cIdx}`, type: PIECE_TYPES.HEEL };
        cIdx++;
      }
      for (let i2 = 0; i2 < commPawnsCount; i2++) {
        boardState[`community_${cIdx}`] = { id: `comm_pawn_${cIdx}`, type: PIECE_TYPES.PAWN };
        cIdx++;
      }
      for (; cIdx <= totalCommSpots; cIdx++) {
        boardState[`community_${cIdx}`] = null;
      }
      const community = {
        marks: commMarksCount,
        heels: commHeelsCount,
        pawns: commPawnsCount
      };
      const tileIds = Object.keys(TILES).filter((id) => id !== "BLANK" || config.HAS_BLANK);
      const shuffledDeck = random.Shuffle(tileIds);
      const draftPacks = {};
      const players = {};
      for (let p2 = 0; p2 < np; p2++) {
        const pId = String(p2);
        const dealtTiles = shuffledDeck.slice(p2 * config.TILES_PER_PLAYER, (p2 + 1) * config.TILES_PER_PLAYER);
        if (effectiveSkipDraft) {
          draftPacks[pId] = [];
          players[pId] = {
            credibilityNotchesLost: 0,
            hand: dealtTiles,
            bank: [],
            draftSelections: dealtTiles,
            funding: 0,
            pendingPenaltyWithdraw: false
          };
        } else {
          draftPacks[pId] = dealtTiles;
          players[pId] = {
            credibilityNotchesLost: 0,
            hand: [],
            bank: [],
            draftSelections: [],
            funding: 0,
            pendingPenaltyWithdraw: false
          };
        }
      }
      const matchStats = {};
      for (let p2 = 0; p2 < np; p2++) {
        matchStats[String(p2)] = createEmptyPlayerStats();
      }
      return {
        numPlayers: np,
        boardState,
        community,
        players,
        draftPacks,
        draftSelectionsThisRound: {},
        draftSkippedPlayers: {},
        pendingPlay: null,
        pendingSupport: null,
        nextMoverId: null,
        winner: null,
        history: effectiveSkipDraft ? [] : [{ id: 1, text: "DRAFT", tone: "phase" }],
        matchStats
      };
    },
    playerView: ({ G: G2, playerID }) => {
      return hideOpponentHands ? filterSoloPlayerView(G2, playerID) : G2;
    },
    endIf: ({ G: G2 }) => {
      if (G2 && G2.winner) {
        return { winner: G2.winner };
      }
      return void 0;
    },
    phases: {
      draft: createDraftPhase(),
      campaign: createCampaignPhase(),
      bureaucracy: createBureaucracyPhase()
    }
  };
}
var KredGame = createKredGame(3);

// node_modules/nanoid/non-secure/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var nanoid = (size = 21) => {
  let id = "";
  let i2 = size | 0;
  while (i2-- > 0) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};

// node_modules/flatted/esm/index.js
var { parse: $parse, stringify: $stringify } = JSON;
var { keys } = Object;
var Primitive = String;
var primitive = "string";
var ignore = {};
var object = "object";
var noop = (_2, value2) => value2;
var primitives = (value2) => value2 instanceof Primitive ? Primitive(value2) : value2;
var Primitives = (_2, value2) => typeof value2 === primitive ? new Primitive(value2) : value2;
var resolver = (input, lazy, parsed, $) => (output) => {
  for (let ke = keys(output), { length } = ke, y2 = 0; y2 < length; y2++) {
    const k2 = ke[y2];
    const value2 = output[k2];
    if (value2 instanceof Primitive) {
      const tmp = input[+value2];
      if (typeof tmp === object && !parsed.has(tmp)) {
        parsed.add(tmp);
        output[k2] = ignore;
        lazy.push({ o: output, k: k2, r: tmp });
      } else
        output[k2] = $.call(output, k2, tmp);
    } else if (output[k2] !== ignore)
      output[k2] = $.call(output, k2, value2);
  }
  return output;
};
var set = (known, input, value2) => {
  const index = Primitive(input.push(value2) - 1);
  known.set(value2, index);
  return index;
};
var parse3 = (text2, reviver) => {
  const input = $parse(text2, Primitives).map(primitives);
  const $ = reviver || noop;
  let value2 = input[0];
  if (typeof value2 === object && value2) {
    const lazy = [];
    const revive = resolver(input, lazy, /* @__PURE__ */ new Set(), $);
    value2 = revive(value2);
    let i2 = 0;
    while (i2 < lazy.length) {
      const { o: o2, k: k2, r: r2 } = lazy[i2++];
      o2[k2] = $.call(o2, k2, revive(r2));
    }
  }
  return $.call({ "": value2 }, "", value2);
};
var stringify = (value2, replacer, space2) => {
  const $ = replacer && typeof replacer === object ? (k2, v2) => k2 === "" || -1 < replacer.indexOf(k2) ? v2 : void 0 : replacer || noop;
  const known = /* @__PURE__ */ new Map();
  const input = [];
  const output = [];
  let i2 = +set(known, input, $.call({ "": value2 }, "", value2));
  let firstRun = !i2;
  while (i2 < input.length) {
    firstRun = true;
    output[i2] = $stringify(input[i2++], replace, space2);
  }
  return "[" + output.join(",") + "]";
  function replace(key, value3) {
    if (firstRun) {
      firstRun = !firstRun;
      return value3;
    }
    const after = $.call(this, key, value3);
    switch (typeof after) {
      case object:
        if (after === null) return after;
      case primitive:
        return known.get(after) || set(known, input, after);
    }
    return after;
  }
};

// node_modules/boardgame.io/dist/esm/ai-7998b00f.js
var import_setimmediate = __toESM(require_setImmediate());
var Bot = class {
  constructor({ enumerate, seed }) {
    this.enumerateFn = enumerate;
    this.seed = seed;
    this.iterationCounter = 0;
    this._opts = {};
  }
  addOpt({ key, range, initial }) {
    this._opts[key] = {
      range,
      value: initial
    };
  }
  getOpt(key) {
    return this._opts[key].value;
  }
  setOpt(key, value2) {
    if (key in this._opts) {
      this._opts[key].value = value2;
    }
  }
  opts() {
    return this._opts;
  }
  enumerate(G2, ctx, playerID) {
    const actions = this.enumerateFn(G2, ctx, playerID);
    return actions.map((a2) => {
      if ("payload" in a2) {
        return a2;
      }
      if ("move" in a2) {
        return makeMove(a2.move, a2.args, playerID);
      }
      if ("event" in a2) {
        return gameEvent(a2.event, a2.args, playerID);
      }
    });
  }
  random(arg) {
    let number;
    if (this.seed !== void 0) {
      const seed = this.prngstate ? "" : this.seed;
      const rand = alea(seed, this.prngstate);
      number = rand();
      this.prngstate = rand.state();
    } else {
      number = Math.random();
    }
    if (arg) {
      if (Array.isArray(arg)) {
        const id = Math.floor(number * arg.length);
        return arg[id];
      } else {
        return Math.floor(number * arg);
      }
    }
    return number;
  }
};
var CHUNK_SIZE = 25;
var MCTSBot = class extends Bot {
  constructor({ enumerate, seed, objectives, game, iterations, playoutDepth, iterationCallback }) {
    super({ enumerate, seed });
    if (objectives === void 0) {
      objectives = () => ({});
    }
    this.objectives = objectives;
    this.iterationCallback = iterationCallback || (() => {
    });
    this.reducer = CreateGameReducer({ game });
    this.iterations = iterations;
    this.playoutDepth = playoutDepth;
    this.addOpt({
      key: "async",
      initial: false
    });
    this.addOpt({
      key: "iterations",
      initial: typeof iterations === "number" ? iterations : 1e3,
      range: { min: 1, max: 2e3 }
    });
    this.addOpt({
      key: "playoutDepth",
      initial: typeof playoutDepth === "number" ? playoutDepth : 50,
      range: { min: 1, max: 100 }
    });
  }
  createNode({ state, parentAction, parent, playerID }) {
    const { G: G2, ctx } = state;
    let actions = [];
    let objectives = [];
    if (playerID !== void 0) {
      actions = this.enumerate(G2, ctx, playerID);
      objectives = this.objectives(G2, ctx, playerID);
    } else if (ctx.activePlayers) {
      for (const playerID2 in ctx.activePlayers) {
        actions.push(...this.enumerate(G2, ctx, playerID2));
        objectives.push(this.objectives(G2, ctx, playerID2));
      }
    } else {
      actions = this.enumerate(G2, ctx, ctx.currentPlayer);
      objectives = this.objectives(G2, ctx, ctx.currentPlayer);
    }
    return {
      state,
      parent,
      parentAction,
      actions,
      objectives,
      children: [],
      visits: 0,
      value: 0
    };
  }
  select(node) {
    if (node.actions.length > 0) {
      return node;
    }
    if (node.children.length === 0) {
      return node;
    }
    let selectedChild = null;
    let best = 0;
    for (const child of node.children) {
      const childVisits = child.visits + Number.EPSILON;
      const uct = child.value / childVisits + Math.sqrt(2 * Math.log(node.visits) / childVisits);
      if (selectedChild == null || uct > best) {
        best = uct;
        selectedChild = child;
      }
    }
    return this.select(selectedChild);
  }
  expand(node) {
    const actions = node.actions;
    if (actions.length === 0 || node.state.ctx.gameover !== void 0) {
      return node;
    }
    const id = this.random(actions.length);
    const action = actions[id];
    node.actions.splice(id, 1);
    const childState = this.reducer(node.state, action);
    const childNode = this.createNode({
      state: childState,
      parentAction: action,
      parent: node
    });
    node.children.push(childNode);
    return childNode;
  }
  playout({ state }) {
    let playoutDepth = this.getOpt("playoutDepth");
    if (typeof this.playoutDepth === "function") {
      playoutDepth = this.playoutDepth(state.G, state.ctx);
    }
    for (let i2 = 0; i2 < playoutDepth && state.ctx.gameover === void 0; i2++) {
      const { G: G2, ctx } = state;
      let playerID = ctx.currentPlayer;
      if (ctx.activePlayers) {
        playerID = Object.keys(ctx.activePlayers)[0];
      }
      const moves = this.enumerate(G2, ctx, playerID);
      const objectives = this.objectives(G2, ctx, playerID);
      const score = Object.keys(objectives).reduce((score2, key) => {
        const objective = objectives[key];
        if (objective.checker(G2, ctx)) {
          return score2 + objective.weight;
        }
        return score2;
      }, 0);
      if (score > 0) {
        return { score };
      }
      if (!moves || moves.length === 0) {
        return void 0;
      }
      const id = this.random(moves.length);
      const childState = this.reducer(state, moves[id]);
      state = childState;
    }
    return state.ctx.gameover;
  }
  backpropagate(node, result = {}) {
    node.visits++;
    if (result.score !== void 0) {
      node.value += result.score;
    }
    if (result.draw === true) {
      node.value += 0.5;
    }
    if (node.parentAction && result.winner === node.parentAction.payload.playerID) {
      node.value++;
    }
    if (node.parent) {
      this.backpropagate(node.parent, result);
    }
  }
  play(state, playerID) {
    const root = this.createNode({ state, playerID });
    let numIterations = this.getOpt("iterations");
    if (typeof this.iterations === "function") {
      numIterations = this.iterations(state.G, state.ctx);
    }
    const getResult = () => {
      let selectedChild = null;
      for (const child of root.children) {
        if (selectedChild == null || child.visits > selectedChild.visits) {
          selectedChild = child;
        }
      }
      const action = selectedChild && selectedChild.parentAction;
      const metadata = root;
      return { action, metadata };
    };
    return new Promise((resolve) => {
      const iteration = () => {
        for (let i2 = 0; i2 < CHUNK_SIZE && this.iterationCounter < numIterations; i2++) {
          const leaf = this.select(root);
          const child = this.expand(leaf);
          const result = this.playout(child);
          this.backpropagate(child, result);
          this.iterationCounter++;
        }
        this.iterationCallback({
          iterationCounter: this.iterationCounter,
          numIterations,
          metadata: root
        });
      };
      this.iterationCounter = 0;
      if (this.getOpt("async")) {
        const asyncIteration = () => {
          if (this.iterationCounter < numIterations) {
            iteration();
            setImmediate(asyncIteration);
          } else {
            resolve(getResult());
          }
        };
        asyncIteration();
      } else {
        while (this.iterationCounter < numIterations) {
          iteration();
        }
        resolve(getResult());
      }
    });
  }
};
var RandomBot = class extends Bot {
  play({ G: G2, ctx }, playerID) {
    const moves = this.enumerate(G2, ctx, playerID);
    return Promise.resolve({ action: this.random(moves) });
  }
};
async function Step(client, bot) {
  const state = client.store.getState();
  let playerID = state.ctx.currentPlayer;
  if (state.ctx.activePlayers) {
    playerID = Object.keys(state.ctx.activePlayers)[0];
  }
  const { action, metadata } = await bot.play(state, playerID);
  if (action) {
    const a2 = {
      ...action,
      payload: {
        ...action.payload,
        metadata
      }
    };
    client.store.dispatch(a2);
    return a2;
  }
}

// node_modules/boardgame.io/dist/esm/Debug-8242c26e.js
function noop2() {
}
var identity = (x2) => x2;
function assign(tar, src) {
  for (const k2 in src)
    tar[k2] = src[k2];
  return tar;
}
function run(fn2) {
  return fn2();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a2, b2) {
  return a2 != a2 ? b2 == b2 : a2 !== b2 || (a2 && typeof a2 === "object" || typeof a2 === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop2;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn2) {
  if (definition) {
    const slot_ctx = get_slot_context(definition, ctx, $$scope, fn2);
    return definition[0](slot_ctx);
  }
}
function get_slot_context(definition, ctx, $$scope, fn2) {
  return definition[1] && fn2 ? assign($$scope.ctx.slice(), definition[1](fn2(ctx))) : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn2) {
  if (definition[2] && fn2) {
    const lets = definition[2](fn2(dirty));
    if ($$scope.dirty === void 0) {
      return lets;
    }
    if (typeof lets === "object") {
      const merged = [];
      const len = Math.max($$scope.dirty.length, lets.length);
      for (let i2 = 0; i2 < len; i2 += 1) {
        merged[i2] = $$scope.dirty[i2] | lets[i2];
      }
      return merged;
    }
    return $$scope.dirty | lets;
  }
  return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
  if (slot_changes) {
    const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
    slot.p(slot_context, slot_changes);
  }
}
function get_all_dirty_from_scope($$scope) {
  if ($$scope.ctx.length > 32) {
    const dirty = [];
    const length = $$scope.ctx.length / 32;
    for (let i2 = 0; i2 < length; i2++) {
      dirty[i2] = -1;
    }
    return dirty;
  }
  return -1;
}
function exclude_internal_props(props) {
  const result = {};
  for (const k2 in props)
    if (k2[0] !== "$")
      result[k2] = props[k2];
  return result;
}
function null_to_empty(value2) {
  return value2 == null ? "" : value2;
}
var is_client = typeof window !== "undefined";
var now = is_client ? () => window.performance.now() : () => Date.now();
var raf = is_client ? (cb) => requestAnimationFrame(cb) : noop2;
var tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
function append(target, node) {
  target.appendChild(node);
}
function append_styles(target, style_sheet_id, styles) {
  const append_styles_to = get_root_for_style(target);
  if (!append_styles_to.getElementById(style_sheet_id)) {
    const style = element("style");
    style.id = style_sheet_id;
    style.textContent = styles;
    append_stylesheet(append_styles_to, style);
  }
}
function get_root_for_style(node) {
  if (!node)
    return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && root.host) {
    return root;
  }
  return node.ownerDocument;
}
function append_empty_stylesheet(node) {
  const style_element = element("style");
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element.sheet;
}
function append_stylesheet(node, style) {
  append(node.head || node, style);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
  for (let i2 = 0; i2 < iterations.length; i2 += 1) {
    if (iterations[i2])
      iterations[i2].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty2() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function stop_propagation(fn2) {
  return function(event) {
    event.stopPropagation();
    return fn2.call(this, event);
  };
}
function attr(node, attribute, value2) {
  if (value2 == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value2)
    node.setAttribute(attribute, value2);
}
function to_number(value2) {
  return value2 === "" ? null : +value2;
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
function set_input_value(input, value2) {
  input.value = value2 == null ? "" : value2;
}
function select_option(select, value2) {
  for (let i2 = 0; i2 < select.options.length; i2 += 1) {
    const option = select.options[i2];
    if (option.__value === value2) {
      option.selected = true;
      return;
    }
  }
  select.selectedIndex = -1;
}
function select_value(select) {
  const selected_option = select.querySelector(":checked") || select.options[0];
  return selected_option && selected_option.__value;
}
function toggle_class(element2, name, toggle) {
  element2.classList[toggle ? "add" : "remove"](name);
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, cancelable, detail);
  return e;
}
var managed_styles = /* @__PURE__ */ new Map();
var active = 0;
function hash(str) {
  let hash2 = 5381;
  let i2 = str.length;
  while (i2--)
    hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i2);
  return hash2 >>> 0;
}
function create_style_information(doc, node) {
  const info2 = { stylesheet: append_empty_stylesheet(node), rules: {} };
  managed_styles.set(doc, info2);
  return info2;
}
function create_rule(node, a2, b2, duration, delay, ease, fn2, uid = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p2 = 0; p2 <= 1; p2 += step) {
    const t2 = a2 + (b2 - a2) * ease(p2);
    keyframes += p2 * 100 + `%{${fn2(t2, 1 - t2)}}
`;
  }
  const rule = keyframes + `100% {${fn2(b2, 1 - b2)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = get_root_for_style(node);
  const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
  if (!rules[name]) {
    rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(
    name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1
    // remove all Svelte animations
  );
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active -= deleted;
    if (!active)
      clear_rules();
  }
}
function clear_rules() {
  raf(() => {
    if (active)
      return;
    managed_styles.forEach((info2) => {
      const { stylesheet } = info2;
      let i2 = stylesheet.cssRules.length;
      while (i2--)
        stylesheet.deleteRule(i2);
      info2.rules = {};
    });
    managed_styles.clear();
  });
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function afterUpdate(fn2) {
  get_current_component().$$.after_update.push(fn2);
}
function onDestroy(fn2) {
  get_current_component().$$.on_destroy.push(fn2);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail, { cancelable = false } = {}) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail, { cancelable });
      callbacks.slice().forEach((fn2) => {
        fn2.call(component, event);
      });
      return !event.defaultPrevented;
    }
    return true;
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
  return context;
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
function bubble(component, event) {
  const callbacks = component.$$.callbacks[event.type];
  if (callbacks) {
    callbacks.slice().forEach((fn2) => fn2.call(this, event));
  }
}
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn2) {
  render_callbacks.push(fn2);
}
var seen_callbacks = /* @__PURE__ */ new Set();
var flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update2(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i2 = 0; i2 < render_callbacks.length; i2 += 1) {
      const callback = render_callbacks[i2];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update2($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
var promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
var outroing = /* @__PURE__ */ new Set();
var outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
    // parent group
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
var null_transition = { duration: 0 };
function create_in_transition(node, fn2, params) {
  let config = fn2(node, params);
  let running = false;
  let animation_name;
  let task;
  let uid = 0;
  function cleanup() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick = noop2, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
    tick(0, 1);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    if (task)
      task.abort();
    running = true;
    add_render_callback(() => dispatch(node, true, "start"));
    task = loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(1, 0);
          dispatch(node, true, "end");
          cleanup();
          return running = false;
        }
        if (now2 >= start_time) {
          const t2 = easing((now2 - start_time) / duration);
          tick(t2, 1 - t2);
        }
      }
      return running;
    });
  }
  let started = false;
  return {
    start() {
      if (started)
        return;
      started = true;
      delete_rule(node);
      if (is_function(config)) {
        config = config();
        wait().then(go);
      } else {
        go();
      }
    },
    invalidate() {
      started = false;
    },
    end() {
      if (running) {
        cleanup();
        running = false;
      }
    }
  };
}
function create_out_transition(node, fn2, params) {
  let config = fn2(node, params);
  let running = true;
  let animation_name;
  const group = outros;
  group.r += 1;
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick = noop2, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    add_render_callback(() => dispatch(node, false, "start"));
    loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(0, 1);
          dispatch(node, false, "end");
          if (!--group.r) {
            run_all(group.c);
          }
          return false;
        }
        if (now2 >= start_time) {
          const t2 = easing((now2 - start_time) / duration);
          tick(1 - t2, t2);
        }
      }
      return running;
    });
  }
  if (is_function(config)) {
    wait().then(() => {
      config = config();
      go();
    });
  } else {
    go();
  }
  return {
    end(reset2) {
      if (reset2 && config.tick) {
        config.tick(1, 0);
      }
      if (running) {
        if (animation_name)
          delete_rule(node, animation_name);
        running = false;
      }
    }
  };
}
function create_bidirectional_transition(node, fn2, params, intro) {
  let config = fn2(node, params);
  let t2 = intro ? 0 : 1;
  let running_program = null;
  let pending_program = null;
  let animation_name = null;
  function clear_animation() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function init2(program, duration) {
    const d2 = program.b - t2;
    duration *= Math.abs(d2);
    return {
      a: t2,
      b: program.b,
      d: d2,
      duration,
      start: program.start,
      end: program.start + duration,
      group: program.group
    };
  }
  function go(b2) {
    const { delay = 0, duration = 300, easing = identity, tick = noop2, css } = config || null_transition;
    const program = {
      start: now() + delay,
      b: b2
    };
    if (!b2) {
      program.group = outros;
      outros.r += 1;
    }
    if (running_program || pending_program) {
      pending_program = program;
    } else {
      if (css) {
        clear_animation();
        animation_name = create_rule(node, t2, b2, duration, delay, easing, css);
      }
      if (b2)
        tick(0, 1);
      running_program = init2(program, duration);
      add_render_callback(() => dispatch(node, b2, "start"));
      loop((now2) => {
        if (pending_program && now2 > pending_program.start) {
          running_program = init2(pending_program, duration);
          pending_program = null;
          dispatch(node, running_program.b, "start");
          if (css) {
            clear_animation();
            animation_name = create_rule(node, t2, running_program.b, running_program.duration, 0, easing, config.css);
          }
        }
        if (running_program) {
          if (now2 >= running_program.end) {
            tick(t2 = running_program.b, 1 - t2);
            dispatch(node, running_program.b, "end");
            if (!pending_program) {
              if (running_program.b) {
                clear_animation();
              } else {
                if (!--running_program.group.r)
                  run_all(running_program.group.c);
              }
            }
            running_program = null;
          } else if (now2 >= running_program.start) {
            const p2 = now2 - running_program.start;
            t2 = running_program.a + running_program.d * easing(p2 / running_program.duration);
            tick(t2, 1 - t2);
          }
        }
        return !!(running_program || pending_program);
      });
    }
  }
  return {
    run(b2) {
      if (is_function(config)) {
        wait().then(() => {
          config = config();
          go(b2);
        });
      } else {
        go(b2);
      }
    },
    end() {
      clear_animation();
      running_program = pending_program = null;
    }
  };
}
function get_spread_update(levels, updates) {
  const update3 = {};
  const to_null_out = {};
  const accounted_for = { $$scope: 1 };
  let i2 = levels.length;
  while (i2--) {
    const o2 = levels[i2];
    const n2 = updates[i2];
    if (n2) {
      for (const key in o2) {
        if (!(key in n2))
          to_null_out[key] = 1;
      }
      for (const key in n2) {
        if (!accounted_for[key]) {
          update3[key] = n2[key];
          accounted_for[key] = 1;
        }
      }
      levels[i2] = n2;
    } else {
      for (const key in o2) {
        accounted_for[key] = 1;
      }
    }
  }
  for (const key in to_null_out) {
    if (!(key in update3))
      update3[key] = void 0;
  }
  return update3;
}
function get_spread_object(spread_props) {
  return typeof spread_props === "object" && spread_props !== null ? spread_props : {};
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, on_mount, on_destroy, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i2) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i2 / 31 | 0] |= 1 << i2 % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles2, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    // state
    props,
    update: noop2,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles2 && append_styles2($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i2, ret, ...rest) => {
    const value2 = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i2], $$.ctx[i2] = value2)) {
      if (!$$.skip_bound && $$.bound[i2])
        $$.bound[i2](value2);
      if (ready)
        make_dirty(component, i2);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
var SvelteComponent = class {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop2;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
};
var subscriber_queue = [];
function writable(value2, start = noop2) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set2(new_value) {
    if (safe_not_equal(value2, new_value)) {
      value2 = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value2);
        }
        if (run_queue) {
          for (let i2 = 0; i2 < subscriber_queue.length; i2 += 2) {
            subscriber_queue[i2][0](subscriber_queue[i2 + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update3(fn2) {
    set2(fn2(value2));
  }
  function subscribe2(run2, invalidate = noop2) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set2) || noop2;
    }
    run2(value2);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set: set2, update: update3, subscribe: subscribe2 };
}
function cubicOut(t2) {
  const f2 = t2 - 1;
  return f2 * f2 * f2 + 1;
}
function __rest(s2, e) {
  var t2 = {};
  for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2) && e.indexOf(p2) < 0)
    t2[p2] = s2[p2];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p2 = Object.getOwnPropertySymbols(s2); i2 < p2.length; i2++) {
      if (e.indexOf(p2[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p2[i2]))
        t2[p2[i2]] = s2[p2[i2]];
    }
  return t2;
}
function fly(node, { delay = 0, duration = 400, easing = cubicOut, x: x2 = 0, y: y2 = 0, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (t2, u2) => `
			transform: ${transform} translate(${(1 - t2) * x2}px, ${(1 - t2) * y2}px);
			opacity: ${target_opacity - od * u2}`
  };
}
function crossfade(_a) {
  var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
  const to_receive = /* @__PURE__ */ new Map();
  const to_send = /* @__PURE__ */ new Map();
  function crossfade2(from, node, params) {
    const { delay = 0, duration = (d3) => Math.sqrt(d3) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
    const to = node.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const dw = from.width / to.width;
    const dh = from.height / to.height;
    const d2 = Math.sqrt(dx * dx + dy * dy);
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;
    const opacity = +style.opacity;
    return {
      delay,
      duration: is_function(duration) ? duration(d2) : duration,
      easing,
      css: (t2, u2) => `
				opacity: ${t2 * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u2 * dx}px,${u2 * dy}px) scale(${t2 + (1 - t2) * dw}, ${t2 + (1 - t2) * dh});
			`
    };
  }
  function transition(items, counterparts, intro) {
    return (node, params) => {
      items.set(params.key, {
        rect: node.getBoundingClientRect()
      });
      return () => {
        if (counterparts.has(params.key)) {
          const { rect } = counterparts.get(params.key);
          counterparts.delete(params.key);
          return crossfade2(rect, node, params);
        }
        items.delete(params.key);
        return fallback && fallback(node, params, intro);
      };
    };
  }
  return [
    transition(to_send, to_receive, false),
    transition(to_receive, to_send, true)
  ];
}
function add_css(target) {
  append_styles(target, "svelte-c8tyih", "svg.svelte-c8tyih{stroke:currentColor;fill:currentColor;stroke-width:0;width:100%;height:auto;max-height:100%}");
}
function create_if_block(ctx) {
  let title_1;
  let t2;
  return {
    c() {
      title_1 = svg_element("title");
      t2 = text(
        /*title*/
        ctx[0]
      );
    },
    m(target, anchor) {
      insert(target, title_1, anchor);
      append(title_1, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*title*/
      1) set_data(
        t2,
        /*title*/
        ctx2[0]
      );
    },
    d(detaching) {
      if (detaching) detach(title_1);
    }
  };
}
function create_fragment(ctx) {
  let svg;
  let if_block_anchor;
  let current;
  let if_block = (
    /*title*/
    ctx[0] && create_if_block(ctx)
  );
  const default_slot_template = (
    /*#slots*/
    ctx[3].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[2],
    null
  );
  return {
    c() {
      svg = svg_element("svg");
      if (if_block) if_block.c();
      if_block_anchor = empty2();
      if (default_slot) default_slot.c();
      attr(svg, "xmlns", "http://www.w3.org/2000/svg");
      attr(
        svg,
        "viewBox",
        /*viewBox*/
        ctx[1]
      );
      attr(svg, "class", "svelte-c8tyih");
    },
    m(target, anchor) {
      insert(target, svg, anchor);
      if (if_block) if_block.m(svg, null);
      append(svg, if_block_anchor);
      if (default_slot) {
        default_slot.m(svg, null);
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (
        /*title*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(svg, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & /*$$scope*/
        4)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[2],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[2]
            ) : get_slot_changes(
              default_slot_template,
              /*$$scope*/
              ctx2[2],
              dirty,
              null
            ),
            null
          );
        }
      }
      if (!current || dirty & /*viewBox*/
      2) {
        attr(
          svg,
          "viewBox",
          /*viewBox*/
          ctx2[1]
        );
      }
    },
    i(local) {
      if (current) return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(svg);
      if (if_block) if_block.d();
      if (default_slot) default_slot.d(detaching);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  let { title = null } = $$props;
  let { viewBox } = $$props;
  $$self.$$set = ($$props2) => {
    if ("title" in $$props2) $$invalidate(0, title = $$props2.title);
    if ("viewBox" in $$props2) $$invalidate(1, viewBox = $$props2.viewBox);
    if ("$$scope" in $$props2) $$invalidate(2, $$scope = $$props2.$$scope);
  };
  return [title, viewBox, $$scope, slots];
}
var IconBase = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { title: 0, viewBox: 1 }, add_css);
  }
};
function create_default_slot(ctx) {
  let path;
  return {
    c() {
      path = svg_element("path");
      attr(path, "d", "M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z");
    },
    m(target, anchor) {
      insert(target, path, anchor);
    },
    p: noop2,
    d(detaching) {
      if (detaching) detach(path);
    }
  };
}
function create_fragment$1(ctx) {
  let iconbase;
  let current;
  const iconbase_spread_levels = [
    { viewBox: "0 0 320 512" },
    /*$$props*/
    ctx[0]
  ];
  let iconbase_props = {
    $$slots: { default: [create_default_slot] },
    $$scope: { ctx }
  };
  for (let i2 = 0; i2 < iconbase_spread_levels.length; i2 += 1) {
    iconbase_props = assign(iconbase_props, iconbase_spread_levels[i2]);
  }
  iconbase = new IconBase({ props: iconbase_props });
  return {
    c() {
      create_component(iconbase.$$.fragment);
    },
    m(target, anchor) {
      mount_component(iconbase, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const iconbase_changes = dirty & /*$$props*/
      1 ? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(
        /*$$props*/
        ctx2[0]
      )]) : {};
      if (dirty & /*$$scope*/
      2) {
        iconbase_changes.$$scope = { dirty, ctx: ctx2 };
      }
      iconbase.$set(iconbase_changes);
    },
    i(local) {
      if (current) return;
      transition_in(iconbase.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbase.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(iconbase, detaching);
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  $$self.$$set = ($$new_props) => {
    $$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
  };
  $$props = exclude_internal_props($$props);
  return [$$props];
}
var FaChevronRight = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  }
};
function add_css$1(target) {
  append_styles(target, "svelte-1xg9v5h", ".menu.svelte-1xg9v5h{display:flex;margin-top:43px;flex-direction:row-reverse;border:1px solid #ccc;border-radius:5px 5px 0 0;height:25px;line-height:25px;margin-right:-500px;transform-origin:bottom right;transform:rotate(-90deg) translate(0, -500px)}.menu-item.svelte-1xg9v5h{line-height:25px;cursor:pointer;border:0;background:#fefefe;color:#555;padding-left:15px;padding-right:15px;text-align:center}.menu-item.svelte-1xg9v5h:first-child{border-radius:0 5px 0 0}.menu-item.svelte-1xg9v5h:last-child{border-radius:5px 0 0 0}.menu-item.active.svelte-1xg9v5h{cursor:default;font-weight:bold;background:#ddd;color:#555}.menu-item.svelte-1xg9v5h:hover,.menu-item.svelte-1xg9v5h:focus{background:#eee;color:#555}");
}
function get_each_context(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i2][0];
  child_ctx[5] = list[i2][1].label;
  return child_ctx;
}
function create_each_block(ctx) {
  let button;
  let t0_value = (
    /*label*/
    ctx[5] + ""
  );
  let t0;
  let t1;
  let mounted;
  let dispose;
  function click_handler() {
    return (
      /*click_handler*/
      ctx[3](
        /*key*/
        ctx[4]
      )
    );
  }
  return {
    c() {
      button = element("button");
      t0 = text(t0_value);
      t1 = space();
      attr(button, "class", "menu-item svelte-1xg9v5h");
      toggle_class(
        button,
        "active",
        /*pane*/
        ctx[0] == /*key*/
        ctx[4]
      );
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t0);
      append(button, t1);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*panes*/
      2 && t0_value !== (t0_value = /*label*/
      ctx[5] + "")) set_data(t0, t0_value);
      if (dirty & /*pane, Object, panes*/
      3) {
        toggle_class(
          button,
          "active",
          /*pane*/
          ctx[0] == /*key*/
          ctx[4]
        );
      }
    },
    d(detaching) {
      if (detaching) detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$2(ctx) {
  let nav;
  let each_value = Object.entries(
    /*panes*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block(get_each_context(ctx, each_value, i2));
  }
  return {
    c() {
      nav = element("nav");
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      attr(nav, "class", "menu svelte-1xg9v5h");
    },
    m(target, anchor) {
      insert(target, nav, anchor);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(nav, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*pane, Object, panes, dispatch*/
      7) {
        each_value = Object.entries(
          /*panes*/
          ctx2[1]
        );
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
          } else {
            each_blocks[i2] = create_each_block(child_ctx);
            each_blocks[i2].c();
            each_blocks[i2].m(nav, null);
          }
        }
        for (; i2 < each_blocks.length; i2 += 1) {
          each_blocks[i2].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(nav);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let { pane } = $$props;
  let { panes } = $$props;
  const dispatch2 = createEventDispatcher();
  const click_handler = (key) => dispatch2("change", key);
  $$self.$$set = ($$props2) => {
    if ("pane" in $$props2) $$invalidate(0, pane = $$props2.pane);
    if ("panes" in $$props2) $$invalidate(1, panes = $$props2.panes);
  };
  return [pane, panes, dispatch2, click_handler];
}
var Menu = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { pane: 0, panes: 1 }, add_css$1);
  }
};
var contextKey = {};
function add_css$2(target) {
  append_styles(target, "svelte-1vyml86", ".container.svelte-1vyml86{display:inline-block;cursor:pointer;transform:translate(calc(0px - var(--li-identation)), -50%);position:absolute;top:50%;padding-right:100%}.arrow.svelte-1vyml86{transform-origin:25% 50%;position:relative;line-height:1.1em;font-size:0.75em;margin-left:0;transition:150ms;color:var(--arrow-sign);user-select:none;font-family:'Courier New', Courier, monospace}.expanded.svelte-1vyml86{transform:rotateZ(90deg) translateX(-3px)}");
}
function create_fragment$3(ctx) {
  let div1;
  let div0;
  let mounted;
  let dispose;
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      div0.textContent = `${"\u25B6"}`;
      attr(div0, "class", "arrow svelte-1vyml86");
      toggle_class(
        div0,
        "expanded",
        /*expanded*/
        ctx[0]
      );
      attr(div1, "class", "container svelte-1vyml86");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      if (!mounted) {
        dispose = listen(
          div1,
          "click",
          /*click_handler*/
          ctx[1]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*expanded*/
      1) {
        toggle_class(
          div0,
          "expanded",
          /*expanded*/
          ctx2[0]
        );
      }
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(div1);
      mounted = false;
      dispose();
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let { expanded } = $$props;
  function click_handler(event) {
    bubble.call(this, $$self, event);
  }
  $$self.$$set = ($$props2) => {
    if ("expanded" in $$props2) $$invalidate(0, expanded = $$props2.expanded);
  };
  return [expanded, click_handler];
}
var JSONArrow = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, { expanded: 0 }, add_css$2);
  }
};
function add_css$3(target) {
  append_styles(target, "svelte-1vlbacg", "label.svelte-1vlbacg{display:inline-block;color:var(--label-color);padding:0}.spaced.svelte-1vlbacg{padding-right:var(--li-colon-space)}");
}
function create_if_block$1(ctx) {
  let label;
  let span;
  let t0;
  let t1;
  let mounted;
  let dispose;
  return {
    c() {
      label = element("label");
      span = element("span");
      t0 = text(
        /*key*/
        ctx[0]
      );
      t1 = text(
        /*colon*/
        ctx[2]
      );
      attr(label, "class", "svelte-1vlbacg");
      toggle_class(
        label,
        "spaced",
        /*isParentExpanded*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, label, anchor);
      append(label, span);
      append(span, t0);
      append(span, t1);
      if (!mounted) {
        dispose = listen(
          label,
          "click",
          /*click_handler*/
          ctx[5]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*key*/
      1) set_data(
        t0,
        /*key*/
        ctx2[0]
      );
      if (dirty & /*colon*/
      4) set_data(
        t1,
        /*colon*/
        ctx2[2]
      );
      if (dirty & /*isParentExpanded*/
      2) {
        toggle_class(
          label,
          "spaced",
          /*isParentExpanded*/
          ctx2[1]
        );
      }
    },
    d(detaching) {
      if (detaching) detach(label);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$4(ctx) {
  let if_block_anchor;
  let if_block = (
    /*showKey*/
    ctx[3] && /*key*/
    ctx[0] && create_if_block$1(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty2();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (
        /*showKey*/
        ctx2[3] && /*key*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$1(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (if_block) if_block.d(detaching);
      if (detaching) detach(if_block_anchor);
    }
  };
}
function instance$4($$self, $$props, $$invalidate) {
  let showKey;
  let { key, isParentExpanded, isParentArray = false, colon = ":" } = $$props;
  function click_handler(event) {
    bubble.call(this, $$self, event);
  }
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(0, key = $$props2.key);
    if ("isParentExpanded" in $$props2) $$invalidate(1, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(4, isParentArray = $$props2.isParentArray);
    if ("colon" in $$props2) $$invalidate(2, colon = $$props2.colon);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*isParentExpanded, isParentArray, key*/
    19) {
      $$invalidate(3, showKey = isParentExpanded || !isParentArray || key != +key);
    }
  };
  return [key, isParentExpanded, colon, showKey, isParentArray, click_handler];
}
var JSONKey = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$4,
      create_fragment$4,
      safe_not_equal,
      {
        key: 0,
        isParentExpanded: 1,
        isParentArray: 4,
        colon: 2
      },
      add_css$3
    );
  }
};
function add_css$4(target) {
  append_styles(target, "svelte-rwxv37", "label.svelte-rwxv37{display:inline-block}.indent.svelte-rwxv37{padding-left:var(--li-identation)}.collapse.svelte-rwxv37{--li-display:inline;display:inline;font-style:italic}.comma.svelte-rwxv37{margin-left:-0.5em;margin-right:0.5em}label.svelte-rwxv37{position:relative}");
}
function get_each_context$1(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i2];
  child_ctx[20] = i2;
  return child_ctx;
}
function create_if_block_3(ctx) {
  let jsonarrow;
  let current;
  jsonarrow = new JSONArrow({ props: { expanded: (
    /*expanded*/
    ctx[0]
  ) } });
  jsonarrow.$on(
    "click",
    /*toggleExpand*/
    ctx[15]
  );
  return {
    c() {
      create_component(jsonarrow.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonarrow, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const jsonarrow_changes = {};
      if (dirty & /*expanded*/
      1) jsonarrow_changes.expanded = /*expanded*/
      ctx2[0];
      jsonarrow.$set(jsonarrow_changes);
    },
    i(local) {
      if (current) return;
      transition_in(jsonarrow.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonarrow.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonarrow, detaching);
    }
  };
}
function create_else_block(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "\u2026";
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    p: noop2,
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(span);
    }
  };
}
function create_if_block$2(ctx) {
  let ul;
  let t2;
  let current;
  let mounted;
  let dispose;
  let each_value = (
    /*slicedKeys*/
    ctx[13]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$1(get_each_context$1(ctx, each_value, i2));
  }
  const out = (i2) => transition_out(each_blocks[i2], 1, 1, () => {
    each_blocks[i2] = null;
  });
  let if_block = (
    /*slicedKeys*/
    ctx[13].length < /*previewKeys*/
    ctx[7].length && create_if_block_1()
  );
  return {
    c() {
      ul = element("ul");
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      t2 = space();
      if (if_block) if_block.c();
      attr(ul, "class", "svelte-rwxv37");
      toggle_class(ul, "collapse", !/*expanded*/
      ctx[0]);
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(ul, null);
      }
      append(ul, t2);
      if (if_block) if_block.m(ul, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          ul,
          "click",
          /*expand*/
          ctx[16]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*expanded, previewKeys, getKey, slicedKeys, isArray, getValue, getPreviewValue*/
      10129) {
        each_value = /*slicedKeys*/
        ctx2[13];
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
            transition_in(each_blocks[i2], 1);
          } else {
            each_blocks[i2] = create_each_block$1(child_ctx);
            each_blocks[i2].c();
            transition_in(each_blocks[i2], 1);
            each_blocks[i2].m(ul, t2);
          }
        }
        group_outros();
        for (i2 = each_value.length; i2 < each_blocks.length; i2 += 1) {
          out(i2);
        }
        check_outros();
      }
      if (
        /*slicedKeys*/
        ctx2[13].length < /*previewKeys*/
        ctx2[7].length
      ) {
        if (if_block) ;
        else {
          if_block = create_if_block_1();
          if_block.c();
          if_block.m(ul, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*expanded*/
      1) {
        toggle_class(ul, "collapse", !/*expanded*/
        ctx2[0]);
      }
    },
    i(local) {
      if (current) return;
      for (let i2 = 0; i2 < each_value.length; i2 += 1) {
        transition_in(each_blocks[i2]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        transition_out(each_blocks[i2]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) detach(ul);
      destroy_each(each_blocks, detaching);
      if (if_block) if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_2(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = ",";
      attr(span, "class", "comma svelte-rwxv37");
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    d(detaching) {
      if (detaching) detach(span);
    }
  };
}
function create_each_block$1(ctx) {
  let jsonnode;
  let t2;
  let if_block_anchor;
  let current;
  jsonnode = new JSONNode({
    props: {
      key: (
        /*getKey*/
        ctx[8](
          /*key*/
          ctx[12]
        )
      ),
      isParentExpanded: (
        /*expanded*/
        ctx[0]
      ),
      isParentArray: (
        /*isArray*/
        ctx[4]
      ),
      value: (
        /*expanded*/
        ctx[0] ? (
          /*getValue*/
          ctx[9](
            /*key*/
            ctx[12]
          )
        ) : (
          /*getPreviewValue*/
          ctx[10](
            /*key*/
            ctx[12]
          )
        )
      )
    }
  });
  let if_block = !/*expanded*/
  ctx[0] && /*index*/
  ctx[20] < /*previewKeys*/
  ctx[7].length - 1 && create_if_block_2();
  return {
    c() {
      create_component(jsonnode.$$.fragment);
      t2 = space();
      if (if_block) if_block.c();
      if_block_anchor = empty2();
    },
    m(target, anchor) {
      mount_component(jsonnode, target, anchor);
      insert(target, t2, anchor);
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const jsonnode_changes = {};
      if (dirty & /*getKey, slicedKeys*/
      8448) jsonnode_changes.key = /*getKey*/
      ctx2[8](
        /*key*/
        ctx2[12]
      );
      if (dirty & /*expanded*/
      1) jsonnode_changes.isParentExpanded = /*expanded*/
      ctx2[0];
      if (dirty & /*isArray*/
      16) jsonnode_changes.isParentArray = /*isArray*/
      ctx2[4];
      if (dirty & /*expanded, getValue, slicedKeys, getPreviewValue*/
      9729) jsonnode_changes.value = /*expanded*/
      ctx2[0] ? (
        /*getValue*/
        ctx2[9](
          /*key*/
          ctx2[12]
        )
      ) : (
        /*getPreviewValue*/
        ctx2[10](
          /*key*/
          ctx2[12]
        )
      );
      jsonnode.$set(jsonnode_changes);
      if (!/*expanded*/
      ctx2[0] && /*index*/
      ctx2[20] < /*previewKeys*/
      ctx2[7].length - 1) {
        if (if_block) ;
        else {
          if_block = create_if_block_2();
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i(local) {
      if (current) return;
      transition_in(jsonnode.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnode.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnode, detaching);
      if (detaching) detach(t2);
      if (if_block) if_block.d(detaching);
      if (detaching) detach(if_block_anchor);
    }
  };
}
function create_if_block_1(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "\u2026";
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    d(detaching) {
      if (detaching) detach(span);
    }
  };
}
function create_fragment$5(ctx) {
  let li;
  let label_1;
  let t0;
  let jsonkey;
  let t1;
  let span1;
  let span0;
  let t2;
  let t3;
  let t4;
  let current_block_type_index;
  let if_block1;
  let t5;
  let span2;
  let t6;
  let current;
  let mounted;
  let dispose;
  let if_block0 = (
    /*expandable*/
    ctx[11] && /*isParentExpanded*/
    ctx[2] && create_if_block_3(ctx)
  );
  jsonkey = new JSONKey({
    props: {
      key: (
        /*key*/
        ctx[12]
      ),
      colon: (
        /*context*/
        ctx[14].colon
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[2]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[3]
      )
    }
  });
  jsonkey.$on(
    "click",
    /*toggleExpand*/
    ctx[15]
  );
  const if_block_creators = [create_if_block$2, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*isParentExpanded*/
      ctx2[2]
    ) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      li = element("li");
      label_1 = element("label");
      if (if_block0) if_block0.c();
      t0 = space();
      create_component(jsonkey.$$.fragment);
      t1 = space();
      span1 = element("span");
      span0 = element("span");
      t2 = text(
        /*label*/
        ctx[1]
      );
      t3 = text(
        /*bracketOpen*/
        ctx[5]
      );
      t4 = space();
      if_block1.c();
      t5 = space();
      span2 = element("span");
      t6 = text(
        /*bracketClose*/
        ctx[6]
      );
      attr(label_1, "class", "svelte-rwxv37");
      attr(li, "class", "svelte-rwxv37");
      toggle_class(
        li,
        "indent",
        /*isParentExpanded*/
        ctx[2]
      );
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, label_1);
      if (if_block0) if_block0.m(label_1, null);
      append(label_1, t0);
      mount_component(jsonkey, label_1, null);
      append(label_1, t1);
      append(label_1, span1);
      append(span1, span0);
      append(span0, t2);
      append(span1, t3);
      append(li, t4);
      if_blocks[current_block_type_index].m(li, null);
      append(li, t5);
      append(li, span2);
      append(span2, t6);
      current = true;
      if (!mounted) {
        dispose = listen(
          span1,
          "click",
          /*toggleExpand*/
          ctx[15]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*expandable*/
        ctx2[11] && /*isParentExpanded*/
        ctx2[2]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & /*expandable, isParentExpanded*/
          2052) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_3(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(label_1, t0);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      const jsonkey_changes = {};
      if (dirty & /*key*/
      4096) jsonkey_changes.key = /*key*/
      ctx2[12];
      if (dirty & /*isParentExpanded*/
      4) jsonkey_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[2];
      if (dirty & /*isParentArray*/
      8) jsonkey_changes.isParentArray = /*isParentArray*/
      ctx2[3];
      jsonkey.$set(jsonkey_changes);
      if (!current || dirty & /*label*/
      2) set_data(
        t2,
        /*label*/
        ctx2[1]
      );
      if (!current || dirty & /*bracketOpen*/
      32) set_data(
        t3,
        /*bracketOpen*/
        ctx2[5]
      );
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block1 = if_blocks[current_block_type_index];
        if (!if_block1) {
          if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block1.c();
        } else {
          if_block1.p(ctx2, dirty);
        }
        transition_in(if_block1, 1);
        if_block1.m(li, t5);
      }
      if (!current || dirty & /*bracketClose*/
      64) set_data(
        t6,
        /*bracketClose*/
        ctx2[6]
      );
      if (dirty & /*isParentExpanded*/
      4) {
        toggle_class(
          li,
          "indent",
          /*isParentExpanded*/
          ctx2[2]
        );
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block0);
      transition_in(jsonkey.$$.fragment, local);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(jsonkey.$$.fragment, local);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(li);
      if (if_block0) if_block0.d();
      destroy_component(jsonkey);
      if_blocks[current_block_type_index].d();
      mounted = false;
      dispose();
    }
  };
}
function instance$5($$self, $$props, $$invalidate) {
  let slicedKeys;
  let { key, keys: keys2, colon = ":", label = "", isParentExpanded, isParentArray, isArray = false, bracketOpen, bracketClose } = $$props;
  let { previewKeys = keys2 } = $$props;
  let { getKey: getKey2 = (key2) => key2 } = $$props;
  let { getValue: getValue2 = (key2) => key2 } = $$props;
  let { getPreviewValue = getValue2 } = $$props;
  let { expanded = false, expandable = true } = $$props;
  const context = getContext(contextKey);
  setContext(contextKey, { ...context, colon });
  function toggleExpand() {
    $$invalidate(0, expanded = !expanded);
  }
  function expand() {
    $$invalidate(0, expanded = true);
  }
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(12, key = $$props2.key);
    if ("keys" in $$props2) $$invalidate(17, keys2 = $$props2.keys);
    if ("colon" in $$props2) $$invalidate(18, colon = $$props2.colon);
    if ("label" in $$props2) $$invalidate(1, label = $$props2.label);
    if ("isParentExpanded" in $$props2) $$invalidate(2, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(3, isParentArray = $$props2.isParentArray);
    if ("isArray" in $$props2) $$invalidate(4, isArray = $$props2.isArray);
    if ("bracketOpen" in $$props2) $$invalidate(5, bracketOpen = $$props2.bracketOpen);
    if ("bracketClose" in $$props2) $$invalidate(6, bracketClose = $$props2.bracketClose);
    if ("previewKeys" in $$props2) $$invalidate(7, previewKeys = $$props2.previewKeys);
    if ("getKey" in $$props2) $$invalidate(8, getKey2 = $$props2.getKey);
    if ("getValue" in $$props2) $$invalidate(9, getValue2 = $$props2.getValue);
    if ("getPreviewValue" in $$props2) $$invalidate(10, getPreviewValue = $$props2.getPreviewValue);
    if ("expanded" in $$props2) $$invalidate(0, expanded = $$props2.expanded);
    if ("expandable" in $$props2) $$invalidate(11, expandable = $$props2.expandable);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*isParentExpanded*/
    4) {
      if (!isParentExpanded) {
        $$invalidate(0, expanded = false);
      }
    }
    if ($$self.$$.dirty & /*expanded, keys, previewKeys*/
    131201) {
      $$invalidate(13, slicedKeys = expanded ? keys2 : previewKeys.slice(0, 5));
    }
  };
  return [
    expanded,
    label,
    isParentExpanded,
    isParentArray,
    isArray,
    bracketOpen,
    bracketClose,
    previewKeys,
    getKey2,
    getValue2,
    getPreviewValue,
    expandable,
    key,
    slicedKeys,
    context,
    toggleExpand,
    expand,
    keys2,
    colon
  ];
}
var JSONNested = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$5,
      create_fragment$5,
      safe_not_equal,
      {
        key: 12,
        keys: 17,
        colon: 18,
        label: 1,
        isParentExpanded: 2,
        isParentArray: 3,
        isArray: 4,
        bracketOpen: 5,
        bracketClose: 6,
        previewKeys: 7,
        getKey: 8,
        getValue: 9,
        getPreviewValue: 10,
        expanded: 0,
        expandable: 11
      },
      add_css$4
    );
  }
};
function create_fragment$6(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      expanded: (
        /*expanded*/
        ctx[4]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[1]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[2]
      ),
      keys: (
        /*keys*/
        ctx[5]
      ),
      previewKeys: (
        /*keys*/
        ctx[5]
      ),
      getValue: (
        /*getValue*/
        ctx[6]
      ),
      label: (
        /*nodeType*/
        ctx[3] + " "
      ),
      bracketOpen: "{",
      bracketClose: "}"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*key*/
      1) jsonnested_changes.key = /*key*/
      ctx2[0];
      if (dirty & /*expanded*/
      16) jsonnested_changes.expanded = /*expanded*/
      ctx2[4];
      if (dirty & /*isParentExpanded*/
      2) jsonnested_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[1];
      if (dirty & /*isParentArray*/
      4) jsonnested_changes.isParentArray = /*isParentArray*/
      ctx2[2];
      if (dirty & /*keys*/
      32) jsonnested_changes.keys = /*keys*/
      ctx2[5];
      if (dirty & /*keys*/
      32) jsonnested_changes.previewKeys = /*keys*/
      ctx2[5];
      if (dirty & /*nodeType*/
      8) jsonnested_changes.label = /*nodeType*/
      ctx2[3] + " ";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current) return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function instance$6($$self, $$props, $$invalidate) {
  let keys2;
  let { key, value: value2, isParentExpanded, isParentArray, nodeType } = $$props;
  let { expanded = true } = $$props;
  function getValue2(key2) {
    return value2[key2];
  }
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2) $$invalidate(7, value2 = $$props2.value);
    if ("isParentExpanded" in $$props2) $$invalidate(1, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(2, isParentArray = $$props2.isParentArray);
    if ("nodeType" in $$props2) $$invalidate(3, nodeType = $$props2.nodeType);
    if ("expanded" in $$props2) $$invalidate(4, expanded = $$props2.expanded);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    128) {
      $$invalidate(5, keys2 = Object.getOwnPropertyNames(value2));
    }
  };
  return [
    key,
    isParentExpanded,
    isParentArray,
    nodeType,
    expanded,
    keys2,
    getValue2,
    value2
  ];
}
var JSONObjectNode = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {
      key: 0,
      value: 7,
      isParentExpanded: 1,
      isParentArray: 2,
      nodeType: 3,
      expanded: 4
    });
  }
};
function create_fragment$7(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      expanded: (
        /*expanded*/
        ctx[4]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[2]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[3]
      ),
      isArray: true,
      keys: (
        /*keys*/
        ctx[5]
      ),
      previewKeys: (
        /*previewKeys*/
        ctx[6]
      ),
      getValue: (
        /*getValue*/
        ctx[7]
      ),
      label: "Array(" + /*value*/
      ctx[1].length + ")",
      bracketOpen: "[",
      bracketClose: "]"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*key*/
      1) jsonnested_changes.key = /*key*/
      ctx2[0];
      if (dirty & /*expanded*/
      16) jsonnested_changes.expanded = /*expanded*/
      ctx2[4];
      if (dirty & /*isParentExpanded*/
      4) jsonnested_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[2];
      if (dirty & /*isParentArray*/
      8) jsonnested_changes.isParentArray = /*isParentArray*/
      ctx2[3];
      if (dirty & /*keys*/
      32) jsonnested_changes.keys = /*keys*/
      ctx2[5];
      if (dirty & /*previewKeys*/
      64) jsonnested_changes.previewKeys = /*previewKeys*/
      ctx2[6];
      if (dirty & /*value*/
      2) jsonnested_changes.label = "Array(" + /*value*/
      ctx2[1].length + ")";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current) return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function instance$7($$self, $$props, $$invalidate) {
  let keys2;
  let previewKeys;
  let { key, value: value2, isParentExpanded, isParentArray } = $$props;
  let { expanded = JSON.stringify(value2).length < 1024 } = $$props;
  const filteredKey = /* @__PURE__ */ new Set(["length"]);
  function getValue2(key2) {
    return value2[key2];
  }
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2) $$invalidate(1, value2 = $$props2.value);
    if ("isParentExpanded" in $$props2) $$invalidate(2, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(3, isParentArray = $$props2.isParentArray);
    if ("expanded" in $$props2) $$invalidate(4, expanded = $$props2.expanded);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    2) {
      $$invalidate(5, keys2 = Object.getOwnPropertyNames(value2));
    }
    if ($$self.$$.dirty & /*keys*/
    32) {
      $$invalidate(6, previewKeys = keys2.filter((key2) => !filteredKey.has(key2)));
    }
  };
  return [
    key,
    value2,
    isParentExpanded,
    isParentArray,
    expanded,
    keys2,
    previewKeys,
    getValue2
  ];
}
var JSONArrayNode = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$7, create_fragment$7, safe_not_equal, {
      key: 0,
      value: 1,
      isParentExpanded: 2,
      isParentArray: 3,
      expanded: 4
    });
  }
};
function create_fragment$8(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[1]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[2]
      ),
      keys: (
        /*keys*/
        ctx[4]
      ),
      getKey,
      getValue,
      isArray: true,
      label: (
        /*nodeType*/
        ctx[3] + "(" + /*keys*/
        ctx[4].length + ")"
      ),
      bracketOpen: "{",
      bracketClose: "}"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*key*/
      1) jsonnested_changes.key = /*key*/
      ctx2[0];
      if (dirty & /*isParentExpanded*/
      2) jsonnested_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[1];
      if (dirty & /*isParentArray*/
      4) jsonnested_changes.isParentArray = /*isParentArray*/
      ctx2[2];
      if (dirty & /*keys*/
      16) jsonnested_changes.keys = /*keys*/
      ctx2[4];
      if (dirty & /*nodeType, keys*/
      24) jsonnested_changes.label = /*nodeType*/
      ctx2[3] + "(" + /*keys*/
      ctx2[4].length + ")";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current) return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function getKey(key) {
  return String(key[0]);
}
function getValue(key) {
  return key[1];
}
function instance$8($$self, $$props, $$invalidate) {
  let { key, value: value2, isParentExpanded, isParentArray, nodeType } = $$props;
  let keys2 = [];
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2) $$invalidate(5, value2 = $$props2.value);
    if ("isParentExpanded" in $$props2) $$invalidate(1, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(2, isParentArray = $$props2.isParentArray);
    if ("nodeType" in $$props2) $$invalidate(3, nodeType = $$props2.nodeType);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    32) {
      {
        let result = [];
        let i2 = 0;
        for (const entry of value2) {
          result.push([i2++, entry]);
        }
        $$invalidate(4, keys2 = result);
      }
    }
  };
  return [key, isParentExpanded, isParentArray, nodeType, keys2, value2];
}
var JSONIterableArrayNode = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$8, create_fragment$8, safe_not_equal, {
      key: 0,
      value: 5,
      isParentExpanded: 1,
      isParentArray: 2,
      nodeType: 3
    });
  }
};
var MapEntry = class {
  constructor(key, value2) {
    this.key = key;
    this.value = value2;
  }
};
function create_fragment$9(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[1]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[2]
      ),
      keys: (
        /*keys*/
        ctx[4]
      ),
      getKey: getKey$1,
      getValue: getValue$1,
      label: (
        /*nodeType*/
        ctx[3] + "(" + /*keys*/
        ctx[4].length + ")"
      ),
      colon: "",
      bracketOpen: "{",
      bracketClose: "}"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*key*/
      1) jsonnested_changes.key = /*key*/
      ctx2[0];
      if (dirty & /*isParentExpanded*/
      2) jsonnested_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[1];
      if (dirty & /*isParentArray*/
      4) jsonnested_changes.isParentArray = /*isParentArray*/
      ctx2[2];
      if (dirty & /*keys*/
      16) jsonnested_changes.keys = /*keys*/
      ctx2[4];
      if (dirty & /*nodeType, keys*/
      24) jsonnested_changes.label = /*nodeType*/
      ctx2[3] + "(" + /*keys*/
      ctx2[4].length + ")";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current) return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function getKey$1(entry) {
  return entry[0];
}
function getValue$1(entry) {
  return entry[1];
}
function instance$9($$self, $$props, $$invalidate) {
  let { key, value: value2, isParentExpanded, isParentArray, nodeType } = $$props;
  let keys2 = [];
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2) $$invalidate(5, value2 = $$props2.value);
    if ("isParentExpanded" in $$props2) $$invalidate(1, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(2, isParentArray = $$props2.isParentArray);
    if ("nodeType" in $$props2) $$invalidate(3, nodeType = $$props2.nodeType);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    32) {
      {
        let result = [];
        let i2 = 0;
        for (const entry of value2) {
          result.push([i2++, new MapEntry(entry[0], entry[1])]);
        }
        $$invalidate(4, keys2 = result);
      }
    }
  };
  return [key, isParentExpanded, isParentArray, nodeType, keys2, value2];
}
var JSONIterableMapNode = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$9, create_fragment$9, safe_not_equal, {
      key: 0,
      value: 5,
      isParentExpanded: 1,
      isParentArray: 2,
      nodeType: 3
    });
  }
};
function create_fragment$a(ctx) {
  let jsonnested;
  let current;
  jsonnested = new JSONNested({
    props: {
      expanded: (
        /*expanded*/
        ctx[4]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[2]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[3]
      ),
      key: (
        /*isParentExpanded*/
        ctx[2] ? String(
          /*key*/
          ctx[0]
        ) : (
          /*value*/
          ctx[1].key
        )
      ),
      keys: (
        /*keys*/
        ctx[5]
      ),
      getValue: (
        /*getValue*/
        ctx[6]
      ),
      label: (
        /*isParentExpanded*/
        ctx[2] ? "Entry " : "=> "
      ),
      bracketOpen: "{",
      bracketClose: "}"
    }
  });
  return {
    c() {
      create_component(jsonnested.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonnested, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnested_changes = {};
      if (dirty & /*expanded*/
      16) jsonnested_changes.expanded = /*expanded*/
      ctx2[4];
      if (dirty & /*isParentExpanded*/
      4) jsonnested_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[2];
      if (dirty & /*isParentArray*/
      8) jsonnested_changes.isParentArray = /*isParentArray*/
      ctx2[3];
      if (dirty & /*isParentExpanded, key, value*/
      7) jsonnested_changes.key = /*isParentExpanded*/
      ctx2[2] ? String(
        /*key*/
        ctx2[0]
      ) : (
        /*value*/
        ctx2[1].key
      );
      if (dirty & /*isParentExpanded*/
      4) jsonnested_changes.label = /*isParentExpanded*/
      ctx2[2] ? "Entry " : "=> ";
      jsonnested.$set(jsonnested_changes);
    },
    i(local) {
      if (current) return;
      transition_in(jsonnested.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnested.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnested, detaching);
    }
  };
}
function instance$a($$self, $$props, $$invalidate) {
  let { key, value: value2, isParentExpanded, isParentArray } = $$props;
  let { expanded = false } = $$props;
  const keys2 = ["key", "value"];
  function getValue2(key2) {
    return value2[key2];
  }
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2) $$invalidate(1, value2 = $$props2.value);
    if ("isParentExpanded" in $$props2) $$invalidate(2, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(3, isParentArray = $$props2.isParentArray);
    if ("expanded" in $$props2) $$invalidate(4, expanded = $$props2.expanded);
  };
  return [key, value2, isParentExpanded, isParentArray, expanded, keys2, getValue2];
}
var JSONMapEntryNode = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$a, create_fragment$a, safe_not_equal, {
      key: 0,
      value: 1,
      isParentExpanded: 2,
      isParentArray: 3,
      expanded: 4
    });
  }
};
function add_css$5(target) {
  append_styles(target, "svelte-3bjyvl", "li.svelte-3bjyvl{user-select:text;word-wrap:break-word;word-break:break-all}.indent.svelte-3bjyvl{padding-left:var(--li-identation)}.String.svelte-3bjyvl{color:var(--string-color)}.Date.svelte-3bjyvl{color:var(--date-color)}.Number.svelte-3bjyvl{color:var(--number-color)}.Boolean.svelte-3bjyvl{color:var(--boolean-color)}.Null.svelte-3bjyvl{color:var(--null-color)}.Undefined.svelte-3bjyvl{color:var(--undefined-color)}.Function.svelte-3bjyvl{color:var(--function-color);font-style:italic}.Symbol.svelte-3bjyvl{color:var(--symbol-color)}");
}
function create_fragment$b(ctx) {
  let li;
  let jsonkey;
  let t0;
  let span;
  let t1_value = (
    /*valueGetter*/
    (ctx[2] ? (
      /*valueGetter*/
      ctx[2](
        /*value*/
        ctx[1]
      )
    ) : (
      /*value*/
      ctx[1]
    )) + ""
  );
  let t1;
  let span_class_value;
  let current;
  jsonkey = new JSONKey({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      colon: (
        /*colon*/
        ctx[6]
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[3]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[4]
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(jsonkey.$$.fragment);
      t0 = space();
      span = element("span");
      t1 = text(t1_value);
      attr(span, "class", span_class_value = null_to_empty(
        /*nodeType*/
        ctx[5]
      ) + " svelte-3bjyvl");
      attr(li, "class", "svelte-3bjyvl");
      toggle_class(
        li,
        "indent",
        /*isParentExpanded*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(jsonkey, li, null);
      append(li, t0);
      append(li, span);
      append(span, t1);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonkey_changes = {};
      if (dirty & /*key*/
      1) jsonkey_changes.key = /*key*/
      ctx2[0];
      if (dirty & /*isParentExpanded*/
      8) jsonkey_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[3];
      if (dirty & /*isParentArray*/
      16) jsonkey_changes.isParentArray = /*isParentArray*/
      ctx2[4];
      jsonkey.$set(jsonkey_changes);
      if ((!current || dirty & /*valueGetter, value*/
      6) && t1_value !== (t1_value = /*valueGetter*/
      (ctx2[2] ? (
        /*valueGetter*/
        ctx2[2](
          /*value*/
          ctx2[1]
        )
      ) : (
        /*value*/
        ctx2[1]
      )) + "")) set_data(t1, t1_value);
      if (!current || dirty & /*nodeType*/
      32 && span_class_value !== (span_class_value = null_to_empty(
        /*nodeType*/
        ctx2[5]
      ) + " svelte-3bjyvl")) {
        attr(span, "class", span_class_value);
      }
      if (dirty & /*isParentExpanded*/
      8) {
        toggle_class(
          li,
          "indent",
          /*isParentExpanded*/
          ctx2[3]
        );
      }
    },
    i(local) {
      if (current) return;
      transition_in(jsonkey.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonkey.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(li);
      destroy_component(jsonkey);
    }
  };
}
function instance$b($$self, $$props, $$invalidate) {
  let { key, value: value2, valueGetter = null, isParentExpanded, isParentArray, nodeType } = $$props;
  const { colon } = getContext(contextKey);
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2) $$invalidate(1, value2 = $$props2.value);
    if ("valueGetter" in $$props2) $$invalidate(2, valueGetter = $$props2.valueGetter);
    if ("isParentExpanded" in $$props2) $$invalidate(3, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(4, isParentArray = $$props2.isParentArray);
    if ("nodeType" in $$props2) $$invalidate(5, nodeType = $$props2.nodeType);
  };
  return [key, value2, valueGetter, isParentExpanded, isParentArray, nodeType, colon];
}
var JSONValueNode = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$b,
      create_fragment$b,
      safe_not_equal,
      {
        key: 0,
        value: 1,
        valueGetter: 2,
        isParentExpanded: 3,
        isParentArray: 4,
        nodeType: 5
      },
      add_css$5
    );
  }
};
function add_css$6(target) {
  append_styles(target, "svelte-1ca3gb2", "li.svelte-1ca3gb2{user-select:text;word-wrap:break-word;word-break:break-all}.indent.svelte-1ca3gb2{padding-left:var(--li-identation)}.collapse.svelte-1ca3gb2{--li-display:inline;display:inline;font-style:italic}");
}
function get_each_context$2(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i2];
  child_ctx[10] = i2;
  return child_ctx;
}
function create_if_block_2$1(ctx) {
  let jsonarrow;
  let current;
  jsonarrow = new JSONArrow({ props: { expanded: (
    /*expanded*/
    ctx[0]
  ) } });
  jsonarrow.$on(
    "click",
    /*toggleExpand*/
    ctx[7]
  );
  return {
    c() {
      create_component(jsonarrow.$$.fragment);
    },
    m(target, anchor) {
      mount_component(jsonarrow, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const jsonarrow_changes = {};
      if (dirty & /*expanded*/
      1) jsonarrow_changes.expanded = /*expanded*/
      ctx2[0];
      jsonarrow.$set(jsonarrow_changes);
    },
    i(local) {
      if (current) return;
      transition_in(jsonarrow.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonarrow.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonarrow, detaching);
    }
  };
}
function create_if_block$3(ctx) {
  let ul;
  let current;
  let if_block = (
    /*expanded*/
    ctx[0] && create_if_block_1$1(ctx)
  );
  return {
    c() {
      ul = element("ul");
      if (if_block) if_block.c();
      attr(ul, "class", "svelte-1ca3gb2");
      toggle_class(ul, "collapse", !/*expanded*/
      ctx[0]);
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      if (if_block) if_block.m(ul, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*expanded*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*expanded*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1$1(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(ul, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      if (dirty & /*expanded*/
      1) {
        toggle_class(ul, "collapse", !/*expanded*/
        ctx2[0]);
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(ul);
      if (if_block) if_block.d();
    }
  };
}
function create_if_block_1$1(ctx) {
  let jsonnode;
  let t0;
  let li;
  let jsonkey;
  let t1;
  let span;
  let current;
  jsonnode = new JSONNode({
    props: {
      key: "message",
      value: (
        /*value*/
        ctx[2].message
      )
    }
  });
  jsonkey = new JSONKey({
    props: {
      key: "stack",
      colon: ":",
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[3]
      )
    }
  });
  let each_value = (
    /*stack*/
    ctx[5]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$2(get_each_context$2(ctx, each_value, i2));
  }
  return {
    c() {
      create_component(jsonnode.$$.fragment);
      t0 = space();
      li = element("li");
      create_component(jsonkey.$$.fragment);
      t1 = space();
      span = element("span");
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      attr(li, "class", "svelte-1ca3gb2");
    },
    m(target, anchor) {
      mount_component(jsonnode, target, anchor);
      insert(target, t0, anchor);
      insert(target, li, anchor);
      mount_component(jsonkey, li, null);
      append(li, t1);
      append(li, span);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(span, null);
      }
      current = true;
    },
    p(ctx2, dirty) {
      const jsonnode_changes = {};
      if (dirty & /*value*/
      4) jsonnode_changes.value = /*value*/
      ctx2[2].message;
      jsonnode.$set(jsonnode_changes);
      const jsonkey_changes = {};
      if (dirty & /*isParentExpanded*/
      8) jsonkey_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[3];
      jsonkey.$set(jsonkey_changes);
      if (dirty & /*stack*/
      32) {
        each_value = /*stack*/
        ctx2[5];
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$2(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
          } else {
            each_blocks[i2] = create_each_block$2(child_ctx);
            each_blocks[i2].c();
            each_blocks[i2].m(span, null);
          }
        }
        for (; i2 < each_blocks.length; i2 += 1) {
          each_blocks[i2].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i(local) {
      if (current) return;
      transition_in(jsonnode.$$.fragment, local);
      transition_in(jsonkey.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnode.$$.fragment, local);
      transition_out(jsonkey.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(jsonnode, detaching);
      if (detaching) detach(t0);
      if (detaching) detach(li);
      destroy_component(jsonkey);
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block$2(ctx) {
  let span;
  let t_value = (
    /*line*/
    ctx[8] + ""
  );
  let t2;
  let br;
  return {
    c() {
      span = element("span");
      t2 = text(t_value);
      br = element("br");
      attr(span, "class", "svelte-1ca3gb2");
      toggle_class(
        span,
        "indent",
        /*index*/
        ctx[10] > 0
      );
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t2);
      insert(target, br, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*stack*/
      32 && t_value !== (t_value = /*line*/
      ctx2[8] + "")) set_data(t2, t_value);
    },
    d(detaching) {
      if (detaching) detach(span);
      if (detaching) detach(br);
    }
  };
}
function create_fragment$c(ctx) {
  let li;
  let t0;
  let jsonkey;
  let t1;
  let span;
  let t2;
  let t3_value = (
    /*expanded*/
    (ctx[0] ? "" : (
      /*value*/
      ctx[2].message
    )) + ""
  );
  let t3;
  let t4;
  let current;
  let mounted;
  let dispose;
  let if_block0 = (
    /*isParentExpanded*/
    ctx[3] && create_if_block_2$1(ctx)
  );
  jsonkey = new JSONKey({
    props: {
      key: (
        /*key*/
        ctx[1]
      ),
      colon: (
        /*context*/
        ctx[6].colon
      ),
      isParentExpanded: (
        /*isParentExpanded*/
        ctx[3]
      ),
      isParentArray: (
        /*isParentArray*/
        ctx[4]
      )
    }
  });
  let if_block1 = (
    /*isParentExpanded*/
    ctx[3] && create_if_block$3(ctx)
  );
  return {
    c() {
      li = element("li");
      if (if_block0) if_block0.c();
      t0 = space();
      create_component(jsonkey.$$.fragment);
      t1 = space();
      span = element("span");
      t2 = text("Error: ");
      t3 = text(t3_value);
      t4 = space();
      if (if_block1) if_block1.c();
      attr(li, "class", "svelte-1ca3gb2");
      toggle_class(
        li,
        "indent",
        /*isParentExpanded*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, li, anchor);
      if (if_block0) if_block0.m(li, null);
      append(li, t0);
      mount_component(jsonkey, li, null);
      append(li, t1);
      append(li, span);
      append(span, t2);
      append(span, t3);
      append(li, t4);
      if (if_block1) if_block1.m(li, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          span,
          "click",
          /*toggleExpand*/
          ctx[7]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*isParentExpanded*/
        ctx2[3]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & /*isParentExpanded*/
          8) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_2$1(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(li, t0);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      const jsonkey_changes = {};
      if (dirty & /*key*/
      2) jsonkey_changes.key = /*key*/
      ctx2[1];
      if (dirty & /*isParentExpanded*/
      8) jsonkey_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[3];
      if (dirty & /*isParentArray*/
      16) jsonkey_changes.isParentArray = /*isParentArray*/
      ctx2[4];
      jsonkey.$set(jsonkey_changes);
      if ((!current || dirty & /*expanded, value*/
      5) && t3_value !== (t3_value = /*expanded*/
      (ctx2[0] ? "" : (
        /*value*/
        ctx2[2].message
      )) + "")) set_data(t3, t3_value);
      if (
        /*isParentExpanded*/
        ctx2[3]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*isParentExpanded*/
          8) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block$3(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(li, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (dirty & /*isParentExpanded*/
      8) {
        toggle_class(
          li,
          "indent",
          /*isParentExpanded*/
          ctx2[3]
        );
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block0);
      transition_in(jsonkey.$$.fragment, local);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(jsonkey.$$.fragment, local);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(li);
      if (if_block0) if_block0.d();
      destroy_component(jsonkey);
      if (if_block1) if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$c($$self, $$props, $$invalidate) {
  let stack;
  let { key, value: value2, isParentExpanded, isParentArray } = $$props;
  let { expanded = false } = $$props;
  const context = getContext(contextKey);
  setContext(contextKey, { ...context, colon: ":" });
  function toggleExpand() {
    $$invalidate(0, expanded = !expanded);
  }
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(1, key = $$props2.key);
    if ("value" in $$props2) $$invalidate(2, value2 = $$props2.value);
    if ("isParentExpanded" in $$props2) $$invalidate(3, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(4, isParentArray = $$props2.isParentArray);
    if ("expanded" in $$props2) $$invalidate(0, expanded = $$props2.expanded);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    4) {
      $$invalidate(5, stack = value2.stack.split("\n"));
    }
    if ($$self.$$.dirty & /*isParentExpanded*/
    8) {
      if (!isParentExpanded) {
        $$invalidate(0, expanded = false);
      }
    }
  };
  return [
    expanded,
    key,
    value2,
    isParentExpanded,
    isParentArray,
    stack,
    context,
    toggleExpand
  ];
}
var ErrorNode = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$c,
      create_fragment$c,
      safe_not_equal,
      {
        key: 1,
        value: 2,
        isParentExpanded: 3,
        isParentArray: 4,
        expanded: 0
      },
      add_css$6
    );
  }
};
function objType(obj) {
  const type = Object.prototype.toString.call(obj).slice(8, -1);
  if (type === "Object") {
    if (typeof obj[Symbol.iterator] === "function") {
      return "Iterable";
    }
    return obj.constructor.name;
  }
  return type;
}
function create_fragment$d(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  var switch_value = (
    /*componentType*/
    ctx[6]
  );
  function switch_props(ctx2) {
    return {
      props: {
        key: (
          /*key*/
          ctx2[0]
        ),
        value: (
          /*value*/
          ctx2[1]
        ),
        isParentExpanded: (
          /*isParentExpanded*/
          ctx2[2]
        ),
        isParentArray: (
          /*isParentArray*/
          ctx2[3]
        ),
        nodeType: (
          /*nodeType*/
          ctx2[4]
        ),
        valueGetter: (
          /*valueGetter*/
          ctx2[5]
        )
      }
    };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
  }
  return {
    c() {
      if (switch_instance) create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty2();
    },
    m(target, anchor) {
      if (switch_instance) {
        mount_component(switch_instance, target, anchor);
      }
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const switch_instance_changes = {};
      if (dirty & /*key*/
      1) switch_instance_changes.key = /*key*/
      ctx2[0];
      if (dirty & /*value*/
      2) switch_instance_changes.value = /*value*/
      ctx2[1];
      if (dirty & /*isParentExpanded*/
      4) switch_instance_changes.isParentExpanded = /*isParentExpanded*/
      ctx2[2];
      if (dirty & /*isParentArray*/
      8) switch_instance_changes.isParentArray = /*isParentArray*/
      ctx2[3];
      if (dirty & /*nodeType*/
      16) switch_instance_changes.nodeType = /*nodeType*/
      ctx2[4];
      if (dirty & /*valueGetter*/
      32) switch_instance_changes.valueGetter = /*valueGetter*/
      ctx2[5];
      if (switch_value !== (switch_value = /*componentType*/
      ctx2[6])) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current) return;
      if (switch_instance) transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance) transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(switch_instance_anchor);
      if (switch_instance) destroy_component(switch_instance, detaching);
    }
  };
}
function instance$d($$self, $$props, $$invalidate) {
  let nodeType;
  let componentType;
  let valueGetter;
  let { key, value: value2, isParentExpanded, isParentArray } = $$props;
  function getComponent(nodeType2) {
    switch (nodeType2) {
      case "Object":
        return JSONObjectNode;
      case "Error":
        return ErrorNode;
      case "Array":
        return JSONArrayNode;
      case "Iterable":
      case "Map":
      case "Set":
        return typeof value2.set === "function" ? JSONIterableMapNode : JSONIterableArrayNode;
      case "MapEntry":
        return JSONMapEntryNode;
      default:
        return JSONValueNode;
    }
  }
  function getValueGetter(nodeType2) {
    switch (nodeType2) {
      case "Object":
      case "Error":
      case "Array":
      case "Iterable":
      case "Map":
      case "Set":
      case "MapEntry":
      case "Number":
        return void 0;
      case "String":
        return (raw) => `"${raw}"`;
      case "Boolean":
        return (raw) => raw ? "true" : "false";
      case "Date":
        return (raw) => raw.toISOString();
      case "Null":
        return () => "null";
      case "Undefined":
        return () => "undefined";
      case "Function":
      case "Symbol":
        return (raw) => raw.toString();
      default:
        return () => `<${nodeType2}>`;
    }
  }
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2) $$invalidate(1, value2 = $$props2.value);
    if ("isParentExpanded" in $$props2) $$invalidate(2, isParentExpanded = $$props2.isParentExpanded);
    if ("isParentArray" in $$props2) $$invalidate(3, isParentArray = $$props2.isParentArray);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    2) {
      $$invalidate(4, nodeType = objType(value2));
    }
    if ($$self.$$.dirty & /*nodeType*/
    16) {
      $$invalidate(6, componentType = getComponent(nodeType));
    }
    if ($$self.$$.dirty & /*nodeType*/
    16) {
      $$invalidate(5, valueGetter = getValueGetter(nodeType));
    }
  };
  return [
    key,
    value2,
    isParentExpanded,
    isParentArray,
    nodeType,
    valueGetter,
    componentType
  ];
}
var JSONNode = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$d, create_fragment$d, safe_not_equal, {
      key: 0,
      value: 1,
      isParentExpanded: 2,
      isParentArray: 3
    });
  }
};
function add_css$7(target) {
  append_styles(target, "svelte-773n60", "ul.svelte-773n60{--string-color:var(--json-tree-string-color, #cb3f41);--symbol-color:var(--json-tree-symbol-color, #cb3f41);--boolean-color:var(--json-tree-boolean-color, #112aa7);--function-color:var(--json-tree-function-color, #112aa7);--number-color:var(--json-tree-number-color, #3029cf);--label-color:var(--json-tree-label-color, #871d8f);--arrow-color:var(--json-tree-arrow-color, #727272);--null-color:var(--json-tree-null-color, #8d8d8d);--undefined-color:var(--json-tree-undefined-color, #8d8d8d);--date-color:var(--json-tree-date-color, #8d8d8d);--li-identation:var(--json-tree-li-indentation, 1em);--li-line-height:var(--json-tree-li-line-height, 1.3);--li-colon-space:0.3em;font-size:var(--json-tree-font-size, 12px);font-family:var(--json-tree-font-family, 'Courier New', Courier, monospace)}ul.svelte-773n60 li{line-height:var(--li-line-height);display:var(--li-display, list-item);list-style:none}ul.svelte-773n60,ul.svelte-773n60 ul{padding:0;margin:0}");
}
function create_fragment$e(ctx) {
  let ul;
  let jsonnode;
  let current;
  jsonnode = new JSONNode({
    props: {
      key: (
        /*key*/
        ctx[0]
      ),
      value: (
        /*value*/
        ctx[1]
      ),
      isParentExpanded: true,
      isParentArray: false
    }
  });
  return {
    c() {
      ul = element("ul");
      create_component(jsonnode.$$.fragment);
      attr(ul, "class", "svelte-773n60");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      mount_component(jsonnode, ul, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const jsonnode_changes = {};
      if (dirty & /*key*/
      1) jsonnode_changes.key = /*key*/
      ctx2[0];
      if (dirty & /*value*/
      2) jsonnode_changes.value = /*value*/
      ctx2[1];
      jsonnode.$set(jsonnode_changes);
    },
    i(local) {
      if (current) return;
      transition_in(jsonnode.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(jsonnode.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(ul);
      destroy_component(jsonnode);
    }
  };
}
function instance$e($$self, $$props, $$invalidate) {
  setContext(contextKey, {});
  let { key = "", value: value2 } = $$props;
  $$self.$$set = ($$props2) => {
    if ("key" in $$props2) $$invalidate(0, key = $$props2.key);
    if ("value" in $$props2) $$invalidate(1, value2 = $$props2.value);
  };
  return [key, value2];
}
var Root = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$e, create_fragment$e, safe_not_equal, { key: 0, value: 1 }, add_css$7);
  }
};
function add_css$8(target) {
  append_styles(target, "svelte-jvfq3i", ".svelte-jvfq3i{box-sizing:border-box}section.switcher.svelte-jvfq3i{position:sticky;bottom:0;transform:translateY(20px);margin:40px -20px 0;border-top:1px solid #999;padding:20px;background:#fff}label.svelte-jvfq3i{display:flex;align-items:baseline;gap:5px;font-weight:bold}select.svelte-jvfq3i{min-width:140px}");
}
function get_each_context$3(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i2];
  child_ctx[9] = i2;
  return child_ctx;
}
function create_if_block$4(ctx) {
  let section;
  let label;
  let t2;
  let select;
  let mounted;
  let dispose;
  let each_value = (
    /*debuggableClients*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$3(get_each_context$3(ctx, each_value, i2));
  }
  return {
    c() {
      section = element("section");
      label = element("label");
      t2 = text("Client\n      \n      ");
      select = element("select");
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      attr(select, "id", selectId);
      attr(select, "class", "svelte-jvfq3i");
      if (
        /*selected*/
        ctx[2] === void 0
      ) add_render_callback(() => (
        /*select_change_handler*/
        ctx[6].call(select)
      ));
      attr(label, "class", "svelte-jvfq3i");
      attr(section, "class", "switcher svelte-jvfq3i");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, label);
      append(label, t2);
      append(label, select);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(select, null);
      }
      select_option(
        select,
        /*selected*/
        ctx[2]
      );
      if (!mounted) {
        dispose = [
          listen(
            select,
            "change",
            /*handleSelection*/
            ctx[3]
          ),
          listen(
            select,
            "change",
            /*select_change_handler*/
            ctx[6]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*debuggableClients, JSON*/
      2) {
        each_value = /*debuggableClients*/
        ctx2[1];
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$3(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
          } else {
            each_blocks[i2] = create_each_block$3(child_ctx);
            each_blocks[i2].c();
            each_blocks[i2].m(select, null);
          }
        }
        for (; i2 < each_blocks.length; i2 += 1) {
          each_blocks[i2].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & /*selected*/
      4) {
        select_option(
          select,
          /*selected*/
          ctx2[2]
        );
      }
    },
    d(detaching) {
      if (detaching) detach(section);
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block$3(ctx) {
  let option;
  let t0;
  let t1;
  let t2_value = JSON.stringify(
    /*clientOption*/
    ctx[7].playerID
  ) + "";
  let t2;
  let t3;
  let t4_value = JSON.stringify(
    /*clientOption*/
    ctx[7].matchID
  ) + "";
  let t4;
  let t5;
  let t6_value = (
    /*clientOption*/
    ctx[7].game.name + ""
  );
  let t6;
  let t7;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t0 = text(
        /*index*/
        ctx[9]
      );
      t1 = text(" \u2014\n            playerID: ");
      t2 = text(t2_value);
      t3 = text(",\n            matchID: ");
      t4 = text(t4_value);
      t5 = text("\n            (");
      t6 = text(t6_value);
      t7 = text(")\n          ");
      option.__value = option_value_value = /*index*/
      ctx[9];
      option.value = option.__value;
      attr(option, "class", "svelte-jvfq3i");
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t0);
      append(option, t1);
      append(option, t2);
      append(option, t3);
      append(option, t4);
      append(option, t5);
      append(option, t6);
      append(option, t7);
    },
    p(ctx2, dirty) {
      if (dirty & /*debuggableClients*/
      2 && t2_value !== (t2_value = JSON.stringify(
        /*clientOption*/
        ctx2[7].playerID
      ) + "")) set_data(t2, t2_value);
      if (dirty & /*debuggableClients*/
      2 && t4_value !== (t4_value = JSON.stringify(
        /*clientOption*/
        ctx2[7].matchID
      ) + "")) set_data(t4, t4_value);
      if (dirty & /*debuggableClients*/
      2 && t6_value !== (t6_value = /*clientOption*/
      ctx2[7].game.name + "")) set_data(t6, t6_value);
    },
    d(detaching) {
      if (detaching) detach(option);
    }
  };
}
function create_fragment$f(ctx) {
  let if_block_anchor;
  let if_block = (
    /*debuggableClients*/
    ctx[1].length > 1 && create_if_block$4(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty2();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (
        /*debuggableClients*/
        ctx2[1].length > 1
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$4(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (if_block) if_block.d(detaching);
      if (detaching) detach(if_block_anchor);
    }
  };
}
var selectId = "bgio-debug-select-client";
function instance$f($$self, $$props, $$invalidate) {
  let client;
  let debuggableClients;
  let selected;
  let $clientManager, $$unsubscribe_clientManager = noop2, $$subscribe_clientManager = () => ($$unsubscribe_clientManager(), $$unsubscribe_clientManager = subscribe(clientManager, ($$value) => $$invalidate(5, $clientManager = $$value)), clientManager);
  $$self.$$.on_destroy.push(() => $$unsubscribe_clientManager());
  let { clientManager } = $$props;
  $$subscribe_clientManager();
  const handleSelection = (e) => {
    const selectedClient = debuggableClients[e.target.value];
    clientManager.switchToClient(selectedClient);
    const select = document.getElementById(selectId);
    if (select) select.focus();
  };
  function select_change_handler() {
    selected = select_value(this);
    $$invalidate(2, selected), $$invalidate(1, debuggableClients), $$invalidate(4, client), $$invalidate(5, $clientManager);
  }
  $$self.$$set = ($$props2) => {
    if ("clientManager" in $$props2) $$subscribe_clientManager($$invalidate(0, clientManager = $$props2.clientManager));
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$clientManager*/
    32) {
      $$invalidate(4, { client, debuggableClients } = $clientManager, client, ($$invalidate(1, debuggableClients), $$invalidate(5, $clientManager)));
    }
    if ($$self.$$.dirty & /*debuggableClients, client*/
    18) {
      $$invalidate(2, selected = debuggableClients.indexOf(client));
    }
  };
  return [
    clientManager,
    debuggableClients,
    selected,
    handleSelection,
    client,
    $clientManager,
    select_change_handler
  ];
}
var ClientSwitcher = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$f, create_fragment$f, safe_not_equal, { clientManager: 0 }, add_css$8);
  }
};
function add_css$9(target) {
  append_styles(target, "svelte-1vfj1mn", ".key.svelte-1vfj1mn.svelte-1vfj1mn{display:flex;flex-direction:row;align-items:center}button.svelte-1vfj1mn.svelte-1vfj1mn{cursor:pointer;min-width:10px;padding-left:5px;padding-right:5px;height:20px;line-height:20px;text-align:center;border:1px solid #ccc;box-shadow:1px 1px 1px #888;background:#eee;color:#444}button.svelte-1vfj1mn.svelte-1vfj1mn:hover{background:#ddd}.key.active.svelte-1vfj1mn button.svelte-1vfj1mn{background:#ddd;border:1px solid #999;box-shadow:none}label.svelte-1vfj1mn.svelte-1vfj1mn{margin-left:10px}");
}
function create_if_block$5(ctx) {
  let label_1;
  let t0;
  let t1;
  let span;
  let t2_value = `(shortcut: ${/*value*/
  ctx[0]})`;
  let t2;
  return {
    c() {
      label_1 = element("label");
      t0 = text(
        /*label*/
        ctx[1]
      );
      t1 = space();
      span = element("span");
      t2 = text(t2_value);
      attr(span, "class", "screen-reader-only");
      attr(
        label_1,
        "for",
        /*id*/
        ctx[5]
      );
      attr(label_1, "class", "svelte-1vfj1mn");
    },
    m(target, anchor) {
      insert(target, label_1, anchor);
      append(label_1, t0);
      append(label_1, t1);
      append(label_1, span);
      append(span, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*label*/
      2) set_data(
        t0,
        /*label*/
        ctx2[1]
      );
      if (dirty & /*value*/
      1 && t2_value !== (t2_value = `(shortcut: ${/*value*/
      ctx2[0]})`)) set_data(t2, t2_value);
    },
    d(detaching) {
      if (detaching) detach(label_1);
    }
  };
}
function create_fragment$g(ctx) {
  let div;
  let button;
  let t0;
  let t1;
  let mounted;
  let dispose;
  let if_block = (
    /*label*/
    ctx[1] && create_if_block$5(ctx)
  );
  return {
    c() {
      div = element("div");
      button = element("button");
      t0 = text(
        /*value*/
        ctx[0]
      );
      t1 = space();
      if (if_block) if_block.c();
      attr(
        button,
        "id",
        /*id*/
        ctx[5]
      );
      button.disabled = /*disable*/
      ctx[2];
      attr(button, "class", "svelte-1vfj1mn");
      attr(div, "class", "key svelte-1vfj1mn");
      toggle_class(
        div,
        "active",
        /*active*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, button);
      append(button, t0);
      append(div, t1);
      if (if_block) if_block.m(div, null);
      if (!mounted) {
        dispose = [
          listen(
            window,
            "keydown",
            /*Keypress*/
            ctx[7]
          ),
          listen(
            button,
            "click",
            /*Activate*/
            ctx[6]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*value*/
      1) set_data(
        t0,
        /*value*/
        ctx2[0]
      );
      if (dirty & /*disable*/
      4) {
        button.disabled = /*disable*/
        ctx2[2];
      }
      if (
        /*label*/
        ctx2[1]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$5(ctx2);
          if_block.c();
          if_block.m(div, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*active*/
      8) {
        toggle_class(
          div,
          "active",
          /*active*/
          ctx2[3]
        );
      }
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(div);
      if (if_block) if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$g($$self, $$props, $$invalidate) {
  let $disableHotkeys;
  let { value: value2 } = $$props;
  let { onPress = null } = $$props;
  let { label = null } = $$props;
  let { disable = false } = $$props;
  const { disableHotkeys } = getContext("hotkeys");
  component_subscribe($$self, disableHotkeys, (value3) => $$invalidate(9, $disableHotkeys = value3));
  let active2 = false;
  let id = `key-${value2}`;
  function Deactivate() {
    $$invalidate(3, active2 = false);
  }
  function Activate() {
    $$invalidate(3, active2 = true);
    setTimeout(Deactivate, 200);
    if (onPress) {
      setTimeout(onPress, 1);
    }
  }
  function Keypress(e) {
    if (!$disableHotkeys && !disable && !e.ctrlKey && !e.metaKey && e.key == value2) {
      e.preventDefault();
      Activate();
    }
  }
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2) $$invalidate(0, value2 = $$props2.value);
    if ("onPress" in $$props2) $$invalidate(8, onPress = $$props2.onPress);
    if ("label" in $$props2) $$invalidate(1, label = $$props2.label);
    if ("disable" in $$props2) $$invalidate(2, disable = $$props2.disable);
  };
  return [value2, label, disable, active2, disableHotkeys, id, Activate, Keypress, onPress];
}
var Hotkey = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$g,
      create_fragment$g,
      safe_not_equal,
      {
        value: 0,
        onPress: 8,
        label: 1,
        disable: 2
      },
      add_css$9
    );
  }
};
function add_css$a(target) {
  append_styles(target, "svelte-1mppqmp", ".move.svelte-1mppqmp{display:flex;flex-direction:row;cursor:pointer;margin-left:10px;color:#666}.move.svelte-1mppqmp:hover{color:#333}.move.active.svelte-1mppqmp{color:#111;font-weight:bold}.arg-field.svelte-1mppqmp{outline:none;font-family:monospace}");
}
function create_fragment$h(ctx) {
  let div;
  let span0;
  let t0;
  let t1;
  let span1;
  let t3;
  let span2;
  let t4;
  let span3;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      span0 = element("span");
      t0 = text(
        /*name*/
        ctx[2]
      );
      t1 = space();
      span1 = element("span");
      span1.textContent = "(";
      t3 = space();
      span2 = element("span");
      t4 = space();
      span3 = element("span");
      span3.textContent = ")";
      attr(span2, "class", "arg-field svelte-1mppqmp");
      attr(span2, "contenteditable", "");
      attr(div, "class", "move svelte-1mppqmp");
      toggle_class(
        div,
        "active",
        /*active*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, span0);
      append(span0, t0);
      append(div, t1);
      append(div, span1);
      append(div, t3);
      append(div, span2);
      ctx[6](span2);
      append(div, t4);
      append(div, span3);
      if (!mounted) {
        dispose = [
          listen(span2, "focus", function() {
            if (is_function(
              /*Activate*/
              ctx[0]
            )) ctx[0].apply(this, arguments);
          }),
          listen(span2, "blur", function() {
            if (is_function(
              /*Deactivate*/
              ctx[1]
            )) ctx[1].apply(this, arguments);
          }),
          listen(span2, "keypress", stop_propagation(keypress_handler)),
          listen(
            span2,
            "keydown",
            /*OnKeyDown*/
            ctx[5]
          ),
          listen(div, "click", function() {
            if (is_function(
              /*Activate*/
              ctx[0]
            )) ctx[0].apply(this, arguments);
          })
        ];
        mounted = true;
      }
    },
    p(new_ctx, [dirty]) {
      ctx = new_ctx;
      if (dirty & /*name*/
      4) set_data(
        t0,
        /*name*/
        ctx[2]
      );
      if (dirty & /*active*/
      8) {
        toggle_class(
          div,
          "active",
          /*active*/
          ctx[3]
        );
      }
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(div);
      ctx[6](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
var keypress_handler = () => {
};
function instance$h($$self, $$props, $$invalidate) {
  let { Activate } = $$props;
  let { Deactivate } = $$props;
  let { name } = $$props;
  let { active: active2 } = $$props;
  let span;
  const dispatch2 = createEventDispatcher();
  function Submit() {
    try {
      const value2 = span.innerText;
      let argArray = new Function(`return [${value2}]`)();
      dispatch2("submit", argArray);
    } catch (error2) {
      dispatch2("error", error2);
    }
    $$invalidate(4, span.innerText = "", span);
  }
  function OnKeyDown(e) {
    if (e.key == "Enter") {
      e.preventDefault();
      Submit();
    }
    if (e.key == "Escape") {
      e.preventDefault();
      Deactivate();
    }
  }
  afterUpdate(() => {
    if (active2) {
      span.focus();
    } else {
      span.blur();
    }
  });
  function span2_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      span = $$value;
      $$invalidate(4, span);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("Activate" in $$props2) $$invalidate(0, Activate = $$props2.Activate);
    if ("Deactivate" in $$props2) $$invalidate(1, Deactivate = $$props2.Deactivate);
    if ("name" in $$props2) $$invalidate(2, name = $$props2.name);
    if ("active" in $$props2) $$invalidate(3, active2 = $$props2.active);
  };
  return [Activate, Deactivate, name, active2, span, OnKeyDown, span2_binding];
}
var InteractiveFunction = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$h,
      create_fragment$h,
      safe_not_equal,
      {
        Activate: 0,
        Deactivate: 1,
        name: 2,
        active: 3
      },
      add_css$a
    );
  }
};
function add_css$b(target) {
  append_styles(target, "svelte-smqssc", ".move-error.svelte-smqssc{color:#a00;font-weight:bold}.wrapper.svelte-smqssc{display:flex;flex-direction:row;align-items:center}");
}
function create_if_block$6(ctx) {
  let span;
  let t2;
  return {
    c() {
      span = element("span");
      t2 = text(
        /*error*/
        ctx[2]
      );
      attr(span, "class", "move-error svelte-smqssc");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*error*/
      4) set_data(
        t2,
        /*error*/
        ctx2[2]
      );
    },
    d(detaching) {
      if (detaching) detach(span);
    }
  };
}
function create_fragment$i(ctx) {
  let div1;
  let div0;
  let hotkey;
  let t0;
  let interactivefunction;
  let t1;
  let current;
  hotkey = new Hotkey({
    props: {
      value: (
        /*shortcut*/
        ctx[0]
      ),
      onPress: (
        /*Activate*/
        ctx[4]
      )
    }
  });
  interactivefunction = new InteractiveFunction({
    props: {
      Activate: (
        /*Activate*/
        ctx[4]
      ),
      Deactivate: (
        /*Deactivate*/
        ctx[5]
      ),
      name: (
        /*name*/
        ctx[1]
      ),
      active: (
        /*active*/
        ctx[3]
      )
    }
  });
  interactivefunction.$on(
    "submit",
    /*Submit*/
    ctx[6]
  );
  interactivefunction.$on(
    "error",
    /*Error*/
    ctx[7]
  );
  let if_block = (
    /*error*/
    ctx[2] && create_if_block$6(ctx)
  );
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      create_component(hotkey.$$.fragment);
      t0 = space();
      create_component(interactivefunction.$$.fragment);
      t1 = space();
      if (if_block) if_block.c();
      attr(div0, "class", "wrapper svelte-smqssc");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      mount_component(hotkey, div0, null);
      append(div0, t0);
      mount_component(interactivefunction, div0, null);
      append(div1, t1);
      if (if_block) if_block.m(div1, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const hotkey_changes = {};
      if (dirty & /*shortcut*/
      1) hotkey_changes.value = /*shortcut*/
      ctx2[0];
      hotkey.$set(hotkey_changes);
      const interactivefunction_changes = {};
      if (dirty & /*name*/
      2) interactivefunction_changes.name = /*name*/
      ctx2[1];
      if (dirty & /*active*/
      8) interactivefunction_changes.active = /*active*/
      ctx2[3];
      interactivefunction.$set(interactivefunction_changes);
      if (
        /*error*/
        ctx2[2]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$6(ctx2);
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i(local) {
      if (current) return;
      transition_in(hotkey.$$.fragment, local);
      transition_in(interactivefunction.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(hotkey.$$.fragment, local);
      transition_out(interactivefunction.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(div1);
      destroy_component(hotkey);
      destroy_component(interactivefunction);
      if (if_block) if_block.d();
    }
  };
}
function instance$i($$self, $$props, $$invalidate) {
  let { shortcut } = $$props;
  let { name } = $$props;
  let { fn: fn2 } = $$props;
  const { disableHotkeys } = getContext("hotkeys");
  let error$1 = "";
  let active2 = false;
  function Activate() {
    disableHotkeys.set(true);
    $$invalidate(3, active2 = true);
  }
  function Deactivate() {
    disableHotkeys.set(false);
    $$invalidate(2, error$1 = "");
    $$invalidate(3, active2 = false);
  }
  function Submit(e) {
    $$invalidate(2, error$1 = "");
    Deactivate();
    fn2.apply(this, e.detail);
  }
  function Error2(e) {
    $$invalidate(2, error$1 = e.detail);
    error(e.detail);
  }
  $$self.$$set = ($$props2) => {
    if ("shortcut" in $$props2) $$invalidate(0, shortcut = $$props2.shortcut);
    if ("name" in $$props2) $$invalidate(1, name = $$props2.name);
    if ("fn" in $$props2) $$invalidate(8, fn2 = $$props2.fn);
  };
  return [shortcut, name, error$1, active2, Activate, Deactivate, Submit, Error2, fn2];
}
var Move = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$i, create_fragment$i, safe_not_equal, { shortcut: 0, name: 1, fn: 8 }, add_css$b);
  }
};
function add_css$c(target) {
  append_styles(target, "svelte-9hauj9", "ul.svelte-9hauj9{padding-left:0}li.svelte-9hauj9{list-style:none;margin:0;margin-bottom:5px}");
}
function create_fragment$j(ctx) {
  let ul;
  let li0;
  let hotkey0;
  let t0;
  let li1;
  let hotkey1;
  let t1;
  let li2;
  let hotkey2;
  let t2;
  let li3;
  let hotkey3;
  let current;
  hotkey0 = new Hotkey({
    props: {
      value: "1",
      onPress: (
        /*client*/
        ctx[0].reset
      ),
      label: "reset"
    }
  });
  hotkey1 = new Hotkey({
    props: {
      value: "2",
      onPress: (
        /*Save*/
        ctx[2]
      ),
      label: "save"
    }
  });
  hotkey2 = new Hotkey({
    props: {
      value: "3",
      onPress: (
        /*Restore*/
        ctx[3]
      ),
      label: "restore"
    }
  });
  hotkey3 = new Hotkey({
    props: {
      value: ".",
      onPress: (
        /*ToggleVisibility*/
        ctx[1]
      ),
      label: "hide"
    }
  });
  return {
    c() {
      ul = element("ul");
      li0 = element("li");
      create_component(hotkey0.$$.fragment);
      t0 = space();
      li1 = element("li");
      create_component(hotkey1.$$.fragment);
      t1 = space();
      li2 = element("li");
      create_component(hotkey2.$$.fragment);
      t2 = space();
      li3 = element("li");
      create_component(hotkey3.$$.fragment);
      attr(li0, "class", "svelte-9hauj9");
      attr(li1, "class", "svelte-9hauj9");
      attr(li2, "class", "svelte-9hauj9");
      attr(li3, "class", "svelte-9hauj9");
      attr(ul, "id", "debug-controls");
      attr(ul, "class", "controls svelte-9hauj9");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      append(ul, li0);
      mount_component(hotkey0, li0, null);
      append(ul, t0);
      append(ul, li1);
      mount_component(hotkey1, li1, null);
      append(ul, t1);
      append(ul, li2);
      mount_component(hotkey2, li2, null);
      append(ul, t2);
      append(ul, li3);
      mount_component(hotkey3, li3, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const hotkey0_changes = {};
      if (dirty & /*client*/
      1) hotkey0_changes.onPress = /*client*/
      ctx2[0].reset;
      hotkey0.$set(hotkey0_changes);
      const hotkey3_changes = {};
      if (dirty & /*ToggleVisibility*/
      2) hotkey3_changes.onPress = /*ToggleVisibility*/
      ctx2[1];
      hotkey3.$set(hotkey3_changes);
    },
    i(local) {
      if (current) return;
      transition_in(hotkey0.$$.fragment, local);
      transition_in(hotkey1.$$.fragment, local);
      transition_in(hotkey2.$$.fragment, local);
      transition_in(hotkey3.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(hotkey0.$$.fragment, local);
      transition_out(hotkey1.$$.fragment, local);
      transition_out(hotkey2.$$.fragment, local);
      transition_out(hotkey3.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(ul);
      destroy_component(hotkey0);
      destroy_component(hotkey1);
      destroy_component(hotkey2);
      destroy_component(hotkey3);
    }
  };
}
function instance$j($$self, $$props, $$invalidate) {
  let { client } = $$props;
  let { ToggleVisibility } = $$props;
  function Save() {
    const state = client.getState();
    const json = stringify({
      ...state,
      _undo: [],
      _redo: [],
      deltalog: []
    });
    window.localStorage.setItem("gamestate", json);
    window.localStorage.setItem("initialState", stringify(client.initialState));
  }
  function Restore() {
    const gamestateJSON = window.localStorage.getItem("gamestate");
    const initialStateJSON = window.localStorage.getItem("initialState");
    if (gamestateJSON !== null && initialStateJSON !== null) {
      const gamestate = parse3(gamestateJSON);
      const initialState = parse3(initialStateJSON);
      client.store.dispatch(sync({ state: gamestate, initialState }));
    }
  }
  $$self.$$set = ($$props2) => {
    if ("client" in $$props2) $$invalidate(0, client = $$props2.client);
    if ("ToggleVisibility" in $$props2) $$invalidate(1, ToggleVisibility = $$props2.ToggleVisibility);
  };
  return [client, ToggleVisibility, Save, Restore];
}
var Controls = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$j, create_fragment$j, safe_not_equal, { client: 0, ToggleVisibility: 1 }, add_css$c);
  }
};
function add_css$d(target) {
  append_styles(target, "svelte-19aan9p", ".player-box.svelte-19aan9p{display:flex;flex-direction:row}.player.svelte-19aan9p{cursor:pointer;text-align:center;width:30px;height:30px;line-height:30px;background:#eee;border:3px solid #fefefe;box-sizing:content-box;padding:0}.player.current.svelte-19aan9p{background:#555;color:#eee;font-weight:bold}.player.active.svelte-19aan9p{border:3px solid #ff7f50}");
}
function get_each_context$4(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i2];
  return child_ctx;
}
function create_each_block$4(ctx) {
  let button;
  let t0_value = (
    /*player*/
    ctx[7] + ""
  );
  let t0;
  let t1;
  let button_aria_label_value;
  let mounted;
  let dispose;
  function click_handler() {
    return (
      /*click_handler*/
      ctx[5](
        /*player*/
        ctx[7]
      )
    );
  }
  return {
    c() {
      button = element("button");
      t0 = text(t0_value);
      t1 = space();
      attr(button, "class", "player svelte-19aan9p");
      attr(button, "aria-label", button_aria_label_value = /*playerLabel*/
      ctx[4](
        /*player*/
        ctx[7]
      ));
      toggle_class(
        button,
        "current",
        /*player*/
        ctx[7] == /*ctx*/
        ctx[0].currentPlayer
      );
      toggle_class(
        button,
        "active",
        /*player*/
        ctx[7] == /*playerID*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t0);
      append(button, t1);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*players*/
      4 && t0_value !== (t0_value = /*player*/
      ctx[7] + "")) set_data(t0, t0_value);
      if (dirty & /*players*/
      4 && button_aria_label_value !== (button_aria_label_value = /*playerLabel*/
      ctx[4](
        /*player*/
        ctx[7]
      ))) {
        attr(button, "aria-label", button_aria_label_value);
      }
      if (dirty & /*players, ctx*/
      5) {
        toggle_class(
          button,
          "current",
          /*player*/
          ctx[7] == /*ctx*/
          ctx[0].currentPlayer
        );
      }
      if (dirty & /*players, playerID*/
      6) {
        toggle_class(
          button,
          "active",
          /*player*/
          ctx[7] == /*playerID*/
          ctx[1]
        );
      }
    },
    d(detaching) {
      if (detaching) detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$k(ctx) {
  let div;
  let each_value = (
    /*players*/
    ctx[2]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$4(get_each_context$4(ctx, each_value, i2));
  }
  return {
    c() {
      div = element("div");
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      attr(div, "class", "player-box svelte-19aan9p");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(div, null);
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*playerLabel, players, ctx, playerID, OnClick*/
      31) {
        each_value = /*players*/
        ctx2[2];
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$4(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
          } else {
            each_blocks[i2] = create_each_block$4(child_ctx);
            each_blocks[i2].c();
            each_blocks[i2].m(div, null);
          }
        }
        for (; i2 < each_blocks.length; i2 += 1) {
          each_blocks[i2].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(div);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$k($$self, $$props, $$invalidate) {
  let { ctx } = $$props;
  let { playerID } = $$props;
  const dispatch2 = createEventDispatcher();
  function OnClick(player) {
    if (player == playerID) {
      dispatch2("change", { playerID: null });
    } else {
      dispatch2("change", { playerID: player });
    }
  }
  function playerLabel(player) {
    const properties = [];
    if (player == ctx.currentPlayer) properties.push("current");
    if (player == playerID) properties.push("active");
    let label = `Player ${player}`;
    if (properties.length) label += ` (${properties.join(", ")})`;
    return label;
  }
  let players;
  const click_handler = (player) => OnClick(player);
  $$self.$$set = ($$props2) => {
    if ("ctx" in $$props2) $$invalidate(0, ctx = $$props2.ctx);
    if ("playerID" in $$props2) $$invalidate(1, playerID = $$props2.playerID);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*ctx*/
    1) {
      $$invalidate(2, players = ctx ? [...Array(ctx.numPlayers).keys()].map((i2) => i2.toString()) : []);
    }
  };
  return [ctx, playerID, players, OnClick, playerLabel, click_handler];
}
var PlayerInfo = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$k, create_fragment$k, safe_not_equal, { ctx: 0, playerID: 1 }, add_css$d);
  }
};
function _unsupportedIterableToArray(o2, minLen) {
  if (!o2) return;
  if (typeof o2 === "string") return _arrayLikeToArray(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor) n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set") return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray(o2, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
  return arr2;
}
function _createForOfIteratorHelper(o2, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o2[Symbol.iterator] || o2["@@iterator"];
  if (!it) {
    if (Array.isArray(o2) || (it = _unsupportedIterableToArray(o2)) || allowArrayLike && o2 && typeof o2.length === "number") {
      if (it) o2 = it;
      var i2 = 0;
      var F = function() {
      };
      return {
        s: F,
        n: function() {
          if (i2 >= o2.length) return {
            done: true
          };
          return {
            done: false,
            value: o2[i2++]
          };
        },
        e: function(e) {
          throw e;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true, didErr = false, err;
  return {
    s: function() {
      it = it.call(o2);
    },
    n: function() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function(e) {
      didErr = true;
      err = e;
    },
    f: function() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}
function AssignShortcuts(moveNames, blacklist) {
  var shortcuts = {};
  var taken = {};
  var _iterator = _createForOfIteratorHelper(blacklist), _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var c2 = _step.value;
      taken[c2] = true;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var t2 = taken;
  var canUseFirstChar = true;
  for (var name in moveNames) {
    var shortcut = name[0];
    if (t2[shortcut]) {
      canUseFirstChar = false;
      break;
    }
    t2[shortcut] = true;
    shortcuts[name] = shortcut;
  }
  if (canUseFirstChar) {
    return shortcuts;
  }
  t2 = taken;
  var next = 97;
  shortcuts = {};
  for (var _name in moveNames) {
    var _shortcut = String.fromCharCode(next);
    while (t2[_shortcut]) {
      next++;
      _shortcut = String.fromCharCode(next);
    }
    t2[_shortcut] = true;
    shortcuts[_name] = _shortcut;
  }
  return shortcuts;
}
function add_css$e(target) {
  append_styles(target, "svelte-146sq5f", ".tree.svelte-146sq5f{--json-tree-font-family:monospace;--json-tree-font-size:14px;--json-tree-null-color:#757575}.label.svelte-146sq5f{margin-bottom:0;text-transform:none}h3.svelte-146sq5f{text-transform:uppercase}ul.svelte-146sq5f{padding-left:0}li.svelte-146sq5f{list-style:none;margin:0;margin-bottom:5px}");
}
function get_each_context$5(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[11] = list[i2][0];
  child_ctx[12] = list[i2][1];
  return child_ctx;
}
function create_each_block$5(ctx) {
  let li;
  let move;
  let t2;
  let current;
  move = new Move({
    props: {
      shortcut: (
        /*shortcuts*/
        ctx[8][
          /*name*/
          ctx[11]
        ]
      ),
      fn: (
        /*fn*/
        ctx[12]
      ),
      name: (
        /*name*/
        ctx[11]
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(move.$$.fragment);
      t2 = space();
      attr(li, "class", "svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(move, li, null);
      append(li, t2);
      current = true;
    },
    p(ctx2, dirty) {
      const move_changes = {};
      if (dirty & /*moves*/
      16) move_changes.shortcut = /*shortcuts*/
      ctx2[8][
        /*name*/
        ctx2[11]
      ];
      if (dirty & /*moves*/
      16) move_changes.fn = /*fn*/
      ctx2[12];
      if (dirty & /*moves*/
      16) move_changes.name = /*name*/
      ctx2[11];
      move.$set(move_changes);
    },
    i(local) {
      if (current) return;
      transition_in(move.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(move.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(li);
      destroy_component(move);
    }
  };
}
function create_if_block_2$2(ctx) {
  let li;
  let move;
  let current;
  move = new Move({
    props: {
      name: "endStage",
      shortcut: 7,
      fn: (
        /*events*/
        ctx[5].endStage
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(move.$$.fragment);
      attr(li, "class", "svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(move, li, null);
      current = true;
    },
    p(ctx2, dirty) {
      const move_changes = {};
      if (dirty & /*events*/
      32) move_changes.fn = /*events*/
      ctx2[5].endStage;
      move.$set(move_changes);
    },
    i(local) {
      if (current) return;
      transition_in(move.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(move.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(li);
      destroy_component(move);
    }
  };
}
function create_if_block_1$2(ctx) {
  let li;
  let move;
  let current;
  move = new Move({
    props: {
      name: "endTurn",
      shortcut: 8,
      fn: (
        /*events*/
        ctx[5].endTurn
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(move.$$.fragment);
      attr(li, "class", "svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(move, li, null);
      current = true;
    },
    p(ctx2, dirty) {
      const move_changes = {};
      if (dirty & /*events*/
      32) move_changes.fn = /*events*/
      ctx2[5].endTurn;
      move.$set(move_changes);
    },
    i(local) {
      if (current) return;
      transition_in(move.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(move.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(li);
      destroy_component(move);
    }
  };
}
function create_if_block$7(ctx) {
  let li;
  let move;
  let current;
  move = new Move({
    props: {
      name: "endPhase",
      shortcut: 9,
      fn: (
        /*events*/
        ctx[5].endPhase
      )
    }
  });
  return {
    c() {
      li = element("li");
      create_component(move.$$.fragment);
      attr(li, "class", "svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      mount_component(move, li, null);
      current = true;
    },
    p(ctx2, dirty) {
      const move_changes = {};
      if (dirty & /*events*/
      32) move_changes.fn = /*events*/
      ctx2[5].endPhase;
      move.$set(move_changes);
    },
    i(local) {
      if (current) return;
      transition_in(move.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(move.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(li);
      destroy_component(move);
    }
  };
}
function create_fragment$l(ctx) {
  let section0;
  let h30;
  let t1;
  let controls;
  let t2;
  let section1;
  let h31;
  let t4;
  let playerinfo;
  let t5;
  let section2;
  let h32;
  let t7;
  let ul0;
  let t8;
  let section3;
  let h33;
  let t10;
  let ul1;
  let t11;
  let t12;
  let t13;
  let section4;
  let h34;
  let t15;
  let jsontree0;
  let t16;
  let section5;
  let h35;
  let t18;
  let jsontree1;
  let t19;
  let clientswitcher;
  let current;
  controls = new Controls({
    props: {
      client: (
        /*client*/
        ctx[0]
      ),
      ToggleVisibility: (
        /*ToggleVisibility*/
        ctx[2]
      )
    }
  });
  playerinfo = new PlayerInfo({
    props: {
      ctx: (
        /*ctx*/
        ctx[6]
      ),
      playerID: (
        /*playerID*/
        ctx[3]
      )
    }
  });
  playerinfo.$on(
    "change",
    /*change_handler*/
    ctx[9]
  );
  let each_value = Object.entries(
    /*moves*/
    ctx[4]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$5(get_each_context$5(ctx, each_value, i2));
  }
  const out = (i2) => transition_out(each_blocks[i2], 1, 1, () => {
    each_blocks[i2] = null;
  });
  let if_block0 = (
    /*ctx*/
    ctx[6].activePlayers && /*events*/
    ctx[5].endStage && create_if_block_2$2(ctx)
  );
  let if_block1 = (
    /*events*/
    ctx[5].endTurn && create_if_block_1$2(ctx)
  );
  let if_block2 = (
    /*ctx*/
    ctx[6].phase && /*events*/
    ctx[5].endPhase && create_if_block$7(ctx)
  );
  jsontree0 = new Root({ props: { value: (
    /*G*/
    ctx[7]
  ) } });
  jsontree1 = new Root({
    props: { value: SanitizeCtx(
      /*ctx*/
      ctx[6]
    ) }
  });
  clientswitcher = new ClientSwitcher({
    props: { clientManager: (
      /*clientManager*/
      ctx[1]
    ) }
  });
  return {
    c() {
      section0 = element("section");
      h30 = element("h3");
      h30.textContent = "Controls";
      t1 = space();
      create_component(controls.$$.fragment);
      t2 = space();
      section1 = element("section");
      h31 = element("h3");
      h31.textContent = "Players";
      t4 = space();
      create_component(playerinfo.$$.fragment);
      t5 = space();
      section2 = element("section");
      h32 = element("h3");
      h32.textContent = "Moves";
      t7 = space();
      ul0 = element("ul");
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      t8 = space();
      section3 = element("section");
      h33 = element("h3");
      h33.textContent = "Events";
      t10 = space();
      ul1 = element("ul");
      if (if_block0) if_block0.c();
      t11 = space();
      if (if_block1) if_block1.c();
      t12 = space();
      if (if_block2) if_block2.c();
      t13 = space();
      section4 = element("section");
      h34 = element("h3");
      h34.textContent = "G";
      t15 = space();
      create_component(jsontree0.$$.fragment);
      t16 = space();
      section5 = element("section");
      h35 = element("h3");
      h35.textContent = "ctx";
      t18 = space();
      create_component(jsontree1.$$.fragment);
      t19 = space();
      create_component(clientswitcher.$$.fragment);
      attr(h30, "class", "svelte-146sq5f");
      attr(h31, "class", "svelte-146sq5f");
      attr(h32, "class", "svelte-146sq5f");
      attr(ul0, "class", "svelte-146sq5f");
      attr(h33, "class", "svelte-146sq5f");
      attr(ul1, "class", "svelte-146sq5f");
      attr(h34, "class", "label svelte-146sq5f");
      attr(section4, "class", "tree svelte-146sq5f");
      attr(h35, "class", "label svelte-146sq5f");
      attr(section5, "class", "tree svelte-146sq5f");
    },
    m(target, anchor) {
      insert(target, section0, anchor);
      append(section0, h30);
      append(section0, t1);
      mount_component(controls, section0, null);
      insert(target, t2, anchor);
      insert(target, section1, anchor);
      append(section1, h31);
      append(section1, t4);
      mount_component(playerinfo, section1, null);
      insert(target, t5, anchor);
      insert(target, section2, anchor);
      append(section2, h32);
      append(section2, t7);
      append(section2, ul0);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(ul0, null);
      }
      insert(target, t8, anchor);
      insert(target, section3, anchor);
      append(section3, h33);
      append(section3, t10);
      append(section3, ul1);
      if (if_block0) if_block0.m(ul1, null);
      append(ul1, t11);
      if (if_block1) if_block1.m(ul1, null);
      append(ul1, t12);
      if (if_block2) if_block2.m(ul1, null);
      insert(target, t13, anchor);
      insert(target, section4, anchor);
      append(section4, h34);
      append(section4, t15);
      mount_component(jsontree0, section4, null);
      insert(target, t16, anchor);
      insert(target, section5, anchor);
      append(section5, h35);
      append(section5, t18);
      mount_component(jsontree1, section5, null);
      insert(target, t19, anchor);
      mount_component(clientswitcher, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const controls_changes = {};
      if (dirty & /*client*/
      1) controls_changes.client = /*client*/
      ctx2[0];
      if (dirty & /*ToggleVisibility*/
      4) controls_changes.ToggleVisibility = /*ToggleVisibility*/
      ctx2[2];
      controls.$set(controls_changes);
      const playerinfo_changes = {};
      if (dirty & /*ctx*/
      64) playerinfo_changes.ctx = /*ctx*/
      ctx2[6];
      if (dirty & /*playerID*/
      8) playerinfo_changes.playerID = /*playerID*/
      ctx2[3];
      playerinfo.$set(playerinfo_changes);
      if (dirty & /*shortcuts, Object, moves*/
      272) {
        each_value = Object.entries(
          /*moves*/
          ctx2[4]
        );
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$5(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
            transition_in(each_blocks[i2], 1);
          } else {
            each_blocks[i2] = create_each_block$5(child_ctx);
            each_blocks[i2].c();
            transition_in(each_blocks[i2], 1);
            each_blocks[i2].m(ul0, null);
          }
        }
        group_outros();
        for (i2 = each_value.length; i2 < each_blocks.length; i2 += 1) {
          out(i2);
        }
        check_outros();
      }
      if (
        /*ctx*/
        ctx2[6].activePlayers && /*events*/
        ctx2[5].endStage
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & /*ctx, events*/
          96) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_2$2(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(ul1, t11);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (
        /*events*/
        ctx2[5].endTurn
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*events*/
          32) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_1$2(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(ul1, t12);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (
        /*ctx*/
        ctx2[6].phase && /*events*/
        ctx2[5].endPhase
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty & /*ctx, events*/
          96) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block$7(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(ul1, null);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      const jsontree0_changes = {};
      if (dirty & /*G*/
      128) jsontree0_changes.value = /*G*/
      ctx2[7];
      jsontree0.$set(jsontree0_changes);
      const jsontree1_changes = {};
      if (dirty & /*ctx*/
      64) jsontree1_changes.value = SanitizeCtx(
        /*ctx*/
        ctx2[6]
      );
      jsontree1.$set(jsontree1_changes);
      const clientswitcher_changes = {};
      if (dirty & /*clientManager*/
      2) clientswitcher_changes.clientManager = /*clientManager*/
      ctx2[1];
      clientswitcher.$set(clientswitcher_changes);
    },
    i(local) {
      if (current) return;
      transition_in(controls.$$.fragment, local);
      transition_in(playerinfo.$$.fragment, local);
      for (let i2 = 0; i2 < each_value.length; i2 += 1) {
        transition_in(each_blocks[i2]);
      }
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(if_block2);
      transition_in(jsontree0.$$.fragment, local);
      transition_in(jsontree1.$$.fragment, local);
      transition_in(clientswitcher.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(controls.$$.fragment, local);
      transition_out(playerinfo.$$.fragment, local);
      each_blocks = each_blocks.filter(Boolean);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        transition_out(each_blocks[i2]);
      }
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(if_block2);
      transition_out(jsontree0.$$.fragment, local);
      transition_out(jsontree1.$$.fragment, local);
      transition_out(clientswitcher.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(section0);
      destroy_component(controls);
      if (detaching) detach(t2);
      if (detaching) detach(section1);
      destroy_component(playerinfo);
      if (detaching) detach(t5);
      if (detaching) detach(section2);
      destroy_each(each_blocks, detaching);
      if (detaching) detach(t8);
      if (detaching) detach(section3);
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      if (detaching) detach(t13);
      if (detaching) detach(section4);
      destroy_component(jsontree0);
      if (detaching) detach(t16);
      if (detaching) detach(section5);
      destroy_component(jsontree1);
      if (detaching) detach(t19);
      destroy_component(clientswitcher, detaching);
    }
  };
}
function SanitizeCtx(ctx) {
  let r2 = {};
  for (const key in ctx) {
    if (!key.startsWith("_")) {
      r2[key] = ctx[key];
    }
  }
  return r2;
}
function instance$l($$self, $$props, $$invalidate) {
  let { client } = $$props;
  let { clientManager } = $$props;
  let { ToggleVisibility } = $$props;
  const shortcuts = AssignShortcuts(client.moves, "mlia");
  let { playerID, moves, events } = client;
  let ctx = {};
  let G2 = {};
  const unsubscribe = client.subscribe((state) => {
    if (state) $$invalidate(7, { G: G2, ctx } = state, G2, $$invalidate(6, ctx));
    $$invalidate(3, { playerID, moves, events } = client, playerID, $$invalidate(4, moves), $$invalidate(5, events));
  });
  onDestroy(unsubscribe);
  const change_handler = (e) => clientManager.switchPlayerID(e.detail.playerID);
  $$self.$$set = ($$props2) => {
    if ("client" in $$props2) $$invalidate(0, client = $$props2.client);
    if ("clientManager" in $$props2) $$invalidate(1, clientManager = $$props2.clientManager);
    if ("ToggleVisibility" in $$props2) $$invalidate(2, ToggleVisibility = $$props2.ToggleVisibility);
  };
  return [
    client,
    clientManager,
    ToggleVisibility,
    playerID,
    moves,
    events,
    ctx,
    G2,
    shortcuts,
    change_handler
  ];
}
var Main = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$l,
      create_fragment$l,
      safe_not_equal,
      {
        client: 0,
        clientManager: 1,
        ToggleVisibility: 2
      },
      add_css$e
    );
  }
};
function add_css$f(target) {
  append_styles(target, "svelte-13qih23", ".item.svelte-13qih23.svelte-13qih23{padding:10px}.item.svelte-13qih23.svelte-13qih23:not(:first-child){border-top:1px dashed #aaa}.item.svelte-13qih23 div.svelte-13qih23{float:right;text-align:right}");
}
function create_fragment$m(ctx) {
  let div1;
  let strong;
  let t0;
  let t1;
  let div0;
  let t2_value = JSON.stringify(
    /*value*/
    ctx[1]
  ) + "";
  let t2;
  return {
    c() {
      div1 = element("div");
      strong = element("strong");
      t0 = text(
        /*name*/
        ctx[0]
      );
      t1 = space();
      div0 = element("div");
      t2 = text(t2_value);
      attr(div0, "class", "svelte-13qih23");
      attr(div1, "class", "item svelte-13qih23");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, strong);
      append(strong, t0);
      append(div1, t1);
      append(div1, div0);
      append(div0, t2);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*name*/
      1) set_data(
        t0,
        /*name*/
        ctx2[0]
      );
      if (dirty & /*value*/
      2 && t2_value !== (t2_value = JSON.stringify(
        /*value*/
        ctx2[1]
      ) + "")) set_data(t2, t2_value);
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(div1);
    }
  };
}
function instance$m($$self, $$props, $$invalidate) {
  let { name } = $$props;
  let { value: value2 } = $$props;
  $$self.$$set = ($$props2) => {
    if ("name" in $$props2) $$invalidate(0, name = $$props2.name);
    if ("value" in $$props2) $$invalidate(1, value2 = $$props2.value);
  };
  return [name, value2];
}
var Item = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$m, create_fragment$m, safe_not_equal, { name: 0, value: 1 }, add_css$f);
  }
};
function add_css$g(target) {
  append_styles(target, "svelte-1yzq5o8", ".gameinfo.svelte-1yzq5o8{padding:10px}");
}
function create_if_block$8(ctx) {
  let item;
  let current;
  item = new Item({
    props: {
      name: "isConnected",
      value: (
        /*$client*/
        ctx[1].isConnected
      )
    }
  });
  return {
    c() {
      create_component(item.$$.fragment);
    },
    m(target, anchor) {
      mount_component(item, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const item_changes = {};
      if (dirty & /*$client*/
      2) item_changes.value = /*$client*/
      ctx2[1].isConnected;
      item.$set(item_changes);
    },
    i(local) {
      if (current) return;
      transition_in(item.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(item.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(item, detaching);
    }
  };
}
function create_fragment$n(ctx) {
  let section;
  let item0;
  let t0;
  let item1;
  let t1;
  let item2;
  let t2;
  let current;
  item0 = new Item({
    props: {
      name: "matchID",
      value: (
        /*client*/
        ctx[0].matchID
      )
    }
  });
  item1 = new Item({
    props: {
      name: "playerID",
      value: (
        /*client*/
        ctx[0].playerID
      )
    }
  });
  item2 = new Item({
    props: {
      name: "isActive",
      value: (
        /*$client*/
        ctx[1].isActive
      )
    }
  });
  let if_block = (
    /*client*/
    ctx[0].multiplayer && create_if_block$8(ctx)
  );
  return {
    c() {
      section = element("section");
      create_component(item0.$$.fragment);
      t0 = space();
      create_component(item1.$$.fragment);
      t1 = space();
      create_component(item2.$$.fragment);
      t2 = space();
      if (if_block) if_block.c();
      attr(section, "class", "gameinfo svelte-1yzq5o8");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      mount_component(item0, section, null);
      append(section, t0);
      mount_component(item1, section, null);
      append(section, t1);
      mount_component(item2, section, null);
      append(section, t2);
      if (if_block) if_block.m(section, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const item0_changes = {};
      if (dirty & /*client*/
      1) item0_changes.value = /*client*/
      ctx2[0].matchID;
      item0.$set(item0_changes);
      const item1_changes = {};
      if (dirty & /*client*/
      1) item1_changes.value = /*client*/
      ctx2[0].playerID;
      item1.$set(item1_changes);
      const item2_changes = {};
      if (dirty & /*$client*/
      2) item2_changes.value = /*$client*/
      ctx2[1].isActive;
      item2.$set(item2_changes);
      if (
        /*client*/
        ctx2[0].multiplayer
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*client*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$8(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(section, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(item0.$$.fragment, local);
      transition_in(item1.$$.fragment, local);
      transition_in(item2.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(item0.$$.fragment, local);
      transition_out(item1.$$.fragment, local);
      transition_out(item2.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(section);
      destroy_component(item0);
      destroy_component(item1);
      destroy_component(item2);
      if (if_block) if_block.d();
    }
  };
}
function instance$n($$self, $$props, $$invalidate) {
  let $client, $$unsubscribe_client = noop2, $$subscribe_client = () => ($$unsubscribe_client(), $$unsubscribe_client = subscribe(client, ($$value) => $$invalidate(1, $client = $$value)), client);
  $$self.$$.on_destroy.push(() => $$unsubscribe_client());
  let { client } = $$props;
  $$subscribe_client();
  let { clientManager } = $$props;
  let { ToggleVisibility } = $$props;
  $$self.$$set = ($$props2) => {
    if ("client" in $$props2) $$subscribe_client($$invalidate(0, client = $$props2.client));
    if ("clientManager" in $$props2) $$invalidate(2, clientManager = $$props2.clientManager);
    if ("ToggleVisibility" in $$props2) $$invalidate(3, ToggleVisibility = $$props2.ToggleVisibility);
  };
  return [client, $client, clientManager, ToggleVisibility];
}
var Info = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$n,
      create_fragment$n,
      safe_not_equal,
      {
        client: 0,
        clientManager: 2,
        ToggleVisibility: 3
      },
      add_css$g
    );
  }
};
function add_css$h(target) {
  append_styles(target, "svelte-6eza86", ".turn-marker.svelte-6eza86{display:flex;justify-content:center;align-items:center;grid-column:1;background:#555;color:#eee;text-align:center;font-weight:bold;border:1px solid #888}");
}
function create_fragment$o(ctx) {
  let div;
  let t2;
  return {
    c() {
      div = element("div");
      t2 = text(
        /*turn*/
        ctx[0]
      );
      attr(div, "class", "turn-marker svelte-6eza86");
      attr(
        div,
        "style",
        /*style*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t2);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*turn*/
      1) set_data(
        t2,
        /*turn*/
        ctx2[0]
      );
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(div);
    }
  };
}
function instance$o($$self, $$props, $$invalidate) {
  let { turn } = $$props;
  let { numEvents } = $$props;
  const style = `grid-row: span ${numEvents}`;
  $$self.$$set = ($$props2) => {
    if ("turn" in $$props2) $$invalidate(0, turn = $$props2.turn);
    if ("numEvents" in $$props2) $$invalidate(2, numEvents = $$props2.numEvents);
  };
  return [turn, style, numEvents];
}
var TurnMarker = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$o, create_fragment$o, safe_not_equal, { turn: 0, numEvents: 2 }, add_css$h);
  }
};
function add_css$i(target) {
  append_styles(target, "svelte-1t4xap", ".phase-marker.svelte-1t4xap{grid-column:3;background:#555;border:1px solid #888;color:#eee;text-align:center;font-weight:bold;padding-top:10px;padding-bottom:10px;text-orientation:sideways;writing-mode:vertical-rl;line-height:30px;width:100%}");
}
function create_fragment$p(ctx) {
  let div;
  let t_value = (
    /*phase*/
    (ctx[0] || "") + ""
  );
  let t2;
  return {
    c() {
      div = element("div");
      t2 = text(t_value);
      attr(div, "class", "phase-marker svelte-1t4xap");
      attr(
        div,
        "style",
        /*style*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t2);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*phase*/
      1 && t_value !== (t_value = /*phase*/
      (ctx2[0] || "") + "")) set_data(t2, t_value);
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(div);
    }
  };
}
function instance$p($$self, $$props, $$invalidate) {
  let { phase } = $$props;
  let { numEvents } = $$props;
  const style = `grid-row: span ${numEvents}`;
  $$self.$$set = ($$props2) => {
    if ("phase" in $$props2) $$invalidate(0, phase = $$props2.phase);
    if ("numEvents" in $$props2) $$invalidate(2, numEvents = $$props2.numEvents);
  };
  return [phase, style, numEvents];
}
var PhaseMarker = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$p, create_fragment$p, safe_not_equal, { phase: 0, numEvents: 2 }, add_css$i);
  }
};
function create_fragment$q(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${/*renderedMetadata*/
      ctx[0]}`;
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop2,
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(div);
    }
  };
}
function instance$q($$self, $$props, $$invalidate) {
  let { metadata } = $$props;
  const renderedMetadata = metadata !== void 0 ? JSON.stringify(metadata, null, 4) : "";
  $$self.$$set = ($$props2) => {
    if ("metadata" in $$props2) $$invalidate(1, metadata = $$props2.metadata);
  };
  return [renderedMetadata, metadata];
}
var LogMetadata = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$q, create_fragment$q, safe_not_equal, { metadata: 1 });
  }
};
function add_css$j(target) {
  append_styles(target, "svelte-vajd9z", ".log-event.svelte-vajd9z{grid-column:2;cursor:pointer;overflow:hidden;display:flex;flex-direction:column;justify-content:center;background:#fff;border:1px dotted #ccc;border-left:5px solid #ccc;padding:5px;text-align:center;color:#666;font-size:14px;min-height:25px;line-height:25px}.log-event.svelte-vajd9z:hover,.log-event.svelte-vajd9z:focus{border-style:solid;background:#eee}.log-event.pinned.svelte-vajd9z{border-style:solid;background:#eee;opacity:1}.args.svelte-vajd9z{text-align:left;white-space:pre-wrap}.player0.svelte-vajd9z{border-left-color:#ff851b}.player1.svelte-vajd9z{border-left-color:#7fdbff}.player2.svelte-vajd9z{border-left-color:#0074d9}.player3.svelte-vajd9z{border-left-color:#39cccc}.player4.svelte-vajd9z{border-left-color:#3d9970}.player5.svelte-vajd9z{border-left-color:#2ecc40}.player6.svelte-vajd9z{border-left-color:#01ff70}.player7.svelte-vajd9z{border-left-color:#ffdc00}.player8.svelte-vajd9z{border-left-color:#001f3f}.player9.svelte-vajd9z{border-left-color:#ff4136}.player10.svelte-vajd9z{border-left-color:#85144b}.player11.svelte-vajd9z{border-left-color:#f012be}.player12.svelte-vajd9z{border-left-color:#b10dc9}.player13.svelte-vajd9z{border-left-color:#111111}.player14.svelte-vajd9z{border-left-color:#aaaaaa}.player15.svelte-vajd9z{border-left-color:#dddddd}");
}
function create_else_block$1(ctx) {
  let logmetadata;
  let current;
  logmetadata = new LogMetadata({ props: { metadata: (
    /*metadata*/
    ctx[2]
  ) } });
  return {
    c() {
      create_component(logmetadata.$$.fragment);
    },
    m(target, anchor) {
      mount_component(logmetadata, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const logmetadata_changes = {};
      if (dirty & /*metadata*/
      4) logmetadata_changes.metadata = /*metadata*/
      ctx2[2];
      logmetadata.$set(logmetadata_changes);
    },
    i(local) {
      if (current) return;
      transition_in(logmetadata.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(logmetadata.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(logmetadata, detaching);
    }
  };
}
function create_if_block$9(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  var switch_value = (
    /*metadataComponent*/
    ctx[3]
  );
  function switch_props(ctx2) {
    return { props: { metadata: (
      /*metadata*/
      ctx2[2]
    ) } };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
  }
  return {
    c() {
      if (switch_instance) create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty2();
    },
    m(target, anchor) {
      if (switch_instance) {
        mount_component(switch_instance, target, anchor);
      }
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const switch_instance_changes = {};
      if (dirty & /*metadata*/
      4) switch_instance_changes.metadata = /*metadata*/
      ctx2[2];
      if (switch_value !== (switch_value = /*metadataComponent*/
      ctx2[3])) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current) return;
      if (switch_instance) transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance) transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(switch_instance_anchor);
      if (switch_instance) destroy_component(switch_instance, detaching);
    }
  };
}
function create_fragment$r(ctx) {
  let button;
  let div;
  let t0;
  let t1;
  let t2;
  let t3;
  let t4;
  let current_block_type_index;
  let if_block;
  let button_class_value;
  let current;
  let mounted;
  let dispose;
  const if_block_creators = [create_if_block$9, create_else_block$1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*metadataComponent*/
      ctx2[3]
    ) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      button = element("button");
      div = element("div");
      t0 = text(
        /*actionType*/
        ctx[4]
      );
      t1 = text("(");
      t2 = text(
        /*renderedArgs*/
        ctx[6]
      );
      t3 = text(")");
      t4 = space();
      if_block.c();
      attr(div, "class", "args svelte-vajd9z");
      attr(button, "class", button_class_value = "log-event player" + /*playerID*/
      ctx[7] + " svelte-vajd9z");
      toggle_class(
        button,
        "pinned",
        /*pinned*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, div);
      append(div, t0);
      append(div, t1);
      append(div, t2);
      append(div, t3);
      append(button, t4);
      if_blocks[current_block_type_index].m(button, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            button,
            "click",
            /*click_handler*/
            ctx[9]
          ),
          listen(
            button,
            "mouseenter",
            /*mouseenter_handler*/
            ctx[10]
          ),
          listen(
            button,
            "focus",
            /*focus_handler*/
            ctx[11]
          ),
          listen(
            button,
            "mouseleave",
            /*mouseleave_handler*/
            ctx[12]
          ),
          listen(
            button,
            "blur",
            /*blur_handler*/
            ctx[13]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (!current || dirty & /*actionType*/
      16) set_data(
        t0,
        /*actionType*/
        ctx2[4]
      );
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(button, null);
      }
      if (dirty & /*pinned*/
      2) {
        toggle_class(
          button,
          "pinned",
          /*pinned*/
          ctx2[1]
        );
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(button);
      if_blocks[current_block_type_index].d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$r($$self, $$props, $$invalidate) {
  let { logIndex } = $$props;
  let { action } = $$props;
  let { pinned } = $$props;
  let { metadata } = $$props;
  let { metadataComponent } = $$props;
  const dispatch2 = createEventDispatcher();
  const args = action.payload.args;
  const renderedArgs = Array.isArray(args) ? args.map((arg) => JSON.stringify(arg, null, 2)).join(",") : JSON.stringify(args, null, 2) || "";
  const playerID = action.payload.playerID;
  let actionType;
  switch (action.type) {
    case "UNDO":
      actionType = "undo";
      break;
    case "REDO":
      actionType = "redo";
    case "GAME_EVENT":
    case "MAKE_MOVE":
    default:
      actionType = action.payload.type;
      break;
  }
  const click_handler = () => dispatch2("click", { logIndex });
  const mouseenter_handler = () => dispatch2("mouseenter", { logIndex });
  const focus_handler = () => dispatch2("mouseenter", { logIndex });
  const mouseleave_handler = () => dispatch2("mouseleave");
  const blur_handler = () => dispatch2("mouseleave");
  $$self.$$set = ($$props2) => {
    if ("logIndex" in $$props2) $$invalidate(0, logIndex = $$props2.logIndex);
    if ("action" in $$props2) $$invalidate(8, action = $$props2.action);
    if ("pinned" in $$props2) $$invalidate(1, pinned = $$props2.pinned);
    if ("metadata" in $$props2) $$invalidate(2, metadata = $$props2.metadata);
    if ("metadataComponent" in $$props2) $$invalidate(3, metadataComponent = $$props2.metadataComponent);
  };
  return [
    logIndex,
    pinned,
    metadata,
    metadataComponent,
    actionType,
    dispatch2,
    renderedArgs,
    playerID,
    action,
    click_handler,
    mouseenter_handler,
    focus_handler,
    mouseleave_handler,
    blur_handler
  ];
}
var LogEvent = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$r,
      create_fragment$r,
      safe_not_equal,
      {
        logIndex: 0,
        action: 8,
        pinned: 1,
        metadata: 2,
        metadataComponent: 3
      },
      add_css$j
    );
  }
};
function create_default_slot$1(ctx) {
  let path;
  return {
    c() {
      path = svg_element("path");
      attr(path, "d", "M504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zM212 140v116h-70.9c-10.7 0-16.1 13-8.5 20.5l114.9 114.3c4.7 4.7 12.2 4.7 16.9 0l114.9-114.3c7.6-7.6 2.2-20.5-8.5-20.5H300V140c0-6.6-5.4-12-12-12h-64c-6.6 0-12 5.4-12 12z");
    },
    m(target, anchor) {
      insert(target, path, anchor);
    },
    p: noop2,
    d(detaching) {
      if (detaching) detach(path);
    }
  };
}
function create_fragment$s(ctx) {
  let iconbase;
  let current;
  const iconbase_spread_levels = [
    { viewBox: "0 0 512 512" },
    /*$$props*/
    ctx[0]
  ];
  let iconbase_props = {
    $$slots: { default: [create_default_slot$1] },
    $$scope: { ctx }
  };
  for (let i2 = 0; i2 < iconbase_spread_levels.length; i2 += 1) {
    iconbase_props = assign(iconbase_props, iconbase_spread_levels[i2]);
  }
  iconbase = new IconBase({ props: iconbase_props });
  return {
    c() {
      create_component(iconbase.$$.fragment);
    },
    m(target, anchor) {
      mount_component(iconbase, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const iconbase_changes = dirty & /*$$props*/
      1 ? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(
        /*$$props*/
        ctx2[0]
      )]) : {};
      if (dirty & /*$$scope*/
      2) {
        iconbase_changes.$$scope = { dirty, ctx: ctx2 };
      }
      iconbase.$set(iconbase_changes);
    },
    i(local) {
      if (current) return;
      transition_in(iconbase.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbase.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(iconbase, detaching);
    }
  };
}
function instance$s($$self, $$props, $$invalidate) {
  $$self.$$set = ($$new_props) => {
    $$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
  };
  $$props = exclude_internal_props($$props);
  return [$$props];
}
var FaArrowAltCircleDown = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$s, create_fragment$s, safe_not_equal, {});
  }
};
function add_css$k(target) {
  append_styles(target, "svelte-1a7time", "div.svelte-1a7time{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;max-width:500px}");
}
function create_fragment$t(ctx) {
  let div;
  let t2;
  return {
    c() {
      div = element("div");
      t2 = text(
        /*text*/
        ctx[0]
      );
      attr(
        div,
        "alt",
        /*text*/
        ctx[0]
      );
      attr(div, "class", "svelte-1a7time");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t2);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*text*/
      1) set_data(
        t2,
        /*text*/
        ctx2[0]
      );
      if (dirty & /*text*/
      1) {
        attr(
          div,
          "alt",
          /*text*/
          ctx2[0]
        );
      }
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(div);
    }
  };
}
function instance$t($$self, $$props, $$invalidate) {
  let { action } = $$props;
  let text2;
  $$self.$$set = ($$props2) => {
    if ("action" in $$props2) $$invalidate(1, action = $$props2.action);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*action*/
    2) {
      {
        const { type, args } = action.payload;
        const argsFormatted = (args || []).join(",");
        $$invalidate(0, text2 = `${type}(${argsFormatted})`);
      }
    }
  };
  return [text2, action];
}
var Action = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$t, create_fragment$t, safe_not_equal, { action: 1 }, add_css$k);
  }
};
function add_css$l(target) {
  append_styles(target, "svelte-ztcwsu", "table.svelte-ztcwsu.svelte-ztcwsu{font-size:12px;border-collapse:collapse;border:1px solid #ddd;padding:0}tr.svelte-ztcwsu.svelte-ztcwsu{cursor:pointer}tr.svelte-ztcwsu:hover td.svelte-ztcwsu{background:#eee}tr.selected.svelte-ztcwsu td.svelte-ztcwsu{background:#eee}td.svelte-ztcwsu.svelte-ztcwsu{padding:10px;height:10px;line-height:10px;font-size:12px;border:none}th.svelte-ztcwsu.svelte-ztcwsu{background:#888;color:#fff;padding:10px;text-align:center}");
}
function get_each_context$6(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i2];
  child_ctx[12] = i2;
  return child_ctx;
}
function create_each_block$6(ctx) {
  let tr;
  let td0;
  let t0_value = (
    /*child*/
    ctx[10].value + ""
  );
  let t0;
  let t1;
  let td1;
  let t2_value = (
    /*child*/
    ctx[10].visits + ""
  );
  let t2;
  let t3;
  let td2;
  let action;
  let t4;
  let current;
  let mounted;
  let dispose;
  action = new Action({
    props: { action: (
      /*child*/
      ctx[10].parentAction
    ) }
  });
  function click_handler() {
    return (
      /*click_handler*/
      ctx[6](
        /*child*/
        ctx[10],
        /*i*/
        ctx[12]
      )
    );
  }
  function mouseout_handler() {
    return (
      /*mouseout_handler*/
      ctx[7](
        /*i*/
        ctx[12]
      )
    );
  }
  function mouseover_handler() {
    return (
      /*mouseover_handler*/
      ctx[8](
        /*child*/
        ctx[10],
        /*i*/
        ctx[12]
      )
    );
  }
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      t0 = text(t0_value);
      t1 = space();
      td1 = element("td");
      t2 = text(t2_value);
      t3 = space();
      td2 = element("td");
      create_component(action.$$.fragment);
      t4 = space();
      attr(td0, "class", "svelte-ztcwsu");
      attr(td1, "class", "svelte-ztcwsu");
      attr(td2, "class", "svelte-ztcwsu");
      attr(tr, "class", "svelte-ztcwsu");
      toggle_class(
        tr,
        "clickable",
        /*children*/
        ctx[1].length > 0
      );
      toggle_class(
        tr,
        "selected",
        /*i*/
        ctx[12] === /*selectedIndex*/
        ctx[0]
      );
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, t0);
      append(tr, t1);
      append(tr, td1);
      append(td1, t2);
      append(tr, t3);
      append(tr, td2);
      mount_component(action, td2, null);
      append(tr, t4);
      current = true;
      if (!mounted) {
        dispose = [
          listen(tr, "click", click_handler),
          listen(tr, "mouseout", mouseout_handler),
          listen(tr, "mouseover", mouseover_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if ((!current || dirty & /*children*/
      2) && t0_value !== (t0_value = /*child*/
      ctx[10].value + "")) set_data(t0, t0_value);
      if ((!current || dirty & /*children*/
      2) && t2_value !== (t2_value = /*child*/
      ctx[10].visits + "")) set_data(t2, t2_value);
      const action_changes = {};
      if (dirty & /*children*/
      2) action_changes.action = /*child*/
      ctx[10].parentAction;
      action.$set(action_changes);
      if (dirty & /*children*/
      2) {
        toggle_class(
          tr,
          "clickable",
          /*children*/
          ctx[1].length > 0
        );
      }
      if (dirty & /*selectedIndex*/
      1) {
        toggle_class(
          tr,
          "selected",
          /*i*/
          ctx[12] === /*selectedIndex*/
          ctx[0]
        );
      }
    },
    i(local) {
      if (current) return;
      transition_in(action.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(action.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(tr);
      destroy_component(action);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment$u(ctx) {
  let table;
  let thead;
  let t5;
  let tbody;
  let current;
  let each_value = (
    /*children*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$6(get_each_context$6(ctx, each_value, i2));
  }
  const out = (i2) => transition_out(each_blocks[i2], 1, 1, () => {
    each_blocks[i2] = null;
  });
  return {
    c() {
      table = element("table");
      thead = element("thead");
      thead.innerHTML = `<th class="svelte-ztcwsu">Value</th> 
    <th class="svelte-ztcwsu">Visits</th> 
    <th class="svelte-ztcwsu">Action</th>`;
      t5 = space();
      tbody = element("tbody");
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      attr(table, "class", "svelte-ztcwsu");
    },
    m(target, anchor) {
      insert(target, table, anchor);
      append(table, thead);
      append(table, t5);
      append(table, tbody);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(tbody, null);
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*children, selectedIndex, Select, Preview*/
      15) {
        each_value = /*children*/
        ctx2[1];
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$6(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
            transition_in(each_blocks[i2], 1);
          } else {
            each_blocks[i2] = create_each_block$6(child_ctx);
            each_blocks[i2].c();
            transition_in(each_blocks[i2], 1);
            each_blocks[i2].m(tbody, null);
          }
        }
        group_outros();
        for (i2 = each_value.length; i2 < each_blocks.length; i2 += 1) {
          out(i2);
        }
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      for (let i2 = 0; i2 < each_value.length; i2 += 1) {
        transition_in(each_blocks[i2]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        transition_out(each_blocks[i2]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) detach(table);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$u($$self, $$props, $$invalidate) {
  let { root } = $$props;
  let { selectedIndex = null } = $$props;
  const dispatch2 = createEventDispatcher();
  let parents = [];
  let children2 = [];
  function Select(node, i2) {
    dispatch2("select", { node, selectedIndex: i2 });
  }
  function Preview(node, i2) {
    if (selectedIndex === null) {
      dispatch2("preview", { node });
    }
  }
  const click_handler = (child, i2) => Select(child, i2);
  const mouseout_handler = (i2) => Preview(null);
  const mouseover_handler = (child, i2) => Preview(child);
  $$self.$$set = ($$props2) => {
    if ("root" in $$props2) $$invalidate(4, root = $$props2.root);
    if ("selectedIndex" in $$props2) $$invalidate(0, selectedIndex = $$props2.selectedIndex);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*root, parents*/
    48) {
      {
        let t2 = root;
        $$invalidate(5, parents = []);
        while (t2.parent) {
          const parent = t2.parent;
          const { type, args } = t2.parentAction.payload;
          const argsFormatted = (args || []).join(",");
          const arrowText = `${type}(${argsFormatted})`;
          parents.push({ parent, arrowText });
          t2 = parent;
        }
        parents.reverse();
        $$invalidate(1, children2 = [...root.children].sort((a2, b2) => a2.visits < b2.visits ? 1 : -1).slice(0, 50));
      }
    }
  };
  return [
    selectedIndex,
    children2,
    Select,
    Preview,
    root,
    parents,
    click_handler,
    mouseout_handler,
    mouseover_handler
  ];
}
var Table = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$u, create_fragment$u, safe_not_equal, { root: 4, selectedIndex: 0 }, add_css$l);
  }
};
function add_css$m(target) {
  append_styles(target, "svelte-1f0amz4", ".visualizer.svelte-1f0amz4{display:flex;flex-direction:column;align-items:center;padding:50px}.preview.svelte-1f0amz4{opacity:0.5}.icon.svelte-1f0amz4{color:#777;width:32px;height:32px;margin-bottom:20px}");
}
function get_each_context$7(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i2].node;
  child_ctx[10] = list[i2].selectedIndex;
  child_ctx[12] = i2;
  return child_ctx;
}
function create_if_block_2$3(ctx) {
  let div;
  let arrow;
  let current;
  arrow = new FaArrowAltCircleDown({});
  return {
    c() {
      div = element("div");
      create_component(arrow.$$.fragment);
      attr(div, "class", "icon svelte-1f0amz4");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(arrow, div, null);
      current = true;
    },
    i(local) {
      if (current) return;
      transition_in(arrow.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(arrow.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(div);
      destroy_component(arrow);
    }
  };
}
function create_else_block$2(ctx) {
  let table;
  let current;
  function select_handler_1(...args) {
    return (
      /*select_handler_1*/
      ctx[7](
        /*i*/
        ctx[12],
        ...args
      )
    );
  }
  table = new Table({
    props: {
      root: (
        /*node*/
        ctx[9]
      ),
      selectedIndex: (
        /*selectedIndex*/
        ctx[10]
      )
    }
  });
  table.$on("select", select_handler_1);
  return {
    c() {
      create_component(table.$$.fragment);
    },
    m(target, anchor) {
      mount_component(table, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const table_changes = {};
      if (dirty & /*nodes*/
      1) table_changes.root = /*node*/
      ctx[9];
      if (dirty & /*nodes*/
      1) table_changes.selectedIndex = /*selectedIndex*/
      ctx[10];
      table.$set(table_changes);
    },
    i(local) {
      if (current) return;
      transition_in(table.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(table.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(table, detaching);
    }
  };
}
function create_if_block_1$3(ctx) {
  let table;
  let current;
  function select_handler(...args) {
    return (
      /*select_handler*/
      ctx[5](
        /*i*/
        ctx[12],
        ...args
      )
    );
  }
  function preview_handler(...args) {
    return (
      /*preview_handler*/
      ctx[6](
        /*i*/
        ctx[12],
        ...args
      )
    );
  }
  table = new Table({ props: { root: (
    /*node*/
    ctx[9]
  ) } });
  table.$on("select", select_handler);
  table.$on("preview", preview_handler);
  return {
    c() {
      create_component(table.$$.fragment);
    },
    m(target, anchor) {
      mount_component(table, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const table_changes = {};
      if (dirty & /*nodes*/
      1) table_changes.root = /*node*/
      ctx[9];
      table.$set(table_changes);
    },
    i(local) {
      if (current) return;
      transition_in(table.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(table.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(table, detaching);
    }
  };
}
function create_each_block$7(ctx) {
  let t2;
  let section;
  let current_block_type_index;
  let if_block1;
  let current;
  let if_block0 = (
    /*i*/
    ctx[12] !== 0 && create_if_block_2$3()
  );
  const if_block_creators = [create_if_block_1$3, create_else_block$2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*i*/
      ctx2[12] === /*nodes*/
      ctx2[0].length - 1
    ) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if (if_block0) if_block0.c();
      t2 = space();
      section = element("section");
      if_block1.c();
    },
    m(target, anchor) {
      if (if_block0) if_block0.m(target, anchor);
      insert(target, t2, anchor);
      insert(target, section, anchor);
      if_blocks[current_block_type_index].m(section, null);
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block1 = if_blocks[current_block_type_index];
        if (!if_block1) {
          if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block1.c();
        } else {
          if_block1.p(ctx2, dirty);
        }
        transition_in(if_block1, 1);
        if_block1.m(section, null);
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (if_block0) if_block0.d(detaching);
      if (detaching) detach(t2);
      if (detaching) detach(section);
      if_blocks[current_block_type_index].d();
    }
  };
}
function create_if_block$a(ctx) {
  let div;
  let arrow;
  let t2;
  let section;
  let table;
  let current;
  arrow = new FaArrowAltCircleDown({});
  table = new Table({ props: { root: (
    /*preview*/
    ctx[1]
  ) } });
  return {
    c() {
      div = element("div");
      create_component(arrow.$$.fragment);
      t2 = space();
      section = element("section");
      create_component(table.$$.fragment);
      attr(div, "class", "icon svelte-1f0amz4");
      attr(section, "class", "preview svelte-1f0amz4");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(arrow, div, null);
      insert(target, t2, anchor);
      insert(target, section, anchor);
      mount_component(table, section, null);
      current = true;
    },
    p(ctx2, dirty) {
      const table_changes = {};
      if (dirty & /*preview*/
      2) table_changes.root = /*preview*/
      ctx2[1];
      table.$set(table_changes);
    },
    i(local) {
      if (current) return;
      transition_in(arrow.$$.fragment, local);
      transition_in(table.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(arrow.$$.fragment, local);
      transition_out(table.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(div);
      destroy_component(arrow);
      if (detaching) detach(t2);
      if (detaching) detach(section);
      destroy_component(table);
    }
  };
}
function create_fragment$v(ctx) {
  let div;
  let t2;
  let current;
  let each_value = (
    /*nodes*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$7(get_each_context$7(ctx, each_value, i2));
  }
  const out = (i2) => transition_out(each_blocks[i2], 1, 1, () => {
    each_blocks[i2] = null;
  });
  let if_block = (
    /*preview*/
    ctx[1] && create_if_block$a(ctx)
  );
  return {
    c() {
      div = element("div");
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      t2 = space();
      if (if_block) if_block.c();
      attr(div, "class", "visualizer svelte-1f0amz4");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(div, null);
      }
      append(div, t2);
      if (if_block) if_block.m(div, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*nodes, SelectNode, PreviewNode*/
      13) {
        each_value = /*nodes*/
        ctx2[0];
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$7(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
            transition_in(each_blocks[i2], 1);
          } else {
            each_blocks[i2] = create_each_block$7(child_ctx);
            each_blocks[i2].c();
            transition_in(each_blocks[i2], 1);
            each_blocks[i2].m(div, t2);
          }
        }
        group_outros();
        for (i2 = each_value.length; i2 < each_blocks.length; i2 += 1) {
          out(i2);
        }
        check_outros();
      }
      if (
        /*preview*/
        ctx2[1]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*preview*/
          2) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$a(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      for (let i2 = 0; i2 < each_value.length; i2 += 1) {
        transition_in(each_blocks[i2]);
      }
      transition_in(if_block);
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        transition_out(each_blocks[i2]);
      }
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(div);
      destroy_each(each_blocks, detaching);
      if (if_block) if_block.d();
    }
  };
}
function instance$v($$self, $$props, $$invalidate) {
  let { metadata } = $$props;
  let nodes = [];
  let preview = null;
  function SelectNode({ node, selectedIndex }, i2) {
    $$invalidate(1, preview = null);
    $$invalidate(0, nodes[i2].selectedIndex = selectedIndex, nodes);
    $$invalidate(0, nodes = [...nodes.slice(0, i2 + 1), { node }]);
  }
  function PreviewNode({ node }, i2) {
    $$invalidate(1, preview = node);
  }
  const select_handler = (i2, e) => SelectNode(e.detail, i2);
  const preview_handler = (i2, e) => PreviewNode(e.detail);
  const select_handler_1 = (i2, e) => SelectNode(e.detail, i2);
  $$self.$$set = ($$props2) => {
    if ("metadata" in $$props2) $$invalidate(4, metadata = $$props2.metadata);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*metadata*/
    16) {
      {
        $$invalidate(0, nodes = [{ node: metadata }]);
      }
    }
  };
  return [
    nodes,
    preview,
    SelectNode,
    PreviewNode,
    metadata,
    select_handler,
    preview_handler,
    select_handler_1
  ];
}
var MCTS = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$v, create_fragment$v, safe_not_equal, { metadata: 4 }, add_css$m);
  }
};
function add_css$n(target) {
  append_styles(target, "svelte-1pq5e4b", ".gamelog.svelte-1pq5e4b{display:grid;grid-template-columns:30px 1fr 30px;grid-auto-rows:auto;grid-auto-flow:column}");
}
function get_each_context$8(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i2].phase;
  child_ctx[18] = i2;
  return child_ctx;
}
function get_each_context_1(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[19] = list[i2].action;
  child_ctx[20] = list[i2].metadata;
  child_ctx[18] = i2;
  return child_ctx;
}
function get_each_context_2(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[22] = list[i2].turn;
  child_ctx[18] = i2;
  return child_ctx;
}
function create_if_block_1$4(ctx) {
  let turnmarker;
  let current;
  turnmarker = new TurnMarker({
    props: {
      turn: (
        /*turn*/
        ctx[22]
      ),
      numEvents: (
        /*turnBoundaries*/
        ctx[3][
          /*i*/
          ctx[18]
        ]
      )
    }
  });
  return {
    c() {
      create_component(turnmarker.$$.fragment);
    },
    m(target, anchor) {
      mount_component(turnmarker, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const turnmarker_changes = {};
      if (dirty & /*renderedLogEntries*/
      2) turnmarker_changes.turn = /*turn*/
      ctx2[22];
      if (dirty & /*turnBoundaries*/
      8) turnmarker_changes.numEvents = /*turnBoundaries*/
      ctx2[3][
        /*i*/
        ctx2[18]
      ];
      turnmarker.$set(turnmarker_changes);
    },
    i(local) {
      if (current) return;
      transition_in(turnmarker.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(turnmarker.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(turnmarker, detaching);
    }
  };
}
function create_each_block_2(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*i*/
    ctx[18] in /*turnBoundaries*/
    ctx[3] && create_if_block_1$4(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty2();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*i*/
        ctx2[18] in /*turnBoundaries*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*turnBoundaries*/
          8) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1$4(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block) if_block.d(detaching);
      if (detaching) detach(if_block_anchor);
    }
  };
}
function create_each_block_1(ctx) {
  let logevent;
  let current;
  logevent = new LogEvent({
    props: {
      pinned: (
        /*i*/
        ctx[18] === /*pinned*/
        ctx[2]
      ),
      logIndex: (
        /*i*/
        ctx[18]
      ),
      action: (
        /*action*/
        ctx[19]
      ),
      metadata: (
        /*metadata*/
        ctx[20]
      )
    }
  });
  logevent.$on(
    "click",
    /*OnLogClick*/
    ctx[5]
  );
  logevent.$on(
    "mouseenter",
    /*OnMouseEnter*/
    ctx[6]
  );
  logevent.$on(
    "mouseleave",
    /*OnMouseLeave*/
    ctx[7]
  );
  return {
    c() {
      create_component(logevent.$$.fragment);
    },
    m(target, anchor) {
      mount_component(logevent, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const logevent_changes = {};
      if (dirty & /*pinned*/
      4) logevent_changes.pinned = /*i*/
      ctx2[18] === /*pinned*/
      ctx2[2];
      if (dirty & /*renderedLogEntries*/
      2) logevent_changes.action = /*action*/
      ctx2[19];
      if (dirty & /*renderedLogEntries*/
      2) logevent_changes.metadata = /*metadata*/
      ctx2[20];
      logevent.$set(logevent_changes);
    },
    i(local) {
      if (current) return;
      transition_in(logevent.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(logevent.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(logevent, detaching);
    }
  };
}
function create_if_block$b(ctx) {
  let phasemarker;
  let current;
  phasemarker = new PhaseMarker({
    props: {
      phase: (
        /*phase*/
        ctx[16]
      ),
      numEvents: (
        /*phaseBoundaries*/
        ctx[4][
          /*i*/
          ctx[18]
        ]
      )
    }
  });
  return {
    c() {
      create_component(phasemarker.$$.fragment);
    },
    m(target, anchor) {
      mount_component(phasemarker, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const phasemarker_changes = {};
      if (dirty & /*renderedLogEntries*/
      2) phasemarker_changes.phase = /*phase*/
      ctx2[16];
      if (dirty & /*phaseBoundaries*/
      16) phasemarker_changes.numEvents = /*phaseBoundaries*/
      ctx2[4][
        /*i*/
        ctx2[18]
      ];
      phasemarker.$set(phasemarker_changes);
    },
    i(local) {
      if (current) return;
      transition_in(phasemarker.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(phasemarker.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(phasemarker, detaching);
    }
  };
}
function create_each_block$8(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*i*/
    ctx[18] in /*phaseBoundaries*/
    ctx[4] && create_if_block$b(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty2();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*i*/
        ctx2[18] in /*phaseBoundaries*/
        ctx2[4]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*phaseBoundaries*/
          16) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$b(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block) if_block.d(detaching);
      if (detaching) detach(if_block_anchor);
    }
  };
}
function create_fragment$w(ctx) {
  let div;
  let t0;
  let t1;
  let current;
  let mounted;
  let dispose;
  let each_value_2 = (
    /*renderedLogEntries*/
    ctx[1]
  );
  let each_blocks_2 = [];
  for (let i2 = 0; i2 < each_value_2.length; i2 += 1) {
    each_blocks_2[i2] = create_each_block_2(get_each_context_2(ctx, each_value_2, i2));
  }
  const out = (i2) => transition_out(each_blocks_2[i2], 1, 1, () => {
    each_blocks_2[i2] = null;
  });
  let each_value_1 = (
    /*renderedLogEntries*/
    ctx[1]
  );
  let each_blocks_1 = [];
  for (let i2 = 0; i2 < each_value_1.length; i2 += 1) {
    each_blocks_1[i2] = create_each_block_1(get_each_context_1(ctx, each_value_1, i2));
  }
  const out_1 = (i2) => transition_out(each_blocks_1[i2], 1, 1, () => {
    each_blocks_1[i2] = null;
  });
  let each_value = (
    /*renderedLogEntries*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$8(get_each_context$8(ctx, each_value, i2));
  }
  const out_2 = (i2) => transition_out(each_blocks[i2], 1, 1, () => {
    each_blocks[i2] = null;
  });
  return {
    c() {
      div = element("div");
      for (let i2 = 0; i2 < each_blocks_2.length; i2 += 1) {
        each_blocks_2[i2].c();
      }
      t0 = space();
      for (let i2 = 0; i2 < each_blocks_1.length; i2 += 1) {
        each_blocks_1[i2].c();
      }
      t1 = space();
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      attr(div, "class", "gamelog svelte-1pq5e4b");
      toggle_class(
        div,
        "pinned",
        /*pinned*/
        ctx[2]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i2 = 0; i2 < each_blocks_2.length; i2 += 1) {
        each_blocks_2[i2].m(div, null);
      }
      append(div, t0);
      for (let i2 = 0; i2 < each_blocks_1.length; i2 += 1) {
        each_blocks_1[i2].m(div, null);
      }
      append(div, t1);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(div, null);
      }
      current = true;
      if (!mounted) {
        dispose = listen(
          window,
          "keydown",
          /*OnKeyDown*/
          ctx[8]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*renderedLogEntries, turnBoundaries*/
      10) {
        each_value_2 = /*renderedLogEntries*/
        ctx2[1];
        let i2;
        for (i2 = 0; i2 < each_value_2.length; i2 += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i2);
          if (each_blocks_2[i2]) {
            each_blocks_2[i2].p(child_ctx, dirty);
            transition_in(each_blocks_2[i2], 1);
          } else {
            each_blocks_2[i2] = create_each_block_2(child_ctx);
            each_blocks_2[i2].c();
            transition_in(each_blocks_2[i2], 1);
            each_blocks_2[i2].m(div, t0);
          }
        }
        group_outros();
        for (i2 = each_value_2.length; i2 < each_blocks_2.length; i2 += 1) {
          out(i2);
        }
        check_outros();
      }
      if (dirty & /*pinned, renderedLogEntries, OnLogClick, OnMouseEnter, OnMouseLeave*/
      230) {
        each_value_1 = /*renderedLogEntries*/
        ctx2[1];
        let i2;
        for (i2 = 0; i2 < each_value_1.length; i2 += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i2);
          if (each_blocks_1[i2]) {
            each_blocks_1[i2].p(child_ctx, dirty);
            transition_in(each_blocks_1[i2], 1);
          } else {
            each_blocks_1[i2] = create_each_block_1(child_ctx);
            each_blocks_1[i2].c();
            transition_in(each_blocks_1[i2], 1);
            each_blocks_1[i2].m(div, t1);
          }
        }
        group_outros();
        for (i2 = each_value_1.length; i2 < each_blocks_1.length; i2 += 1) {
          out_1(i2);
        }
        check_outros();
      }
      if (dirty & /*renderedLogEntries, phaseBoundaries*/
      18) {
        each_value = /*renderedLogEntries*/
        ctx2[1];
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$8(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
            transition_in(each_blocks[i2], 1);
          } else {
            each_blocks[i2] = create_each_block$8(child_ctx);
            each_blocks[i2].c();
            transition_in(each_blocks[i2], 1);
            each_blocks[i2].m(div, null);
          }
        }
        group_outros();
        for (i2 = each_value.length; i2 < each_blocks.length; i2 += 1) {
          out_2(i2);
        }
        check_outros();
      }
      if (dirty & /*pinned*/
      4) {
        toggle_class(
          div,
          "pinned",
          /*pinned*/
          ctx2[2]
        );
      }
    },
    i(local) {
      if (current) return;
      for (let i2 = 0; i2 < each_value_2.length; i2 += 1) {
        transition_in(each_blocks_2[i2]);
      }
      for (let i2 = 0; i2 < each_value_1.length; i2 += 1) {
        transition_in(each_blocks_1[i2]);
      }
      for (let i2 = 0; i2 < each_value.length; i2 += 1) {
        transition_in(each_blocks[i2]);
      }
      current = true;
    },
    o(local) {
      each_blocks_2 = each_blocks_2.filter(Boolean);
      for (let i2 = 0; i2 < each_blocks_2.length; i2 += 1) {
        transition_out(each_blocks_2[i2]);
      }
      each_blocks_1 = each_blocks_1.filter(Boolean);
      for (let i2 = 0; i2 < each_blocks_1.length; i2 += 1) {
        transition_out(each_blocks_1[i2]);
      }
      each_blocks = each_blocks.filter(Boolean);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        transition_out(each_blocks[i2]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) detach(div);
      destroy_each(each_blocks_2, detaching);
      destroy_each(each_blocks_1, detaching);
      destroy_each(each_blocks, detaching);
      mounted = false;
      dispose();
    }
  };
}
function instance$w($$self, $$props, $$invalidate) {
  let $client, $$unsubscribe_client = noop2, $$subscribe_client = () => ($$unsubscribe_client(), $$unsubscribe_client = subscribe(client, ($$value) => $$invalidate(10, $client = $$value)), client);
  $$self.$$.on_destroy.push(() => $$unsubscribe_client());
  let { client } = $$props;
  $$subscribe_client();
  const { secondaryPane } = getContext("secondaryPane");
  const reducer = CreateGameReducer({ game: client.game });
  const initialState = client.getInitialState();
  let { log } = $client;
  let pinned = null;
  function rewind(logIndex) {
    let state = initialState;
    for (let i2 = 0; i2 < log.length; i2++) {
      const { action, automatic } = log[i2];
      if (!automatic) {
        state = reducer(state, action);
        if (logIndex == 0) {
          break;
        }
        logIndex--;
      }
    }
    return {
      G: state.G,
      ctx: state.ctx,
      plugins: state.plugins
    };
  }
  function OnLogClick(e) {
    const { logIndex } = e.detail;
    const state = rewind(logIndex);
    const renderedLogEntries2 = log.filter((e2) => !e2.automatic);
    client.overrideGameState(state);
    if (pinned == logIndex) {
      $$invalidate(2, pinned = null);
      secondaryPane.set(null);
    } else {
      $$invalidate(2, pinned = logIndex);
      const { metadata } = renderedLogEntries2[logIndex].action.payload;
      if (metadata) {
        secondaryPane.set({ component: MCTS, metadata });
      }
    }
  }
  function OnMouseEnter(e) {
    const { logIndex } = e.detail;
    if (pinned === null) {
      const state = rewind(logIndex);
      client.overrideGameState(state);
    }
  }
  function OnMouseLeave() {
    if (pinned === null) {
      client.overrideGameState(null);
    }
  }
  function Reset() {
    $$invalidate(2, pinned = null);
    client.overrideGameState(null);
    secondaryPane.set(null);
  }
  onDestroy(Reset);
  function OnKeyDown(e) {
    if (e.keyCode == 27) {
      Reset();
    }
  }
  let renderedLogEntries;
  let turnBoundaries = {};
  let phaseBoundaries = {};
  $$self.$$set = ($$props2) => {
    if ("client" in $$props2) $$subscribe_client($$invalidate(0, client = $$props2.client));
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$client, log, renderedLogEntries*/
    1538) {
      {
        $$invalidate(9, log = $client.log);
        $$invalidate(1, renderedLogEntries = log.filter((e) => !e.automatic));
        let eventsInCurrentPhase = 0;
        let eventsInCurrentTurn = 0;
        $$invalidate(3, turnBoundaries = {});
        $$invalidate(4, phaseBoundaries = {});
        for (let i2 = 0; i2 < renderedLogEntries.length; i2++) {
          const { action, payload, turn, phase } = renderedLogEntries[i2];
          eventsInCurrentTurn++;
          eventsInCurrentPhase++;
          if (i2 == renderedLogEntries.length - 1 || renderedLogEntries[i2 + 1].turn != turn) {
            $$invalidate(3, turnBoundaries[i2] = eventsInCurrentTurn, turnBoundaries);
            eventsInCurrentTurn = 0;
          }
          if (i2 == renderedLogEntries.length - 1 || renderedLogEntries[i2 + 1].phase != phase) {
            $$invalidate(4, phaseBoundaries[i2] = eventsInCurrentPhase, phaseBoundaries);
            eventsInCurrentPhase = 0;
          }
        }
      }
    }
  };
  return [
    client,
    renderedLogEntries,
    pinned,
    turnBoundaries,
    phaseBoundaries,
    OnLogClick,
    OnMouseEnter,
    OnMouseLeave,
    OnKeyDown,
    log,
    $client
  ];
}
var Log = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$w, create_fragment$w, safe_not_equal, { client: 0 }, add_css$n);
  }
};
function add_css$o(target) {
  append_styles(target, "svelte-1fu900w", "label.svelte-1fu900w{color:#666}.option.svelte-1fu900w{margin-bottom:20px}.value.svelte-1fu900w{font-weight:bold;color:#000}input[type='checkbox'].svelte-1fu900w{vertical-align:middle}");
}
function get_each_context$9(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[6] = list[i2][0];
  child_ctx[7] = list[i2][1];
  child_ctx[8] = list;
  child_ctx[9] = i2;
  return child_ctx;
}
function create_if_block_1$5(ctx) {
  let input;
  let input_id_value;
  let mounted;
  let dispose;
  function input_change_handler() {
    ctx[5].call(
      input,
      /*key*/
      ctx[6]
    );
  }
  return {
    c() {
      input = element("input");
      attr(input, "id", input_id_value = /*makeID*/
      ctx[3](
        /*key*/
        ctx[6]
      ));
      attr(input, "type", "checkbox");
      attr(input, "class", "svelte-1fu900w");
    },
    m(target, anchor) {
      insert(target, input, anchor);
      input.checked = /*values*/
      ctx[1][
        /*key*/
        ctx[6]
      ];
      if (!mounted) {
        dispose = [
          listen(input, "change", input_change_handler),
          listen(
            input,
            "change",
            /*OnChange*/
            ctx[2]
          )
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*bot*/
      1 && input_id_value !== (input_id_value = /*makeID*/
      ctx[3](
        /*key*/
        ctx[6]
      ))) {
        attr(input, "id", input_id_value);
      }
      if (dirty & /*values, Object, bot*/
      3) {
        input.checked = /*values*/
        ctx[1][
          /*key*/
          ctx[6]
        ];
      }
    },
    d(detaching) {
      if (detaching) detach(input);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$c(ctx) {
  let span;
  let t0_value = (
    /*values*/
    ctx[1][
      /*key*/
      ctx[6]
    ] + ""
  );
  let t0;
  let t1;
  let input;
  let input_id_value;
  let input_min_value;
  let input_max_value;
  let mounted;
  let dispose;
  function input_change_input_handler() {
    ctx[4].call(
      input,
      /*key*/
      ctx[6]
    );
  }
  return {
    c() {
      span = element("span");
      t0 = text(t0_value);
      t1 = space();
      input = element("input");
      attr(span, "class", "value svelte-1fu900w");
      attr(input, "id", input_id_value = /*makeID*/
      ctx[3](
        /*key*/
        ctx[6]
      ));
      attr(input, "type", "range");
      attr(input, "min", input_min_value = /*value*/
      ctx[7].range.min);
      attr(input, "max", input_max_value = /*value*/
      ctx[7].range.max);
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      insert(target, t1, anchor);
      insert(target, input, anchor);
      set_input_value(
        input,
        /*values*/
        ctx[1][
          /*key*/
          ctx[6]
        ]
      );
      if (!mounted) {
        dispose = [
          listen(input, "change", input_change_input_handler),
          listen(input, "input", input_change_input_handler),
          listen(
            input,
            "change",
            /*OnChange*/
            ctx[2]
          )
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*values, bot*/
      3 && t0_value !== (t0_value = /*values*/
      ctx[1][
        /*key*/
        ctx[6]
      ] + "")) set_data(t0, t0_value);
      if (dirty & /*bot*/
      1 && input_id_value !== (input_id_value = /*makeID*/
      ctx[3](
        /*key*/
        ctx[6]
      ))) {
        attr(input, "id", input_id_value);
      }
      if (dirty & /*bot*/
      1 && input_min_value !== (input_min_value = /*value*/
      ctx[7].range.min)) {
        attr(input, "min", input_min_value);
      }
      if (dirty & /*bot*/
      1 && input_max_value !== (input_max_value = /*value*/
      ctx[7].range.max)) {
        attr(input, "max", input_max_value);
      }
      if (dirty & /*values, Object, bot*/
      3) {
        set_input_value(
          input,
          /*values*/
          ctx[1][
            /*key*/
            ctx[6]
          ]
        );
      }
    },
    d(detaching) {
      if (detaching) detach(span);
      if (detaching) detach(t1);
      if (detaching) detach(input);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block$9(ctx) {
  let div;
  let label;
  let t0_value = (
    /*key*/
    ctx[6] + ""
  );
  let t0;
  let label_for_value;
  let t1;
  let t2;
  function select_block_type(ctx2, dirty) {
    if (
      /*value*/
      ctx2[7].range
    ) return create_if_block$c;
    if (typeof /*value*/
    ctx2[7].value === "boolean") return create_if_block_1$5;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type && current_block_type(ctx);
  return {
    c() {
      div = element("div");
      label = element("label");
      t0 = text(t0_value);
      t1 = space();
      if (if_block) if_block.c();
      t2 = space();
      attr(label, "for", label_for_value = /*makeID*/
      ctx[3](
        /*key*/
        ctx[6]
      ));
      attr(label, "class", "svelte-1fu900w");
      attr(div, "class", "option svelte-1fu900w");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, label);
      append(label, t0);
      append(div, t1);
      if (if_block) if_block.m(div, null);
      append(div, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*bot*/
      1 && t0_value !== (t0_value = /*key*/
      ctx2[6] + "")) set_data(t0, t0_value);
      if (dirty & /*bot*/
      1 && label_for_value !== (label_for_value = /*makeID*/
      ctx2[3](
        /*key*/
        ctx2[6]
      ))) {
        attr(label, "for", label_for_value);
      }
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if (if_block) if_block.d(1);
        if_block = current_block_type && current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div, t2);
        }
      }
    },
    d(detaching) {
      if (detaching) detach(div);
      if (if_block) {
        if_block.d();
      }
    }
  };
}
function create_fragment$x(ctx) {
  let each_1_anchor;
  let each_value = Object.entries(
    /*bot*/
    ctx[0].opts()
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$9(get_each_context$9(ctx, each_value, i2));
  }
  return {
    c() {
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      each_1_anchor = empty2();
    },
    m(target, anchor) {
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(target, anchor);
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*makeID, Object, bot, values, OnChange*/
      15) {
        each_value = Object.entries(
          /*bot*/
          ctx2[0].opts()
        );
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$9(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
          } else {
            each_blocks[i2] = create_each_block$9(child_ctx);
            each_blocks[i2].c();
            each_blocks[i2].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i2 < each_blocks.length; i2 += 1) {
          each_blocks[i2].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop2,
    o: noop2,
    d(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching) detach(each_1_anchor);
    }
  };
}
function instance$x($$self, $$props, $$invalidate) {
  let { bot } = $$props;
  let values = {};
  for (let [key, value2] of Object.entries(bot.opts())) {
    values[key] = value2.value;
  }
  function OnChange() {
    for (let [key, value2] of Object.entries(values)) {
      bot.setOpt(key, value2);
    }
  }
  const makeID = (key) => "ai-option-" + key;
  function input_change_input_handler(key) {
    values[key] = to_number(this.value);
    $$invalidate(1, values);
  }
  function input_change_handler(key) {
    values[key] = this.checked;
    $$invalidate(1, values);
  }
  $$self.$$set = ($$props2) => {
    if ("bot" in $$props2) $$invalidate(0, bot = $$props2.bot);
  };
  return [
    bot,
    values,
    OnChange,
    makeID,
    input_change_input_handler,
    input_change_handler
  ];
}
var Options = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$x, create_fragment$x, safe_not_equal, { bot: 0 }, add_css$o);
  }
};
function add_css$p(target) {
  append_styles(target, "svelte-fn09gm", "ul.svelte-fn09gm{padding-left:0}li.svelte-fn09gm{list-style:none;margin:0;margin-bottom:5px}h3.svelte-fn09gm{text-transform:uppercase}label.svelte-fn09gm{color:#666}input[type='checkbox'].svelte-fn09gm{vertical-align:middle}");
}
function get_each_context$a(ctx, list, i2) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i2];
  return child_ctx;
}
function create_else_block$3(ctx) {
  let p0;
  let t1;
  let p1;
  return {
    c() {
      p0 = element("p");
      p0.textContent = "No bots available.";
      t1 = space();
      p1 = element("p");
      p1.innerHTML = `Follow the instructions
        <a href="https://boardgame.io/documentation/#/tutorial?id=bots" target="_blank">here</a>
        to set up bots.`;
    },
    m(target, anchor) {
      insert(target, p0, anchor);
      insert(target, t1, anchor);
      insert(target, p1, anchor);
    },
    p: noop2,
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(p0);
      if (detaching) detach(t1);
      if (detaching) detach(p1);
    }
  };
}
function create_if_block_5(ctx) {
  let p2;
  return {
    c() {
      p2 = element("p");
      p2.textContent = "The bot debugger is only available in singleplayer mode.";
    },
    m(target, anchor) {
      insert(target, p2, anchor);
    },
    p: noop2,
    i: noop2,
    o: noop2,
    d(detaching) {
      if (detaching) detach(p2);
    }
  };
}
function create_if_block$d(ctx) {
  let section0;
  let h30;
  let t1;
  let ul;
  let li0;
  let hotkey0;
  let t2;
  let li1;
  let hotkey1;
  let t3;
  let li2;
  let hotkey2;
  let t4;
  let section1;
  let h31;
  let t6;
  let select;
  let t7;
  let show_if = Object.keys(
    /*bot*/
    ctx[7].opts()
  ).length;
  let t8;
  let if_block1_anchor;
  let current;
  let mounted;
  let dispose;
  hotkey0 = new Hotkey({
    props: {
      value: "1",
      onPress: (
        /*Reset*/
        ctx[13]
      ),
      label: "reset"
    }
  });
  hotkey1 = new Hotkey({
    props: {
      value: "2",
      onPress: (
        /*Step*/
        ctx[11]
      ),
      label: "play"
    }
  });
  hotkey2 = new Hotkey({
    props: {
      value: "3",
      onPress: (
        /*Simulate*/
        ctx[12]
      ),
      label: "simulate"
    }
  });
  let each_value = Object.keys(
    /*bots*/
    ctx[8]
  );
  let each_blocks = [];
  for (let i2 = 0; i2 < each_value.length; i2 += 1) {
    each_blocks[i2] = create_each_block$a(get_each_context$a(ctx, each_value, i2));
  }
  let if_block0 = show_if && create_if_block_4(ctx);
  let if_block1 = (
    /*botAction*/
    (ctx[5] || /*iterationCounter*/
    ctx[3]) && create_if_block_1$6(ctx)
  );
  return {
    c() {
      section0 = element("section");
      h30 = element("h3");
      h30.textContent = "Controls";
      t1 = space();
      ul = element("ul");
      li0 = element("li");
      create_component(hotkey0.$$.fragment);
      t2 = space();
      li1 = element("li");
      create_component(hotkey1.$$.fragment);
      t3 = space();
      li2 = element("li");
      create_component(hotkey2.$$.fragment);
      t4 = space();
      section1 = element("section");
      h31 = element("h3");
      h31.textContent = "Bot";
      t6 = space();
      select = element("select");
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].c();
      }
      t7 = space();
      if (if_block0) if_block0.c();
      t8 = space();
      if (if_block1) if_block1.c();
      if_block1_anchor = empty2();
      attr(h30, "class", "svelte-fn09gm");
      attr(li0, "class", "svelte-fn09gm");
      attr(li1, "class", "svelte-fn09gm");
      attr(li2, "class", "svelte-fn09gm");
      attr(ul, "class", "svelte-fn09gm");
      attr(h31, "class", "svelte-fn09gm");
      if (
        /*selectedBot*/
        ctx[4] === void 0
      ) add_render_callback(() => (
        /*select_change_handler*/
        ctx[17].call(select)
      ));
    },
    m(target, anchor) {
      insert(target, section0, anchor);
      append(section0, h30);
      append(section0, t1);
      append(section0, ul);
      append(ul, li0);
      mount_component(hotkey0, li0, null);
      append(ul, t2);
      append(ul, li1);
      mount_component(hotkey1, li1, null);
      append(ul, t3);
      append(ul, li2);
      mount_component(hotkey2, li2, null);
      insert(target, t4, anchor);
      insert(target, section1, anchor);
      append(section1, h31);
      append(section1, t6);
      append(section1, select);
      for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
        each_blocks[i2].m(select, null);
      }
      select_option(
        select,
        /*selectedBot*/
        ctx[4]
      );
      insert(target, t7, anchor);
      if (if_block0) if_block0.m(target, anchor);
      insert(target, t8, anchor);
      if (if_block1) if_block1.m(target, anchor);
      insert(target, if_block1_anchor, anchor);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            select,
            "change",
            /*select_change_handler*/
            ctx[17]
          ),
          listen(
            select,
            "change",
            /*ChangeBot*/
            ctx[10]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*Object, bots*/
      256) {
        each_value = Object.keys(
          /*bots*/
          ctx2[8]
        );
        let i2;
        for (i2 = 0; i2 < each_value.length; i2 += 1) {
          const child_ctx = get_each_context$a(ctx2, each_value, i2);
          if (each_blocks[i2]) {
            each_blocks[i2].p(child_ctx, dirty);
          } else {
            each_blocks[i2] = create_each_block$a(child_ctx);
            each_blocks[i2].c();
            each_blocks[i2].m(select, null);
          }
        }
        for (; i2 < each_blocks.length; i2 += 1) {
          each_blocks[i2].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & /*selectedBot, Object, bots*/
      272) {
        select_option(
          select,
          /*selectedBot*/
          ctx2[4]
        );
      }
      if (dirty & /*bot*/
      128) show_if = Object.keys(
        /*bot*/
        ctx2[7].opts()
      ).length;
      if (show_if) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & /*bot*/
          128) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_4(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(t8.parentNode, t8);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (
        /*botAction*/
        ctx2[5] || /*iterationCounter*/
        ctx2[3]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_1$6(ctx2);
          if_block1.c();
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    i(local) {
      if (current) return;
      transition_in(hotkey0.$$.fragment, local);
      transition_in(hotkey1.$$.fragment, local);
      transition_in(hotkey2.$$.fragment, local);
      transition_in(if_block0);
      current = true;
    },
    o(local) {
      transition_out(hotkey0.$$.fragment, local);
      transition_out(hotkey1.$$.fragment, local);
      transition_out(hotkey2.$$.fragment, local);
      transition_out(if_block0);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(section0);
      destroy_component(hotkey0);
      destroy_component(hotkey1);
      destroy_component(hotkey2);
      if (detaching) detach(t4);
      if (detaching) detach(section1);
      destroy_each(each_blocks, detaching);
      if (detaching) detach(t7);
      if (if_block0) if_block0.d(detaching);
      if (detaching) detach(t8);
      if (if_block1) if_block1.d(detaching);
      if (detaching) detach(if_block1_anchor);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block$a(ctx) {
  let option;
  let t_value = (
    /*bot*/
    ctx[7] + ""
  );
  let t2;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t2 = text(t_value);
      option.__value = option_value_value = /*bot*/
      ctx[7];
      option.value = option.__value;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t2);
    },
    p: noop2,
    d(detaching) {
      if (detaching) detach(option);
    }
  };
}
function create_if_block_4(ctx) {
  let section;
  let h3;
  let t1;
  let label;
  let t3;
  let input;
  let t4;
  let options;
  let current;
  let mounted;
  let dispose;
  options = new Options({ props: { bot: (
    /*bot*/
    ctx[7]
  ) } });
  return {
    c() {
      section = element("section");
      h3 = element("h3");
      h3.textContent = "Options";
      t1 = space();
      label = element("label");
      label.textContent = "debug";
      t3 = space();
      input = element("input");
      t4 = space();
      create_component(options.$$.fragment);
      attr(h3, "class", "svelte-fn09gm");
      attr(label, "for", "ai-option-debug");
      attr(label, "class", "svelte-fn09gm");
      attr(input, "id", "ai-option-debug");
      attr(input, "type", "checkbox");
      attr(input, "class", "svelte-fn09gm");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, h3);
      append(section, t1);
      append(section, label);
      append(section, t3);
      append(section, input);
      input.checked = /*debug*/
      ctx[1];
      append(section, t4);
      mount_component(options, section, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            input,
            "change",
            /*input_change_handler*/
            ctx[18]
          ),
          listen(
            input,
            "change",
            /*OnDebug*/
            ctx[9]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*debug*/
      2) {
        input.checked = /*debug*/
        ctx2[1];
      }
      const options_changes = {};
      if (dirty & /*bot*/
      128) options_changes.bot = /*bot*/
      ctx2[7];
      options.$set(options_changes);
    },
    i(local) {
      if (current) return;
      transition_in(options.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(options.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(section);
      destroy_component(options);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_1$6(ctx) {
  let section;
  let h3;
  let t1;
  let t2;
  let if_block0 = (
    /*progress*/
    ctx[2] && /*progress*/
    ctx[2] < 1 && create_if_block_3$1(ctx)
  );
  let if_block1 = (
    /*botAction*/
    ctx[5] && create_if_block_2$4(ctx)
  );
  return {
    c() {
      section = element("section");
      h3 = element("h3");
      h3.textContent = "Result";
      t1 = space();
      if (if_block0) if_block0.c();
      t2 = space();
      if (if_block1) if_block1.c();
      attr(h3, "class", "svelte-fn09gm");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, h3);
      append(section, t1);
      if (if_block0) if_block0.m(section, null);
      append(section, t2);
      if (if_block1) if_block1.m(section, null);
    },
    p(ctx2, dirty) {
      if (
        /*progress*/
        ctx2[2] && /*progress*/
        ctx2[2] < 1
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_3$1(ctx2);
          if_block0.c();
          if_block0.m(section, t2);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*botAction*/
        ctx2[5]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_2$4(ctx2);
          if_block1.c();
          if_block1.m(section, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching) detach(section);
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_if_block_3$1(ctx) {
  let progress_1;
  return {
    c() {
      progress_1 = element("progress");
      progress_1.value = /*progress*/
      ctx[2];
    },
    m(target, anchor) {
      insert(target, progress_1, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*progress*/
      4) {
        progress_1.value = /*progress*/
        ctx2[2];
      }
    },
    d(detaching) {
      if (detaching) detach(progress_1);
    }
  };
}
function create_if_block_2$4(ctx) {
  let ul;
  let li0;
  let t0;
  let t1;
  let t2;
  let li1;
  let t3;
  let t4_value = JSON.stringify(
    /*botActionArgs*/
    ctx[6]
  ) + "";
  let t4;
  return {
    c() {
      ul = element("ul");
      li0 = element("li");
      t0 = text("Action: ");
      t1 = text(
        /*botAction*/
        ctx[5]
      );
      t2 = space();
      li1 = element("li");
      t3 = text("Args: ");
      t4 = text(t4_value);
      attr(li0, "class", "svelte-fn09gm");
      attr(li1, "class", "svelte-fn09gm");
      attr(ul, "class", "svelte-fn09gm");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      append(ul, li0);
      append(li0, t0);
      append(li0, t1);
      append(ul, t2);
      append(ul, li1);
      append(li1, t3);
      append(li1, t4);
    },
    p(ctx2, dirty) {
      if (dirty & /*botAction*/
      32) set_data(
        t1,
        /*botAction*/
        ctx2[5]
      );
      if (dirty & /*botActionArgs*/
      64 && t4_value !== (t4_value = JSON.stringify(
        /*botActionArgs*/
        ctx2[6]
      ) + "")) set_data(t4, t4_value);
    },
    d(detaching) {
      if (detaching) detach(ul);
    }
  };
}
function create_fragment$y(ctx) {
  let section;
  let current_block_type_index;
  let if_block;
  let current;
  let mounted;
  let dispose;
  const if_block_creators = [create_if_block$d, create_if_block_5, create_else_block$3];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*client*/
      ctx2[0].game.ai && !/*client*/
      ctx2[0].multiplayer
    ) return 0;
    if (
      /*client*/
      ctx2[0].multiplayer
    ) return 1;
    return 2;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      section = element("section");
      if_block.c();
    },
    m(target, anchor) {
      insert(target, section, anchor);
      if_blocks[current_block_type_index].m(section, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          window,
          "keydown",
          /*OnKeyDown*/
          ctx[14]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(section, null);
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(section);
      if_blocks[current_block_type_index].d();
      mounted = false;
      dispose();
    }
  };
}
function instance$y($$self, $$props, $$invalidate) {
  let { client } = $$props;
  let { clientManager } = $$props;
  let { ToggleVisibility } = $$props;
  const { secondaryPane } = getContext("secondaryPane");
  const bots = { "MCTS": MCTSBot, "Random": RandomBot };
  let debug12 = false;
  let progress = null;
  let iterationCounter = 0;
  let metadata = null;
  const iterationCallback = ({ iterationCounter: c2, numIterations, metadata: m }) => {
    $$invalidate(3, iterationCounter = c2);
    $$invalidate(2, progress = c2 / numIterations);
    metadata = m;
    if (debug12 && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    }
  };
  function OnDebug() {
    if (debug12 && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    } else {
      secondaryPane.set(null);
    }
  }
  let bot;
  if (client.game.ai) {
    bot = new MCTSBot({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback
    });
    bot.setOpt("async", true);
  }
  let selectedBot;
  let botAction;
  let botActionArgs;
  function ChangeBot() {
    const botConstructor = bots[selectedBot];
    $$invalidate(7, bot = new botConstructor({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback
    }));
    bot.setOpt("async", true);
    $$invalidate(5, botAction = null);
    metadata = null;
    secondaryPane.set(null);
    $$invalidate(3, iterationCounter = 0);
  }
  async function Step$1() {
    $$invalidate(5, botAction = null);
    metadata = null;
    $$invalidate(3, iterationCounter = 0);
    const t2 = await Step(client, bot);
    if (t2) {
      $$invalidate(5, botAction = t2.payload.type);
      $$invalidate(6, botActionArgs = t2.payload.args);
    }
  }
  function Simulate(iterations = 1e4, sleepTimeout = 100) {
    $$invalidate(5, botAction = null);
    metadata = null;
    $$invalidate(3, iterationCounter = 0);
    const step = async () => {
      for (let i2 = 0; i2 < iterations; i2++) {
        const action = await Step(client, bot);
        if (!action) break;
        await new Promise((resolve) => setTimeout(resolve, sleepTimeout));
      }
    };
    return step();
  }
  function Exit() {
    client.overrideGameState(null);
    secondaryPane.set(null);
    $$invalidate(1, debug12 = false);
  }
  function Reset() {
    client.reset();
    $$invalidate(5, botAction = null);
    metadata = null;
    $$invalidate(3, iterationCounter = 0);
    Exit();
  }
  function OnKeyDown(e) {
    if (e.keyCode == 27) {
      Exit();
    }
  }
  onDestroy(Exit);
  function select_change_handler() {
    selectedBot = select_value(this);
    $$invalidate(4, selectedBot);
    $$invalidate(8, bots);
  }
  function input_change_handler() {
    debug12 = this.checked;
    $$invalidate(1, debug12);
  }
  $$self.$$set = ($$props2) => {
    if ("client" in $$props2) $$invalidate(0, client = $$props2.client);
    if ("clientManager" in $$props2) $$invalidate(15, clientManager = $$props2.clientManager);
    if ("ToggleVisibility" in $$props2) $$invalidate(16, ToggleVisibility = $$props2.ToggleVisibility);
  };
  return [
    client,
    debug12,
    progress,
    iterationCounter,
    selectedBot,
    botAction,
    botActionArgs,
    bot,
    bots,
    OnDebug,
    ChangeBot,
    Step$1,
    Simulate,
    Reset,
    OnKeyDown,
    clientManager,
    ToggleVisibility,
    select_change_handler,
    input_change_handler
  ];
}
var AI = class extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$y,
      create_fragment$y,
      safe_not_equal,
      {
        client: 0,
        clientManager: 15,
        ToggleVisibility: 16
      },
      add_css$p
    );
  }
};
function add_css$q(target) {
  append_styles(target, "svelte-8ymctk", ".debug-panel.svelte-8ymctk.svelte-8ymctk{position:fixed;color:#555;font-family:monospace;right:0;top:0;height:100%;font-size:14px;opacity:0.9;z-index:99999}.panel.svelte-8ymctk.svelte-8ymctk{display:flex;position:relative;flex-direction:row;height:100%}.visibility-toggle.svelte-8ymctk.svelte-8ymctk{position:absolute;box-sizing:border-box;top:7px;border:1px solid #ccc;border-radius:5px;width:48px;height:48px;padding:8px;background:white;color:#555;box-shadow:0 0 5px rgba(0, 0, 0, 0.2)}.visibility-toggle.svelte-8ymctk.svelte-8ymctk:hover,.visibility-toggle.svelte-8ymctk.svelte-8ymctk:focus{background:#eee}.opener.svelte-8ymctk.svelte-8ymctk{right:10px}.closer.svelte-8ymctk.svelte-8ymctk{left:-326px}@keyframes svelte-8ymctk-rotateFromZero{from{transform:rotateZ(0deg)}to{transform:rotateZ(180deg)}}.icon.svelte-8ymctk.svelte-8ymctk{display:flex;height:100%;animation:svelte-8ymctk-rotateFromZero 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0s 1\n      normal forwards}.closer.svelte-8ymctk .icon.svelte-8ymctk{animation-direction:reverse}.pane.svelte-8ymctk.svelte-8ymctk{flex-grow:2;overflow-x:hidden;overflow-y:scroll;background:#fefefe;padding:20px;border-left:1px solid #ccc;box-shadow:-1px 0 5px rgba(0, 0, 0, 0.2);box-sizing:border-box;width:280px}.secondary-pane.svelte-8ymctk.svelte-8ymctk{background:#fefefe;overflow-y:scroll}.debug-panel.svelte-8ymctk button,.debug-panel.svelte-8ymctk select{cursor:pointer;font-size:14px;font-family:monospace}.debug-panel.svelte-8ymctk select{background:#eee;border:1px solid #bbb;color:#555;padding:3px;border-radius:3px}.debug-panel.svelte-8ymctk section{margin-bottom:20px}.debug-panel.svelte-8ymctk .screen-reader-only{clip:rect(0 0 0 0);clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}");
}
function create_else_block$4(ctx) {
  let div1;
  let t0;
  let menu;
  let t1;
  let div0;
  let switch_instance;
  let t2;
  let div1_transition;
  let current;
  let if_block0 = (
    /*showToggleButton*/
    ctx[10] && create_if_block_3$2(ctx)
  );
  menu = new Menu({
    props: {
      panes: (
        /*panes*/
        ctx[6]
      ),
      pane: (
        /*pane*/
        ctx[2]
      )
    }
  });
  menu.$on(
    "change",
    /*MenuChange*/
    ctx[8]
  );
  var switch_value = (
    /*panes*/
    ctx[6][
      /*pane*/
      ctx[2]
    ].component
  );
  function switch_props(ctx2) {
    return {
      props: {
        client: (
          /*client*/
          ctx2[4]
        ),
        clientManager: (
          /*clientManager*/
          ctx2[0]
        ),
        ToggleVisibility: (
          /*ToggleVisibility*/
          ctx2[9]
        )
      }
    };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
  }
  let if_block1 = (
    /*$secondaryPane*/
    ctx[5] && create_if_block_2$5(ctx)
  );
  return {
    c() {
      div1 = element("div");
      if (if_block0) if_block0.c();
      t0 = space();
      create_component(menu.$$.fragment);
      t1 = space();
      div0 = element("div");
      if (switch_instance) create_component(switch_instance.$$.fragment);
      t2 = space();
      if (if_block1) if_block1.c();
      attr(div0, "class", "pane svelte-8ymctk");
      attr(div0, "role", "region");
      attr(
        div0,
        "aria-label",
        /*pane*/
        ctx[2]
      );
      attr(div0, "tabindex", "-1");
      attr(div1, "class", "panel svelte-8ymctk");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      if (if_block0) if_block0.m(div1, null);
      append(div1, t0);
      mount_component(menu, div1, null);
      append(div1, t1);
      append(div1, div0);
      if (switch_instance) {
        mount_component(switch_instance, div0, null);
      }
      ctx[16](div0);
      append(div1, t2);
      if (if_block1) if_block1.m(div1, null);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (
        /*showToggleButton*/
        ctx[10]
      ) if_block0.p(ctx, dirty);
      const menu_changes = {};
      if (dirty & /*pane*/
      4) menu_changes.pane = /*pane*/
      ctx[2];
      menu.$set(menu_changes);
      const switch_instance_changes = {};
      if (dirty & /*client*/
      16) switch_instance_changes.client = /*client*/
      ctx[4];
      if (dirty & /*clientManager*/
      1) switch_instance_changes.clientManager = /*clientManager*/
      ctx[0];
      if (switch_value !== (switch_value = /*panes*/
      ctx[6][
        /*pane*/
        ctx[2]
      ].component)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, div0, null);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty & /*pane*/
      4) {
        attr(
          div0,
          "aria-label",
          /*pane*/
          ctx[2]
        );
      }
      if (
        /*$secondaryPane*/
        ctx[5]
      ) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
          if (dirty & /*$secondaryPane*/
          32) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_2$5(ctx);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div1, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block0);
      transition_in(menu.$$.fragment, local);
      if (switch_instance) transition_in(switch_instance.$$.fragment, local);
      transition_in(if_block1);
      add_render_callback(() => {
        if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 400, .../*transitionOpts*/
        ctx[12] }, true);
        div1_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(menu.$$.fragment, local);
      if (switch_instance) transition_out(switch_instance.$$.fragment, local);
      transition_out(if_block1);
      if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 400, .../*transitionOpts*/
      ctx[12] }, false);
      div1_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(div1);
      if (if_block0) if_block0.d();
      destroy_component(menu);
      if (switch_instance) destroy_component(switch_instance);
      ctx[16](null);
      if (if_block1) if_block1.d();
      if (detaching && div1_transition) div1_transition.end();
    }
  };
}
function create_if_block$e(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*showToggleButton*/
    ctx[10] && create_if_block_1$7(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty2();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*showToggleButton*/
        ctx2[10]
      ) if_block.p(ctx2, dirty);
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block) if_block.d(detaching);
      if (detaching) detach(if_block_anchor);
    }
  };
}
function create_if_block_3$2(ctx) {
  let button;
  let span;
  let chevron;
  let button_intro;
  let button_outro;
  let current;
  let mounted;
  let dispose;
  chevron = new FaChevronRight({});
  return {
    c() {
      button = element("button");
      span = element("span");
      create_component(chevron.$$.fragment);
      attr(span, "class", "icon svelte-8ymctk");
      attr(span, "aria-hidden", "true");
      attr(button, "class", "visibility-toggle closer svelte-8ymctk");
      attr(button, "title", "Hide Debug Panel");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, span);
      mount_component(chevron, span, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*ToggleVisibility*/
          ctx[9]
        );
        mounted = true;
      }
    },
    p: noop2,
    i(local) {
      if (current) return;
      transition_in(chevron.$$.fragment, local);
      add_render_callback(() => {
        if (button_outro) button_outro.end(1);
        button_intro = create_in_transition(
          button,
          /*receive*/
          ctx[14],
          { key: "toggle" }
        );
        button_intro.start();
      });
      current = true;
    },
    o(local) {
      transition_out(chevron.$$.fragment, local);
      if (button_intro) button_intro.invalidate();
      button_outro = create_out_transition(
        button,
        /*send*/
        ctx[13],
        { key: "toggle" }
      );
      current = false;
    },
    d(detaching) {
      if (detaching) detach(button);
      destroy_component(chevron);
      if (detaching && button_outro) button_outro.end();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_2$5(ctx) {
  let div;
  let switch_instance;
  let current;
  var switch_value = (
    /*$secondaryPane*/
    ctx[5].component
  );
  function switch_props(ctx2) {
    return {
      props: {
        metadata: (
          /*$secondaryPane*/
          ctx2[5].metadata
        )
      }
    };
  }
  if (switch_value) {
    switch_instance = new switch_value(switch_props(ctx));
  }
  return {
    c() {
      div = element("div");
      if (switch_instance) create_component(switch_instance.$$.fragment);
      attr(div, "class", "secondary-pane svelte-8ymctk");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (switch_instance) {
        mount_component(switch_instance, div, null);
      }
      current = true;
    },
    p(ctx2, dirty) {
      const switch_instance_changes = {};
      if (dirty & /*$secondaryPane*/
      32) switch_instance_changes.metadata = /*$secondaryPane*/
      ctx2[5].metadata;
      if (switch_value !== (switch_value = /*$secondaryPane*/
      ctx2[5].component)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = new switch_value(switch_props(ctx2));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, div, null);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        switch_instance.$set(switch_instance_changes);
      }
    },
    i(local) {
      if (current) return;
      if (switch_instance) transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance) transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(div);
      if (switch_instance) destroy_component(switch_instance);
    }
  };
}
function create_if_block_1$7(ctx) {
  let button;
  let span;
  let chevron;
  let button_intro;
  let button_outro;
  let current;
  let mounted;
  let dispose;
  chevron = new FaChevronRight({});
  return {
    c() {
      button = element("button");
      span = element("span");
      create_component(chevron.$$.fragment);
      attr(span, "class", "icon svelte-8ymctk");
      attr(span, "aria-hidden", "true");
      attr(button, "class", "visibility-toggle opener svelte-8ymctk");
      attr(button, "title", "Show Debug Panel");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, span);
      mount_component(chevron, span, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*ToggleVisibility*/
          ctx[9]
        );
        mounted = true;
      }
    },
    p: noop2,
    i(local) {
      if (current) return;
      transition_in(chevron.$$.fragment, local);
      add_render_callback(() => {
        if (button_outro) button_outro.end(1);
        button_intro = create_in_transition(
          button,
          /*receive*/
          ctx[14],
          { key: "toggle" }
        );
        button_intro.start();
      });
      current = true;
    },
    o(local) {
      transition_out(chevron.$$.fragment, local);
      if (button_intro) button_intro.invalidate();
      button_outro = create_out_transition(
        button,
        /*send*/
        ctx[13],
        { key: "toggle" }
      );
      current = false;
    },
    d(detaching) {
      if (detaching) detach(button);
      destroy_component(chevron);
      if (detaching && button_outro) button_outro.end();
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$z(ctx) {
  let section;
  let current_block_type_index;
  let if_block;
  let current;
  let mounted;
  let dispose;
  const if_block_creators = [create_if_block$e, create_else_block$4];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (!/*visible*/
    ctx2[3]) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      section = element("section");
      if_block.c();
      attr(section, "aria-label", "boardgame.io Debug Panel");
      attr(section, "class", "debug-panel svelte-8ymctk");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      if_blocks[current_block_type_index].m(section, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          window,
          "keypress",
          /*Keypress*/
          ctx[11]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(section, null);
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) detach(section);
      if_blocks[current_block_type_index].d();
      mounted = false;
      dispose();
    }
  };
}
function instance$z($$self, $$props, $$invalidate) {
  let client;
  let $clientManager, $$unsubscribe_clientManager = noop2, $$subscribe_clientManager = () => ($$unsubscribe_clientManager(), $$unsubscribe_clientManager = subscribe(clientManager, ($$value) => $$invalidate(15, $clientManager = $$value)), clientManager);
  let $secondaryPane;
  $$self.$$.on_destroy.push(() => $$unsubscribe_clientManager());
  let { clientManager } = $$props;
  $$subscribe_clientManager();
  const panes = {
    main: {
      label: "Main",
      shortcut: "m",
      component: Main
    },
    log: {
      label: "Log",
      shortcut: "l",
      component: Log
    },
    info: {
      label: "Info",
      shortcut: "i",
      component: Info
    },
    ai: {
      label: "AI",
      shortcut: "a",
      component: AI
    }
  };
  const disableHotkeys = writable(false);
  const secondaryPane = writable(null);
  component_subscribe($$self, secondaryPane, (value2) => $$invalidate(5, $secondaryPane = value2));
  setContext("hotkeys", { disableHotkeys });
  setContext("secondaryPane", { secondaryPane });
  let paneDiv;
  let pane = "main";
  function MenuChange(e) {
    $$invalidate(2, pane = e.detail);
    paneDiv.focus();
  }
  function ToggleVisibility() {
    $$invalidate(3, visible = !visible);
  }
  const debugOpt = $clientManager.client.debugOpt;
  let visible = !debugOpt || !debugOpt.collapseOnLoad;
  const showToggleButton = !debugOpt || !debugOpt.hideToggleButton;
  function Keypress(e) {
    if (e.key == ".") {
      ToggleVisibility();
      return;
    }
    if (!visible) return;
    Object.entries(panes).forEach(([key, { shortcut }]) => {
      if (e.key == shortcut) {
        $$invalidate(2, pane = key);
      }
    });
  }
  const transitionOpts = { duration: 150, easing: cubicOut };
  const [send, receive] = crossfade(transitionOpts);
  function div0_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      paneDiv = $$value;
      $$invalidate(1, paneDiv);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("clientManager" in $$props2) $$subscribe_clientManager($$invalidate(0, clientManager = $$props2.clientManager));
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$clientManager*/
    32768) {
      $$invalidate(4, client = $clientManager.client);
    }
  };
  return [
    clientManager,
    paneDiv,
    pane,
    visible,
    client,
    $secondaryPane,
    panes,
    secondaryPane,
    MenuChange,
    ToggleVisibility,
    showToggleButton,
    Keypress,
    transitionOpts,
    send,
    receive,
    $clientManager,
    div0_binding
  ];
}
var Debug = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$z, create_fragment$z, safe_not_equal, { clientManager: 0 }, add_css$q);
  }
};

// node_modules/boardgame.io/dist/esm/client.js
var import_lodash4 = __toESM(require_lodash());
var import_rfc69024 = __toESM(require_rfc6902());

// node_modules/boardgame.io/dist/esm/client-f7f02b82.js
var import_redux2 = __toESM(require_redux());
var DummyImpl = class extends Transport {
  connect() {
  }
  disconnect() {
  }
  sendAction() {
  }
  sendChatMessage() {
  }
  requestSync() {
  }
  updateCredentials() {
  }
  updateMatchID() {
  }
  updatePlayerID() {
  }
};
var DummyTransport = (opts) => new DummyImpl(opts);
var ClientManager = class {
  constructor() {
    this.debugPanel = null;
    this.currentClient = null;
    this.clients = /* @__PURE__ */ new Map();
    this.subscribers = /* @__PURE__ */ new Map();
  }
  /**
   * Register a client with the client manager.
   */
  register(client) {
    this.clients.set(client, client);
    this.mountDebug(client);
    this.notifySubscribers();
  }
  /**
   * Unregister a client from the client manager.
   */
  unregister(client) {
    this.clients.delete(client);
    if (this.currentClient === client) {
      this.unmountDebug();
      for (const [client2] of this.clients) {
        if (this.debugPanel)
          break;
        this.mountDebug(client2);
      }
    }
    this.notifySubscribers();
  }
  /**
   * Subscribe to the client manager state.
   * Calls the passed callback each time the current client changes or a client
   * registers/unregisters.
   * Returns a function to unsubscribe from the state updates.
   */
  subscribe(callback) {
    const id = Symbol();
    this.subscribers.set(id, callback);
    callback(this.getState());
    return () => {
      this.subscribers.delete(id);
    };
  }
  /**
   * Switch to a client with a matching playerID.
   */
  switchPlayerID(playerID) {
    if (this.currentClient.multiplayer) {
      for (const [client] of this.clients) {
        if (client.playerID === playerID && client.debugOpt !== false && client.multiplayer === this.currentClient.multiplayer) {
          this.switchToClient(client);
          return;
        }
      }
    }
    this.currentClient.updatePlayerID(playerID);
    this.notifySubscribers();
  }
  /**
   * Set the passed client as the active client for debugging.
   */
  switchToClient(client) {
    if (client === this.currentClient)
      return;
    this.unmountDebug();
    this.mountDebug(client);
    this.notifySubscribers();
  }
  /**
   * Notify all subscribers of changes to the client manager state.
   */
  notifySubscribers() {
    const arg = this.getState();
    this.subscribers.forEach((cb) => {
      cb(arg);
    });
  }
  /**
   * Get the client manager state.
   */
  getState() {
    return {
      client: this.currentClient,
      debuggableClients: this.getDebuggableClients()
    };
  }
  /**
   * Get an array of the registered clients that haven’t disabled the debug panel.
   */
  getDebuggableClients() {
    return [...this.clients.values()].filter((client) => client.debugOpt !== false);
  }
  /**
   * Mount the debug panel using the passed client.
   */
  mountDebug(client) {
    if (client.debugOpt === false || this.debugPanel !== null || typeof document === "undefined") {
      return;
    }
    let DebugImpl;
    let target = document.body;
    if (process.env.NODE_ENV !== "production") {
      DebugImpl = Debug;
    }
    if (client.debugOpt && client.debugOpt !== true) {
      DebugImpl = client.debugOpt.impl || DebugImpl;
      target = client.debugOpt.target || target;
    }
    if (DebugImpl) {
      this.currentClient = client;
      this.debugPanel = new DebugImpl({
        target,
        props: { clientManager: this }
      });
    }
  }
  /**
   * Unmount the debug panel.
   */
  unmountDebug() {
    this.debugPanel.$destroy();
    this.debugPanel = null;
    this.currentClient = null;
  }
};
var GlobalClientManager = new ClientManager();
function assumedPlayerID(playerID, store, multiplayer) {
  if (!multiplayer && (playerID === null || playerID === void 0)) {
    const state = store.getState();
    playerID = state.ctx.currentPlayer;
  }
  return playerID;
}
function createDispatchers(storeActionType, innerActionNames, store, playerID, credentials, multiplayer) {
  const dispatchers = {};
  for (const name of innerActionNames) {
    dispatchers[name] = (...args) => {
      const action = ActionCreators[storeActionType](name, args, assumedPlayerID(playerID, store, multiplayer), credentials);
      store.dispatch(action);
    };
  }
  return dispatchers;
}
var createMoveDispatchers = createDispatchers.bind(null, "makeMove");
var createEventDispatchers = createDispatchers.bind(null, "gameEvent");
var createPluginDispatchers = createDispatchers.bind(null, "plugin");
var _ClientImpl = class {
  constructor({ game, debug: debug12, numPlayers, multiplayer, matchID, playerID, credentials, enhancer }) {
    this.game = ProcessGameConfig(game);
    this.playerID = playerID;
    this.matchID = matchID || "default";
    this.credentials = credentials;
    this.multiplayer = multiplayer;
    this.debugOpt = debug12;
    this.manager = GlobalClientManager;
    this.gameStateOverride = null;
    this.subscribers = {};
    this._running = false;
    this.reducer = CreateGameReducer({
      game: this.game,
      isClient: multiplayer !== void 0
    });
    this.initialState = null;
    if (!multiplayer) {
      this.initialState = InitializeGame({ game: this.game, numPlayers });
    }
    this.reset = () => {
      this.store.dispatch(reset(this.initialState));
    };
    this.undo = () => {
      const undo$1 = undo(assumedPlayerID(this.playerID, this.store, this.multiplayer), this.credentials);
      this.store.dispatch(undo$1);
    };
    this.redo = () => {
      const redo$1 = redo(assumedPlayerID(this.playerID, this.store, this.multiplayer), this.credentials);
      this.store.dispatch(redo$1);
    };
    this.log = [];
    const LogMiddleware = (store) => (next) => (action) => {
      const result = next(action);
      const state = store.getState();
      switch (action.type) {
        case MAKE_MOVE:
        case GAME_EVENT:
        case UNDO:
        case REDO: {
          const deltalog = state.deltalog;
          this.log = [...this.log, ...deltalog];
          break;
        }
        case RESET: {
          this.log = [];
          break;
        }
        case PATCH:
        case UPDATE: {
          let id = -1;
          if (this.log.length > 0) {
            id = this.log[this.log.length - 1]._stateID;
          }
          let deltalog = action.deltalog || [];
          deltalog = deltalog.filter((l2) => l2._stateID > id);
          this.log = [...this.log, ...deltalog];
          break;
        }
        case SYNC: {
          this.initialState = action.initialState;
          this.log = action.log || [];
          break;
        }
      }
      return result;
    };
    const TransportMiddleware = (store) => (next) => (action) => {
      const baseState = store.getState();
      const result = next(action);
      if (!("clientOnly" in action) && action.type !== STRIP_TRANSIENTS) {
        this.transport.sendAction(baseState, action);
      }
      return result;
    };
    const SubscriptionMiddleware = () => (next) => (action) => {
      const result = next(action);
      this.notifySubscribers();
      return result;
    };
    const middleware = (0, import_redux2.applyMiddleware)(TransientHandlingMiddleware, SubscriptionMiddleware, TransportMiddleware, LogMiddleware);
    enhancer = enhancer !== void 0 ? (0, import_redux2.compose)(middleware, enhancer) : middleware;
    this.store = (0, import_redux2.createStore)(this.reducer, this.initialState, enhancer);
    if (!multiplayer)
      multiplayer = DummyTransport;
    this.transport = multiplayer({
      transportDataCallback: (data) => this.receiveTransportData(data),
      gameKey: game,
      game: this.game,
      matchID,
      playerID,
      credentials,
      gameName: this.game.name,
      numPlayers
    });
    this.createDispatchers();
    this.chatMessages = [];
    this.sendChatMessage = (payload) => {
      this.transport.sendChatMessage(this.matchID, {
        id: nanoid(7),
        sender: this.playerID,
        payload
      });
    };
  }
  /** Handle incoming match data from a multiplayer transport. */
  receiveMatchData(matchData) {
    this.matchData = matchData;
    this.notifySubscribers();
  }
  /** Handle an incoming chat message from a multiplayer transport. */
  receiveChatMessage(message) {
    this.chatMessages = [...this.chatMessages, message];
    this.notifySubscribers();
  }
  /** Handle all incoming updates from a multiplayer transport. */
  receiveTransportData(data) {
    const [matchID] = data.args;
    if (matchID !== this.matchID)
      return;
    switch (data.type) {
      case "sync": {
        const [, syncInfo] = data.args;
        const action = sync(syncInfo);
        this.receiveMatchData(syncInfo.filteredMetadata);
        this.store.dispatch(action);
        break;
      }
      case "update": {
        const [, state, deltalog] = data.args;
        const currentState = this.store.getState();
        if (state._stateID >= currentState._stateID) {
          const action = update(state, deltalog);
          this.store.dispatch(action);
        }
        break;
      }
      case "patch": {
        const [, prevStateID, stateID, patch$1, deltalog] = data.args;
        const currentStateID = this.store.getState()._stateID;
        if (prevStateID !== currentStateID)
          break;
        const action = patch(prevStateID, stateID, patch$1, deltalog);
        this.store.dispatch(action);
        if (this.store.getState()._stateID === currentStateID) {
          this.transport.requestSync();
        }
        break;
      }
      case "matchData": {
        const [, matchData] = data.args;
        this.receiveMatchData(matchData);
        break;
      }
      case "chat": {
        const [, chatMessage] = data.args;
        this.receiveChatMessage(chatMessage);
        break;
      }
    }
  }
  notifySubscribers() {
    Object.values(this.subscribers).forEach((fn2) => fn2(this.getState()));
  }
  overrideGameState(state) {
    this.gameStateOverride = state;
    this.notifySubscribers();
  }
  start() {
    this.transport.connect();
    this._running = true;
    this.manager.register(this);
  }
  stop() {
    this.transport.disconnect();
    this._running = false;
    this.manager.unregister(this);
  }
  subscribe(fn2) {
    const id = Object.keys(this.subscribers).length;
    this.subscribers[id] = fn2;
    this.transport.subscribeToConnectionStatus(() => this.notifySubscribers());
    if (this._running || !this.multiplayer) {
      fn2(this.getState());
    }
    return () => {
      delete this.subscribers[id];
    };
  }
  getInitialState() {
    return this.initialState;
  }
  getState() {
    let state = this.store.getState();
    if (this.gameStateOverride !== null) {
      state = this.gameStateOverride;
    }
    if (state === null) {
      return state;
    }
    let isActive = true;
    const isPlayerActive = this.game.flow.isPlayerActive(state.G, state.ctx, this.playerID);
    if (this.multiplayer && !isPlayerActive) {
      isActive = false;
    }
    if (!this.multiplayer && this.playerID !== null && this.playerID !== void 0 && !isPlayerActive) {
      isActive = false;
    }
    if (state.ctx.gameover !== void 0) {
      isActive = false;
    }
    if (!this.multiplayer) {
      state = {
        ...state,
        G: this.game.playerView({
          G: state.G,
          ctx: state.ctx,
          playerID: this.playerID
        }),
        plugins: PlayerView(state, this)
      };
    }
    return {
      ...state,
      log: this.log,
      isActive,
      isConnected: this.transport.isConnected
    };
  }
  createDispatchers() {
    this.moves = createMoveDispatchers(this.game.moveNames, this.store, this.playerID, this.credentials, this.multiplayer);
    this.events = createEventDispatchers(this.game.flow.enabledEventNames, this.store, this.playerID, this.credentials, this.multiplayer);
    this.plugins = createPluginDispatchers(this.game.pluginNames, this.store, this.playerID, this.credentials, this.multiplayer);
  }
  updatePlayerID(playerID) {
    this.playerID = playerID;
    this.createDispatchers();
    this.transport.updatePlayerID(playerID);
    this.notifySubscribers();
  }
  updateMatchID(matchID) {
    this.matchID = matchID;
    this.createDispatchers();
    this.transport.updateMatchID(matchID);
    this.notifySubscribers();
  }
  updateCredentials(credentials) {
    this.credentials = credentials;
    this.createDispatchers();
    this.transport.updateCredentials(credentials);
    this.notifySubscribers();
  }
};
function Client(opts) {
  return new _ClientImpl(opts);
}

// node_modules/boardgame.io/dist/esm/client.js
var import_setimmediate2 = __toESM(require_setImmediate());

// src/ai/observation.js
var STANDARD_TILE_IDS = Object.freeze(
  Object.keys(TILES).filter((id) => id !== "BLANK").sort()
);
function createBotMemory() {
  return {
    lastPhase: null,
    knownBanked: {},
    // { [tileId]: ownerId } remembered as banked this campaign
    knownHands: {},
    // { [tileId]: ownerId } carried over from previous campaign's banks
    seenEvents: /* @__PURE__ */ new Set()
  };
}
function updateBotMemory(memory, G2, ctx, botId, persona = null, rng = Math.random) {
  if (!memory || !G2) return memory;
  const pId = String(botId);
  const phase = ctx?.phase || null;
  const recall = persona?.memoryRecall ?? 0.8;
  const remember = (eventKey, targetMap, tileId, ownerId) => {
    if (!tileId || tileId === "HIDDEN" || tileId === "BLANK") return;
    if (ownerId === void 0 || ownerId === null) return;
    if (memory.seenEvents.has(eventKey)) return;
    memory.seenEvents.add(eventKey);
    if (recall > 0 && (recall >= 1 || rng() <= recall)) {
      targetMap[tileId] = String(ownerId);
    }
  };
  if (phase === "draft" && memory.lastPhase !== "draft") {
    memory.knownBanked = {};
    memory.knownHands = {};
    memory.seenEvents.clear();
  } else if (memory.lastPhase === "bureaucracy" && phase === "campaign") {
    const nextHands = {};
    for (const [tileId, ownerId] of Object.entries(memory.knownBanked)) {
      if (ownerId !== pId && recall > 0 && (recall >= 1 || rng() <= recall)) {
        nextHands[tileId] = ownerId;
      }
    }
    memory.knownHands = nextHands;
    memory.knownBanked = {};
    memory.seenEvents.clear();
  }
  memory.lastPhase = phase;
  const pp = G2.pendingPlay;
  if (pp && String(pp.moverId) === pId && pp.tileIdPlayed && pp.tileIdPlayed !== "HIDDEN") {
    const recId = String(pp.receiverId);
    if (recId !== pId) {
      const bankLen = G2.players?.[recId]?.bank?.length ?? 0;
      remember(`pass:${pp.tileIdPlayed}:${recId}:${bankLen}`, memory.knownBanked, pp.tileIdPlayed, recId);
      delete memory.knownHands[pp.tileIdPlayed];
    }
  }
  const notice = G2.lastOutcomeNotice;
  if (notice && (notice.type === "challengeFailed" || notice.type === "challengeSuccess") && notice.tileIdPlayed && notice.tileIdPlayed !== "HIDDEN") {
    const recId = String(notice.receiverId);
    if (recId !== pId) {
      const bankLen = G2.players?.[recId]?.bank?.length ?? 0;
      remember(
        `reveal:${notice.type}:${notice.tileIdPlayed}:${notice.moverId}:${recId}:${bankLen}`,
        memory.knownBanked,
        notice.tileIdPlayed,
        recId
      );
      delete memory.knownHands[notice.tileIdPlayed];
    }
  }
  Object.keys(G2.players || {}).forEach((id) => {
    const p2 = G2.players[id] || {};
    const bank = Array.isArray(p2.bank) ? p2.bank : [];
    if (id === pId) {
      for (const tid of p2.hand || []) {
        delete memory.knownHands[tid];
        delete memory.knownBanked[tid];
      }
      for (const item of bank) {
        if (item?.tileId) {
          delete memory.knownHands[item.tileId];
          delete memory.knownBanked[item.tileId];
        }
      }
      return;
    }
    for (const item of bank) {
      if (!item.faceDown && item.tileId && item.tileId !== "HIDDEN") {
        remember(`faceup:${item.tileId}:${id}`, memory.knownBanked, item.tileId, id);
        delete memory.knownHands[item.tileId];
      }
    }
    if (Array.isArray(p2.hand) && p2.hand.length === 0) {
      for (const [tid, owner] of Object.entries(memory.knownHands)) {
        if (owner === id) delete memory.knownHands[tid];
      }
    }
  });
  return memory;
}
function computeUnseenTileIds(ownHand = [], ownBank = [], allFaceUpBankTiles = [], knownBankedTileIds = []) {
  const seen = /* @__PURE__ */ new Set();
  for (const id of ownHand) {
    if (id && id !== "HIDDEN") seen.add(id);
  }
  for (const item of ownBank) {
    if (item?.tileId && item.tileId !== "HIDDEN") seen.add(item.tileId);
  }
  for (const id of allFaceUpBankTiles) {
    if (id && id !== "HIDDEN") seen.add(id);
  }
  for (const id of knownBankedTileIds) {
    if (id && id !== "HIDDEN") seen.add(id);
  }
  return STANDARD_TILE_IDS.filter((id) => !seen.has(id));
}
function sanitizePendingPlay(pp, G2, pId, me) {
  if (!pp) return null;
  const moverId = String(pp.moverId);
  const receiverId = String(pp.receiverId);
  const isMover = pId === moverId;
  const isInspectingReceiver = pp.step === "receipt" && pId === receiverId && (me?.credibilityNotchesLost || 0) < 3;
  const isFaceUpInReceiverBank = (G2.players?.[receiverId]?.bank || []).some(
    (b2) => !b2.faceDown && b2.tileId === pp.tileIdPlayed
  );
  const canSeeTile = isMover || isInspectingReceiver || pp.step === "reexecute" || isFaceUpInReceiverBank;
  const visibleTileId = canSeeTile && pp.tileIdPlayed && pp.tileIdPlayed !== "HIDDEN" ? pp.tileIdPlayed : null;
  return {
    step: pp.step,
    moverId,
    receiverId,
    movesMade: (pp.movesMade || []).map((m) => ({ ...m })),
    challengesPassed: (pp.challengesPassed || []).map(String),
    successfulChallengerId: pp.successfulChallengerId !== void 0 && pp.successfulChallengerId !== null ? String(pp.successfulChallengerId) : null,
    whistleblownByReceiver: Boolean(pp.whistleblownByReceiver),
    reexecuteTileId: pp.reexecuteTileId || null,
    activePlayer: getPendingPlayActivePlayer(G2),
    tileIdPlayed: visibleTileId,
    playType: visibleTileId && pp.playType && pp.playType !== "HIDDEN" ? pp.playType : null,
    backupBoard: pp.backupBoard ? JSON.parse(JSON.stringify(pp.backupBoard)) : null,
    backupCommunity: pp.backupCommunity ? { ...pp.backupCommunity } : null
  };
}
function buildBotObservation(G2, ctx, botId, memory = null) {
  const pId = String(botId);
  const players = {};
  const allFaceUpTiles = [];
  Object.keys(G2?.players || {}).forEach((id) => {
    const p2 = G2.players[id] || {};
    const notchesLost = p2.credibilityNotchesLost || 0;
    const bank = Array.isArray(p2.bank) ? p2.bank : [];
    const faceUpBankTiles = bank.filter((item) => !item.faceDown && item.tileId && item.tileId !== "HIDDEN").map((item) => item.tileId);
    allFaceUpTiles.push(...faceUpBankTiles);
    players[id] = {
      id,
      credibilityNotchesLost: notchesLost,
      credibilityRemaining: Math.max(0, 3 - notchesLost),
      handCount: Array.isArray(p2.hand) ? p2.hand.length : 0,
      bankCount: bank.length,
      funding: p2.funding || 0,
      faceUpBankTiles,
      pendingPenaltyWithdraw: Boolean(p2.pendingPenaltyWithdraw)
    };
  });
  const me = G2?.players?.[pId] || {};
  const ownHand = Array.isArray(me.hand) ? [...me.hand] : [];
  const ownBank = Array.isArray(me.bank) ? me.bank.map((item) => ({ tileId: item.tileId, faceDown: Boolean(item.faceDown) })) : [];
  const facedownBankTiles = ownBank.filter((item) => item.faceDown).map((item) => ({ tileId: item.tileId, faceDown: true }));
  const draftPack = Array.isArray(G2?.draftPacks?.[pId]) ? [...G2.draftPacks[pId]] : [];
  return {
    botId: pId,
    phase: ctx?.phase || null,
    currentPlayer: ctx?.currentPlayer !== void 0 && ctx?.currentPlayer !== null ? String(ctx.currentPlayer) : null,
    turn: ctx?.turn ?? 0,
    numPlayers: G2?.numPlayers || 3,
    boardState: G2?.boardState ? JSON.parse(JSON.stringify(G2.boardState)) : {},
    community: G2?.community ? { ...G2.community } : { marks: 0, heels: 0, pawns: 0 },
    winner: G2?.winner || null,
    players,
    hand: ownHand,
    draftPack,
    hasDraftedThisRound: Boolean(G2?.draftSelectionsThisRound?.[pId]),
    bank: ownBank,
    facedownBankTiles,
    unseenTileIds: computeUnseenTileIds(
      ownHand,
      ownBank,
      allFaceUpTiles,
      memory?.knownBanked ? Object.keys(memory.knownBanked) : []
    ),
    memory: memory ? { knownBanked: { ...memory.knownBanked }, knownHands: { ...memory.knownHands } } : { knownBanked: {}, knownHands: {} },
    pendingPlay: sanitizePendingPlay(G2?.pendingPlay, G2, pId, me),
    pendingSupport: G2?.pendingSupport ? { ...G2.pendingSupport, validDestinations: [...G2.pendingSupport.validDestinations || []] } : null
  };
}

// src/ai/personas.js
var BOT_PERSONAS = Object.freeze({
  "0": {
    id: "0",
    name: "Zero",
    title: "The Pragmatist",
    archetype: "Balanced Strategist",
    bluffThreshold: 0.58,
    bribeGenerosity: 1,
    greedWeight: 1,
    integrityWeight: 1.1,
    challengeThreshold: 52,
    aggressionWeight: 1.1,
    draftFundingWeight: 1,
    firstPlayerBonus: 12,
    paranoiaWeight: 1,
    memoryRecall: 0.85,
    thinkingDelayMs: [600, 1200]
  },
  "1": {
    id: "1",
    name: "Vance",
    title: "The Corrupt Baron",
    archetype: "Opportunistic Deceiver",
    bluffThreshold: 0.35,
    bribeGenerosity: 1.5,
    greedWeight: 1.6,
    integrityWeight: 0.7,
    challengeThreshold: 72,
    aggressionWeight: 1.4,
    draftFundingWeight: 1.15,
    firstPlayerBonus: 12,
    paranoiaWeight: 0.6,
    memoryRecall: 0.45,
    thinkingDelayMs: [1e3, 2200]
  },
  "2": {
    id: "2",
    name: "Vale",
    title: "The Watchdog",
    archetype: "Rule-Enforcing Watchdog",
    bluffThreshold: 0.72,
    bribeGenerosity: 0.75,
    greedWeight: 0.7,
    integrityWeight: 1.5,
    challengeThreshold: 44,
    aggressionWeight: 1.15,
    draftFundingWeight: 1,
    firstPlayerBonus: 14,
    paranoiaWeight: 1.3,
    memoryRecall: 0.95,
    thinkingDelayMs: [700, 1400]
  },
  "3": {
    id: "3",
    name: "Thorne",
    title: "The Strategist",
    archetype: "Calculated Tactician",
    bluffThreshold: 0.55,
    bribeGenerosity: 1.1,
    greedWeight: 1.15,
    integrityWeight: 1.2,
    challengeThreshold: 48,
    aggressionWeight: 1.25,
    draftFundingWeight: 1.05,
    firstPlayerBonus: 13,
    paranoiaWeight: 1.1,
    memoryRecall: 0.9,
    thinkingDelayMs: [800, 1700]
  },
  "4": {
    id: "4",
    name: "Mire",
    title: "The Schemer",
    archetype: "High-Risk Bluffer",
    bluffThreshold: 0.3,
    bribeGenerosity: 1.35,
    greedWeight: 1.45,
    integrityWeight: 0.8,
    challengeThreshold: 64,
    aggressionWeight: 1.35,
    draftFundingWeight: 1.1,
    firstPlayerBonus: 11,
    paranoiaWeight: 0.75,
    memoryRecall: 0.65,
    thinkingDelayMs: [900, 1900]
  }
});
function getBotPersona(botId, overrides = {}) {
  const base = BOT_PERSONAS[String(botId)] || BOT_PERSONAS["0"];
  if (!overrides || typeof overrides !== "object") return { ...base };
  return { ...base, ...overrides };
}
function pickRandomPersonas(count, rng = Math.random) {
  const pool = Object.values(BOT_PERSONAS).map((p2) => ({ ...p2 }));
  for (let i2 = pool.length - 1; i2 > 0; i2--) {
    const j2 = Math.floor(rng() * (i2 + 1));
    [pool[i2], pool[j2]] = [pool[j2], pool[i2]];
  }
  const picked = [];
  for (let i2 = 0; i2 < count; i2++) {
    picked.push({ ...pool[i2 % pool.length] });
  }
  return picked;
}
function findPersonaByName(name) {
  if (!name || typeof name !== "string") return null;
  const clean = name.replace(/\s*\(Bot\)$/i, "").trim().toLowerCase();
  const match = Object.values(BOT_PERSONAS).find((p2) => p2.name.toLowerCase() === clean);
  return match ? { ...match } : null;
}

// src/ai/moveGenerator.js
var SELF_MOVES = [MOVE_TYPES.ADVANCE, MOVE_TYPES.WITHDRAW, MOVE_TYPES.ORGANIZE];
var OPP_MOVES = [MOVE_TYPES.ASSIST, MOVE_TYPES.REMOVE, MOVE_TYPES.INFLUENCE];
var SELF_MOVE_SET = new Set(SELF_MOVES);
var topologyCache = /* @__PURE__ */ new Map();
function getTopology(numPlayers) {
  if (topologyCache.has(numPlayers)) return topologyCache.get(numPlayers);
  const seats = [];
  const rostrums = [];
  const domains = [];
  for (let p2 = 0; p2 < numPlayers; p2++) {
    const d2 = `p${p2 + 1}`;
    const pSeats = [];
    for (let s2 = 1; s2 <= 6; s2++) {
      const k2 = `${d2}_seat${s2}`;
      seats.push(k2);
      pSeats.push(k2);
    }
    const pRostrums = [`${d2}_rostrum1`, `${d2}_rostrum2`];
    rostrums.push(...pRostrums);
    domains.push({ id: String(p2), prefix: d2, seats: pSeats, rostrums: pRostrums, office: `${d2}_office` });
  }
  const adjSeats = {};
  for (const s1 of seats) {
    adjSeats[s1] = seats.filter((s2) => s1 !== s2 && areSeatsAdjacent(s1, s2, numPlayers));
  }
  const adjRostrums = {};
  for (const r1 of rostrums) {
    adjRostrums[r1] = rostrums.filter((r2) => r1 !== r2 && areRostrumsAdjacent(r1, r2, numPlayers));
  }
  const topo = { domains, adjSeats, adjRostrums };
  topologyCache.set(numPlayers, topo);
  return topo;
}
function cloneBoard(boardState) {
  const copy2 = {};
  const keys2 = Object.keys(boardState || {});
  for (let i2 = 0; i2 < keys2.length; i2++) {
    copy2[keys2[i2]] = boardState[keys2[i2]];
  }
  return copy2;
}
function needsSupportCascade(boardState, numPlayers) {
  for (let p2 = 0; p2 < numPlayers; p2++) {
    const d2 = `p${p2 + 1}`;
    if (boardState[`${d2}_office`] && !boardState[`${d2}_rostrum1`] && !boardState[`${d2}_rostrum2`]) {
      return true;
    }
    if (boardState[`${d2}_rostrum1`] && !boardState[`${d2}_seat1`] && !boardState[`${d2}_seat2`] && !boardState[`${d2}_seat3`]) {
      return true;
    }
    if (boardState[`${d2}_rostrum2`] && !boardState[`${d2}_seat4`] && !boardState[`${d2}_seat5`] && !boardState[`${d2}_seat6`]) {
      return true;
    }
  }
  return false;
}
function maybeEnforceSupport(boardState, numPlayers) {
  return needsSupportCascade(boardState, numPlayers) ? enforceSupportRule(boardState, numPlayers) : boardState;
}
function boardSignature(boardState, domains, commKeys) {
  let sig = "";
  for (let i2 = 0; i2 < domains.length; i2++) {
    const d2 = domains[i2];
    for (let s2 = 0; s2 < 6; s2++) sig += boardState[d2.seats[s2]]?.type?.[0] || "_";
    sig += boardState[d2.rostrums[0]]?.type?.[0] || "_";
    sig += boardState[d2.rostrums[1]]?.type?.[0] || "_";
    sig += boardState[d2.office]?.type?.[0] || "_";
  }
  let m = 0;
  let h2 = 0;
  let p2 = 0;
  for (let i2 = 0; i2 < commKeys.length; i2++) {
    const piece = boardState[commKeys[i2]];
    if (piece) {
      const t2 = piece.type;
      if (t2 === PIECE_TYPES.MARK) m++;
      else if (t2 === PIECE_TYPES.HEEL) h2++;
      else if (t2 === PIECE_TYPES.PAWN) p2++;
    }
  }
  return `${sig}|${m},${h2},${p2}`;
}
function findCanonicalCommunitySource(boardState, community, stagedMoves = [], excludedPieceId = null) {
  const allCommKeys = Object.keys(boardState).filter((k2) => k2.startsWith("community_"));
  const commKeys = allCommKeys.filter((k2) => boardState[k2] !== null).sort((a2, b2) => parseInt(a2.slice(10), 10) - parseInt(b2.slice(10), 10));
  for (const targetType of [PIECE_TYPES.MARK, PIECE_TYPES.HEEL, PIECE_TYPES.PAWN]) {
    if (!isCommunityPieceAvailable(targetType, boardState, community, stagedMoves)) continue;
    const match = commKeys.find(
      (k2) => boardState[k2]?.type === targetType && (!excludedPieceId || boardState[k2].id !== excludedPieceId)
    );
    if (match) return match;
  }
  if (allCommKeys.length === 0 && ((community?.marks || 0) > 0 || (community?.heels || 0) > 0 || (community?.pawns || 0) > 0)) {
    return "community";
  }
  return null;
}
function generateCandidateSingleMoves(boardState, community, moverId, numPlayers, allowedTypes, stagedMoves = [], excludedPieceId = null) {
  const mStr = String(moverId);
  const mIdx = parseInt(mStr, 10);
  const { domains, adjSeats, adjRostrums } = getTopology(numPlayers);
  const myDom = domains[mIdx];
  if (!myDom) return [];
  const allowSet = new Set(allowedTypes);
  const needComm = allowSet.has(MOVE_TYPES.ADVANCE) || allowSet.has(MOVE_TYPES.ASSIST);
  const commSource = needComm ? findCanonicalCommunitySource(boardState, community, stagedMoves, excludedPieceId) : null;
  const candidates = [];
  const tryPush = (type, from, to) => {
    const move = { type, from, to };
    if (validateSingleMove(move, mStr, boardState, community, numPlayers, stagedMoves).valid) {
      candidates.push(move);
    }
  };
  if (allowSet.has(MOVE_TYPES.ADVANCE)) {
    if (commSource) {
      for (const s2 of myDom.seats) if (!boardState[s2]) tryPush(MOVE_TYPES.ADVANCE, commSource, s2);
    }
    const f1Full = boardState[myDom.seats[0]] && boardState[myDom.seats[1]] && boardState[myDom.seats[2]];
    const f2Full = boardState[myDom.seats[3]] && boardState[myDom.seats[4]] && boardState[myDom.seats[5]];
    if (f1Full && !boardState[myDom.rostrums[0]]) {
      for (let i2 = 0; i2 < 3; i2++) tryPush(MOVE_TYPES.ADVANCE, myDom.seats[i2], myDom.rostrums[0]);
    }
    if (f2Full && !boardState[myDom.rostrums[1]]) {
      for (let i2 = 3; i2 < 6; i2++) tryPush(MOVE_TYPES.ADVANCE, myDom.seats[i2], myDom.rostrums[1]);
    }
    if (!boardState[myDom.office] && boardState[myDom.rostrums[0]] && boardState[myDom.rostrums[1]]) {
      for (const r2 of myDom.rostrums) tryPush(MOVE_TYPES.ADVANCE, r2, myDom.office);
    }
  }
  if (allowSet.has(MOVE_TYPES.WITHDRAW)) {
    if (boardState[myDom.office]) {
      for (const r2 of myDom.rostrums) if (!boardState[r2]) tryPush(MOVE_TYPES.WITHDRAW, myDom.office, r2);
    }
    for (const r2 of myDom.rostrums) {
      if (boardState[r2]) {
        for (const s2 of myDom.seats) if (!boardState[s2]) tryPush(MOVE_TYPES.WITHDRAW, r2, s2);
      }
    }
    for (const s2 of myDom.seats) if (boardState[s2]) tryPush(MOVE_TYPES.WITHDRAW, s2, "community");
  }
  if (allowSet.has(MOVE_TYPES.ORGANIZE)) {
    for (const s2 of myDom.seats) {
      if (boardState[s2]) {
        for (const toSeat of adjSeats[s2]) if (!boardState[toSeat]) tryPush(MOVE_TYPES.ORGANIZE, s2, toSeat);
      }
    }
    for (const r2 of myDom.rostrums) {
      if (boardState[r2]) {
        for (const toR of adjRostrums[r2]) if (!boardState[toR]) tryPush(MOVE_TYPES.ORGANIZE, r2, toR);
      }
    }
  }
  if (allowSet.has(MOVE_TYPES.REMOVE)) {
    for (const dom of domains) {
      if (dom.id === mStr) continue;
      for (const s2 of dom.seats) {
        if (boardState[s2]?.type === PIECE_TYPES.MARK) tryPush(MOVE_TYPES.REMOVE, s2, "community");
      }
    }
  }
  if (allowSet.has(MOVE_TYPES.INFLUENCE)) {
    for (const dom of domains) {
      if (dom.id === mStr) continue;
      for (const s2 of dom.seats) {
        if (boardState[s2] && boardState[s2].type !== PIECE_TYPES.PAWN) {
          for (const toSeat of adjSeats[s2]) if (!boardState[toSeat]) tryPush(MOVE_TYPES.INFLUENCE, s2, toSeat);
        }
      }
      for (const r2 of dom.rostrums) {
        if (boardState[r2] && boardState[r2].type !== PIECE_TYPES.PAWN) {
          for (const toR of adjRostrums[r2]) if (!boardState[toR]) tryPush(MOVE_TYPES.INFLUENCE, r2, toR);
        }
      }
    }
  }
  if (allowSet.has(MOVE_TYPES.ASSIST) && commSource) {
    for (const dom of domains) {
      if (dom.id === mStr) continue;
      for (const s2 of dom.seats) if (!boardState[s2]) tryPush(MOVE_TYPES.ASSIST, commSource, s2);
    }
  }
  return candidates;
}
function isBorderLocation(loc, domains, myIdx) {
  const myDom = domains[myIdx];
  const opp1 = domains[(myIdx + 1) % domains.length];
  const opp2 = domains[(myIdx - 1 + domains.length) % domains.length];
  return loc === `${opp1.prefix}_seat1` || loc === `${opp2.prefix}_seat6` || loc === `${opp1.prefix}_rostrum1` || loc === `${opp2.prefix}_rostrum2` || loc === `${myDom.prefix}_seat1` || loc === `${myDom.prefix}_seat6` || loc === `${myDom.prefix}_rostrum1` || loc === `${myDom.prefix}_rostrum2`;
}
function generateLegalMovesForBot(boardState, community, moverId, numPlayers = 3, options = {}) {
  const { maxMoves = 2, allowedTypes = null, exhaustive = false } = options;
  const mStr = String(moverId);
  const mIdx = parseInt(mStr, 10);
  const { domains } = getTopology(numPlayers);
  const commKeys = Object.keys(boardState).filter((k2) => k2.startsWith("community_"));
  const allTypes = allowedTypes && allowedTypes.length > 0 ? allowedTypes : [...SELF_MOVES, ...OPP_MOVES];
  const allowedSet = new Set(allTypes);
  const hasCommPlayable = Boolean(findCanonicalCommunitySource(boardState, community));
  const baseAfter = maybeEnforceSupport(cloneBoard(boardState), numPlayers);
  const results = [
    { moves: [], afterBoard: baseAfter, afterCommunity: { ...community }, typesKey: "" }
  ];
  const seenPost = /* @__PURE__ */ new Set();
  const seenPre = /* @__PURE__ */ new Set();
  const oneMoves = generateCandidateSingleMoves(boardState, community, mStr, numPlayers, allTypes);
  const intermediate = [];
  for (const m1 of oneMoves) {
    const b1 = cloneBoard(boardState);
    const c1 = { ...community };
    applyMoveToState(m1, b1, c1);
    const after1 = maybeEnforceSupport(b1, numPlayers);
    const postKey1 = `${m1.type}|${boardSignature(after1, domains, commKeys)}`;
    if (!seenPost.has(postKey1)) {
      seenPost.add(postKey1);
      results.push({ moves: [m1], afterBoard: after1, afterCommunity: c1, typesKey: m1.type });
    }
    if (maxMoves >= 2) {
      const isSelf = SELF_MOVE_SET.has(m1.type);
      const oppInteracts = exhaustive || m1.type === MOVE_TYPES.ASSIST || m1.type === MOVE_TYPES.REMOVE && !hasCommPlayable || isBorderLocation(m1.from, domains, mIdx) || isBorderLocation(m1.to, domains, mIdx);
      if (isSelf || oppInteracts) {
        intermediate.push({ m1, b1, c1, piece1Id: boardState[m1.from]?.id || null });
      }
    }
  }
  if (maxMoves < 2) return results;
  for (const item of intermediate) {
    const { m1, b1, c1, piece1Id } = item;
    const altBase = SELF_MOVE_SET.has(m1.type) ? OPP_MOVES : SELF_MOVES;
    const altTypes = allowedTypes ? altBase.filter((t2) => allowedSet.has(t2)) : altBase;
    if (altTypes.length === 0) continue;
    const twoCandidates = generateCandidateSingleMoves(
      b1,
      c1,
      mStr,
      numPlayers,
      altTypes,
      [m1],
      piece1Id
    );
    for (const m2 of twoCandidates) {
      const piece2Id = b1[m2.from]?.id || null;
      if (piece1Id && piece2Id && piece1Id === piece2Id) continue;
      const normTo1 = m1.to.startsWith("community_") ? "community" : m1.to;
      const normFrom2 = m2.from.startsWith("community_") ? "community" : m2.from;
      if (normTo1 !== "community" && normTo1 === normFrom2) continue;
      if (m1.from === m2.from && m1.from !== "community") continue;
      const typesKey = m1.type <= m2.type ? `${m1.type}+${m2.type}` : `${m2.type}+${m1.type}`;
      const b2 = cloneBoard(b1);
      const c2 = { ...c1 };
      applyMoveToState(m2, b2, c2);
      const preKey = `${typesKey}|${boardSignature(b2, domains, commKeys)}`;
      if (seenPre.has(preKey)) continue;
      const after2 = maybeEnforceSupport(b2, numPlayers);
      const postKey = `${typesKey}|${boardSignature(after2, domains, commKeys)}`;
      if (seenPost.has(postKey)) {
        seenPre.add(preKey);
        continue;
      }
      seenPre.add(preKey);
      seenPost.add(postKey);
      results.push({ moves: [m1, m2], afterBoard: after2, afterCommunity: c2, typesKey });
    }
  }
  return results;
}
function getTilesMatchingMoves(movesMade, candidateTileIds = STANDARD_TILE_IDS, moverId = "0", boardState = null, community = null, numPlayers = 3) {
  const mStr = String(moverId);
  const madeTypes = (movesMade || []).map((m) => m.type);
  const patternCache = /* @__PURE__ */ new Map();
  const matches = [];
  for (const tileId of candidateTileIds) {
    const tile = TILES[tileId];
    if (!tile) continue;
    if (tile.isWild) {
      matches.push(tileId);
      continue;
    }
    const patKey = [...tile.moves].sort().join("+");
    let isHonest = patternCache.get(patKey);
    if (isHonest === void 0) {
      const remaining = [...tile.moves];
      let hasUnmatched = false;
      for (const mt of madeTypes) {
        const idx = remaining.indexOf(mt);
        if (idx !== -1) remaining.splice(idx, 1);
        else {
          hasUnmatched = true;
          break;
        }
      }
      if (hasUnmatched) {
        isHonest = false;
      } else if (remaining.length === 0) {
        isHonest = true;
      } else {
        isHonest = classifyPlay(movesMade, tileId, mStr, boardState, community, numPlayers) === "Honest";
      }
      patternCache.set(patKey, isHonest);
    }
    if (isHonest) matches.push(tileId);
  }
  return matches;
}

// src/ai/evaluator.js
function evaluateDomain(boardState, playerId) {
  if (!boardState) return 0;
  const pId = String(playerId);
  const d2 = `p${parseInt(pId, 10) + 1}`;
  let score = 0;
  for (let s2 = 1; s2 <= 6; s2++) {
    const piece = boardState[`${d2}_seat${s2}`];
    if (piece) {
      score += 5;
      if (piece.type === PIECE_TYPES.HEEL) score += 1;
    }
  }
  for (let r2 = 1; r2 <= 2; r2++) {
    const piece = boardState[`${d2}_rostrum${r2}`];
    if (piece) {
      score += 12;
      if (piece.type === PIECE_TYPES.HEEL) score += 8;
    }
  }
  const office = boardState[`${d2}_office`];
  if (office) {
    score += office.type === PIECE_TYPES.PAWN ? 30 : 10;
  }
  if (checkVictory(boardState, pId)) {
    score += 500;
  }
  return score;
}
function evaluateProgressionBonus(boardState, playerId) {
  if (!boardState) return 0;
  const d2 = `p${parseInt(playerId, 10) + 1}`;
  const office = boardState[`${d2}_office`];
  let bonus = 0;
  let occupiedSeats = 0;
  let pawnInSeat = false;
  let pawnInRostrum = false;
  for (let s2 = 1; s2 <= 6; s2++) {
    const piece = boardState[`${d2}_seat${s2}`];
    if (piece) {
      occupiedSeats++;
      if (piece.type === PIECE_TYPES.PAWN) pawnInSeat = true;
    }
  }
  for (let r2 = 1; r2 <= 2; r2++) {
    if (boardState[`${d2}_rostrum${r2}`]?.type === PIECE_TYPES.PAWN) pawnInRostrum = true;
  }
  if (occupiedSeats >= 5) bonus += (occupiedSeats - 4) * 3;
  if (occupiedSeats === 6) bonus += 6;
  if (office?.type === PIECE_TYPES.PAWN) {
    bonus += 26;
  } else if (office?.type === PIECE_TYPES.MARK) {
    bonus -= 22;
  } else if (pawnInRostrum) {
    bonus += office === null ? 16 : -4;
  } else if (pawnInSeat) {
    bonus += office === null ? 8 : -4;
  } else if (office?.type === PIECE_TYPES.HEEL) {
    bonus += 16;
  }
  const hasCommHeel = Object.keys(boardState).some(
    (k2) => k2.startsWith("community_") && boardState[k2]?.type === PIECE_TYPES.HEEL
  );
  if (!hasCommHeel) {
    const f1SeatHeel = [1, 2, 3].some((s2) => boardState[`${d2}_seat${s2}`]?.type === PIECE_TYPES.HEEL);
    const f2SeatHeel = [4, 5, 6].some((s2) => boardState[`${d2}_seat${s2}`]?.type === PIECE_TYPES.HEEL);
    if (f1SeatHeel && boardState[`${d2}_rostrum1`]?.type === PIECE_TYPES.MARK) bonus -= 8;
    if (f2SeatHeel && boardState[`${d2}_rostrum2`]?.type === PIECE_TYPES.MARK) bonus -= 8;
  }
  return bonus;
}
function createBeforeScoreContext(beforeBoard, botId, numPlayers = 3, aggression = 1) {
  const bId = String(botId);
  const ownBefore = evaluateDomain(beforeBoard, bId) + evaluateProgressionBonus(beforeBoard, bId);
  const oppBefore = [];
  for (let p2 = 0; p2 < numPlayers; p2++) {
    const pStr = String(p2);
    if (pStr === bId) continue;
    const prevOpp = evaluateDomain(beforeBoard, pStr);
    const threatWeight = prevOpp >= 86 ? 0.7 * aggression : 0.18 * aggression;
    oppBefore.push({ id: pStr, prevOpp, threatWeight });
  }
  return { bId, ownBefore, oppBefore };
}
function scoreBoardDeltaForMove(beforeOrCtx, afterBoard, botId, numPlayers = 3, aggression = 1) {
  const ctx = beforeOrCtx && beforeOrCtx.oppBefore ? beforeOrCtx : createBeforeScoreContext(beforeOrCtx, botId, numPlayers, aggression);
  const bId = ctx.bId;
  const ownAfter = evaluateDomain(afterBoard, bId) + evaluateProgressionBonus(afterBoard, bId);
  const ownDelta = ownAfter - ctx.ownBefore;
  let oppDamage = 0;
  let oppWinPenalty = 0;
  for (let i2 = 0; i2 < ctx.oppBefore.length; i2++) {
    const opp = ctx.oppBefore[i2];
    const nextOpp = evaluateDomain(afterBoard, opp.id);
    oppDamage += (opp.prevOpp - nextOpp) * opp.threatWeight;
    if (checkVictory(afterBoard, opp.id)) oppWinPenalty += 1e3;
  }
  const winBonus = checkVictory(afterBoard, bId) ? 500 : 0;
  return { ownDelta, oppDamage, total: ownDelta * 1.9 + oppDamage + winBonus - oppWinPenalty };
}

// src/ai/bureaucracyDecisions.js
var BASIC_MOVE_SET = /* @__PURE__ */ new Set([MOVE_TYPES.ADVANCE, MOVE_TYPES.WITHDRAW, MOVE_TYPES.ORGANIZE]);
var EXTRA_MOVE_SET = /* @__PURE__ */ new Set([MOVE_TYPES.ASSIST, MOVE_TYPES.REMOVE, MOVE_TYPES.INFLUENCE]);
function countOwnPieces(boardState, domainPrefix, pieceType) {
  let count = 0;
  for (const k2 of Object.keys(boardState || {})) {
    if (k2.startsWith(`${domainPrefix}_`) && boardState[k2]?.type === pieceType) count++;
  }
  return count;
}
function findCommunitySwapKey(boardState, higherType) {
  return Object.keys(boardState || {}).find(
    (k2) => k2.startsWith("community_") && boardState[k2]?.type === higherType
  );
}
function enumerateAffordableBureaucracyOptions(obs, paymentMode = "funding") {
  const prices = BUREAUCRACY_PRICES[obs.numPlayers] || BUREAUCRACY_PRICES[3];
  const botId = obs.botId;
  const me = obs.players[botId] || {};
  const domainPrefix = `p${parseInt(botId, 10) + 1}`;
  const hasPawn = countOwnPieces(obs.boardState, domainPrefix, PIECE_TYPES.PAWN) > 0;
  const options = [];
  const getPayment = (cost) => {
    if (cost <= 0) return null;
    if (paymentMode === "bankTiles") {
      const tiles = selectBestBankTilesToPay(obs.facedownBankTiles || [], cost);
      if (!tiles || tiles.length === 0) return null;
      const paidFunding = tiles.reduce((s2, t2) => s2 + (TILES[t2.tileId]?.funding || 0), 0);
      return { cost, paidFunding };
    }
    return (me.funding || 0) >= cost ? { cost, paidFunding: cost } : null;
  };
  if (paymentMode === "funding" && (me.credibilityNotchesLost || 0) > 0) {
    const pay = getPayment(prices.RESTORE_CRED);
    if (pay) {
      options.push({
        payload: { actionType: "RESTORE_CRED", targetLoc: void 0, subAction: void 0 },
        afterBoard: obs.boardState,
        meta: { kind: "RESTORE_CRED", ...pay }
      });
    }
  }
  const promoSpecs = [
    { actionType: "PROMOTE_SEAT", locs: [1, 2, 3, 4, 5, 6].map((i2) => `${domainPrefix}_seat${i2}`) },
    { actionType: "PROMOTE_ROSTRUM", locs: [1, 2].map((i2) => `${domainPrefix}_rostrum${i2}`) },
    { actionType: "PROMOTE_OFFICE", locs: [`${domainPrefix}_office`] }
  ];
  for (const spec of promoSpecs) {
    const pay = getPayment(prices[spec.actionType]);
    if (!pay) continue;
    for (const loc of spec.locs) {
      const piece = obs.boardState[loc];
      if (!piece) continue;
      let higherType = null;
      if (piece.type === PIECE_TYPES.MARK && (obs.community?.heels || 0) > 0) {
        higherType = PIECE_TYPES.HEEL;
      } else if (piece.type === PIECE_TYPES.HEEL && (obs.community?.pawns || 0) > 0 && !hasPawn) {
        higherType = PIECE_TYPES.PAWN;
      }
      if (!higherType) continue;
      const commKey = findCommunitySwapKey(obs.boardState, higherType);
      if (!commKey) continue;
      const afterBoard = { ...obs.boardState, [loc]: obs.boardState[commKey], [commKey]: piece };
      options.push({
        payload: { actionType: spec.actionType, targetLoc: loc, subAction: void 0 },
        afterBoard,
        meta: { kind: spec.actionType, fromType: piece.type, toType: higherType, loc, ...pay }
      });
    }
  }
  const basicPay = getPayment(prices.BASIC_ACTION);
  const extraPay = getPayment(prices.EXTRA_ACTION);
  if (basicPay || extraPay) {
    const singleCandidates = generateLegalMovesForBot(
      obs.boardState,
      obs.community,
      botId,
      obs.numPlayers,
      { maxMoves: 1 }
    ).filter((c2) => c2.moves.length === 1);
    for (const cand of singleCandidates) {
      const m = cand.moves[0];
      const isBasic = BASIC_MOVE_SET.has(m.type);
      const isExtra = EXTRA_MOVE_SET.has(m.type);
      if (isBasic && !basicPay || isExtra && !extraPay) continue;
      if (!validateSingleMove(m, botId, obs.boardState, obs.community, obs.numPlayers).valid) continue;
      options.push({
        payload: {
          actionType: isBasic ? "BASIC_ACTION" : "EXTRA_ACTION",
          targetLoc: void 0,
          subAction: m
        },
        afterBoard: cand.afterBoard,
        meta: {
          kind: isBasic ? "BASIC_ACTION" : "EXTRA_ACTION",
          moveType: m.type,
          ...isBasic ? basicPay : extraPay
        }
      });
    }
  }
  return options;
}
function scoreBureaucracyOption(obs, option, persona, rng = Math.random) {
  const botId = obs.botId;
  const aggression = persona?.aggressionWeight ?? 1;
  const integrity = persona?.integrityWeight ?? 1;
  const notchesLost = obs.players[botId]?.credibilityNotchesLost || 0;
  const domainPrefix = `p${parseInt(botId, 10) + 1}`;
  const heelCount = countOwnPieces(obs.boardState, domainPrefix, PIECE_TYPES.HEEL);
  const { meta, afterBoard } = option;
  if (meta.kind === "RESTORE_CRED") {
    const base = notchesLost >= 3 ? 40 : notchesLost === 2 ? 22 * integrity : 9 * integrity - 6;
    return base + (rng() - 0.5) * 2;
  }
  const delta = scoreBoardDeltaForMove(obs.boardState, afterBoard, botId, obs.numPlayers, aggression);
  if (checkVictory(afterBoard, botId)) return 1500 + delta.total;
  let score = delta.total * 1.4 - meta.paidFunding * 0.4;
  if (meta.kind.startsWith("PROMOTE_")) {
    const officeOccupied = Boolean(obs.boardState?.[`${domainPrefix}_office`]);
    if (meta.toType === PIECE_TYPES.PAWN) {
      if (meta.kind === "PROMOTE_OFFICE") {
        score += 45;
      } else if (!officeOccupied) {
        if (meta.kind === "PROMOTE_ROSTRUM") {
          score += 40;
        } else {
          const seatNum = parseInt(String(meta.loc || "").split("_seat")[1], 10);
          const rostrumAbove = seatNum <= 3 ? `${domainPrefix}_rostrum1` : `${domainPrefix}_rostrum2`;
          score += obs.boardState?.[rostrumAbove] ? 20 : 34;
        }
      } else {
        score -= 15;
      }
    } else if (meta.kind === "PROMOTE_OFFICE") {
      score += 22;
    } else if (meta.kind === "PROMOTE_ROSTRUM" && meta.fromType === PIECE_TYPES.MARK) {
      score += 20;
    } else if (meta.kind === "PROMOTE_SEAT" && meta.fromType === PIECE_TYPES.MARK && heelCount < 3) {
      score += 10;
    }
  } else if (meta.kind === "BASIC_ACTION") {
    if (delta.ownDelta <= 0) return -50;
    score += 10;
  } else if (meta.kind === "EXTRA_ACTION") {
    const maxOppScore = Object.keys(obs.players).filter((id) => id !== botId).reduce((mx, id) => Math.max(mx, evaluateDomain(obs.boardState, id)), 0);
    if (maxOppScore < 86 && delta.ownDelta <= 0) return -40;
    score += maxOppScore >= 86 ? 6 : -14;
  }
  return score + (rng() - 0.5) * 1.5;
}
function decideBureaucracyAction(obs, persona, rng = Math.random) {
  try {
    const options = enumerateAffordableBureaucracyOptions(obs, "funding");
    if (options.length === 0) return { move: "endBureaucracyTurn", args: [] };
    let best = null;
    let bestScore = 0;
    for (const opt of options) {
      const sc = scoreBureaucracyOption(obs, opt, persona, rng);
      if (sc > bestScore) {
        bestScore = sc;
        best = opt;
      }
    }
    if (best) {
      return { move: "buyBureaucracyAction", args: [best.payload] };
    }
    return { move: "endBureaucracyTurn", args: [] };
  } catch {
    return { move: "endBureaucracyTurn", args: [] };
  }
}

// src/ai/pendingDecisions.js
function getOwnBankedFunding(obs) {
  if (Array.isArray(obs.facedownBankTiles) && obs.facedownBankTiles.length > 0) {
    return obs.facedownBankTiles.reduce((sum, t2) => sum + (TILES[t2.tileId]?.funding || 0), 0);
  }
  return obs.players?.[obs.botId]?.funding || 0;
}
function decideReceipt(obs, persona, rng = Math.random) {
  try {
    const pp = obs.pendingPlay;
    const myCred = obs.players[obs.botId]?.credibilityRemaining || 0;
    if (!pp?.tileIdPlayed || myCred <= 0) {
      return { move: "acceptTile", args: [] };
    }
    const boardBefore = pp.backupBoard || obs.boardState;
    const commBefore = pp.backupCommunity || obs.community;
    const playClass = classifyPlay(
      pp.movesMade,
      pp.tileIdPlayed,
      pp.moverId,
      boardBefore,
      commBefore,
      obs.numPlayers
    );
    if (playClass === "Honest") {
      return { move: "acceptTile", args: [] };
    }
    if (checkVictory(obs.boardState, pp.moverId)) {
      return { move: "rejectTile", args: [] };
    }
    const prices = BUREAUCRACY_PRICES[obs.numPlayers] || BUREAUCRACY_PRICES[3];
    const funding = TILES[pp.tileIdPlayed]?.funding || 0;
    const ownFunding = getOwnBankedFunding(obs);
    const fundingNeed = Math.max(0, 1 - ownFunding / prices.PROMOTE_OFFICE);
    const notchesLost = obs.players[obs.botId]?.credibilityNotchesLost || 0;
    const moverGain = evaluateDomain(obs.boardState, pp.moverId) - evaluateDomain(boardBefore, pp.moverId);
    const knownHands = obs.memory?.knownHands || {};
    const moverCandidateTiles = (obs.unseenTileIds || []).filter(
      (id) => !knownHands[id] || knownHands[id] === pp.moverId
    );
    const unseenMatches = getTilesMatchingMoves(
      pp.movesMade,
      moverCandidateTiles,
      pp.moverId,
      boardBefore,
      commBefore,
      obs.numPlayers
    ).length;
    const greed = persona?.greedWeight ?? 1;
    const integrity = persona?.integrityWeight ?? 1;
    const obviousLieRisk = unseenMatches === 0 ? 25 : moverGain >= 15 ? 12 : 4;
    const lowFundingBonus = funding > 0 ? fundingNeed * (10 + funding * 1.5) * greed : 0;
    const keepBribeScore = funding * 3.5 * greed + lowFundingBonus - obviousLieRisk * (persona?.paranoiaWeight ?? 1);
    const credWhistleTerm = notchesLost >= 2 ? 48 * integrity + 10 : notchesLost === 0 ? 26 * integrity : 10 * integrity;
    const whistleBlowScore = credWhistleTerm + Math.max(0, moverGain) * 1.2;
    return whistleBlowScore >= keepBribeScore + (rng() - 0.5) * 4 ? { move: "rejectTile", args: [] } : { move: "acceptTile", args: [] };
  } catch {
    return { move: "acceptTile", args: [] };
  }
}
function decideChallenge(obs, persona, rng = Math.random) {
  try {
    const pp = obs.pendingPlay;
    if (!pp) return { move: "passChallenge", args: [] };
    const boardBefore = pp.backupBoard || obs.boardState;
    const commBefore = pp.backupCommunity || obs.community;
    const knownHands = obs.memory?.knownHands || {};
    const moverCandidateTiles = (obs.unseenTileIds || []).filter(
      (id) => !knownHands[id] || knownHands[id] === pp.moverId
    );
    const matchingUnseen = getTilesMatchingMoves(
      pp.movesMade || [],
      moverCandidateTiles,
      pp.moverId,
      boardBefore,
      commBefore,
      obs.numPlayers
    );
    const remainingCopies = matchingUnseen.length;
    if (remainingCopies === 0) {
      return { move: "challengeTile", args: [] };
    }
    const moverKnownToHoldMatch = matchingUnseen.some((id) => knownHands[id] === pp.moverId);
    const prices = BUREAUCRACY_PRICES[obs.numPlayers] || BUREAUCRACY_PRICES[3];
    const ownFunding = getOwnBankedFunding(obs);
    const moverGain = evaluateDomain(obs.boardState, pp.moverId) - evaluateDomain(boardBefore, pp.moverId);
    const moverAfter = evaluateDomain(obs.boardState, pp.moverId);
    const moverWinning = checkVictory(obs.boardState, pp.moverId);
    const notchesLost = obs.players[obs.botId]?.credibilityNotchesLost || 0;
    const rarityPts = Math.min(52, 1 / remainingCopies * 55);
    const gainPts = Math.max(0, moverGain) * 1;
    const winPts = moverWinning ? 90 : moverAfter >= 75 ? 20 : 0;
    const credPts = notchesLost === 0 ? 8 : notchesLost === 1 ? -8 : -42;
    const fundingPts = Math.min(14, ownFunding / prices.PROMOTE_OFFICE * 14);
    const bribeSuspicion = (obs.players[pp.receiverId]?.credibilityRemaining || 0) === 0 ? 10 : 0;
    const knownHoldBonus = moverKnownToHoldMatch ? -20 : 0;
    const suspicion = rarityPts + gainPts + winPts + credPts + fundingPts + bribeSuspicion + knownHoldBonus + (rng() - 0.5) * 14;
    const rawThresh = persona?.challengeThreshold ?? 52;
    const threshold = rawThresh <= 1 ? rawThresh * 100 : rawThresh;
    return suspicion >= threshold ? { move: "challengeTile", args: [] } : { move: "passChallenge", args: [] };
  } catch {
    return { move: "passChallenge", args: [] };
  }
}
function buildGenericCommunityReexecuteFallback(obs, tileId, existingCandidates) {
  const mStr = obs.botId;
  const reqMoves = TILES[tileId]?.moves || [];
  const commMoves = [];
  const myDom = `p${parseInt(mStr, 10) + 1}`;
  if (reqMoves.includes(MOVE_TYPES.ADVANCE)) {
    for (let s2 = 1; s2 <= 6; s2++) {
      const m = { type: MOVE_TYPES.ADVANCE, from: "community", to: `${myDom}_seat${s2}` };
      if (validateSingleMove(m, mStr, obs.boardState, obs.community, obs.numPlayers).valid) {
        commMoves.push(m);
      }
    }
  }
  if (reqMoves.includes(MOVE_TYPES.ASSIST)) {
    for (let p2 = 0; p2 < obs.numPlayers; p2++) {
      if (String(p2) === mStr) continue;
      for (let s2 = 1; s2 <= 6; s2++) {
        const m = { type: MOVE_TYPES.ASSIST, from: "community", to: `p${p2 + 1}_seat${s2}` };
        if (validateSingleMove(m, mStr, obs.boardState, obs.community, obs.numPlayers).valid) {
          commMoves.push(m);
        }
      }
    }
  }
  const singleMoves = existingCandidates.filter((c2) => c2.moves.length === 1).map((c2) => c2.moves[0]);
  const pool = [...commMoves, ...singleMoves];
  for (const cm of commMoves) {
    if (classifyPlay([cm], tileId, mStr, obs.boardState, obs.community, obs.numPlayers) === "Honest") {
      return [cm];
    }
    for (const mOther of pool) {
      for (const seq of [[cm, mOther], [mOther, cm]]) {
        if (validateMoveCombination(seq, mStr, obs.boardState, obs.community, obs.numPlayers).valid && classifyPlay(seq, tileId, mStr, obs.boardState, obs.community, obs.numPlayers) === "Honest") {
          return seq;
        }
      }
    }
  }
  return [];
}
function decideReexecute(obs, persona) {
  try {
    const tileId = obs.pendingPlay?.reexecuteTileId || obs.pendingPlay?.tileIdPlayed;
    const reqMoves = TILES[tileId]?.moves || [];
    const filterHonest = (cands) => cands.filter(
      (c2) => validateMoveCombination(c2.moves, obs.botId, obs.boardState, obs.community, obs.numPlayers).valid && classifyPlay(c2.moves, tileId, obs.botId, obs.boardState, obs.community, obs.numPlayers) === "Honest"
    );
    let candidates = generateLegalMovesForBot(obs.boardState, obs.community, obs.botId, obs.numPlayers, {
      maxMoves: Math.max(1, reqMoves.length),
      allowedTypes: reqMoves.length > 0 ? reqMoves : null
    });
    let honest = filterHonest(candidates);
    if (honest.length === 0 && reqMoves.length >= 2) {
      candidates = generateLegalMovesForBot(obs.boardState, obs.community, obs.botId, obs.numPlayers, {
        maxMoves: reqMoves.length,
        allowedTypes: reqMoves,
        exhaustive: true
      });
      honest = filterHonest(candidates);
    }
    if (honest.length === 0) {
      return {
        move: "reexecuteHonestly",
        args: [buildGenericCommunityReexecuteFallback(obs, tileId, candidates)]
      };
    }
    const aggression = persona?.aggressionWeight ?? 1;
    let best = honest[0];
    let bestScore = -Infinity;
    for (const c2 of honest) {
      const sc = scoreBoardDeltaForMove(obs.boardState, c2.afterBoard, obs.botId, obs.numPlayers, aggression).total;
      if (sc > bestScore) {
        bestScore = sc;
        best = c2;
      }
    }
    return { move: "reexecuteHonestly", args: [best.moves] };
  } catch {
    return { move: "reexecuteHonestly", args: [[]] };
  }
}
function decidePenaltyWithdraw(obs, persona) {
  try {
    const withdraws = generateLegalMovesForBot(
      obs.boardState,
      obs.community,
      obs.botId,
      obs.numPlayers,
      { maxMoves: 1, allowedTypes: [MOVE_TYPES.WITHDRAW] }
    ).filter(
      (c2) => c2.moves.length === 1 && c2.moves[0].type === MOVE_TYPES.WITHDRAW && validateSingleMove(c2.moves[0], obs.botId, obs.boardState, obs.community, obs.numPlayers).valid
    );
    if (withdraws.length === 0) return { move: "executePenaltyWithdraw", args: [null] };
    const aggression = persona?.aggressionWeight ?? 1;
    let best = withdraws[0];
    let bestScore = -Infinity;
    for (const c2 of withdraws) {
      const sc = scoreBoardDeltaForMove(obs.boardState, c2.afterBoard, obs.botId, obs.numPlayers, aggression).total;
      if (sc > bestScore) {
        bestScore = sc;
        best = c2;
      }
    }
    return { move: "executePenaltyWithdraw", args: [best.moves[0]] };
  } catch {
    return { move: "executePenaltyWithdraw", args: [null] };
  }
}
function decideReceiverReward(obs, persona) {
  try {
    const notchesLost = obs.players[obs.botId]?.credibilityNotchesLost || 0;
    if (notchesLost === 0) return { move: "chooseReceiverAdvanceReward", args: [] };
    const advances = generateLegalMovesForBot(
      obs.boardState,
      obs.community,
      obs.botId,
      obs.numPlayers,
      { maxMoves: 1, allowedTypes: [MOVE_TYPES.ADVANCE] }
    ).filter((c2) => c2.moves.length === 1 && c2.moves[0].type === MOVE_TYPES.ADVANCE);
    if (advances.some((a2) => checkVictory(a2.afterBoard, obs.botId))) {
      return { move: "chooseReceiverAdvanceReward", args: [] };
    }
    if (advances.length === 0 || notchesLost >= 2 || (persona?.integrityWeight ?? 1) >= 1.3) {
      return { move: "claimReceiverCredibilityReward", args: [] };
    }
    return { move: "chooseReceiverAdvanceReward", args: [] };
  } catch {
    return { move: "claimReceiverCredibilityReward", args: [] };
  }
}
function decideFreeAdvance(obs, persona) {
  try {
    const advances = generateLegalMovesForBot(
      obs.boardState,
      obs.community,
      obs.botId,
      obs.numPlayers,
      { maxMoves: 1, allowedTypes: [MOVE_TYPES.ADVANCE] }
    ).filter(
      (c2) => c2.moves.length === 1 && c2.moves[0].type === MOVE_TYPES.ADVANCE && validateSingleMove(c2.moves[0], obs.botId, obs.boardState, obs.community, obs.numPlayers).valid
    );
    if (advances.length === 0) {
      if (isMoveTypePossible(MOVE_TYPES.ADVANCE, obs.botId, obs.boardState, obs.community, obs.numPlayers)) {
        const myDom = `p${parseInt(obs.botId, 10) + 1}`;
        for (let s2 = 1; s2 <= 6; s2++) {
          const fallbackAdv = { type: MOVE_TYPES.ADVANCE, from: "community", to: `${myDom}_seat${s2}` };
          if (validateSingleMove(fallbackAdv, obs.botId, obs.boardState, obs.community, obs.numPlayers).valid) {
            return { move: "executeFreeAdvance", args: [fallbackAdv] };
          }
        }
      }
      return { move: "executeFreeAdvance", args: [null] };
    }
    const aggression = persona?.aggressionWeight ?? 1;
    let best = advances[0];
    let bestScore = -Infinity;
    for (const c2 of advances) {
      const sc = scoreBoardDeltaForMove(obs.boardState, c2.afterBoard, obs.botId, obs.numPlayers, aggression).total;
      if (sc > bestScore) {
        bestScore = sc;
        best = c2;
      }
    }
    return { move: "executeFreeAdvance", args: [best.moves[0]] };
  } catch {
    return { move: "executeFreeAdvance", args: [null] };
  }
}
function decideChallengerReward(obs, persona, rng = Math.random) {
  try {
    const notchesLost = obs.players[obs.botId]?.credibilityNotchesLost || 0;
    const integrity = persona?.integrityWeight ?? 1;
    const credScore = notchesLost > 0 ? notchesLost * 16 * integrity : -5;
    const options = enumerateAffordableBureaucracyOptions(obs, "bankTiles");
    let bestOpt = null;
    let bestScore = Math.max(8, credScore);
    for (const opt of options) {
      const sc = scoreBureaucracyOption(obs, opt, persona, rng) - opt.meta.paidFunding * 0.35;
      if (sc > bestScore) {
        bestScore = sc;
        bestOpt = opt;
      }
    }
    if (bestOpt) {
      return { move: "buyChallengerBureaucracyAction", args: [bestOpt.payload] };
    }
    return { move: "claimChallengerCredibility", args: [] };
  } catch {
    return { move: "claimChallengerCredibility", args: [] };
  }
}
function decideSupportDrop(obs) {
  const ps = obs.pendingSupport;
  const targets = ps?.validDestinations || [];
  if (!ps || targets.length === 0) return null;
  let bestLoc = targets[0];
  let bestScore = -Infinity;
  for (const toLoc of targets) {
    const simBoard = JSON.parse(JSON.stringify(obs.boardState || {}));
    simBoard[toLoc] = simBoard[ps.from];
    simBoard[ps.from] = null;
    const afterCascade = enforceSupportRule(simBoard, obs.numPlayers || 3);
    const sc = evaluateDomain(afterCascade, obs.botId);
    if (sc > bestScore) {
      bestScore = sc;
      bestLoc = toLoc;
    }
  }
  return { move: "resolveSupportDrop", args: [bestLoc] };
}

// src/ai/campaignDecisions.js
var DRAFT_MOVE_WEIGHTS = {
  [MOVE_TYPES.ADVANCE]: 10,
  [MOVE_TYPES.ORGANIZE]: 6,
  [MOVE_TYPES.REMOVE]: 6,
  [MOVE_TYPES.INFLUENCE]: 5,
  [MOVE_TYPES.ASSIST]: 2,
  [MOVE_TYPES.WITHDRAW]: 1
};
function decideDraftPick(obs, persona, rng = Math.random) {
  const pack = obs.draftPack || [];
  try {
    const fundingWeight = persona?.draftFundingWeight ?? 1;
    const firstBonus = persona?.firstPlayerBonus ?? 12;
    let bestTile = pack[0];
    let bestScore = -Infinity;
    for (const tileId of pack) {
      const tile = TILES[tileId];
      if (!tile) continue;
      const fundingScore = (tile.funding || 0) * fundingWeight * 3;
      const moveScore = (tile.moves || []).reduce((s2, m) => s2 + (DRAFT_MOVE_WEIGHTS[m] || 0), 0);
      const startBonus = tileId === "03" ? firstBonus : 0;
      const total = fundingScore + moveScore + startBonus + (rng() - 0.5) * 2;
      if (total > bestScore) {
        bestScore = total;
        bestTile = tileId;
      }
    }
    return { move: "selectDraftTile", args: [bestTile] };
  } catch {
    return { move: "selectDraftTile", args: [pack[0]] };
  }
}
function getValidReceivers2(obs) {
  return getValidReceivers(obs, obs.botId);
}
function isHonestRemoveUnjustified(cand, obs, botId) {
  const removeMoves = cand.moves.filter((m) => m.type === MOVE_TYPES.REMOVE);
  if (removeMoves.length === 0) return false;
  if (checkVictory(cand.afterBoard, botId)) return false;
  if ((obs.community?.marks || 0) === 0) return false;
  for (const rm of removeMoves) {
    const match = /^p(\d+)_/.exec(rm.from || "");
    if (!match) continue;
    const domPrefix = `p${match[1]}`;
    const oppId = String(parseInt(match[1], 10) - 1);
    if (evaluateDomain(obs.boardState, oppId) >= 75) return false;
    if (obs.boardState[`${domPrefix}_office`]) return false;
    let oppSeats = 0;
    for (let s2 = 1; s2 <= 6; s2++) {
      if (obs.boardState[`${domPrefix}_seat${s2}`]) oppSeats++;
    }
    if (oppSeats >= 5) return false;
    const upperKeys = [`${domPrefix}_rostrum1`, `${domPrefix}_rostrum2`, `${domPrefix}_office`];
    const upperBefore = upperKeys.filter((k2) => obs.boardState[k2]).length;
    const upperAfter = upperKeys.filter((k2) => cand.afterBoard[k2]).length;
    if (upperAfter < upperBefore) return false;
  }
  return true;
}
function decideCampaignMove(obs, persona, rng = Math.random) {
  const hand = obs.hand || [];
  const validReceivers = getValidReceivers2(obs);
  const fallback = {
    move: "submitTurnMovesAndTile",
    args: [{ tileId: hand[0], receiverId: validReceivers[0], moves: [] }]
  };
  try {
    if (hand.length === 0 || validReceivers.length === 0) return fallback;
    const botId = obs.botId;
    const aggression = persona?.aggressionWeight ?? 1;
    const bluffThreshold = persona?.bluffThreshold ?? 0.58;
    const bribeGenerosity = persona?.bribeGenerosity ?? 1;
    const myNotches = obs.players[botId]?.credibilityNotchesLost || 0;
    const candidates = generateLegalMovesForBot(obs.boardState, obs.community, botId, obs.numPlayers);
    const beforeCtx = createBeforeScoreContext(obs.boardState, botId, obs.numPlayers, aggression);
    const handByTypesKey = /* @__PURE__ */ new Map();
    const unseenSet = new Set(obs.unseenTileIds);
    for (const cand of candidates) {
      const delta = scoreBoardDeltaForMove(beforeCtx, cand.afterBoard, botId, obs.numPlayers, aggression);
      cand.score = delta.total;
      cand.ownDelta = delta.ownDelta;
      const needsPerCandCheck = cand.moves.length < 2;
      let honestInHand = !needsPerCandCheck ? handByTypesKey.get(cand.typesKey) : null;
      if (!honestInHand) {
        honestInHand = new Set(
          getTilesMatchingMoves(cand.moves, hand, botId, obs.boardState, obs.community, obs.numPlayers)
        );
        if (!needsPerCandCheck) handByTypesKey.set(cand.typesKey, honestInHand);
      }
      cand.honestInHand = honestInHand;
    }
    const tilesWithHonestPlay = /* @__PURE__ */ new Set();
    for (const cand of candidates) {
      for (const tid of cand.honestInHand) tilesWithHonestPlay.add(tid);
    }
    if (tilesWithHonestPlay.size === 0) {
      for (const tid of hand) {
        const fbMoves = buildGenericCommunityReexecuteFallback(obs, tid, candidates);
        if (fbMoves.length > 0) {
          return {
            move: "submitTurnMovesAndTile",
            args: [{ tileId: tid, receiverId: validReceivers[0], moves: fbMoves }]
          };
        }
      }
    }
    const sortedCands = [...candidates].sort((a2, b2) => b2.score - a2.score);
    const pool = new Set(sortedCands.slice(0, 10));
    const zeroMove = candidates.find((c2) => c2.moves.length === 0);
    if (zeroMove) pool.add(zeroMove);
    for (const tileId of hand) {
      const bestHonest = sortedCands.find((c2) => c2.honestInHand.has(tileId));
      if (bestHonest) pool.add(bestHonest);
    }
    const deckMetaByTypesKey = /* @__PURE__ */ new Map();
    for (const cand of pool) {
      const needsPerCandCheck = cand.moves.length < 2;
      let deckMeta = !needsPerCandCheck ? deckMetaByTypesKey.get(cand.typesKey) : null;
      if (!deckMeta) {
        const deckHonest = getTilesMatchingMoves(
          cand.moves,
          STANDARD_TILE_IDS,
          botId,
          obs.boardState,
          obs.community,
          obs.numPlayers
        );
        deckMeta = {
          unseenMatches: deckHonest.filter((id) => unseenSet.has(id)).length,
          deckMatches: deckHonest.length
        };
        if (!needsPerCandCheck) deckMetaByTypesKey.set(cand.typesKey, deckMeta);
      }
      cand.meta = { honestInHand: cand.honestInHand, ...deckMeta };
    }
    const hasChallengers = (recId) => Object.keys(obs.players).some(
      (id) => id !== botId && id !== recId && (obs.players[id].credibilityRemaining || 0) > 0
    );
    let emptySeatCount = 0;
    for (const k2 of Object.keys(obs.boardState)) {
      if (k2.includes("_seat") && obs.boardState[k2] === null) emptySeatCount++;
    }
    const oppReceivers = validReceivers.filter((id) => id !== botId);
    const minOppBank = oppReceivers.length > 0 ? Math.min(...oppReceivers.map((id) => obs.players[id]?.bankCount || 0)) : 0;
    let bestChoice = null;
    let bestUtility = -Infinity;
    for (const cand of pool) {
      const meta = cand.meta;
      const unjustifiedRemove = isHonestRemoveUnjustified(cand, obs, botId);
      for (const tileId of hand) {
        const isHonest = meta.honestInHand.has(tileId);
        const funding = TILES[tileId]?.funding || 0;
        const tileMoves = TILES[tileId]?.moves || [];
        const needsEmptySeatSoon = emptySeatCount <= 9 && tileMoves.length === 2 && (tileMoves.includes(MOVE_TYPES.ASSIST) || tileMoves.includes(MOVE_TYPES.ORGANIZE) || tileMoves.includes(MOVE_TYPES.INFLUENCE));
        for (const receiverId of validReceivers) {
          const isSelf = receiverId === botId;
          const recCred = obs.players[receiverId]?.credibilityRemaining || 0;
          const recScore = evaluateDomain(obs.boardState, receiverId);
          const bankDiff = isSelf ? 0 : (obs.players[receiverId]?.bankCount || 0) - minOppBank;
          const bankTerm = -bankDiff * 5.5;
          let utility;
          if (isHonest) {
            const fundingTerm = isSelf ? funding * 2.2 : -funding * 1.3;
            const targetTerm = isSelf ? 0 : -recScore * 0.15;
            const urgencyTerm = needsEmptySeatSoon ? emptySeatCount <= 5 ? 24 : 14 : 0;
            const removePenalty = unjustifiedRemove ? cand.moves.length === 1 ? 18 : 14 : 0;
            utility = cand.score + fundingTerm + targetTerm + bankTerm + urgencyTerm - removePenalty;
          } else {
            const bluffPenalty = bluffThreshold * 58;
            const credRisk = myNotches >= 3 ? 38 : myNotches === 2 ? 42 : myNotches === 1 ? 18 : 10;
            let plausibilityPenalty = 0;
            if (!tilesWithHonestPlay.has(tileId)) {
              plausibilityPenalty = recCred > 0 ? 700 : 400;
            } else if (meta.deckMatches === 0) {
              plausibilityPenalty = 110;
            } else if (meta.unseenMatches === 0 && (recCred > 0 || hasChallengers(receiverId))) {
              plausibilityPenalty = 95;
            }
            const weakBribePenalty = !isSelf && recCred > 0 && funding < 5 ? 26 : 0;
            const bribeTerm = isSelf ? funding * 2 : recCred > 0 ? funding * 2 * bribeGenerosity - weakBribePenalty : -funding * 1.5;
            utility = cand.score * 0.9 + bribeTerm + bankTerm - bluffPenalty - credRisk - plausibilityPenalty - (isSelf ? 0 : recScore * 0.12);
          }
          utility += (rng() - 0.5) * 3;
          if (utility > bestUtility) {
            bestUtility = utility;
            bestChoice = { tileId, receiverId, moves: cand.moves };
          }
        }
      }
    }
    if (bestChoice && validateMoveCombination(bestChoice.moves, botId, obs.boardState, obs.community, obs.numPlayers).valid) {
      return { move: "submitTurnMovesAndTile", args: [bestChoice] };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

// src/ai/decisions.js
function decideAction(obs, persona, rng = Math.random) {
  if (!obs || obs.winner) return null;
  if (obs.phase !== "draft" && obs.currentPlayer !== null && obs.currentPlayer !== obs.botId) {
    return null;
  }
  if (obs.pendingSupport) {
    if (String(obs.pendingSupport.ownerId) !== obs.botId) return null;
    return decideSupportDrop(obs);
  }
  if (obs.pendingPlay) {
    const pp = obs.pendingPlay;
    if (pp.activePlayer !== null && String(pp.activePlayer) !== obs.botId) {
      return null;
    }
    switch (pp.step) {
      case "receipt":
        return decideReceipt(obs, persona, rng);
      case "challenge":
        return decideChallenge(obs, persona, rng);
      case "reexecute":
        return decideReexecute(obs, persona);
      case "penaltyWithdraw":
        return decidePenaltyWithdraw(obs, persona);
      case "receiverReward":
        return decideReceiverReward(obs, persona);
      case "freeAdvance":
        return decideFreeAdvance(obs, persona);
      case "challengerReward":
        return decideChallengerReward(obs, persona, rng);
      default:
        return null;
    }
  }
  if (obs.phase === "draft") {
    if (!obs.hasDraftedThisRound && (obs.draftPack?.length || 0) > 0) {
      return decideDraftPick(obs, persona, rng);
    }
    return null;
  }
  if (obs.phase === "campaign") {
    if (obs.currentPlayer === obs.botId && (obs.hand?.length || 0) > 0) {
      return decideCampaignMove(obs, persona, rng);
    }
    return null;
  }
  if (obs.phase === "bureaucracy") {
    if (obs.currentPlayer === obs.botId) {
      return decideBureaucracyAction(obs, persona, rng);
    }
    return null;
  }
  return null;
}

// src/ai/soloController.js
function formatBotStatus(obs, persona) {
  const name = persona?.name || `Bot ${obs.botId}`;
  if (obs.pendingSupport) {
    return `${name} is moving an unsupported piece...`;
  }
  if (obs.pendingPlay) {
    switch (obs.pendingPlay.step) {
      case "receipt":
        return `${name} is inspecting the tile...`;
      case "challenge":
        return `${name} is deciding whether to challenge...`;
      case "reexecute":
        return `${name} is re-executing honestly...`;
      case "penaltyWithdraw":
        return `${name} is choosing a penalty withdraw...`;
      case "receiverReward":
        return `${name} is selecting a whistleblower reward...`;
      case "freeAdvance":
        return `${name} is taking a free Advance...`;
      case "challengerReward":
        return `${name} is claiming a challenge reward...`;
      default:
        return `${name} is responding...`;
    }
  }
  if (obs.phase === "draft") return `${name} is drafting a tile...`;
  if (obs.phase === "bureaucracy") return `${name} is spending Bureaucracy funding...`;
  return `${name} is planning a turn...`;
}
function computeDelayMs(obs, persona, delayOverrideMs, rng) {
  if (typeof delayOverrideMs === "number") return Math.max(0, delayOverrideMs);
  const [minMs, maxMs] = persona?.thinkingDelayMs || [800, 1600];
  let delay = minMs + Math.floor(rng() * Math.max(1, maxMs - minMs));
  if (obs.phase === "draft") {
    return delay;
  }
  if (obs.phase === "bureaucracy") {
    return Math.max(1800, Math.round(delay * 1.6));
  }
  if (obs.pendingPlay && (obs.pendingPlay.step === "receipt" || obs.pendingPlay.step === "challenge")) {
    return Math.max(2600, Math.round(delay * 2));
  }
  return Math.max(2200, Math.round(delay * 1.9));
}
function computeActionKey(matchID, state, obs, botId) {
  if (obs.pendingSupport) {
    return `${matchID}:support:${obs.pendingSupport.from}:${obs.pendingSupport.ownerId}:${state._stateID}`;
  }
  if (obs.phase === "draft") {
    return `${matchID}:draft:${obs.draftPack.length}:${obs.hasDraftedThisRound}:${botId}`;
  }
  const step = obs.pendingPlay ? `${obs.pendingPlay.step}_${obs.pendingPlay.challengesPassed.length}` : "turn";
  return `${matchID}:${obs.phase}:${obs.turn}:${step}:${botId}:${state._stateID}`;
}
function createSoloController({
  game,
  matchID,
  numPlayers = 3,
  multiplayer = Local(),
  botIds = ["1", "2"],
  credentialsByBot = {},
  personaOverrides = {},
  onStatusChange = null,
  onBotError = null,
  delayOverrideMs = null,
  rng = Math.random
}) {
  let destroyed = false;
  const timers = /* @__PURE__ */ new Map();
  const scheduledKeys = /* @__PURE__ */ new Map();
  const lastDispatched = /* @__PURE__ */ new Map();
  const activeStatuses = /* @__PURE__ */ new Map();
  const personas = {};
  const memories = {};
  const clients = {};
  const unsubs = [];
  const randomPersonas = pickRandomPersonas(botIds.length, rng);
  botIds.forEach((botId, idx) => {
    const override = personaOverrides[botId];
    personas[botId] = override && typeof override === "object" ? { ...randomPersonas[idx], ...override } : randomPersonas[idx];
    memories[botId] = createBotMemory();
  });
  const emitStatus = () => {
    if (typeof onStatusChange !== "function") return;
    const first = activeStatuses.values().next().value || null;
    onStatusChange(first);
  };
  const clearBotTimer = (botId) => {
    const t2 = timers.get(botId);
    if (t2 !== void 0) {
      clearTimeout(t2);
      timers.delete(botId);
    }
    if (activeStatuses.delete(botId)) {
      emitStatus();
    }
  };
  const evaluateBot = (botId) => {
    if (destroyed) return;
    const client = clients[botId];
    if (!client) return;
    const state = client.getState();
    if (!state || !state.G || !state.ctx) return;
    if (state.G.winner || state.ctx.gameover) {
      clearBotTimer(botId);
      return;
    }
    updateBotMemory(memories[botId], state.G, state.ctx, botId, personas[botId], rng);
    const obs = buildBotObservation(state.G, state.ctx, botId, memories[botId]);
    const previewDecision = decideAction(obs, personas[botId], rng);
    if (!previewDecision) {
      if (obs.phase !== "draft" || obs.hasDraftedThisRound) {
        clearBotTimer(botId);
        scheduledKeys.delete(botId);
      }
      return;
    }
    const key = computeActionKey(matchID, state, obs, botId);
    if (scheduledKeys.get(botId) === key && timers.has(botId)) return;
    const prev = lastDispatched.get(botId);
    if (prev && prev.stateID === state._stateID && (prev.count >= 3 || Date.now() - prev.at < 4e3)) {
      return;
    }
    clearBotTimer(botId);
    scheduledKeys.set(botId, key);
    const statusText = formatBotStatus(obs, personas[botId]);
    activeStatuses.set(botId, { botId, name: personas[botId].name, text: statusText });
    emitStatus();
    const delayMs = computeDelayMs(obs, personas[botId], delayOverrideMs, rng);
    const timerId = setTimeout(() => {
      timers.delete(botId);
      activeStatuses.delete(botId);
      emitStatus();
      if (destroyed) return;
      try {
        const freshState = client.getState();
        if (!freshState || !freshState.G || !freshState.ctx) return;
        if (freshState.G.winner || freshState.ctx.gameover) return;
        if (freshState.isConnected === false) return;
        updateBotMemory(memories[botId], freshState.G, freshState.ctx, botId, personas[botId], rng);
        const freshObs = buildBotObservation(freshState.G, freshState.ctx, botId, memories[botId]);
        const decision = decideAction(freshObs, personas[botId], rng);
        if (!decision) return;
        const moveFn = client.moves?.[decision.move];
        if (typeof moveFn === "function") {
          const cur = lastDispatched.get(botId);
          const count = cur && cur.stateID === freshState._stateID ? cur.count + 1 : 1;
          lastDispatched.set(botId, { stateID: freshState._stateID, at: Date.now(), count });
          moveFn(...decision.args || []);
        }
      } catch (err) {
        if (typeof onBotError === "function") onBotError(err, botId);
      }
    }, delayMs);
    timers.set(botId, timerId);
  };
  for (const botId of botIds) {
    const botKey = String(botId);
    const clientOpts = {
      game,
      numPlayers,
      matchID,
      playerID: botKey,
      multiplayer
    };
    if (credentialsByBot && credentialsByBot[botKey]) {
      clientOpts.credentials = credentialsByBot[botKey];
    }
    const client = Client(clientOpts);
    clients[botId] = client;
    const unsub = client.subscribe(() => evaluateBot(botId));
    unsubs.push(unsub);
    client.start();
  }
  return {
    stop() {
      if (destroyed) return;
      destroyed = true;
      for (const t2 of timers.values()) clearTimeout(t2);
      timers.clear();
      scheduledKeys.clear();
      activeStatuses.clear();
      if (typeof onStatusChange === "function") onStatusChange(null);
      unsubs.forEach((fn2) => fn2());
      Object.values(clients).forEach((c2) => c2.stop());
    },
    getClients() {
      return { ...clients };
    }
  };
}

// src/ai/serverBotRunner.js
function isBotMeta(p2) {
  return Boolean(p2 && (p2.data && p2.data.isBot || p2.name && p2.name.endsWith("(Bot)")));
}
function createKredBotManager({ db, port = 4002 }) {
  const controllers = /* @__PURE__ */ new Map();
  const baseUrl = `http://127.0.0.1:${port}`;
  function stopMatchBots(matchID) {
    const entry = controllers.get(matchID);
    if (!entry) return;
    clearInterval(entry.watchdog);
    try {
      entry.controller.stop();
    } catch {
    }
    controllers.delete(matchID);
    console.log(`[KRED-BOTS] Stopped bots for match ${matchID}`);
  }
  async function attachMatchBots(matchID) {
    if (!matchID || !db) return { attached: false, botIds: [] };
    const { metadata, state } = await db.fetch(matchID, { metadata: true, state: true });
    if (!metadata || metadata.gameName !== "kred") return { attached: false, botIds: [] };
    if (metadata.gameover || state?.G?.winner || state?.ctx?.gameover) {
      stopMatchBots(matchID);
      return { attached: false, botIds: [] };
    }
    const players = Object.values(metadata.players || {});
    const creds = {};
    const personaOverrides = {};
    for (const p2 of players) {
      if (isBotMeta(p2) && p2.credentials) {
        const seatId = String(p2.id);
        creds[seatId] = p2.credentials;
        const matched = p2.data?.personaId !== void 0 ? getBotPersona(p2.data.personaId) : findPersonaByName(p2.name);
        if (matched) personaOverrides[seatId] = matched;
      }
    }
    const botIds = Object.keys(creds);
    if (botIds.length === 0) return { attached: false, botIds: [] };
    const existing = controllers.get(matchID);
    if (existing && existing.botIdsKey === botIds.join(",")) {
      return { attached: true, botIds };
    }
    if (existing) stopMatchBots(matchID);
    const numPlayers = players.length || 3;
    const controller = createSoloController({
      game: createKredGame(numPlayers, false),
      matchID,
      numPlayers,
      botIds,
      credentialsByBot: creds,
      personaOverrides,
      multiplayer: SocketIO({ server: baseUrl, socketOpts: { forceNew: true } }),
      onBotError: (err, id) => console.error(`[KRED-BOTS] Match ${matchID} bot ${id} error:`, err?.message || err)
    });
    const watchdog = setInterval(async () => {
      try {
        const clients = controller.getClients();
        const first = Object.values(clients)[0];
        const st = first?.getState?.();
        if (st && (st.G?.winner || st.ctx?.gameover)) {
          stopMatchBots(matchID);
          return;
        }
        const check = await db.fetch(matchID, { metadata: true });
        if (!check?.metadata || check.metadata.gameover) {
          stopMatchBots(matchID);
        }
      } catch {
      }
    }, 1e4);
    controllers.set(matchID, { controller, watchdog, botIdsKey: botIds.join(",") });
    console.log(`[KRED-BOTS] Attached bots [${botIds.join(", ")}] to match ${matchID}`);
    return { attached: true, botIds };
  }
  async function startBotsForMatch(matchID) {
    if (!matchID || !db) throw new Error("Match ID required");
    const { metadata } = await db.fetch(matchID, { metadata: true });
    if (!metadata || metadata.gameName !== "kred") {
      throw new Error("KRED match not found");
    }
    const players = Object.values(metadata.players || {});
    const openSeats = players.filter((seat) => seat && !seat.name);
    const chosenPersonas = pickRandomPersonas(openSeats.length);
    for (let i2 = 0; i2 < openSeats.length; i2++) {
      const seat = openSeats[i2];
      const seatId = String(seat.id);
      const persona = chosenPersonas[i2];
      try {
        await fetch(`${baseUrl}/games/kred/${matchID}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerID: seatId,
            playerName: `${persona.name} (Bot)`,
            data: { isBot: true, personaId: persona.id }
          })
        });
      } catch {
      }
    }
    return attachMatchBots(matchID);
  }
  async function reattachAllActiveMatches() {
    if (!db) return;
    try {
      const matchIds = await db.listMatches();
      for (const matchID of matchIds) {
        await attachMatchBots(matchID);
      }
    } catch (err) {
      console.error("[KRED-BOTS] Error reattaching active matches:", err.message);
    }
  }
  return {
    attachMatchBots,
    startBotsForMatch,
    reattachAllActiveMatches,
    stopMatchBots
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createKredBotManager
});
/*! Bundled license information:

xmlhttprequest-ssl/lib/XMLHttpRequest.js:
  (**
   * Wrapper for built-in http.js to emulate the browser XMLHttpRequest object.
   *
   * This can be used with JS designed for browsers to improve reuse of code and
   * allow the use of existing libraries.
   *
   * Usage: include("XMLHttpRequest.js") and use XMLHttpRequest per W3C specs.
   *
   * @author Dan DeFelippi <dan@driverdan.com>
   * @contributor David Ellis <d.f.ellis@ieee.org>
   * @license MIT
   *)

boardgame.io/dist/esm/Debug-8242c26e.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)
*/
