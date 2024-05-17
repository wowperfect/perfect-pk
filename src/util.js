import { differenceInMilliseconds } from "date-fns"

export let sleep = ms => new Promise((resolve) => setTimeout(resolve, ms))

export let range = (start, end) => Array.from(range2(start, end))
export function* range2(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

export function totalTime(members, switches) {
  const times = {}
  for (let { id } of members) {
    times[id] = 0
  }
  // currently looks at the last 100 (99?) switches as a hardcoded values
  for (let i = 0; i < Math.min(100, switches.length); i++) {
    const millis = differenceInMilliseconds(
      new Date(switches[i].timestamp),
      (!!switches[i - 1])
        ? new Date(switches[i - 1].timestamp)
        : Date.parse(new Date().toISOString()))
    for (let id of switches[i].members) {
      times[id] += Math.abs(millis)
    }
  }
  return times
}

export function recentFronters(switches) {
  const recents = []

  for (let sw of switches) {
    for (let m of sw.members) {
      if (!recents.includes(m))
        recents.push(m)
    }
  }

  return recents
}
