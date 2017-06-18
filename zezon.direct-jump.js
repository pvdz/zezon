
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
    //console.log('inContext from:', from._, ', top =', top, ', prop:', currentProperty);
    let f = from;
    while (f) {
      if (typeof f === 'function') {
        f = f();
      } else {
        let d = c();
        let o = f[d];
        //if (pointer / len > 0.99)
        //  console.log(pointer + ' (' + (pointer/len*100).toFixed(2) + '%)', '- ', f._, [d], !!o, ', top =', top, ', prop:', currentProperty)
        f = o;
      }
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

  let topLevel = {_: 'topLevel'};
  let identNullN = {_: 'identNullN'};
  let identNullU = {_: 'identNullU'};
  let identNullL1 = {_: 'identNullL1'};
  let identFalseF = {_: 'identFalseF'};
  let identFalseA = {_: 'identFalseA'};
  let identFalseL = {_: 'identFalseL'};
  let identFalseS = {_: 'identFalseS'};
  let identTrueT = {_: 'identTrueT'};
  let identTrueR = {_: 'identTrueR'};
  let identTrueU = {_: 'identTrueU'};
  let valueEnd = {_:'valueEnd'};
  let escape = {_: 'escape'};
  let unicode1 = {_: 'unicode1'};
  let unicode2 = {_: 'unicode2'};
  let unicode3 = {_: 'unicode3'};
  let unicode4 = {_: 'unicode4'};
  let value = {_: 'value'};
  let signed = {_: 'signed'};
  let fraction = {_: 'fraction'};
  let topRest = {_: 'topRest'};
  let object = {_: 'object'};
  let array = {_: 'array'};
  let objAfterValue = {_: 'objAfterValue'};
  let objAfterComma = {_: 'objAfterComma'};
  let arrRest = {_: 'arrRest'};
  let colon = {_: 'colon'};

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

    return valueEnd[chr];
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

  topLevel[' '] = topLevel;
  topLevel['\n'] = topLevel;
  topLevel['\r'] = topLevel;
  topLevel['\t'] = topLevel;
  topLevel['{'] = intoObject;
  topLevel['['] = intoArray;
  topLevel['n'] = identNullN;
  topLevel['f'] = identFalseF;
  topLevel['t'] = identTrueT;
  topLevel['"'] = string;
  topLevel['0'] = numberZero;
  topLevel['1'] = numberInt;
  topLevel['2'] = numberInt;
  topLevel['3'] = numberInt;
  topLevel['4'] = numberInt;
  topLevel['5'] = numberInt;
  topLevel['6'] = numberInt;
  topLevel['7'] = numberInt;
  topLevel['8'] = numberInt;
  topLevel['9'] = numberInt;
  topLevel['-'] = numberNegative;
  topRest[' '] = topRest;
  topRest['\n'] = topRest;
  topRest['\r'] = topRest;
  topRest['\t'] = topRest;
  object[' '] = object;
  object['\n'] = object;
  object['\r'] = object;
  object['\t'] = object;
  object['}'] = outtaStruct;
  object['"'] = string;
  objAfterValue[' '] = objAfterValue;
  objAfterValue['\n'] = objAfterValue;
  objAfterValue['\r'] = objAfterValue;
  objAfterValue['\t'] = objAfterValue;
  objAfterValue['}'] = outtaStruct;
  objAfterValue[','] = objAfterComma;
  objAfterComma[' '] = objAfterComma;
  objAfterComma['\n'] = objAfterComma;
  objAfterComma['\r'] = objAfterComma;
  objAfterComma['\t'] = objAfterComma;
  objAfterComma['"'] = string;
  array[' '] = array;
  array['\n'] = array;
  array['\r'] = array;
  array['\t'] = array;
  array[']'] = outtaStruct;
  array[';'] = array;
  array['{'] = intoObject;
  array['['] = intoArray;
  array['n'] = identNullN;
  array['f'] = identFalseF;
  array['t'] = identTrueT;
  array['"'] = string;
  array['0'] = numberZero;
  array['1'] = numberInt;
  array['2'] = numberInt;
  array['3'] = numberInt;
  array['4'] = numberInt;
  array['5'] = numberInt;
  array['6'] = numberInt;
  array['7'] = numberInt;
  array['8'] = numberInt;
  array['9'] = numberInt;
  array['-'] = numberNegative;
  arrRest[' '] = arrRest;
  arrRest['\n'] = arrRest;
  arrRest['\r'] = arrRest;
  arrRest['\t'] = arrRest;
  arrRest[']'] = outtaStruct;
  arrRest[','] = array;
  value[' '] = value;
  value['\n'] = value;
  value['\r'] = value;
  value['\t'] = value;
  value['{'] = intoObject;
  value['['] = intoArray;
  value['n'] = identNullN;
  value['f'] = identFalseF;
  value['t'] = identTrueT;
  value['"'] = string;
  value['0'] = numberZero;
  value['1'] = numberInt;
  value['2'] = numberInt;
  value['3'] = numberInt;
  value['4'] = numberInt;
  value['5'] = numberInt;
  value['6'] = numberInt;
  value['7'] = numberInt;
  value['8'] = numberInt;
  value['9'] = numberInt;
  value['-'] = numberNegative;
  escape['"'] = c;
  escape['\\'] = c;
  escape['//'] = c;
  escape['b'] = c;
  escape['f'] = c;
  escape['r'] = c;
  escape['n'] = c;
  escape['t'] = c;
  escape['u'] = unicode1;
  unicode1['0'] = unicode2;
  unicode1['1'] = unicode2;
  unicode1['2'] = unicode2;
  unicode1['3'] = unicode2;
  unicode1['4'] = unicode2;
  unicode1['5'] = unicode2;
  unicode1['6'] = unicode2;
  unicode1['7'] = unicode2;
  unicode1['8'] = unicode2;
  unicode1['9'] = unicode2;
  unicode1['a'] = unicode2;
  unicode1['b'] = unicode2;
  unicode1['c'] = unicode2;
  unicode1['d'] = unicode2;
  unicode1['e'] = unicode2;
  unicode1['f'] = unicode2;
  unicode1['A'] = unicode2;
  unicode1['B'] = unicode2;
  unicode1['C'] = unicode2;
  unicode1['D'] = unicode2;
  unicode1['E'] = unicode2;
  unicode1['F'] = unicode2;
  unicode2['0'] = unicode3;
  unicode2['1'] = unicode3;
  unicode2['2'] = unicode3;
  unicode2['3'] = unicode3;
  unicode2['4'] = unicode3;
  unicode2['5'] = unicode3;
  unicode2['6'] = unicode3;
  unicode2['7'] = unicode3;
  unicode2['8'] = unicode3;
  unicode2['9'] = unicode3;
  unicode2['a'] = unicode3;
  unicode2['b'] = unicode3;
  unicode2['c'] = unicode3;
  unicode2['d'] = unicode3;
  unicode2['e'] = unicode3;
  unicode2['f'] = unicode3;
  unicode2['A'] = unicode3;
  unicode2['B'] = unicode3;
  unicode2['C'] = unicode3;
  unicode2['D'] = unicode3;
  unicode2['E'] = unicode3;
  unicode2['F'] = unicode3;
  unicode3['0'] = unicode4;
  unicode3['1'] = unicode4;
  unicode3['2'] = unicode4;
  unicode3['3'] = unicode4;
  unicode3['4'] = unicode4;
  unicode3['5'] = unicode4;
  unicode3['6'] = unicode4;
  unicode3['7'] = unicode4;
  unicode3['8'] = unicode4;
  unicode3['9'] = unicode4;
  unicode3['a'] = unicode4;
  unicode3['b'] = unicode4;
  unicode3['c'] = unicode4;
  unicode3['d'] = unicode4;
  unicode3['e'] = unicode4;
  unicode3['f'] = unicode4;
  unicode3['A'] = unicode4;
  unicode3['B'] = unicode4;
  unicode3['C'] = unicode4;
  unicode3['D'] = unicode4;
  unicode3['E'] = unicode4;
  unicode3['F'] = unicode4;
  unicode4['0'] = c;
  unicode4['1'] = c;
  unicode4['2'] = c;
  unicode4['3'] = c;
  unicode4['4'] = c;
  unicode4['5'] = c;
  unicode4['6'] = c;
  unicode4['7'] = c;
  unicode4['8'] = c;
  unicode4['9'] = c;
  unicode4['a'] = c;
  unicode4['b'] = c;
  unicode4['c'] = c;
  unicode4['d'] = c;
  unicode4['e'] = c;
  unicode4['f'] = c;
  unicode4['A'] = c;
  unicode4['B'] = c;
  unicode4['C'] = c;
  unicode4['D'] = c;
  unicode4['E'] = c;
  unicode4['F'] = c;
  identNullN['u'] = identNullU;
  identNullU['l'] = identNullL1;
  identNullL1['l'] = () => (setValue(null), valueEnd);
  identFalseF['a'] = identFalseA;
  identFalseA['l'] = identFalseL;
  identFalseL['s'] = identFalseS;
  identFalseS['e'] = () => (setValue(false),valueEnd);
  identTrueT['r'] = identTrueR;
  identTrueR['u'] = identTrueU;
  identTrueU['e'] = () => (setValue(true), valueEnd),
    valueEnd[','] = () => target === 'obj' ? objAfterComma : target === 'arr' ? array : undefined;
  valueEnd['}'] = outtaStruct;
  valueEnd[']'] = outtaStruct;
  valueEnd[' '] = valueEnd;
  valueEnd['\n'] = valueEnd;
  valueEnd['\r'] = valueEnd;
  valueEnd['\t'] = valueEnd;
  colon[':'] = value;
  colon[' '] = colon;
  colon['\n'] = colon;
  colon['\r'] = colon;
  colon['\t'] = colon;

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
