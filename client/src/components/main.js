import {useContext, useEffect, useState} from 'react'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import Navbar from '@/components/navbar'
import SidePanel from '@/components/side-panel'

export default function Main({children}) {
    const [menuRef, showMenu, setShowMenu] = useContext(NavigationBarContext)
    const [width, setWidth] = useState(null)

    useEffect(() => {
        const handleClick = e => {
            if (showMenu.current && menuRef.current && !menuRef.current.parentNode.contains(e.target)) setShowMenu(false)
            else if (e.target.tagName === 'A' && menuRef.current?.contains(e.target)) setShowMenu(false)
        }

        window.addEventListener('click', handleClick)
        window.addEventListener('resize', () => setWidth(window.innerWidth))
        setWidth(window.innerWidth)

        return () => {
            window.removeEventListener('click', handleClick)
            window.removeEventListener('resize', () => setWidth(window.innerWidth))
        }
    }, [])

    return (
        <div className="mainContainer">
            <Navbar/>
            <div className="mainContent">
                <SidePanel/>
                <div className={`pageContent ${width > 456 && width <= 950 ? 'paddedContent' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    )
}