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

// node_modules/lodash.isplainobject/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.isplainobject/index.js"(exports2, module2) {
    var objectTag = "[object Object]";
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
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
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isPlainObject2(value) {
      if (!isObjectLike(value) || objectToString.call(value) != objectTag || isHostObject(value)) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    module2.exports = isPlainObject2;
  }
});

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
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
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
  util2.jsonStringifyReplacer = (_2, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
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
    const processError = (error) => {
      for (const issue of error.issues) {
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
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
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
  const error = new ZodError(issues);
  return error;
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
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
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
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
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
        const error = new ZodError(ctx.common.issues);
        this._error = error;
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
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
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
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
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
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
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
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
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
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
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
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
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
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
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
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
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
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
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
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
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
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
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
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
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
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x2) => !!x2),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x2) => !!x2),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn2 = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn2, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
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
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
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
  4: { PROMOTE_OFFICE: 18, EXTRA_ACTION: 15, PROMOTE_ROSTRUM: 12, BASIC_ACTION: 9, PROMOTE_SEAT: 6, RESTORE_CRED: 3 },
  5: { PROMOTE_OFFICE: 12, EXTRA_ACTION: 10, PROMOTE_ROSTRUM: 8, BASIC_ACTION: 6, PROMOTE_SEAT: 4, RESTORE_CRED: 2 }
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
var GAME_EVENT = "GAME_EVENT";
var automaticGameEvent = (type, args, playerID, credentials) => ({
  type: GAME_EVENT,
  payload: { type, args, playerID, credentials },
  automatic: true
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
function isSerializable(value) {
  if (value === void 0 || value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return true;
  }
  if (!(0, import_lodash.default)(value) && !Array.isArray(value)) {
    return false;
  }
  for (const key in value) {
    if (!isSerializable(value[key]))
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
var CORE_PLUGINS = [ImmerPlugin, RandomPlugin, LogPlugin, SerializablePlugin];
var DEFAULT_PLUGINS = [...CORE_PLUGINS, EventsPlugin];
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

// node_modules/boardgame.io/dist/esm/core.js
var import_lodash2 = __toESM(require_lodash());

// src/domain/board.js
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
  const ALL_TILE_IDS = Object.keys(TILES).filter((k2) => k2 !== "BLANK");
  const usedTileIds = /* @__PURE__ */ new Set();
  Object.values(targetG.players).forEach((p2) => {
    (p2.hand || []).forEach((t2) => {
      if (t2 && t2 !== "HIDDEN") usedTileIds.add(t2);
    });
    (p2.bank || []).forEach((b2) => {
      if (b2 && b2.tileId && b2.tileId !== "HIDDEN") usedTileIds.add(b2.tileId);
    });
  });
  const unusedTiles = ALL_TILE_IDS.filter((id) => !usedTileIds.has(id));
  Object.values(targetG.players).forEach((p2) => {
    if (p2.hand) {
      p2.hand = p2.hand.map((t2) => {
        if (t2 === "HIDDEN" || !t2) {
          return unusedTiles.pop() || "01";
        }
        return t2;
      });
    }
    if (p2.bank) {
      p2.bank = p2.bank.map((b2) => {
        if (b2 && b2.tileId === "HIDDEN") {
          return { ...b2, tileId: unusedTiles.pop() || "01" };
        }
        return b2;
      });
    }
  });
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
  const handleSkipDraft = ({ G: G2, events }) => {
    const np = G2.numPlayers || 3;
    const order = getClockwiseOrder(np);
    order.forEach((pId) => {
      const pack = G2.draftPacks ? G2.draftPacks[pId] || [] : [];
      G2.players[pId].hand = [...G2.players[pId].hand || [], ...pack];
      if (G2.draftPacks) G2.draftPacks[pId] = [];
    });
    G2.draftSelectionsThisRound = {};
    if (events && events.setPhase) {
      events.setPhase("campaign");
    }
  };
  const handleSelectDraftTile = ({ G: G2, ctx, playerID, events }, tileId) => {
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
    const allSelected = Object.keys(G2.players).every((id) => G2.draftSelectionsThisRound[id]);
    if (allSelected) {
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
      if (!hasMoreTiles && events && events.setPhase) {
        events.setPhase("campaign");
      }
    }
  };
  return {
    start: true,
    moves: {
      skipDraftPhase: handleSkipDraft,
      loadSaveState: handleLoadSaveState,
      selectDraftTile: handleSelectDraftTile
    },
    turn: {
      activePlayers: { all: "drafting" },
      moves: {
        skipDraftPhase: handleSkipDraft,
        loadSaveState: handleLoadSaveState,
        selectDraftTile: handleSelectDraftTile
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
  const movedPieceId = stagedMoves && stagedMoves.length > 0 ? stagedMoves[0]?.pieceId : null;
  if (boardState) {
    Object.keys(boardState).forEach((k2) => {
      if (k2.startsWith("community_") && boardState[k2]) {
        const piece = boardState[k2];
        if (movedPieceId && piece.id === movedPieceId) {
          return;
        }
        if (piece.type === PIECE_TYPES.MARK) hasMarks = true;
        if (piece.type === PIECE_TYPES.HEEL) hasHeels = true;
      }
    });
  } else if (community) {
    if (community.marks > 0) hasMarks = true;
    if (community.heels > 0) hasHeels = true;
  }
  if (pieceType === PIECE_TYPES.HEEL && hasMarks) {
    return false;
  }
  if (pieceType === PIECE_TYPES.PAWN && (hasMarks || hasHeels)) {
    return false;
  }
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
          if (piece.type !== PIECE_TYPES.MARK && piece.type !== PIECE_TYPES.HEEL) {
            return { valid: false, reason: "Only Marks and Heels can be placed in Seats" };
          }
        } else {
          if (community && community.marks === 0 && community.heels === 0) {
            return { valid: false, reason: "No Marks or Heels available in Community" };
          }
          pieceType = community?.marks > 0 ? PIECE_TYPES.MARK : PIECE_TYPES.HEEL;
        }
        if (!isCommunityPieceAvailable(pieceType, boardState, community, stagedMoves)) {
          return { valid: false, reason: `${pieceType}s cannot be taken from Community until lower tier pieces are depleted` };
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
function applyMoveToState(move, boardState, community) {
  const { type, from, to } = move;
  let pieceToMove = null;
  const isFromComm = from === "community" || from.startsWith("community_");
  const isToComm = to === "community" || to.startsWith("community_");
  if (isFromComm) {
    if (from !== "community" && boardState[from]) {
      pieceToMove = boardState[from];
      boardState[from] = null;
    } else {
      const commKeys = Object.keys(boardState).filter((k2) => k2.startsWith("community_")).sort((a2, b2) => parseInt(a2.replace("community_", ""), 10) - parseInt(b2.replace("community_", ""), 10));
      let commKey = commKeys.find((k2) => boardState[k2]?.type === PIECE_TYPES.MARK);
      if (!commKey) commKey = commKeys.find((k2) => boardState[k2]?.type === PIECE_TYPES.HEEL);
      if (!commKey) commKey = commKeys.find((k2) => boardState[k2] !== null);
      if (commKey) {
        pieceToMove = boardState[commKey];
        boardState[commKey] = null;
      } else {
        if (community && community.marks > 0) {
          community.marks--;
          pieceToMove = { id: `m_${Date.now()}_${Math.random()}`, type: PIECE_TYPES.MARK };
        } else if (community && community.heels > 0) {
          community.heels--;
          pieceToMove = { id: `h_${Date.now()}_${Math.random()}`, type: PIECE_TYPES.HEEL };
        }
      }
    }
  } else {
    pieceToMove = boardState[from];
    boardState[from] = null;
  }
  if (isToComm) {
    if (to !== "community" && to.startsWith("community_")) {
      boardState[to] = pieceToMove;
    } else {
      const commKeys = Object.keys(boardState).filter((k2) => k2.startsWith("community_")).sort((a2, b2) => parseInt(a2.replace("community_", ""), 10) - parseInt(b2.replace("community_", ""), 10));
      const emptyCommKey = commKeys.find((k2) => boardState[k2] === null);
      if (emptyCommKey) {
        boardState[emptyCommKey] = pieceToMove;
      }
    }
  } else {
    boardState[to] = pieceToMove;
  }
}
function isMoveTypePossible(moveType, moverId, boardState, community, numPlayers) {
  if (!boardState) return true;
  const candidateKeys = Object.keys(boardState);
  const fromCandidates = candidateKeys.filter((k2) => !k2.startsWith("community_") || boardState[k2] !== null);
  if (!fromCandidates.includes("community")) fromCandidates.push("community");
  const toCandidates = candidateKeys.filter((k2) => !k2.startsWith("community_"));
  if (!toCandidates.includes("community")) toCandidates.push("community");
  for (const fromLoc of fromCandidates) {
    for (const toLoc of toCandidates) {
      if (fromLoc === toLoc) continue;
      const moveCandidate = { type: moveType, from: fromLoc, to: toLoc };
      const val = validateSingleMove(moveCandidate, moverId, boardState, community, numPlayers);
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
    for (const m of movesMade || []) {
      const idx = unperformedMoves.indexOf(m.type);
      if (idx !== -1) unperformedMoves.splice(idx, 1);
    }
    const tempBoard = JSON.parse(JSON.stringify(boardState));
    const tempComm = community ? JSON.parse(JSON.stringify(community)) : null;
    const allUnperformedImpossible = unperformedMoves.every((reqType) => {
      return !isMoveTypePossible(reqType, moverId, tempBoard, tempComm, numPlayers);
    });
    if (allUnperformedImpossible) {
      return "Honest";
    }
  }
  return "Dishonest";
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
  Object.keys(G2.players).forEach((pId) => {
    if (G2.players[pId].bank) {
      G2.players[pId].hand = G2.players[pId].bank.map((b2) => b2.tileId);
      G2.players[pId].bank = [];
    }
  });
  Object.keys(G2.players).forEach((pId) => {
    if (checkVictory(G2.boardState, pId)) {
      G2.winner = pId;
    }
  });
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
    G2.boardState = enforceSupportRule(G2.boardState, G2.numPlayers);
    return true;
  }
  return false;
}
function createBureaucracyPhase() {
  return {
    onBegin: ({ G: G2 }) => {
      initBureaucracy(G2);
    },
    turn: {
      order: {
        first: ({ G: G2 }) => G2 && G2.bureaucracyTurnOrder && G2.bureaucracyTurnOrder.length > 0 ? parseInt(G2.bureaucracyTurnOrder[0], 10) : 0,
        next: ({ G: G2 }) => {
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
      buyBureaucracyAction: ({ G: G2, ctx, playerID }, { actionType, targetLoc, subAction }) => {
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
      },
      endBureaucracyTurn: ({ G: G2, events }) => {
        if (G2) {
          G2.bureaucracyTurnIndex = (G2.bureaucracyTurnIndex || 0) + 1;
        }
        events.endTurn();
      }
    },
    endIf: ({ G: G2 }) => {
      if (!G2 || G2.bureaucracyTurnIndex === void 0 || !G2.bureaucracyTurnOrder) return false;
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
function finishPendingPlayOrReward(G2) {
  const challengerId = G2.pendingPlay?.successfulChallengerId;
  const receiverId = G2.pendingPlay?.receiverId || G2.nextMoverId;
  const tileId = G2.pendingPlay?.reexecuteTileId || G2.pendingPlay?.tileIdPlayed;
  if (tileId && tileId !== "BLANK") {
    const winners = Object.keys(G2.players).filter((p2) => checkVictory(G2.boardState, p2));
    if (winners.length > 1) G2.winner = "draw";
    else if (winners.length === 1) G2.winner = winners[0];
  }
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
function createCampaignPhase() {
  return {
    onBegin: ({ G: G2 }) => {
      if (!G2 || !G2.players) return;
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
            return parseInt(G2.nextMoverId, 10);
          }
          let startP = "0";
          Object.keys(G2.players).forEach((pId) => {
            if (G2.players[pId].hand && G2.players[pId].hand.includes("03")) startP = pId;
          });
          return parseInt(startP, 10);
        },
        next: ({ G: G2, ctx }) => {
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
          const np = G2 ? G2.numPlayers : 3;
          let targetId = G2 && G2.nextMoverId !== void 0 && G2.nextMoverId !== null ? String(G2.nextMoverId) : String(ctx.currentPlayer);
          let searchCount = 0;
          while (G2 && G2.players && G2.players[targetId] && G2.players[targetId].hand.length === 0 && searchCount < np) {
            targetId = getNextPlayer(targetId, np);
            searchCount++;
          }
          return parseInt(targetId, 10);
        }
      }
    },
    moves: {
      loadSaveState: handleLoadSaveState,
      submitTurnMovesAndTile: ({ G: G2, ctx, playerID, events }, payload) => {
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
        const tilesPerPlayer = (INITIAL_PIECE_COUNTS[G2.numPlayers] || INITIAL_PIECE_COUNTS[3]).TILES_PER_PLAYER;
        const receiverBank = G2.players[receiverId]?.bank || [];
        if (receiverBank.length >= tilesPerPlayer) {
          console.warn(`[submitTurnMovesAndTile] Receiver ${receiverId} bank is already full (${receiverBank.length}/${tilesPerPlayer}).`);
          return INVALID_MOVE;
        }
        if (receiverId === moverId) {
          const hasValidOpponentTarget = Object.keys(G2.players).some(
            (p2) => p2 !== moverId && (G2.players[p2].bank || []).length < tilesPerPlayer
          );
          if (hasValidOpponentTarget) {
            console.warn("[submitTurnMovesAndTile] Self-play disallowed because valid opponents with empty bank slots exist.");
            return INVALID_MOVE;
          }
        }
        const val = validateMoveCombination(moveActions, moverId, G2.boardState, G2.community, G2.numPlayers);
        if (!val.valid) {
          console.warn("[submitTurnMovesAndTile] Move combination validation failed:", val.reason);
          return INVALID_MOVE;
        }
        const backupBoard = JSON.parse(JSON.stringify(G2.boardState));
        const backupCommunity = JSON.parse(JSON.stringify(G2.community));
        moveActions.forEach((m) => applyMoveToState(m, G2.boardState, G2.community));
        G2.boardState = enforceSupportRule(G2.boardState, G2.numPlayers);
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
        if (G2.players[receiverId].credibilityNotchesLost >= 3 || tileId === "BLANK") {
          G2.pendingPlay.step = "challenge";
        }
        events.endTurn();
      },
      acceptTile: ({ G: G2, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G2.pendingPlay || G2.pendingPlay.step !== "receipt" || G2.pendingPlay.receiverId !== pId) {
          return INVALID_MOVE;
        }
        const eligibleChallengers = getOrderedChallengers(G2);
        if (eligibleChallengers.length === 0) {
          const { receiverId, tileIdPlayed } = G2.pendingPlay;
          G2.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
          G2.nextMoverId = receiverId;
          G2.pendingPlay = null;
          if (tileIdPlayed !== "BLANK") {
            const winners = Object.keys(G2.players).filter((p2) => checkVictory(G2.boardState, p2));
            if (winners.length > 1) G2.winner = "draw";
            else if (winners.length === 1) G2.winner = winners[0];
          }
        } else {
          G2.pendingPlay.step = "challenge";
        }
        events.endTurn();
      },
      rejectTile: ({ G: G2, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G2.pendingPlay || G2.pendingPlay.step !== "receipt" || G2.pendingPlay.receiverId !== pId) {
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
          if (tileIdPlayed !== "BLANK") {
            const winners = Object.keys(G2.players).filter((p2) => checkVictory(G2.boardState, p2));
            if (winners.length > 1) G2.winner = "draw";
            else if (winners.length === 1) G2.winner = winners[0];
          }
        }
        events.endTurn();
      },
      challengeTile: ({ G: G2, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G2.pendingPlay || G2.pendingPlay.step !== "challenge") return INVALID_MOVE;
        if (G2.players[pId].credibilityNotchesLost >= 3) return INVALID_MOVE;
        const eligibleChallengers = getOrderedChallengers(G2);
        const remaining = eligibleChallengers.filter(
          (id) => !G2.pendingPlay.challengesPassed.includes(id)
        );
        if (remaining.length === 0 || remaining[0] !== pId) return INVALID_MOVE;
        const challengerId = pId;
        const { moverId, receiverId, tileIdPlayed, playType, backupBoard, backupCommunity, moverStartCredNotches } = G2.pendingPlay;
        G2.nextMoverId = receiverId;
        if (playType === "Dishonest" || playType === "Illegal") {
          G2.boardState = backupBoard;
          G2.community = backupCommunity;
          if (G2.players[moverId].credibilityNotchesLost < 3) {
            G2.players[moverId].credibilityNotchesLost++;
          } else {
            G2.players[moverId].pendingPenaltyWithdraw = true;
          }
          G2.pendingPlay.successfulChallengerId = challengerId;
          if (G2.players[receiverId].credibilityNotchesLost < 3) {
            G2.players[receiverId].credibilityNotchesLost++;
          }
          G2.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: false });
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
          if (tileIdPlayed !== "BLANK") {
            const winners = Object.keys(G2.players).filter((p2) => checkVictory(G2.boardState, p2));
            if (winners.length > 1) G2.winner = "draw";
            else if (winners.length === 1) G2.winner = winners[0];
          }
        }
        events.endTurn();
      },
      passChallenge: ({ G: G2, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G2.pendingPlay || G2.pendingPlay.step !== "challenge") return INVALID_MOVE;
        const eligibleChallengers = getOrderedChallengers(G2);
        const remaining = eligibleChallengers.filter(
          (id) => !G2.pendingPlay.challengesPassed.includes(id)
        );
        if (remaining.length === 0 || remaining[0] !== pId) return INVALID_MOVE;
        G2.pendingPlay.challengesPassed.push(pId);
        if (G2.pendingPlay.challengesPassed.length >= eligibleChallengers.length) {
          const { receiverId, tileIdPlayed } = G2.pendingPlay;
          G2.players[receiverId].bank.push({ tileId: tileIdPlayed, faceDown: true });
          G2.nextMoverId = receiverId;
          G2.pendingPlay = null;
          if (tileIdPlayed !== "BLANK") {
            const winners = Object.keys(G2.players).filter((p2) => checkVictory(G2.boardState, p2));
            if (winners.length > 1) G2.winner = "draw";
            else if (winners.length === 1) G2.winner = winners[0];
          }
        }
        events.endTurn();
      },
      reexecuteHonestly: ({ G: G2, ctx, playerID, events }, payload) => {
        const moverId = String(playerID);
        if (!G2.pendingPlay || G2.pendingPlay.step !== "reexecute" || G2.pendingPlay.moverId !== moverId) return INVALID_MOVE;
        const moveActions = payload;
        const tileId = G2.pendingPlay.reexecuteTileId;
        const val = validateMoveCombination(moveActions, moverId, G2.boardState, G2.community, G2.numPlayers);
        if (!val.valid) return INVALID_MOVE;
        const playType = classifyPlay(moveActions, tileId, moverId, G2.boardState, G2.community, G2.numPlayers);
        if (playType !== "Honest") return INVALID_MOVE;
        moveActions.forEach((m) => applyMoveToState(m, G2.boardState, G2.community));
        G2.boardState = enforceSupportRule(G2.boardState, G2.numPlayers);
        if (G2.players[moverId].pendingPenaltyWithdraw) {
          G2.pendingPlay.step = "penaltyWithdraw";
        } else if (G2.pendingPlay.whistleblownByReceiver) {
          G2.pendingPlay.step = "receiverReward";
        } else {
          finishPendingPlayOrReward(G2);
        }
        events.endTurn();
      },
      executePenaltyWithdraw: ({ G: G2, ctx, playerID, events }, moveAction) => {
        const moverId = String(playerID);
        if (!G2.pendingPlay || G2.pendingPlay.step !== "penaltyWithdraw" || G2.pendingPlay.moverId !== moverId) return INVALID_MOVE;
        if (moveAction.type !== "Withdraw") return INVALID_MOVE;
        const val = validateSingleMove(moveAction, moverId, G2.boardState, G2.community, G2.numPlayers);
        if (!val.valid) return INVALID_MOVE;
        applyMoveToState(moveAction, G2.boardState, G2.community);
        G2.boardState = enforceSupportRule(G2.boardState, G2.numPlayers);
        G2.players[moverId].pendingPenaltyWithdraw = false;
        if (G2.pendingPlay.whistleblownByReceiver) {
          G2.pendingPlay.step = "receiverReward";
        } else {
          finishPendingPlayOrReward(G2);
        }
        events.endTurn();
      },
      claimReceiverCredibilityReward: ({ G: G2, ctx, playerID, events }) => {
        const receiverId = String(playerID);
        if (!G2.pendingPlay || G2.pendingPlay.step !== "receiverReward" || G2.pendingPlay.receiverId !== receiverId) {
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
        if (!G2.pendingPlay || G2.pendingPlay.step !== "receiverReward" || G2.pendingPlay.receiverId !== receiverId) {
          return INVALID_MOVE;
        }
        G2.pendingPlay.step = "freeAdvance";
        events.endTurn();
      },
      executeFreeAdvance: ({ G: G2, ctx, playerID, events }, moveAction) => {
        const receiverId = String(playerID);
        if (!G2.pendingPlay || G2.pendingPlay.step !== "freeAdvance" || G2.pendingPlay.receiverId !== receiverId) return INVALID_MOVE;
        if (moveAction.type !== "Advance") return INVALID_MOVE;
        const val = validateSingleMove(moveAction, receiverId, G2.boardState, G2.community, G2.numPlayers);
        if (!val.valid) return INVALID_MOVE;
        applyMoveToState(moveAction, G2.boardState, G2.community);
        G2.boardState = enforceSupportRule(G2.boardState, G2.numPlayers);
        finishPendingPlayOrReward(G2);
        events.endTurn();
      },
      claimChallengerCredibility: ({ G: G2, ctx, playerID, events }) => {
        const pId = String(playerID);
        if (!G2.pendingPlay || G2.pendingPlay.step !== "challengerReward" || String(G2.pendingPlay.successfulChallengerId) !== pId) {
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
        if (!G2.pendingPlay || G2.pendingPlay.step !== "challengerReward" || String(G2.pendingPlay.successfulChallengerId) !== pId) {
          return INVALID_MOVE;
        }
        const success = applyChallengerBureaucracyAction(G2, pId, payload);
        if (!success) return INVALID_MOVE;
        const receiverId = G2.pendingPlay.receiverId;
        G2.pendingPlay = null;
        if (receiverId !== void 0 && receiverId !== null) G2.nextMoverId = receiverId;
        events.endTurn();
      }
    },
    next: "bureaucracy",
    endIf: ({ G: G2 }) => {
      if (!G2 || !G2.players) return false;
      return Object.values(G2.players).every((p2) => p2 && p2.hand && p2.hand.length === 0) && !G2.pendingPlay;
    }
  };
}

// src/srcGame.js
function createKredGame(numPlayers, skipDraft = false) {
  return {
    name: "kred",
    minPlayers: 3,
    maxPlayers: 5,
    setup: ({ ctx, random }) => {
      const np = numPlayers || ctx.numPlayers || 3;
      console.log("[KredGame Setup] numPlayers:", np, "skipDraft:", skipDraft, "ctx.numPlayers:", ctx.numPlayers);
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
        if (skipDraft) {
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
      return {
        numPlayers: np,
        boardState,
        community,
        players,
        draftPacks,
        draftSelectionsThisRound: {},
        pendingPlay: null,
        nextMoverId: null,
        winner: null,
        history: []
      };
    },
    playerView: ({ G: G2 }) => {
      return G2;
    },
    phases: {
      draft: createDraftPhase(),
      campaign: createCampaignPhase(),
      bureaucracy: createBureaucracyPhase()
    }
  };
}
var KredGame = createKredGame(3);

// .temp-server-entry.js
var kredGame = createKredGame();
module.exports = kredGame;
module.exports.default = kredGame;
module.exports.KredGame = kredGame;
module.exports.createKredGame = createKredGame;
