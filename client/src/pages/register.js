import styles from '@/styles/form-page.module.sass'
import Logo from '@/icons/logo'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import NextIcon from '@/icons/next'
import {checkEmailField, checkNameField, checkPasswordConfirmField, checkPasswordField} from '@/utils/checkers'
import Head from 'next/head'

export default function Login() {
    const router = useRouter()
    const [user, setUser] = useContext(AuthContext)
    const [, setAlertPopup] = useContext(AlertContext)
    const name = useRef('')
    const email = useRef('')
    const password = useRef('')
    const passwordConfirm = useRef('')
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [alert, _setAlert] = useState({
        name: null,
        email: null,
        password: null,
        passwordConfirm: null,
    })
    const alertRef = useRef(alert)

    const setAlert = value => {
        alertRef.current = value
        _setAlert(value)
    }

    useEffect(() => {
        if (user.loaded && (user?.id && user?.token)) router.push('/')
    }, [user])

    useEffect(() => {
        if (alertRef.current.name || alertRef.current.email || alertRef.current.password || alertRef.current.passwordConfirm || !name.current.trim().length ||
            !email.current.trim().length || !password.current.length || !passwordConfirm.current.length)
            setDisableSubmit(true)
        else setDisableSubmit(false)
    }, [alertRef.current])

    const handleSubmit = async () => {
        if (alertRef.current.name || alertRef.current.email || alertRef.current.password || alertRef.current.passwordConfirm || disableSubmit) return
        setDisableSubmit(true)

        try {
            const response = await axios.post(`${process.env.API_URL}/user/signup`, {
                name: name.current,
                email: email.current,
                password: password.current,
                passwordConfirm: passwordConfirm.current,
            })

            if (response.data?.status === 'OK') {
                if (!response.data?.user) setAlertPopup({
                        active: true,
                        title: 'Onay postası gönderildi',
                        description: 'Hesabınız oluşturuldu, e-posta adresinize gönderdiğimiz onay postasından hesabınızı aktif hale getirebilirsiniz.',
                        button: 'Tamam',
                        type: 'primary'
                    })
                else setUser({loaded: true, ...response.data.user})

                router.push('/')
            } else throw new Error()
        } catch (e) {
            if (e.response && e.response.data.errors && Array.isArray(e.response.data.errors) && e.response.data.errors.length)
                for (const error of e.response.data.errors) setAlert({
                    ...alertRef.current,
                    [error.field]: error.message
                })
            else {
                setAlertPopup({
                    active: true,
                    title: 'Üzgünüz',
                    description: 'Hesabınız oluşturulurken bir sorun oluştu.',
                    button: 'Tamam',
                    type: ''
                })
                console.error(e)
            }
        } finally {
            setDisableSubmit(false)
        }
    }

    return user.loaded && (!user?.id || !user?.token) ? (
        <>
            <Head>
                <title>Kayıt ol - PodTalks</title>
            </Head>
            <div className={styles.formModal}>
                <div className={styles.logo}>
                    <Logo/>
                </div>
                <h3 className={styles.title}>PodTalks hesabınızı oluşturun</h3>
                <p className={styles.description}>Podcast dolu bir yolculuğa başlayın!</p>
                <div className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Input type="text" placeholder="Adınız" className={styles.input} autoComplete="off" set={name}
                               alert={alert.name} onChange={checkNameField(name, alertRef, setAlert)}/>
                        <Input type="text" placeholder="E-posta adresiniz" className={styles.input} autoComplete="off" set={email}
                               alert={alert.email} onChange={checkEmailField(email, alertRef, setAlert)}/>
                        <Input type="password" placeholder="Bir şifre oluşturun" className={styles.input} autoComplete="off" set={password}
                               alert={alert.password} onChange={checkPasswordField(password, passwordConfirm, alertRef, setAlert)}/>
                        <Input type="password" placeholder="Şifrenizi onaylayın" className={styles.input} autoComplete="off" set={passwordConfirm}
                               alert={alert.passwordConfirm} onChange={checkPasswordConfirmField(password, passwordConfirm, alertRef, setAlert)}/>
                    </div>
                    <Button value="Kayıt ol" icon={<NextIcon stroke={'#1c1c1c'}/>} onClick={handleSubmit}
                            disabled={disableSubmit}/>
                </div>
                <div className={styles.extras}>
                    <span onClick={() => router.push('/login')}>Hesabınıza giriş yapın</span>
                </div>
            </div>
        </>
    ) : ''
}