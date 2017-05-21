# wellmaybe

A monad implementation that provides a general API for null-object pattern and promises.

`npm install wellmaybe`

### So why would you use that?
 * Provides abstraction of null-object pattern and asynchronous execution with a one-size-fits-all API. Use it everywhere, forget about sync/async control flow. Well, at least a little.
 * Use functional style Maybe monads. There are quite a few benefits you get by this. It...
   * enhances encapsulation
   * provides composition through operation chaining, avoid the pyramid of doom / callback hell
   * reduces control blocks, enhances readability
   * when using pure functions, it helps to reduce side effects
   * support stateless programming, reduce JavaScript scope size and potentially increase performance  

Due to the nature of JavaScript, you would not get the benefits of type safe monad operations. Well this is not Haskell anyway, right?

### Examples
```javascript
// execute handler functions based on values
let fun = () => 2;
Maybe.of(fun())
  .map(v => log('got ' + v))       // -> log('got 2') is called
  .orElse(() => log('no value'));  // this handler is not called
```
```javascript
// provide a default value and chain handlers
let getItemList = () => undefined;
Maybe.of(getItemList())
  .orElse(() => [])                  // provide [] if inner value is falsy
  .map(items => handleItems(items))  // pass items to handler ([] in that case)
  .map(printResult);                 // pass previous result (of handleItems(items)) to next handler
```
```javascript
// work with Promises
let myPromise = new Promise((resolve, reject) =>
                      setTimeout(() => resolve(42), 1000));
Maybe.of(myPromise)       // Maybe of that symbolizes the value of a promise
  .map(v => addFive(v))   // call addFive(42) asynchronously
  .map(r => log(r))       // calls log(r) whenever addFive() is done
```
```javascript
// handle rejecting Promises
Maybe.of(Promise.reject('whoopsi'))  // a maybe of a rejection promise
  .map(() => doSomething())         // is not called because the promise is rejecting
  .orElse(log);                     // -> log('whoopsi') is called
```
```javascript
// extract nested values - automatic 'flatMap' behavior
let getItems = count => Maybe.of(something(count));
Maybe.of(getCount())
  .map(getItems)      // results into a Maybe.of(Maybe.of(...))
  .map(handleItems);  // -> handleItems(something(count)), not  handleItems(Maybe.of(...))
```
```javascript
// extract nested promises, too
// this also applies for nested mixed Promise/Maybe
Maybe.of(true)
  .map(() => Promise.resolve(Maybe.of(1)))  //
  .map(log);                               // -> log(1) is called
```
```javascript
// leave the monad space - extract concrete value as a Promise (rarely needed)
let maybe = getSomeMaybe();       // you might not know if inner value is present yet
let promise = maybe.asPromise();  // .then() and .catch() act like .map() and .orElse() of the maybe
```
```javascript
// handle results of multiple Maybes, Promises or literals
Maybe.all(Promise.resolve(1), '2', Maybe.of(3), Maybe.of(Promise.resolve(4)))
  .map(handleResult)         // -> handleResult([1, '2', 3, 4])
  .orElse(handleNoResult);   // would be called if one or more results are 'not fulfilled'
```


### Reasons why you might not want to use that
 * The control flow is obfuscated when mixing `Maybe.of(Promise)` and `Maybe.of(distinctValue)` and debugging becomes *different*.
 * You cannot get the inner value of a maybe like `maybe.getValue()`, because it might not be resolved at this time. However `maybe.asPromise()` returns the value as Promise. (Other APIs might insist on promises.)
 * There is a little semantics clash between `Promise` and `Maybe`:
   * `Promise.resolve(undefined)` is a valid semantic for "all ok, you can go on, but no return value present" and control flow is preserved. (I.e. async *void functions*)
   * A `Maybe.of(Promise.resolve(undefined))` resolves as "oops, no result, `orElse()` flow is chosen". This can cause an unintended control flow. But you can handle this by
     * not resolving a promise with a falsy value when it's in your hands,
     * or by transforming the promise to a truthly promise, e.g. `promiseOfUndefined().then(() => true)`.
 * And yes, one extra object is created when using `Maybe.of()`,  `map()` and `orElse()`.


