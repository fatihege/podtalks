import {useRouter} from 'next/router'
import {AuthContext} from '@/contexts/auth'
import {useContext, useEffect} from 'react'

export default function StreamIndex() {
    const router = useRouter()
    const [user] = useContext(AuthContext)

    useEffect(() => {
        if (user.loaded && (!user?.id || !user?.token)) router.push('/login')
        else if (user.loaded)
            if (!user.stream || !user.stream?.title?.trim()?.length || !user.stream?.subject?.trim()?.length) router.push('/start-stream')
            else router.push(`/stream/${user.id}`)
    }, [user])

    return <></>
}