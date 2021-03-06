import {
  Scheduler,
} from 'rxjs'
import sinon from 'sinon'

import { msElapsed } from '../src/msElapsed'

const { animationFrame, asap, async } = Scheduler

describe('msElapsed', () => {
  const sandbox = sinon.createSandbox()

  beforeEach(() => {
    sandbox.useFakeTimers({
      now: 0,
    })
    sandbox.clock.tick(0)

    sandbox.stub(animationFrame, 'now').callsFake(Date.now)
    sandbox.stub(asap, 'now').callsFake(Date.now)
    sandbox.stub(async, 'now').callsFake(Date.now)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should work without a scheduler', () => {
    let subscription

    expect(() => {
      msElapsed().subscribe(sandbox.spy())
    }).to.not.throw()

    sandbox.clock.tick(10)
    if (subscription) {
      subscription.unsubscribe()
    }
  })

  it('should work with any rxjs scheduler except Scheduler.queue', () => {
    const subscriptions = []

    expect(() => {
      subscriptions.push(msElapsed(asap).subscribe(sandbox.spy()))
    }).to.not.throw()
    expect(() => {
      subscriptions.push(msElapsed(animationFrame).subscribe(sandbox.spy()))
    }).to.not.throw()
    expect(() => {
      subscriptions.push(msElapsed(async).subscribe(sandbox.spy()))
    }).to.not.throw()

    sandbox.clock.tick(10)

    subscriptions.forEach((subscription) => subscription.unsubscribe())
  })

  it('should not work with non-scheduler argument', () => {
    expect(() => {
      msElapsed(sandbox).subscribe(sandbox.spy())
    }).to.throw(/Scheduler/)
  })

  it('should emit values at least 1 time', () => {
    const useTimes = sandbox.spy()

    const subscription =
      msElapsed(async).subscribe(useTimes)

    sandbox.clock.tick(1000)

    subscription.unsubscribe()
    expect(useTimes.callCount).to.be.least(1)
  })

  it('should emit time close to when observer called finally', () => {
    const useTimes = sandbox.spy()

    const subscription =
      msElapsed(async).subscribe(useTimes)

    sandbox.clock.tick(1000)

    subscription.unsubscribe()
    expect(useTimes.lastCall.args[0]).to.be.closeTo(Date.now(), 1)
  })
})
