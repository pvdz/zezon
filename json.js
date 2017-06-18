#!/usr/bin/env node

let input = '{"foo": 15}';
input = '500.200';

let len = input.length;
let pointer = 0;
if (len === 0) return;

let pairOffsets = [];
let propOffset = 0;
let valueOffset = 0;

let top = -1;
let obj = undefined;
let nested = [];
let targets = [];
let target = undefined;
let prop = undefined;

function inContext(from) {
  //console.log('from:', from._)
  let f = from;
  while (f) {
    let d = c();
    let o = f[d];
    //console.log('- ', f._, [d])
    if (!o) break;
    f = o();
  }
}

function c() {
  return input.charAt(pointer++);
}

let topLevel = {
  _: 'toplevel',
  // whitespace
  ' ': () => topLevel,
  '\n': () => topLevel,
  '\r': () => topLevel,
  '\t': () => topLevel,

  '{': () => (obj = nested[++top] = {}, target = targets[top] = 'obj', object),
  '[': () => (obj = nested[++top] = [], target = targets[top] = 'arr', array),

  // idents
  'n': () => identNullN,
  'f': () => identFalseF,
  't': () => identTrueT,

  // string
  '"': string,

  // number
  '0': () => zeroSuffix,
  '1': () => intRest,
  '2': () => intRest,
  '3': () => intRest,
  '4': () => intRest,
  '5': () => intRest,
  '6': () => intRest,
  '7': () => intRest,
  '8': () => intRest,
  '9': () => intRest,
  '-': () => signed,
  '+': () => signed,
  '.': () => dotRest,
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

  '}': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
  '"': string,
};
let objRest = { // comma, no string
  _: 'objrest',
  ' ': () => objRest,
  '\n': () => objRest,
  '\r': () => objRest,
  '\t': () => objRest,

  '}': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
  ',': () => objRest2,
};
let objRest2 = { // no comma
  _: 'objrest2',
  ' ': () => objRest2,
  '\n': () => objRest2,
  '\r': () => objRest2,
  '\t': () => objRest2,

  '}': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
  '"': string,
};
let array = {
  _: 'array',
  ' ': () => array,
  '\n': () => array,
  '\r': () => array,
  '\t': () => array,

  ']': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
  ',': () => array,

  '{': () => (obj = nested[++top] = {}, target = targets[top] = 'obj', object),
  '[': () => (obj = nested[++top] = [], target = targets[top] = 'arr', array),

  // idents
  'n': () => identNullN,
  'f': () => identFalseF,
  't': () => identTrueT,

  // string
  '"': string,

  // number
  '0': () => zeroSuffix,
  '1': () => intRest,
  '2': () => intRest,
  '3': () => intRest,
  '4': () => intRest,
  '5': () => intRest,
  '6': () => intRest,
  '7': () => intRest,
  '8': () => intRest,
  '9': () => intRest,
  '-': () => signed,
  '+': () => signed,
  '.': () => dotRest,
};
let arrRest = {
  _: 'arrrest',
  ' ': () => arrRest,
  '\n': () => arrRest,
  '\r': () => arrRest,
  '\t': () => arrRest,

  ']': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
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

  '{': () => (obj = nested[++top] = {}, target = targets[top] = 'obj', object),
  '[': () => (obj = nested[++top] = [], target = targets[top] = 'arr', array),

  // idents
  'n': () => identNullN,
  'f': () => identFalseF,
  't': () => identTrueT,

  // string
  '"': string,

  // number
  '0': () => zeroSuffix,
  '1': () => intRest,
  '2': () => intRest,
  '3': () => intRest,
  '4': () => intRest,
  '5': () => intRest,
  '6': () => intRest,
  '7': () => intRest,
  '8': () => intRest,
  '9': () => intRest,
  '-': () => signed,
  '+': () => signed,
  '.': () => dotRest,
};

