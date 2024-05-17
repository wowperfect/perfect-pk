import './Tutorial.css'
import tutorial1 from '../assets/tutorial01.png'
import tutorial2 from '../assets/tutorial02.png'
import tutorial3 from '../assets/tutorial03.png'
import tutorial4 from '../assets/tutorial04.png'
import tutorial5 from '../assets/tutorial05.png'
import tutorial6 from '../assets/tutorial06.png'
import tutorial7 from '../assets/tutorial07.png'
import tutorial8 from '../assets/tutorial08.png'

export default function Tutorial() {

  return <div className="tutorial">

    <section>
      <h1>click members to select your next front</h1>
      <img src={tutorial1}></img>
      <hr/>
      <h1>sort and filter members</h1>
      <img src={tutorial2}></img>
      <hr/>
      <h1>view a list of switches</h1>
      <img src={tutorial3}></img>
      <hr/>
      <h1>drag and drop switches to edit times</h1>
      <img src={tutorial4}></img>
      <hr/>
      <h1>keep up with friends' current fronts</h1>
      <img src={tutorial5}></img>
      <hr/>
      <h1>tailor the app to your system through the settings</h1>
      <img src={tutorial6}></img>
      <hr/>
      <h1>edit groups</h1>
      <img src={tutorial7}></img>
      <hr/>
      <h1>offline compatible</h1>
      <img src={tutorial8}></img>
      <div className='end-spacer'/>
    </section>

  </div>
}