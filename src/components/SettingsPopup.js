import React, { useContext, useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { SettingsContext } from "../contexts/SettingsContext";
import SystemDataContext from "../contexts/SystemDataContext";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import './SettingsPopup.css'
import TokenInput from "./TokenInput";
import produce from "immer";

export default function SettingsPopup() {
  const { getGroupById } = useContext(SystemDataContext)
  const {
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
  } = useContext(SettingsContext)

  const [open, setOpen] = useState(false)


  // move from i to j
  const move = (arr, i, j) => {
    arr.splice(j, 0, ...arr.splice(i, 1))
  }
  function handleGroupReorder({source, destination: dest}) {
    console.log(source.index, dest.index);
    setGroupsOrdering(produce(draft => {
      move(draft, source.index, dest.index)
    }))
  }

  return <>
    <div onClick={() => setOpen(true)}>⚙️</div>
    <Popup modal
      // trigger={}
      position='top center'
      lockScroll
      open={open}
      closeOnDocumentClick
      onClose={() => setOpen(false)}
    >
      <h2 style={{margin: '0'}}>settings</h2>
      <a className="close" onClick={() => setOpen(false)}>
        &times;
      </a>
      <div>
        <input type="checkbox"
          id="sort-checkbox"
          checked={showSortMethods}
          onChange={e => setShowSortMethods(!!e.target.checked)}
        />
        <label htmlFor="sort-checkbox" style={{ marginLeft: '1em' }}>show sorting methods</label>
      </div>

      <div>
        <input type="checkbox"
          id="filter-checkbox"
          checked={showFilterMethods}
          onChange={e => setShowFilterMethods(!!e.target.checked)}
        />
        <label htmlFor="filter-checkbox" style={{ marginLeft: '1em' }}>show groups filtering</label>
      </div>

      <div>
        <input type="checkbox"
          id="exclude-checkbox"
          checked={showExcludeMethods}
          onChange={e => setShowExcludeMethods(!!e.target.checked)}
        />
        <label htmlFor="exclude-checkbox" style={{ marginLeft: '1em' }}>exclude groups filtering</label>
      </div>

      <div>
        <input type="checkbox"
          id="dark-mode-checkbox"
          checked={darkMode}
          onChange={e => setDarkMode(!!e.target.checked)}
        />
        <label htmlFor="dark-mode-checkbox" style={{ marginLeft: '1em' }}>use dark mode</label>
      </div>

      <div>
        <input type="checkbox"
          id="debug-mode-checkbox"
          checked={debug}
          onChange={e => setDebug(!!e.target.checked)}
        />
        <label htmlFor="debug-mode-checkbox" style={{ marginLeft: '1em' }}>debug mode (don't turn this on)</label>
      </div>

      <div>
        <span>groups ordering: (drag to reorder)</span>
        <DragDropContext onDragEnd={handleGroupReorder}>
          <Droppable droppableId="droppable-1" type="groups">
            {(provided, snapshot) => (
              <ul
                style={{ marginTop: '0em', paddingLeft: '2em' }}
                ref={provided.innerRef}
                className="reorderable"
                // style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : 'grey' }}
                {...provided.droppableProps}
              >
                {groupsOrdering.map((group, i) =>
                  <Draggable draggableId={"draggable-" + i} index={i} key={i}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {getGroupById(group).name}
                      </li>
                    )}
                  </Draggable>)}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* <div>
        <InstallPWA />
      </div> */}

      <TokenInput/>
    </Popup>
  </>
}

function InstallPWA () {
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(false);
  const [beforeInstallEvent, setBeforeInstallEvent] = useState(null)

  function handlePrompt(e) {
    e.preventDefault()
    setIsSupportedBrowser(true)
    setBeforeInstallEvent(e)
  }

  function onInstallClick() {
    beforeInstallEvent?.prompt()
  }

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  // if (!isSupportedBrowser) return null

  return <>
    <span style={{ marginRight: '1em' }}>add to your homescreen for easy access: (might not work???)</span>
    <button onClick={onInstallClick}>install</button>
  </>
}
