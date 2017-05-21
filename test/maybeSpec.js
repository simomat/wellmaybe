const {assertThat, is, falsy} = require('hamjest');
const {spy, wasCalled, wasCalledWith, wasNotCalled} = require('spyjest');

const {Maybe}  = require('../maybe');

const throwError = () => {
    throw 'this should not be called';
};

const falsyValue = undefined;

describe("natural Maybe", function () {

    it("given a Maybe.of(truthlyValue), truthlyValue is passed to the function given to map()", function () {
        let maybe = Maybe.of(2);
        let func = spy();

        maybe.map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith(2));
    });

    it("given a Maybe.of(falsyValue), the function passed to map() is not called", function () {
        let maybe = Maybe.of(falsyValue);
        let func = spy();

        maybe.map(func);

        assertThat(func, wasNotCalled());
    });

    it("given a Maybe.of(falsyValue), the function passed to orElse() is called and falsyValue is passed", function () {
        let maybe = Maybe.of(falsyValue);
        let func = spy();

        maybe.orElse(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith(falsy()));
    });

    it("given a Maybe.of(truthlyValue) and orElse() is chained, orElse() returns a Maybe.of(truthlyValue)", function () {
        let maybe = Maybe.of(1);
        let func = spy();

        maybe
            .orElse(() => 2)
            .map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith(1));
    });

    it("given a Maybe.of(falsyValue), orElse() returns a Maybe.of(value) where value is return by the function passed to orElse()", function () {
        let maybe = Maybe.of(falsyValue);
        let func = spy();

        maybe
            .orElse(() => 2)
            .map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith(2));
    });

    it("given a Maybe.of(falsyValue) and the function passed to orElse() returns a value, orElse() returns a Maybe.of(value)", function () {
        let maybe = Maybe.of(falsyValue);
        let func = spy();

        maybe
            .orElse(() => 1)
            .map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith(1));
    });

    it("given a Maybe.of(truthlyValue), the function passed to orElse() is not called", function () {
        let maybe = Maybe.of(2);
        let func = spy();

        maybe.orElse(func);

        assertThat(func, wasNotCalled());
    });

    it("given a Maybe.of(falsyValue) and map() and orElse() are chained, the function passed to orElse() is called", function () {
        let maybe = Maybe.of(falsyValue);
        let func = spy();

        maybe
            .map(_ => _)
            .orElse(func);

        assertThat(func, wasCalled().times(1));
    });

    it("given a Maybe.of(truthlyValue), a function of a chained map() is passed the result of the function passed to the previous map()", function () {
        let maybe = Maybe.of(2);
        let func = spy();

        maybe
            .map(() => 3)
            .map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith(3));
    });

    it("given a Maybe.of(truthlyValue) and functions passed to chained map() return a Maybe.of(), all functions passed to map() are passed the inner values of the previous map() result (default flatMap())", function () {
        let maybe = Maybe.of(1);
        let func1 = spy(() => Maybe.of(3));
        let func2 = spy();

        maybe
            .map(() => Maybe.of(2))
            .map(func1)
            .map(func2);

        assertThat(func1, wasCalled().times(1));
        assertThat(func1, wasCalledWith(2));

        assertThat(func2, wasCalled().times(1));
        assertThat(func2, wasCalledWith(3));
    });

    it("given a Maybe.of(truthlyValue) and the function passed to map() returns encapsulated Maybe.of()s, the function passed to a chained map() is passed the inner value (default flatMap())", function () {
        let maybe = Maybe.of(1);
        let func = spy();

        maybe
            .map(() => Maybe.of(Maybe.of(Maybe.of(2))))
            .map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith(2));
    });

    it("given a Maybe.of(truthlyValue) and the function passed to map() returns encapsulated Maybe.of(falsyValue), the function passed to a chained orElse() is called (default flatMap())", function () {
        let maybe = Maybe.of(1);
        let func = spy();

        maybe
            .map(() => Maybe.of(Maybe.of(Maybe.of(falsyValue))))
            .orElse(func);

        assertThat(func, wasCalled().times(1));
    });

    it("given a Maybe.of(truthlyValue) and one function passed to a chained map() returns falsyValue, all subsequent functions passed to map() are not called", function () {
        let maybe = Maybe.of(1);
        let func1 = spy(() => Maybe.of(3));
        let func2 = spy();

        maybe
            .map(() => falsyValue)
            .map(func1)
            .map(func2);

        assertThat(func1, wasNotCalled());
        assertThat(func2, wasNotCalled());
    });

    it("given a Maybe.of(truthlyValue) and one function passed to a chained map() returns falsyValue, the final orElse() is called", function () {
        let maybe = Maybe.of(1);
        let func = spy();

        maybe
            .map(() => falsyValue)
            .map(_ => _)
            .map(_ => _)
            .orElse(func);

        assertThat(func, wasCalled().times(1));
    });

    it("given a Maybe.all(), the function passed to then() is called with []", function () {
        let maybe = Maybe.all();
        let func = spy();

        maybe.map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith([]));
    });


    it("given a Maybe.all(truthlyValue), the function passed to then() is called with [truthlyValue]", function () {
        let maybe = Maybe.all(1);
        let func = spy();

        maybe.map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith([1]));
    });

    it("given a Maybe.all(Maybe.of(truthlyValue)), the function passed to then() is called with [truthlyValue]", function () {
        let maybe = Maybe.all(1);
        let func = spy();

        maybe.map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith([1]));
    });

    it("given a Maybe.all(falsyValue), the function passed to orElse() is called", function () {
        let maybe = Maybe.all(falsyValue);
        let func = spy();

        maybe.orElse(func);

        assertThat(func, wasCalled().times(1));
    });

    it("given a Maybe.all(Maybe.of(falsyValue)), the function passed to orElse() is called", function () {
        let maybe = Maybe.all(Maybe.of(falsyValue));
        let func = spy();

        maybe.orElse(func);

        assertThat(func, wasCalled().times(1));
    });

    it("given a Maybe.all(truthlyValue1, truthlyValue2), the function passed to then() is called with [truthlyValue1, truthlyValue2]", function () {
        let maybe = Maybe.all(1,2);
        let func = spy();

        maybe.map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith([1, 2]));
    });

    it("given a Maybe.all(truthlyValue1, Maybe.of(truthlyValue2)), the function passed to then() is called with [truthlyValue1, truthlyValue2]", function () {
        let maybe = Maybe.all(1, Maybe.of(2));
        let func = spy();

        maybe.map(func);

        assertThat(func, wasCalled().times(1));
        assertThat(func, wasCalledWith([1, 2]));
    });


    it("given a Maybe.all(truthlyValue, falsyValue), the function passed to orElse() is called", function () {
        let maybe = Maybe.all(1, falsyValue);
        let func = spy();

        maybe.orElse(func);

        assertThat(func, wasCalled().times(1));
    });
});

