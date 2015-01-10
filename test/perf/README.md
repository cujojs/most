Updated: 1-5-2015

Latest performance tests of basic most.js operations.

```
> uname -a
Darwin bcavalier-2.home 14.0.0 Darwin Kernel Version 14.0.0: Fri Sep 19 00:26:44 PDT 2014; root:xnu-2782.1.97~2/RELEASE_X86_64 x86_64

> node --version
v0.11.14

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── baconjs@0.7.41
├── highland@2.2.0
├── kefir@0.4.2
├── lodash@2.4.1
└── rx@2.3.22
```

```
> node --expose-gc ./filter-map-reduce.js
START filter -> map -> reduce 1000000 integers
---------------------------------------------------------
most      4ms       result: 250000000000
lodash    46ms      result: 250000000000
Array     169ms     result: 250000000000
kefir     97ms      result: 250000000000
bacon     FAILED: RangeError: Maximum call stack size exceeded
rx        2094ms    result: 250000000000
highland  180ms     result: 250000000000
---------------------------------------------------------
DONE
```

```
> node --expose-gc ./flatMap.js
START flatMap 1000 x 1000
---------------------------------------------------------
most      27ms      result: 499999500000
lodash    55ms      result: 499999500000
Array     2486ms    result: 499999500000
kefir     99ms      result: 499999500000
bacon     1249ms    result: 499999500000
rx        4330ms    result: 499999500000
highland  14151ms   result: 499999500000
---------------------------------------------------------
DONE
```

```
> node --expose-gc ./concatMap.js
START concatMap 1000 x 1000
---------------------------------------------------------
most      22ms      result: 499999500000
lodash    56ms      result: 499999500000
Array     2580ms    result: 499999500000
kefir     106ms     result: 499999500000
bacon     1311ms    result: 499999500000
rx        2466ms    result: 499999500000
---------------------------------------------------------
DONE
```

```
> node --expose-gc ./zip.js
START zip 100000 x 2
---------------------------------------------------------
most      27ms      result: 9999900000
lodash    56ms      result: 9999900000
kefir     35ms      result: 9999900000
bacon     FAILED: RangeError: Maximum call stack size exceeded
rx        956ms     result: 9999900000
highland  2759ms    result: 9999900000
---------------------------------------------------------
DONE
```
