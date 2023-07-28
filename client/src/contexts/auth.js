import {createContext, useEffect, useState} from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const AuthProvider = ({children}) => {
    const [user, setUser] = useState({
        loaded: false,
    })

    const getUser = async () => {
        const token = localStorage.getItem('token')

        if (token?.length) {
            try {
                let tmpUser = null

                const response = await axios.get(`${process.env.API_URL}/user/${token}`)
                if (response.data?.status === 'OK') {
                    tmpUser = {loaded: true, token, ...response.data.user}
                    setUser(tmpUser)
                }
            } catch (e) {
                setUser({loaded: true})
                localStorage.removeItem('token')
            }
        } else {
            setUser({loaded: true})
            localStorage.removeItem('token')
        }
    }

    useEffect(() => {
        if (!localStorage) return
        getUser()
    }, [])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (user.token && typeof user.token === 'string' && (!token || !token.length || user.token !== token))
            localStorage.setItem('token', user.token)
    }, [user])

    return (
        <AuthContext.Provider value={[user, setUser]}>
            {children}
        </AuthContext.Provider>
    )
}

export {AuthContext, AuthProvider}