let signed = {
  // first char after a - or +
  // must be a digit or dot
  _: 'signed',
  '0': () => zeroSuffix,
  '1': () => intRest,
  '2': () => intRest,
  '3': () => intRest,
  '4': () => intRest,
  '5': () => intRest,
  '6': () => intRest,
  '7': () => intRest,
  '8': () => intRest,
  '9': () => intRest,
  '.': () => dotRest,
};
let intRest = {
  // after the first non-zero digit of the integer part of a number
  // can be digit, dot, e, E, or value suffix
  _: 'intrest',
  '0': () => intRest,
  '1': () => intRest,
  '2': () => intRest,
  '3': () => intRest,
  '4': () => intRest,
  '5': () => intRest,
  '6': () => intRest,
  '7': () => intRest,
  '8': () => intRest,
  '9': () => intRest,
  '.': () => fraction,
  'e': () => expStart,
  'E': () => expStart,

  // value end
  ',': () => target === 'obj' ? objRest2 : target === 'arr' ? array : undefined,
  '}': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
  ']': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),

  // whitespace is also value end
  ' ': () => valueEnd,
  '\n': () => valueEnd,
  '\r': () => valueEnd,
  '\t': () => valueEnd,
};
let zeroSuffix = {
  // after a single zero
  // can be dot, e, E, or value suffix
  _: 'zerosuffix',
  '.': () => fraction,
  'e': () => expStart,
  'E': () => expStart,

  // value end
  ',': () => target === 'obj' ? objRest2 : target === 'arr' ? array : undefined,
  '}': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
  ']': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),

  // whitespace is also value end
  ' ': () => valueEnd,
  '\n': () => valueEnd,
  '\r': () => valueEnd,
  '\t': () => valueEnd,
};
let dotRest = {
  // after a leading dot
  // must be digit
  _: 'dotrest',
  '0': () => fraction,
  '1': () => fraction,
  '2': () => fraction,
  '3': () => fraction,
  '4': () => fraction,
  '5': () => fraction,
  '6': () => fraction,
  '7': () => fraction,
  '8': () => fraction,
  '9': () => fraction,
};
let fraction = {
  // optional character after dot
  // can be digit, e, E, or value suffix
  _: 'fraction',
  '0': () => fraction,
  '1': () => fraction,
  '2': () => fraction,
  '3': () => fraction,
  '4': () => fraction,
  '5': () => fraction,
  '6': () => fraction,
  '7': () => fraction,
  '8': () => fraction,
  '9': () => fraction,
  'e': () => expStart,
  'E': () => expStart,

  // value end
  ',': () => target === 'obj' ? objRest2 : target === 'arr' ? array : undefined,
  '}': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
  ']': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),

  // whitespace is also value end
  ' ': () => valueEnd,
  '\n': () => valueEnd,
  '\r': () => valueEnd,
  '\t': () => valueEnd,
};
let expStart = {
  // first character after e or E
  // must be digit, +, or -
  _: 'expstart',
  '+': () => expRest,
  '-': () => expRest,
  '0': () => expTail,
  '1': () => expTail,
  '2': () => expTail,
  '3': () => expTail,
  '4': () => expTail,
  '5': () => expTail,
  '6': () => expTail,
  '7': () => expTail,
  '8': () => expTail,
  '9': () => expTail,
};
let expRest = {
  // first character after exp + or exp -
  // must be digit
  _: 'exprest',
  '0': () => expTail,
  '1': () => expTail,
  '2': () => expTail,
  '3': () => expTail,
  '4': () => expTail,
  '5': () => expTail,
  '6': () => expTail,
  '7': () => expTail,
  '8': () => expTail,
  '9': () => expTail,
};
let expTail = {
  // non-first digit of exp
  // can be digit or value suffix
  _: 'exptail',
  '0': () => expTail,
  '1': () => expTail,
  '2': () => expTail,
  '3': () => expTail,
  '4': () => expTail,
  '5': () => expTail,
  '6': () => expTail,
  '7': () => expTail,
  '8': () => expTail,
  '9': () => expTail,

  // value end
  ',': () => target === 'obj' ? objRest2 : target === 'arr' ? array : undefined,
  '}': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
  ']': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),

  // whitespace is also value end
  ' ': () => valueEnd,
  '\n': () => valueEnd,
  '\r': () => valueEnd,
  '\t': () => valueEnd,
};

