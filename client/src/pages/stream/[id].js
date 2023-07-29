import io from 'socket.io-client'
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
import Link from 'next/link'
import SendIcon from '@/icons/send'
import {AudioRecorder, AudioStreamer} from 'jnaudiostream'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function StreamPanel({id}) {
    const router = useRouter()
    const [user, setUser] = useContext(AuthContext)
    const [, setAlertPopup] = useContext(AlertContext)
    const [streamUser, setStreamUser] = useState(null)
    const [editing, setEditing] = useState(false)
    const [sure, setSure] = useState(0)
    const sureRef = useRef(sure)
    const timeoutRef = useRef(null)
    const title = useRef('')
    const subject = useRef('')
    const socketRef = useRef(null)
    const messageRef = useRef()
    const [color, setColor] = useState('rgb(255, 255, 255)')
    const [chatLogs, setChatLogs] = useState([])
    const chatRef = useRef()
    const recorderRef = useRef(null)
    const streamerRef = useRef(null)
    const [micOpen, setMicOpen] = useState(true)
    const [clicked, setClicked] = useState(false)
    const [chatClosed, setChatClosed] = useState(null)
    const isSpeaking = false

    const getStreamData = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/user?id=${id}&props=*,stream`)

            if (response.data?.status === 'OK') {
                setStreamUser(response.data?.user)
                title.current = response.data?.user?.stream?.title
                subject.current = response.data?.user?.stream?.subject
            }
            else throw new Error()
        } catch (e) {
            router.push('/')
        }
    }

    useEffect(() => {
        getStreamData()

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveStreamRoom', streamUser?.id)
                socketRef.current.disconnect()
                socketRef.current = null
            }

            if (streamerRef.current) {
                streamerRef.current.stop()
                streamerRef.current = null
            }

            if (recorderRef.current) {
                recorderRef.current.stopRecording()
                recorderRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if ((id !== user?.id && !clicked) || socketRef.current || !streamUser || !user?.loaded) return

        socketRef.current = io(process.env.WS_URL, {
            reconnection: true,
            reconnectionDelay: 500,
            reconnectionAttempts: Infinity,
            transports: ['websocket'],
        })

        const {current: socket} = socketRef

        if (user?.id === id) {
            recorderRef.current = new AudioRecorder({debug: false}, 100)
            recorderRef.current.startRecording()

            recorderRef.current.onReady = packet => {
                socketRef.current?.emit('voiceBufferHead', streamUser?.id, packet)
            }

            recorderRef.current.onBuffer = packet => {
                socketRef.current?.emit('voiceBuffer', streamUser?.id, packet)
            }
        }

        socket.on('connect', async () => {
            if (user?.id === id) socket.emit('createStreamRoom', user?.id)
            else socket.emit('joinStreamRoom', user?.id, user?.name, streamUser.id)

            setChatClosed(false)

            socket.on('color', newColor => {
                setColor(newColor || 'rgb(255, 255, 255)')
            })

            socket.on('voiceBufferHead', async packet => {
                if (!streamerRef.current) return router.reload()
                streamerRef.current?.setBufferHeader(packet)
                streamerRef.current?.playStream()
            })

            socket.on('voiceBuffer', packet => {
                if (streamerRef.current) {
                    streamerRef.current.receiveBuffer(packet)
                    if (!streamerRef.current?.playing) streamerRef.current?.playStream()
                }
            })

            socket.on('userJoined', (userId, userName, color) => {
                setChatLogs(prev => [...prev, {type: 'join', color, userId, userName}])
            })

            socket.on('updateStream', (userId, userName, stream) => {
                setStreamUser(prev => ({...prev, stream}))
                setChatLogs(prev => [...prev, {type: 'update', userId, userName}])
            })

            socket.on('closeStream', () => {
                router.push(`/profile/${streamUser.id}`)
                setStreamUser(null)
            })

            socket.on('sendMessage', (userId, userName, message, color) => {
                setChatLogs(prev => [...prev, {type: 'message', color, userId, userName, message}])
            })

            socket.on('micClosed', () => {
                setMicOpen(false)
                if (user?.id !== id) streamerRef.current.muted = true
            })

            socket.on('micOpened', () => {
                setMicOpen(true)
                if (user?.id !== id) streamerRef.current.muted = false
            })

            socket.on('chatClosed', () => {
                setChatClosed(true)
            })

            socket.on('chatOpened', () => {
                setChatClosed(false)
            })
        })
    }, [clicked, user, recorderRef.current, streamerRef.current, streamUser])

    useEffect(() => {
        if (!streamUser || !user?.loaded) return

        if (user?.id !== id && !streamerRef.current) {
            streamerRef.current = new AudioStreamer(100)
            streamerRef.current.debug = false
        }
    }, [user, streamUser])

    useEffect(() => {
        scrollChatToBottom()
    }, [chatLogs])

    const scrollChatToBottom = () => {
        if (!chatRef.current) return
        chatRef.current.scrollTop = chatRef.current.scrollHeight
    }

    const checkMessage = e => {
        if (e.key === 'Enter') sendMessage()
        else if (e.key === 'Escape') messageRef.current.value = ''
    }

    const sendMessage = () => {
        if (!messageRef.current || (chatClosed && user?.id !== id)) return
        const message = messageRef.current?.value?.trim()
        if (!message?.length) return
        messageRef.current.value = ''
        setChatLogs(prev => [...prev, {type: 'message', userId: user.id, color, userName: user.name, message}])
        if (user?.id) socketRef.current.emit('sendMessage', user.id, user.name, message, streamUser.id)
    }

    const toggleRecording = () => {
        setMicOpen(prev => !prev)
    }

    useEffect(() => {
        if (!user.loaded || user?.id !== id || !recorderRef.current) return

        if (micOpen) {
            if (!recorderRef.current?.recording) recorderRef.current?.startRecording()
            socketRef.current?.emit('micOpened', streamUser?.id)
        } else socketRef.current?.emit('micClosed', streamUser?.id)
    }, [micOpen])

    const handleToggleChat = () => {
        setChatClosed(!chatClosed)
        socketRef.current?.emit(chatClosed ? 'chatOpened' : 'chatClosed', streamUser?.id)
    }

    const handleCloseSure = () => {
        if (user?.id !== id) return
        setSure(sure + 1 > 2 ? 0 : sure + 1)
    }

    const closeStream = async () => {
        if (user?.id !== id) return

        try {
            const response = await axios.post(`${process.env.API_URL}/user/close-stream/${user.id}`)
            if (response.data.status === 'OK') {
                socketRef.current?.emit('closeStream', user.id)
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
        if (user?.id !== id) return
        if ((!title.current?.trim()?.length || !subject.current?.trim()?.length) || (title.current?.trim() === user?.stream?.title?.trim() && subject.current?.trim() === user?.stream?.subject?.trim())) return setEditing(false)

        try {
            if (!user?.id || !user?.token) return
            const response = await axios.post(`${process.env.API_URL}/user/update-stream/${user.id}`, {
                title: title?.current?.trim(),
                subject: subject?.current?.trim(),
            })

            if (response.data.status === 'OK') {
                setUser({...user, stream: response.data.stream})
                setStreamUser({...streamUser, stream: response.data.stream})
                socketRef.current?.emit('updateStream', streamUser.id, streamUser.name, response.data.stream)
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
        sureRef.current = sure
        if (sure === 1) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => sureRef.current !== 2 ? setSure(0) : closeStream(), 3000)
        }
    }, [sure])

    return streamUser ? (
        <>
            <Head>
                <title>{streamUser?.stream?.title?.trim()} ({streamUser?.stream?.subject?.trim()}) - PodTalks</title>
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
                                <span className={styles.title}>{streamUser?.stream?.title?.trim()}</span>
                                <span className={styles.subject}>{streamUser?.stream?.subject?.trim()}</span>
                                {user?.id === id ? <div className={styles.edit} onClick={() => setEditing(true)}>Düzenle</div> : ''}
                            </>
                        )}
                    </div>
                    <div className={styles.speakers}>
                        {!clicked && user?.id !== id ? (
                            <div className={styles.overlay}>
                                <Button value={'Dinlemeye başla'} className={styles.overlayButton} onClick={() => setClicked(true)}/>
                            </div>
                        ) : ''}
                        <div className={`${styles.speaker} ${isSpeaking ? styles.speaking : ''} ${!micOpen ? styles.muted : ''}`}>
                            <div className={styles.speakerProfile}>
                                {streamUser?.image ? <img src={`${process.env.IMAGE_CDN}/${streamUser.image}`} alt={streamUser?.name}/> :
                                    <DefaultProfile/>}
                            </div>
                            <div className={styles.speakerName}>{streamUser?.name}</div>
                        </div>
                    </div>
                    {user?.id === id ? (
                        <div className={styles.controls}>
                            <Button value={chatClosed ? 'Sohbeti aç' : 'Sohbeti durdur'} type={''} className={styles.control} onClick={() => handleToggleChat()}/>
                            <Button value={micOpen ? 'Mikrofonu kapat' : 'Mikrofonu aç'} type={''} className={styles.control} onClick={() => toggleRecording()}/>
                            <Button value={sure === 0 ? 'Yayını kapat' : sure === 1 ? 'Emin misiniz?' : 'Yayın kapanıyor (iptal edebilirsiniz)'}
                                    type={'danger'} className={styles.control} onClick={() => handleCloseSure()}/>
                        </div>
                    ) : ''}
                </div>
                <div className={styles.chatSide}>
                    <div className={styles.chat} ref={chatRef}>
                        {chatLogs.map((log, index) => (
                            <div key={index} className={styles.log}>
                                {log.type === 'join' ? (
                                    <div className={styles.join}>
                                        <Link href={'/profile/[id]'} as={`/profile/${log.userId}`} target="_blank" className={styles.name} style={log.color ? {color: log.color} : {}}>• {log.userName}</Link> sohbete katıldı.
                                    </div>
                                ) : log.type === 'update' ? (
                                    <div className={styles.update}>
                                        <Link href={'/profile/[id]'} as={`/profile/${log.userId}`} target="_blank" className={styles.name} style={log.color ? {color: log.color} : {}}>• {log.userName}</Link> yayın bilgilerini güncelledi.
                                    </div>
                                ) : (
                                    <div className={styles.message}>
                                        <Link href={'/profile/[id]'} as={`/profile/${log.userId}`} target="_blank" className={styles.name} style={log.color ? {color: log.color} : {}}>{log.userName}</Link> {log.message}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className={styles.messageBox}>
                        {user.loaded ? user?.id && user?.token ? user?.id === id || (!chatClosed && chatClosed !== null) ? (
                            <>
                                <input type="text" placeholder='Bir mesaj yazın...' className={styles.messageInput} ref={messageRef} onKeyDown={checkMessage}/>
                                <button className={styles.sendButton} onClick={() => sendMessage()}>
                                    <SendIcon fill={'#111111'}/>
                                </button>
                            </>
                        ) : <span className={styles.chatClosed}>Sohbet kapalı.</span> : (
                            <Link href={'/login'} className={styles.loginForChat}>Sohbet etmek için giriş yapın.</Link>
                        ) : ''}
                    </div>
                </div>
            </div>
        </>
    ) : ''
}