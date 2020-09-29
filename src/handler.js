'use strict';

import axios from 'axios';
import * as bot from './bot';
import * as botRepo from './bot-repo';

export const handle = async (event, context, callback, http = axios, token = process.env.TELEGRAM_TOKEN, repo = botRepo) => {
  //console.log(`Received event ${JSON.stringify(event)}`);
  const apiURL = `https://api.telegram.org/bot${token}`;

  if (!token) { 
    console.error("TELEGRAM_TOKEN env var not set");
    return { statusCode: 200, body: 'OK' };
  }
  
  const body = JSON.parse(event.body);    //console.log(`body = ${JSON.stringify(body)}`);
  const message = body.message;           //console.log(`\n\n***** message: ${JSON.stringify(message)}\n\n`);
  if(!message) {
    console.error("bad request event");
    return { statusCode: 200, body: 'OK' };
  }
  
  const chatId = `${message.chat.id}`; //convert to string

  const sendMessage = (message) => {
    const response = {
      chat_id : chatId,
      text : message,
      parse_mode : 'Markdown'
    }

    return http.post(`${apiURL}/sendMessage`, response)
      .then(() => ({ statusCode: 200, body: 'OK' }))
      .catch((error) => {
        console.error(`error sending message: ${JSON.stringify(response)}, \n\n${error}`);
        return { statusCode: 200, body: 'OK' };
      });
  };

  try {
    if(isNewGroupEvent(message)) {
      message.text = `/create ${message.chat.title}`;
    }

    if(!message.text) {
      return { statusCode: 200, body: 'OK' }; //event we don't care about
    }

    return bot.handle({chatId : chatId, command : message.text, from : `${message.from.first_name} ${message.from.last_name}`}, repo)
      .then(response => sendMessage(response.message))
      .catch((error) => {
        console.error(`error occured interacting with bot ${JSON.stringify(error)}`);
        sendMessage(`Unsupported command. Type /help to see a list of supported commands.`);
      });
  } catch(err) {
    console.error(`an unexpected error occured ${err}`);
    return { statusCode: 200, body: 'OK' };
  }
};

const isNewGroupEvent = (message) => {
  return ((message.new_chat_member && message.new_chat_member.username === "LifeGroup_Bot") || (message.group_chat_created)) ? true : false;
} 