import {createContext, useState} from 'react'
import Alert from '@/components/alert'

const AlertContext = createContext(null)

const AlertProvider = ({children}) => {
    const [alert, setAlert] = useState({
        active: false,
        title: '',
        description: '',
        button: 'OK',
        type: '',
    })

    return (
        <AlertContext.Provider value={[alert, setAlert]}>
            {alert.active ? (
                <Alert title={alert.title} description={alert.description} button={alert.button} type={alert.type}/>
            ) : ''}
            {children}
        </AlertContext.Provider>
    )
}

export {AlertContext, AlertProvider}