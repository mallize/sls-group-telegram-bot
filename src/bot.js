'use strict';

import * as botRepo from './bot-repo';

export const handle = async (request, repo = botRepo) => { console.table(request)
    const {commandItem, args} = findCommandItem(request.command);

    console.table(commandItem)
    console.log(`args ${args}`)

    if(commandItem) {
      return commandItem.fn(request.chatId, repo, args, request.from)
        .then(msg => ({message : msg}))
        .catch(err => Promise.reject({error : err}));
    } else {
      return {message : 'I do not support the command you sent me'};
    }
}

const findCommandItem = (req, stop = false) => {
  const request = req.replace('@LifeGroup_Bot', '')  // remove @bot

  const argIndex = request.indexOf(" ");
  const command = (argIndex == -1) ? request : request.slice(0, argIndex); console.log(`command ${command}`)
  const args = (argIndex == -1) ? undefined : request.slice(argIndex + 1, request.length);

  const commandItem = commands.find(cmd => cmd.command === command.toLowerCase());
  return (commandItem) 
    ? {commandItem: commandItem, args: args}
    : stop ? undefined : findCommandItem(request.replace(' ', ''), true); //check for auto correct version (i.e. /set meeting)
}

const formatOptional = (value, text) => value ? `\n\n${text} ${value}` : '';

const getNext = async (chatId, repo) => {
  return withGroup(chatId, repo, group => `${getNextMeeting(group.meeting)}${formatOptional(group.study, "We will study")}${formatOptional(group.notes, "Notes:")}`);
}

const getHelp = () => Promise.resolve(generalMessage);

const setStudy = async (chatId, repo, study) => { 
  return setGroupFields(chatId, repo, {study : study}, 'Study updated. Type /next to see the group meeting time, study and notes.');
}

const setNotes = async (chatId, repo, notes) => { 
  return setGroupFields(chatId, repo, {notes : notes}, 'Notes updated. Type /next to see the group meeting time, study and notes.');
}

const create = async (chatId, repo, title) => { 
  return setGroupFields(chatId, repo, {title : title}, 'Group created. Type /help to see a list of commands I support.');
}

const clearFood = async (chatId, repo) => { 
  return setGroupFields(chatId, repo, {food : []}, 'Food list cleared.');
}

const clearPrayers = async (chatId, repo) => { 
  return setGroupFields(chatId, repo, {prayers : []}, 'Prayer list cleared.');
}

const clearNotes = async (chatId, repo) => { 
  return setGroupFields(chatId, repo, {notes : null}, 'Notes cleared.');
}

const clearStudy = async (chatId, repo) => { 
  return setGroupFields(chatId, repo, {study : null}, 'Study cleared.');
}

const clearQuestions = async (chatId, repo) => { 
  return setGroupFields(chatId, repo, {questions : null}, 'Questions cleared.');
}

const clearGifts = async (chatId, repo) => { 
  return setGroupFields(chatId, repo, {gifts : null}, 'Gifts cleared.');
}

const getQuestions = async (chatId, repo) => {
  return withGroup(chatId, repo, (group) => formatQuestions(group.questions));
}

const getGifts = async (chatId, repo) => {
  return withGroup(chatId, repo, (group) => formatGifts(group.gifts));
}

const getPrayers = async (chatId, repo) => {
  return withGroup(chatId, repo, (group) => formatPrayers(group.prayers));
}

const addQuestion = async (chatId, repo, question, from) => { 
  return updateGroup(chatId, repo, (group) => {
    const newList = addToList(group.questions, {id : getNextId(group.questions), question : `${question} - asked by ${from}`})
    return {
      updatedFields : {questions : newList},
      successMsg : `Question added\n${formatQuestions(newList)}`,
      errorMsg : 'Could not add question.'
    }
  });
}

const removeQuestion = async (chatId, repo, id) => { 
  return updateGroup(chatId, repo, group => {
      const newList = removeFromList(group.questions, parseInt(id, 10));
      return {
        updatedFields: {questions : newList}, 
        successMsg : `Question removed\n${formatQuestions(newList)}`,
        errorMsg : `Unable to remove question from list`
      }
  })
}

// TODO: just allow custom lists /add [CUSTOM LIST]
const addGift = async (chatId, repo, gift, from) => { 
  return updateGroup(chatId, repo, (group) => {
    const newList = addToList(group.gifts, {id : getNextId(group.gifts), gift : `${gift} - ${from}`})
    return {
      updatedFields : {gifts : newList},
      successMsg : `Gift added\n${formatGifts(newList)}`,
      errorMsg : 'Could not add gift.'
    }
  });
}

