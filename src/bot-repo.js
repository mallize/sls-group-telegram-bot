'use strict';
import AWS from 'aws-sdk';
import {DynamoDBUpdateObject} from './dynamodb-util';

const dynamoDb = new AWS.DynamoDB.DocumentClient()

export const getGroup = async (chatId) => {
    const params = {
        TableName: process.env.GROUP_TABLE,
        Key: {
            chatId : chatId
        }
    };

    return dynamoDb.get(params).promise()
        .then((result) => result.Item)
        .catch(error => Promise.reject({error: `${error}`})); 
}

export const update = async (group) => {
    const updatedGroup = DynamoDBUpdateObject(group);

    const params = {
        TableName: process.env.GROUP_TABLE,
        ...updatedGroup,
        ReturnValues: 'ALL_NEW',
    };

    return dynamoDb.update(params).promise()
        .then(result => result.Attributes)
        .catch(error => Promise.reject({error: `${error}`})); 
};

export const create = async (group) => {
    const params = {
        TableName: process.env.GROUP_TABLE,
        Item: {...group}
    };

    return dynamoDb.put(params).promise()
        .then(() => params.Item)
        .catch(error => Promise.reject({error: `${error}`}));
};

export const remove = async (chatId) => {
    const params = {
        TableName: process.env.GROUP_TABLE,
        Key: {
            id: chatId
        }
    };

    return dynamoDb.delete(params).promise()
        .then(() => params.Items )
        .catch(error => Promise.reject({error: `${error}`}));
};


