import { useState, useContext } from "react";
import { useCountdown, useDebounce, useLocalStorage } from 'usehooks-ts';
import { filter, simpleFilter } from 'fuzzy';
import { recentFronters, totalTime } from '../util';
import { useForm } from 'react-hook-form';

import Avatar from "./Avatar"
import SystemDataContext from "../contexts/SystemDataContext";
import { SettingsContext } from "../contexts/SettingsContext";

export default function MemberSelector ({members, selected, onSelect, onDeselect, storagePrefix}) {

  const [sortMethod, setSortMethod] = useLocalStorage(storagePrefix + '.sortMethod', 'time_fronted')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [excludedGroups, setExcludedGroups] = useLocalStorage(storagePrefix + '.excluded_groups', [])
  const { api, switches, groups, ...manager } = useContext(SystemDataContext)
  const settings = useContext(SettingsContext)

  const { register, watch } = useForm()
  const memberSearch = useDebounce(watch('member_search'), 250)

  // handlers

  function handleSelectGroup(group) {
    if (selectedGroup?.id === group.id)
      setSelectedGroup(null)
    else setSelectedGroup(group)
  }

  function handleToggleExcludeGroup(group) {
    if (excludedGroups.includes(group.id)) {
      const nextExcl = excludedGroups.concat()
      nextExcl.splice(nextExcl.indexOf(group.id), 1)
      setExcludedGroups(nextExcl)
    } else {
      setExcludedGroups(excludedGroups.concat(group.id))
    }
  }

  // sorting

  let membersSorted = members.concat([])
  if (excludedGroups.length > 0) {
    const excludedMembers = groups.reduce((sum, group) => {
      if (excludedGroups.includes(group.id)) {
        for (let uuid of group.members) {
          sum.add(uuid)
        }
      }
      return sum
    }, new Set())
    membersSorted = membersSorted.filter(m =>
      !excludedMembers.has(m.uuid)
    )
  }

  if (selectedGroup)
    membersSorted = membersSorted.filter(m => selectedGroup.members.includes(m.uuid))

  function sortByTimeFronted() {
    const times = totalTime(members, switches)
    membersSorted.sort((a, b) => (times[a.id] < times[b.id]) ? 1 : -1)
  }

  function sortByRecent() {
    membersSorted = recentFronters(switches).map(manager.getMemberById)
    if (selectedGroup)
      membersSorted = membersSorted.filter(m => selectedGroup?.members.includes(m.uuid))
  }

  function sortAlphabetical() {
    membersSorted.sort((a, b) => a.name.localeCompare(b.name))
  }

  function sortAlphabeticalZA() {
    membersSorted.sort((a, b) => a.name.localeCompare(b.name))
    membersSorted.reverse()
  }

  function sortSearch() {
    // membersSorted = filter(memberSearch, membersSorted, {
    //   extract: m => m.name
    // }).map(x => x.original)
    const filtered = filter(memberSearch, membersSorted, {
      extract: m => m.name
    }).map(x => x.original)

    if (!filtered.includes(undefined))
      membersSorted = filtered
  }

  switch (sortMethod) {
    case 'time_fronted': sortByTimeFronted(); break;
    case 'recent_fronts': sortByRecent(); break;
    case 'alphabetical': sortAlphabetical(); break;
    case 'alphabetical_za': sortAlphabeticalZA(); break;
    case 'search': sortSearch(); break;
    default: sortByTimeFronted(); break;
  }

  // groups.sort((a, b) => a.name.localeCompare(b.name))

  const SortSelect = ({ tag, label }) => <button
    onClick={() => setSortMethod(tag)}
    className={sortMethod === tag ? 'selected' : ''}
  >{label}</button>

  return <>
    {settings.showSortMethods && <div className='filters'>
      <SortSelect tag='time_fronted' label="most time" />
      <SortSelect tag='recent_fronts' label="most recent" />
      <SortSelect tag='search' label="search" />
      <SortSelect tag='alphabetical' label="a-z" />
      <SortSelect tag='alphabetical_za' label="z-a" />
    </div>}

    {settings.showFilterMethods && !!groups.length && <div className='filters'>
      {groups.map((group, i) =>
        <button key={i}
          onClick={() => handleSelectGroup(group)}
          className={selectedGroup?.id === group.id ? 'selected' : ''}
        >{group.name}</button>
      )}
    </div>}

    {settings.showExcludeMethods && !!groups.length && <div className='filters exclude'>
      {groups.map((group, i) =>
        <button key={i}
          onClick={() => handleToggleExcludeGroup(group)}
          className={excludedGroups.includes(group.id) ? 'selected' : ''}
        >{group.name}</button>
      )}
    </div>}

    {sortMethod === 'search' && <div className='filters' style={{
      gridArea: 'search',
      justifyContent: 'center'
    }}>
      <input {...register('member_search')} type="text" placeholder='search...'></input>
    </div>}

    <div className='members'>
      {membersSorted.map((m, i) => {
        const isSelected = selected.includes(m.uuid)
        return <div className={'member-card ' + (isSelected ? 'selected ' : '')} key={i}
          onClick={ isSelected
            ? () => onDeselect(m.uuid)
            : () => onSelect(m.uuid)
          }
        >
          { isSelected && <div className='check'>✔️</div>}
          <Avatar member={m} />
        </div>
      })}
    </div>
  </>
}
