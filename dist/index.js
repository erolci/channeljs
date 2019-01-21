/*
   ________                           __    _______
  / ____/ /_  ____ _____  ____  ___  / /   / / ___/
 / /   / __ \/ __ `/ __ \/ __ \/ _ \/ /_  / /\__ \
/ /___/ / / / /_/ / / / / / / /  __/ / /_/ /___/ /
\____/_/ /_/\__,_/_/ /_/_/ /_/\___/_/\____//____/

Date: 21/1/2019
Size: ~2KB
Author: Federico Ghedina <federico.ghedina@gmail.com>
*/
var Channeljs=function(){"use strict";var t={},i=function(t,i){return t.indexOf(i)},s=function(){this.topic2cbs={},this.lateTopics={},this.enabled=!0},e=function(t,i){var s=t.enabled;return t.enabled=i,s!==t.enabled},n=s.prototype;return n.enable=function(){return e(this,!0)},n.disable=function(){return e(this,!1)},n.pub=function(t,i){var s,e=0,n=[];if(t instanceof Array)for(s=t.length;e<s;e+=1)t[e]in this.topic2cbs&&n.push(this.pub(t[e],i));else{if(!(t in this.topic2cbs&&this.enabled))return t in this.lateTopics?this.lateTopics[t].push({args:i}):this.lateTopics[t]=[{args:i}],null;for(s=this.topic2cbs[t].length;e<s;e+=1)n.push(this.topic2cbs[t][e].apply(null,i))}return n},n.sub=function(t,i,s){var e,n=0,c=[];if(t instanceof Array)for(e=t.length;n<e;n+=1)this.sub(t[n],i,s);if(t in this.topic2cbs&&this.enabled||(this.topic2cbs[t]=[]),this.topic2cbs[t].push(i),s&&t in this.lateTopics){for(n=0,e=this.lateTopics[t].length;n<e;n++)c.push(i.apply(null,this.lateTopics[t][n].args));return c}},n.unsub=function(t,s){var e,n=0;if(t instanceof Array&&s instanceof Array)for(e=t.length;n<e;n+=1)this.unsub(t[n],s[n]);return t in this.topic2cbs&&(n=i(this.topic2cbs[t],s))>=0&&this.topic2cbs[t].splice(n,1)&&0===this.topic2cbs[t].length&&delete this.topic2cbs[t],t in this.lateTopics&&delete this.lateTopics[t],this},n.once=function(t,i){function s(){return e.unsub(t,s),i.apply(null,Array.prototype.slice.call(arguments,0))}var e=this;this.sub(t,s)},n.reset=function(){var t=Array.prototype.slice.call(arguments,0),i=t.length,s=0;if(!i)return this.topic2cbs={},this.lateTopics={},this;for(null;s<i;s+=1)t[s]in this.topic2cbs&&delete this.topic2cbs[t[s]],t[s]in this.lateTopics&&delete this.lateTopics[t[s]];return this},{getChannels:function(i){var s,e={};if("boolean"==typeof i)for(s in t)t[s].enabled===i&&(e[s]=t[s]);else e=t;return e},get:function(i){return i in t||(t[i]=new s),t[i]}}}();"object"==typeof exports&&(module.exports=Channeljs);