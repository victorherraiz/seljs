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

class Property extends Value {
    getValue () {
        return this.value;
    }
}

class Identifier extends Value {
    getValue (ctx) {
        const value = ctx[this.value];
        return value === undefined ? null : value;
    }
}

class BinaryOperator {
    constructor (left, right) {
        this.left = left;
        this.right = right;
    }
}

class Addition extends BinaryOperator {
    getValue (ctx) {
        return this.left.getValue(ctx) + this.right.getValue(ctx);
    }
}

class Subtraction extends BinaryOperator {
    getValue (ctx) {
        return this.left.getValue(ctx) - this.right.getValue(ctx);
    }
}

class Multiplication extends BinaryOperator {
    getValue (ctx) {
        return this.left.getValue(ctx) * this.right.getValue(ctx);
    }
}

class Division extends BinaryOperator {
    getValue (ctx) {
        return this.left.getValue(ctx) / this.right.getValue(ctx);
    }
}

class Dot extends BinaryOperator {
    getValue (ctx) {
        const value = this.left.getValue(ctx),
            prop = value && value[this.right.getValue(ctx)];
        return prop === undefined ? null : prop;
    }
}

module.exports = {
    Literal, Identifier,
    Addition, Subtraction, Multiplication, Division,
    Dot, Property
};
