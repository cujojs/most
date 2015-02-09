Updated: 2-9-2015

Latest performance tests of basic most.js operations.

```
> uname -a
Darwin bcavalier-2.home 14.0.0 Darwin Kernel Version 14.0.0: Fri Sep 19 00:26:44 PDT 2014; root:xnu-2782.1.97~2/RELEASE_X86_64 x86_64

> node --version
v0.12.0

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── baconjs@0.7.43
├─┬ benchmark@2.0.0-pre (git+https://github.com/bestiejs/benchmark.js#042f1b21a7420f50aa554af4d62375ca9cab9bc1)
│ ├── lodash-compat@3.1.0
│ └── platform@1.3.0
├── highland@2.3.0
├── kefir@1.0.0
├── lodash@3.1.0
└── rx@2.3.25
```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        115.80 op/s ± 17.13%   (35 samples)
rx            1.01 op/s ±  1.59%    (7 samples)
kefir        11.24 op/s ±  1.13%   (29 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      5.59 op/s ±  1.46%   (18 samples)
lodash       20.55 op/s ±  3.08%   (37 samples)
Array         7.57 op/s ±  2.90%   (23 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most         55.59 op/s ±  1.49%   (81 samples)
rx        FAILED: TypeError: undefined is not a function
kefir         9.85 op/s ±  1.51%   (27 samples)
bacon         0.91 op/s ±  0.99%    (7 samples)
highland      0.09 op/s ±  4.91%    (5 samples)
lodash       26.74 op/s ±  3.84%   (37 samples)
Array         0.38 op/s ±  2.38%    (5 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most         54.37 op/s ±  1.13%   (80 samples)
rx        FAILED: TypeError: undefined is not a function
kefir        10.57 op/s ±  1.35%   (28 samples)
bacon         0.90 op/s ±  2.02%    (7 samples)
lodash       26.04 op/s ±  6.09%   (47 samples)
Array         0.37 op/s ±  2.18%    (5 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most         74.21 op/s ±  2.10%   (67 samples)
rx            2.09 op/s ±  1.17%   (10 samples)
kefir        33.45 op/s ±  1.21%   (40 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.27 op/s ±  2.75%    (5 samples)
lodash       27.99 op/s ±  3.67%   (38 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most         70.08 op/s ± 19.71%   (27 samples)
rx            0.96 op/s ±  1.54%    (7 samples)
kefir        16.49 op/s ±  2.48%   (39 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      4.79 op/s ±  2.95%   (16 samples)
lodash       14.65 op/s ±  4.41%   (39 samples)
Array         5.71 op/s ±  4.65%   (18 samples)
-------------------------------------------------------
```