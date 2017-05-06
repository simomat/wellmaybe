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
maybeOf(fun())
  .map(v => log('got ' + v))            // -> log('got 2') is called
  .orElse(() => log('no value'));       // this handler is not called
```
```javascript
// provide a default value and chain handlers
let getItemList = () => undefined;
maybeOf(getItemList())
  .orElse(() => [])                    // provide [] if inner value is falsy
  .map(items => handleItems(items))    // pass items to handler ([] in that case)
  .map(printResult);                   // pass previous result (of handleItems(items)) to next handler
```
```javascript
// work with Promises
let myPromise = new Promise((resolve, reject) => 
                      setTimeout(() => resolve(42), 1000));
maybeOf(myPromise)              // maybeOf that symbolizes the value of a promise
  .map(v => addFive(v))         // call addFive(42) asynchronously
  .map(r => log(r))             // calls log(r) whenever addFive() is done
```
```javascript
// handle rejecting Promises 
maybeOf(Promise.reject('whoopsi'))  // a maybe of a rejection promise
  .map(() => doSomething())         // is not called because the promise is rejecting
  .orElse(log);                     // -> log('whoopsi') is called
```
```javascript
// extract nested values - automatic 'flatMap' behavior
let getItems = count => maybeOf(something(count));
maybeOf(getCount())
  .map(count => getItems(count))        // creates maybeOf(maybeOf(...))
  .orElse(() => getDefaultItems())      // provide alternative result if something(count) returns falsy
  .map(items => handleItems(items));    // handleItems gets result of something(count) or getDefaultItems()
```
```javascript
// extract nested promises, too
// this also applies for nested mixed Promise/maybeOf
maybeOf(true)
  .map(() => Promise.resolve(maybeOf(1)))  //
  .map(log);                               // -> log(1) is called
```
```javascript
// leave the monad space - extract concrete value as a Promise (rarely needed)
let maybe = getSomeMaybe();           // you might not know if inner value is present yet
let promise = maybe.asPromise();      // .then() and .catch() act like .map() and .orElse() of the maybe 
```

### Reasons why you might not want to use that 
 * The control flow is obfuscated when mixing `maybeOf(Promise)` and `maybeOf(distinctValue)` and debugging becomes *different*.
 * You cannot get the inner value of a maybe like `maybe.getValue()`, because it might not be resolved at this time. However `maybe.asPromise()` returns the value as Promise. (Other APIs might insist on promises.)
 * There is a little semantics clash between `Promise` and `maybeOf`: 
   * `Promise.resolve(undefined)` is a valid semantic for "all ok, you can go on, but no return value present" and control flow is preserved. (I.e. async *void functions*)
   * A `maybeOf(Promise.resolve(undefined))` resolves as "oops, no result, `orElse()` flow is chosen". This can cause an unintended control flow. But you can handle this by 
     * not resolving a promise with a falsy value when it's in your hands,
     * or by transforming the promise to a truthly promise, e.g. `promiseOfUndefined().then(() => true)`.
 * And yes, one extra object is created when using `maybeOf()`,  `map()` and `orElse()`.


### What actually might be wrong with `maybeOf` 

This implementation grew as an experiment but theoretical use cases appear to be really useful in a real world application. However, some characteristics might come out to be bad in other scenarios.

Things that are questionable:
 * Is the check for a falsy/truthly value good enough to determine if the value is *fulfilled*?
 * Is the automatic flatMap() behavior what we want? `maybeOf(maybeOf(21))` resolves to 21 and so does `maybeOf(21).map(maybeOf)`. This certainly breaks the monad laws. I'll go to jail, I guess. But in defence, the holy `Promise` acts exactly like that: `Promise.resolve(Promise.resolve(21))` resolves to `21`, not to `Promise.resolve(21)`.
