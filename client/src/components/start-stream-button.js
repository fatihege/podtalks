import {useRouter} from 'next/router'
import styles from '@/styles/start-stream-button.module.sass'
import {AuthContext} from '@/contexts/auth'
import {useContext} from 'react'

export default function StartStreamButton() {
    const router = useRouter()
    const [user] = useContext(AuthContext)

    const isUserStreaming = () => user?.stream && user?.stream?.title?.trim().length && user?.stream?.subject?.trim().length

    return (
        <div className={styles.startStreamButton}>
            <button onClick={() =>
                user.loaded && user?.id && user?.token ?
                    (isUserStreaming() ?
                        router.push('/stream') :
                        router.push('/start-stream')) :
                    router.push('/login')}>
                {isUserStreaming() ? 'Yayınına dön' : 'Podcast yayını aç'}
            </button>
        </div>
    )
}