describe("promise Maybe", function () {

    it("given a Maybe.of(promise), the function passed to map() is called asynchronously with resolved value", function (done) {
        let maybe = Maybe.of(Promise.resolve(3));
        let wasCalledYet = false;

        maybe.map(value => {
            wasCalledYet = true;
            assertThat(value, is(3));
            done();
        });

        assertThat(wasCalledYet, is(false));
    });

    it("given a Maybe.of(promise) and promise resolves to falsyValue, the function passed to map() is not called", function (done) {
        let promise = Promise.resolve(falsyValue);
        let maybe = Maybe.of(promise);

        maybe.map(throwError);

        promise.then(done);
    });

    it("given a Maybe.of(promise) and promise resolves to falsyValue, the function passed to orElse() is called", function (done) {
        let maybe = Maybe.of(Promise.resolve(falsyValue));

        maybe.orElse(done);
    });

    it("given a Maybe.of(promise) and promise resolves to truthlyValue, the function passed to orElse() is not called", function (done) {
        let promise = Promise.resolve(3);
        let maybe = Maybe.of(promise);

        maybe.orElse(throwError);

        promise.then(() => done());
    });

    it("given a Maybe.of(promise) and promise resolves to falsyValue, the function passed to orElse() is called, after orElse() is chained to the result of map()", function (done) {
        let maybe = Maybe.of(Promise.resolve(falsyValue));

        maybe
            .map(_ => _)
            .orElse(done);

    });

    it("given a Maybe.of(promise) and promise resolves to truthlyValue, the function passed to a chained map() is called with the result of the function passed to 1st map()", function (done) {
        let maybe = Maybe.of(Promise.resolve(2));

        maybe
            .map(() => 3)
            .map(value => {
                assertThat(value, is(3));
                done();
            });

    });

    it("given a Maybe.of(promise) and functions passed to chained map() returning a Maybe.of(), all functions given to chained map() are passed the inner values of the previous map() result (default flatMap())", function (done) {
        let maybe = Maybe.of(Promise.resolve(1));
        let func = spy(() => Maybe.of(Promise.resolve(3)));

        maybe
            .map(() => Maybe.of(Promise.resolve(2)))
            .map(func)
            .map(value => {
                assertThat(func, wasCalledWith(2));
                assertThat(value, is(3));
                done();
            });
    });

    it("given a Maybe.of(promise) and the function passed to map() returns a Promise, the function passed to a chained map() is passed the value of the promise (default flatMap())", function (done) {
        let maybe = Maybe.of(Promise.resolve(1));

        maybe
            .map(() => Promise.resolve(2))
            .map(value => {
                assertThat(value, is(2));
                done();
            })
    });

    it("given a Maybe.of(promise) and the promise is rejected, the function passed to orElse() is called with the reject reason argument", function (done) {
        let maybe = Maybe.of(Promise.reject(1));

        maybe.orElse(reason => {
            assertThat(reason, is(1));
            done();
        })
    });

    it("given a Maybe.of(promise) and a function passed to a chained map() rejects, functions passed to subsequent map()s are not called (sort of default flatMap())", function (done) {
        let maybe = Maybe.of(Promise.resolve(1));
        let func = spy();

        maybe
            .map(() => Promise.reject(2))
            .map(func)
            .orElse(() => {
                assertThat(func, wasNotCalled());
                done();
            })
    });

    it("given a Maybe.of(promise) and a function passed to a chained map() rejects with Maybe.of(rejectingPromise), functions passed to subsequent map()s are not called (sort of default flatMap())", function (done) {
        let func = spy();

        Maybe.of(Promise.resolve(1))
            .map(() => Maybe.of(Promise.reject(2)))
            .map(func)
            .orElse(r => {
                assertThat(func, wasNotCalled());
                assertThat(r, is(2));
                done();
            });

    });

    it("given a Maybe.of(promise) and a function passed to a chained map() rejects, the function passed to a final orElse() is called with the reject reason (sort of default flatMap())", function (done) {
        let maybe = Maybe.of(Promise.resolve(1));

        maybe
            .map(() => Promise.reject(2))
            .map(_ => _)
            .orElse(reason => {
                assertThat(reason, is(2));
                done();
            })
    });

    it("given a Maybe.of(promise) and the promise resolves to value A and a function is passed to orElse(), orElse() returns a Maybe.of(promise) which resolves to value A", function (done) {
        let maybe = Maybe.of(Promise.resolve(1));

        maybe
            .orElse(() => 2)
            .map(value => {
                assertThat(value, is(1));
                done();
            });
    });

    it("given a Maybe.of(promise) and the promise resolves to falsyValue, orElse() returns a Maybe.of(promise) which resolves to the value return by the function passed to orElse()", function (done) {
        let maybe = Maybe.of(Promise.resolve(falsyValue));

        maybe
            .orElse(() => 2)
            .map(value => {
                assertThat(value, is(2));
                done();
            });
    });

    it("given a Maybe.of(promise) and the promise rejects, orElse() returns a Maybe.of(promise) where promise resolves to the return value of the function passed to orElse()", function (done) {
        let maybe = Maybe.of(Promise.reject(1));

        maybe = maybe.orElse(() => 2);

        maybe.map(value => {
            assertThat(value, is(2));
            done();
        })
    });

    it("given a Maybe.all(promise) and the promise resolves to truthlyValue, the function passed to then() is called with [truthlyValue]", function (done) {
        let maybe = Maybe.all(Promise.resolve(1));

        maybe.map(value => {
            assertThat(value, is([1]));
            done();
        });
    });

    it("given a Maybe.all(Maybe.of(promise)) and the promise resolves to truthlyValue, the function passed to then() is called with [truthlyValue]", function (done) {
        let maybe = Maybe.all(Maybe.of(Promise.resolve(1)));

        maybe.map(value => {
            assertThat(value, is([1]));
            done();
        });
    });

    it("given a Maybe.all(promise) and the promise rejects, the function passed to orElse() is called with the reason", function (done) {
        let maybe = Maybe.all(Promise.reject(1));

        maybe.orElse(reason => {
            assertThat(reason, is(1));
            done();
        });
    });


    it("given a Maybe.all(Maybe.of(promise)) and the promise rejects, the function passed to orElse() is called with the reason", function (done) {
        let maybe = Maybe.all(Maybe.of(Promise.reject(1)));

        maybe.orElse(reason => {
            assertThat(reason, is(1));
            done();
        });
    });

    it("given a Maybe.all(promise1, promise2) and the promises resolve to truthlyValue1 and truthlyValue2, the function passed to then() is called with [truthlyValue1, truthlyValue2]", function (done) {
        let maybe = Maybe.all(Promise.resolve(1), Promise.resolve(2));

        maybe.map(values => {
            assertThat(values, is([1, 2]));
            done();
        });
    });

    it("given a Maybe.all(promise1, Maybe.of(promise2)) and the promises resolve to truthlyValue1 and truthlyValue2, the function passed to then() is called with [truthlyValue1, truthlyValue2]", function (done) {
        let maybe = Maybe.all(Promise.resolve(1), Maybe.of(Promise.resolve(2)));

        maybe.map(values => {
            assertThat(values, is([1, 2]));
            done();
        });
    });

    it("given a Maybe.all(promise1, promise2) and the promise1 resolves but promise2 rejects, further chained functions with map() are not called", function (done) {
        let maybe = Maybe.all(Promise.resolve(1), Promise.reject(2));
        let fun = spy();

        maybe
            .map(fun)
            .orElse(() => {
                assertThat(fun, wasNotCalled());
                done();
            });
    });

    it("given a Maybe.all(promise1, promise2) and the promise1 resolves but promise2 rejects, the function passed to orElse() is called with the reason", function (done) {
        let maybe = Maybe.all(Promise.resolve(1), Promise.reject(2));

        maybe
            .orElse(reason => {
            assertThat(reason, is(2));
            done();
        });
    });

    it("given a Maybe.all(promise1, Maybe.of(promise2)) and the promise1 resolves but promise2 rejects, the function passed to orElse() is called with the reason", function (done) {
        let maybe = Maybe.all(Promise.resolve(1), Maybe.of(Promise.reject(2)));

        maybe
            .orElse(reason => {
                assertThat(reason, is(2));
                done();
            });
    });

    it("given a Maybe.all(promise1, promise2) and the promise1 resolves but promise1 rejects, the function passed to orElse() is called with the reason", function (done) {
        let maybe = Maybe.all(Promise.reject(1), Promise.resolve(2));

        maybe
            .orElse(reason => {
                assertThat(reason, is(1));
                done();
            });
    });


    it("given a Maybe.all(Maybe.of(promise1), promise2) and the promise1 resolves but promise1 rejects, the function passed to orElse() is called with the reason", function (done) {
        let maybe = Maybe.all(Maybe.of(Promise.reject(1)), Promise.resolve(2));

        maybe
            .orElse(reason => {
                assertThat(reason, is(1));
                done();
            });
    });

});

