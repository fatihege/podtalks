import {createContext, useState} from 'react'

const SidePanelContext = createContext(null)

const SidePanelProvider = ({children}) => {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <SidePanelContext.Provider value={[showMenu, setShowMenu]}>
            {children}
        </SidePanelContext.Provider>
    )
}

export {SidePanelContext, SidePanelProvider}