// TODO: just allow custom lists /remove [CUSTOM LIST] #
const removeGift = async (chatId, repo, id) => { 
  return updateGroup(chatId, repo, group => {
      const newList = removeFromList(group.gifts, parseInt(id, 10));
      return {
        updatedFields: {gifts : newList}, 
        successMsg : `Gift removed\n${formatGifts(newList)}`,
        errorMsg : `Unable to remove gift from list`
      }
  })
}

const addPrayer = async (chatId, repo, prayer, from) => { 
  const cleanPrayer = prayer.replace(/^\n+/, '');
  return updateGroup(chatId, repo, (group) => {
    const newList = addToList(group.prayers, {id : getNextId(group.prayers), request : `${cleanPrayer} - requested by ${from}`})
    return {
      updatedFields : {prayers : newList},
      successMsg : `Prayer added\n${formatPrayers(newList)}`,
      errorMsg : 'Could not add prayer.'
    }
  });
}

const removePrayer = async (chatId, repo, prayerId) => { 
  return updateGroup(chatId, repo, group => {
      const newList = removeFromList(group.prayers, parseInt(prayerId, 10));
      return {
        updatedFields: {prayers : newList}, 
        successMsg : `Prayer removed\n${formatPrayers(newList)}`,
        errorMsg : `Unable to remove prayer from list`
      }
  })
}

const formatFood = (food) => {
  return isEmptyArray(food) 
      ? 'No one has offered to bring food. Type /bringFood to offer to bring something. (Example: /bringFood Pizza)'
      : food.map(entry => `${entry.id} - ${entry.name} offered to bring ${entry.item}\n`).join('');
}

const getFood = async (chatId, repo) => { 
  return withGroup(chatId, repo, group => formatFood(group.food));
}

const bringFood = async (chatId, repo, food, from) => { 
  return updateGroup(chatId, repo, group => {
    const newList = addToList(group.food, {id : getNextId(group.food), item : food, name : from})
    return {
      updatedFields : {food : newList},
      successMsg : `Food added. \n${formatFood(newList)}`,
      errorMsg : `Unable to add food to list`
    }
  });
}

const removeFood = async (chatId, repo, foodId) => { 
  return updateGroup(chatId, repo, group => {
    const updatedFood = removeFromList(group.food, parseInt(foodId, 10))
    return {
      updatedFields : {food : updatedFood},
      successMsg : `Food removed.\n${formatFood(updatedFood)} `,
      errorMsg : `Unable to remove food from list`
    }
  });
}

const setMeeting = async (chatId, repo, meeting) => { 
  const splitCommand = meeting.split(" ");
  const weekDay = splitCommand[0];
  const time = splitCommand[1];
  const day = days.indexOf(weekDay);

  return setGroupFields(chatId, repo, {meeting : {day : day, time : time}}, 'Meeting set. Type /next to see the group meeting time, study and notes.');
}

const getNextMeeting = (meeting) => {
  if(!meeting) { return "No meeting time set, use /setmeeting to set. example: /setMeeting Monday 6 p.m."; }

  const { day, time } = meeting;
  const date = new Date();
  const resultDate = new Date(date.getTime());

  resultDate.setDate(date.getDate() + (7 + day - date.getDay()) % 7);

  return `Our next meeting is ${days[day]} ${resultDate.getMonth() + 1}-${resultDate.getDate()}-${resultDate.getFullYear()}, ${time}`;
}

const isEmptyArray = (list) => (!Array.isArray(list) || !list.length);

const updateGroup = async (chatId, repo, fn) => {
  return repo.getGroup(chatId).then(group => {
      const {updatedFields, successMsg, errorMsg} = fn(group);
      return repo.update({...updatedFields, chatId : chatId})
        .then(() => successMsg)
        .catch(() => Promise.reject(errorMsg));
    })
    .catch(error => Promise.reject(`Error working with group: ${chatId}: ${JSON.stringify(error)}`));
}

const withGroup = async (chatId, repo, fn) => {
  return repo.getGroup(chatId)
    .then(group => fn(group))
    .catch(error => Promise.reject(`Can not find group: ${chatId}: ${JSON.stringify(error)}`));
}

const setGroupFields = async (chatId, repo, fields, successMsg) => {
  return repo.update({chatId : chatId, ...fields})
    .then(() => successMsg)
    .catch(error => Promise.reject(`Error updating the group fields for this chatId: ${chatId}: ${JSON.stringify(error)}`));
}

const formatPrayers = (prayers) => {
  return isEmptyArray(prayers) 
    ?'There are currently no prayer reqeusts. Type /addPrayer followed by your request to add a prayer to the list.'
    : `*Current Prayer Requests*\n${prayers.map(prayer => `${prayer.id} - ${prayer.request}\n`).join('')}`;
}