function string(chr) {
  do {
    if (chr === '"') {
      return valueEnd;
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
  'l': () => valueEnd,
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
  'e': () => valueEnd,
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
  'e': () => valueEnd,
};

let valueEnd = {
  // after a value ends
  // valid chars depend on context
  '_': 'valueEnd',
  ',': () => target === 'obj' ? objRest2 : target === 'arr' ? array : undefined,
  ':': () => (target === 'obj'  && prop === undefined) ? value : undefined,
  '}': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),
  ']': () => (obj = nested[--top], target = targets[top], target === undefined ? topRest : target === 'obj' ? objRest : target === 'arr' ? arrRest : undefined),

  // whitespace
  ' ': () => valueEnd,
  '\n': () => valueEnd,
  '\r': () => valueEnd,
  '\t': () => valueEnd,
};


let numbers = [
  ...['null', 'false', 'true'],


  ...['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  ...['10', '21', '32', '43', '54', '65', '76', '87', '98', '19'],
  ...['123', '456', '7890'],
  ...['1234567890'],

  ...['.0', '.1', '.2', '.3', '.4', '.5', '.6', '.7', '.8', '.9'],
  ...['.10', '.21', '.32', '.43', '.54', '.65', '.76', '.87', '.98', '.19'],
  ...['.123', '.456', '.7890'],
  ...['.1234567890'],
  ...['.0000'],

  ...['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.'],
  ...['10.', '21.', '32.', '43.', '54.', '65.', '76.', '87.', '98.', '19.'],
  ...['123.', '456.', '7890.'],
  ...['1234567890.'],

  ...['1.2', '2.3', '3.4', '4.5', '5.6', '6.7', '7.8', '8.9', '9.10'],
  ...['10.23', '21.45', '32.56', '43.78', '54.98', '65.91', '76.05', '87.04', '98.54', '19.37'],
  ...['123.012', '456.345', '7890.6789'],
  ...['1234567890.0987654321'],

  // with exponent

  ...['0e1', '1e2', '2e3', '3e4', '4e5', '5e6', '6e7', '7e8', '8e9', '9e0'],
  ...['10e10', '21e21', '32e32', '43e43', '54e54', '65e65', '76e79', '87e87', '98e98', '19e19'],
  ...['123e123', '456e456', '7890e789'],
  ...['1234567890e1234567890'],

  ...['.0E10', '.1E23', '.2E0', '.3E4', '.4E78', '.5E00', '.6E75', '.7E54', '.8E77', '.9E14'],
  ...['.10E1', '.21E2', '.32E3', '.43E4', '.54E5', '.65E6', '.76E7', '.87E8', '.98E9', '.19E0'],

  ...['0e-100', '1e-100'],
  ...['0E-100', '1E-100'],
  ...['0.e-100', '1.e-100'],
  ...['0.E-100', '1.E-100'],
  ...['0.1e-100', '1.1e-100'],
  ...['0.1E-100', '1.1E-100'],
  ...['.0e-100', '.1e-100'],
  ...['.0E-100', '.1E-100'],

  ...['0e+100', '1e+100'],
  ...['0E+100', '1E+100'],
  ...['0.e+100', '1.e+100'],
  ...['0.E+100', '1.E+100'],
  ...['0.1e+100', '1.1e+100'],
  ...['0.1E+100', '1.1E+100'],
  ...['.0e+100', '.1e+100'],
  ...['.0E+100', '.1E+100'],

  ...['"stuff"'],

  // array

  ...['[]', '[[]]', '[[[[[[[[[[[[[[]]]]]]]]]]]]]]'],
  ...['[0]', '[1]', '[2]', '[3]', '[4]', '[5]', '[6]', '[7]', '[8]', '[9]'],
  ...['[0,1]', '[1,2]', '[2,3]', '[3,4]', '[4,5]', '[5,6]', '[6,7]', '[7,8]', '[8,9]', '[9,0]'],
  ...['["stuff"]', '["stuff","X"]'],
  ...['[[],"x"]', '[[],0]', '[[],1]', '[[],2]', '[[],3]', '[[],4]', '[[],5]', '[[],6]', '[[],7]', '[[],8]', '[[],9]'],
  ...['[0,[]]', '[0,"v"]'],
  ...['["x",[]]', '["x",0]', '["x",1]', '["x",2]', '["x",3]', '["x",4]', '["x",5]', '["x",6]', '["x",7]', '["x",8]', '["x",9]'],

  // objects

  ...['{}'],
  ...['{"x":0}', '{"x":1}', '{"x":2}', '{"x":3}', '{"x":4}', '{"x":5}', '{"x":6}', '{"x":7}', '{"x":8}', '{"x":9}'],
  ...['{"x":0,}', '{"x":1,}', '{"x":2,}', '{"x":3,}', '{"x":4,}', '{"x":5,}', '{"x":6,}', '{"x":7,}', '{"x":8,}', '{"x":9,}'],
  ...['{"x":0,"y":1}', '{"x":1,"y":2}', '{"x":2,"y":3}', '{"x":3,"y":4}', '{"x":4,"y":5}', '{"x":5,"y":6}', '{"x":6,"y":7}', '{"x":7,"y":8}', '{"x":8,"y":9}', '{"x":9,"y":0}'],
  ...['{"x":0,"y":1,}', '{"x":1,"y":2,}', '{"x":2,"y":3,}', '{"x":3,"y":4,}', '{"x":4,"y":5,}', '{"x":5,"y":6,}', '{"x":6,"y":7,}', '{"x":7,"y":8,}', '{"x":8,"y":9,}', '{"x":9,"y":0,}'],
  ...['{"x":"y"}', '{"x":"y",}', '{"x":"y", "a":"b"}', '{"x":"y", "a":"b",}'],
  ...['{"x":{"x":"y"}}', '{"x":{"x":{"x":{"x":{"x":{"x":{"x":{"x":"y"}}}}}}}}'],

  // mix and match

  ...['{"x":[{"x":"y"}]}', '[{"x":[{"x":[{"x":[{"x":[{"x":[{"x":[{"x":[{"x":[]}]}]}]}]}]}]}]}]'],
];



let passes = 0;
let fails = 0;
numbers.forEach(str => {
  one(str);

  if (pointer === len+1) {
    one(' ' + str);
    one('\t' + str);
    one('\n' + str);
    one('\r' + str);
    one(str + ' ');
    one(str + '\t');
    one(str + '\n');
    one(str + '\r');
    // in json a whitespace space is really the same as a whitespace
    // newline or tab BUT not in a string. so just check for spaces here.
    one(str.replace(/([":,{}[\]])/g, ' $1'));
    one(str.replace(/([":,{}[\]])/g, '$1 '));
  }
});
function one(str) {
  input = str;
  len = str.length;
  pointer = 0;

  inContext(topLevel);
  console.log((pointer === len+1 ? (++passes, 'PASS') : (++fails, 'FAIL')) + ': ' + input);
}

console.log('###\nPassed: ' + passes + ', Failed: ' + fails);

