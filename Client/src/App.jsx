import {Routes , Route} from 'react-router-dom'
import RoomJoin from './components/RoomJoin.jsx'
import Whiteboard from './components/Whiteboard.jsx'

function App() {

  return (
    <Routes>
      <Route path="/" element={<RoomJoin />} />
      <Route path="/room/:roomId" element={<Whiteboard />} />
    </Routes>
  )
}

export default App
