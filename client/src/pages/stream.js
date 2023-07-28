import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {useRouter} from 'next/router'
import Head from 'next/head'
import styles from '@/styles/stream.module.sass'
import DefaultProfile from '@/icons/default-profile'
import Button from '@/components/form/button'
import axios from 'axios'
import {AlertContext} from '@/contexts/alert'
import Input from '@/components/form/input'

export default function Stream() {
    const router = useRouter()
    const [user, setUser] = useContext(AuthContext)
    const [, setAlertPopup] = useContext(AlertContext)
    const [editing, setEditing] = useState(false)
    const [sure, setSure] = useState(0)
    const sureRef = useRef(sure)
    const timeoutRef = useRef(null)
    const title = useRef('')
    const subject = useRef('')
    const isSpeaking = false

    useEffect(() => {
        if (user.loaded && (!user?.id || !user?.token)) router.push('/login')
        else if (user.loaded && (!user.stream || !user.stream?.title?.trim()?.length || !user.stream?.subject?.trim()?.length)) router.push('/start-stream')
        else {
            title.current = user?.stream?.title
            subject.current = user?.stream?.subject
        }
    }, [user])

    const handleCloseSure = () => {
        setSure(sure + 1 > 2 ? 0 : sure + 1)
    }

    const closeStream = async () => {
        try {
            const response = await axios.post(`${process.env.API_URL}/user/close-stream/${user.id}`)
            if (response.data.status === 'OK') {
                await router.push('/')
                setUser({...user, stream: null})
            } else throw new Error()
        } catch (e) {
            setAlertPopup({
                active: true,
                title: 'Bir sorun oluştu',
                description: 'Yayınınız kapatılırken bir hata oluştu.',
                button: 'Tamam',
                type: ''
            })
            console.error(e)
        }
    }

    const handleSave = async () => {
        if ((!title.current?.trim()?.length || !subject.current?.trim()?.length) || (title.current?.trim() === user?.stream?.title?.trim() && subject.current?.trim() === user?.stream?.subject?.trim())) return setEditing(false)

        try {
            if (!user?.id || !user?.token) return
            const response = await axios.post(`${process.env.API_URL}/user/update-stream/${user.id}`, {
                title: title?.current?.trim(),
                subject: subject?.current?.trim(),
            })

            if (response.data.status === 'OK') {
                setUser({...user, stream: response.data.stream})
                setEditing(false)
            } else throw new Error()
        } catch (e) {
            setAlertPopup({
                active: true,
                title: 'Bir sorun oluştu',
                description: 'Podcast yayınınız güncellenirken bir sorun oluştu.',
                button: 'Tamam',
                type: ''
            })
            console.error(e)
        } finally {
            setEditing(false)
        }
    }

    useEffect(() => {
        console.log(title.current, subject.current)
    }, [title.current, subject.current])

    useEffect(() => {
        sureRef.current = sure
        if (sure === 1) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => sureRef.current !== 2 ? setSure(0) : closeStream(), 5000)
        }
    }, [sure])

    return user.loaded && (!user?.id && !user?.token) || (user.stream && user.stream?.title?.trim()?.length && user.stream?.subject?.trim()?.length) ? (
        <>
            <Head>
                <title>{user?.stream?.title?.trim()} ({user?.stream?.subject?.trim()}) - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.streamSide}>
                    <div className={styles.streamTitle}>
                        {editing ? (
                            <>
                                <Input placeholder={'Podcast başlığı'} value={user?.stream?.title?.trim()} set={title}/>
                                <Input placeholder={'Podcast konusu'} value={user?.stream?.subject?.trim()} set={subject}/>
                                <Button value={'Kaydet'} onClick={() => handleSave()}/>
                            </>
                        ) : (
                            <>
                                {user?.stream?.title?.trim()}
                                <span className={styles.subject}>{user?.stream?.subject?.trim()}</span>
                                <div className={styles.edit} onClick={() => setEditing(true)}>Düzenle</div>
                            </>
                        )}
                    </div>
                    <div className={styles.speakers}>
                        <div className={`${styles.speaker} ${isSpeaking ? styles.speaking : ''}`}>
                            <div className={styles.speakerProfile}>
                                {user?.image ? <img src={`${process.env.IMAGE_CDN}/${user.image}`} alt={user?.name}/> :
                                    <DefaultProfile/>}
                            </div>
                            <div className={styles.speakerName}>{user?.name}</div>
                        </div>
                    </div>
                    <div className={styles.controls}>
                        <Button value={'Sohbeti durdur'} type={''} className={styles.control}/>
                        <Button value={'Mikrofonu kapat'} type={''} className={styles.control}/>
                        <Button value={sure === 0 ? 'Yayını kapat' : sure === 1 ? 'Emin misiniz?' : 'Yayın kapanıyor (iptal edebilirsiniz)'}
                                type={'danger'} className={styles.control} onClick={() => handleCloseSure()}/>
                    </div>
                </div>
                <div className={styles.chatSide}></div>
            </div>
        </>
    ) : ''
}