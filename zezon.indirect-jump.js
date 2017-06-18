
function parse(input, output=[]) {
  let len = input.length;
  let pointer = 0;

  let top = 0;
  let topObj = output;
  let objStack = [output];
  let target = 'arr';
  let targetStack = ['arr'];
  let currentProperty = undefined;
  let propStack = [undefined];
  let numberStart = 0;

  let lastTable = null;
  let lastChar = '';

  function inContext(from) {
    //console.log(pointer, 'from:', from._, ', top =', top, ', prop:', currentProperty);
    let f = from;
    while (f) {
      lastTable = f;
      let d = c();
      lastChar = d;
      let o = f[d];
      //if (pointer / len > 0.99) console.log(pointer + ' (' + (pointer/len*100).toFixed(2) + '%)', '- ', f._, [d], ', top =', top, ', prop:', currentProperty)
      if (!o) break;
      f = o();
    }
  }

  function c() {
    return input.charAt(pointer++);
  }

  function intoObject() {
    topObj = objStack[++top] = {};
    target = targetStack[top] = 'obj';
    propStack.push(currentProperty);
    currentProperty = undefined;
    return object;
  }
  function intoArray() {
    topObj = objStack[++top] = [];
    target = targetStack[top] = 'arr';
    propStack.push(currentProperty);
    currentProperty = undefined;
    return array;
  }
  function outtaStruct() {
    let wasObj = topObj;
    topObj = objStack[--top];
    target = targetStack[top];
    currentProperty = propStack.pop();
    if (target === 'arr') {
      if (!topObj) console.log(top, objStack[0], objStack.length)
      topObj.push(wasObj);
    } else {
      topObj[currentProperty] = wasObj;
      currentProperty = undefined;
    }
    if (target === undefined) return topRest;
    if (target === 'obj') return objAfterValue;
    if (target === 'arr') return arrRest;
    return undefined;
  }

  let topLevel = {
    _: 'toplevel',
    // whitespace
    ' ': () => topLevel,
    '\n': () => topLevel,
    '\r': () => topLevel,
    '\t': () => topLevel,

    '{': intoObject,
    '[': intoArray,

    // idents
    'n': () => identNullN,
    'f': () => identFalseF,
    't': () => identTrueT,

    // string
    '"': string,

    // number
    '0': numberZero,
    '1': numberInt,
    '2': numberInt,
    '3': numberInt,
    '4': numberInt,
    '5': numberInt,
    '6': numberInt,
    '7': numberInt,
    '8': numberInt,
    '9': numberInt,
    '-': numberNegative,
  };
  let topRest = {
    ' ': () => topRest,
    '\n': () => topRest,
    '\r': () => topRest,
    '\t': () => topRest,
  };

  let object = {
    _: 'object',
    ' ': () => object,
    '\n': () => object,
    '\r': () => object,
    '\t': () => object,

    '}': outtaStruct,
    '"': string,
  };
  let objAfterValue = { // comma, no string
    _: 'objAfterValue',
    ' ': () => objAfterValue,
    '\n': () => objAfterValue,
    '\r': () => objAfterValue,
    '\t': () => objAfterValue,

    '}': outtaStruct,
    ',': () => objAfterComma,
  };
  let objAfterComma = { // string, no comma
    _: 'objAfterComma',
    ' ': () => objAfterComma,
    '\n': () => objAfterComma,
    '\r': () => objAfterComma,
    '\t': () => objAfterComma,

    '"': string,
  };
  let array = {
    _: 'array',
    ' ': () => array,
    '\n': () => array,
    '\r': () => array,
    '\t': () => array,

    ']': outtaStruct,
    ',': () => array,

    '{': intoObject,
    '[': intoArray,

    // idents
    'n': () => identNullN,
    'f': () => identFalseF,
    't': () => identTrueT,

    // string
    '"': string,

    // number
    '0': numberZero,
    '1': numberInt,
    '2': numberInt,
    '3': numberInt,
    '4': numberInt,
    '5': numberInt,
    '6': numberInt,
    '7': numberInt,
    '8': numberInt,
    '9': numberInt,
    '-': numberNegative,
  };
  let arrRest = {
    _: 'arrrest',
    ' ': () => arrRest,
    '\n': () => arrRest,
    '\r': () => arrRest,
    '\t': () => arrRest,

    ']': outtaStruct,
    ',': () => array,
  };

  let value = {
    _: 'value',
    // after colon or toplevel-whitespace or [ or array-comma
    // parse a value. number, string, object, array, true, false, null
    ' ': () => value,
    '\n': () => value,
    '\r': () => value,
    '\t': () => value,

    '{': intoObject,
    '[': intoArray,

    // idents
    'n': () => identNullN,
    'f': () => identFalseF,
    't': () => identTrueT,

    // string
    '"': string,

    // number
    '0': numberZero,
    '1': numberInt,
    '2': numberInt,
    '3': numberInt,
    '4': numberInt,
    '5': numberInt,
    '6': numberInt,
    '7': numberInt,
    '8': numberInt,
    '9': numberInt,
    '-': numberNegative,
  };

  function numberZero() {
    numberStart = pointer;
    return _numberZero();
  }
  function _numberZero() {
    let chr = c();
    if (chr === '.') return numberAfterDot();
    else return numberExp(chr);
  }
  function numberNegative() {
    numberStart = pointer;
    let chr = c();
    if (chr === 0) return numberZero();
    if (chr >= '0' && chr <= '9') return _numberInt();
    else THROW('requires digit');
  }
  function numberInt() {
    numberStart = pointer;
    return _numberInt();
  }
  function _numberInt() {
    let chr = c();
    while (chr >= '0' && chr <= '9') chr = c();
    if (chr === '.') return numberAfterDot();
    else return numberExp(chr);
  }
  function numberAfterDot() {
    let chr = c();
    if (chr >= '0' && chr <= '9') chr = c();
    else THROW('requires digit');
    while (chr >= '0' && chr <= '9') chr = c();
    return numberExp(chr);
  }
  function numberExp(chr) {
    if (chr === 'e' || chr === 'E') {
      chr = c();
      if (chr === '+' || chr === '-') chr = c();
      if (chr >= '0' && chr <= '9') chr = c();
      else return THROW('one digit');
      while (chr >= '0' && chr <= '9') chr = c();
    }

    setNum();

    return valueEnd[chr] && valueEnd[chr]();
  }

  function setNum() {
    let str = input.slice(numberStart - 1, pointer - 1);
    //console.log('setNum: parseFloat(', [str], ') = ', parseFloat(str), numberStart, pointer);
    let num = parseFloat(str);
    setValue(num);
  }
  function setValue(val) {
    //console.log('setValue', val)
    if (target === 'obj') {
      // note: string property handling is done in string() itself
      topObj[currentProperty] = val;
      currentProperty = undefined;
    } else if (target === 'arr') {
      topObj.push(val);
    } else {
      THROW('nope');
    }
  }

  function string(chr) {
    let start = pointer;
    do {
      if (chr === '"') {
        // TODO: properly decode escapes
        let str = input.slice(start, pointer - 1);
        if (target === 'obj') {
          if (currentProperty === undefined) {
            currentProperty = str;
            return colon;
          }

          topObj[currentProperty] = str;
          currentProperty = undefined;
          return objAfterValue;
        }
        if (target === 'arr') {
          topObj.push(str);
          return arrRest;
        }
        THROW('no otplevel');
      } else if (chr === '\\') {
        chr = inContext(escape[chr]);
      } else if (chr < ' ') {
        return undefined;
      } else if (pointer >= len) {
        return c();
      } else {
        chr = c();
      }
    } while (true);
  }

  let escape = {
    // first char after backslash in a string
    // only defined subset of chars allowed here
    _: 'escape',
    '"': () => c(),
    '\\': () => c(),
    '//': () => c(),
    'b': () => c(),
    'f': () => c(),
    'r': () => c(),
    'n': () => c(),
    't': () => c(),
    'u': () => unicode1,
  };
  let unicode1 = {
    _: 'unicode1',
    '0': () => unicode2,
    '1': () => unicode2,
    '2': () => unicode2,
    '3': () => unicode2,
    '4': () => unicode2,
    '5': () => unicode2,
    '6': () => unicode2,
    '7': () => unicode2,
    '8': () => unicode2,
    '9': () => unicode2,
    'a': () => unicode2,
    'b': () => unicode2,
    'c': () => unicode2,
    'd': () => unicode2,
    'e': () => unicode2,
    'f': () => unicode2,
    'A': () => unicode2,
    'B': () => unicode2,
    'C': () => unicode2,
    'D': () => unicode2,
    'E': () => unicode2,
    'F': () => unicode2,
  };
  let unicode2 = {
    _: 'unicode2',
    '0': () => unicode3,
    '1': () => unicode3,
    '2': () => unicode3,
    '3': () => unicode3,
    '4': () => unicode3,
    '5': () => unicode3,
    '6': () => unicode3,
    '7': () => unicode3,
    '8': () => unicode3,
    '9': () => unicode3,
    'a': () => unicode3,
    'b': () => unicode3,
    'c': () => unicode3,
    'd': () => unicode3,
    'e': () => unicode3,
    'f': () => unicode3,
    'A': () => unicode3,
    'B': () => unicode3,
    'C': () => unicode3,
    'D': () => unicode3,
    'E': () => unicode3,
    'F': () => unicode3,
  };
  let unicode3 = {
    _: 'unicode3',
    '0': () => unicode4,
    '1': () => unicode4,
    '2': () => unicode4,
    '3': () => unicode4,
    '4': () => unicode4,
    '5': () => unicode4,
    '6': () => unicode4,
    '7': () => unicode4,
    '8': () => unicode4,
    '9': () => unicode4,
    'a': () => unicode4,
    'b': () => unicode4,
    'c': () => unicode4,
    'd': () => unicode4,
    'e': () => unicode4,
    'f': () => unicode4,
    'A': () => unicode4,
    'B': () => unicode4,
    'C': () => unicode4,
    'D': () => unicode4,
    'E': () => unicode4,
    'F': () => unicode4,
  };
  let unicode4 = {
    _: 'unicode4',
    '0': () => c(),
    '1': () => c(),
    '2': () => c(),
    '3': () => c(),
    '4': () => c(),
    '5': () => c(),
    '6': () => c(),
    '7': () => c(),
    '8': () => c(),
    '9': () => c(),
    'a': () => c(),
    'b': () => c(),
    'c': () => c(),
    'd': () => c(),
    'e': () => c(),
    'f': () => c(),
    'A': () => c(),
    'B': () => c(),
    'C': () => c(),
    'D': () => c(),
    'E': () => c(),
    'F': () => c(),
  };

  let identNullN = {
    _: 'identNullN',
    // must be u
    'u': () => identNullU,
  };
  let identNullU = {
    _: 'identNullU',
    // must be l
    'l': () => identNullL1,
  };
  let identNullL1 = {
    _: 'identNullL1',
    // must be l
    'l': () => {
      setValue(null);
      return valueEnd;
    },
  };
  let identFalseF = {
    // must be a
    _: 'identFalseF',
    'a': () => identFalseA,
  };
  let identFalseA = {
    // must be l
    _: 'identFalseA',
    'l': () => identFalseL,
  };
  let identFalseL = {
    // must be s
    _: 'identFalseL',
    's': () => identFalseS,
  };
  let identFalseS = {
    // must be e
    _: 'identFalseS',
    'e': () => {
      setValue(false);
      return valueEnd;
    },
  };
  let identTrueT = {
    // must be r
    _: 'identTrueT',
    'r': () => identTrueR,
  };
  let identTrueR = {
    // must be u
    _: 'identTrueR',
    'u': () => identTrueU,
  };
  let identTrueU = {
    // must be e
    _: 'identTrueU',
    'e': () => {
      setValue(true);
      return valueEnd;
    },
  };

  let valueEnd = {
    // after a value ends
    // valid chars depend on context
    '_': 'valueEnd',
    ',': () => target === 'obj' ? objAfterComma : target === 'arr' ? array : undefined,
    '}': outtaStruct,
    ']': outtaStruct,

    // whitespace
    ' ': () => valueEnd,
    '\n': () => valueEnd,
    '\r': () => valueEnd,
    '\t': () => valueEnd,
  };
  let colon = {
    // after a property name
    // must be colon
    '_': 'colon',
    ':': () => value,
    // whitespace
    ' ': () => colon,
    '\n': () => colon,
    '\r': () => colon,
    '\t': () => colon,
  };

  inContext(topLevel);

  if (pointer !== len+1) {
    console.log('Incomplete parse. Pointer at', pointer, 'of', len);
    console.log(
      input.slice(Math.min(len, Math.max(0, pointer-50)), Math.min(len, pointer)),
      '<HERE>',
      input.slice(Math.min(len, pointer), Math.min(len, pointer + 50))
    );
    console.log('last char:', [lastChar], ', last table:', lastTable);
  }

  return pointer === len+1;
}

module.exports = parse;
