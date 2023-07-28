import styles from '@/styles/podcasters-grid.module.sass'
import {useEffect, useState} from 'react'
import Link from 'next/link'

export default function PodcastersGrid({title = '', noMessage = ''}) {
    const [podcasters, setPodcasters] = useState([])

    useEffect(() => {
        let newPodcasters = []

        for (let i = 0; i < 5; i++) {
            newPodcasters.push({
                id: i,
                name: 'Podcaster Adı',
                podcastName: 'Podcast Adı',
                image: 'https://picsum.photos/200/200',
                isLive: Math.random() >= 0.5,
            })
        }

        setPodcasters(newPodcasters)
    }, [])

    return (
        <div className={styles.podcastersGrid}>
            <h2>{title}</h2>
            <div className={`${styles.grid} ${!podcasters?.length ? styles.empty : ''}`}>
                {podcasters?.length ? podcasters.map(podcaster => (
                    <Link href={'/'} className={styles.podcaster} key={podcaster.id}>
                        {podcaster.isLive ? <span className={styles.liveTag}>Canlı</span> : ''}
                        <div className={styles.podcasterImage}>
                            <img src={podcaster.image} alt=""/>
                        </div>
                        <div className={styles.podcasterInfo}>
                            <h3 title={podcaster.podcastName}>{podcaster.podcastName}</h3>
                            <span title={podcaster.name}>{podcaster.name}</span>
                        </div>
                    </Link>
                )) : (
                    <div className={styles.noPodcaster}>
                        <span>{noMessage}</span>
                    </div>
                )}
            </div>
        </div>
    )
}