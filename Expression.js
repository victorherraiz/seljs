/**
 * @module seljs/Expression
 */

"use strict";

const Nodes = require("./Nodes"),
    VALUE = 1,
    OPERATOR = 2,
    BEFORE_VALUE = (last) => !last || last.kind === OPERATOR,
    STRING_END = {
        kind: VALUE,
        build: (str) => new Nodes.Literal(str.slice(1, -1))
    },
    STRING = {
        next: (char) => char === "'" ? STRING_END : STRING
    },
    STRING_START = {
        first: (last, char) => BEFORE_VALUE(last) && char === "'",
        next: (char) => char === "'" ? STRING_END : STRING
    },
    GROUP_END = {
        kind: VALUE,
        first: (last, char) => last && last.kind === VALUE && char === ")"
    },
    GROUP_START = {
        kind: OPERATOR,
        first: (last, char) => BEFORE_VALUE(last) && char === "("
    },
    ZERO = {
        kind: VALUE,
        first: (last, char) => BEFORE_VALUE(last) && char === "0",
        build: (str) => new Nodes.Literal(parseInt(str))
    },
    INTEGER = {
        kind: VALUE,
        first: (last, char) => BEFORE_VALUE(last) && /[1-9]/.test(char),
        next: (char) => (/[0-9]/).test(char) ? INTEGER : null,
        build: (str) => new Nodes.Literal(parseInt(str))
    },
    KNOWN = new Map([
        ["true", new Nodes.Literal(true)],
        ["false", new Nodes.Literal(false)],
        ["null", new Nodes.Literal(null)]
    ]),
    IDENTIFIER = {
        kind: VALUE,
        first: (last, char) => BEFORE_VALUE(last) && /^[a-zA-Z_]$/.test(char),
        next: (char) => /^[a-zA-Z0-9_]$/.test(char) ? IDENTIFIER : null,
        build: (str) => KNOWN.get(str) || new Nodes.Identifier(str)
    },
    DOT = {
        kind: OPERATOR,
        first: (last, char, str, index) => IDENTIFIER === last &&
            (/^[a-zA-Z0-9_]\.[a-zA-Z_]$/).test(str.substr(index - 1, 3))
    },
    BINARY = {
        kind: OPERATOR,
        first: (last, char, str, index) => last && last.kind === VALUE
            && /^[+\-*/&|<>=!] *\S/.test(str.substring(index)),
        next: (char) => /^[=&|]$/.test(char) ? BINARY : null
    },
    TYPES = [STRING_START, ZERO, INTEGER, IDENTIFIER, DOT, BINARY, GROUP_START, GROUP_END],
    DOTS = 10,
    MULTIPLICATIVE = DOTS - 1,
    ADDITIVE = MULTIPLICATIVE - 1,
    RELATIONAL = ADDITIVE  - 1,
    EQUALITY = RELATIONAL - 1,
    AND = EQUALITY - 1,
    OR = AND - 1,
    GROUP = OR - 1,
    END = GROUP - 1,
    GROUP_MARK = END - 1,

    OPERATORS = new Map([
        [".", [DOTS, Nodes.Dot]],
        ["*", [MULTIPLICATIVE, Nodes.Multiplication]],
        ["/", [MULTIPLICATIVE, Nodes.Division]],
        ["+", [ADDITIVE, Nodes.Addition]],
        ["-", [ADDITIVE, Nodes.Subtraction]],
        [">", [RELATIONAL, Nodes.Greater]],
        [">=", [RELATIONAL, Nodes.GreaterEquals]],
        ["<", [RELATIONAL, Nodes.Less]],
        ["<=", [RELATIONAL, Nodes.LessEquals]],
        ["==", [EQUALITY, Nodes.Equals]],
        ["!=", [EQUALITY, Nodes.NotEquals]],
        ["&&", [AND, Nodes.And]],
        ["||", [OR, Nodes.Or]]
    ]);

function processOperators (operators, values, precedence) {
    while (operators.length && operators[operators.length - 1][0] >= precedence) {
        const items = values.splice(-2, 2);
        values.push(new (operators.pop()[1])(items[0], items[1]));
    }
}
/**
 * It parses text and returns an AST reference.
 * @param {string} text text to parse
 */
function parse (text) {
    const str = text, LENGTH = str.length, values = [], operators = [];
    for (let offset = 0, index = 0, type = null; offset < LENGTH; offset = ++index) {
        const char = str.charAt(index);
        if(char === " ") continue;
        type = TYPES.find((item) => item.first(type, char, str, index));
        if (!type) throw new Error("Unexpected character " + char + " at " + index);
        for (let i = index + 1, next = type.next && type.next(str.charAt(i));
            next && i < LENGTH;
            next = type.next && type.next(str.charAt(++i))) {
            type = next;
            index = i;
        }
        if (type.build) {
            values.push(type.build(str.slice(offset, index + 1)));
        } else if (type === GROUP_START) {
            operators.push([GROUP_MARK]);
        } else if (type === GROUP_END) {
            processOperators(operators, values, GROUP);
            if (!operators.length) throw new Error("Missing left parenthesis");
            operators.pop();
        } else if (type.kind === OPERATOR) {
            const text = str.slice(offset, index + 1), operator = OPERATORS.get(text);
            if (!operator) throw new Error ("Unknown operator " + text + " at " + offset);
            processOperators(operators, values, operator[0]);
            operators.push(operator);
        } else {
            throw new Error("Open token");
        }
    }
    processOperators(operators, values, END);
    if (operators.length) throw new Error("Missing right parenthesis");
    if (!values.length) throw new Error("Empty expression");
    if (values.length > 1) throw new Error("Internal error, possible bug.");
    return values[0];
}

class Expression {
    constructor (str) {
        this.text = str;
        this.node = parse(str);
    }
    run (ctx) {
        return this.node.getValue(ctx);
    }
}

module.exports = Expression;
