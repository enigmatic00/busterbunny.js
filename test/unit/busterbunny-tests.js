describe("busterbunny.js", function() {
    var mockery = require('mockery');
    var assert = require('assert');
    var fakeConfig = {
        cluster: {
            host: 'host.host.it',
            port: 5672,
            vhost: '/',
            login: 'someguy',
            password: '2insecure',
            heartbeat: 10
        },
        queues: [
            {
                name: 'i.read.from.this1'
            },
            {
                name: 'i.read.from.this2'
            }
        ],
        exchange: 'i.write.2.this1'
    };

    var BusterBunny = require('../../src/busterbunny.js');

    before(function() {
        mockery.enable({ useCleanCache: true });
    });

    afterEach(function() {
        mockery.deregisterAll();
    });

    it('should attempt reconnect on failure', function(done) {
        var AmqpMock = require('./mock-amqp.js');
        var amqpMock = new AmqpMock();

        mockery.registerMock('amqplib/callback_api', amqpMock);

        var BusterBunny = require('../../src/busterbunny.js');

        var bb = new BusterBunny(fakeConfig);

        bb.on('reconnecting', function() {
            assert.ok(true);
            done();
        });

        amqpMock.causeConnectionError();
    });

    it('should raiseEvents on open connection', function(done) {
        var AmqpMock = require('./mock-amqp.js');
        var amqpMock = new AmqpMock();

        amqpMock.connection.createChannel = function(cb) {
            var channel = {
                publish: function () {
                    assert.ok(true);
                    done();
                }
            };

            cb(null, channel);
        };

        mockery.registerMock('amqplib/callback_api', amqpMock);

        var BusterBunny = require('../../src/busterbunny.js');
        var bb = new BusterBunny(fakeConfig);

        bb.raiseEvents('eventId', {}, {}, function() {});
    });

    it('should raiseEvents on open connection with no options and no callback', function(done) {
        var AmqpMock = require('./mock-amqp.js');
        var amqpMock = new AmqpMock();

        amqpMock.connection.createChannel = function(cb) {
            var channel = {
                publish: function () {
                    assert.ok(true);
                    done();
                }
            };

            cb(null, channel);
        };

        mockery.registerMock('amqplib/callback_api', amqpMock);

        var BusterBunny = require('../../src/busterbunny.js');
        var bb = new BusterBunny(fakeConfig);

        bb.raiseEvents('eventId', {});
    });

    it('should call after raised when calling raiseEvents on open connection with options and callback', function(done) {
        var AmqpMock = require('./mock-amqp.js');
        var amqpMock = new AmqpMock();

        amqpMock.connection.createChannel = function(cb) {
            var channel = {
                publish: function () {
                }
            };

            cb(null, channel);
        };

        mockery.registerMock('amqplib/callback_api', amqpMock);

        var BusterBunny = require('../../src/busterbunny.js');
        var bb = new BusterBunny(fakeConfig);

        bb.raiseEvents('eventId', {}, {}, function(err) {
            if (err)
                assert.fail(true, err);
            else
                assert.ok(true);

            done();
        });
    });

    it('should callback with failure after publish error thrown by amqplib', function(done) {
        var AmqpMock = require('./mock-amqp.js');
        var amqpMock = new AmqpMock();

        amqpMock.connection.createChannel = function(cb) {
            var channel = {
                publish: function () {
                    throw new Error('EVIL!!!!');
                }
            };

            cb(null, channel);
        };

        mockery.registerMock('amqplib/callback_api', amqpMock);

        var BusterBunny = require('../../src/busterbunny.js');
        var bb = new BusterBunny(fakeConfig);

        bb.raiseEvents('eventId', {}, {}, function(err) {
            if (err)
                assert.ok(true, err);
            else
                assert.fail(true);

            done();
        });
    });

    it('should receive event when received event triggered', function(done) {
        var AmqpMock = require('./mock-amqp.js');
        var amqpMock = new AmqpMock();

        mockery.registerMock('amqplib/callback_api', amqpMock);

        var BusterBunny = require('../../src/busterbunny.js');
        var bb = new BusterBunny(fakeConfig);

        bb.subscribe(function (event, message) {
            assert.ok(true);
            done();
        });

        bb.emit('event-received', {}, {});
    });
});