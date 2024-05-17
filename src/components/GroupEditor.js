import { useState, useContext, useEffect } from "react"
import useArray from "../hooks/useArray";
import SystemDataContext from "../contexts/SystemDataContext";
import { ApiContext } from '../contexts/ApiContext'
import MemberSelector from "./MemberSelector";
import useOnlineStatus from "../hooks/useOnlineStatus";

export default function GroupEditor() {

  const online = useOnlineStatus()
  const { getApi } = useContext(ApiContext)
  const { groups, members: unsortedMembers, refreshGroups } = useContext(SystemDataContext)

  const members = unsortedMembers.concat()
    .sort((a, b) => a.name.localeCompare(b.name))

  const [currentGroup, setCurrentGroup] = useState(0)
  const [currentMembers, currentMembersActions] = useArray(groups[0]?.members)

  function saveEdits () {
    getApi().post(`/groups/${groups[currentGroup].id}/members/overwrite`, currentMembers)
    refreshGroups()
  }

  function cancelEdits () {
    currentMembersActions.setState(groups[currentGroup]?.members)
  }

  useEffect(cancelEdits, [currentGroup, groups])

  if (groups.length === 0) return <>no groups, nothing to edit</>

  return <div>

    <div className="filters">
      {groups.map((group, i) =>
        <button key={i}
          className={currentGroup === i ? 'selected' : ''}
          onClick={() => setCurrentGroup(i)}
        >{group.name}</button>
      )}
    </div>

    {online
      ? <div className="controls" style={{ marginBottom: '1em' }}>
          <button onClick={saveEdits}>save changes</button>
          <button onClick={cancelEdits}>cancel changes</button>
        </div>
      : <div style={{ marginBottom: '1em' }}>
          group changes cannot be saved while offline
        </div>
    }

    <MemberSelector
      members={members}
      selected={currentMembers}
      onSelect={currentMembersActions.push}
      onDeselect={currentMembersActions.remove}
      storagePrefix='group_editor'
    />
  </div>
}