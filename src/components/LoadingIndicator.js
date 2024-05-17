import React, { useContext, useEffect, useState } from "react";
import { useCountdown } from "usehooks-ts";
import { ApiContext } from "../contexts/ApiContext";
import './LoadingIndicator.css'
import useOnlineStatus from '../hooks/useOnlineStatus'

export default function LoadingIndicator() {

  const online = useOnlineStatus()
  const { numActiveRequests, numCachedRequests } = useContext(ApiContext)
  const [loadingCountdown, countdownActions] = useCountdown({
    seconds: 3,
    interval: 400,
  })

  useEffect(() => {
    if (numActiveRequests > 0) {
      countdownActions.reset()
      countdownActions.start()
    }
  }, [numActiveRequests])

  useEffect(() => {
    if (loadingCountdown <= 0) {
      countdownActions.stop()
    }
  }, [loadingCountdown])

  if (!online) return <>
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <span className="loader offline"></span>
      {numCachedRequests > 0 &&
        <span className="stored-requests">{numCachedRequests}</span>}
    </div>
  </>

  return <>
    <div hidden={loadingCountdown <= 0} style={{width: '100%', height: '100%', position: 'relative'}}>
      <span className="loader"></span>
      {numCachedRequests > 0 &&
        <span className="stored-requests">{numCachedRequests}</span>}
    </div>
  </>
}
