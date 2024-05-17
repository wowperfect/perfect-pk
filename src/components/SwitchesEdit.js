import React, { useCallback, useContext, useEffect, useState } from "react";
import SystemDataContext from "../contexts/SystemDataContext";
import { ApiContext } from '../contexts/ApiContext'
import Draggable from "react-draggable";
import './SwitchesEdit.css'
import Avatar from "./Avatar";
import { add, closestTo, differenceInMinutes, format, formatISO, getHours, getMinutes, isBefore, parseISO, setMinutes, sub } from "date-fns";
import { useCounter, useMap } from "usehooks-ts";

export default function SwitchesEdit() {
  const {switches, switchEdit} = useContext(SystemDataContext)
  const [edits, editsActions] = useMap([])
  const {count: numDays, ...daysCounter} = useCounter(1)

  const now = new Date()
  let relativeTo = closestTo(now, [
    setMinutes(now, 0),
    setMinutes(now, 15),
    setMinutes(now, 30),
    setMinutes(now, 45),
  ])
  if (isBefore(relativeTo, now)) {
    relativeTo = add(relativeTo, {minutes: 15})
  }

  const slotTimes = [relativeTo]
  for (let i = 1; i < 4 * 24 * numDays; i++) {
    slotTimes.push(sub(relativeTo, { minutes: 15 * i }))
  }

  const clickInterval = 2

  const showNextDay = () => daysCounter.increment()

  const handleEdit = id => nextTime => editsActions.set(id, nextTime)
  const cancelAllEdits = () => editsActions.reset()
  const cancelEdit = id => () => editsActions.remove(id)

  // TODO: for some reason, only one of these is saved at a time
  async function saveEdits() {
    for (let [id, time] of edits.entries()) {
      console.log(id, getMinutes(time));
      switchEdit({
        id, timestamp: formatISO(time)
      })
    }
    editsActions.reset()
  }

  return <>
    <div className="controls">
      <button onClick={saveEdits}>save changes</button>
      <button onClick={cancelAllEdits}>cancel changes</button>
    </div>

    <div className="calendar-wrapper">

      <div className="calendar" style={{'--calendar-scale': '30px'}}>

        <div className="switches">
          <Draggable axis='y' handle="" grid={[0,0]}
            position={{ x: 0, y: clickInterval * differenceInMinutes(relativeTo, now) }}
          >
            <div className="switch-group">
              <div className="now"></div>
            </div>
          </Draggable>

          {switches
            .filter(sw => isBefore(slotTimes[slotTimes.length - 1], parseISO(sw.timestamp)))
            .map((sw, i) => <DraggableSwitch key={i}
              swTime={edits.get(sw.id) || parseISO(sw.timestamp)}
              members={sw.members}
              relativeTo={relativeTo}
              clickInterval={clickInterval}
              onEdit={handleEdit(sw.id)}
              onUndo={!!edits.get(sw.id) && cancelEdit(sw.id)}
            />)
          }

        </div>
        <div className="slots">
          {slotTimes.map((time, i) =>
            <div className="slot" key={i}>
              <div className="bar"></div>
              <div className="time">
                {format(time, 'p').toLowerCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="">
        <button onClick={showNextDay}>
          show previous day...
        </button>
      </div>
    </div>
  </>
}

function DraggableSwitch({ swTime, members, relativeTo, onEdit, onUndo, clickInterval }) {
  const { getMemberById } = useContext(SystemDataContext)

  const minutesAgo = differenceInMinutes(relativeTo, swTime)
  const [yPos, setYPos] = useState(clickInterval * minutesAgo)
  const [swTimeEdit, setSwTimeEdit] = useState(0)

  useEffect(() => {
    setYPos(clickInterval * differenceInMinutes(relativeTo, swTime))
  }, [relativeTo, swTime])

  function handleDrag(_, pos) {
    // console.log(pos);
    setYPos(pos.y)
    // const minutesAgo = differenceInMinutes(relativeTo, swTime)
    setSwTimeEdit(swTimeEdit - (pos.deltaY / clickInterval))
  }

  function handleStop() {
    onEdit(add(swTime, { minutes: swTimeEdit }))
    setSwTimeEdit(0)
  }

  return <Draggable
    axis='y'
    grid={[1, clickInterval]}
    bounds=".calendar"
    position={{x: 0, y: yPos}}
    onDrag={handleDrag}
    onStop={handleStop}
    cancel=".undo"
  >
    <div
      className={"switch-group" + (!!onUndo ? ' edited ' : '')}
      // style={{ zIndex: 10 + getHours(swTime) * 100 + getMinutes(swTime)}}
    >
      <div className="switch"></div>
      <div className="handle"></div>
      <div className="avatars">
        {members.map((m, i) =>
          <div key={i} style={{
            transform: `translateX(-${i * 1.2}em)`,
            zIndex: 100-i,
          }}>
            <Avatar
              member={getMemberById(m)}
              small
            />
          </div>
        )}
      </div>
      <div className="time">
        {format(
          add(swTime, { minutes: swTimeEdit }), 'p'
        ).toLowerCase()}
        {!!onUndo && <div className="undo" onClick={onUndo} style={{fontSize: '2em', transform: 'translate(-.1em, -.7em)'}}>
          ↩️
        </div>}
      </div>
    </div>
  </Draggable>

}
