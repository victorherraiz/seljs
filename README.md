# Simple Expression Language for JavaScript

[![Build Status](https://travis-ci.org/victorherraiz/seljs.svg?branch=master)](https://travis-ci.org/victorherraiz/seljs)

## Requirements:

* Nodejs 4+

## Install

    npm install seljs --save

## Features

* No side effects
* Fast and simple: small memory footprint
* No dependencies
* Simplified property access
* Expression cache

## Language features

* Arithmetic, relation, equality and boolean opeations
* Groups
* Context and property access
* Literals: Strings and integers
* String concatenation
* Keywords: true, false and null

## Work in progress

* Unary: not, minus
* Functions
* Global functions
* Language and operators documentation
* Floats
* Array Literals
* Date literals
* Datetime literals

## Examples

```js
const seljs = require("seljs"),
    assert = require("assert"),
    ctx = {
        int: 123,
        str: "123",
        obj: {
            int: 321,
            str: "321",
            obj: {
                deep: 333
            }
        }
    };

//Number literals
assert.strictEqual(seljs("123"), 123);

//String literals
assert.strictEqual(seljs("'123'"), "123");

//Basic arithmetic
assert.strictEqual(seljs("1 + 3 * 2 / 4 - 1 * 2"), 1 + 3 * 2 / 4 - 1 * 2);

//String concatenation
assert.strictEqual(seljs("'123' + '123'"), "123123");

//Context and property access
assert.strictEqual(seljs("int + obj.int + obj.obj.deep", ctx), 123 + 321 + 333);

```

## License

[MIT](LICENSE)

