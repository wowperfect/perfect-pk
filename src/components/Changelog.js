import './Changelog.css'

export default function Changelog() {
  return <div className="changelog">
    {/*
      <h4></h4>
      <ul>
        <li></li>
      </ul>
    */}
    <h2>Changelog</h2>
    <h4>may 27, 2023</h4>
    <ul>
      <li>fixed issue where settings popup could not scroll</li>
      <li>fixed issue created by prev fix where settings popup couldn't be closed</li>
    </ul>
    <h4>nov 27, 2022</h4>
    <ul>
      <li>
        better error handling, now when an error occurs the app will catch it, clear stored data,
        send the error to me, and refetch data. previously it just whitescreened/softlocked
        which was a bad user experience
      </li>
    </ul>
    <h4>nov 16, 2022</h4>
    <ul>
      <li>some bug fixes that were making the screen just completely error out and softlock for some users</li>
    </ul>

    <h4>nov 15, 2022 (major update)</h4>
    <ul>
      <li>groups are now re-orderable in the settings</li>
      <li>offline support!</li>
      <ul>
        <li>made the app a progressive web app, all assets are now cached by default. this enables offline use</li>
        <li>switch creations, deletes, and edits are now cached by default until they can be sent to the server</li>
        <li>TODO: add a way to view cached requests and potentially delete individual requests</li>
      </ul>
      <li>added changelog</li>
    </ul>

    <h4>nov 9, 2022</h4>
    <ul>
      <li>remove scrollbars</li>
    </ul>

    <h4>nov 7, 2022</h4>
    <ul>
      <li>no bugs have been reported for groups editor, removed [BETA] tag</li>
    </ul>

    <h4>oct 30, 2022</h4>
    <ul>
      <li>groups editor</li>
    </ul>

    <h4>oct 15, 2022</h4>
    <ul>
      <li>added dark theme</li>
    </ul>

    <h4>june 10, 2022</h4>
    <ul>
      <li>exclude groups filtering</li>
    </ul>

    <h4>may 30, 2022</h4>
    <ul>
      <li>fix extremely annoying timeline alignment bug, major pog</li>
      <li>ui tweaks</li>
    </ul>

    <h4>before</h4>
    <ul>
      <li>development too fast to segment into individual features</li>
    </ul>
  </div>
}