"use strict";

const seljs = require("."),
    assert = require("assert"),
    ctx = { int: 123, str: "123", obj: { int: 321, str: "321", obj: { deep: 333 } } };


//Simple values
assert.strictEqual(seljs("123", ctx), 123);
assert.strictEqual(seljs(" 123", ctx), 123);
assert.strictEqual(seljs(" 123 ", ctx), 123);
assert.strictEqual(seljs("123 ", ctx), 123);

assert.strictEqual(seljs("'123'", ctx), "123");
assert.strictEqual(seljs(" '123'", ctx), "123");
assert.strictEqual(seljs(" '123' ", ctx), "123");
assert.strictEqual(seljs("'123' ", ctx), "123");

assert.strictEqual(seljs("int", ctx), 123);
assert.strictEqual(seljs(" int", ctx), 123);
assert.strictEqual(seljs(" int ", ctx), 123);
assert.strictEqual(seljs("int ", ctx), 123);

//Some arithmetic
assert.strictEqual(seljs(" 1 + 3 * 2 / 4  - 1 * 2 ", ctx), 1 + 3 * 2 / 4 - 1 * 2);
assert.strictEqual(seljs("1+3*2/4-1*2", ctx), 1 + 3 * 2 / 4 - 1 * 2);
assert.strictEqual(seljs("2/3-1+3*2/4", ctx), 2 / 3 - 1 + 3 * 2 / 4);

//String concatenation
assert.strictEqual(seljs("'123' + '123'", ctx), "123123");
assert.strictEqual(seljs("123 + '123'", ctx), "123123");
assert.strictEqual(seljs("'123' + 123", ctx), "123123");

//Identifiers and properties
assert.strictEqual(seljs("int+obj.int+obj.obj.deep", ctx), 123 + 321 + 333);
assert.strictEqual(seljs("obj.obj.deep - obj.int * obj.obj.deep", ctx), 333 - 321 * 333);
assert.strictEqual(seljs("2 * int - 3 * 2 - int", ctx), 2 * 123 - 3 * 2 - 123);

//Null
assert.strictEqual(seljs("banana", ctx), null);
assert.strictEqual(seljs("banana.banana", ctx), null);
assert.strictEqual(seljs("obj.banana", ctx), null);
assert.strictEqual(seljs("obj.obj.banana", ctx), null);

//cache
assert.strictEqual(seljs("1", ctx), 1);
assert.strictEqual(seljs.cache.size,  26);
assert.strictEqual(seljs("1", ctx), 1);
assert.strictEqual(seljs.cache.size,  26);
assert.strictEqual(seljs.cache.clear(),  undefined);
assert.strictEqual(seljs.cache.size,  0);
assert.strictEqual(seljs("1", ctx), 1);
assert.strictEqual(seljs.cache.size,  1);

//Errors
function wrapper(text, ctx) {
    return () => seljs(text, ctx);
}

function message(text) {
    return (error) => error.message === text;
}

//Empty
assert.throws(wrapper("", ctx), message("Empty expression"));

//Broken string
assert.throws(wrapper("'123", ctx), message("Open token"));
assert.throws(wrapper("'", ctx), message("Open token"));
assert.throws(wrapper("'123''", ctx), message("Unexpected character ''' at 5"));
assert.throws(wrapper("'123' + ' ", ctx), message("Open token"));

//Invalid
assert.throws(wrapper("123x", ctx), message("Unexpected character 'x' at 3"));
assert.throws(wrapper("asd.123x", ctx), message("Unexpected character '1' at 4"));

//Dot
assert.throws(wrapper("obj. int", ctx), message("Unexpected character '.' at 3"));
assert.throws(wrapper("obj .int", ctx), message("Unexpected character '.' at 4"));
assert.throws(wrapper("obj. + int", ctx), message("Unexpected character '.' at 3"));

//Operators
assert.throws(wrapper("* 123 123", ctx), message("Unexpected character '*' at 0"));
assert.throws(wrapper("123 123 +", ctx), message("Unexpected character '1' at 4"));
assert.throws(wrapper("123 +123 +", ctx), message("Unexpected character '+' at 9"));
assert.throws(wrapper("123 + / 123", ctx), message("Unexpected character '/' at 6"));