describe("mixing natural and promise Maybes", function () {

    it("given a Maybe.of(truthlyValue) and the function passed to map() returns a Promise, the function passed to another chained map() is passed the value resolved by the Promise", function (done) {
        let maybe = Maybe.of(1);

        maybe
            .map(() => Promise.resolve(2))
            .map(value => {
                assertThat(value, is(2));
                done();
            });
    });

    it("given a Maybe.of(truthlyValue) and the function passed to map() returns a Promise, the function passed to another chained map() is called asynchronously", function (done) {
        let maybe = Maybe.of(1);
        let mainFlowEnded = false;

        maybe
            .map(() => Promise.resolve(1))
            .map(() => {
                assertThat(mainFlowEnded, is(true));
                done();
            });

        assertThat(mainFlowEnded, is(false));
        mainFlowEnded = true;
    });

    it("given a Maybe.of(promise) and the function passed to map() returns a Maybe.of(truthlyValue), the function passed to another chained map() is passed the truthlyValue", function (done) {
        let maybe = Maybe.of(Promise.resolve(1));

        maybe
            .map(() => Maybe.of(2))
            .map(value => {
                assertThat(value, is(2));
                done();
            });
    });

    it("given a Maybe.of(promise) and the function passed to orElse() returns a Maybe.of(truthlyValue), the function passed to another chained map() is passed the truthlyValue", function (done) {
        let maybe = Maybe.of(Promise.reject(1));

        maybe
            .orElse(() => Maybe.of(2))
            .map(value => {
                assertThat(value, is(2));
                done();
            });
    });

    it("given a Maybe.of(resolvingPromise) and the function passed to map() returns a Maybe.of(truthlyValue), asPromise() returns a promise that resolves truthlyValue (default flatMap())", function (done) {
        let maybe = Maybe.of(Promise.resolve(2));

        let promise = maybe
            .map(i => Maybe.of(i))
            .asPromise();

        promise.then(value => {
            assertThat(value, is(2));
            done();
        });
    });


    it("given a Maybe.of(rejectingPromise) and the function passed to orElse() returns a Maybe.of(truthlyValue), asPromise() returns a promise that resolves truthlyValue (default flatMap())", function (done) {
        let maybe = Maybe.of(Promise.reject());

        let promise = maybe
            .orElse(() => Maybe.of(1))
            .asPromise();

        promise.then(value => {
            assertThat(value, is(1));
            done();
        });
    });

    it("given a Maybe.of(resolvingPromise) and the function passed to map() returns a Maybe.of(falsyValue), asPromise() returns a promise that rejects (default flatMap())", function (done) {
        let maybe = Maybe.of(Promise.resolve(1));

        let promise = maybe
            .map(() => Maybe.of(falsyValue))
            .asPromise();

        promise.catch(done);
    });

    it("given a Maybe.of(rejectingPromise) and the function passed to orElse() returns a Maybe.of(falsyValue), asPromise() returns a promise that rejects (default flatMap())", function (done) {
        let maybe = Maybe.of(Promise.reject());

        let promise = maybe
            .orElse(() => Maybe.of(falsyValue))
            .asPromise();

        promise.catch(done);
    });

    it("given a Maybe.all(promise, truthlyValue2) and promise1 resolve to truthlyValue1, the function passed to then() is called with [truthlyValue1, truthlyValue2]", function (done) {
        let maybe = Maybe.all(Promise.resolve(1), 2);

        maybe.map(values => {
            assertThat(values, is([1, 2]));
            done();
        });
    });

    it("given a Maybe.all(promise, Maybe.of(truthlyValue2)) and the promise resolves to truthlyValue1, the function passed to then() is called with [truthlyValue1, truthlyValue2]", function (done) {
        let maybe = Maybe.all(Promise.resolve(1), Maybe.of(2));

        maybe.map(values => {
            assertThat(values, is([1, 2]));
            done();
        });
    });

    it("given a Maybe.all(falsyValue, promise), further chained functions with map() are not called", function (done) {
        let maybe = Maybe.all(falsyValue, Promise.resolve(1));
        let fun = spy();

        maybe
            .map(fun)
            .orElse(() => {
                assertThat(fun, wasNotCalled());
                done();
            });
    });

    it("given a Maybe.all(promise, truthlyValue) and the promise rejects, the function passed to orElse() is called with the reason", function (done) {
        let maybe = Maybe.all(Promise.reject(1), 2);

        maybe
            .orElse(reason => {
                assertThat(reason, is(1));
                done();
            });
    });

    it("given a Maybe.all(promise, Maybe.of(falsyValue)), the function passed to orElse() is called", function (done) {
        let maybe = Maybe.all(Promise.resolve(1), Maybe.of(falsyValue));

        maybe
            .orElse(() => {
                done();
            });
    });

});

