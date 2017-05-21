function Maybe(value) { this._value = value; }
Maybe.prototype = {
    map: function (fun) {
        if (this._value instanceof Promise) {
            return new Maybe(this._value.then(resolved => {
                if (resolved instanceof Maybe) { return resolved.map(fun); }
                if (resolved) { return fun(resolved); }
                return resolved;})); }
        if (this._value) { return this._value instanceof Maybe ? this._value.map(fun) : new Maybe(fun(this._value)); }
        return this; },
    orElse: function (fun) {
        if (this._value instanceof Promise) {
            return new Maybe(this._value.then(resolved => {
                if (resolved instanceof Maybe) { return resolved.orElse(fun); }
                if (!resolved) { return fun(); }
                return resolved;})
            .catch(reason => fun(reason))); }
        if (this._value instanceof Maybe) { return this._value.orElse(fun); }
        return (this._value) ? new Maybe(this._value) : new Maybe(fun(this._value)) },
    asPromise: function () {
        if (this._value instanceof Promise) {
            return this._value.then(value => value instanceof Maybe ? value.asPromise() : value); }
        if (this._value) {
            return this._value instanceof Maybe ? this._value.asPromise() : Promise.resolve(this._value); }
        return Promise.reject(); }
};
Maybe.of = value => value instanceof Maybe ? value : new Maybe(value);
Maybe.all = function () {
    if (arguments.length === 0) { return new Maybe(); }
    return Array.prototype.reduce.call(
        arguments,
        (maybe, part) => maybe.map(results =>
            Maybe.of(part).map(partResult => { results.push(partResult); return results; })),
        new Maybe([]));
};
exports.Maybe = Maybe;