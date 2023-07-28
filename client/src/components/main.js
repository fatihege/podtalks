import {useContext, useEffect} from 'react'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import Navbar from '@/components/navbar'
import SidePanel from '@/components/side-panel'

export default function Main({children}) {
    const [menuRef, showMenu, setShowMenu] = useContext(NavigationBarContext) // Get account menu references from the navigation bar context

    useEffect(() => {
        const handleClick = e => {
            if (showMenu.current && menuRef.current && !menuRef.current.parentNode.contains(e.target)) setShowMenu(false) // If the account menu is shown and the parent node of the account menu is not contains the event target, close the account menu
        }

        window.addEventListener('click', handleClick)

        return () => {
            window.removeEventListener('click', handleClick)
        }
    }, [])

    return (
        <div className="mainContainer">
            <Navbar/>
            <div className="mainContent">
                <SidePanel/>
                <div className="pageContent">
                    {children}
                </div>
            </div>
        </div>
    )
}