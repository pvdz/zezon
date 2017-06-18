#!/usr/bin/env node

let parseDirect = require('./zezon.direct-jump.js');
let parseIndirect = require('./zezon.indirect-jump.js');
// download benchmark json from https://github.com/cpojer/bser-c (or use any other json file)
let jestCacheJson = require('fs').readFileSync('./jest-cache.json').toString('utf-8');

console.log('Parsing... (indirect)');
console.time('Parse time');
let zezonOut = [];
console.log(parseIndirect(jestCacheJson, zezonOut));
console.timeEnd('Parse time');

console.log('Parsing... (direct)');
console.time('Parse time');
let zezonOut2 = [];
console.log(parseDirect(jestCacheJson, zezonOut2));
console.timeEnd('Parse time');


console.log('JSON.parse...');
console.time('Parse time');
let realOut = JSON.parse(jestCacheJson);
console.timeEnd('Parse time');

//console.log('same:', JSON.stringify(realOut) === JSON.stringify(zezonOut[0]))
//console.log('same:', JSON.stringify(realOut) === JSON.stringify(zezonOut2[0]))
