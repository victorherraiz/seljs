"use strict";

const seljs = require("."),
    assert = require("assert"),
    ctx = { int: 123, str: "123", obj: { int: 321, str: "321", obj: { deep: 333 } } };

//Simple values
assert.strictEqual(seljs("0", ctx), 0);

assert.strictEqual(seljs("123"), 123);
assert.strictEqual(seljs(" 123"), 123);
assert.strictEqual(seljs(" 123 "), 123);
assert.strictEqual(seljs("123 "), 123);

assert.strictEqual(seljs("''"), "");
assert.strictEqual(seljs("'A'"), "A");
assert.strictEqual(seljs("'123'"), "123");
assert.strictEqual(seljs(" '123'"), "123");
assert.strictEqual(seljs(" '123' "), "123");
assert.strictEqual(seljs("'123' "), "123");

assert.strictEqual(seljs("int", ctx), 123);
assert.strictEqual(seljs(" int", ctx), 123);
assert.strictEqual(seljs(" int ", ctx), 123);
assert.strictEqual(seljs("int ", ctx), 123);

//Some arithmetic
assert.strictEqual(seljs(" 1 + 3 * 2 / 4  - 1 * 2 "), 1 + 3 * 2 / 4 - 1 * 2);
assert.strictEqual(seljs("1+3*2/4-1*2"), 1 + 3 * 2 / 4 - 1 * 2);
assert.strictEqual(seljs("2/3-1+3*2/4"), 2 / 3 - 1 + 3 * 2 / 4);

//String concatenation
assert.strictEqual(seljs("'123' + '123'"), "123123");
assert.strictEqual(seljs("123 + '123'"), "123123");
assert.strictEqual(seljs("'123' + 123"), "123123");

//Known
assert.strictEqual(seljs("true"), true);
assert.strictEqual(seljs("true == 4 > 2"), true);
assert.strictEqual(seljs("false"), false);
assert.strictEqual(seljs("false == 3 < 3"), true);
assert.strictEqual(seljs("null"), null);
assert.strictEqual(seljs("null == banana", ctx), true);

//Relational
assert.strictEqual(seljs("0 > 1"), false);
assert.strictEqual(seljs("1 > 1"), false);
assert.strictEqual(seljs("2 > 1"), true);
assert.strictEqual(seljs("0 < 1"), true);
assert.strictEqual(seljs("1 < 1"), false);
assert.strictEqual(seljs("2 < 1"), false);
assert.strictEqual(seljs("0 >= 1"), false);
assert.strictEqual(seljs("1 >= 1"), true);
assert.strictEqual(seljs("2 >= 1"), true);
assert.strictEqual(seljs("0 <= 1"), true);
assert.strictEqual(seljs("1 <= 1"), true);
assert.strictEqual(seljs("2 <= 1"), false);

//Equality
assert.strictEqual(seljs("0 == 1"), false);
assert.strictEqual(seljs("1 == 1"), true);
assert.strictEqual(seljs("0 != 1"), true);
assert.strictEqual(seljs("1 != 1"), false);

//And and Or
assert.strictEqual(seljs("true && false"), true && false);
assert.strictEqual(seljs("true && true"), true && true);
assert.strictEqual(seljs("false && false"), false && false);
assert.strictEqual(seljs("false && true"), false && true);
assert.strictEqual(seljs("true || false"), true || false);
assert.strictEqual(seljs("true || true"), true || true);
assert.strictEqual(seljs("false || false"), false || false);
assert.strictEqual(seljs("false || true"), false || true);

//Precedence
assert.strictEqual(seljs("4 * 4 > 6 && 3 - 2 == 1"), true);
assert.strictEqual(seljs("true && false || 1"), 1);
assert.strictEqual(seljs("false || true && false"), false);
assert.strictEqual(seljs("5>3&&3>=3"), true);
assert.strictEqual(seljs("5>8||3<=3"), true);

