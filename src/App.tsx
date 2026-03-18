import { Route, Routes } from "react-router"
import Home from "./pages/Home"

function App() {

  return (
    <>
      <div>
      <Routes>
        <Route path= "/" element={<Home/>}/>
      </Routes>
      </div>
    </>
  )
}

export default App
