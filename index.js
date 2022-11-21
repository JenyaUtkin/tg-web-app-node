const dotenv = require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = dotenv.parsed.TG_TOKEN
const webAppUrl = 'https://sprightly-praline-d003fb.netlify.app/'

const app = express();

app.use(express.json());
app.use(cors());

const bot = new TelegramBot(token, {polling: true});
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const dataText = msg.web_app_data.data;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появиться кнопка, заполните форму', {
            reply_markup: {
                keyboard:[
                    [{
                        text: 'Сделать заказ',
                        web_app: {url: webAppUrl + 'form'},
                    }]
                ]
            }
        });
        await bot.sendMessage(chatId, 'Заполните форму', {
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: 'Сделать заказ',
                        web_app: {url: webAppUrl},
                    }]
                ]
            }
        });

    }
    if(dataText) {
        try {
            const data = JSON.parse(dataText)
            console.log(data)
            await bot.sendMessage(chatId, 'Ваше имя: ' + data.name);
            await bot.sendMessage(chatId, 'Ваша дата рождения: ' + data.date);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});
app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT));