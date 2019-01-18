/**
 * Copyright (c) 2019 Federico Ghedina
 */

(function (root, factory) {
    'use strict';

    var Channeljs = {},
        define = root.define;

    root.Channeljs = Channeljs;

    factory(Channeljs);

    if (typeof exports === 'object') {
        if (module !== undefined && module.exports) {
            exports = module.exports = Channeljs; // Node.js specific `module.exports`
        }
        exports.Channeljs = Channeljs; // CommonJS  module
        module.exports = exports = Channeljs;

    } else if (typeof define === 'function' && define.amd) {
        define(function () { return Channeljs; }); // AMD
    }
}((typeof window === 'object' && window) || this, function (Channeljs) {
    'use strict';
    var channels = {},
        findInArray = (function () {
            return 'indexOf' in []
                ? function (arr, mvar) { return arr.indexOf(mvar); }
                : function (arr, mvar) {
                    var l = arr.length - 1;
                    while (l >= 0 && arr[l] !== mvar) l--;
                    return l;
                }
        })(),
        Channel = function () {
            this.topic2cbs = {};
            this.lateTopics = {};
            this.enabled = true;
        };

    /**
     * enable cb execution on publish
     * @return {undefined}
     */
    Channel.prototype.enable = function () {
        this.enabled = true;
    };

    /**
     * disable cb execution on publish
     * @return {undefined}
     */
    Channel.prototype.disable = function () {
        this.enabled = false;
    };

    /**
     * publish an event on that channel
     * @param  {String} topic
     *                  the topic that must be published
     * @param  {Array} args
     *                 array of arguments that will be passed
     *                 to every callback
     * @return {undefined}
     */
    Channel.prototype.pub = function (topic, args) {
        var i = 0,
            l,
            res = [];
        if (topic instanceof Array) {
            for (l = topic.length; i < l; i += 1) {
                topic[i] in this.topic2cbs
                && res.push(this.pub(topic[i], args));
            }
        } else {
            if (!(topic in this.topic2cbs) || !this.enabled) {
                //save it for late pub, at everysub to this topic
                if (topic in this.lateTopics) {
                    this.lateTopics[topic].push({ args: args });
                } else {
                    this.lateTopics[topic] = [{ args: args }];
                }
                return null;
            }
            for (l = this.topic2cbs[topic].length; i < l; i += 1) {
                res.push(this.topic2cbs[topic][i].apply(null, [topic].concat(args)));
            }
        }
        return res;
    };

    /**
     * add a callback to a topic
     * @param {String} topic
     *                 the topic that must be published
     * @param {Function} cb
     *                   the callback will receive as first
     *                   argument the topic, the others follow
     * @return {undefined}
     */
    Channel.prototype.sub = function (topic, cb, force) {
        var i = 0,
            l;
        if (topic instanceof Array) {
            for (l = topic.length; i < l; i += 1) {
                this.sub(topic[i], cb, force);
            }
        }
        if (!(topic in this.topic2cbs) || !this.enabled) {
            this.topic2cbs[topic] = [];
        }
        if (!force && findInArray(this.topic2cbs[topic], cb) >= 0) {
            return this;
        }

        this.topic2cbs[topic].push(cb);

        // check lateTopics
        // save it for late pub, at everysub to this topic
        //
        if (topic in this.lateTopics) {
            for (i = 0, l = this.lateTopics[topic].length; i < l; i++) {
                cb.apply(null, [topic].concat(this.lateTopics[topic][i].args));
            }
        }
    };

    /**
     * removes an existing booked callback from the topic list
     * @param  {[type]}   topic [description]
     * @param  {Function} cb    [description]
     * @return {[type]}         [description]
     */
    Channel.prototype.unsub = function (topic, cb) {
        var i = 0,
            l;
        if (topic instanceof Array) {
            for (l = topic.length; i < l; i += 1) {
                this.unsub(topic[i], cb);
            }
        }

        if (topic in this.topic2cbs) {
            i = findInArray(this.topic2cbs[topic], cb);
            if (i >= 0) {
                this.topic2cbs[topic].splice(i, 1);
                this.topic2cbs[topic].length === 0 && (delete this.topic2cbs[topic])
            }
        }
        if (topic in this.lateTopics) {
            i = findInArray(this.lateTopics[topic], cb);
            i >= 0 && this.lateTopics[topic].splice(i, 1);
            this.lateTopics[topic].length === 0 && (delete this.lateTopics[topic])
        }
        return this;
    };

    /**
     * one shot sub with auto unsub after first shot
     * @param  {[type]}   topic [description]
     * @param  {Function} cb    [description]
     * @return {[type]}         [description]
     */
    Channel.prototype.once = function (topic, cb) {
        var self = this;
        function cbTMP() {
            self.unsub(topic, cbTMP);
            return cb.apply(null, Array.prototype.slice.call(arguments, 0));
        };
        this.sub(topic, cbTMP);
    };

    /**
     * Removes all callbacks for one or more topic
     * @param [String] ...
     *                 the topic queues that must  be emptied
     * @return [Channel] the instance
     */
    Channel.prototype.reset = function () {
        var ts = Array.prototype.slice.call(arguments, 0),
            l = ts.length,
            i = 0;
        if (!l) {
            this.topic2cbs = {};
            this.lateTopics = {};
            return this;
        }
        for (null; i < l; i += 1) {
            ts[i] in this.topic2cbs && (delete this.topic2cbs[ts[i]]);
            ts[i] in this.lateTopics && (delete this.lateTopics[ts[i]]);
        }
        return this;
    };


    Channeljs.getChannels = function (enabledStatus) {
        var ret = {},
            i;
        
        if (typeof enabledStatus == 'boolean') {
            for (i in channels) {
                if (channels[i].enabled === enabledStatus) {
                    ret[i] = channels[i]
                }
            }
        } else {
            ret = channels;
        }
        return ret;
    };

    Channeljs.get = function (name) {
        if (!(name in channels)) {
            channels[name] = new Channel();
        }
        return channels[name];
    };
}));