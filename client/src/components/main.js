import {useContext, useEffect} from 'react'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import Navbar from '@/components/navbar'
import SidePanel from '@/components/side-panel'

export default function Main({children}) {
    const [menuRef, showMenu, setShowMenu] = useContext(NavigationBarContext)

    useEffect(() => {
        const handleClick = e => {
            if (showMenu.current && menuRef.current && !menuRef.current.parentNode.contains(e.target)) setShowMenu(false)
            else if (e.target.tagName === 'A' && menuRef.current?.contains(e.target)) setShowMenu(false)
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