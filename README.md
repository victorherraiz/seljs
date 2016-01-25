# Simple Expression Language for JavaScript

[![Build Status](https://travis-ci.org/victorherraiz/seljs.svg?branch=master)](https://travis-ci.org/victorherraiz/seljs)
[![Coverage Status](https://coveralls.io/repos/github/victorherraiz/seljs/badge.svg?branch=master)](https://coveralls.io/github/victorherraiz/seljs?branch=master)

## Requirements:

* Nodejs 4+

## Install

    npm install seljs --save

## Features

* No side effects: only and expression language
* Fast and simple: small memory footprint
* No dependencies
* Simplified property access

## Language features

Very limited at the moment.

* Basic arithmetic: Adding, subtraction, Multiplication and Division
* Context and property access
* Literals: Strings and integers
* String concatenation

## Work in progress

* Boolean operators: And, or, equals, not equals, negate.
* Grouping
* null keyword
* Functions
* Global functions
* Language documentation


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
assert.strictEqual(seljs("123", ctx), 123);

//String literals
assert.strictEqual(seljs("'123'", ctx), "123");

//Basic arithmetic
assert.strictEqual(seljs("1 + 3 * 2 / 4 - 1 * 2", ctx), 1 + 3 * 2 / 4 - 1 * 2);

//String concatenation
assert.strictEqual(seljs("'123' + '123'", ctx), "123123");

//Context and property access
assert.strictEqual(seljs("int + obj.int + obj.obj.deep", ctx), 123 + 321 + 333);

```

## License

[MIT](LICENSE)

