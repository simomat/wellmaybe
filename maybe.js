const isMaybe = value => value instanceof NaturalMaybe || value instanceof PromiseMaybe;
function NaturalMaybe(value) {this._value = value;}
NaturalMaybe.prototype = {
    map: function (fun) {
        if (this._value) {
            if (isMaybe(this._value)) {
                return this._value.map(fun);
            }
            return maybeOf(fun(this._value));
        }
        return this;
    },
    orElse: function (fun) {
        if (isMaybe(this._value)) {
            return this._value.orElse(fun);
        }
        if (!this._value) {
            return maybeOf(fun(this._value));
        }
        return maybeOf(this._value);
    },
    asPromise:function () {
        if (this._value) {
            if (isMaybe(this._value)) {
                return this._value.asPromise();
            }
            return Promise.resolve(this._value);
        }
        return Promise.reject();
    }
};
function PromiseMaybe(value) {this._value = value;}
PromiseMaybe.prototype = {
    map: function (fun) {
        return maybeOf(this._value.then(resolved => {
            if (isMaybe(resolved)) {
                return resolved.map(fun);
            }
            if (resolved) {
                return fun(resolved);
            }
            return resolved;}));
    },
    orElse: function (fun) {
        return maybeOf(this._value.then(resolved => {
            if (!resolved) {
                return fun();
            }
            return resolved;
            })
            .catch(reason => fun(reason)));
    },
    asPromise: function () {
        return this._value
            .then(value => {
                if (isMaybe(value)) {
                    return value.asPromise();
                }
                return value;
            });
    }
};
const maybeOf = value => {
    if (value instanceof Promise) {
        return new PromiseMaybe(value);
    }
    return new NaturalMaybe(value);
};
exports.maybeOf = maybeOf;