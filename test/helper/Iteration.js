module.exports = Iteration

function Iteration (done, value) {
  this.done = done
  this.value = value
}

Iteration.DONE = new Iteration(true, void 0)
