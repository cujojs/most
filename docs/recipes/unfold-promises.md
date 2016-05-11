# Unfold Promises

In this example we use [most.unfold](../api.md#mostunfold) to help deal with promises.

We build up a stream of urls by providing `most.unfold` creator with a seed
or an array of urls.

The unfolding will continue building up the stream each time removing one value
off the array, invoking the unfold function with the remaining values of the array.

Once the array is empty `tuple.done` becomes true and the unfolding will stop.

The interesting part is that we [fetch](https://fetch.spec.whatwg.org) one url
at a time, process it before returning a `tuple` with a new seed.

If we were to run the code below we would observe the 1st url gets processed
instantly while the 2nd waits for about 3 seconds before continuing to resolve
the last.

```es6
import { unfold } from 'most'

const fetch = url => {
	// ... fetch url content and return a promise
	return Promise.resolve('...')
}

const urls = ['http://reqres.in/api/users?page=2',
            'http://reqres.in/api/users?delay=3',
            'http://reqres.in/api/users?page=3']

unfold(urls =>
    urls.length === 0
    ? { done: true }
    : fetch(urls[0]).then(content => {
        return { value: content, seed: urls.slice(1) }
			}, urls))
.observe(x => console.log(x));
```
