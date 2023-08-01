import styles from '@/styles/podcasters-grid.module.sass'
import Link from 'next/link'
import DefaultProfile from '@/icons/default-profile'

export default function PodcastersGrid({loaded = true, title = '', noMessage = '', items = []}) {
    return (
        <div className={styles.podcastersGrid}>
            <h2>{title}</h2>
            <div className={`${styles.grid} ${!items?.length ? styles.empty : ''}`}>
                {items?.length ? items.map(item => (
                    <Link href={item?.stream ? '/stream/[id]' : '/profile/[id]'}
                          as={item?.stream ? `/stream/${item?.id || item?._id}` : `/profile/${item?.id || item?._id}`}
                          className={styles.podcaster} key={item?.id || item?._id}>
                        {item?.stream ? <span className={styles.liveTag}>Canlı</span> : ''}
                        <div className={styles.podcasterImage}>
                            {item?.image ? <img src={`${process.env.CDN_URL}/${item.image}`} alt={item?.name}/> :
                                <DefaultProfile/>}
                        </div>
                        <div className={styles.podcasterInfo}>
                            <h3 title={item?.stream?.title}>{item?.stream ? item.stream?.title : item?.name}</h3>
                            {item?.stream ? <span title={item?.name}>{item?.name}</span> : ''}
                        </div>
                    </Link>
                )) : loaded ? (
                    <div className={styles.noPodcaster}>
                        <span>{noMessage}</span>
                    </div>
                ) : ''}
            </div>
        </div>
    )
}