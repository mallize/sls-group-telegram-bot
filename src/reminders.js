'use strict';

import axios from 'axios';
import * as bot from './bot';
import * as botRepo from './bot-repo';

export const handle = async (event, context, callback, http = axios, token = process.env.TELEGRAM_TOKEN, repo = botRepo) => {
  
  if (!token) { 
    console.error("TELEGRAM_TOKEN env var not set");
    return { statusCode: 200, body: 'OK' };
  }

  const apiURL = `https://api.telegram.org/bot${token}`;

  

}