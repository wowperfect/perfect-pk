import React from "react"
import { useLocalStorage } from "usehooks-ts"

export let SettingsContext = React.createContext({
  showSortMethods: true,
  setShowSortMethods: () => { },

  showFilterMethods: true,
  setShowFilterMethods: () => { },

  showExcludeMethods: false,
  setShowExcludeMethods: () => { },

  darkMode: true,
  setDarkMode: () => { },

  groupsOrdering: [],
  setGroupsOrdering: () => {},
})

export function useSettingsManager() {
  const [showSortMethods, setShowSortMethods] = useLocalStorage('show_shorts', true)
  const [showFilterMethods, setShowFilterMethods] = useLocalStorage('show_filters', true)
  const [showExcludeMethods, setShowExcludeMethods] = useLocalStorage('show_exclude', false)
  const [darkMode, setDarkMode] = useLocalStorage('dark_mode', true)
  const [groupsOrdering, setGroupsOrdering] = useLocalStorage('groups_ordering', [])
  const [debug, setDebug] = useLocalStorage('debug', false)

  return {
    showSortMethods,
    setShowSortMethods,
    showFilterMethods,
    setShowFilterMethods,
    showExcludeMethods,
    setShowExcludeMethods,
    darkMode,
    setDarkMode,
    groupsOrdering,
    setGroupsOrdering,
    debug,
    setDebug,
  }
}