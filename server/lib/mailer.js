import nodemailer from 'nodemailer'

export default (user, pass) => nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user,
        pass,
    }
})