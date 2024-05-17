import React from "react";


export default function Avatar ({member, small, showName = true}) {

  return <div>
    {/* <img className={'avatar' + (small ? ' small ' : '')} src='/pk/shape512.png'></img>
    {!small && showName && <div className='name'>{member.name}</div>} */}
    <img onMouseDown={e => e.preventDefault()} className={'avatar' + (small?' small ':'')} src={member.avatar_url}></img>
    {!small && showName && <div className='name'>{member.name}</div>}
  </div>

}