### What actually might be wrong with `Maybe`

This implementation grew as an experiment but theoretical use cases appear to be really useful in a real world application. However, some characteristics might come out to be bad in other scenarios.

Things that are questionable:
 * Is the check for a falsy/truthly value good enough to determine if the value is *fulfilled*?
 * Is the automatic flatMap() behavior what we want? `Maybe.of(Maybe.of(21))` resolves to 21 and so does `Maybe.of(21).map(maybe)`. This certainly breaks the monad laws. I'll go to jail, I guess. But in defence, the holy `Promise` acts exactly like that: `Promise.resolve(Promise.resolve(21))` resolves to `21`, not to `Promise.resolve(21)`.

### Function documentation

[Maybe.of()](#maybeofvalue)  
[Maybe.all()](#maybeallvalue-value-)  
[Maybe.prototype.map()](#maybeprototypemaphandler)  
[Maybe.prototype.orElse()](#maybeprototypeorelsehandler)  
[Maybe.prototype.asPromise()](#maybeprototypeaspromise)  

#### Definitions
A Maybe object represents a value, where the value is defined by a concrete object or a resolving Promise.  
The concrete value may only be known in the future.  
The value may be [truthly](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) or [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy).  
A Maybe is *truthly* if the representing value is *truthly*.  
A Maybe is *falsy* if the representing value is *falsy*.  


#### `Maybe.of(value)`
Returns a Maybe that represents the given value or returns the value itself if it is already a Maybe object.  
If no argument is given, a *falsy* Maybe is returned.

The value can be an object, a Promise or a Maybe.

###### Examples:
```javascript
Maybe.of(1);                              // truthly Maybe
Maybe.of(0);                              // falsy Maybe
Maybe.of(undefined);                      // falsy Maybe
Maybe.of(Promise.resolve('a message'));   // truthly Maybe
Maybe.of(Promise.resolve());              // falsy Maybe
Maybe.of(Maybe.of(1));                    // truthly Maybe
```

#### `Maybe.all(value, value, ...)`
Returns a Maybe that represents one or many given values.  
The Maybe is *truthly* only if all input values resolve as *truthly*.  
When passing the resolved values to a handler function with `.map()`, the values are passed as an array.  
If no argument is given, a *falsy* Maybe is returned.

Arguments can be one or many objects, promises or Maybe objects.  

#### `Maybe.prototype.map(handler)`
Binds the resolving value of current Maybe to a handler function.

If the current Maybe is *truthly*,  
* the handler function is called and the representing value is passed as argument.
* `.map()` returns a new Maybe that represents the value returned by the handler function.

If the current Maybe is *falsy*,
* the handler function will not be called.
* `.map()` returns a falsy Maybe.

The handler function is called asynchronously, if the value of the current Maybe depends on a Promise that is pending at the time of execution of `.map()`. This also means that it can be uncertain if the returned Maybe is *truthly* or *falsy*.

#### `Maybe.prototype.orElse(handler)`
Defines a handler function that is executed if the current Maybe is *falsy*.

If the current Maybe is *truthly*,  
* the handler function will not be called.
* `.orElse()` returns a new Maybe that represents the same value as the current Maybe.

If the current Maybe is *falsy*,
* the handler function is called.
 * If the representing value is a rejecting Promise, the rejection reason is passed as argument (if any).
* `.orElse()` returns a new Maybe that represents the value returned by the handler function.

The handler function is called asynchronously, if the value of current Maybe depends on a Promise that is pending at the time of execution of `.orElse()`.

#### `Maybe.prototype.asPromise()`
Returns the value of current Maybe as a Promise.

If the current Maybe is *truthly*, the returned Promise is resolved with the representing value.  
If the current Maybe is *falsy*, the returned Promise rejects. In case the representing value is a rejecting Promise, the rejection reason applied as reason for the returned Promise (if any).
