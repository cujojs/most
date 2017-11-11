import Pipe from '../sink/Pipe'
import PropagateTask from '../scheduler/PropagateTask'
import { all } from '../disposable/dispose'

export function count (stream) {
  return new stream.constructor(new Count(stream.source))
}

class Count {
  constructor (source) {
    this.source = source
  }

  run (sink, scheduler) {
    const initial = scheduler.asap(PropagateTask.event(0, sink))
    const disposable = this.source.run(new CountSink(sink), scheduler)

    return all([initial, disposable])
  }
}

class CountSink extends Pipe {
  constructor (sink) {
    super(sink)
    this.count = 0
  }

  event (t, x) {
    ++this.count
    this.sink.event(t, this.count)
  }

  end (t, x) {
    this.sink.end(t, this.count)
  }
}
