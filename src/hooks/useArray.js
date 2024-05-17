import { useState } from "react";

export default function useArray(initialValue = []) {

  const [state, setState] = useState(initialValue)

  function push(...args) {
    setState(state.concat(...args))
  }

  function remove(x) {
    setState(state.filter(y => x !== y))
  }

  function removeIdx(i) {
    const nextArr = state.concat()
    nextArr.splice(i, 1)
    setState(i)
  }

  return [state, {
    setState,
    push,
    remove,
    removeIdx,
  }]
}