describe("converting Maybes", function () {

    it("given a Maybe.of(truthlyValue), asPromise() returns a Promise that resolves the truthlyValue", function (done) {
        let maybe = Maybe.of(1);

        maybe
            .asPromise()
            .then(value => {
                assertThat(value, is(1));
                done();
            });
    });

    it("given a Maybe.of(falsyValue), asPromise() returns a Promise that rejects", function (done) {
        let maybe = Maybe.of(falsyValue);

        maybe
            .asPromise()
            .catch(done);
    });

    it("given a Maybe.of(promise) and the promise resolves a value, asPromise() returns a Promise that resolves the same result", function (done) {
        let maybe = Maybe.of(Promise.resolve(1));

        maybe
            .asPromise()
            .then(value => {
                assertThat(value, is(1));
                done();
            });
    });

    it("given a Maybe.of(promise) and the promise rejects, asPromise() returns a Promise that rejects with same reason", function (done) {
        let maybe = Maybe.of(Promise.reject(1));

        maybe
            .asPromise()
            .catch(reason => {
                assertThat(reason, is(1));
                done();
            });
    });

    it("given a Maybe.of(Maybe.of(truthlyValue)), asPromise() returns a Promise that resolves to truthlyValue", function (done) {
        let maybe = Maybe.of(Maybe.of(1));

        maybe
            .asPromise()
            .then(value => {
                assertThat(value, is(1));
                done();
            });
    });

    it("given a Maybe.of(Maybe.of(falsyValue)), asPromise() returns a Promise that rejects", function (done) {
        let maybe = Maybe.of(Maybe.of(falsyValue));

        maybe
            .asPromise()
            .catch(() => {
                done();
            });
    });

    it("given a Maybe.of(Maybe.of(promise)), asPromise() returns the inner promise", function (done) {
        let maybe = Maybe.of(Maybe.of(Promise.resolve(1)));

        maybe
            .asPromise()
            .then(value => {
                assertThat(value, is(1));
                done();
            });
    });
});

