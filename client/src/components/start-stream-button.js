import {useRouter} from 'next/router'
import styles from '@/styles/start-stream-button.module.sass'

export default function StartStreamButton() {
    const router = useRouter()

    return (
        <div className={styles.startStreamButton}>
            <button onClick={() => router.push('/stream')}>Podcast Yayını Aç</button>
        </div>
    )
}