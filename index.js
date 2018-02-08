const TelegramBot = require("node-telegram-bot-api");

const fs = require("file-system");

const request = require("request");

const _ = require("lodash");

const token = '519706729:AAGVRa3pWV6Og5gslsj7oVhwwI0-ckgyCfE';

const bot = new TelegramBot(token, {
    polling: true
});

const KB = {
    currency: 'Курс криптокаренси',
    picture: 'Смешняхи',
    cat: 'Котаны',
    memes: 'Мемесы',
    back: 'Охрана отмена'
};

const PicSrcs = {
    [KB.cat]: [
        'cat1.gif',
        'cat2.gif',
        'cat3.gif'
    ],
    [KB.memes]: [
        'mem1.gif',
        'mem2.gif',
        'mem3.gif',
        'mem4.gif'
    ]
};

bot.onText(/\/start/, msg => {

    sendGreeting(msg)

});

bot.on('message', msg => {
    switch (msg.text) {
        case KB.picture:
            sendPictureScreen(msg.chat.id)
            break;
        case KB.currency:
            sendCurrencyScreen(msg.chat.id)
            break;
        case KB.back:
            sendGreeting(msg, false)
            break;
        case KB.cat:
        case KB.memes:
            sendPictureByName(msg.chat.id, msg.text)
            break;
    }
});

bot.on('callback_query', query => {
    
    const base = query.data
    
    const symbol = 'USD'

    bot.answerCallbackQuery({

        callback_query_id: query.id,
        text: `Ты выбрал ${base}`

    });
    
    request(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH&tsyms=${symbol}&base=${base}`, (error, response, body) => {

        if (error) throw new Error(error)

        if (response.statusCode === 200) {

            const currencyData = JSON.parse(body)

            const html = `<b>1 ${base}</b> - <em>${currencyData[base][symbol]} ${symbol}</em>`
            bot.sendMessage(query.message.chat.id, html, {
                parse_mode: 'HTML'
            });
            //console.log(currencyData)
            
        }

    })

});

function sendPictureScreen(chatId) {
    bot.sendMessage(chatId, `Выбери картинку: `, {
        reply_markup: {
            keyboard: [
                [KB.cat, KB.memes],
                [KB.back]
            ]
        }
    })
};

function sendGreeting(msg, sayHello = true) {

    const text = sayHello 
        ? `Привет, кожаный мешок ${ msg.from.first_name }!`
        : `Что ещё?`

    bot.sendMessage(msg.chat.id, text, {
        reply_markup: {
            keyboard: [
                [KB.currency, KB.picture]
            ]
        }
    })
};

function sendPictureByName(chatId, picName) {

    const srcs = PicSrcs[picName];

    const src = srcs[_.random(0, srcs.length - 1)];

    bot.sendMessage(chatId, 'Превозмогаю...');

    fs.readFile(`${__dirname}/pictures/${src}`, (error, picture) => {
        if (error) throw new Error(error)

        bot.sendDocument(chatId, picture).then(() => {
            bot.sendMessage(chatId, 'Насладжайся, кожаный мешок!')
        })
    });

}

function sendCurrencyScreen(chatId) {

    bot.sendMessage(chatId, 'Выбери тип валюты, наивный криптоман:', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Биток',
                        callback_data: 'BTC'
                    }
                ],
                [
                    {
                        text: 'Зифир',
                        callback_data: 'ETH'
                    }
                ]
            ]
        }
    })

};


