import styles from '@/styles/form-page.module.sass'
import Head from 'next/head'
import Input from '@/components/form/input'
import {checkEmailField} from '@/utils/checkers'
import {useContext, useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/router'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import Button from '@/components/form/button'
import NextIcon from '@/icons/next'
import axios from 'axios'

export default function ForgotPassword() {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [, setAlertPopup] = useContext(AlertContext)
    const email = useRef('')
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [alert, _setAlert] = useState({
        email: null,
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
        if (alertRef.current.email || !email.current.trim().length)
            setDisableSubmit(true)
        else setDisableSubmit(false)
    }, [alertRef.current])

    const handleSubmit = async () => {
        if (user.loaded && (user?.id && user?.token)) return router.push('/')

        try {
            const response = await axios.post(`${process.env.API_URL}/user/forgot-password`, {
                email: email.current,
            })

            if (response.data?.status === 'OK') {
                setAlertPopup({
                    active: true,
                    title: 'Şifrenizi sıfırlamak için e-posta adresinize bir bağlantı gönderdik.',
                    description: 'E-posta adresinize gönderdiğimiz bağlantıyı kullanarak şifrenizi sıfırlayabilirsiniz.',
                    button: 'Tamam',
                    type: 'primary',
                })
                router.push('/login')
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
                    title: 'Bir hata oluştu',
                    description: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
                    button: 'Tamam',
                    type: ''
                })
                console.error(e)
            }
        }
    }

    return  user.loaded && (!user?.id || !user?.token) ? (
        <>
            <Head>
                <title>Şifrenizi sıfırlayın - PodTalks</title>
            </Head>
            <div className={styles.formModal}>
                <h3 className={styles.title}>Şifrenizi Sıfırlayın</h3>
                <div className={styles.form}>
                    <Input type="text" placeholder="E-posta adresiniz" className={styles.input} autoComplete="off"
                           set={email} alert={alert.email} onChange={checkEmailField(email, alertRef, setAlert)}/>
                </div>
                <Button value="Şifremi sıfırla" icon={<NextIcon stroke={'#1c1c1c'}/>} onClick={handleSubmit}
                        disabled={disableSubmit}/>
            </div>
        </>
    ) : ''
}