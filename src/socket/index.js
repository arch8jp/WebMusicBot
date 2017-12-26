import Vue from 'vue'
import VueSocketio from 'vue-socket.io';
import * as io from 'socket.io-client';

/* global $, io */

const socket = io.connect()

let guild
let channel = location.href.match(/\d{18}/)

if (!Array.isArray(channel)) channel = ['null']

console.log('socket', 'emit', 'init', channel[0])
socket.emit('init', channel[0])

Vue.use(VueSocketio, socket);
