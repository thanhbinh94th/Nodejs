const TimeFarm = require('./TimeFarm')
const { sleep } = require('./utils')
const urlencode = require('urlencode')

// 
const arrayTele = [
    {
        query: 'https://timefarm.app/#tgWebAppData=query_id%3DAAEzPad-AgAAADM9p347SDwf%26user%3D%257B%2522id%2522%253A6419856691%252C%2522first_name%2522%253A%2522%25F0%259F%2590%25A4%2520Hong%2520giang%2520%25F0%259F%258C%25B1SEED%2520Gra-Gra%2522%252C%2522last_name%2522%253A%2522Trieu%2522%252C%2522username%2522%253A%2522hsynful79605ydq%2522%252C%2522language_code%2522%253A%2522en%2522%252C%2522allows_write_to_pm%2522%253Atrue%257D%26auth_date%3D1728987960%26hash%3D0a57f91095a9c45adc765d06c33f43a53f0797795426d4cb6cae144aacfbe35f&tgWebAppVersion=7.10&tgWebAppPlatform=web&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%2C%22button_color%22%3A%22%233390ec%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22hint_color%22%3A%22%23707579%22%2C%22link_color%22%3A%22%2300488f%22%2C%22secondary_bg_color%22%3A%22%23f4f4f5%22%2C%22text_color%22%3A%22%23000000%22%2C%22header_bg_color%22%3A%22%23ffffff%22%2C%22accent_text_color%22%3A%22%233390ec%22%2C%22section_bg_color%22%3A%22%23ffffff%22%2C%22section_header_text_color%22%3A%22%233390ec%22%2C%22subtitle_text_color%22%3A%22%23707579%22%2C%22destructive_text_color%22%3A%22%23df3f40%22%7D',
        teleData: '',
        token: '',
        teleId: 6419856691
    }
]
const arrayTf = {}

async function main () {

    for (const tele of arrayTele) {

        if (!tele.teleData && tele.query) {
            tele.teleData = urlencode.parse(tele.query.split('#')[1]).tgWebAppData
            // console.log(parse(tele.teleData))
            // return
        }

        const timefarm = new TimeFarm({
            teleData: tele.teleData,
            token: tele.token,
            teleId: tele.teleId
        })

        arrayTf[tele.teleId] = timefarm
        arrayTf[tele.teleId].init()
        await sleep(1000)

    }


    reloadTele()

}



async function reloadTele () {

    const tf_expired = Object.values(arrayTf).filter(el => el.expired)

    for (const tf of tf_expired) {

        // Log lai tele
        // De lay teleData
        // Sau khi co teleData

        
        arrayTf[tf.teleId].teleData = '' // teleData vua lay duoc
        arrayTf[tf.teleId].token = ''
    }

    await sleep(60 * 1000)

    reloadTele()

}


main ()