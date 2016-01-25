"use strict";

const Nodes = require("./Nodes"),
    INTERNAL_ERROR = "Internal error, posible bug.",
    VALUE = 1,
    OPERATOR = 2,
    //TYPES
    BINARY_OPERATOR_RE = /^[+\-*/] *\S/,
    BINARY_OPERATOR = {
        kind: OPERATOR,
        previous: (last) => last && last.kind === VALUE,
        first: (str, index) => BINARY_OPERATOR_RE.test(str.substr(index)),
        next: () => null
    },
    VALUE_BEFORE = (last) => !last || last === BINARY_OPERATOR,
    STRING_END_TYPE = {
        kind: VALUE,
        next: () => null,
        build: (str) => new Nodes.Literal(str.substring(1, str.length - 1))
    },
    STRING_TYPE = {
        kind: VALUE,
        next: (char) => char === "'" ? STRING_END_TYPE : STRING_TYPE
    },
    STRING_START_TYPE = {
        kind: VALUE,
        previous: VALUE_BEFORE,
        first: (str, index) => str.charAt(index) === "'",
        next: (char) => char === "'" ? STRING_END_TYPE : STRING_TYPE
    },
    INTEGER_TYPE = {
        kind: VALUE,
        previous: VALUE_BEFORE,
        first: (str, index) => (/[1-9]/).test(str.charAt(index)),
        next: (char) => (/[0-9]/).test(char) ? INTEGER_TYPE : null,
        build: (str) => new Nodes.Literal(parseInt(str))
    },
    ID_RE = /^[a-zA-Z_]$/,
    ID_N_RE = /^[a-zA-Z0-9_]$/,
    IDENTIFIER_TYPE = {
        kind: VALUE,
        previous: VALUE_BEFORE,
        first: (str, index) => ID_RE.test(str.charAt(index)),
        next: (char) => ID_N_RE.test(char) ? IDENTIFIER_TYPE : null,
        build: (str) => new Nodes.Identifier(str)
    },
    PROPERTY_RE = /^\.[a-zA-Z_]$/,
    PROPERTY_TYPE = {
        kind: VALUE,
        previous: () => true,
        first: (str, index) => PROPERTY_RE.test(str.substr(index - 1, 2)),
        next: (char) => ID_N_RE.test(char) ? PROPERTY_TYPE : null,
        build: (str) => new Nodes.Property(str)
    },
    DOT_OPERATOR = {
        kind: OPERATOR,
        previous: (last) => last && ~[IDENTIFIER_TYPE, PROPERTY_TYPE].indexOf(last),
        first: (str, index) => (/\w\.\w/).test(str.substr(index - 1, 3)),
        next: () => null
    },
    Types = Object.freeze({
        STRING_START_TYPE,
        INTEGER_TYPE,
        PROPERTY_TYPE,
        IDENTIFIER_TYPE,
        DOT_OPERATOR,
        BINARY_OPERATOR
    }),
    TYPE_KEYS = Object.keys(Types),
    OPERATORS = new Map([
        ["+", [2, Nodes.Addition]],
        ["-", [2, Nodes.Subtraction]],
        ["*", [3, Nodes.Multiplication]],
        ["/", [3, Nodes.Division]],
        [".", [9, Nodes.Dot]]
    ]);

class OperatorBuilder {
    constructor (text) {
        const operator = OPERATORS.get(text);
        this.precedence = operator[0];
        this.Class = operator[1];
    }
    build (values) {
        const items = values.splice(-2, 2);
        return new this.Class(items[0], items[1]);
    }
}

function findType (str, index) {
    for (const key of TYPE_KEYS) {
        if (Types[key].first(str, index)) {
            return Types[key];
        }
    }
    return null;
}

function processOperators (ops, vals, precedence) {
    while (ops.length && ops[ops.length - 1].precedence >= precedence) {
        vals.push(ops.pop().build(vals));
    }
}

function parse (str) {
    const STR = str + " ", LENGTH = STR.length, values = [], operators = [];
    let offset = 0, index = 0, type = null, last = null;
    while (index < LENGTH) {
        if (type === null) {
            const char = STR.charAt(index);
            if (char === " ") {
                offset += 1;
            } else {
                type = findType(str, index, last);
                if (!type || !type.previous(last)) {
                    throw new Error("Unexpected character '" + char + "' at " + index);
                }
            }
            index += 1;
        } else {
            const newType = type.next(STR.charAt(index));
            if (newType) {
                index += 1;
            } else {
                if (type.kind === VALUE) {
                    values.push(type.build((STR.substring(offset, index))));
                } else if (type.kind === OPERATOR) {
                    const operator = new OperatorBuilder(STR.substring(offset, index));
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
