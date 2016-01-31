"use strict";

const Expression = require("./Expression"),
    cache = new Map();

/**
 * @param  {!string} text
 * @param  {!Object} ctx
 * @return {any}
 */
function run(text, ctx) {
    let exp = cache.get(text);
    if (!exp) {
        exp = new Expression(text);
        cache.set(text, exp);
    }
    return exp.run(ctx);
}

run.cache = {
    clear: () => cache.clear(),
    get size() { return cache.size; }
};

module.exports = run;