//Identifiers and properties
assert.strictEqual(seljs("int+obj.int+obj.obj.deep", ctx), 123 + 321 + 333);
assert.strictEqual(seljs("obj.obj.deep - obj.int * obj.obj.deep", ctx), 333 - 321 * 333);
assert.strictEqual(seljs("2 * int - 3 * 2 - int", ctx), 2 * 123 - 3 * 2 - 123);
assert.strictEqual(seljs("str.length", ctx), 3);
//no proto
assert.strictEqual(seljs("str.substr", ctx), null);

//Null
assert.strictEqual(seljs("banana", ctx), null);
assert.strictEqual(seljs("banana.banana", ctx), null);
assert.strictEqual(seljs("obj.banana", ctx), null);
assert.strictEqual(seljs("obj.obj.banana", ctx), null);

//Groups
assert.strictEqual(seljs("(2 + 3) * 2"), 10);
assert.strictEqual(seljs("((2 * 1) + (3) * (2))"), 8);
assert.strictEqual(seljs("(int)", ctx), 123);
assert.strictEqual(seljs("(( ( (int)) ) +obj.int ) ", ctx), 123 + 321);

//TODO: Known tokens after dot
//assert.strictEqual(seljs("obj.true"), null);
//assert.strictEqual(seljs("obj.false"), null);
assert.strictEqual(seljs("obj.null", ctx), null);
//assert.strictEqual(seljs("obj.null", { obj: { null: 1 } }), 1);

//cache
assert.strictEqual(seljs.cache.clear(),  undefined);
assert.strictEqual(seljs("1"), 1);
assert.strictEqual(seljs.cache.size,  1);
assert.strictEqual(seljs("1"), 1);
assert.strictEqual(seljs.cache.size,  1);
assert.strictEqual(seljs.cache.clear(),  undefined);
assert.strictEqual(seljs.cache.size,  0);
assert.strictEqual(seljs("1"), 1);
assert.strictEqual(seljs.cache.size,  1);

//Errors
function wrapper(text, ctx) {
    return function () {
        return seljs(text, ctx);
    };
}

function message(text) {
    return function (error) {
        return error.message === text;
    };
}

//Empty
assert.throws(wrapper("", ctx), message("Empty expression"));

//Broken string
assert.throws(wrapper("'123"), message("Open token"));
assert.throws(wrapper("'"), message("Open token"));
assert.throws(wrapper("'123''"), message("Unexpected character ' at 5"));
assert.throws(wrapper("'123' + ' "), message("Open token"));

//Broken groups
assert.throws(wrapper("123 + 2)"), message("Missing left parenthesis"));
assert.throws(wrapper("12 (123)"), message("Unexpected character ( at 3"));
assert.throws(wrapper("(123) 'a'"), message("Unexpected character ' at 6"));
assert.throws(wrapper("("), message("Missing right parenthesis"));
assert.throws(wrapper("(123 + 2"), message("Missing right parenthesis"));
assert.throws(wrapper("(3 + (123 + 2) * 3"), message("Missing right parenthesis"));


//Invalid
assert.throws(wrapper("123x", ctx), message("Unexpected character x at 3"));
assert.throws(wrapper("asd.123x", ctx), message("Unexpected character . at 3"));
assert.throws(wrapper("asd.1", ctx), message("Unexpected character . at 3"));

//Zero
assert.throws(wrapper("00"), message("Unexpected character 0 at 1"));
assert.throws(wrapper("01"), message("Unexpected character 1 at 1"));

//Dot
assert.throws(wrapper("obj.", ctx), message("Unexpected character . at 3"));
assert.throws(wrapper("obj. int", ctx), message("Unexpected character . at 3"));
assert.throws(wrapper("obj .int", ctx), message("Unexpected character . at 4"));
assert.throws(wrapper("obj. + int", ctx), message("Unexpected character . at 3"));

//Operators
assert.throws(wrapper("* 123 123"), message("Unexpected character * at 0"));
assert.throws(wrapper("123 123 +"), message("Unexpected character 1 at 4"));
assert.throws(wrapper("123 +123 +"), message("Unexpected character + at 9"));
assert.throws(wrapper("123 + / 123"), message("Unexpected character / at 6"));

//Unknowm operators
assert.throws(wrapper("123 => 123"), message("Unknown operator = at 4"));
assert.throws(wrapper("123 === 123"), message("Unknown operator === at 4"));


