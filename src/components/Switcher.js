import React, { useContext, useEffect, useState } from 'react'
import './Switcher.css';
import { ApiContext } from '../contexts/ApiContext'
import SystemDataContext from '../contexts/SystemDataContext';
import Avatar from './Avatar';
import SettingsPopup from './SettingsPopup';
import LoadingIndicator from './LoadingIndicator';
import MemberSelector from './MemberSelector'
import { formatISO } from 'date-fns';

export default function Switcher() {
  const [nextSwitch, setNextSwitch] = useState([])
  const [switching, setSwitching] = useState(false)
  const { switchCreate } = useContext(SystemDataContext)
  const { members, switches, groups, ...manager } = useContext(SystemDataContext)

  const addToNextSwitch = id => setNextSwitch(nextSwitch.concat(id))
  const removeFromSwitch = id => setNextSwitch(nextSwitch.filter(other => other !== id))
  const clearSwitch = () => setNextSwitch([])

  function finalizeSwitch () {
    if (switching) return
    try {
      setSwitching(true)
      switchCreate({
        members: nextSwitch,
        timestamp: new Date().toISOString()
      })
      setNextSwitch([])
      manager.refreshSwitches()
      setSwitching(false)
    } catch (err) {
      console.log(err);
    }
  }
  // console.log(switches[0]);
  return <div>
    <div className='next-switch'>
      <div style={{ gridArea: 'loading' }}>
        <LoadingIndicator/>
      </div>

      <div className='member-list' style={{ gridArea: 'current-switch' }}>
        {switches.length > 0
          ? switches[0].members
            .map(manager.getMemberById)
            .map((m, i) => <Avatar member={m} key={i} showName={false}/>)
          : null }
      </div>

      <div style={{ gridArea: 'settings', fontSize: '2em' }}>
        <SettingsPopup/>
      </div>

      <div className='arrow' style={{ gridArea: 'arrow', fontSize: '2em' }}>
        ➡️
      </div>

      <div className='member-list' style={{ gridArea: 'next-switch'}}>
        {switching && <span>switching...</span>}
        {!switching && nextSwitch.map(manager.getMemberById).map((m, i) =>
          <Avatar member={m} key={i} showName={false}/>
        )}
      </div>

      <div className='buttons' style={{ gridArea: 'confirm-reset' }}>
        <button disabled={switching} onClick={() => finalizeSwitch()}>✅</button>
        <button disabled={switching} onClick={() => clearSwitch()}>❌</button>
      </div>
    </div>

    <MemberSelector
      members={members}
      selected={nextSwitch}
      onSelect={addToNextSwitch}
      onDeselect={removeFromSwitch}
      storagePrefix={''}
    />
  </div>
}