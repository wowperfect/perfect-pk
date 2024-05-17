import React, { useEffect, useRef, useState } from 'react'
import './App.css';
import axios from 'axios';
import Switcher from './components/Switcher'
import SystemDataContext, { useSystemDataManager } from './contexts/SystemDataContext';

import TokenInput from './components/TokenInput';
import TabSelect from './components/TabSelect';

import Intro from './components/Intro';
import { SettingsContext, useSettingsManager } from './contexts/SettingsContext';
import { ApiContext, useApiManager } from './contexts/ApiContext';
import { TokenContext, useTokenManager } from './contexts/TokenContext';
import Changelog from './components/Changelog';
import ErrorBoundary from './ErrorHandler';

function App() {
  const tokenData = useTokenManager()
  const settings = useSettingsManager()
  const api = useApiManager({ token: tokenData.token })
  const systemData = useSystemDataManager({
    getApi: api.getApi,
    token: tokenData.token,
    settings
  })

  const {token} = tokenData
  const {system, members} = systemData

  useEffect(() => {
    if (!token) return
    api.refreshAxios()
    systemData.refreshSystem()
    systemData.refreshMembers()
    systemData.refreshSwitches()
    systemData.refreshGroups()
    systemData.executeCachedRequests()
  }, [token])

  /**
   * actual application
   */

  const [shouldError, setShouldError] = useState(false)
  if (shouldError) throw new Error('fuck')

  return (
    <div className={settings.darkMode ? 'dark-theme' : 'light-theme'}>
      <div className="App">
        <TokenContext.Provider value={tokenData}>
        <ApiContext.Provider value={api}>
        <SystemDataContext.Provider value={systemData}>
        <SettingsContext.Provider value={settings}>
          {token === 'null' || !token
            ? <Intro/>
            : !system.id || !members?.length
            ? <>
              <div style={{ height: '10em' }}></div>
              loading...
              <br/>
              (if this takes a while then either refresh the page or pk api is down)
              <div style={{ height: '10em' }}></div>
              <TokenInput />
              <div style={{ height: '8em' }}></div>
                <span>it's really stuck and won't load fixed...</span>
                &nbsp;
              <button onClick={() => {
                localStorage.clear()
                window.location.reload()
                }}>
                clear perfect pk localStorage
              </button>
              <div style={{ height: '10em' }}></div>
            </>
            : <>
              {settings.debug
                && <button onClick={() => setShouldError(true)}>throw error</button>}

              <Switcher />

              <hr/>

              <TabSelect />

              <hr/>

              <div style={{height: '2em'}}></div>
              <p>made by meadow! <a href='https://cohost.org/wowperfect'>follow me on cohost @wowperfect</a></p>
              <p>I am open to collaborators for this project 🥰 email me: june@wowperfect.net</p>
              <Changelog/>
              <div style={{height: '2em'}}></div>
            </>
          }
        </SettingsContext.Provider>
        </SystemDataContext.Provider>
        </ApiContext.Provider>
        </TokenContext.Provider>
      </div>
    </div>
  );
}

export default App;
