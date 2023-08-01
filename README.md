# PodTalks - Canlı Podcast Yayın Platformu
## Kurulum
### Gereksinimler
- NodeJS
- NPM
- MongoDB

### Konfigürasyon
- `server` klasöründe `.env` dosyasındaki `APP_URL`, `DB_URI`, `PORT`, `MAILER_USER`, `MAILER_PASS`, `MAIL_FROM` alanlarına kendi bilgilerinizi girin.
- İsterseniz `CRYPTO_ALGORITHM`, `CRYPTO_KEY`, `CRYPTO_IV`, `JWT_KEY` alanlarını da değiştirebilirsiniz.
- `client` klasöründe `next.config.js` dosyasındaki `API_URL`, `CDN_URL`, `WS_URL` alanlarına geçerli edğerleri girin.

### Kurulum
- MongoDB'yi kurun ve `mongod` komutunu çalıştırarak arka plan işlemini başlatın.
- Proje dosyalarını dışa aktarın.
- `client` klasörüne girin ve `npm install` komutunu çalıştırın.
- `server` klasörüne girin ve `npm install` komutunu çalıştırın.

### Çalıştırma
#### Geliştirme Sürümü
- `client` klasörüne girin ve `npm run dev` komutunu çalıştırın.
- `server` klasörüne girin ve `npm run dev` komutunu çalıştırın.

#### Üretim Sürümü
- `client` klasörüne girin ve ilk olarak `npm run build` daha sonra `npm run start` komutunu çalıştırın.
- `server` klasörüne girin ve `npm run start` komutunu çalıştırın.

## Kullanılan Teknolojiler
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Socket.io](https://socket.io/)
- [JsonWebToken](https://jwt.io/)

###### Bu proje [MIT](https://choosealicense.com/licenses/mit/) lisansı ile lisanslanmıştır.