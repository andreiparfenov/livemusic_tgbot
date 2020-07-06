const Telegraf = require('telegraf') // import telegram lib
const Markup = require('telegraf/markup');
const WizardScene = require('telegraf/scenes/wizard');
const Stage = require('telegraf/stage');
const session = require('telegraf/session');

const moment = require('moment');
moment.locale('ru');

const mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/livemusic_bot', {useNewUrlParser: true});
mongoose.connect('mongodb+srv://andreip:G8ocSchZy5dvprf4@cluster0.aak1h.mongodb.net/Cluster0?retryWrites=true&w=majority', {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const userService = require('./services/userService');
const concertFinder = require('./services/concertFinder');

const bot = new Telegraf(process.env.BOT_TOKEN) // get the token from envirenment variable

bot.start(ctx => {
  ctx.reply(
      `Привет, ${ctx.from.first_name}! Хочешь узнать, какие концерты твоего любимого исполнителя будут в ближайшие время? :3`,
      Markup.inlineKeyboard([
        Markup.callbackButton('Найти концерты', 'FIND_CONCERTS')
      ]).extra()
  );
  userService.registerUser(ctx.from.id, ctx.from.username, ctx.from.first_name, ctx.from.last_name);
});

const findConcerts = new WizardScene(
  'find_concerts',
  ctx => {
    ctx.reply("Введи имя исполнителя или группы");
    return ctx.wizard.next();
  },
  async ctx => {
    const bandName = await ctx.message.text;
    userService.addInterest(ctx.from.id, bandName);
    concertFinder
      .findConcertsByName(bandName)
      .then(res => {
        if(res.data.count != 0 && res.data.results[0].title.includes("концерт")) {
          let event = res.data.results[0];
          let date = moment(new Date(event.daterange.start_date*1000)).format('LL');
          let time = moment.utc(event.daterange.start_time*1000).format('HH:mm');
          let description =  event.description.replace(/<[^>]*>?/gm, '').trim();
          //ctx.reply(res.data.results[0]);
          ctx.replyWithMarkdown(
            `
🎵 Найден ${event.title}

📅 Дата: ${date} в ${time}

💫 ${description}

🔗 [Подробнее](${event.item_url})
            `,
            Markup.inlineKeyboard([
              Markup.callbackButton('Найти ещё концерты', 'FIND_CONCERTS')
            ]).extra()
          );
        } else {
          ctx.reply(
            "Этот исполнитель не выступает в ближайшее время рядом с вами :(",
            Markup.inlineKeyboard([
              Markup.callbackButton('Найти концерт другого исполнителя', 'FIND_CONCERTS')
            ]).extra()
          )
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