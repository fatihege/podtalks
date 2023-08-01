import styles from '@/styles/articles-grid.module.sass'
import Link from 'next/link'
import DefaultArticle from '@/icons/default-article'
import DefaultProfile from '@/icons/default-profile'

export default function ArticlesGrid({title = '', noMessage = '', items = []}) {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.grid}>
                {items?.length ? items.map((item, index) => (
                    <Link href={'/articles/[id]'} as={`/articles/${item?.id || item?._id}`} key={index} className={styles.article}>
                        <div className={styles.articleImage}>
                            {item?.image ? <img src={`${process.env.CDN_URL}/${item.image}`} alt={item?.title}/> : <DefaultArticle/>}
                        </div>
                        <div className={styles.articleInfo}>
                            <h3 title={item?.title}>{item?.title}</h3>
                            <p>{item?.content?.trim()}...</p>
                        </div>
                        <div className={styles.articleAuthor}>
                            <div className={styles.authorImage}>
                                {item?.creator?.image ? <img src={`${process.env.CDN_URL}/${item.creator.image}`} alt={item?.creator?.name}/> : <DefaultProfile/>}
                            </div>
                            <div className={styles.authorName}>{item?.creator?.name}</div>
                        </div>
                    </Link>
                )) : (
                    <div className={styles.noArticle}>
                        <span>{noMessage}</span>
                    </div>
                )}
            </div>
        </div>
    )
}