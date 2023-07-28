import transporter from '../lib/mailer.js'

export default ({email, subject, html, text}, callback) => {
    transporter(process.env.MAILER_USER, process.env.MAILER_PASS).sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject,
        html,
        text,
    }, callback)
}