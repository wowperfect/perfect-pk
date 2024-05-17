import { getMinutes, isBefore, parseISO } from "date-fns"
import React, { useEffect, useState } from "react"
import { useEffectOnce, useLocalStorage, useUpdateEffect } from "usehooks-ts"
import { API_ROUTES } from "./ApiContext"
import { v4 as uuid } from 'uuid'
import useArrayMethods from '../hooks/useArrayMethods'
import useOnlineStatus from "../hooks/useOnlineStatus"
import produce from 'immer'

export default React.createContext({
  system: {},
  members: [],
  switches: [],
  groups: [],
  refreshSystem: () => {},
  refreshMembers: () => {},
  refreshSwitches: () => {},
  refreshGroups: () => {},
  getMemberById: () => {},
  getGroupById: () => {},

  switchCreate: () => { },
  switchDelete: () => { },
  switchEdit: () => { },
});

export function useSystemDataManager({ getApi, settings }) {
  const online = useOnlineStatus()

  const [system, setSystem] = useLocalStorage('system', {})
  const [members, setMembers] = useLocalStorage('members', [])
  const [groups, setGroups] = useLocalStorage('groups', [])
  const [switches, setSwitches] = useState([])
  const [serverSwitches, setServerSwitches] = useLocalStorage('switches', [])

  // TODO: synchronize effects to request_queue
  const [cachedDiffs, setCachedDiffs] = useLocalStorage('request_queue', [])
  const [diffs, setDiffs] = useState([])
  const diffActions = useArrayMethods(setDiffs)

  async function executeCachedRequests() {
    if (!online) return
    if (!getApi()) return
    diffs.forEach(diff => executeRequest(diff))
  }

  // on first render, load diffs from cache
  useEffectOnce(() => setDiffs(cachedDiffs))
  // after first render, assign diffs into cache
  useUpdateEffect(() => {
    setCachedDiffs(diffs)
  }, [diffs])

  useEffect(() => {
    if (!online) return
    executeCachedRequests()
    if (!getApi()) return
    refreshSwitches()
    refreshMembers()
    refreshGroups()
  }, [online])

  async function refreshSystem() {
    const res = await getApi().get('/systems/@me')
    setSystem(res.data)
  }

  async function refreshMembers() {
    const res = await getApi().get('/systems/@me/members')
    setMembers(res.data)
  }

  async function refreshGroups() {
    const res = await getApi().get('/systems/@me/groups?with_members=true')
    setGroups(res.data)
    let newGroups = []
    for (let {uuid} of res.data) {
      if (!settings.groupsOrdering.includes(uuid)) {
        newGroups.push(uuid)
      }
    }
    settings.setGroupsOrdering(produce(draft => {
      for (let i = 0; i < draft.length;) {
        if (!res.data.find(({ uuid }) => draft[i] === uuid)) {
          draft.splice(i, 1)
        }
        else i++;
      }
      draft.unshift(...newGroups)
    }))
  }

  async function refreshSwitches(before = '') {
    const {data: nextSwitches} = await getApi().get(
      `/systems/@me/switches?${!!before ? 'before=' + before : ''}`,
    )
    if (!before) setServerSwitches(nextSwitches)
    else setServerSwitches(serverSwitches.concat(nextSwitches))
  }

  useEffect(() => {
    setSwitches(produce(serverSwitches, draft => {
      for (let diff of diffs) {
        processSwitchDiff(diff, draft)
      }
    }))
  }, [serverSwitches, diffs])

  function getMemberById(id) {
    return members.find(m => m.id === id || m.uuid === id) || {
      'id': undefined,
      'name': '<deleted>',
      'display_name': 'deleted member',
    }
  }

  function getGroupById(id) {
    return groups.find(g => g.id === id || g.uuid === id) || {
      'id': undefined,
      'name': '<deleted>',
      'display_name': 'deleted group',
      'members': [],
    }
  }

  async function executeRequest(diff) {
    if (!online) return
    if (!getApi()) return
    try {
      const { route, data } = diff
      let serverSwitchesAction;

      if (route === API_ROUTES.SWITCH_POST) {
        const res = await getApi().post('/systems/@me/switches', {
          members: data.members,
          timestamp: data.timestamp,
        })
        serverSwitchesAction = produce(draft => {
          draft.unshift({
            id: res.data.id,
            members: data.members, // the API send back full member objects
            timestamp: res.data.timestamp,
          })
        })
      }

      if (route === API_ROUTES.SWITCH_DELETE) {
        await getApi().delete(`/systems/@me/switches/${data.id}`)
        serverSwitchesAction = draft =>
          draft.filter(sw => sw.id !== data.id)
      }

      if (route === API_ROUTES.SWITCH_PATCH) {
        await getApi().patch(`/systems/@me/switches/${data.id}`, {
          timestamp: data.timestamp
        })
        serverSwitchesAction = produce(draft => {
          for (let i in draft) {
            if (draft[i].id === data.id) {
              draft[i].timestamp = data.timestamp
              break;
            }
          }
        })
      }

      diffActions.removeById(diff.id)
      setServerSwitches(serverSwitchesAction)
    } catch (err) {
      console.log('ERROR', err.response?.data.code, err.response?.data.message, err);
      if ( err.response.data.code === 20008 // switch was already deleted
        || err.response.data.code === 40004 // switch member list identical to current fronter list
        || err.response.data.code === 40005 // switch was already posted
          // 20007: switch id does not exist
          // this corresponds to the rare event when a user edits a switch
          // while it's being sent off to the server and then saves after
          // the switch is saved, happened to me once and the app hard crashed
        || err.response.data.code === 20007
      ) {
        diffActions.removeById(diff.id)
      }
    }
  }

  const findSwitchIdxInDiffs = id =>
    diffs.findIndex(x => x.data.id === id)

  const apiRequest = f => data => {
    const req = f(data)
    if (!req) return
    req.id = uuid()
    diffActions.push(req)
    executeRequest(req)
  }

  const switchCreate = apiRequest(data => ({
    route: API_ROUTES.SWITCH_POST,
    data: { ...data, id: uuid() },
  }))

  const switchDelete = apiRequest(data => {
    const i = findSwitchIdxInDiffs(data.id)
    if (i > -1) {
      diffActions.removeById(diffs[i].id)
      return false
    }
    return { route: API_ROUTES.SWITCH_DELETE, data }
  })

  const switchEdit = apiRequest(data => {
    const i = findSwitchIdxInDiffs(data.id)
    if (i > -1) {
      setDiffs(produce(draft => {
        const i = draft.findIndex(x => x.data.id === data.id)
        const copy = Object.assign({}, draft[i].data)
        draft[i].data = Object.assign(copy, data)
      }))
      return false
    }
    return { route: API_ROUTES.SWITCH_PATCH, data }
  })

  // NOTE: groups need to be removed from groupsOrdering if they are deleted
  const groupsOrdered = settings.groupsOrdering.map(getGroupById)
  return {
    system,
    members,
    switches,
    groups: groupsOrdered,

    refreshSystem,
    refreshMembers,
    refreshSwitches,
    refreshGroups,
    getMemberById,
    getGroupById,

    switchCreate,
    switchDelete,
    switchEdit,

    executeCachedRequests,
  }
}

/**
 * **imperatively** iterate through the array of
 * switches and apply locally cached changes
 */
function processSwitchDiff(diff, switches) {
  if (diff.route === API_ROUTES.SWITCH_POST) {
    const a = parseISO(diff.data.timestamp)
    for (let i in switches) {
      const b = parseISO(switches[i].timestamp)
      if (isBefore(b, a)) {
        switches.splice(i, 0, diff.data)
        break;
      }
    }
  }

  if (diff.route === API_ROUTES.SWITCH_DELETE) {
    for (let i in switches) {
      if (switches[i].id === diff.data.id ) {
        switches.splice(i, 1)
        break;
      }
    }
  }

  if (diff.route === API_ROUTES.SWITCH_PATCH) {
    let targetSwitch;
    for (let i in switches) {
      if (switches[i].id === diff.data.id ) {
        targetSwitch = Object.assign(switches[i], diff.data)
        switches.splice(i, 1)
        break;
      }
    }
    const a = parseISO(targetSwitch.timestamp)
    for (let i in switches) {
      const b = parseISO(switches[i].timestamp)
      if (isBefore(b, a)) {
        switches.splice(i, 0, targetSwitch)
        break;
      }
    }
  }
}