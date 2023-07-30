import SearchBox from '@/components/search-box'
import styles from '@/styles/search.module.sass'

export default function Search() {
    return (

        <div className={`${styles.container} ${styles.main}`}>
            <div className={styles.wrapper}>
                <SearchBox/>
            </div>
        </div>
    )
}