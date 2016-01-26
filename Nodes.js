"use strict";

class Value {
    constructor (value) {
        this.value = value;
    }
}

class Literal extends Value {
    getValue () {
        return this.value;
    }
}

class Identifier extends Value {
    getValue (ctx) {
        if (ctx === null || ctx === undefined) {
            return null;
        }
        const value = this.value;
        return ctx.hasOwnProperty(value) ? ctx[value] : null;
    }
}

class BinaryOperator {
    constructor (left, right) {
        this.left = left;
        this.right = right;
    }
    getValue(ctx) {
        return this.op(this.left.getValue(ctx), this.right.getValue(ctx));
    }
}

class Addition extends BinaryOperator {
    op (left, right) {
        return left + right;
    }
}

class Subtraction extends BinaryOperator {
    op (left, right) {
        return left - right;
    }
}

class Multiplication extends BinaryOperator {
    op (left, right) {
        return left * right;
    }
}

class Division extends BinaryOperator {
    op (left, right) {
        return left / right;
    }
}

class And extends BinaryOperator {
    op (left, right) {
        return left && right;
    }
}

class Or extends BinaryOperator {
    op (left, right) {
        return left || right;
    }
}

class Equals extends BinaryOperator {
    op (left, right) {
        return left === right;
    }
}

class NotEquals extends BinaryOperator {
    op (left, right) {
        return left !== right;
    }
}

class Greater extends BinaryOperator {
    op (left, right) {
        return left > right;
    }
}

class GreaterEquals extends BinaryOperator {
    op (left, right) {
        return left >= right;
    }
}

class Less extends BinaryOperator {
    op (left, right) {
        return left < right;
    }
}

class LessEquals extends BinaryOperator {
    op (left, right) {
        return left <= right;
    }
}

class Dot extends BinaryOperator {
    getValue (ctx) {
        // TODO Pass the global context also
        return this.right.getValue(this.left.getValue(ctx));
    }
}

module.exports = {
    Literal, Identifier,
    Addition, Subtraction, Multiplication, Division,
    And, Or, Equals, NotEquals, Greater, GreaterEquals, Less, LessEquals,
    Dot
};
