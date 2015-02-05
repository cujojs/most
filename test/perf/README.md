Updated: 2-4-2015

Latest performance tests of basic most.js operations.

```
> uname -a
Darwin bcavalier-2.home 14.0.0 Darwin Kernel Version 14.0.0: Fri Sep 19 00:26:44 PDT 2014; root:xnu-2782.1.97~2/RELEASE_X86_64 x86_64

> node --version
v0.11.15

> npm ls
most-perf@0.10.0 /Users/brian/Projects/cujojs/most/test/perf
├── baconjs@0.7.43
├─┬ benchmark@2.0.0-pre (git+https://github.com/bestiejs/benchmark.js#042f1b21a7420f50aa554af4d62375ca9cab9bc1)
│ ├── lodash-compat@3.1.0
│ └── platform@1.3.0
├── highland@2.3.0
├── kefir@1.0.0
├── lodash@3.0.0
└── rx@2.3.24
```

```
filter -> map -> reduce 1000000 integers
-------------------------------------------------------
most        116.06 op/s ± 17.23%   (33 samples)
rx            0.69 op/s ±  1.19%    (6 samples)
kefir        11.44 op/s ±  1.23%   (30 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      5.69 op/s ±  0.82%   (18 samples)
lodash       22.08 op/s ±  2.39%   (40 samples)
Array         7.68 op/s ±  2.44%   (23 samples)
-------------------------------------------------------
```

```
flatMap 1000 x 1000 streams
-------------------------------------------------------
most         55.58 op/s ±  1.92%   (72 samples)
rx            0.38 op/s ±  3.79%    (5 samples)
kefir        10.12 op/s ±  1.24%   (27 samples)
bacon         0.81 op/s ±  8.14%    (6 samples)
highland      0.08 op/s ±  7.31%    (5 samples)
lodash       27.08 op/s ±  3.75%   (37 samples)
Array         0.40 op/s ±  1.04%    (5 samples)
-------------------------------------------------------
```

```
concatMap 1000 x 1000 streams
-------------------------------------------------------
most         54.23 op/s ±  1.63%   (79 samples)
rx            0.70 op/s ±  1.43%    (6 samples)
kefir        10.82 op/s ±  1.75%   (29 samples)
bacon         0.81 op/s ±  5.17%    (6 samples)
lodash       28.88 op/s ±  3.76%   (48 samples)
Array         0.39 op/s ±  2.64%    (5 samples)
-------------------------------------------------------
```

```
zip 2 x 100000 integers
-------------------------------------------------------
most         75.37 op/s ±  1.68%   (67 samples)
rx            1.73 op/s ±  1.00%    (9 samples)
kefir        34.25 op/s ±  2.47%   (41 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      0.27 op/s ±  1.07%    (5 samples)
lodash       27.97 op/s ±  5.95%   (48 samples)
-------------------------------------------------------
```

```
scan -> reduce 1000000 integers
-------------------------------------------------------
most         71.08 op/s ± 19.10%   (28 samples)
rx            0.62 op/s ±  1.39%    (6 samples)
kefir        18.11 op/s ±  0.91%   (42 samples)
bacon     FAILED: RangeError: Maximum call stack size exceeded
highland      4.90 op/s ±  3.63%   (16 samples)
lodash        6.51 op/s ± 12.12%   (20 samples)
Array         6.08 op/s ±  4.46%   (19 samples)
-------------------------------------------------------
```