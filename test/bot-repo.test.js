'use strict';
const AWS = require('aws-sdk');

const group = require('./resources/group.json');

module.exports.getGroup = (chatId) => {
    return new Promise((resolve, reject) => {
        resolve(group);
    });
}

module.exports.update = (group) => {
    return new Promise((resolve, reject) => {
        resolve("");
    });
}

module.exports.create = (group) => {
    console.log("in test repo create");
    return new Promise((resolve, reject) => {
        resolve("");
    });
}