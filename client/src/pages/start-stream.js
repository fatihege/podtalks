import Head from 'next/head'
import styles from '@/styles/start-stream.module.sass'
import Input from '@/components/form/input'
import {useContext, useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/router'
import {AuthContext} from '@/contexts/auth'
import Button from '@/components/form/button'
import {AlertContext} from '@/contexts/alert'
import axios from 'axios'

export default function StartStream() {
    const router = useRouter()
    const [user, setUser] = useContext(AuthContext)
    const [, setAlertPopup] = useContext(AlertContext)
    const [listening, setListening] = useState(false)
    const title = useRef('')
    const subject = useRef('')
    const mediaRecorder = useRef(null)
    const audioChunks = useRef([])

    useEffect(() => {
        if (user.loaded && (!user?.id || !user?.token)) router.push('/login')
        if (user.loaded && user.stream) router.push('/stream')
    }, [user])

    const testMic = async () => {
        audioChunks.current = []
        if (!listening) {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
            mediaRecorder.current = new MediaRecorder(stream)
            mediaRecorder.current.ondataavailable = e => {
                audioChunks.current = [...audioChunks.current, e.data]
            }
            mediaRecorder.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, {type: 'audio/webm; codecs=opus'})
                const audioUrl = URL.createObjectURL(audioBlob)
                const audio = new Audio(audioUrl)
                audio.play()
                audioChunks.current = []
            }
            mediaRecorder.current.start()
            setListening(true)
        } else {
            mediaRecorder.current.stop()
            setListening(false)
        }
    }

    const handleStartStream = async () => {
        try {
            if (!user?.id || !user?.token) return
            const response = await axios.post(`${process.env.API_URL}/user/start-stream/${user.id}`, {
                title: title?.current?.trim(),
                subject: subject?.current?.trim(),
            })

            if (response.data.status === 'OK') {
                setUser({...user, stream: response.data.stream})
                router.push('/stream')
            }
            else throw new Error()
        } catch (e) {
            setAlertPopup({
                active: true,
                title: 'Yayın başlatılamadı',
                description: 'Podcast yayınınız başlatılırken bir sorun oluştu.',
                button: 'Tamam',
                type: ''
            })
            console.error(e)
        }
    }

    return user.loaded && ((user?.id && user?.token) || !user.stream) ? (
        <>
            <Head>
                <title>Podcast yayını başlatın - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Podcast yayını başlatın</h1>
                <div className={styles.streamInfo}>
                    <Input type="text" set={title} placeholder={`Podcast başlığı (${user?.name}'in podcast yayını)`} className={styles.inputField}/>
                    <Input type="text" set={subject} placeholder={`Podcast'in konusu (sohbet)`} className={styles.inputField}/>
                    <Button type={''} onClick={() => testMic()} value={listening ? 'Testi bitir' : 'Mikrofonu test et'} className={styles.inputField}/>
                    <Button onClick={() => handleStartStream()} value={'Podcast yayınını başlat'} className={styles.inputField}/>
                </div>
            </div>
        </>
    ) : ''
}