describe('reusing Maybe', function () {

    it('given a Maybe.of(truthlyValue), calling map() twice on the same object calls the handler both times with same argument and does not call the a handler passed to orElse()', function () {
        let maybe = Maybe.of(44);
        let fun = spy();
        let noFun = spy();

        maybe.map(fun);
        maybe.map(fun);
        maybe.orElse(noFun);

        assertThat(fun, wasCalled().times(2));
        assertThat(fun, wasCalledWith(44).times(2));
        assertThat(noFun, wasNotCalled());
    });

    it('given a Maybe.of(falsyValue), calling orElse() twice on the same object calls the handler both times and does not call a handler passed to map()', function () {
        let maybe = Maybe.of(falsyValue);
        let fun = spy();
        let noFun = spy();

        maybe.orElse(fun);
        maybe.orElse(fun);
        maybe.map(noFun);

        assertThat(fun, wasCalled().times(2));
        assertThat(noFun, wasNotCalled());
    });

    it('given a Maybe.of(resolvingPromise), calling map() twice on the same object calls the handler both times with same argument and does not call the a handler passed to orElse()', function (done) {
        let maybe = Maybe.of(Promise.resolve(34));
        let fun = spy(() => true);
        let noFun = spy();

        let result1 = maybe.map(fun);
        let result2 = maybe.map(fun);
        let result3 = maybe.orElse(noFun);

        Maybe.all(result1, result2, result3).map(() => {
            assertThat(fun, wasCalled().times(2));
            assertThat(fun, wasCalledWith(34).times(2));
            assertThat(noFun, wasNotCalled());
            done();
        });
    });

    it('given a Maybe.of(falsyValue), calling orElse() twice on the same object calls the handler both times with same argument and does not call a handler passed to map()', function (done) {
        let maybe = Maybe.of(Promise.reject(23));
        let fun = spy();
        let noFun = spy();

        let result1 = maybe.orElse(fun);
        let result2 = maybe.orElse(fun);
        let result3 = maybe.map(noFun);

        Maybe.all(result1, result2, result3).orElse(() => {
            assertThat(fun, wasCalled().times(2));
            assertThat(fun, wasCalledWith(23).times(2));
            assertThat(noFun, wasNotCalled());
            done();
        });
    });
});