const formatQuestions = (questions) => {
  return isEmptyArray(questions) 
    ?'There are currently no questions. Type /askquestion to create a questions.\nExample: /askquestion What is the Holy Spirit?'
    : `*Current Questions*\n${questions.map(question => `${question.id} - ${question.question}\n`).join('')}`;
}

const formatGifts = (gifts) => {
  return isEmptyArray(gifts) 
    ?'There are currently no gifts. Type /addgift to add a gifts.\nExample: /addgift tshirt'
    : `*Current Gifts*\n${gifts.map(gift => `${gift.id} - ${gift.gift}\n`).join('')}`;
}

const addToList = (list, value) => (list) ? [...list, value] : [value]

const removeFromList = (list, listId) => {
  return list
    .filter(item => item.id != listId)
    .map((item, index) => ({ ...item, id : index + 1 }));
}

const nextId = (list) => {
  const ids = list.map(x => x.id);
  return Math.max( ...ids ) + 1;
}

const sendMessage = async (chatId, repo, message, from) => message

const getNextId = (list) => isEmptyArray(list) ? 1 : nextId(list);

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const commands = [
  {command : '/about', fn : getHelp, description : 'describes this bot and the requests it accepts'},
  {command : '/help', fn : getHelp, description : 'describes this bot and the requests it accepts'},
  {command : '/next', fn : getNext, description : 'displays information about the next meeting'},
  {command : '/setstudy', fn : setStudy, description : 'sets the study topic', usage : '/setStudy Romans 13'},
  {command : '/setmeeting', fn : setMeeting, description : 'sets the meeting.', usage : '/setMeeting Monday 6:30 p.m.'},
  {command : '/clearstudy', fn : clearStudy, description : 'clear the study topic'},
  {command : '/setnotes', fn : setNotes, description : 'sets group notes', usage : '/setNotes Remember to bring $5 for your book'},
  {command : '/clearnotes', fn : clearNotes, description : 'clear the group notes'},
  {command : '/prayers', fn : getPrayers, description : 'displays current prayer requests'},
  {command : '/addprayer', fn : addPrayer, description : 'add a prayer to the prayer list', usage : '/addPrayer Matt is having back surgery'},
  {command : '/removeprayer', fn : removePrayer, description : 'removes a prayer from the prayer list', usage : '/removePrayer 3'},
  {command : '/clearprayers', fn : clearPrayers, description : 'removes all prayers from the prayer list'},
  {command : '/food', fn : getFood, description : 'displays list of food people have offered to bring'},
  {command : '/bringfood', fn : bringFood, description : 'offer to bring food to the next group meeting', usage : '/bringFood pizza'},
  {command : '/removefood', fn : removeFood, description : 'removes an item from the food list', usage : '/removeFood 3'},
  {command : '/clearfood', fn : clearFood, description : 'removes all items from the food list'},
  {command : '/create', fn : create, description : 'sets up a new group'},
  {command : '/questions', fn : getQuestions, description : 'displays current questions'},
  {command : '/addquestion', fn : addQuestion, description : 'add a question to be discussed', usage : '/addquestion What is the Holy Spirit?'},
  {command : '/askquestion', fn : addQuestion, description : 'add a question to be discussed', usage : '/askquestion What is the Holy Spirit?'},
  {command : '/removequestion', fn : removeQuestion, description : 'removes a question from list', usage : '/removequestion 3'},
  {command : '/clearquestions', fn : clearQuestions, description : 'removes all questions'},
  {command : '/gifts', fn : getGifts, description : 'displays current questions'},
  {command : '/addgift', fn : addGift, description : 'add a gift', usage : '/addgift jeans'},
  {command : '/buygift', fn : addGift, description : 'add a gift', usage : '/buygift jeans'},
  {command : '/bringgift', fn : addGift, description : 'add a gift', usage : '/bringgift jeans'},
  {command : '/removegift', fn : removeGift, description : 'removes a gift from list', usage : '/removegift 3'},
  {command : '/cleargifts', fn : clearGifts, description : 'removes all gifts'},
  {command : '/sendmessage', fn : sendMessage, description : 'sends a message to the specified channel', usage: '/sendMessage Send Wave Items', hide : true},
];

const getCommands = () => {
  return commands
    .filter(cmd => cmd.hide != true )
    .map(cmd => ` ${cmd.command} - ${cmd.description}\n${(cmd.usage) ? '    example: ' + cmd.usage + '\n' : ''}`)
    .join('');
}

const generalMessage = `I am a bot designed to help keep track of group meetings and activities.\n\nI support the following requests:\n${getCommands()}`;








