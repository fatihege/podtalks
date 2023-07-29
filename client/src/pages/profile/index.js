import {useRouter} from 'next/router'
import {useContext, useEffect} from 'react'
import {AuthContext} from '@/contexts/auth'

export default function ProfilePage() {
    const router = useRouter()
    const [user] = useContext(AuthContext)

    useEffect(() => {
        if (user.loaded && user?.token && user?.id) router.push(`/profile/${user.id}`)
        else router.push('/')
    }, [user])

    return <></>
}