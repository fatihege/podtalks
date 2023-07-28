import {useEffect, useRef} from 'react'
import {useRouter} from 'next/router'
import axios from 'axios'

export function getServerSideProps(context) {
    return {
        props: {
            token: context.params.token,
        },
    }
}

export default function Activate({token}) {
    const router = useRouter()
    const requestSent = useRef(false)

    const sendRequest = async () => {
        try {
            await axios.post(`${process.env.API_URL}/user/activate/${token}`)
            requestSent.current = true
        } catch (e) {
            console.error(e)
        } finally {
            await router.push('/')
        }
    }

    useEffect(() => {
        if (requestSent.current) return
        sendRequest()
    }, [])

    return <></>
}