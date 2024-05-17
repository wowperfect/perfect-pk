import React, { useEffect, useState } from "react";
import GroupEditor from "./GroupEditor";
import SocialView from "./SocialView";
import SwitchesEdit from "./SwitchesEdit";
import SwitchesView from "./SwitchesView";

export default function TabSelect() {
  const [tab, setTab] = useState(parseInt(localStorage.getItem('switches_tab')) || 0)

  useEffect(() => {
    localStorage.setItem('switches_tab', tab)
  }, [tab])

  const TabButton = ({idx, text}) =>
    <button
      className={tab === idx ? 'selected' : ''}
      onClick={() => setTab(idx)}
    >{text}</button>

  return <>
    <div className="controls">
      <TabButton idx={2} text='timeline ✏️'/>
      <TabButton idx={1} text='social 👯'/>
      <TabButton idx={0} text='switch list 📋'/>
      <TabButton idx={3} text='groups'/>
    </div>

    {tab === 0 && <SwitchesView />}
    <div hidden={tab !== 1}>
      <SocialView />
    </div>
    {tab === 2 && <SwitchesEdit />}
    {tab === 3 && <GroupEditor />}
  </>
}