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

function getFromContext (ctx, prop) {
    if (ctx === null || ctx === undefined) {
        return null;
    }
    return ctx.hasOwnProperty(prop) ? ctx[prop] : null;
}

class Identifier extends Value {
    getValue (ctx) {
        return getFromContext(ctx, this.value);
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
        return  getFromContext(this.left.getValue(ctx), this.right.getValue(ctx));
    }
}

module.exports = {
    Literal, Identifier,
    Addition, Subtraction, Multiplication, Division,
    Dot, Property
};
