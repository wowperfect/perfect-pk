import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useBoolean, useInterval, useLocalStorage, useTimeout } from "usehooks-ts";
import { ApiContext } from '../contexts/ApiContext'
import useOnlineStatus from "../hooks/useOnlineStatus";
import Avatar from "./Avatar";

export default function SocialView() {

  const online = useOnlineStatus()
  const { getApi } = useContext(ApiContext)
  const {value: showEdit, toggle: toggleEdit} = useBoolean(false)
  const [friends, setFriends] = useLocalStorage('friends', [])
  const [fronts, setFronts] = useState({})
  const [shouldFetch, setShouldFetch] = useState(false)

  useTimeout(() => {
    setShouldFetch(true)
  }, 3000)

  useEffect(() => {
    // console.log('friends length refresh');
    if (!shouldFetch) return
    refreshFriends()
  }, [friends.length, shouldFetch])

  useInterval(() => {
    // console.log('interval refresh');
    if (!shouldFetch) return
    if (!online) return
    refreshFriends()
  }, 20_000)

  async function refreshFriends() {
    // console.log('calling refresh')
    const updatedFronts = Object.assign({}, fronts)
    for (const friend of friends) {
      try {
        // console.log('requesting', friend);
        const res = await getApi().get(`/systems/${friend}/fronters`)
        updatedFronts[friend] = res.data
      } catch (err) {
        if (err.response.status === 404){
          console.log('system with id:', friend, 'was not found');
          removeFriend(friends.indexOf(friend))
        }
        console.error(err);
        break
      }
    }
    setFronts(updatedFronts)
  }

  const { register, handleSubmit, watch, formState: { errors }, reset: resetNewFriend } = useForm()

  function onSubmit(data) {
    if (friends.includes(data.f_id)) {
      resetNewFriend()
      return
    }
    setFriends(friends.concat(data.f_id))
    resetNewFriend()
  }

  function removeFriend(i) {
    const nextFriends = friends.concat()
    nextFriends.splice(i, 1)
    setFriends(nextFriends)
  }

  return <>
    {online
      ? friends.map((f_id, i) => fronts[f_id] && <div key={i}>
          {fronts[f_id].members.map((m, j) => <div key={j}>
            <Avatar member={m} showName={false} />
            <span>{m.display_name || m.name}</span>
          </div>)}
          {i !== friends.length - 1 && fronts[f_id].members.length > 0 &&
            <div style={{width: '10em', margin: '1em auto'}}><hr/></div>}
        </div>)
      : friends.length > 0 && 'social tab is unavailable when offline'
    }
    <div style={{height: '1em'}} />
    <form onSubmit={handleSubmit(onSubmit)}>
      {friends.length === 0 && <>
        <label style={{marginRight: '1em'}}>add a friend with their system id:</label>
        <br/>
      </>}
      <input type="text" {...register("f_id")}
        style={{ marginRight: '1em', maxWidth: '7em', fontFamily: 'monospace' }}
        placeholder="system id"
      />

      {friends.length === 0 &&
        <input type="submit" value='add friend' />
      }
      {friends.length > 0 &&
        <input type="submit" value='➕' />
      }
    </form>
    <div style={{height: '1em'}} />
    <div>
      <button onClick={() => toggleEdit()}>edit friends...</button>
    </div>
    {showEdit && <>
      <ul>
        {friends.map((f, i) => <li key={i}>{f}&nbsp;<button onClick={() => removeFriend(i)}>❌</button></li>)}
      </ul>
      <p>
        TIP: if your friends aren't showing up then they may not be using
        front mode (<b>pk;ap front</b>) or may have their front/members set to private
      </p>
    </>}
  </>
}