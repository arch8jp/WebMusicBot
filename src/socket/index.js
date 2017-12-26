import Vue from 'vue'
import VueSocketio from 'vue-socket.io';
import * as io from 'socket.io-client';

/* global $, io */

const socket = io.connect()

const id = this.$route.id;
socket.emit('init', id)

Vue.use(VueSocketio, socket);
