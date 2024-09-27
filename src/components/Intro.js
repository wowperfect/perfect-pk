import React from "react";
import TokenInput from "./TokenInput";
import Tutorial from "./Tutorial";

export default function Intro() {
  return <>
    <div style={{marginTop: '2em'}}/>
    <div style={{margin: '0 auto'}}>
      <img style={{width: '7em'}} src='/pk/myriad_pk512.png'/>
    </div>
    <h1>perfect pk</h1>
    <p>
      a web app for logging <a href="https://pluralkit.me">pluralkit</a> switches
    </p>

    <TokenInput />

    <div style={{marginTop: '5em'}}>
      <h1>⬇️ tutorial and features list ⬇️</h1>
      <hr/>
    </div>

    <Tutorial />
  </>
}