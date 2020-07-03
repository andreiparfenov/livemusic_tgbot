const Telegraf = require('telegraf') // import telegram lib
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
const Stage = require('telegraf/stage');
const session = require('telegraf/session');

const moment = require('moment');
moment.locale('ru');

const concertFinder = require('./concertFinder');

const bot = new Telegraf(process.env.BOT_TOKEN) // get the token from envirenment variable

bot.start(ctx => {
  ctx.reply(
      `Привет, ${ctx.from.first_name}! Хочешь узнать, какие концерты твоего любимого исполнителя будут в ближайшие время? :3`,
      Markup.inlineKeyboard([
        Markup.callbackButton('Найти концерты', 'FIND_CONCERTS')
      ]).extra()
  )
});

const findConcerts = new WizardScene(
  'find_concerts',
  ctx => {
    ctx.reply("Введи имя исполнителя или группы");
    return ctx.wizard.next();
  },
  ctx => {
    const bandName = ctx.message.text;
    concertFinder
      .findConcertsByName(bandName)
      .then(res => {
        if(res.data.count != 0 && res.data.results[0].title.includes("концерт")) {
          let event = res.data.results[0];
          let date = moment(new Date(event.daterange.start_date*1000)).format('LL');
          let time = moment.utc(event.daterange.start_time*1000).format('HH:mm');
          let description =  event.description.replace(/<[^>]*>?/gm, '').trim();
          ctx.replyWithMarkdown(
            `
🎵 Найден ${event.title}

📅 Дата: ${date} в ${time}

💫 ${description}

🔗 [Подробнее](${event.item_url})
            `
          );
        } else {
          ctx.reply("Этот исполнитель не выступает в ближайшее время рядом с вами :(")
        }
      })
      .catch(err => ctx.reply(
        err.message
      ))
    return ctx.scene.leave();
  }
)

const stage = new Stage([findConcerts], { default: 'find_concerts' }); // Scene registration
bot.use(session());
bot.use(stage.middleware());
bot.launch() // start