import React, { useRef } from 'react';
import { useCounter, useReadLocalStorage } from 'usehooks-ts';
import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import axiosRetry from 'axios-retry';

export let ApiContext = React.createContext({
  getApi: () => {},
  numActiveRequests: 0,
  numCachedRequests: 0,
})

/**
 * idea:
 *  - all requests get cached initially in localstorage
 *  - last time a request was made is also stored in localstorage
 *  - on a timer (kicked off by localstorage edits)
 *    requests are filtered out
 */
export function useApiManager({ token }) {
  const apiRef = useRef(null)
  const { count: numActiveRequests, ...requestCountActions } = useCounter(0)
  const diffs = useReadLocalStorage('request_queue', [])

  function refreshAxios() {
    let ax = axios.create({
      baseURL: 'https://api.pluralkit.me/v2',
      headers: {
        Authorization: token,
      }
    })
    const sideEffect = f => x => { f(); return x }
    const sideEffectErr = f => x => { f(); return Promise.reject(x) }
    ax.interceptors.request.use(
      sideEffect(() => requestCountActions.increment()),
    )
    ax.interceptors.response.use(
      sideEffect(() => requestCountActions.decrement()),
      sideEffectErr(() => requestCountActions.decrement())
    )
    axiosRetry(ax, {
      retryCondition: err => {
        return err?.response?.status === 429
      },
      retryDelay: (tryNum, res) => axiosRetry.exponentialDelay(tryNum)
    })
    ax = rateLimit(ax, { maxRequests: 1, perMilliseconds: 1100 })

    apiRef.current = ax
  }

  function getApi() {
    return apiRef.current
  }

  return {
    getApi,
    numActiveRequests,
    numCachedRequests: diffs?.length || 0,
    refreshAxios,
  }
}

export let API_ROUTES = {
  SWITCH_POST : 'SWITCH_POST',
  SWITCH_DELETE : 'SWITCH_DELETE',
  SWITCH_PATCH : 'SWITCH_PATCH',
}
