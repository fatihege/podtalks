import Head from 'next/head'

export default function () {
    return (
        <>
            <Head>
                <title>Aradığınız sayfa bulunamadı - PodTalks</title>
            </Head>
            <div
                style={{
                    height: '100vh',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                }}>
                <div style={{lineHeight: '48px'}}>
                    <h1 className="next-error-h1"
                        style={{
                            display: 'inline-block',
                            margin: '0 20px 0 0',
                            paddingRight: '23px',
                            fontSize: '24px',
                            fontWeight: 500,
                            verticalAlign: 'top',
                            borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                        }}>404</h1>
                    <div style={{display: 'inline-block'}}><h2
                        style={{fontSize: '14px', fontWeight: 400, lineHeight: '28px'}}>Aradığınız sayfayı bulamadık.</h2></div>
                </div>
            </div>
        </>
    )
}