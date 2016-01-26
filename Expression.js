"use strict";

const Nodes = require("./Nodes"),
    INTERNAL_ERROR = "Internal error, posible bug.",
    VALUE = 1,
    OPERATOR = 2,
    BEFORE_VALUE = (last) => !last || last.kind === OPERATOR,
    STRING_END = {
        kind: VALUE,
        next: () => null,
        build: (str) => new Nodes.Literal(str.substring(1, str.length - 1))
    },
    STRING = {
        kind: VALUE,
        next: (char) => char === "'" ? STRING_END : STRING
    },
    STRING_START = {
        kind: VALUE,
        first: (last, char) => BEFORE_VALUE(last) && char === "'",
        next: (char) => char === "'" ? STRING_END : STRING
    },
    ZERO = {
        kind: VALUE,
        first: (last, char) => BEFORE_VALUE(last) && char === "0",
        next: () => null,
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
            (/^[a-zA-Z0-9_]\.[a-zA-Z_]$/).test(str.substr(index - 1, 3)),
        next: () => null
    },
    BINARY = {
        kind: OPERATOR,
        first: (last, char, str, index) => last && last.kind === VALUE
            && /^[+\-*/&|<>=!] *\S/.test(str.substring(index)),
        next: (char) => /^[=&|]$/.test(char) ? BINARY : null
    },
    TYPES = [STRING_START, ZERO, INTEGER, IDENTIFIER, DOT, BINARY],
    MULTIPLICATIVE = 8,
    ADDITIVE = MULTIPLICATIVE - 1,
    RELATIONAL = ADDITIVE  - 1,
    EQUALITY = RELATIONAL - 1,
    AND = EQUALITY - 1,
    OR = AND - 1,
    OPERATORS = new Map([
        ["+", [ADDITIVE, Nodes.Addition]],
        ["-", [ADDITIVE, Nodes.Subtraction]],
        ["*", [MULTIPLICATIVE, Nodes.Multiplication]],
        ["/", [MULTIPLICATIVE, Nodes.Division]],
        [">", [RELATIONAL, Nodes.Greater]],
        [">=", [RELATIONAL, Nodes.GreaterEquals]],
        ["<", [RELATIONAL, Nodes.Less]],
        ["<=", [RELATIONAL, Nodes.LessEquals]],
        ["==", [EQUALITY, Nodes.Equals]],
        ["!=", [EQUALITY, Nodes.NotEquals]],
        ["&&", [AND, Nodes.And]],
        ["||", [OR, Nodes.Or]],
        [".", [9, Nodes.Dot]]
    ]);

class OperatorBuilder {
    constructor (str, offset, index) {
        const op = str.substring(offset, index),
            operator = OPERATORS.get(str.substring(offset, index));
        if (!operator) {
            throw new Error ("Unknown operator '" + op + "' at " + offset);
        }
        this.precedence = operator[0];
        this.Class = operator[1];
    }
    build (values) {
        const items = values.splice(-2, 2);
        return new this.Class(items[0], items[1]);
    }
}

function processOperators (ops, vals, precedence) {
    while (ops.length && ops[ops.length - 1].precedence >= precedence) {
        vals.push(ops.pop().build(vals));
    }
}

function parse (text) {
    const str = text + " ", LENGTH = str.length, values = [], operators = [];
    let offset = 0, index = 0, type = null, last = null;
    while (index < LENGTH) {
        const char = str.charAt(index);
        if (type === null) {
            if (char === " ") {
                offset += 1;
            } else {
                type = TYPES.find((type) => type.first(last, char, str, index));
                if (!type) {
                    throw new Error("Unexpected character '" + char + "' at " + index);
                }
            }
            index += 1;
        } else {
            const newType = type.next(char);
            if (newType) {
                index += 1;
            } else {
                if (type.kind === VALUE) {
                    values.push(type.build(str.substring(offset, index)));
                } else if (type.kind === OPERATOR) {
                    const operator = new OperatorBuilder(str, offset, index);
                    processOperators(operators, values, operator.precedence);
                    operators.push(operator);
                } else {
                    throw new Error(INTERNAL_ERROR);
                }
                offset = index;
                last = type;
            }
            type = newType;
        }
    }

    if (type) {
        throw new Error("Open token");
    }

    if (!last) {
        throw new Error("Empty expression");
    }

    processOperators(operators, values, -1);

    if (values.length > 1) {
        throw new Error(INTERNAL_ERROR);
    }
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
