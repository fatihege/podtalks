import {createContext, useRef, useState} from 'react'

const NavigationBarContext = createContext(null)

const NavigationBarProvider = ({children}) => {
    const [showMenu, _setShowMenu] = useState(false)
    const menuRef = useRef()
    const showMenuRef = useRef(showMenu)

    const setShowMenu = value => {
        showMenuRef.current = value
        _setShowMenu(value)
    }

    return (
        <NavigationBarContext.Provider value={[menuRef, showMenuRef, setShowMenu]}>
            {children}
        </NavigationBarContext.Provider>
    )
}

export {NavigationBarContext, NavigationBarProvider}