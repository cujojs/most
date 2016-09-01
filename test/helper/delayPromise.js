module.exports = delayPromise

function delayPromise (ms, x) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(x)
    }, ms)
  })
}
