#!/usr/bin/env node

//let parse = require('./zezon.indirect-jump.js');
let parseDirect = require('./zezon.direct-jump.js');
let parseIndirect = require('./zezon.direct-jump.js');

let testcases = [
  ...['null', 'false', 'true'],


  ...['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  ...['-0', '-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9'],
  ...['10', '21', '32', '43', '54', '65', '76', '87', '98', '19'],
  ...['123', '456', '7890'],
  ...['1234567890'],

  ...['1.2', '2.3', '3.4', '4.5', '5.6', '6.7', '7.8', '8.9', '9.10'],
  ...['10.23', '21.45', '32.56', '43.78', '54.98', '65.91', '76.05', '87.04', '98.54', '19.37'],
  ...['123.012', '456.345', '7890.6789'],
  ...['1234567890.0987654321'],

  // with exponent

  ...['0e1', '1e2', '2e3', '3e4', '4e5', '5e6', '6e7', '7e8', '8e9', '9e0'],
  ...['10e10', '21e21', '32e32', '43e43', '54e54', '65e65', '76e79', '87e87', '98e98', '19e19'],
  ...['123e123', '456e456', '7890e789'],
  ...['1234567890e1234567890'],

  ...['0e-100', '1e-100'],
  ...['0E-100', '1E-100'],
  ...['0.1e-100', '1.1e-100'],
  ...['0.1E-100', '1.1E-100'],

  ...['0e+100', '1e+100'],
  ...['0E+100', '1E+100'],
  ...['0.1e+100', '1.1e+100'],
  ...['0.1E+100', '1.1E+100'],

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
  ...['{"x":0,"y":1}', '{"x":1,"y":2}', '{"x":2,"y":3}', '{"x":3,"y":4}', '{"x":4,"y":5}', '{"x":5,"y":6}', '{"x":6,"y":7}', '{"x":7,"y":8}', '{"x":8,"y":9}', '{"x":9,"y":0}'],
  ...['{"x":"y"}', '{"x":"y", "a":"b"}'],
  ...['{"x":{"x":"y"}}', '{"x":{"x":{"x":{"x":{"x":{"x":{"x":{"x":"y"}}}}}}}}'],
  ...['{"x":{"x":"y"}, "a": {}}'],

  // mix and match

  ...['{"x":[]}'],
  ...['[{}]'],
  ...['{"x":[{"x":"y"}]}', '[{"x":[{"x":[{"x":[{"x":[{"x":[{"x":[{"x":[{"x":[]}]}]}]}]}]}]}]}]'],
];



let passes = 0;
let fails = 0;
[parseDirect, parseIndirect].forEach((parse, pid) => {
  console.log('### Parser #' + pid);
  testcases.forEach((str, n) => {
    let completed = one(str, true, n);

    if (completed) {
      one(' ' + str, false, n + 'a');
      one('\t' + str, false, n + 'b');
      one('\n' + str, false, n + 'c');
      one('\r' + str, false, n + 'd');
      one(str + ' ', false, n + 'e');
      one(str + '\t', false, n + 'f');
      one(str + '\n', false, n + 'g');
      one(str + '\r', false, n + 'h');
      // in json a whitespace space is really the same as a whitespace
      // newline or tab BUT not in a string. so just check for spaces here.
      one(str.replace(/([":,{}[\]])/g, ' $1'), false, n + 'i');
      one(str.replace(/([":,{}[\]])/g, '$1 '), false, n + 'j');
    }
  });
  function one(str, orig, testid) {
    //if (testid != '125') return true;

    let into = [];
    let completed;
    let crash = true;
    try {
      completed = parse(str, into);
      crash = false;
    } catch(e) {
    }

    if (crash) {
      ++fails;
      console.log(testid, 'CRASH:', toPrint(str));
    } else if (!completed) {
      ++fails;
      console.log(testid, 'FAIL:', toPrint(str), ', so far:', JSON.stringify(into));
    } else if (orig && str !== JSON.stringify(into[0]) && str !== '-0') {
      if (JSON.stringify(JSON.parse(str)) === JSON.stringify(into[0])) {
        ++passes;
        console.log(testid, 'WARN:', toPrint(str), into, [str, JSON.stringify(into[0])]);
      } else {
        ++fails;
        console.log(testid, 'MISS:', toPrint(str), into, [str, JSON.stringify(into[0])]);
      }
    } else {
      ++passes;
      console.log(testid, 'PASS:', toPrint(str));
    }

    return completed;
  }
});

function toPrint(s) {
  return s
    .replace(/[^\u0000-\u00ff\u2028]/g, function (s) {
      return '\\u' + s.charCodeAt(0).toString(16).toUpperCase();
    })
    .replace(/[\xa0\x0b\x0c]/g, function (s) {
      return '\\x' + s.charCodeAt(0).toString(16).toUpperCase();
    })
    .replace(/\t/g, '\\t')
    .replace(/\u2028/g, '\u21a9')
    .replace(/\u000a/g, '\u21b5')
    .replace(/\u000d/g, '\\r');
}

console.log('###\nPassed: ' + passes + ', Failed: ' + fails);
