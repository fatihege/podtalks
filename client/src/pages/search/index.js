import styles from '@/styles/search.module.sass'
import Input from '@/components/form/input'
import {useRef} from 'react'
import Button from '@/components/form/button'
import {useRouter} from 'next/router'

export default function Search() {
    const router = useRouter()
    const search = useRef('')

    const handleSearch = () => {
        if (search.current?.length > 0) router.push(`/search/${search.current}`)
    }

    return (
        <div className={`${styles.container} ${styles.main}`}>
            <div className={styles.wrapper}>
                <h1 className={styles.title}>Arama yapın</h1>
                <div className={styles.searchBox}>
                    <Input placeholder={'Arama yapın'} set={search} onKeyDown={e => {
                        if (e.key === 'Enter') handleSearch()
                    }} className={styles.searchInput}/>
                    <Button className={styles.searchButton} value="Ara" onClick={() => handleSearch()}/>
                </div>
            </div>
        </div>
    )
}