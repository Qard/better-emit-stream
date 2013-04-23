var betterEmitStream = require('../')
	, events = require('events')
	, through = require('through')

describe('better-emit-stream', function () {
	it('should receive emitter', function (next) {
		var input = through()
			, output = new events.EventEmitter

		input.pipe(betterEmitStream.toReceiver(output))

		output.on('foo', function (msg) {
			msg.should.equal('bar')
			next()
		})
		input.write(['foo', 'bar'])
	})

	it('should receive stream', function (next) {
		var input = through()
			, output = through()

		input.pipe(output)

		betterEmitStream.toReceiver(output).on('foo', function (msg) {
			msg.should.equal('bar')
			next()
		})
		input.write(['foo', 'bar'])
	})


	it('should send emitter', function (next) {
		var input = new events.EventEmitter
			, output = through()

		betterEmitStream.toSender(input).pipe(output)

		output.on('data', function (msg) {
			msg.should.have.property(0, 'foo')
			msg.should.have.property(1, 'bar')
			next()
		})
		input.emit('foo', 'bar')
	})

	it('should send stream', function (next) {
		var input = through()
			, inputEv = betterEmitStream.toSender(input)
			, output = through()

		input.pipe(output)

		output.on('data', function (msg) {
			msg.should.have.property(0, 'foo')
			msg.should.have.property(1, 'bar')
			next()
		})
		inputEv.emit('foo', 'bar')
	})
})