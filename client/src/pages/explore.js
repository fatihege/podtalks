import Head from 'next/head'
import styles from '@/styles/home.module.sass'
import PodcastersGrid from '@/components/podcasters-grid'
import StartStreamButton from '@/components/start-stream-button'

export default function Explore() {
    return (
        <>
            <Head>
                <title>Keşfet - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <StartStreamButton/>
                <PodcastersGrid title={'En Popüler Podcaster\'lar'} noMessage={'Herhangi bir popüler podcaster bulunamadı.'}/>
            </div>
        </>
    )
}
