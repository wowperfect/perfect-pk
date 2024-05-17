import produce from "immer"

export default function useArrayMethods(setState) {

  function push(...args) {
    setState(produce(draft => {
      draft.push(...args)
    }))
  }

  function remove(x) {
    setState(draft =>
      draft.filter(y => x !== y)
    )
  }

  function removeById(id, field='id') {
    setState(draft =>
      draft.filter(x => x[field] !== id)
    )
  }

  function unshift(...args) {
    setState(produce(draft => {
      draft.unshift(...args)
    }))
  }

  return {
    push,
    remove,
    removeById,
    unshift,
  }
}