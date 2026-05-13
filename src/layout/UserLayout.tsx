import { Outlet } from "react-router"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"

const UserLayout = () => {
  return (
    <>
    <Navbar/>
    <div> 
        <Outlet/>
    </div>
    <Footer/>
    </>
  )
}

export default UserLayout
