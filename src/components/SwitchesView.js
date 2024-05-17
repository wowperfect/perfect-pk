import axios from "axios";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import React, { Fragment, useContext, useState } from "react";
import { useInterval } from "usehooks-ts";
import SystemDataContext from "../contexts/SystemDataContext";
import Avatar from "./Avatar";

import './SwitchesView.css'

export default function SwitchesView() {
  const { switchDelete } = useContext(SystemDataContext)
  const { switches, getMemberById } = useContext(SystemDataContext)
  const [rerenders, rerender] = useState(0)

  // TODO: ????????????????
  useInterval(() => {
    rerender(rerenders+1)
  }, 5000)

  function deleteSwitch(id) {
    switchDelete({ id })
  }

  if (!switches.length) return 'no switches logged'

  return <>
    <div className="switches-view">
      <div
        style={{
          textAlign: 'left',
          marginLeft: '1em',
          marginTop: '1em',
          textDecoration: 'underline',
          marginBottom: '.5em',
        }}
      >{format(new Date(switches[0].timestamp), 'MMM d')}</div>
      {switches.map((sw, i) => <Fragment key={i}>
        {i > 0 && Math.abs(differenceInCalendarDays(parseISO(sw.timestamp), parseISO(switches[i - 1]?.timestamp))) > 0 &&
          <div key={i+'date'}
            style={{
              textAlign:'left',
              marginLeft:'1em',
              marginTop: '1em',
              textDecoration: 'underline',
              marginBottom: '.5em',
            }}
          >{format(new Date(sw.timestamp), 'MMM d')}</div>}
        <div className="switch" key={i}>
          <div className="avatars" style={{ width: `calc(2em + ${sw.members.length} * .8em)`}}>
            {sw.members.map((m, i) =>
              <div key={i} style={{
                display: 'inline-block',
                transform: `translateX(calc(${i} * .8em))`,
                position: 'absolute',
                left: 0,
                zIndex: 100 - i,
              }}>
                <Avatar
                  member={getMemberById(m)}
                  small
                />
              </div>
            )}
          </div>

          <div className="names">
            {sw.members.map((id, j) =>
              <Fragment key={j}>{getMemberById(id).name} &nbsp;</Fragment>
            )}
          </div>

          <div className="time">
            {format(new Date(sw.timestamp), 'p').toLowerCase()}
          </div>
          <div className="delete">
            <button
              onClick={() => deleteSwitch(sw.id)}
            >❌</button>
          </div>
        </div>
      </Fragment>)}
    </div>
  </>
}