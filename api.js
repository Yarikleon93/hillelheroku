// import * as http from 'http';
import { Collection } from './collection.js';

const collection = new Collection('homeworks');

/**
 * @param {http.IncomingMessage} req
 * @retruns {string}
 */
export const readBody = (req) => {
  return new Promise((resolve, reject) => {

    let body = '';
    req.on('data', data => {
      body = body + data.toString('utf8');
    });

    req.on('end', async () => {
      resolve(body);
    });

    req.on('error', error => reject(error));
  });
};

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
export async function apiRequestHandler(req, res) {

  const send = (status, data) => {
    const headers = {
      'content-type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    };

    res.writeHead(status, headers);
    if (data) {
      const body = JSON.stringify(data);
      res.write(body);
    }
    res.end();
  };

  const [, , entityType, id] = req.url.split('/');

  if (entityType !== 'homeworks') {
    send(404);
    return;
  }

  if (!id) {
    if (req.method === 'GET') {
      const homeworks = await collection.list();
      send(200, homeworks);
      return;
    }

    if (req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const newItem = await collection.insertOne(body);
      send(200, newItem);
      return;
    }
  }

  if (id) {
    switch (req.method) {
    case 'OPTIONS' :
      send(200, 'OK');
      return;
    case 'GET': {
      const item = await collection.findOne({ id });
      if (item) {
        send(200, item);
      } else {
        send(404, 'NOT FOUND');
      }
      return;
    }
    case 'PUT': {
      try {
        const updateData = JSON.parse(await readBody(req));
        const updatedItem = await collection.updateOne(id, updateData);
        send(200, updatedItem);
      } catch (e) {
        send(400);
      }
      return;
    }
    case 'DELETE':
      await collection.deleteOne(id);
      send(200, 'OK');
      return;
    }
  }





  send(400);
}
