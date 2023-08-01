import styles from '@/styles/library-grid.module.sass'
import Link from 'next/link'
import DefaultBook from '@/icons/default-book'

export default function LibraryGrid({title = '', noMessage = '', items = []}) {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.grid}>
                {items?.length ? items.map((item, index) => (
                    <Link href={'/library/[id]'} as={`/library/${item?.id || item?._id}`} key={index} className={styles.book}>
                        <div className={styles.bookImage}>
                            {item?.image ? <img src={`${process.env.CDN_URL}/${item.image}`} alt={item?.title}/> : <DefaultBook/>}
                        </div>
                        <div className={styles.bookInfo}>
                            <h3 title={item?.title}>{item?.title}</h3>
                            <p>{item?.content?.trim()}...</p>
                        </div>
                        <div className={styles.bookAuthor}>
                            <div className={styles.authorName}>{item?.author}</div>
                        </div>
                    </Link>
                )) : (
                    <div className={styles.noBook}>
                        <span>{noMessage}</span>
                    </div>
                )}
            </div>
        </div>
    )
}